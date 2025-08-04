export class DatabaseConstants {
  static readonly dbName = 'offline_audit.db';
  static readonly dbVersion = 1;
  
  // Table names
  static readonly assetTable = 'assets';
  static readonly auditFindingTable = 'audit_findings';
  static readonly syncQueueTable = 'sync_queue';
  static readonly conflictTable = 'conflicts';
  static readonly newDiscoveryTable = 'new_discoveries';
  static readonly auditSessionTable = 'audit_sessions';
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
  ERROR = 'ERROR'
}

export enum AuditStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AuditPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
  UNUSABLE = 'UNUSABLE'
}

export enum DiscrepancyType {
  LOCATION_MISMATCH = 'LOCATION_MISMATCH',
  CONDITION_CHANGE = 'CONDITION_CHANGE',
  CUSTODIAN_CHANGE = 'CUSTODIAN_CHANGE',
  ASSET_NOT_FOUND = 'ASSET_NOT_FOUND',
  UNEXPECTED_ASSET = 'UNEXPECTED_ASSET',
  SERIAL_NUMBER_MISMATCH = 'SERIAL_NUMBER_MISMATCH',
  BARCODE_MISMATCH = 'BARCODE_MISMATCH'
} 