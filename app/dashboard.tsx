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
    View,
} from 'react-native';

// Mock data for demonstration
const mockAuditSessions = [
    {
        session_id: 1,
        session_code: 'AUDIT-2024-001',
        audit_name: 'Q1 Asset Verification',
        audit_type: 'COMPREHENSIVE',
        audit_status: 'IN_PROGRESS',
        total_assets_assigned: 150,
        assets_audited: 87,
        team_name: 'Audit Team Alpha',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z',
    },
    {
        session_id: 2,
        session_code: 'AUDIT-2024-002',
        audit_name: 'IT Equipment Audit',
        audit_type: 'SPECIFIC',
        audit_status: 'PLANNED',
        total_assets_assigned: 75,
        assets_audited: 0,
        team_name: 'IT Audit Team',
        created_at: '2024-01-18T09:00:00Z',
        updated_at: '2024-01-18T09:00:00Z',
    },
    {
        session_id: 3,
        session_code: 'AUDIT-2024-003',
        audit_name: 'Office Furniture Audit',
        audit_type: 'COMPREHENSIVE',
        audit_status: 'COMPLETED',
        total_assets_assigned: 200,
        assets_audited: 200,
        team_name: 'Facilities Team',
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-25T16:00:00Z',
    },
];

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
    const [auditSessions, setAuditSessions] = useState(mockAuditSessions);
    const [assets, setAssets] = useState(mockAssets);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalAssets: 425,
        auditedAssets: 287,
        pendingAssets: 138,
        completedSessions: 1,
        activeSessions: 2,
    });

    useEffect(() => {
        // Simulate loading
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const handleStartNewAudit = () => {
        Alert.alert('New Audit', 'This would open the audit creation screen');
    };

    const handleViewAssets = () => {
        Alert.alert('View Assets', 'This would open the assets list screen');
    };

    const handleViewSessions = () => {
        Alert.alert('View Sessions', 'This would open the audit sessions screen');
    };

    const handleSyncData = () => {
        Alert.alert('Sync Data', 'This would sync data with the server');
    };

    const handleScanBarcode = () => {
        router.push('/barcode-scanner');
    };

    const handleCreateAsset = () => {
        router.push('/create-asset');
    };

    const handleSettings = () => {
        router.push('/settings');
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

    const AuditSessionCard = ({ session }: { session: any }) => {
        const completionPercentage = session.total_assets_assigned > 0 
            ? (session.assets_audited / session.total_assets_assigned) * 100 
            : 0;

        const getStatusColor = (status: string) => {
            switch (status) {
                case 'PLANNED': return '#6B7280';
                case 'IN_PROGRESS': return '#3B82F6';
                case 'COMPLETED': return '#10B981';
                case 'CANCELLED': return '#EF4444';
                default: return '#6B7280';
            }
        };

        const getStatusText = (status: string) => {
            switch (status) {
                case 'PLANNED': return 'Planned';
                case 'IN_PROGRESS': return 'In Progress';
                case 'COMPLETED': return 'Completed';
                case 'CANCELLED': return 'Cancelled';
                default: return 'Unknown';
            }
        };

        return (
            <TouchableOpacity
                className="bg-white rounded-xl p-4 shadow-sm active:opacity-80 mb-3"
                onPress={() => Alert.alert('Session Details', `Opening session: ${session.audit_name}`)}
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900 mb-1">{session.audit_name}</Text>
                        <Text className="text-sm text-gray-600">{session.session_code}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: `${getStatusColor(session.audit_status)}20` }}>
                        <Text className="text-xs font-medium" style={{ color: getStatusColor(session.audit_status) }}>
                            {getStatusText(session.audit_status)}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm text-gray-600">{session.assets_audited} of {session.total_assets_assigned} assets audited</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                        {completionPercentage.toFixed(1)}%
                    </Text>
                </View>
                
                <View className="w-full bg-gray-200 rounded-full h-2">
                    <View 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                    />
                </View>
            </TouchableOpacity>
        );
    };

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
                {/* Stats Grid */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Overview</Text>
                    <View className="flex-row gap-3">
                        <StatCard
                            title="Total Assets"
                            value={stats.totalAssets}
                            icon="cube-outline"
                            color="#3B82F6"
                            onPress={handleViewAssets}
                        />
                        <StatCard
                            title="Audited"
                            value={stats.auditedAssets}
                            icon="checkmark-circle-outline"
                            color="#10B981"
                        />
                    </View>
                    <View className="flex-row gap-3 mt-3">
                        <StatCard
                            title="Pending"
                            value={stats.pendingAssets}
                            icon="time-outline"
                            color="#F59E0B"
                        />
                        <StatCard
                            title="Active Sessions"
                            value={stats.activeSessions}
                            icon="play-circle-outline"
                            color="#EF4444"
                            onPress={handleViewSessions}
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
                            title="Scan Barcode"
                            subtitle="Scan asset barcode or QR code"
                            icon="scan-outline"
                            color="#10B981"
                            onPress={handleScanBarcode}
                        />
                        <QuickActionCard
                            title="Create Asset"
                            subtitle="Add a new asset to inventory"
                            icon="add-circle-outline"
                            color="#8B5CF6"
                            onPress={handleCreateAsset}
                        />
                        <QuickActionCard
                            title="Sync Data"
                            subtitle="Sync with server"
                            icon="cloud-upload-outline"
                            color="#F59E0B"
                            onPress={handleSyncData}
                        />
                    </View>
                </View>

                {/* Recent Audit Sessions */}
                {auditSessions.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Recent Sessions</Text>
                            <TouchableOpacity onPress={handleViewSessions}>
                                <Text className="text-blue-600 text-sm font-medium">View All</Text>
                            </TouchableOpacity>
                        </View>
                        {auditSessions.map((session) => (
                            <AuditSessionCard key={session.session_id} session={session} />
                        ))}
                    </View>
                )}

                {/* Recent Assets */}
                {assets.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold text-gray-900">Recent Assets</Text>
                            <TouchableOpacity onPress={handleViewAssets}>
                                <Text className="text-blue-600 text-sm font-medium">View All</Text>
                            </TouchableOpacity>
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
    );
} 