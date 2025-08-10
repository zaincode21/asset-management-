import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseConstants } from '../../core/constants/database_constants';
import { generateUUID } from '../utils/uuid';

export interface DatabaseResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ParsedSQL {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'COUNT';
  tableName: string;
  fields?: string[];
  whereConditions?: Array<{
    field: string;
    operator: string;
    value: any;
    paramIndex: number;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;
  limit?: number | null;
  values?: string[];
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

    // Generate 100 comprehensive mock assets with proper UUIDs
        const generateAssets = () => {
            const assets = [];
            const departments = [
        { id: generateUUID(), name: 'Information Technology', location: 'IT Department - Room 101', custodian: 'John Smith', email: 'john.smith@company.com' },
        { id: generateUUID(), name: 'Marketing', location: 'Marketing Department - Room 205', custodian: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
        { id: generateUUID(), name: 'Design', location: 'Design Department - Room 301', custodian: 'Emily Chen', email: 'emily.chen@company.com' },
        { id: generateUUID(), name: 'Finance', location: 'Finance Department - Room 401', custodian: 'Mike Johnson', email: 'mike.johnson@company.com' },
        { id: generateUUID(), name: 'Human Resources', location: 'HR Department - Room 501', custodian: 'Lisa Brown', email: 'lisa.brown@company.com' },
        { id: generateUUID(), name: 'Executive', location: 'CEO Office - Room 601', custodian: 'David Wilson', email: 'david.wilson@company.com' },
        { id: generateUUID(), name: 'Sales', location: 'Sales Department - Room 701', custodian: 'Alex Rodriguez', email: 'alex.rodriguez@company.com' },
        { id: generateUUID(), name: 'Operations', location: 'Operations Department - Room 801', custodian: 'Maria Garcia', email: 'maria.garcia@company.com' },
        { id: generateUUID(), name: 'Legal', location: 'Legal Department - Room 901', custodian: 'James Thompson', email: 'james.thompson@company.com' },
        { id: generateUUID(), name: 'Facilities', location: 'Facilities Department - Room 1001', custodian: 'Tom Davis', email: 'tom.davis@company.com' }
            ];

            const assetTypes = [
                // Laptops
                { category: 'IT Equipment', subCategory: 'Laptops', prefix: 'LAPTOP', brands: ['Dell', 'HP', 'Apple', 'Lenovo'], models: ['Latitude 5520', 'EliteBook 840 G8', 'MacBook Pro 14-inch M2', 'ThinkPad X1 Carbon'], costRange: [800, 2500] },
                // Monitors
                { category: 'IT Equipment', subCategory: 'Monitors', prefix: 'MONITOR', brands: ['Dell', 'HP', 'Samsung', 'LG'], models: ['UltraSharp 27 4K', '24-inch LED', '32-inch Curved', '27-inch IPS'], costRange: [200, 800] },
                // Printers
                { category: 'Office Equipment', subCategory: 'Printers', prefix: 'PRINTER', brands: ['HP', 'Canon', 'Epson', 'Brother'], models: ['LaserJet Pro M404n', 'Color LaserJet Pro M479fdw', 'WorkForce Pro WF-3720', 'HL-L2350DW'], costRange: [300, 1200] },
                // Desks
                { category: 'Furniture', subCategory: 'Desks', prefix: 'DESK', brands: ['IKEA', 'Steelcase', 'Herman Miller', 'Haworth'], models: ['BEKANT Standing Desk', 'Think Desk', 'Aeron Desk', 'Zody Desk'], costRange: [400, 1500] },
                // Chairs
                { category: 'Furniture', subCategory: 'Chairs', prefix: 'CHAIR', brands: ['Herman Miller', 'Steelcase', 'Haworth', 'IKEA'], models: ['Aeron Chair', 'Leap Chair', 'Zody Chair', 'MARKUS Chair'], costRange: [300, 1200] },
                // Network Equipment
                { category: 'Network Equipment', subCategory: 'Switches', prefix: 'SWITCH', brands: ['Cisco', 'HP', 'Juniper', 'Dell'], models: ['Catalyst 2960', 'ProCurve 2920', 'EX2200', 'PowerConnect 5524'], costRange: [1500, 5000] },
                // Mobile Devices
                { category: 'Mobile Devices', subCategory: 'Smartphones', prefix: 'PHONE', brands: ['Apple', 'Samsung', 'Google', 'OnePlus'], models: ['iPhone 14 Pro', 'Galaxy S23', 'Pixel 7', 'OnePlus 11'], costRange: [600, 1200] },
                // Tablets
                { category: 'Mobile Devices', subCategory: 'Tablets', prefix: 'TABLET', brands: ['Apple', 'Samsung', 'Microsoft', 'Lenovo'], models: ['iPad Pro 12.9-inch', 'Galaxy Tab S9', 'Surface Pro 9', 'Yoga Tab 13'], costRange: [500, 1500] },
                // Projectors
                { category: 'Audio/Video Equipment', subCategory: 'Projectors', prefix: 'PROJECTOR', brands: ['Epson', 'BenQ', 'Optoma', 'ViewSonic'], models: ['PowerLite 1785W', 'TH685P', 'HD146X', 'PG800HD'], costRange: [400, 2000] },
                // Servers
                { category: 'IT Equipment', subCategory: 'Servers', prefix: 'SERVER', brands: ['Dell', 'HP', 'IBM', 'Cisco'], models: ['PowerEdge R740', 'ProLiant DL380', 'System x3650', 'UCS C220'], costRange: [3000, 15000] }
            ];

      const auditSessionId = generateUUID();
      const teamId = generateUUID();

            for (let i = 0; i < 100; i++) {
                const assetType = assetTypes[i % assetTypes.length];
                const department = departments[i % departments.length];
                const brand = assetType.brands[i % assetType.brands.length];
                const model = assetType.models[i % assetType.models.length];
                const assetNumber = Math.floor(i / assetTypes.length) + 1;
                
                const assetCode = `${assetType.prefix}-${String(assetNumber).padStart(3, '0')}`;
                const barcode = String(100000000000 + i).padStart(12, '0');
                const tagNumber = `TAG-${String(i + 1).padStart(3, '0')}`;
                const serialNumber = `SN${String(100000000 + i).padStart(9, '0')}`;
                
                const cost = Math.floor(Math.random() * (assetType.costRange[1] - assetType.costRange[0]) + assetType.costRange[0]);
        
        const asset = {
          id: generateUUID(),
          audit_session_id: auditSessionId,
          asset_id: generateUUID(),
                    asset_code: assetCode,
                    barcode: barcode,
                    tag_number: tagNumber,
          description: `${brand} ${model} - ${assetType.subCategory}`,
                    category_name: assetType.category,
                    sub_category_name: assetType.subCategory,
                    brand: brand,
                    model: model,
                    serial_number: serialNumber,
          current_location_id: department.id,
                    current_location_name: department.location,
          expected_location_id: department.id,
                    expected_location_name: department.location,
                    current_department_name: department.name,
                    current_custodian_name: department.custodian,
                    current_custodian_email: department.email,
                    current_status_name: 'Active',
          current_condition: 'Good',
                    asset_cost: cost,
          net_book_value: Math.floor(cost * 0.8),
          purchase_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_team_id: teamId,
          audit_priority: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
                    data_version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        assets.push(asset);
            }

            return assets;
        };

    // Generate mock audit sessions
    const generateAuditSessions = () => {
      return [
        {
          id: generateUUID(),
          session_id: generateUUID(),
          session_code: 'AUDIT-2024-001',
          audit_name: 'Annual Asset Inventory 2024',
          audit_type: 'Full Inventory',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'In Progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    };

    // Generate mock audit findings
    const generateAuditFindings = () => {
      return [];
    };

    try {
      const assets = generateAssets();
      const auditSessions = generateAuditSessions();
      const auditFindings = generateAuditFindings();

      await AsyncStorage.setItem(`${this.storagePrefix}${DatabaseConstants.assetTable}`, JSON.stringify(assets));
      await AsyncStorage.setItem(`${this.storagePrefix}${DatabaseConstants.auditSessionTable}`, JSON.stringify(auditSessions));
      await AsyncStorage.setItem(`${this.storagePrefix}${DatabaseConstants.auditFindingTable}`, JSON.stringify(auditFindings));
      await AsyncStorage.setItem(`${this.storagePrefix}initialized`, 'true');

      console.log('Database initialized with:', {
        assets: assets.length,
        auditSessions: auditSessions.length,
        auditFindings: auditFindings.length
      });
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
    }

  async query(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (!this.isInitialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      console.log('Query called with SQL:', sql, 'Params:', params);
      
      // Parse SQL to determine operation and structure
      const parsedSQL = this.parseSQL(sql);
      console.log('Parsed SQL:', parsedSQL);
      
      if (!parsedSQL) {
        return { success: false, error: 'Could not parse SQL statement' };
      }

      const data = await this.getTableData(parsedSQL.tableName);
      console.log('Retrieved data for table', parsedSQL.tableName, ':', data.length, 'records');
      
      // Apply WHERE conditions
      let filteredData = data;
      if (parsedSQL.whereConditions && parsedSQL.whereConditions.length > 0) {
        console.log('Applying WHERE conditions...');
        filteredData = this.applyWhereConditions(data, parsedSQL.whereConditions, params);
        console.log('After WHERE filtering:', filteredData.length, 'records');
      }

      // Apply ORDER BY
      if (parsedSQL.orderBy && parsedSQL.orderBy.length > 0) {
        filteredData = this.applyOrderBy(filteredData, parsedSQL.orderBy);
      }

      // Apply LIMIT
      if (parsedSQL.limit) {
        filteredData = filteredData.slice(0, parsedSQL.limit);
      }

      // Handle COUNT queries
      if (parsedSQL.operation === 'COUNT') {
        const result = { success: true, data: [{ count: filteredData.length }] };
        console.log('COUNT query result:', result);
        return result;
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
      const parsedSQL = this.parseSQL(sql);
      if (!parsedSQL) {
        return { success: false, error: 'Could not parse SQL statement' };
      }

      if (parsedSQL.operation === 'INSERT') {
        return await this.handleInsert(parsedSQL, params);
      } else if (parsedSQL.operation === 'UPDATE') {
        return await this.handleUpdate(parsedSQL, params);
      } else if (parsedSQL.operation === 'DELETE') {
        return await this.handleDelete(parsedSQL, params);
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
      console.log('Clearing all database data...');
      const keys = await AsyncStorage.getAllKeys();
      const assetKeys = keys.filter(key => key.startsWith(this.storagePrefix));
      console.log('Found keys to remove:', assetKeys);
      await AsyncStorage.multiRemove(assetKeys);
      this.isInitialized = false;
      console.log('Database cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('Error clearing database:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async forceRegenerateData(): Promise<DatabaseResult> {
    try {
      await this.clearAllData();
      await this.ensureDefaultData();
      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('Error regenerating data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async close(): Promise<void> {
    // AsyncStorage doesn't need explicit closing
    this.isInitialized = false;
  }

  private async getTableData(tableName: string): Promise<any[]> {
    const data = await AsyncStorage.getItem(`${this.storagePrefix}${tableName}`);
    return data ? JSON.parse(data) : [];
  }

  private async setTableData(tableName: string, data: any[]): Promise<void> {
    await AsyncStorage.setItem(`${this.storagePrefix}${tableName}`, JSON.stringify(data));
  }

  private parseSQL(sql: string): ParsedSQL | null {
    try {
      const upperSQL = sql.toUpperCase().trim();
      
      // Determine operation
      let operation: ParsedSQL['operation'];
      if (upperSQL.startsWith('SELECT')) {
        if (upperSQL.includes('COUNT(*)')) {
          operation = 'COUNT';
        } else {
          operation = 'SELECT';
        }
      } else if (upperSQL.startsWith('INSERT')) {
        operation = 'INSERT';
      } else if (upperSQL.startsWith('UPDATE')) {
        operation = 'UPDATE';
      } else if (upperSQL.startsWith('DELETE')) {
        operation = 'DELETE';
      } else {
        return null;
      }

      // Extract table name
      const tableName = this.extractTableName(sql);
      if (!tableName) return null;

      // Parse WHERE conditions
      const whereConditions = this.parseWhereConditions(sql);

      // Parse ORDER BY
      const orderBy = this.parseOrderBy(sql);

      // Parse LIMIT
      const limit = this.extractLimit(sql);

      // Parse fields for INSERT
      const fields = operation === 'INSERT' ? this.parseInsertFields(sql) : undefined;
      const values = operation === 'INSERT' ? this.parseInsertValues(sql) : undefined;

      return {
        operation,
        tableName,
        fields,
        whereConditions,
        orderBy,
        limit,
        values
      };
    } catch (error) {
      console.error('Error parsing SQL:', error);
      return null;
    }
  }

  private extractTableName(sql: string): string | null {
    const upperSQL = sql.toUpperCase();
    
    // Handle different SQL patterns
    const patterns = [
      /INSERT\s+INTO\s+(\w+)/i,
      /UPDATE\s+(\w+)/i,
      /DELETE\s+FROM\s+(\w+)/i,
      /FROM\s+(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = sql.match(pattern);
      if (match) {
        return match[1];
      }
    }

    console.log('Could not extract table name from SQL:', sql);
    return null;
  }

  private parseWhereConditions(sql: string): Array<{
    field: string;
    operator: string;
    value: any;
    paramIndex: number;
  }> {
    const conditions: Array<{
      field: string;
      operator: string;
      value: any;
      paramIndex: number;
    }> = [];

    try {
      // Extract WHERE clause
      const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
      if (!whereMatch) return conditions;

      const whereClause = whereMatch[1];
      
      // Split by AND/OR (simplified - assumes AND for now)
      const conditionStrings = whereClause.split(/\s+AND\s+/i);
      
      conditionStrings.forEach((condition, index) => {
        // Match field operator ? pattern
        const fieldMatch = condition.match(/(\w+)\s*([=<>!]+)\s*\?/);
        if (fieldMatch) {
          conditions.push({
            field: fieldMatch[1],
            operator: fieldMatch[2],
            value: null, // Will be filled with param value
            paramIndex: index
          });
        }
      });
    } catch (error) {
      console.error('Error parsing WHERE conditions:', error);
    }

    return conditions;
  }

  private parseOrderBy(sql: string): Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }> {
    const orderBy: Array<{
      field: string;
      direction: 'ASC' | 'DESC';
    }> = [];

    try {
      const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
      if (!orderMatch) return orderBy;

      const orderClause = orderMatch[1];
      const orderParts = orderClause.split(',').map(part => part.trim());

      orderParts.forEach(part => {
        const fieldMatch = part.match(/(\w+)(?:\s+(ASC|DESC))?/i);
        if (fieldMatch) {
          orderBy.push({
            field: fieldMatch[1],
            direction: (fieldMatch[2]?.toUpperCase() as 'ASC' | 'DESC') || 'ASC'
          });
        }
      });
    } catch (error) {
      console.error('Error parsing ORDER BY:', error);
    }

    return orderBy;
  }

  private parseInsertFields(sql: string): string[] {
    try {
      const fieldsMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
      if (fieldsMatch) {
        return fieldsMatch[1].split(',').map(field => field.trim());
      }
    } catch (error) {
      console.error('Error parsing INSERT fields:', error);
    }
    return [];
  }

  private parseInsertValues(sql: string): string[] {
    try {
      const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
      if (valuesMatch) {
        return valuesMatch[1].split(',').map(value => value.trim());
      }
    } catch (error) {
      console.error('Error parsing INSERT values:', error);
    }
    return [];
  }

  private extractLimit(sql: string): number | null {
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    return limitMatch ? parseInt(limitMatch[1]) : null;
  }

  private applyWhereConditions(data: any[], conditions: Array<{
    field: string;
    operator: string;
    value: any;
    paramIndex: number;
  }>, params: any[]): any[] {
    return data.filter(item => {
      return conditions.every(condition => {
        const paramValue = params[condition.paramIndex];
        const itemValue = item[condition.field];
        
        switch (condition.operator) {
          case '=':
            return itemValue === paramValue;
          case '!=':
          case '<>':
            return itemValue !== paramValue;
          case '>':
            return itemValue > paramValue;
          case '>=':
            return itemValue >= paramValue;
          case '<':
            return itemValue < paramValue;
          case '<=':
            return itemValue <= paramValue;
          case 'LIKE':
            return String(itemValue).toLowerCase().includes(String(paramValue).toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  private applyOrderBy(data: any[], orderBy: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>): any[] {
    return data.sort((a, b) => {
      for (const order of orderBy) {
        const aValue = a[order.field];
        const bValue = b[order.field];
        
        if (aValue === bValue) continue;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        return order.direction === 'DESC' ? -comparison : comparison;
      }
      return 0;
    });
  }

  private async handleInsert(parsedSQL: ParsedSQL, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(parsedSQL.tableName);
    const newRecord = this.paramsToRecord(parsedSQL, params);
    
    // Generate UUID for new records
    if (!newRecord.id && !newRecord.asset_id && !newRecord.offline_record_id) {
      newRecord.id = generateUUID();
    }
    
    newRecord.created_at = new Date().toISOString();
    newRecord.updated_at = new Date().toISOString();
    
    data.push(newRecord);
    await this.setTableData(parsedSQL.tableName, data);
    return { success: true, data: newRecord };
  }

  private async handleUpdate(parsedSQL: ParsedSQL, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(parsedSQL.tableName);
    
    if (parsedSQL.whereConditions && parsedSQL.whereConditions.length > 0) {
      // Find records matching WHERE conditions
      const matchingRecords = this.applyWhereConditions(data, parsedSQL.whereConditions, params);
      
      if (matchingRecords.length > 0) {
        // Update all matching records
        const updatedData = data.map(item => {
          if (matchingRecords.includes(item)) {
            const updates = this.paramsToRecord(parsedSQL, params);
            return { ...item, ...updates, updated_at: new Date().toISOString() };
          }
          return item;
        });
        
        await this.setTableData(parsedSQL.tableName, updatedData);
      }
    }
    
    return { success: true };
  }

  private async handleDelete(parsedSQL: ParsedSQL, params: any[]): Promise<DatabaseResult> {
    const data = await this.getTableData(parsedSQL.tableName);
    
    if (parsedSQL.whereConditions && parsedSQL.whereConditions.length > 0) {
      // Find records matching WHERE conditions
      const matchingRecords = this.applyWhereConditions(data, parsedSQL.whereConditions, params);
      
      if (matchingRecords.length > 0) {
        // Remove matching records
        const filteredData = data.filter(item => !matchingRecords.includes(item));
        await this.setTableData(parsedSQL.tableName, filteredData);
      }
    }
    
    return { success: true };
  }

  private paramsToRecord(parsedSQL: ParsedSQL, params: any[]): any {
    const record: any = {};
    
    if (parsedSQL.operation === 'INSERT' && parsedSQL.fields) {
      // Map parameters to fields based on INSERT statement
      parsedSQL.fields.forEach((field, index) => {
        if (params[index] !== undefined) {
          record[field] = params[index];
        }
      });
    } else if (parsedSQL.operation === 'UPDATE') {
      // For UPDATE, assume first N-1 params are values, last param is WHERE condition value
      // This is a simplified approach - in a real implementation you'd need more sophisticated parsing
      const updateFields = ['asset_code', 'description', 'current_location_name', 'current_condition'];
      updateFields.forEach((field, index) => {
        if (params[index] !== undefined) {
          record[field] = params[index];
        }
      });
    }
    
    return record;
  }
} 