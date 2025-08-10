import { Asset } from '../../data/models/asset_model';
import { DatabaseConstants } from '../constants/database_constants';
import { DatabaseHelper } from '../database/database_helper';

export interface AssetSearchResult {
  success: boolean;
  assets?: Asset[];
  error?: string;
}

export class AssetService {
  private databaseHelper: DatabaseHelper;

  constructor() {
    this.databaseHelper = DatabaseHelper.getInstance();
  }

  /**
   * Ensure database is initialized before any operation
   */
  private async ensureInitialized(): Promise<void> {
    const result = await this.databaseHelper.initialize();
    if (!result.success) {
      throw new Error(`Database initialization failed: ${result.error}`);
    }
  }

  /**
   * Search for assets by barcode
   */
  async searchByBarcode(barcode: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE barcode = ?`,
        [barcode]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error searching assets by barcode:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Search for assets by asset code
   */
  async searchByAssetCode(assetCode: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE asset_code = ?`,
        [assetCode]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error searching assets by asset code:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Search for assets by tag number
   */
  async searchByTagNumber(tagNumber: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE tag_number = ?`,
        [tagNumber]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error searching assets by tag number:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Search for assets by serial number
   */
  async searchBySerialNumber(serialNumber: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE serial_number = ?`,
        [serialNumber]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error searching assets by serial number:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Search for assets by description (partial match)
   */
  async searchByDescription(description: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE description LIKE ?`,
        [`%${description}%`]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error searching assets by description:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all assets
   */
  async getAllAssets(): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} ORDER BY asset_code`
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error getting all assets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(assetId: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE asset_id = ?`,
        [assetId]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error getting asset by ID:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create or update an asset
   */
  async saveAsset(asset: Asset): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const assetData = asset.toJson();
      
      // Check if asset already exists
      const existingResult = await this.searchByAssetCode(asset.asset_code);
      
      if (existingResult.success && existingResult.assets && existingResult.assets.length > 0) {
        // Update existing asset
        const result = await this.databaseHelper.execute(
          `UPDATE ${DatabaseConstants.assetTable} SET 
           barcode = ?, tag_number = ?, description = ?, category_name = ?, 
           sub_category_name = ?, brand = ?, model = ?, serial_number = ?,
           current_location_id = ?, current_location_name = ?, expected_location_id = ?,
           expected_location_name = ?, current_department_name = ?, current_custodian_name = ?,
           current_custodian_email = ?, current_status_name = ?, current_condition = ?,
           asset_cost = ?, net_book_value = ?, purchase_date = ?, assigned_team_id = ?,
           audit_priority = ?, data_version = ?, updated_at = ?
           WHERE asset_code = ?`,
          [
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
            assetData.asset_code
          ]
        );

        if (!result.success) {
          return { success: false, error: result.error };
        }
      } else {
        // Insert new asset
        const result = await this.databaseHelper.execute(
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
            new Date().toISOString()
          ]
        );

        if (!result.success) {
          return { success: false, error: result.error };
        }
      }

      return { success: true, assets: [asset] };
    } catch (error) {
      console.error('Error saving asset:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get assets count
   */
  async getAssetsCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.assetTable}`
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const count = result.data?.[0]?.count || 0;
      return { success: true, count };
    } catch (error) {
      console.error('Error getting assets count:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<{ success: boolean; categories?: string[]; error?: string }> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT DISTINCT category_name FROM ${DatabaseConstants.assetTable} ORDER BY category_name`
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const categories = (result.data || []).map((item: any) => item.category_name);
      return { success: true, categories };
    } catch (error) {
      console.error('Error getting categories:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(category: string): Promise<AssetSearchResult> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.assetTable} WHERE category_name = ? ORDER BY asset_code`,
        [category]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const assets = (result.data || []).map((assetData: any) => Asset.fromJson(assetData));
      return { success: true, assets };
    } catch (error) {
      console.error('Error getting assets by category:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get assets count by category
   */
  async getAssetsCountByCategory(category: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      await this.ensureInitialized();
      
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.assetTable} WHERE category_name = ?`,
        [category]
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const count = result.data?.[0]?.count || 0;
      return { success: true, count };
    } catch (error) {
      console.error('Error getting assets count by category:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 