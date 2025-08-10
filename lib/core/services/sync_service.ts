// Mock NetInfo for now - replace with actual NetInfo implementation when needed
const NetInfo = {
  fetch: async () => ({ isConnected: true })
};
import { AuditFinding } from '../../data/models/audit_finding_model';
import { DatabaseConstants, SyncStatus } from '../constants/database_constants';
import { DatabaseHelper } from '../database/database_helper';
import { ApiClient } from '../network/api_client';
import { EncryptionService } from './encryption_service';

export enum SyncServiceStatus {
  IDLE = 'IDLE',
  SYNCING = 'SYNCING',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}

export interface SyncResult {
  syncedRecords: number;
  conflictRecords: number;
  errorRecords: number;
  summary: string;
  errors: string[];
}

export class SyncService {
  private databaseHelper: DatabaseHelper;
  private apiClient: ApiClient;
  private encryptionService: EncryptionService;
  private syncStatus: SyncServiceStatus = SyncServiceStatus.IDLE;
  private autoSyncTimer?: number;
  private statusListeners: ((status: SyncServiceStatus) => void)[] = [];

  constructor(
    databaseHelper: DatabaseHelper,
    apiClient: ApiClient,
    encryptionService: EncryptionService
  ) {
    this.databaseHelper = databaseHelper;
    this.apiClient = apiClient;
    this.encryptionService = encryptionService;
  }

  addStatusListener(listener: (status: SyncServiceStatus) => void): void {
    this.statusListeners.push(listener);
  }

