import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ProtectedRoute } from '../lib/core/components/ProtectedRoute';
import { DatabaseConstants } from '../lib/core/constants/database_constants';
import { DatabaseHelper } from '../lib/core/database/database_helper';
import { AssetService } from '../lib/core/services/asset_service';
import { AuditService } from '../lib/core/services/audit_service';
import { SimpleAuditService } from '../lib/core/services/simple_audit_service';

export default function StartAuditScreen() {
    const params = useLocalSearchParams();
    const [formData, setFormData] = useState({
        assetExists: true,
        correctLocation: true,
        notes: '',
        location: '',
        condition: 'GOOD',
        recommendedActions: '',
    });
    const [assetCode, setAssetCode] = useState(params.assetCode as string || '');
    const [assetName, setAssetName] = useState(params.assetName as string || '');
    const [auditService] = useState(new AuditService());
    const [assetService] = useState(new AssetService());
    const [simpleAuditService] = useState(new SimpleAuditService());
    const [isAssetAlreadyAudited, setIsAssetAlreadyAudited] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    // Add useEffect to automatically populate asset information when screen loads
    useEffect(() => {
        if (assetCode) {
            populateAssetInformation(assetCode);
        }
    }, [assetCode]);

    const populateAssetInformation = async (code: string) => {
        if (code.trim()) {
            try {
                const asset = await findAssetByCode(code.trim());
                if (asset) {
                    // Populate asset information
                    setAssetName(asset.description || '');
                    setSelectedAsset(asset);
                    
                    // Pre-fill location with asset's current location
                    if (asset.current_location_name) {
                        updateFormData('location', asset.current_location_name);
                    }
                    
                    // Check if asset is already audited
                    const result = await simpleAuditService.isAssetAudited(asset.asset_id);
                    if (result.success && result.data) {
                        setIsAssetAlreadyAudited(result.data.isAudited);
                        
                        // If already audited, show alert and disable form
                        if (result.data.isAudited) {
                            Alert.alert(
                                'Asset Already Audited',
                                `Asset "${code.trim()}" has already been audited. Each asset can only be audited once.`,
                                [{ text: 'OK' }]
                            );
                        }
                    }
                } else {
                    // Asset not found in system
                    setSelectedAsset(null);
                    setIsAssetAlreadyAudited(false);
                }
            } catch (error) {
                console.error('Error populating asset information:', error);
            }
        }
    };


    const handleBack = () => {
        router.back();
    };

    const checkAssetAuditStatus = async (code: string) => {
        if (code.trim()) {
            try {
                // Check if asset exists and get its details
                const asset = await findAssetByCode(code.trim());
                if (asset) {
                    setAssetName(asset.description || '');
                    setSelectedAsset(asset);
                    
                    // Pre-fill location with asset's current location
                    if (asset.current_location_name) {
                        updateFormData('location', asset.current_location_name);
                    }
                    
                    // Check if asset is already audited using simple audit service
                    const result = await simpleAuditService.isAssetAudited(asset.asset_id);
                    if (result.success && result.data) {
                        setIsAssetAlreadyAudited(result.data.isAudited);
                        
                        // If already audited, show alert
                        if (result.data.isAudited) {
                            Alert.alert(
                                'Asset Already Audited',
                                `Asset "${code.trim()}" has already been audited. Each asset can only be audited once.`,
                                [{ text: 'OK' }]
                            );
                        }
                    }
                } else {
                    // If asset not found, check by asset code (for new discoveries)
                    const result = await auditService.isAssetCodeAlreadyAudited(code.trim());
                    if (result.success && result.data) {
                        setIsAssetAlreadyAudited(result.data.isAudited);
                    }
                    setSelectedAsset(null);
                }
            } catch (error) {
                console.error('Error checking audit status:', error);
            }
        } else {
            setIsAssetAlreadyAudited(false);
            setSelectedAsset(null);
        }
    };

    const findAssetByCode = async (code: string) => {
        if (code.trim()) {
            try {
                const result = await assetService.searchByAssetCode(code.trim());
                if (result.success && result.assets && result.assets.length > 0) {
                    setSelectedAsset(result.assets[0]);
                    return result.assets[0];
                }
            } catch (error) {
                console.error('Error finding asset:', error);
            }
        }
        return null;
    };

    const handleSubmit = async () => {
        // Check if asset is already audited
        if (assetCode.trim()) {
            try {
                // First check if asset exists in system
                const asset = await findAssetByCode(assetCode.trim());
                if (asset) {
                    // Check by unique asset_id using simple audit service
                    const result = await simpleAuditService.isAssetAudited(asset.asset_id);
                    if (result.success && result.data && result.data.isAudited) {
                        Alert.alert(
                            'Asset Already Audited',
                            `Asset "${assetCode.trim()}" has already been audited. Each asset can only be audited once.`,
                            [{ text: 'OK' }]
                        );
                        return;
                    }
                } else {
                    // Check by asset code for new discoveries
                    const result = await auditService.isAssetCodeAlreadyAudited(assetCode.trim());
                    if (result.success && result.data && result.data.isAudited) {
                        Alert.alert(
                            'Asset Already Audited',
                            `Asset code "${assetCode.trim()}" has already been audited. Each asset can only be audited once.`,
                            [{ text: 'OK' }]
                        );
                        return;
                    }
                }
            } catch (error) {
                console.error('Error checking audit status:', error);
            }
        }
        
        submitAudit();
    };

    const submitAudit = async () => {
        // Validate required fields
        if (!formData.location.trim()) {
            Alert.alert('Error', 'Please enter the current location');
            return;
        }

        if (!assetCode.trim()) {
            Alert.alert('Error', 'Please enter the asset code');
            return;
        }

        // Find the actual asset by code
        const asset = await findAssetByCode(assetCode.trim());
        if (!asset) {
            // Allow auditing as new discovery
            Alert.alert(
                'Asset Not Found',
                `Asset with code "${assetCode.trim()}" not found in the system. You can still audit it as a new discovery.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue as New Discovery', onPress: () => submitAuditWithNewAsset() }
                ]
            );
            return;
        }

        // Show confirmation
        Alert.alert(
            'Confirm Audit',
            'Are you sure you want to submit this audit?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Submit',
                    onPress: async () => {
                        try {
                            // Create audit finding data
                            const auditFindingData = {
                                offline_record_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                audit_session_id: 1, // Default session ID
                                asset_id: asset.asset_id, // Use the actual asset ID (unique identifier)
                                audited_by: 'Current User', // TODO: Get from auth
                                audited_date: new Date().toISOString(),
                                audit_location: formData.location,
                                asset_found: formData.assetExists,
                                physical_asset_code: assetCode,
                
                                physical_tag_number: undefined,
                                physical_serial_number: undefined,
                                physical_condition: formData.condition,
                                actual_location_description: formData.location,
                                actual_custodian_name: undefined,
                                recommended_condition: formData.condition,
                                has_discrepancies: false,
                                discrepancy_types: '',
                                auditor_notes: formData.notes,
                                recommended_actions: formData.recommendedActions,
                                sync_status: 'PENDING' as const,
                                record_version: 1,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            };

                            // Use simple audit service to create audit
                            const result = await simpleAuditService.createAudit(
                                asset.asset_id,
                                assetCode,
                                formData.location,
                                formData.notes
                            );

                            if (!result.success) {
                                throw new Error(result.error || 'Failed to save audit finding');
                            }

                            console.log('Audit finding saved successfully:', auditFindingData);
                            console.log('Asset being audited:', {
                                assetCode: assetCode,
                                assetId: asset.asset_id,
                                assetDescription: asset.description,
                                auditFindingData: auditFindingData
                            });
                            
                            Alert.alert(
                                'Success',
                                'Audit submitted successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.push('/dashboard'),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Error submitting audit:', error);
                            Alert.alert('Error', 'Failed to submit audit. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const submitAuditWithNewAsset = async () => {
        // Show confirmation for new discovery
        Alert.alert(
            'Confirm New Discovery Audit',
            'Are you sure you want to submit this audit as a new discovery?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Submit',
                    onPress: async () => {
                        try {
                            // Create audit finding data for new discovery
                            const auditFindingData = {
                                offline_record_id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                audit_session_id: 1, // Default session ID
                                asset_id: null, // No asset ID for new discovery
                                audited_by: 'Current User', // TODO: Get from auth
                                audited_date: new Date().toISOString(),
                                audit_location: formData.location,
                                asset_found: formData.assetExists,
                                physical_asset_code: assetCode,
                                physical_tag_number: undefined,
                                physical_serial_number: undefined,
                                physical_condition: formData.condition,
                                actual_location_description: formData.location,
                                actual_custodian_name: undefined,
                                recommended_condition: formData.condition,
                                has_discrepancies: true, // New discovery is considered a discrepancy
                                discrepancy_types: 'UNEXPECTED_ASSET',
                                auditor_notes: formData.notes,
                                recommended_actions: formData.recommendedActions,
                                sync_status: 'PENDING' as const,
                                record_version: 1,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            };

                            // Save to database using DatabaseHelper
                            const dbHelper = DatabaseHelper.getInstance();
                            const result = await dbHelper.execute(
                                `INSERT INTO ${DatabaseConstants.auditFindingTable} (
                                    offline_record_id, audit_session_id, asset_id, audited_by, 
                                    audited_date, audit_location, asset_found, physical_asset_code,
                                    physical_tag_number, physical_serial_number,
                                    physical_condition, actual_location_description, actual_custodian_name,
                                    recommended_condition, has_discrepancies, discrepancy_types,
                                    auditor_notes, recommended_actions, sync_status, record_version,
                                    created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    auditFindingData.offline_record_id,
                                    auditFindingData.audit_session_id,
                                    auditFindingData.asset_id,
                                    auditFindingData.audited_by,
                                    auditFindingData.audited_date,
                                    auditFindingData.audit_location,
                                    auditFindingData.asset_found ? 1 : 0,
                                    auditFindingData.physical_asset_code,
                                    auditFindingData.physical_tag_number,
                                    auditFindingData.physical_serial_number,
                                    auditFindingData.physical_condition,
                                    auditFindingData.actual_location_description,
                                    auditFindingData.actual_custodian_name,
                                    auditFindingData.recommended_condition,
                                    auditFindingData.has_discrepancies ? 1 : 0,
                                    auditFindingData.discrepancy_types,
                                    auditFindingData.auditor_notes,
                                    auditFindingData.recommended_actions,
                                    auditFindingData.sync_status,
                                    auditFindingData.record_version,
                                    auditFindingData.created_at,
                                    auditFindingData.updated_at,
                                ]
                            );

                            if (!result.success) {
                                throw new Error(result.error || 'Failed to save audit finding');
                            }

                            console.log('New discovery audit finding saved successfully:', auditFindingData);
                            console.log('New discovery being audited:', {
                                assetCode: assetCode,
                                assetId: null,
                                isNewDiscovery: true
                            });
                            
                            Alert.alert(
                                'Success',
                                'New discovery audit submitted successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => router.back(),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Error submitting new discovery audit:', error);
                            Alert.alert('Error', 'Failed to submit audit. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <ProtectedRoute>
            <View className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

                {/* Header */}
                <LinearGradient
                    colors={['#009688', '#00796B']}
                    className="pt-12 pb-6 px-6"
                >
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                            onPress={handleBack}
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>

                        <Text className="text-white text-lg font-semibold">
                            {assetCode ? `Audit: ${assetCode}` : 'Start New Audit'}
                        </Text>

                        <View className="w-10" />
                    </View>
                </LinearGradient>

                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView className="flex-1 px-6 py-6">
                        {/* Already Audited Warning */}
                        {isAssetAlreadyAudited && assetCode.trim() && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <View className="flex-row items-center">
                                    <Ionicons name="warning" size={24} color="#DC2626" />
                                    <Text className="text-red-800 text-lg font-bold ml-2">
                                        Asset Already Audited
                                    </Text>
                                </View>
                                <Text className="text-red-700 mt-2">
                                    Asset "{assetCode.trim()}" has already been audited and cannot be audited again. 
                                    All form fields have been disabled.
                                </Text>
                            </View>
                        )}
                        
                        {/* Asset Information */}
                        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Asset Information</Text>
                            
                            {/* Asset Selection Info */}
                            {params.assetCode && (
                                <View className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Text className="text-blue-800 text-sm font-medium">
                                        📱 Asset Selected from List
                                    </Text>
                                    <Text className="text-blue-700 text-sm mt-1">
                                        Asset code "{params.assetCode}" was selected from the assets list.
                                    </Text>
                                </View>
                            )}
                            
                            <View className="space-y-4">
                                {/* Asset Code */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">Asset Code *</Text>
                                    <TextInput
                                        className={`border rounded-lg px-4 py-3 text-gray-900 ${
                                            isAssetAlreadyAudited 
                                                ? 'bg-red-50 border-red-300' 
                                                : selectedAsset 
                                                    ? 'bg-green-50 border-green-300' 
                                                    : 'bg-gray-50 border-gray-200'
                                        }`}
                                        placeholder="Enter asset code (e.g., LAPTOP-001)"
                                        value={assetCode}
                                        onChangeText={(text) => {
                                            setAssetCode(text);
                                            checkAssetAuditStatus(text);
                                        }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isAssetAlreadyAudited}
                                    />
                                    
                                    {/* Asset Status Feedback */}
                                    {selectedAsset && assetCode.trim() && !isAssetAlreadyAudited && (
                                        <View className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <Text className="text-green-800 text-sm font-medium">
                                                ✓ Asset Found
                                            </Text>
                                            <Text className="text-green-700 text-sm mt-1">
                                                {selectedAsset.description || 'No description'}
                                            </Text>
                                            {selectedAsset.current_location_name && (
                                                <Text className="text-green-600 text-sm mt-1">
                                                    📍 Current Location: {selectedAsset.current_location_name}
                                                </Text>
                                            )}
                                            {selectedAsset.category_name && (
                                                <Text className="text-green-600 text-sm mt-1">
                                                    📂 Category: {selectedAsset.category_name}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                    
                                    {!selectedAsset && assetCode.trim() && !isAssetAlreadyAudited && (
                                        <View className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <Text className="text-yellow-800 text-sm font-medium">
                                                ⚠️ Asset Not Found in System
                                            </Text>
                                            <Text className="text-yellow-700 text-sm mt-1">
                                                You can still audit it as a new discovery.
                                            </Text>
                                        </View>
                                    )}
                                    
                                    {isAssetAlreadyAudited && assetCode.trim() && (
                                        <View className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <Text className="text-red-800 text-sm font-medium">
                                                🚫 Asset Already Audited
                                            </Text>
                                            <Text className="text-red-700 text-sm mt-1">
                                                This asset code has already been audited. Each asset can only be audited once.
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Asset Name */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">Asset Name</Text>
                                    <TextInput
                                        className={`border rounded-lg px-4 py-3 text-gray-900 ${
                                            isAssetAlreadyAudited 
                                                ? 'bg-red-50 border-red-300' 
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                        placeholder="Enter asset name or description"
                                        value={assetName}
                                        onChangeText={setAssetName}
                                        editable={!isAssetAlreadyAudited}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Existence Confirmation */}
                        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Asset Verification</Text>
                            
                            <View className="space-y-4">
                                {/* Asset Exists */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-3">
                                        Does the asset exist and is accessible?
                                    </Text>
                                    <View className="flex-row space-x-3">
                                        <TouchableOpacity
                                            className={`flex-1 py-3 rounded-lg border-2 ${
                                                formData.assetExists
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                            onPress={() => updateFormData('assetExists', true)}
                                            disabled={isAssetAlreadyAudited}
                                        >
                                            <Text className={`text-center font-medium ${
                                                formData.assetExists ? 'text-green-700' : 'text-gray-600'
                                            }`}>
                                                ✓ Yes, Found
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className={`flex-1 py-3 rounded-lg border-2 ${
                                                !formData.assetExists
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                            onPress={() => updateFormData('assetExists', false)}
                                            disabled={isAssetAlreadyAudited}
                                        >
                                            <Text className={`text-center font-medium ${
                                                !formData.assetExists ? 'text-red-700' : 'text-gray-600'
                                            }`}>
                                                ✗ Not Found
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Location Verification */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-3">
                                        Is the asset in the correct location?
                                    </Text>
                                    <View className="flex-row space-x-3">
                                        <TouchableOpacity
                                            className={`flex-1 py-3 rounded-lg border-2 ${
                                                formData.correctLocation
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                            onPress={() => updateFormData('correctLocation', true)}
                                            disabled={isAssetAlreadyAudited}
                                        >
                                            <Text className={`text-center font-medium ${
                                                formData.correctLocation ? 'text-green-700' : 'text-gray-600'
                                            }`}>
                                                ✓ Correct Location
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className={`flex-1 py-3 rounded-lg border-2 ${
                                                !formData.correctLocation
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                            onPress={() => updateFormData('correctLocation', false)}
                                            disabled={isAssetAlreadyAudited}
                                        >
                                            <Text className={`text-center font-medium ${
                                                !formData.correctLocation ? 'text-orange-700' : 'text-gray-600'
                                            }`}>
                                                ⚠ Wrong Location
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Current Location */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">
                                        Current Location *
                                    </Text>
                                    <TextInput
                                        className={`border rounded-lg px-4 py-3 text-gray-900 ${
                                            isAssetAlreadyAudited 
                                                ? 'bg-red-50 border-red-300' 
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                        placeholder="Enter current location (e.g., Room 101, Building A)"
                                        value={formData.location}
                                        onChangeText={(text) => updateFormData('location', text)}
                                        editable={!isAssetAlreadyAudited}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Asset Condition */}
                        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Asset Condition</Text>
                            
                            <View className="space-y-4">
                                {/* Asset Condition */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">Asset Condition</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {[
                                            { value: 'EXCELLENT', label: 'Excellent', color: 'bg-green-100 text-green-800' },
                                            { value: 'GOOD', label: 'Good', color: 'bg-blue-100 text-blue-800' },
                                            { value: 'FAIR', label: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
                                            { value: 'POOR', label: 'Poor', color: 'bg-red-100 text-red-800' },
                                            { value: 'DAMAGED', label: 'Damaged', color: 'bg-red-100 text-red-800' },
                                        ].map((condition) => (
                                            <TouchableOpacity
                                                key={condition.value}
                                                className={`px-4 py-2 rounded-lg border-2 ${
                                                    formData.condition === condition.value
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                                onPress={() => updateFormData('condition', condition.value)}
                                                disabled={isAssetAlreadyAudited}
                                            >
                                                <Text className={`font-medium ${
                                                    formData.condition === condition.value ? 'text-green-700' : 'text-gray-600'
                                                }`}>
                                                    {condition.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Recommended Actions */}
                        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Recommended Actions</Text>
                            
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</Text>
                                <TextInput
                                    className={`border rounded-lg px-4 py-3 text-gray-900 ${
                                        isAssetAlreadyAudited 
                                            ? 'bg-red-50 border-red-300' 
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                    placeholder="Enter recommended actions (optional)"
                                    value={formData.recommendedActions}
                                    onChangeText={(text) => updateFormData('recommendedActions', text)}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    editable={!isAssetAlreadyAudited}
                                />
                            </View>
                        </View>

                        {/* Notes */}
                        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                            <Text className="text-lg font-bold text-gray-800 mb-4">Additional Notes</Text>
                            
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-2">Notes & Observations</Text>
                                <TextInput
                                    className={`border rounded-lg px-4 py-3 text-gray-900 min-h-[100] ${
                                        isAssetAlreadyAudited 
                                            ? 'bg-red-50 border-red-300' 
                                            : 'bg-gray-50 border-gray-200'
                                    }`}
                                    placeholder="Enter any additional notes, observations, or issues found during the audit..."
                                    value={formData.notes}
                                    onChangeText={(text) => updateFormData('notes', text)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!isAssetAlreadyAudited}
                                />
                            </View>
                        </View>

                        {/* Submit Button */}
                        <View className="mb-8">
                            <TouchableOpacity
                                className={`w-full py-4 rounded-xl shadow-lg ${
                                    isAssetAlreadyAudited 
                                        ? 'bg-gray-400' 
                                        : 'bg-gradient-to-r from-teal-500 to-teal-600'
                                }`}
                                onPress={handleSubmit}
                                disabled={isAssetAlreadyAudited}
                            >
                                <Text className="text-white text-center font-bold text-lg">
                                    {isAssetAlreadyAudited ? 'Asset Already Audited' : 'Submit Audit'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ProtectedRoute>
    );
} 