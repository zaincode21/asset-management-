import { DiscrepancyType, SyncStatus } from '../../core/constants/database_constants';

export interface AuditFindingModel {
  id?: number;
  offline_record_id: string;
  audit_session_id: number;
  asset_id?: number;
  audited_by: string;
  audited_date: string;
  audit_location?: string;
  asset_found: boolean;
  physical_asset_code?: string;
  physical_barcode?: string;
  physical_tag_number?: string;
  physical_serial_number?: string;
  physical_condition?: string;
  actual_location_id?: number;
  actual_location_description?: string;
  actual_custodian_name?: string;
  recommended_status_id?: number;
  recommended_condition?: string;
  has_discrepancies?: boolean;
  discrepancy_types?: string;
  auditor_notes?: string;
  recommended_actions?: string;
  photo_file_names?: string;
  document_file_names?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  device_id?: string;
  sync_status?: SyncStatus;
  sync_date?: string;
  sync_errors?: string;
  data_hash?: string;
  record_version?: number;
  created_at?: string;
  updated_at?: string;
}

export class AuditFinding implements AuditFindingModel {
  id?: number;
  offline_record_id: string;
  audit_session_id: number;
  asset_id?: number;
  audited_by: string;
  audited_date: string;
  audit_location?: string;
  asset_found: boolean;
  physical_asset_code?: string;
  physical_barcode?: string;
  physical_tag_number?: string;
  physical_serial_number?: string;
  physical_condition?: string;
  actual_location_id?: number;
  actual_location_description?: string;
  actual_custodian_name?: string;
  recommended_status_id?: number;
  recommended_condition?: string;
  has_discrepancies: boolean;
  discrepancy_types?: string;
  auditor_notes?: string;
  recommended_actions?: string;
  photo_file_names?: string;
  document_file_names?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  device_id?: string;
  sync_status: SyncStatus;
  sync_date?: string;
  sync_errors?: string;
  data_hash?: string;
  record_version: number;
  created_at?: string;
  updated_at?: string;

