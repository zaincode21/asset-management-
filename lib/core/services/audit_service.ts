import { DatabaseConstants } from '../constants/database_constants';
import { DatabaseHelper } from '../database/database_helper';

export interface AuditStatistics {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  todayAudits: number;
  completionRate: number;
  averageAuditTime: number;
}

export interface AuditServiceResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class AuditService {
  private databaseHelper: DatabaseHelper;

  constructor() {
    this.databaseHelper = DatabaseHelper.getInstance();
  }

  async getAuditStatistics(): Promise<AuditServiceResult> {
    try {
      // Get total assets (this will be our total audits target)
      const totalAssetsResult = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.assetTable}`
      );

      // Get all audit findings to calculate unique audits
      const allAuditFindingsResult = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable}`
      );

      // Get today's audits
      const today = new Date().toISOString().split('T')[0];
      const todayResult = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.auditFindingTable} WHERE DATE(created_at) = ?`,
        [today]
      );

      if (!totalAssetsResult.success || !allAuditFindingsResult.success || !todayResult.success) {
        return { success: false, error: 'Failed to fetch audit statistics' };
      }

      const totalAssets = totalAssetsResult.data?.[0]?.count || 0;
      const allAuditFindings = allAuditFindingsResult.data || [];
      
      // Calculate unique audits by asset_id (for assets in system) and physical_asset_code (for new discoveries)
      const uniqueAuditedAssets = new Set();
      allAuditFindings.forEach((audit: any) => {
        if (audit.asset_id) {
          // Asset exists in system - use asset_id
          uniqueAuditedAssets.add(`asset_${audit.asset_id}`);
        } else if (audit.physical_asset_code) {
          // New discovery - use physical_asset_code
          uniqueAuditedAssets.add(`code_${audit.physical_asset_code}`);
        }
      });

      const totalAudits = totalAssets; // Total audits = total assets
      const completedAudits = uniqueAuditedAssets.size; // Unique assets audited
      const pendingAudits = Math.max(0, totalAssets - completedAudits); // Pending = Total Assets - Completed Audits
      const todayAudits = todayResult.data?.[0]?.count || 0;

      const completionRate = totalAudits > 0 ? (completedAudits / totalAudits) * 100 : 0;

      console.log('Audit Statistics Debug:', {
        totalAssets,
        totalAuditFindings: allAuditFindings.length,
        uniqueAuditedAssets: uniqueAuditedAssets.size,
        uniqueAuditedAssetsList: Array.from(uniqueAuditedAssets),
        completedAudits,
        pendingAudits,
        todayAudits
      });
      
      // Debug: Show what's actually in the audit findings
      if (allAuditFindings.length > 0) {
        console.log('First audit finding details:', {
          asset_id: allAuditFindings[0].asset_id,
          physical_asset_code: allAuditFindings[0].physical_asset_code,
          has_asset_id: Boolean(allAuditFindings[0].asset_id),
          has_physical_asset_code: Boolean(allAuditFindings[0].physical_asset_code)
        });
      }

      const statistics: AuditStatistics = {
        totalAudits,
        completedAudits,
        pendingAudits,
        todayAudits,
        completionRate: Math.round(completionRate * 100) / 100,
        averageAuditTime: 0, // Placeholder for future implementation
      };

      return { success: true, data: statistics };
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getRecentAudits(limit: number = 5): Promise<AuditServiceResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable} ORDER BY created_at DESC LIMIT ?`,
        [limit]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to fetch recent audits' };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error('Error getting recent audits:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAuditTrends(days: number = 7): Promise<AuditServiceResult> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const result = await this.databaseHelper.query(
        `SELECT DATE(created_at) as date, COUNT(*) as count 
         FROM ${DatabaseConstants.auditFindingTable} 
         WHERE DATE(created_at) >= ? 
         GROUP BY DATE(created_at) 
         ORDER BY date`,
        [startDateStr]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to fetch audit trends' };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error('Error getting audit trends:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async isAssetAlreadyAudited(assetId: number): Promise<AuditServiceResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.auditFindingTable} WHERE asset_id = ?`,
        [assetId]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to check audit status' };
      }

      const count = result.data?.[0]?.count || 0;
      return { success: true, data: { isAudited: count > 0, auditCount: count } };
    } catch (error) {
      console.error('Error checking if asset is audited:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAssetAuditHistory(assetId: number): Promise<AuditServiceResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT * FROM ${DatabaseConstants.auditFindingTable} WHERE asset_id = ? ORDER BY created_at DESC`,
        [assetId]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to fetch audit history' };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error('Error getting asset audit history:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async isAssetCodeAlreadyAudited(assetCode: string): Promise<AuditServiceResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.auditFindingTable} WHERE physical_asset_code = ?`,
        [assetCode]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to check audit status' };
      }

      const count = result.data?.[0]?.count || 0;
      return { success: true, data: { isAudited: count > 0, auditCount: count } };
    } catch (error) {
      console.error('Error checking if asset code is audited:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async isAssetIdAlreadyAudited(assetId: number): Promise<AuditServiceResult> {
    try {
      const result = await this.databaseHelper.query(
        `SELECT COUNT(*) as count FROM ${DatabaseConstants.auditFindingTable} WHERE asset_id = ?`,
        [assetId]
      );

      if (!result.success) {
        return { success: false, error: 'Failed to check audit status' };
      }

      const count = result.data?.[0]?.count || 0;
      return { success: true, data: { isAudited: count > 0, auditCount: count } };
    } catch (error) {
      console.error('Error checking if asset ID is audited:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 