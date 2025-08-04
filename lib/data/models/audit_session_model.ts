import { AuditStatus } from '../../core/constants/database_constants';

export interface AuditSessionModel {
  id?: number;
  session_id: number;
  session_code: string;
  audit_name: string;
  audit_type: string;
  audit_status?: AuditStatus;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  require_photos?: boolean;
  allow_status_updates?: boolean;
  allow_location_updates?: boolean;
  allow_condition_updates?: boolean;
  allow_notes_updates?: boolean;
  assigned_team_id?: number;
  team_name?: string;
  total_assets_assigned?: number;
  assets_audited?: number;
  last_sync_date?: string;
  created_at?: string;
  updated_at?: string;
}

export class AuditSession implements AuditSessionModel {
  id?: number;
  session_id: number;
  session_code: string;
  audit_name: string;
  audit_type: string;
  audit_status: AuditStatus;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  require_photos: boolean;
  allow_status_updates: boolean;
  allow_location_updates: boolean;
  allow_condition_updates: boolean;
  allow_notes_updates: boolean;
  assigned_team_id?: number;
  team_name?: string;
  total_assets_assigned: number;
  assets_audited: number;
  last_sync_date?: string;
  created_at?: string;
  updated_at?: string;

  constructor(data: AuditSessionModel) {
    this.id = data.id;
    this.session_id = data.session_id;
    this.session_code = data.session_code;
    this.audit_name = data.audit_name;
    this.audit_type = data.audit_type;
    this.audit_status = data.audit_status || AuditStatus.PLANNED;
    this.planned_start_date = data.planned_start_date;
    this.planned_end_date = data.planned_end_date;
    this.actual_start_date = data.actual_start_date;
    this.actual_end_date = data.actual_end_date;
    this.require_photos = data.require_photos || false;
    this.allow_status_updates = data.allow_status_updates !== false;
    this.allow_location_updates = data.allow_location_updates !== false;
    this.allow_condition_updates = data.allow_condition_updates !== false;
    this.allow_notes_updates = data.allow_notes_updates !== false;
    this.assigned_team_id = data.assigned_team_id;
    this.team_name = data.team_name;
    this.total_assets_assigned = data.total_assets_assigned || 0;
    this.assets_audited = data.assets_audited || 0;
    this.last_sync_date = data.last_sync_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromJson(json: any): AuditSession {
    return new AuditSession({
      id: json.id,
      session_id: json.session_id,
      session_code: json.session_code,
      audit_name: json.audit_name,
      audit_type: json.audit_type,
      audit_status: json.audit_status,
      planned_start_date: json.planned_start_date,
      planned_end_date: json.planned_end_date,
      actual_start_date: json.actual_start_date,
      actual_end_date: json.actual_end_date,
      require_photos: Boolean(json.require_photos),
      allow_status_updates: Boolean(json.allow_status_updates),
      allow_location_updates: Boolean(json.allow_location_updates),
      allow_condition_updates: Boolean(json.allow_condition_updates),
      allow_notes_updates: Boolean(json.allow_notes_updates),
      assigned_team_id: json.assigned_team_id,
      team_name: json.team_name,
      total_assets_assigned: json.total_assets_assigned,
      assets_audited: json.assets_audited,
      last_sync_date: json.last_sync_date,
      created_at: json.created_at,
      updated_at: json.updated_at,
    });
  }

  toJson(): AuditSessionModel {
    return {
      id: this.id,
      session_id: this.session_id,
      session_code: this.session_code,
      audit_name: this.audit_name,
      audit_type: this.audit_type,
      audit_status: this.audit_status,
      planned_start_date: this.planned_start_date,
      planned_end_date: this.planned_end_date,
      actual_start_date: this.actual_start_date,
      actual_end_date: this.actual_end_date,
      require_photos: this.require_photos,
      allow_status_updates: this.allow_status_updates,
      allow_location_updates: this.allow_location_updates,
      allow_condition_updates: this.allow_condition_updates,
      allow_notes_updates: this.allow_notes_updates,
      assigned_team_id: this.assigned_team_id,
      team_name: this.team_name,
      total_assets_assigned: this.total_assets_assigned,
      assets_audited: this.assets_audited,
      last_sync_date: this.last_sync_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  copyWith(updates: Partial<AuditSessionModel>): AuditSession {
    return new AuditSession({
      ...this.toJson(),
      ...updates,
    });
  }

  get completionPercentage(): number {
    if (this.total_assets_assigned === 0) return 0.0;
    return (this.assets_audited / this.total_assets_assigned) * 100;
  }

  get remainingAssets(): number {
    return this.total_assets_assigned - this.assets_audited;
  }

  get isCompleted(): boolean {
    return this.audit_status === AuditStatus.COMPLETED;
  }

  get isInProgress(): boolean {
    return this.audit_status === AuditStatus.IN_PROGRESS;
  }

  get isPlanned(): boolean {
    return this.audit_status === AuditStatus.PLANNED;
  }

  get isCancelled(): boolean {
    return this.audit_status === AuditStatus.CANCELLED;
  }

  get canStart(): boolean {
    return this.isPlanned && this.total_assets_assigned > 0;
  }

  get canComplete(): boolean {
    return this.isInProgress && this.assets_audited >= this.total_assets_assigned;
  }

  get progressText(): string {
    return `${this.assets_audited} of ${this.total_assets_assigned} assets audited`;
  }

  get statusColor(): string {
    switch (this.audit_status) {
      case AuditStatus.PLANNED:
        return '#6B7280'; // gray
      case AuditStatus.IN_PROGRESS:
        return '#3B82F6'; // blue
      case AuditStatus.COMPLETED:
        return '#10B981'; // green
      case AuditStatus.CANCELLED:
        return '#EF4444'; // red
      default:
        return '#6B7280';
    }
  }

  get statusText(): string {
    switch (this.audit_status) {
      case AuditStatus.PLANNED:
        return 'Planned';
      case AuditStatus.IN_PROGRESS:
        return 'In Progress';
      case AuditStatus.COMPLETED:
        return 'Completed';
      case AuditStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  startAudit(): AuditSession {
    return this.copyWith({
      audit_status: AuditStatus.IN_PROGRESS,
      actual_start_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  completeAudit(): AuditSession {
    return this.copyWith({
      audit_status: AuditStatus.COMPLETED,
      actual_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  cancelAudit(): AuditSession {
    return this.copyWith({
      audit_status: AuditStatus.CANCELLED,
      actual_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  incrementAuditedAssets(): AuditSession {
    return this.copyWith({
      assets_audited: this.assets_audited + 1,
      updated_at: new Date().toISOString(),
    });
  }

  updateLastSyncDate(): AuditSession {
    return this.copyWith({
      last_sync_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
} 