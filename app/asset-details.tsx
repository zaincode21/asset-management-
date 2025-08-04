import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AssetService } from '../lib/core/services/asset_service';
import { Asset } from '../lib/data/models/asset_model';

export default function AssetDetailsScreen() {
    const params = useLocalSearchParams();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const assetService = new AssetService();

    useEffect(() => {
        const loadAsset = async () => {
            try {
                setLoading(true);
                setError(null);

                const barcode = params.barcode as string;
                const assetCode = params.assetCode as string;

                if (!barcode && !assetCode) {
                    setError('No asset identifier provided');
                    return;
                }

                let result;
                if (barcode) {
                    result = await assetService.searchByBarcode(barcode);
                } else {
                    result = await assetService.searchByAssetCode(assetCode);
                }

                if (!result.success) {
                    setError(result.error || 'Failed to load asset');
                    return;
                }

                if (!result.assets || result.assets.length === 0) {
                    setError('Asset not found');
                    return;
                }

                setAsset(result.assets[0]);
            } catch (err) {
                console.error('Error loading asset:', err);
                setError('Failed to load asset details');
            } finally {
                setLoading(false);
            }
        };

        loadAsset();
    }, [params]);

    const handleBack = () => {
        router.back();
    };

    const handleScanAnother = () => {
        router.push('/barcode-scanner');
    };

    const handleEditAsset = () => {
        Alert.alert('Edit Asset', 'Edit functionality will be implemented here');
    };

    const handleAuditAsset = () => {
        Alert.alert('Audit Asset', 'Audit functionality will be implemented here');
    };

    const handleCreateAsset = () => {
        router.push('/create-asset');
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return '#10B981';
            case 'INACTIVE': return '#6B7280';
            case 'MAINTENANCE': return '#F59E0B';
            case 'RETIRED': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getConditionColor = (condition?: string) => {
        switch (condition?.toUpperCase()) {
            case 'EXCELLENT': return '#10B981';
            case 'GOOD': return '#3B82F6';
            case 'FAIR': return '#F59E0B';
            case 'POOR': return '#EF4444';
            default: return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
                <View className="items-center">
                    <Ionicons name="refresh" size={32} color="#6B7280" />
                    <Text className="text-gray-600 mt-2">Loading asset details...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
                
                {/* Header */}
                <LinearGradient
                    colors={['#3B82F6', '#1D4ED8']}
                    className="pt-12 pb-6 px-6"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            onPress={handleBack}
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-semibold">Asset Details</Text>
                        <View className="w-10" />
                    </View>
                </LinearGradient>

                {/* Error Content */}
                <View className="flex-1 items-center justify-center px-6">
                    <View className="items-center">
                        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                        <Text className="text-red-500 text-xl font-semibold mt-4 mb-2 text-center">
                            Asset Not Found
                        </Text>
                        <Text className="text-gray-600 text-center mb-8">
                            {error}
                        </Text>
                        
                        <View className="w-full space-y-4">
                            <TouchableOpacity
                                className="w-full py-4 rounded-xl bg-blue-500 items-center"
                                onPress={handleScanAnother}
                            >
                                <Text className="text-white font-semibold text-lg">Scan Another Barcode</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                className="w-full py-4 rounded-xl bg-gray-600 items-center"
                                onPress={handleBack}
                            >
                                <Text className="text-white font-semibold">Go Back</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    if (!asset) {
        return null;
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
                    <TouchableOpacity
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold">Asset Details</Text>
                    <TouchableOpacity
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                        onPress={handleEditAsset}
                    >
                        <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Asset Header Card */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6 mt-4">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 mb-1">
                                {asset.description}
                            </Text>
                            <Text className="text-lg text-gray-600">{asset.asset_code}</Text>
                        </View>
                        <View className="items-end">
                            <View 
                                className="px-3 py-1 rounded-full mb-2"
                                style={{ backgroundColor: `${getStatusColor(asset.current_status_name)}20` }}
                            >
                                <Text 
                                    className="text-xs font-medium"
                                    style={{ color: getStatusColor(asset.current_status_name) }}
                                >
                                    {asset.current_status_name || 'Unknown'}
                                </Text>
                            </View>
                            <View 
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${getConditionColor(asset.current_condition)}20` }}
                            >
                                <Text 
                                    className="text-xs font-medium"
                                    style={{ color: getConditionColor(asset.current_condition) }}
                                >
                                    {asset.current_condition || 'Unknown'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Barcode Info */}
                    {asset.barcode && (
                        <View className="bg-gray-50 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-sm text-gray-600 mb-1">Barcode</Text>
                                    <Text className="text-lg font-mono text-gray-900">{asset.barcode}</Text>
                                </View>
                                <Ionicons name="barcode-outline" size={24} color="#6B7280" />
                            </View>
                        </View>
                    )}

                    {/* Quick Actions */}
                    <View className="flex-row space-x-3 mb-4">
                        <TouchableOpacity
                            className="flex-1 bg-blue-500 py-3 rounded-lg items-center"
                            onPress={handleAuditAsset}
                        >
                            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-sm mt-1">Audit Asset</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            className="flex-1 bg-green-500 py-3 rounded-lg items-center"
                            onPress={handleScanAnother}
                        >
                            <Ionicons name="scan-outline" size={20} color="white" />
                            <Text className="text-white font-semibold text-sm mt-1">Scan Another</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Create Asset Button */}
                    <TouchableOpacity
                        className="w-full bg-purple-500 py-3 rounded-lg items-center"
                        onPress={handleCreateAsset}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="white" />
                        <Text className="text-white font-semibold text-sm mt-1">Create New Asset</Text>
                    </TouchableOpacity>
                </View>

                {/* Asset Details */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Asset Information</Text>
                    
                    <View className="space-y-4">
                        {asset.tag_number && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Tag Number</Text>
                                <Text className="text-gray-900 font-medium">{asset.tag_number}</Text>
                            </View>
                        )}
                        
                        {asset.serial_number && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Serial Number</Text>
                                <Text className="text-gray-900 font-medium">{asset.serial_number}</Text>
                            </View>
                        )}
                        
                        {asset.brand && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Brand</Text>
                                <Text className="text-gray-900 font-medium">{asset.brand}</Text>
                            </View>
                        )}
                        
                        {asset.model && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Model</Text>
                                <Text className="text-gray-900 font-medium">{asset.model}</Text>
                            </View>
                        )}
                        
                        {asset.category_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Category</Text>
                                <Text className="text-gray-900 font-medium">{asset.category_name}</Text>
                            </View>
                        )}
                        
                        {asset.sub_category_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Sub Category</Text>
                                <Text className="text-gray-900 font-medium">{asset.sub_category_name}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Location Information */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Location & Custodian</Text>
                    
                    <View className="space-y-4">
                        {asset.current_location_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Current Location</Text>
                                <Text className="text-gray-900 font-medium">{asset.current_location_name}</Text>
                            </View>
                        )}
                        
                        {asset.expected_location_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Expected Location</Text>
                                <Text className="text-gray-900 font-medium">{asset.expected_location_name}</Text>
                            </View>
                        )}
                        
                        {asset.current_department_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Department</Text>
                                <Text className="text-gray-900 font-medium">{asset.current_department_name}</Text>
                            </View>
                        )}
                        
                        {asset.current_custodian_name && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Custodian</Text>
                                <Text className="text-gray-900 font-medium">{asset.current_custodian_name}</Text>
                            </View>
                        )}
                        
                        {asset.current_custodian_email && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Custodian Email</Text>
                                <Text className="text-gray-900 font-medium">{asset.current_custodian_email}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Financial Information */}
                {(asset.asset_cost || asset.net_book_value || asset.purchase_date) && (
                    <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Financial Information</Text>
                        
                        <View className="space-y-4">
                            {asset.asset_cost && (
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Asset Cost</Text>
                                    <Text className="text-gray-900 font-medium">
                                        ${asset.asset_cost.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            
                            {asset.net_book_value && (
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Net Book Value</Text>
                                    <Text className="text-gray-900 font-medium">
                                        ${asset.net_book_value.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            
                            {asset.purchase_date && (
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Purchase Date</Text>
                                    <Text className="text-gray-900 font-medium">
                                        {new Date(asset.purchase_date).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Audit Information */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Audit Information</Text>
                    
                    <View className="space-y-4">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Audit Priority</Text>
                            <Text className="text-gray-900 font-medium">{asset.audit_priority}</Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Data Version</Text>
                            <Text className="text-gray-900 font-medium">{asset.data_version}</Text>
                        </View>
                        
                        {asset.last_sync_date && (
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Last Sync</Text>
                                <Text className="text-gray-900 font-medium">
                                    {new Date(asset.last_sync_date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
} 