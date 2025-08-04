import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseConstants } from '../../core/constants/database_constants';

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class DatabaseHelper {
  private static instance: DatabaseHelper;
  private isInitialized = false;
  private storagePrefix = 'asset_management_';

  private constructor() {}

  static getInstance(): DatabaseHelper {
    if (!DatabaseHelper.instance) {
      DatabaseHelper.instance = new DatabaseHelper();
    }
    return DatabaseHelper.instance;
  }

  async initialize(): Promise<DatabaseResult> {
    if (this.isInitialized) {
      return { success: true };
    }

    try {
      // Initialize storage with default data if needed
      await this.ensureDefaultData();
      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('Database initialization error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

      private async ensureDefaultData(): Promise<void> {
        // Check if database is already initialized
        const initialized = await AsyncStorage.getItem(`${this.storagePrefix}initialized`);
        if (initialized) return;

        // Sample asset data for testing
        const sampleAssets = [
            {
                id: 1,
                audit_session_id: 1,
                asset_id: 1001,
                asset_code: 'LAPTOP-001',
                barcode: '123456789012',
                tag_number: 'TAG-001',
                description: 'Dell Latitude 5520 Laptop',
                category_name: 'Computers',
                sub_category_name: 'Laptops',
                brand: 'Dell',
                model: 'Latitude 5520',
                serial_number: 'SN123456789',
                current_location_id: 1,
                current_location_name: 'IT Department',
                expected_location_id: 1,
                expected_location_name: 'IT Department',
                current_department_name: 'Information Technology',
                current_custodian_name: 'John Smith',
                current_custodian_email: 'john.smith@company.com',
                current_status_name: 'Active',
                current_condition: 'Good',
                asset_cost: 1200.00,
                net_book_value: 800.00,
                purchase_date: '2023-01-15',
                assigned_team_id: 1,
                audit_priority: 'NORMAL',
                data_version: 1,
                last_sync_date: '2024-01-15T10:30:00Z',
                created_at: '2023-01-15T10:00:00Z',
                updated_at: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                audit_session_id: 1,
                asset_id: 1002,
                asset_code: 'MONITOR-001',
                barcode: '987654321098',
                tag_number: 'TAG-002',
                description: 'HP 24-inch Monitor',
                category_name: 'Computers',
                sub_category_name: 'Monitors',
                brand: 'HP',
                model: '24-inch LED',
                serial_number: 'SN987654321',
                current_location_id: 2,
                current_location_name: 'Marketing Department',
                expected_location_id: 2,
                expected_location_name: 'Marketing Department',
                current_department_name: 'Marketing',
                current_custodian_name: 'Jane Doe',
                current_custodian_email: 'jane.doe@company.com',
                current_status_name: 'Active',
                current_condition: 'Excellent',
                asset_cost: 300.00,
                net_book_value: 250.00,
                purchase_date: '2023-03-20',
                assigned_team_id: 1,
                audit_priority: 'NORMAL',
                data_version: 1,
                last_sync_date: '2024-01-15T10:30:00Z',
                created_at: '2023-03-20T10:00:00Z',
                updated_at: '2024-01-15T10:30:00Z'
            },
            {
                id: 3,
                audit_session_id: 1,
                asset_id: 1003,
                asset_code: 'PRINTER-001',
                barcode: '456789123456',
                tag_number: 'TAG-003',
                description: 'Canon Laser Printer',
                category_name: 'Office Equipment',
                sub_category_name: 'Printers',
                brand: 'Canon',
                model: 'LaserJet Pro',
                serial_number: 'SN456789123',
                current_location_id: 3,
                current_location_name: 'Finance Department',
                expected_location_id: 3,
                expected_location_name: 'Finance Department',
                current_department_name: 'Finance',
                current_custodian_name: 'Mike Johnson',
                current_custodian_email: 'mike.johnson@company.com',
                current_status_name: 'Active',
                current_condition: 'Fair',
                asset_cost: 500.00,
                net_book_value: 300.00,
                purchase_date: '2022-11-10',
                assigned_team_id: 1,
                audit_priority: 'HIGH',
                data_version: 1,
                last_sync_date: '2024-01-15T10:30:00Z',
                created_at: '2022-11-10T10:00:00Z',
                updated_at: '2024-01-15T10:30:00Z'
            }
        ];

        // Initialize with sample data
        await AsyncStorage.multiSet([
            [`${this.storagePrefix}${DatabaseConstants.assetTable}`, JSON.stringify(sampleAssets)],
            [`${this.storagePrefix}${DatabaseConstants.auditFindingTable}`, JSON.stringify([])],
            [`${this.storagePrefix}${DatabaseConstants.syncQueueTable}`, JSON.stringify([])],
            [`${this.storagePrefix}${DatabaseConstants.conflictTable}`, JSON.stringify([])],
            [`${this.storagePrefix}${DatabaseConstants.newDiscoveryTable}`, JSON.stringify([])],
            [`${this.storagePrefix}${DatabaseConstants.auditSessionTable}`, JSON.stringify([])],
            [`${this.storagePrefix}initialized`, 'true'],
        ]);
    }

  async query(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (!this.isInitialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      // Parse SQL to determine which table to query
      const tableName = this.extractTableName(sql);
      if (!tableName) {
        return { success: false, error: 'Could not determine table name from SQL' };
      }

      const data = await this.getTableData(tableName);
      
      // Simple filtering based on WHERE clause
      let filteredData = data;
      if (sql.toLowerCase().includes('where')) {
        filteredData = this.applyWhereClause(data, sql, params);
      }

      // Simple ordering
      if (sql.toLowerCase().includes('order by')) {
        filteredData = this.applyOrderBy(filteredData, sql);
      }

      // Simple limiting
      if (sql.toLowerCase().includes('limit')) {
        const limit = this.extractLimit(sql);
        if (limit) {
          filteredData = filteredData.slice(0, limit);
        }
      }

      // Handle COUNT queries
      if (sql.toLowerCase().includes('count(*)')) {
        return { success: true, data: [{ count: filteredData.length }] };
      }

      return { success: true, data: filteredData };
    } catch (error) {
      console.error('Query error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async execute(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (!this.isInitialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const tableName = this.extractTableName(sql);
      if (!tableName) {
        return { success: false, error: 'Could not determine table name from SQL' };
      }

      if (sql.toLowerCase().includes('insert into')) {
        return await this.handleInsert(tableName, sql, params);
      } else if (sql.toLowerCase().includes('update')) {
        return await this.handleUpdate(tableName, sql, params);
      } else if (sql.toLowerCase().includes('delete from')) {
        return await this.handleDelete(tableName, sql, params);
      }

      return { success: true };
    } catch (error) {
      console.error('Execute error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async transaction(operations: () => Promise<void>): Promise<DatabaseResult> {
    try {
      await operations();
      return { success: true };
    } catch (error) {
      console.error('Transaction error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async clearAllData(): Promise<DatabaseResult> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const assetKeys = keys.filter(key => key.startsWith(this.storagePrefix));
      await AsyncStorage.multiRemove(assetKeys);
      await this.ensureDefaultData();
      return { success: true };
    } catch (error) {
      console.error('Clear data error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async close(): Promise<void> {
    // AsyncStorage doesn't need explicit closing
    this.isInitialized = false;
  }

  // Helper methods
  private async getTableData(tableName: string): Promise<any[]> {
    const data = await AsyncStorage.getItem(`${this.storagePrefix}${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private async setTableData(tableName: string, data: any[]): Promise<void> {
    await AsyncStorage.setItem(`${this.storagePrefix}${tableName}`, JSON.stringify(data));
  }

  private extractTableName(sql: string): string | null {
    const insertMatch = sql.match(/insert into (\w+)/i);
    if (insertMatch) return insertMatch[1];

    const updateMatch = sql.match(/update (\w+)/i);
    if (updateMatch) return updateMatch[1];

    const deleteMatch = sql.match(/delete from (\w+)/i);
    if (deleteMatch) return deleteMatch[1];

    const selectMatch = sql.match(/from (\w+)/i);
    if (selectMatch) return selectMatch[1];

    return null;
  }

  private applyWhereClause(data: any[], sql: string, params: any[]): any[] {
    // Simple WHERE clause implementation
    if (sql.toLowerCase().includes('sync_status = ?')) {
      const status = params[0];
      return data.filter(item => item.sync_status === status);
    }
    if (sql.toLowerCase().includes('asset_found = ?')) {
      const found = params[0];
      return data.filter(item => item.asset_found === found);
    }
    if (sql.toLowerCase().includes('audit_status = ?')) {
      const status = params[0];
      return data.filter(item => item.audit_status === status);
    }
    return data;
  }

  private applyOrderBy(data: any[], sql: string): any[] {
    if (sql.toLowerCase().includes('order by created_at desc')) {
      return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (sql.toLowerCase().includes('order by audit_priority desc')) {
      return data.sort((a, b) => {
        const priorityOrder: Record<string, number> = { 'CRITICAL': 4, 'HIGH': 3, 'NORMAL': 2, 'LOW': 1 };
        return (priorityOrder[b.audit_priority as string] || 0) - (priorityOrder[a.audit_priority as string] || 0);
      });
    }
    return data;
  }

  private extractLimit(sql: string): number | null {
    const limitMatch = sql.match(/limit (\d+)/i);
    return limitMatch ? parseInt(limitMatch[1]) : null;
  }

  private async handleInsert(tableName: string, sql: string, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(tableName);
    const newRecord = this.paramsToRecord(params, tableName);
    newRecord.id = Date.now(); // Simple ID generation
    newRecord.created_at = new Date().toISOString();
    newRecord.updated_at = new Date().toISOString();
    
    data.push(newRecord);
    await this.setTableData(tableName, data);
    return { success: true, data: newRecord };
  }

  private async handleUpdate(tableName: string, sql: string, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(tableName);
    
    if (sql.toLowerCase().includes('where offline_record_id = ?')) {
      const recordId = params[params.length - 1];
      const recordIndex = data.findIndex(item => item.offline_record_id === recordId);
      if (recordIndex !== -1) {
        data[recordIndex] = { ...data[recordIndex], ...this.paramsToRecord(params.slice(0, -1), tableName) };
        data[recordIndex].updated_at = new Date().toISOString();
        await this.setTableData(tableName, data);
      }
    } else if (sql.toLowerCase().includes('where id = ?')) {
      const recordId = params[params.length - 1];
      const recordIndex = data.findIndex(item => item.id === recordId);
      if (recordIndex !== -1) {
        data[recordIndex] = { ...data[recordIndex], ...this.paramsToRecord(params.slice(0, -1), tableName) };
        data[recordIndex].updated_at = new Date().toISOString();
        await this.setTableData(tableName, data);
      }
    }
    
    return { success: true };
  }

  private async handleDelete(tableName: string, sql: string, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(tableName);
    
    if (sql.toLowerCase().includes('where id = ?')) {
      const recordId = params[0];
      const filteredData = data.filter(item => item.id !== recordId);
      await this.setTableData(tableName, filteredData);
    }
    
    return { success: true };
  }

  private paramsToRecord(params: any[], tableName: string): any {
    // This is a simplified implementation
    // In a real app, you'd parse the SQL more carefully
    const record: any = {};
    
    // Map common fields based on table name
    if (tableName === DatabaseConstants.assetTable) {
      record.audit_session_id = params[0];
      record.asset_id = params[1];
      record.asset_code = params[2];
      record.description = params[3];
      // Add more fields as needed
    } else if (tableName === DatabaseConstants.auditFindingTable) {
      record.offline_record_id = params[0];
      record.audit_session_id = params[1];
      record.audited_by = params[2];
      record.audited_date = params[3];
      record.asset_found = params[4];
      // Add more fields as needed
    } else if (tableName === DatabaseConstants.auditSessionTable) {
      record.session_id = params[0];
      record.session_code = params[1];
      record.audit_name = params[2];
      record.audit_type = params[3];
      // Add more fields as needed
    }
    
    return record;
  }
} 