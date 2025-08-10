import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ProtectedRoute } from '../lib/core/components/ProtectedRoute';
import { DatabaseConstants } from '../lib/core/constants/database_constants';
import { DatabaseHelper } from '../lib/core/database/database_helper';
import { AssetService } from '../lib/core/services/asset_service';
import { AuditService } from '../lib/core/services/audit_service';
import { SimpleAuditService } from '../lib/core/services/simple_audit_service';
import { Asset } from '../lib/data/models/asset_model';


const mockAssets = [
    {
        asset_id: 1,
        asset_code: 'LAPTOP-001',
        description: 'Dell Latitude 5520',
        category_name: 'IT Equipment',
        current_location_name: 'IT Department',
        current_custodian_name: 'John Smith',
        audit_priority: 'HIGH',
        current_condition: 'GOOD',
        created_at: '2024-01-15T10:00:00Z',
    },
    {
        asset_id: 2,
        asset_code: 'DESK-001',
        description: 'Ergonomic Office Desk',
        category_name: 'Furniture',
        current_location_name: 'Marketing Department',
        current_custodian_name: 'Sarah Johnson',
        audit_priority: 'NORMAL',
        current_condition: 'EXCELLENT',
        created_at: '2024-01-15T10:00:00Z',
    },
    {
        asset_id: 3,
        asset_code: 'PRINTER-001',
        description: 'HP LaserJet Pro M404n',
        category_name: 'IT Equipment',
        current_location_name: 'Finance Department',
        current_custodian_name: 'Mike Davis',
        audit_priority: 'CRITICAL',
        current_condition: 'FAIR',
        created_at: '2024-01-15T10:00:00Z',
    },
];

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;
const isLargeTablet = width > 1024;

