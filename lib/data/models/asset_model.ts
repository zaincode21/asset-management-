import { AuditPriority } from '../../core/constants/database_constants';

export interface AssetModel {
  id?: number;
  audit_session_id: number;
  asset_id: number;
  asset_code: string;
  barcode?: string;
  tag_number?: string;
  description: string;
  category_name?: string;
  sub_category_name?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  current_location_id?: number;
  current_location_name?: string;
  expected_location_id?: number;
  expected_location_name?: string;
  current_department_name?: string;
  current_custodian_name?: string;
  current_custodian_email?: string;
  current_status_name?: string;
  current_condition?: string;
  asset_cost?: number;
  net_book_value?: number;
  purchase_date?: string;
  assigned_team_id?: number;
  audit_priority?: AuditPriority;
  data_version?: number;
  last_sync_date?: string;
  created_at?: string;
  updated_at?: string;
}

export class Asset implements AssetModel {
  id?: number;
  audit_session_id: number;
  asset_id: number;
  asset_code: string;
  barcode?: string;
  tag_number?: string;
  description: string;
  category_name?: string;
  sub_category_name?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  current_location_id?: number;
  current_location_name?: string;
  expected_location_id?: number;
  expected_location_name?: string;
  current_department_name?: string;
  current_custodian_name?: string;
  current_custodian_email?: string;
  current_status_name?: string;
  current_condition?: string;
  asset_cost?: number;
  net_book_value?: number;
  purchase_date?: string;
  assigned_team_id?: number;
  audit_priority: AuditPriority;
  data_version: number;
  last_sync_date?: string;
  created_at?: string;
  updated_at?: string;

  constructor(data: AssetModel) {
    this.id = data.id;
    this.audit_session_id = data.audit_session_id;
    this.asset_id = data.asset_id;
    this.asset_code = data.asset_code;
    this.barcode = data.barcode;
    this.tag_number = data.tag_number;
    this.description = data.description;
    this.category_name = data.category_name;
    this.sub_category_name = data.sub_category_name;
    this.brand = data.brand;
    this.model = data.model;
    this.serial_number = data.serial_number;
    this.current_location_id = data.current_location_id;
    this.current_location_name = data.current_location_name;
    this.expected_location_id = data.expected_location_id;
    this.expected_location_name = data.expected_location_name;
    this.current_department_name = data.current_department_name;
    this.current_custodian_name = data.current_custodian_name;
    this.current_custodian_email = data.current_custodian_email;
    this.current_status_name = data.current_status_name;
    this.current_condition = data.current_condition;
    this.asset_cost = data.asset_cost;
    this.net_book_value = data.net_book_value;
    this.purchase_date = data.purchase_date;
    this.assigned_team_id = data.assigned_team_id;
    this.audit_priority = data.audit_priority || AuditPriority.NORMAL;
    this.data_version = data.data_version || 1;
    this.last_sync_date = data.last_sync_date;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromJson(json: any): Asset {
    return new Asset({
      id: json.id,
      audit_session_id: json.audit_session_id,
      asset_id: json.asset_id,
      asset_code: json.asset_code,
      barcode: json.barcode,
      tag_number: json.tag_number,
      description: json.description,
      category_name: json.category_name,
      sub_category_name: json.sub_category_name,
      brand: json.brand,
      model: json.model,
      serial_number: json.serial_number,
      current_location_id: json.current_location_id,
      current_location_name: json.current_location_name,
      expected_location_id: json.expected_location_id,
      expected_location_name: json.expected_location_name,
      current_department_name: json.current_department_name,
      current_custodian_name: json.current_custodian_name,
      current_custodian_email: json.current_custodian_email,
      current_status_name: json.current_status_name,
      current_condition: json.current_condition,
      asset_cost: json.asset_cost,
      net_book_value: json.net_book_value,
      purchase_date: json.purchase_date,
      assigned_team_id: json.assigned_team_id,
      audit_priority: json.audit_priority,
      data_version: json.data_version,
      last_sync_date: json.last_sync_date,
      created_at: json.created_at,
      updated_at: json.updated_at,
    });
  }

  toJson(): AssetModel {
    return {
      id: this.id,
      audit_session_id: this.audit_session_id,
      asset_id: this.asset_id,
      asset_code: this.asset_code,
      barcode: this.barcode,
      tag_number: this.tag_number,
      description: this.description,
      category_name: this.category_name,
      sub_category_name: this.sub_category_name,
      brand: this.brand,
      model: this.model,
      serial_number: this.serial_number,
      current_location_id: this.current_location_id,
      current_location_name: this.current_location_name,
      expected_location_id: this.expected_location_id,
      expected_location_name: this.expected_location_name,
      current_department_name: this.current_department_name,
      current_custodian_name: this.current_custodian_name,
      current_custodian_email: this.current_custodian_email,
      current_status_name: this.current_status_name,
      current_condition: this.current_condition,
      asset_cost: this.asset_cost,
      net_book_value: this.net_book_value,
      purchase_date: this.purchase_date,
      assigned_team_id: this.assigned_team_id,
      audit_priority: this.audit_priority,
      data_version: this.data_version,
      last_sync_date: this.last_sync_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  copyWith(updates: Partial<AssetModel>): Asset {
    return new Asset({
      ...this.toJson(),
      ...updates,
    });
  }

  get displayName(): string {
    return `${this.asset_code} - ${this.description}`;
  }

  get hasLocationMismatch(): boolean {
    return this.current_location_id !== this.expected_location_id;
  }

  get isHighPriority(): boolean {
    return this.audit_priority === AuditPriority.HIGH || this.audit_priority === AuditPriority.CRITICAL;
  }
} 