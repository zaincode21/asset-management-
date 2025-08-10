import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ProtectedRoute } from '../lib/core/components/ProtectedRoute';
import { AssetService } from '../lib/core/services/asset_service';
import { SimpleAuditService } from '../lib/core/services/simple_audit_service';
import { Asset } from '../lib/data/models/asset_model';

export default function AllAssetsScreen() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(false);
    const [assetService] = useState(new AssetService());
    const [simpleAuditService] = useState(new SimpleAuditService());
    const [auditedAssetIds, setAuditedAssetIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadAllAssets();
    }, []);

    const loadAllAssets = async () => {
        try {
            setLoading(true);
            const result = await assetService.getAllAssets();
            if (result.success && result.assets) {
                setAssets(result.assets);
                setFilteredAssets(result.assets);
                
                // Check audit status for all assets
                await checkAuditStatusForAssets(result.assets);
            }
        } catch (error) {
            console.error('Error loading assets:', error);
            Alert.alert('Error', 'Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    const checkAuditStatusForAssets = async (assetList: Asset[]) => {
        try {
            console.log('Checking audit status for', assetList.length, 'assets');
            const auditedIds = new Set<string>();
            
            for (const asset of assetList) {
                console.log('Checking asset:', asset.asset_code, 'ID:', asset.asset_id);
                const result = await simpleAuditService.isAssetAudited(asset.asset_id);
                console.log('Audit result for', asset.asset_code, ':', result);
                
                if (result.success && result.data && result.data.isAudited) {
                    auditedIds.add(asset.asset_id);
                    console.log('Asset', asset.asset_code, 'is audited');
                } else {
                    console.log('Asset', asset.asset_code, 'is NOT audited');
                }
            }
            
            console.log('Total audited assets found:', auditedIds.size);
            console.log('Audited asset IDs:', Array.from(auditedIds));
            setAuditedAssetIds(auditedIds);
        } catch (error) {
            console.error('Error checking audit status:', error);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        applyFilters(text, showOnlyPending);
    };

    const applyFilters = (searchText: string, pendingOnly: boolean) => {
        let filtered = assets;
        
        // Apply search filter
        if (searchText.trim()) {
            filtered = filtered.filter(asset =>
                asset.asset_code.toLowerCase().includes(searchText.toLowerCase()) ||
                asset.description.toLowerCase().includes(searchText.toLowerCase()) ||
                (asset.category_name?.toLowerCase() || '').includes(searchText.toLowerCase())
            );
        }
        
        // Apply audit status filter
        if (pendingOnly) {
            filtered = filtered.filter(asset => !auditedAssetIds.has(asset.asset_id));
        }
        
        setFilteredAssets(filtered);
    };

    const togglePendingFilter = () => {
        const newShowOnlyPending = !showOnlyPending;
        setShowOnlyPending(newShowOnlyPending);
        applyFilters(searchQuery, newShowOnlyPending);
    };

    const handleAssetPress = (asset: Asset) => {
        // Check if asset is already audited
        if (auditedAssetIds.has(asset.asset_id)) {
            Alert.alert(
                'Asset Already Audited',
                `Asset "${asset.asset_code}" has already been audited. Each asset can only be audited once.`,
                [{ text: 'OK' }]
            );
            return;
        }
        
        router.push(`/start-audit?assetCode=${encodeURIComponent(asset.asset_code)}&assetName=${encodeURIComponent(asset.description || '')}`);
    };

    const handleBack = () => {
        router.back();
    };

    const renderAssetItem = ({ item }: { item: Asset }) => {
        const isAudited = auditedAssetIds.has(item.asset_id);
        
        return (
            <TouchableOpacity
                className={`rounded-xl p-4 shadow-sm mb-3 ${
                    isAudited 
                        ? 'bg-gray-100 opacity-60' 
                        : 'bg-white active:opacity-80'
                }`}
                onPress={() => handleAssetPress(item)}
                disabled={isAudited}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <Text className={`text-lg font-semibold ${
                        isAudited ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                        {item.asset_code}
                    </Text>
                    <View className="flex-row items-center space-x-2">
                        {/* Audit Status Badge */}
                        {isAudited && (
                            <View className="px-2 py-1 rounded-full bg-red-100">
                                <Text className="text-xs font-medium text-red-800">
                                    Audited
                                </Text>
                            </View>
                        )}
                        
                        {/* Asset Status Badge */}
                        <View className={`px-2 py-1 rounded-full ${
                            item.current_status_name === 'Active' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            <Text className={`text-xs font-medium ${
                                item.current_status_name === 'Active' ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {item.current_status_name}
                            </Text>
                        </View>
                    </View>
                </View>
                
                <Text className={`mb-2 ${
                    isAudited ? 'text-gray-500' : 'text-gray-700'
                }`}>
                    {item.description}
                </Text>
                
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons 
                            name="location-outline" 
                            size={14} 
                            color={isAudited ? "#9CA3AF" : "#6B7280"} 
                        />
                        <Text className={`text-sm ml-1 ${
                            isAudited ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {item.current_location_name || 'Location not specified'}
                        </Text>
                    </View>
                    <Text className={`text-sm ${
                        isAudited ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        {item.category_name}
                    </Text>
                </View>
                
                {/* Already Audited Warning */}
                {isAudited && (
                    <View className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <Text className="text-red-700 text-xs text-center">
                            🚫 This asset has already been audited and cannot be selected again
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center py-12">
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-gray-500 mt-4 mb-2">
                No assets found
            </Text>
            <Text className="text-gray-400 text-center px-8">
                {searchQuery.trim() 
                    ? 'Try adjusting your search criteria'
                    : 'No assets available'
                }
            </Text>
        </View>
    );

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
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                            onPress={handleBack}
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-white">All Assets</Text>
                        <View className="flex-row items-center space-x-2">
                            <TouchableOpacity
                                className={`px-3 py-2 rounded-lg ${
                                    showOnlyPending ? 'bg-green-500' : 'bg-white/20'
                                }`}
                                onPress={togglePendingFilter}
                            >
                                <Text className={`text-xs font-medium ${
                                    showOnlyPending ? 'text-white' : 'text-white'
                                }`}>
                                    {showOnlyPending ? 'Show All' : 'Pending Only'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-3 py-2 rounded-lg bg-yellow-500"
                                onPress={async () => {
                                    console.log('Debug button pressed');
                                    const debugResult = await simpleAuditService.debugAuditTable();
                                    console.log('Debug result:', debugResult);
                                    Alert.alert('Debug Info', `Audit findings: ${JSON.stringify(debugResult, null, 2)}`);
                                }}
                            >
                                <Text className="text-xs font-medium text-white">
                                    Debug
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                onPress={loadAllAssets}
                            >
                                <Ionicons name="refresh" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="bg-white rounded-xl flex-row items-center px-4 py-3">
                        <Ionicons name="search" size={20} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-900"
                            placeholder="Search assets by code or description..."
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Ionicons name="close-circle" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>

                {/* Results Count and Audit Summary */}
                <View className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm text-gray-600">
                            {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
                            {searchQuery.trim() && ` matching "${searchQuery}"`}
                        </Text>
                        <View className="flex-row items-center space-x-2">
                            <View className="px-2 py-1 rounded-full bg-green-100">
                                <Text className="text-xs font-medium text-green-800">
                                    {filteredAssets.length - auditedAssetIds.size} Pending
                                </Text>
                            </View>
                            <View className="px-2 py-1 rounded-full bg-red-100">
                                <Text className="text-xs font-medium text-red-800">
                                    {auditedAssetIds.size} Audited
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    {/* Progress Bar */}
                    {filteredAssets.length > 0 && (
                        <View className="w-full bg-gray-200 rounded-full h-2">
                            <View 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${(auditedAssetIds.size / filteredAssets.length) * 100}%` 
                                }}
                            />
                        </View>
                    )}
                </View>

                {/* Assets List */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="refresh" size={32} color="#3B82F6" />
                        <Text className="text-gray-600 mt-2">Loading assets...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredAssets}
                        renderItem={renderAssetItem}
                        keyExtractor={(item) => item.asset_id.toString()}
                        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState}
                    />
                )}


            </View>
        </ProtectedRoute>
    );
} 