  constructor(data: AuditFindingModel) {
    this.id = data.id;
    this.offline_record_id = data.offline_record_id;
    this.audit_session_id = data.audit_session_id;
    this.asset_id = data.asset_id;
    this.audited_by = data.audited_by;
    this.audited_date = data.audited_date;
    this.audit_location = data.audit_location;
    this.asset_found = data.asset_found;
    this.physical_asset_code = data.physical_asset_code;
    this.physical_barcode = data.physical_barcode;
    this.physical_tag_number = data.physical_tag_number;
    this.physical_serial_number = data.physical_serial_number;
    this.physical_condition = data.physical_condition;
    this.actual_location_id = data.actual_location_id;
    this.actual_location_description = data.actual_location_description;
    this.actual_custodian_name = data.actual_custodian_name;
    this.recommended_status_id = data.recommended_status_id;
    this.recommended_condition = data.recommended_condition;
    this.has_discrepancies = data.has_discrepancies || false;
    this.discrepancy_types = data.discrepancy_types;
    this.auditor_notes = data.auditor_notes;
    this.recommended_actions = data.recommended_actions;
    this.photo_file_names = data.photo_file_names;
    this.document_file_names = data.document_file_names;
    this.gps_latitude = data.gps_latitude;
    this.gps_longitude = data.gps_longitude;
    this.device_id = data.device_id;
    this.sync_status = data.sync_status || SyncStatus.PENDING;
    this.sync_date = data.sync_date;
    this.sync_errors = data.sync_errors;
    this.data_hash = data.data_hash;
    this.record_version = data.record_version || 1;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromJson(json: any): AuditFinding {
    return new AuditFinding({
      id: json.id,
      offline_record_id: json.offline_record_id,
      audit_session_id: json.audit_session_id,
      asset_id: json.asset_id,
      audited_by: json.audited_by,
      audited_date: json.audited_date,
      audit_location: json.audit_location,
      asset_found: Boolean(json.asset_found),
      physical_asset_code: json.physical_asset_code,
      physical_barcode: json.physical_barcode,
      physical_tag_number: json.physical_tag_number,
      physical_serial_number: json.physical_serial_number,
      physical_condition: json.physical_condition,
      actual_location_id: json.actual_location_id,
      actual_location_description: json.actual_location_description,
      actual_custodian_name: json.actual_custodian_name,
      recommended_status_id: json.recommended_status_id,
      recommended_condition: json.recommended_condition,
      has_discrepancies: Boolean(json.has_discrepancies),
      discrepancy_types: json.discrepancy_types,
      auditor_notes: json.auditor_notes,
      recommended_actions: json.recommended_actions,
      photo_file_names: json.photo_file_names,
      document_file_names: json.document_file_names,
      gps_latitude: json.gps_latitude,
      gps_longitude: json.gps_longitude,
      device_id: json.device_id,
      sync_status: json.sync_status,
      sync_date: json.sync_date,
      sync_errors: json.sync_errors,
      data_hash: json.data_hash,
      record_version: json.record_version,
      created_at: json.created_at,
      updated_at: json.updated_at,
    });
  }

  toJson(): AuditFindingModel {
    return {
      id: this.id,
      offline_record_id: this.offline_record_id,
      audit_session_id: this.audit_session_id,
      asset_id: this.asset_id,
      audited_by: this.audited_by,
      audited_date: this.audited_date,
      audit_location: this.audit_location,
      asset_found: this.asset_found,
      physical_asset_code: this.physical_asset_code,
      physical_barcode: this.physical_barcode,
      physical_tag_number: this.physical_tag_number,
      physical_serial_number: this.physical_serial_number,
      physical_condition: this.physical_condition,
      actual_location_id: this.actual_location_id,
      actual_location_description: this.actual_location_description,
      actual_custodian_name: this.actual_custodian_name,
      recommended_status_id: this.recommended_status_id,
      recommended_condition: this.recommended_condition,
      has_discrepancies: this.has_discrepancies,
      discrepancy_types: this.discrepancy_types,
      auditor_notes: this.auditor_notes,
      recommended_actions: this.recommended_actions,
      photo_file_names: this.photo_file_names,
      document_file_names: this.document_file_names,
      gps_latitude: this.gps_latitude,
      gps_longitude: this.gps_longitude,
      device_id: this.device_id,
      sync_status: this.sync_status,
      sync_date: this.sync_date,
      sync_errors: this.sync_errors,
      data_hash: this.data_hash,
      record_version: this.record_version,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  copyWith(updates: Partial<AuditFindingModel>): AuditFinding {
    return new AuditFinding({
      ...this.toJson(),
      ...updates,
    });
  }

  get photoFileList(): string[] {
    if (!this.photo_file_names || this.photo_file_names.length === 0) return [];
    return this.photo_file_names.split(',').filter(name => name.trim().length > 0);
  }

  get discrepancyTypesList(): DiscrepancyType[] {
    if (!this.discrepancy_types || this.discrepancy_types.length === 0) return [];
    return this.discrepancy_types.split(',').filter(type => type.trim().length > 0) as DiscrepancyType[];
  }

  get hasPhotos(): boolean {
    return this.photoFileList.length > 0;
  }

  get hasLocationData(): boolean {
    return this.gps_latitude !== undefined && this.gps_longitude !== undefined;
  }

  get isSynced(): boolean {
    return this.sync_status === SyncStatus.SYNCED;
  }

  get hasSyncErrors(): boolean {
    return this.sync_status === SyncStatus.ERROR || (this.sync_errors && this.sync_errors.length > 0);
  }

  addPhotoFile(filePath: string): AuditFinding {
    const currentPhotos = this.photoFileList;
    currentPhotos.push(filePath);
    return this.copyWith({
      photo_file_names: currentPhotos.join(','),
      updated_at: new Date().toISOString(),
    });
  }

  removePhotoFile(filePath: string): AuditFinding {
    const currentPhotos = this.photoFileList.filter(photo => photo !== filePath);
    return this.copyWith({
      photo_file_names: currentPhotos.join(','),
      updated_at: new Date().toISOString(),
    });
  }

  addDiscrepancyType(discrepancyType: DiscrepancyType): AuditFinding {
    const currentTypes = this.discrepancyTypesList;
    if (!currentTypes.includes(discrepancyType)) {
      currentTypes.push(discrepancyType);
    }
    return this.copyWith({
      discrepancy_types: currentTypes.join(','),
      has_discrepancies: true,
      updated_at: new Date().toISOString(),
    });
  }

  removeDiscrepancyType(discrepancyType: DiscrepancyType): AuditFinding {
    const currentTypes = this.discrepancyTypesList.filter(type => type !== discrepancyType);
    return this.copyWith({
      discrepancy_types: currentTypes.join(','),
      has_discrepancies: currentTypes.length > 0,
      updated_at: new Date().toISOString(),
    });
  }
} 