  removeStatusListener(listener: (status: SyncServiceStatus) => void): void {
    const index = this.statusListeners.indexOf(listener);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  private notifyStatusChange(status: SyncServiceStatus): void {
    this.syncStatus = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  get currentStatus(): SyncServiceStatus {
    return this.syncStatus;
  }

  startAutoSync(intervalMinutes: number = 5): void {
    this.stopAutoSync();
    this.autoSyncTimer = setInterval(async () => {
      if (await this.isConnected() && this.syncStatus === SyncServiceStatus.IDLE) {
        await this.syncPendingData();
      }
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = undefined;
    }
  }

  private async isConnected(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo !== null && netInfo.isConnected === true;
    } catch (error) {
      console.warn('Error checking connectivity:', error);
      return false;
    }
  }

  async downloadAuditPackage(auditSessionId: number, teamId?: number): Promise<SyncResult> {
    try {
      this.notifyStatusChange(SyncServiceStatus.SYNCING);
      console.log('Downloading audit package for session:', auditSessionId);

      // Clear existing audit data
      await this.clearExistingAuditData();

      // Download audit session configuration
      const response = await this.apiClient.get(
        `/audit-sessions/${auditSessionId}/offline-package${teamId ? `?teamId=${teamId}` : ''}`
      );

      if (response.status === 200) {
        const packageData = response.data;
        
        // Save audit session
        await this.saveAuditSession(packageData.auditSession);
        
        // Save assets to audit
        await this.saveAssetsToAudit(packageData.assetsToAudit);
        
        // Save lookup data
        await this.saveLookupData(packageData.lookupData);

        this.notifyStatusChange(SyncServiceStatus.COMPLETED);
        
        const assetCount = packageData.assetsToAudit?.length || 0;
        return {
          syncedRecords: assetCount,
          conflictRecords: 0,
          errorRecords: 0,
          summary: `Downloaded ${assetCount} assets for audit`,
          errors: [],
        };
      } else {
        throw new Error(`Failed to download audit package: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error downloading audit package:', error);
      this.notifyStatusChange(SyncServiceStatus.ERROR);
      return {
        syncedRecords: 0,
        conflictRecords: 0,
        errorRecords: 1,
        summary: 'Failed to download audit package',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async syncPendingData(): Promise<SyncResult> {
    if (this.syncStatus === SyncServiceStatus.SYNCING) {
      console.warn('Sync already in progress');
      return {
        syncedRecords: 0,
        conflictRecords: 0,
        errorRecords: 0,
        summary: 'Sync already in progress',
        errors: [],
      };
    }

    try {
      this.notifyStatusChange(SyncServiceStatus.SYNCING);
      // No network check needed for local-only sync

      // Get pending audit findings
      const pendingFindingsResult = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable} WHERE sync_status = ? ORDER BY created_at ASC`,
        [SyncStatus.PENDING]
      );
      if (!pendingFindingsResult.success) {
        throw new Error('Failed to query pending findings');
      }
      const pendingFindings = pendingFindingsResult.data || [];
      let syncedRecords = 0;
      let errorRecords = 0;
      const errors: string[] = [];

      for (const findingData of pendingFindings) {
        try {
          await this.databaseHelper.execute(
            `UPDATE ${DatabaseConstants.auditFindingTable} 
             SET sync_status = ?, sync_date = ?, updated_at = ? 
             WHERE offline_record_id = ?`,
            [SyncStatus.SYNCED, new Date().toISOString(), new Date().toISOString(), findingData.offline_record_id]
          );
          syncedRecords++;
        } catch (error) {
          errors.push(`Finding ${findingData.offline_record_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorRecords++;
        }
      }

      this.notifyStatusChange(SyncServiceStatus.COMPLETED);
      return {
        syncedRecords,
        conflictRecords: 0,
        errorRecords,
        summary: `Locally synced ${syncedRecords} records, ${errorRecords} errors`,
        errors,
      };
    } catch (error) {
      this.notifyStatusChange(SyncServiceStatus.ERROR);
      return {
        syncedRecords: 0,
        conflictRecords: 0,
        errorRecords: 1,
        summary: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private async syncSingleFinding(finding: AuditFinding): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    message: string;
  }> {
    try {
      // Upload photos first if any
      if (finding.hasPhotos) {
        await this.uploadPhotos(finding.photoFileList, finding.offline_record_id);
      }

      // Sync audit finding
      const response = await this.apiClient.post('/audit-findings/sync', {
        audit_session_id: finding.audit_session_id,
        offline_record_id: finding.offline_record_id,
        asset_id: finding.asset_id,
        audited_by: finding.audited_by,
        audited_date: finding.audited_date,
        asset_found: finding.asset_found,
        physical_condition: finding.physical_condition,
        actual_location_id: finding.actual_location_id,
        actual_location_description: finding.actual_location_description,
        auditor_notes: finding.auditor_notes,
        has_discrepancies: finding.has_discrepancies,
        discrepancy_types: finding.discrepancy_types,
        gps_latitude: finding.gps_latitude,
        gps_longitude: finding.gps_longitude,
        data_hash: finding.data_hash,
      });

      if (response.status === 200) {
        return { success: true, message: 'Synced successfully' };
      } else if (response.status === 409) {
        // Conflict detected
        return {
          success: false,
          conflict: true,
          conflictData: response.data,
          message: 'Conflict detected during sync',
        };
      } else {
        return {
          success: false,
          message: `Server error: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async uploadPhotos(photoFiles: string[], recordId: string): Promise<void> {
    for (const photoFile of photoFiles) {
      try {
        // Implementation would depend on your file upload mechanism
        // This is a placeholder for the actual file upload logic
        console.log('Uploading photo:', photoFile, 'for record:', recordId);
      } catch (error) {
        console.warn('Failed to upload photo:', photoFile, error);
      }
    }
  }

  private async handleSyncConflict(finding: AuditFinding, conflictData: any): Promise<void> {
    // Save conflict record for user resolution
    await this.databaseHelper.execute(
      `INSERT INTO ${DatabaseConstants.conflictTable} 
       (audit_session_id, asset_id, audit_finding_id, conflict_type, conflict_description, 
        system_value, audit_value, field_name, resolution_status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finding.audit_session_id,
        finding.asset_id,
        finding.id,
        conflictData.type,
        conflictData.description,
        conflictData.system_value,
        conflictData.audit_value,
        conflictData.field_name,
        'PENDING',
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
  }

  private async syncNewDiscoveries(): Promise<void> {
    const pendingDiscoveriesResult = await this.databaseHelper.query(
      `SELECT * FROM ${DatabaseConstants.newDiscoveryTable} WHERE sync_status = ?`,
      [SyncStatus.PENDING]
    );

    if (!pendingDiscoveriesResult.success) return;

    const pendingDiscoveries = pendingDiscoveriesResult.data || [];

    for (const discovery of pendingDiscoveries) {
      try {
        const response = await this.apiClient.post('/new-discoveries/sync', discovery);
        
        if (response.status === 200) {
          await this.databaseHelper.execute(
            `UPDATE ${DatabaseConstants.newDiscoveryTable} 
             SET sync_status = ?, sync_date = ? 
             WHERE id = ?`,
            [SyncStatus.SYNCED, new Date().toISOString(), discovery.id]
          );
        }
      } catch (error) {
        console.warn('Failed to sync discovery:', discovery.id, error);
      }
    }
  }

  private async clearExistingAuditData(): Promise<void> {
    await this.databaseHelper.transaction(async () => {
      await this.databaseHelper.execute(`DELETE FROM ${DatabaseConstants.assetTable}`);
      await this.databaseHelper.execute(`DELETE FROM ${DatabaseConstants.auditSessionTable}`);
    });
  }

  private async saveAuditSession(sessionData: any): Promise<void> {
    await this.databaseHelper.execute(
      `INSERT INTO ${DatabaseConstants.auditSessionTable} 
       (session_id, session_code, audit_name, audit_type, audit_status, planned_start_date, 
        planned_end_date, require_photos, allow_status_updates, allow_location_updates, 
        allow_condition_updates, allow_notes_updates, assigned_team_id, team_name, 
        total_assets_assigned, assets_audited, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionData.session_id,
        sessionData.session_code,
        sessionData.audit_name,
        sessionData.audit_type,
        sessionData.audit_status,
        sessionData.planned_start_date,
        sessionData.planned_end_date,
        sessionData.require_photos ? 1 : 0,
        sessionData.allow_status_updates ? 1 : 0,
        sessionData.allow_location_updates ? 1 : 0,
        sessionData.allow_condition_updates ? 1 : 0,
        sessionData.allow_notes_updates ? 1 : 0,
        sessionData.assigned_team_id,
        sessionData.team_name,
        sessionData.total_assets_assigned,
        sessionData.assets_audited,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
  }

  private async saveAssetsToAudit(assetsData: any[]): Promise<void> {
    await this.databaseHelper.transaction(async () => {
      for (const assetData of assetsData) {
        await this.databaseHelper.execute(
          `INSERT INTO ${DatabaseConstants.assetTable} 
           (audit_session_id, asset_id, asset_code, barcode, tag_number, description, 
            category_name, sub_category_name, brand, model, serial_number, 
            current_location_id, current_location_name, expected_location_id, expected_location_name,
            current_department_name, current_custodian_name, current_custodian_email,
            current_status_name, current_condition, asset_cost, net_book_value, purchase_date,
            assigned_team_id, audit_priority, data_version, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            assetData.audit_session_id,
            assetData.asset_id,
            assetData.asset_code,
            assetData.barcode,
            assetData.tag_number,
            assetData.description,
            assetData.category_name,
            assetData.sub_category_name,
            assetData.brand,
            assetData.model,
            assetData.serial_number,
            assetData.current_location_id,
            assetData.current_location_name,
            assetData.expected_location_id,
            assetData.expected_location_name,
            assetData.current_department_name,
            assetData.current_custodian_name,
            assetData.current_custodian_email,
            assetData.current_status_name,
            assetData.current_condition,
            assetData.asset_cost,
            assetData.net_book_value,
            assetData.purchase_date,
            assetData.assigned_team_id,
            assetData.audit_priority,
            assetData.data_version,
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }
    });
  }

  private async saveLookupData(lookupData: any): Promise<void> {
    // Save locations, categories, status options, etc.
    // This would typically go into separate lookup tables
    // For simplicity, storing in shared preferences or separate tables
    console.log('Saving lookup data:', lookupData);
  }

  dispose(): void {
    this.stopAutoSync();
    this.statusListeners = [];
  }
} 