import { DatabaseConstants } from '../constants/database_constants';
import { DatabaseHelper } from '../database/database_helper';
import { generateUUID } from '../utils/uuid';

export interface SimpleAuditStatistics {
  totalAssets: number;
  auditedAssets: number;
  pendingAssets: number;
  completionRate: number;
}

export interface SimpleAuditResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class SimpleAuditService {
  private databaseHelper: DatabaseHelper;

  constructor() {
    this.databaseHelper = DatabaseHelper.getInstance();
  }

  /**
   * Get simple audit statistics
   */
  async getAuditStatistics(): Promise<SimpleAuditResult> {
    try {
      // Get total assets
      const totalAssetsResult = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.assetTable}`
      );

      // Get all audit findings
      const auditFindingsResult = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable}`
      );

      if (!totalAssetsResult.success || !auditFindingsResult.success) {
        return { success: false, error: 'Failed to fetch audit data' };
      }

      const totalAssets = totalAssetsResult.data?.[0]?.count || 0;
      const auditFindings = auditFindingsResult.data || [];

      // Count unique audited assets (by asset_id)
      const auditedAssetIds = new Set();
      auditFindings.forEach((audit: any) => {
        if (audit.asset_id && audit.asset_id !== null && audit.asset_id !== undefined) {
          auditedAssetIds.add(audit.asset_id);
        }
      });

      const auditedAssets = auditedAssetIds.size;
      const pendingAssets = Math.max(0, totalAssets - auditedAssets);
      const completionRate = totalAssets > 0 ? (auditedAssets / totalAssets) * 100 : 0;

      console.log('Simple Audit Statistics:', {
        totalAssets,
        auditedAssets,
        pendingAssets,
        completionRate: Math.round(completionRate * 100) / 100,
        auditFindingsCount: auditFindings.length,
        uniqueAuditedAssetIds: Array.from(auditedAssetIds)
      });

      const statistics: SimpleAuditStatistics = {
        totalAssets,
        auditedAssets,
        pendingAssets,
        completionRate: Math.round(completionRate * 100) / 100
      };

      return { success: true, data: statistics };
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Check if an asset is already audited
   */
  async isAssetAudited(assetId: string): Promise<SimpleAuditResult> {
    try {
      console.log('Checking if asset is audited:', assetId);
      
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.auditFindingTable} WHERE asset_id = ?`,
        [assetId]
      );

      console.log('Audit check result:', result);

      if (!result.success) {
        console.error('Failed to check audit status:', result.error);
        return { success: false, error: 'Failed to check audit status' };
      }

      const count = result.data?.[0]?.count || 0;
      console.log('Asset audit count:', count, 'Is audited:', count > 0);
      
      return { success: true, data: { isAudited: count > 0, auditCount: count } };
    } catch (error) {
      console.error('Error checking if asset is audited:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create a simple audit for one asset
   */
  async createAudit(assetId: string, assetCode: string, location: string, notes: string = ''): Promise<SimpleAuditResult> {
    try {
      // Check if asset is already audited
      const auditCheck = await this.isAssetAudited(assetId);
      if (auditCheck.success && auditCheck.data?.isAudited) {
        return { success: false, error: `Asset ${assetCode} has already been audited` };
      }

      // Create audit finding
      const auditData = {
        offline_record_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        audit_session_id: generateUUID(), // Generate new UUID for session
        asset_id: assetId,
        audited_by: 'Current User',
        audited_date: new Date().toISOString(),
        audit_location: location,
        asset_found: true,
        physical_asset_code: assetCode,
        physical_tag_number: '', // Add missing field
        physical_serial_number: '', // Add missing field
        physical_condition: 'GOOD',
        actual_location_description: location,
        actual_custodian_name: '', // Add missing field
        recommended_condition: 'GOOD', // Add missing field
        has_discrepancies: false,
        discrepancy_types: '',
        auditor_notes: notes,
        recommended_actions: '',
        sync_status: 'PENDING',
        record_version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into database
      const result = await this.databaseHelper.execute(
        `INSERT INTO ${DatabaseConstants.auditFindingTable} (
          offline_record_id, audit_session_id, asset_id, audited_by, 
          audited_date, audit_location, asset_found, physical_asset_code,
          physical_tag_number, physical_serial_number, physical_condition, 
          actual_location_description, actual_custodian_name, recommended_condition,
          has_discrepancies, discrepancy_types, auditor_notes, recommended_actions, 
          sync_status, record_version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditData.offline_record_id,
          auditData.audit_session_id,
          auditData.asset_id,
          auditData.audited_by,
          auditData.audited_date,
          auditData.audit_location,
          auditData.asset_found ? 1 : 0,
          auditData.physical_asset_code,
          auditData.physical_tag_number,
          auditData.physical_serial_number,
          auditData.physical_condition,
          auditData.actual_location_description,
          auditData.actual_custodian_name,
          auditData.recommended_condition,
          auditData.has_discrepancies ? 1 : 0,
          auditData.discrepancy_types,
          auditData.auditor_notes,
          auditData.recommended_actions,
          auditData.sync_status,
          auditData.record_version,
          auditData.created_at,
          auditData.updated_at,
        ]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to save audit' };
      }

      console.log('Simple audit created successfully:', {
        assetId,
        assetCode,
        auditData
      });

      return { success: true, data: auditData };
    } catch (error) {
      console.error('Error creating audit:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Clear all audit findings
   */
  async clearAllAudits(): Promise<SimpleAuditResult> {
    try {
      const result = await this.databaseHelper.execute(
        `DELETE FROM ${DatabaseConstants.auditFindingTable}`
      );

      if (!result.success) {
        return { success: false, error: 'Failed to clear audits' };
      }

      console.log('All audits cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('Error clearing audits:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all audit findings for debugging
   */
  async getAllAuditFindings(): Promise<SimpleAuditResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable}`
      );

      if (!result.success) {
        return { success: false, error: 'Failed to fetch audit findings' };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error('Error getting audit findings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Debug method to check what's in the audit findings table
   */
  async debugAuditTable(): Promise<SimpleAuditResult> {
    try {
      console.log('Debugging audit table...');
      
      // Get all audit findings
      const allFindings = await this.getAllAuditFindings();
      console.log('All audit findings:', allFindings);
      
      // Get table structure info
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable} LIMIT 5`
      );
      
      console.log('Audit table sample data:', result);
      
      return { success: true, data: { allFindings, sampleData: result } };
    } catch (error) {
      console.error('Error debugging audit table:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
