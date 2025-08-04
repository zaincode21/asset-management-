import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AuditPriority } from '../lib/core/constants/database_constants';
import { AssetService } from '../lib/core/services/asset_service';
import { Asset } from '../lib/data/models/asset_model';

export default function CreateAssetScreen() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        asset_code: '',
        barcode: '',
        tag_number: '',
        description: '',
        category_name: '',
        sub_category_name: '',
        brand: '',
        model: '',
        serial_number: '',
        current_location_name: '',
        expected_location_name: '',
        current_department_name: '',
        current_custodian_name: '',
        current_custodian_email: '',
        current_status_name: 'Active',
        current_condition: 'Good',
        asset_cost: '',
        net_book_value: '',
        purchase_date: '',
        audit_priority: AuditPriority.NORMAL,
    });

    const assetService = new AssetService();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        // Validate required fields
        if (!formData.asset_code.trim() || !formData.description.trim()) {
            Alert.alert('Validation Error', 'Asset Code and Description are required fields.');
            return;
        }

        setLoading(true);

        try {
            // Create new asset
            const newAsset = new Asset({
                audit_session_id: 1, // Default session
                asset_id: Date.now(), // Generate unique ID
                asset_code: formData.asset_code.trim(),
                barcode: formData.barcode.trim() || undefined,
                tag_number: formData.tag_number.trim() || undefined,
                description: formData.description.trim(),
                category_name: formData.category_name.trim() || undefined,
                sub_category_name: formData.sub_category_name.trim() || undefined,
                brand: formData.brand.trim() || undefined,
                model: formData.model.trim() || undefined,
                serial_number: formData.serial_number.trim() || undefined,
                current_location_id: 1,
                current_location_name: formData.current_location_name.trim() || undefined,
                expected_location_id: 1,
                expected_location_name: formData.expected_location_name.trim() || undefined,
                current_department_name: formData.current_department_name.trim() || undefined,
                current_custodian_name: formData.current_custodian_name.trim() || undefined,
                current_custodian_email: formData.current_custodian_email.trim() || undefined,
                current_status_name: formData.current_status_name,
                current_condition: formData.current_condition,
                asset_cost: formData.asset_cost ? parseFloat(formData.asset_cost) : undefined,
                net_book_value: formData.net_book_value ? parseFloat(formData.net_book_value) : undefined,
                purchase_date: formData.purchase_date.trim() || undefined,
                assigned_team_id: 1,
                audit_priority: formData.audit_priority,
                data_version: 1,
            });

            const result = await assetService.saveAsset(newAsset);

            if (result.success) {
                Alert.alert(
                    'Success',
                    'Asset created successfully!',
                    [
                        {
                            text: 'View Asset',
                            onPress: () => {
                                router.push(`/asset-details?assetCode=${encodeURIComponent(formData.asset_code)}`);
                            }
                        },
                        {
                            text: 'Create Another',
                            onPress: () => {
                                // Reset form
                                setFormData({
                                    asset_code: '',
                                    barcode: '',
                                    tag_number: '',
                                    description: '',
                                    category_name: '',
                                    sub_category_name: '',
                                    brand: '',
                                    model: '',
                                    serial_number: '',
                                    current_location_name: '',
                                    expected_location_name: '',
                                    current_department_name: '',
                                    current_custodian_name: '',
                                    current_custodian_email: '',
                                    current_status_name: 'Active',
                                    current_condition: 'Good',
                                    asset_cost: '',
                                    net_book_value: '',
                                    purchase_date: '',
                                    audit_priority: AuditPriority.NORMAL,
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to create asset');
            }
        } catch (error) {
            console.error('Error creating asset:', error);
            Alert.alert('Error', 'Failed to create asset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const InputField = ({ 
        label, 
        value, 
        onChangeText, 
        placeholder, 
        required = false,
        keyboardType = 'default',
        multiline = false 
    }: {
        label: string;
        value: string;
        onChangeText: (text: string) => void;
        placeholder: string;
        required?: boolean;
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
        multiline?: boolean;
    }) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
                {label} {required && <Text className="text-red-500">*</Text>}
            </Text>
            <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
            />
        </View>
    );

    const SelectField = ({ 
        label, 
        value, 
        onValueChange, 
        options 
    }: {
        label: string;
        value: string;
        onValueChange: (value: string) => void;
        options: { label: string; value: string }[];
    }) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">{label}</Text>
            <View className="bg-white border border-gray-300 rounded-lg">
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        className={`px-4 py-3 border-b border-gray-200 ${
                            value === option.value ? 'bg-blue-50' : ''
                        }`}
                        onPress={() => onValueChange(option.value)}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text className={`${value === option.value ? 'text-blue-600' : 'text-gray-900'}`}>
                                {option.label}
                            </Text>
                            {value === option.value && (
                                <Ionicons name="checkmark" size={20} color="#2563EB" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

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
                    <Text className="text-white text-lg font-semibold">Create New Asset</Text>
                    <View className="w-10" />
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6 mt-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Basic Information</Text>
                    
                    <InputField
                        label="Asset Code"
                        value={formData.asset_code}
                        onChangeText={(text) => handleInputChange('asset_code', text)}
                        placeholder="Enter asset code (e.g., LAPTOP-001)"
                        required
                    />
                    
                    <InputField
                        label="Barcode"
                        value={formData.barcode}
                        onChangeText={(text) => handleInputChange('barcode', text)}
                        placeholder="Enter barcode (optional)"
                    />
                    
                    <InputField
                        label="Tag Number"
                        value={formData.tag_number}
                        onChangeText={(text) => handleInputChange('tag_number', text)}
                        placeholder="Enter tag number (optional)"
                    />
                    
                    <InputField
                        label="Description"
                        value={formData.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        placeholder="Enter asset description"
                        required
                        multiline
                    />
                </View>

                {/* Hardware Details */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Hardware Details</Text>
                    
                    <InputField
                        label="Category"
                        value={formData.category_name}
                        onChangeText={(text) => handleInputChange('category_name', text)}
                        placeholder="e.g., Computers, Office Equipment"
                    />
                    
                    <InputField
                        label="Sub Category"
                        value={formData.sub_category_name}
                        onChangeText={(text) => handleInputChange('sub_category_name', text)}
                        placeholder="e.g., Laptops, Printers"
                    />
                    
                    <InputField
                        label="Brand"
                        value={formData.brand}
                        onChangeText={(text) => handleInputChange('brand', text)}
                        placeholder="e.g., Dell, HP, Canon"
                    />
                    
                    <InputField
                        label="Model"
                        value={formData.model}
                        onChangeText={(text) => handleInputChange('model', text)}
                        placeholder="e.g., Latitude 5520"
                    />
                    
                    <InputField
                        label="Serial Number"
                        value={formData.serial_number}
                        onChangeText={(text) => handleInputChange('serial_number', text)}
                        placeholder="Enter serial number"
                    />
                </View>

                {/* Location & Custodian */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Location & Custodian</Text>
                    
                    <InputField
                        label="Current Location"
                        value={formData.current_location_name}
                        onChangeText={(text) => handleInputChange('current_location_name', text)}
                        placeholder="e.g., IT Department"
                    />
                    
                    <InputField
                        label="Expected Location"
                        value={formData.expected_location_name}
                        onChangeText={(text) => handleInputChange('expected_location_name', text)}
                        placeholder="e.g., IT Department"
                    />
                    
                    <InputField
                        label="Department"
                        value={formData.current_department_name}
                        onChangeText={(text) => handleInputChange('current_department_name', text)}
                        placeholder="e.g., Information Technology"
                    />
                    
                    <InputField
                        label="Custodian Name"
                        value={formData.current_custodian_name}
                        onChangeText={(text) => handleInputChange('current_custodian_name', text)}
                        placeholder="Enter custodian name"
                    />
                    
                    <InputField
                        label="Custodian Email"
                        value={formData.current_custodian_email}
                        onChangeText={(text) => handleInputChange('current_custodian_email', text)}
                        placeholder="Enter custodian email"
                        keyboardType="email-address"
                    />
                </View>

                {/* Status & Condition */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Status & Condition</Text>
                    
                    <SelectField
                        label="Status"
                        value={formData.current_status_name}
                        onValueChange={(value) => handleInputChange('current_status_name', value)}
                        options={[
                            { label: 'Active', value: 'Active' },
                            { label: 'Inactive', value: 'Inactive' },
                            { label: 'Maintenance', value: 'Maintenance' },
                            { label: 'Retired', value: 'Retired' },
                        ]}
                    />
                    
                    <SelectField
                        label="Condition"
                        value={formData.current_condition}
                        onValueChange={(value) => handleInputChange('current_condition', value)}
                        options={[
                            { label: 'Excellent', value: 'Excellent' },
                            { label: 'Good', value: 'Good' },
                            { label: 'Fair', value: 'Fair' },
                            { label: 'Poor', value: 'Poor' },
                        ]}
                    />
                    
                    <SelectField
                        label="Audit Priority"
                        value={formData.audit_priority}
                        onValueChange={(value) => handleInputChange('audit_priority', value)}
                        options={[
                            { label: 'Low', value: AuditPriority.LOW },
                            { label: 'Normal', value: AuditPriority.NORMAL },
                            { label: 'High', value: AuditPriority.HIGH },
                            { label: 'Critical', value: AuditPriority.CRITICAL },
                        ]}
                    />
                </View>

                {/* Financial Information */}
                <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Financial Information</Text>
                    
                    <InputField
                        label="Asset Cost"
                        value={formData.asset_cost}
                        onChangeText={(text) => handleInputChange('asset_cost', text)}
                        placeholder="Enter asset cost"
                        keyboardType="numeric"
                    />
                    
                    <InputField
                        label="Net Book Value"
                        value={formData.net_book_value}
                        onChangeText={(text) => handleInputChange('net_book_value', text)}
                        placeholder="Enter net book value"
                        keyboardType="numeric"
                    />
                    
                    <InputField
                        label="Purchase Date"
                        value={formData.purchase_date}
                        onChangeText={(text) => handleInputChange('purchase_date', text)}
                        placeholder="YYYY-MM-DD"
                    />
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-4 mb-8">
                    <TouchableOpacity
                        className="flex-1 bg-gray-500 py-4 rounded-xl items-center"
                        onPress={handleBack}
                    >
                        <Text className="text-white font-semibold text-lg">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        className={`flex-1 py-4 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text className="text-white font-semibold text-lg">
                            {loading ? 'Creating...' : 'Create Asset'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
} 