export default function DashboardScreen() {

    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);

    const [auditStats, setAuditStats] = useState({
        totalAudits: 0,
        completedAudits: 0,
        pendingAudits: 0,
        todayAudits: 0,
        completionRate: 0,
    });
    const [assetCount, setAssetCount] = useState(0);

    // Create services outside useEffect to prevent recreation
    const assetService = new AssetService();
    const auditService = new AuditService();
    const simpleAuditService = new SimpleAuditService();

    useEffect(() => {
        console.log('Dashboard useEffect triggered');
        
        const initializeApp = async () => {
            try {
                console.log('Starting database initialization...');
                
                // Initialize database
                const dbHelper = DatabaseHelper.getInstance();
                const dbResult = await dbHelper.initialize();
                
                if (!dbResult.success) {
                    console.error('Database initialization failed:', dbResult.error);
                    Alert.alert('Error', 'Failed to initialize database');
                    setLoading(false);
                    return;
                }

                console.log('Database initialized successfully');

                // Load real data from database
                const assetsResult = await assetService.getAllAssets();
                
                if (assetsResult.success && assetsResult.assets) {
                    console.log('Loaded assets:', assetsResult.assets.length);
                    setAssets(assetsResult.assets.slice(0, 3)); // Show first 3 assets
                    setAssetCount(assetsResult.assets.length);
                }

                // Load audit statistics using simple audit service
                const auditStatsResult = await simpleAuditService.getAuditStatistics();
                if (auditStatsResult.success && auditStatsResult.data) {
                    console.log('Loaded simple audit statistics:', auditStatsResult.data);
                    // Convert to the format expected by the UI
                    setAuditStats({
                        totalAudits: auditStatsResult.data.totalAssets,
                        completedAudits: auditStatsResult.data.auditedAssets,
                        pendingAudits: auditStatsResult.data.pendingAssets,
                        todayAudits: 0, // Not tracked in simple service
                        completionRate: auditStatsResult.data.completionRate
                    });
                }

                console.log('Setting loading to false');
                setLoading(false);
            } catch (error) {
                console.error('Error initializing app:', error);
                setLoading(false);
            }
        };

        initializeApp();
    }, []); // Empty dependency array to run only once

    const handleStartNewAudit = () => {
        router.push('/start-audit');
    };





    const handleSyncData = () => {
        Alert.alert('Sync Data', 'This would sync data with the server');
    };



    const handleSettings = () => {
        router.push('/settings');
    };

    const handleForceRegenerateData = async () => {
        try {
            setLoading(true);
            console.log('Force regenerating database data...');
            
            const dbHelper = DatabaseHelper.getInstance();
            const result = await dbHelper.forceRegenerateData();
            
            if (result.success) {
                // Reload assets after regeneration
                const assetsResult = await assetService.getAllAssets();
                if (assetsResult.success && assetsResult.assets) {
                    console.log('Reloaded assets after regeneration:', assetsResult.assets.length);
                    setAssets(assetsResult.assets.slice(0, 3));
                    setAssetCount(assetsResult.assets.length);

                    // Refresh audit statistics
                    const auditStatsResult = await auditService.getAuditStatistics();
                    if (auditStatsResult.success && auditStatsResult.data) {
                        console.log('Refreshed audit statistics:', auditStatsResult.data);
                        setAuditStats(auditStatsResult.data);
                    }
                }
                
                Alert.alert('Success', 'Database regenerated successfully!');
            } else {
                Alert.alert('Error', 'Failed to regenerate database data');
            }
        } catch (error) {
            console.error('Error regenerating data:', error);
            Alert.alert('Error', 'Failed to regenerate database data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllAssets = () => {
        router.push('/all-assets');
    };

    const StatCard = ({ title, value, icon, color, onPress }: {
        title: string;
        value: string | number;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
        onPress?: () => void;
    }) => (
        <TouchableOpacity
            className={`flex-1 bg-white rounded-xl p-4 shadow-sm ${onPress ? 'active:opacity-80' : ''}`}
            onPress={onPress}
            disabled={!onPress}
        >
            <View className="flex-row items-center justify-between mb-2">
                <View className={`w-10 h-10 rounded-lg items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                {onPress && (
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                )}
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
            <Text className="text-sm text-gray-600">{title}</Text>
        </TouchableOpacity>
    );

    const QuickActionCard = ({ title, subtitle, icon, color, onPress }: {
        title: string;
        subtitle: string;
        icon: keyof typeof Ionicons.glyphMap;
        color: string;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 shadow-sm active:opacity-80"
            onPress={onPress}
        >
            <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-lg items-center justify-center mr-4`} style={{ backgroundColor: `${color}20` }}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">{title}</Text>
                    <Text className="text-sm text-gray-600">{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
        </TouchableOpacity>
    );



    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <View className="items-center">
                    <Ionicons name="refresh" size={32} color="#6B7280" />
                    <Text className="text-gray-600 mt-2">Loading dashboard...</Text>
                </View>
            </View>
        );
    }

    return (
        <ProtectedRoute>
            <View className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
                
                {/* Header */}
                <LinearGradient
                    colors={['#3B82F6', '#1D4ED8']}
                    className="pt-12 pb-6 px-6"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-white text-2xl font-bold">Asset Management</Text>
                            <Text className="text-blue-100 text-sm">Professional Audit Dashboard</Text>
                            <Text className="text-blue-100 text-sm mt-1">Total Assets: {assetCount}</Text>
                        </View>
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            onPress={handleSettings}
                        >
                            <Ionicons name="settings-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>


                    {/* Audit Progress */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Audit Progress</Text>
                            <View className="flex-row items-center">
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                <Text className="text-sm text-gray-500">{auditStats.completionRate}% Complete</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <StatCard
                                title="Total Audits"
                                value={auditStats.totalAudits}
                                icon="document-text-outline"
                                color="#6366F1"
                            />
                            <StatCard
                                title="Completed"
                                value={auditStats.completedAudits}
                                icon="checkmark-done-circle-outline"
                                color="#10B981"
                            />
                        </View>
                        
                        <View className="flex-row gap-3 mt-3">
                            <StatCard
                                title="Today"
                                value={auditStats.todayAudits}
                                icon="today-outline"
                                color="#F59E0B"
                            />
                            <StatCard
                                title="Pending"
                                value={auditStats.pendingAudits}
                                icon="time-outline"
                                color="#8B5CF6"
                            />
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
                        <View className="space-y-3">
                            <QuickActionCard
                                title="Start New Audit"
                                subtitle="Create a new audit session"
                                icon="add-circle-outline"
                                color="#3B82F6"
                                onPress={handleStartNewAudit}
                            />

                            <QuickActionCard
                                title="Sync Data"
                                subtitle="Sync with server"
                                icon="cloud-upload-outline"
                                color="#F59E0B"
                                onPress={handleSyncData}
                            />
                            <QuickActionCard
                                title="Regenerate Data"
                                subtitle="Force regenerate 100 assets"
                                icon="refresh-outline"
                                color="#EF4444"
                                onPress={handleForceRegenerateData}
                            />
                            <QuickActionCard
                                title="View All Assets"
                                subtitle="Browse all assets"
                                icon="list-outline"
                                color="#6366F1"
                                onPress={handleViewAllAssets}
                            />
                            <QuickActionCard
                                title="Debug Audits"
                                subtitle="Show current audit findings"
                                icon="bug-outline"
                                color="#EF4444"
                                onPress={async () => {
                                    try {
                                        const dbHelper = DatabaseHelper.getInstance();
                                        const auditFindingsResult = await dbHelper.query(
                                            `SELECT * FROM ${DatabaseConstants.auditFindingTable}`
                                        );
                                        const assetsResult = await dbHelper.query(
                                            `SELECT * FROM ${DatabaseConstants.assetTable}`
                                        );
                                        
                                        if (auditFindingsResult.success && assetsResult.success) {
                                            const auditFindings = auditFindingsResult.data || [];
                                            const assets = assetsResult.data || [];
                                            
                                            console.log('=== DEBUG AUDIT FINDINGS ===');
                                            console.log('Total Assets:', assets.length);
                                            console.log('Total Audit Findings:', auditFindings.length);
                                            
                                            if (auditFindings.length > 0) {
                                                console.log('Audit Findings:', auditFindings);
                                                console.log('Asset IDs in audits:', auditFindings.map((a: any) => a.asset_id));
                                                console.log('Asset Codes in audits:', auditFindings.map((a: any) => a.physical_asset_code));
                                                
                                                // Check for duplicates
                                                const assetIds = auditFindings.map((a: any) => a.asset_id).filter((id: any) => id != null);
                                                const uniqueAssetIds = [...new Set(assetIds)];
                                                console.log('Unique asset IDs:', uniqueAssetIds.length, 'vs Total audit findings:', auditFindings.length);
                                                
                                                if (uniqueAssetIds.length !== auditFindings.length) {
                                                    console.log('❌ DUPLICATES FOUND!');
                                                } else {
                                                    console.log('✅ No duplicates found');
                                                }
                                            }
                                            
                                            Alert.alert(
                                                'Debug Info',
                                                `Assets: ${assets.length}\nAudit Findings: ${auditFindings.length}\nCheck console for details.`
                                            );
                                        }
                                    } catch (error) {
                                        console.error('Debug error:', error);
                                        Alert.alert('Error', 'Failed to get debug info');
                                    }
                                }}
                            />
                            <QuickActionCard
                                title="Clear Audits"
                                subtitle="Remove all audit findings"
                                icon="trash-outline"
                                color="#EF4444"
                                onPress={async () => {
                                    try {
                                        const result = await simpleAuditService.clearAllAudits();
                                        
                                        if (result.success) {
                                            // Refresh audit statistics
                                            const auditStatsResult = await simpleAuditService.getAuditStatistics();
                                            if (auditStatsResult.success && auditStatsResult.data) {
                                                setAuditStats({
                                                    totalAudits: auditStatsResult.data.totalAssets,
                                                    completedAudits: auditStatsResult.data.auditedAssets,
                                                    pendingAudits: auditStatsResult.data.pendingAssets,
                                                    todayAudits: 0,
                                                    completionRate: auditStatsResult.data.completionRate
                                                });
                                            }
                                            
                                            Alert.alert('Success', 'All audit findings cleared!');
                                        } else {
                                            Alert.alert('Error', result.error || 'Failed to clear audit findings');
                                        }
                                    } catch (error) {
                                        console.error('Clear audits error:', error);
                                        Alert.alert('Error', 'Failed to clear audit findings');
                                    }
                                }}
                            />
                            <QuickActionCard
                                title="Test Single Audit"
                                subtitle="Create a test audit for LAPTOP-001"
                                icon="flask-outline"
                                color="#10B981"
                                onPress={async () => {
                                    try {
                                        const assetService = new AssetService();
                                        
                                        // Find LAPTOP-001
                                        const assetResult = await assetService.searchByAssetCode('LAPTOP-001');
                                        if (assetResult.success && assetResult.assets && assetResult.assets.length > 0) {
                                            const asset = assetResult.assets[0];
                                            
                                            // Create a test audit using simple audit service
                                            const result = await simpleAuditService.createAudit(
                                                asset.asset_id,
                                                asset.asset_code,
                                                'Test Location',
                                                'Test audit created from dashboard'
                                            );
                                            
                                            if (result.success) {
                                                // Refresh audit statistics
                                                const auditStatsResult = await simpleAuditService.getAuditStatistics();
                                                if (auditStatsResult.success && auditStatsResult.data) {
                                                    setAuditStats({
                                                        totalAudits: auditStatsResult.data.totalAssets,
                                                        completedAudits: auditStatsResult.data.auditedAssets,
                                                        pendingAudits: auditStatsResult.data.pendingAssets,
                                                        todayAudits: 0,
                                                        completionRate: auditStatsResult.data.completionRate
                                                    });
                                                }
                                                
                                                Alert.alert('Success', `Test audit created for ${asset.asset_code}`);
                                            } else {
                                                Alert.alert('Error', result.error || 'Failed to create test audit');
                                            }
                                        } else {
                                            Alert.alert('Error', 'LAPTOP-001 not found');
                                        }
                                    } catch (error) {
                                        console.error('Test audit error:', error);
                                        Alert.alert('Error', 'Failed to create test audit');
                                    }
                                }}
                            />
                        </View>
                    </View>



                    {/* Recent Assets */}
                    {assets.length > 0 && (
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-semibold text-gray-900">Recent Assets</Text>
                            </View>
                            {assets.slice(0, 3).map((asset) => (
                                <TouchableOpacity
                                    key={asset.asset_id}
                                    className="bg-white rounded-xl p-4 shadow-sm active:opacity-80 mb-3"
                                    onPress={() => Alert.alert('Asset Details', `Opening asset: ${asset.asset_code}`)}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-900 mb-1">
                                                {asset.asset_code}
                                            </Text>
                                            <Text className="text-sm text-gray-600 mb-2">{asset.description}</Text>
                                            <View className="flex-row items-center">
                                                <View className={`w-2 h-2 rounded-full mr-2`} 
                                                      style={{ backgroundColor: asset.audit_priority === 'CRITICAL' || asset.audit_priority === 'HIGH' ? '#EF4444' : '#10B981' }} />
                                                <Text className="text-xs text-gray-500">
                                                    {asset.current_location_name || 'Location not set'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Bottom spacing */}
                    <View className="h-6" />
                </ScrollView>
            </View>
        </ProtectedRoute>
    );
}