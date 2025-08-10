import { ProtectedRoute } from '@/lib/core/components/ProtectedRoute';
import { useAuth } from '@/lib/core/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    autoSync: true,
    notifications: true,
    locationServices: true,
    offlineMode: false,
    darkMode: false,
  });
  const { logout } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all local audit data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const settingsItems: SettingsItem[] = [
    {
      id: 'autoSync',
      title: 'Auto Sync',
      subtitle: 'Automatically sync data when online',
      icon: 'cloud-upload-outline',
      type: 'toggle',
      value: settings.autoSync,
      onToggle: (value) => handleToggle('autoSync', value),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Receive push notifications',
      icon: 'notifications-outline',
      type: 'toggle',
      value: settings.notifications,
      onToggle: (value) => handleToggle('notifications', value),
    },
    {
      id: 'locationServices',
      title: 'Location Services',
      subtitle: 'Use GPS for asset location tracking',
      icon: 'location-outline',
      type: 'toggle',
      value: settings.locationServices,
      onToggle: (value) => handleToggle('locationServices', value),
    },
    {
      id: 'offlineMode',
      title: 'Offline Mode',
      subtitle: 'Work without internet connection',
      icon: 'wifi-outline',
      type: 'toggle',
      value: settings.offlineMode,
      onToggle: (value) => handleToggle('offlineMode', value),
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: 'moon-outline',
      type: 'toggle',
      value: settings.darkMode,
      onToggle: (value) => handleToggle('darkMode', value),
    },
    {
      id: 'sync',
      title: 'Sync Data',
      subtitle: 'Manually sync with server',
      icon: 'refresh-outline',
      type: 'action',
              onPress: () => Alert.alert('Sync', 'Sync functionality coming soon'),
    },
    {
      id: 'backup',
      title: 'Backup & Restore',
      subtitle: 'Manage data backup',
      icon: 'cloud-download-outline',
      type: 'navigate',
              onPress: () => Alert.alert('Backup', 'Backup functionality coming soon'),
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      type: 'navigate',
              onPress: () => Alert.alert('About', 'Asset Management System v1.0.0'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      type: 'navigate',
              onPress: () => Alert.alert('Help', 'Help documentation coming soon'),
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      className="bg-white rounded-xl p-4 mb-3 active:opacity-80"
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-4">
            <Ionicons name={item.icon} size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">{item.title}</Text>
            {item.subtitle && (
              <Text className="text-sm text-gray-600">{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
          />
        )}
        
        {item.type === 'navigate' && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
        
        {item.type === 'action' && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
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
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-xl font-bold">Settings</Text>
            
            <View className="w-10" />
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* General Settings */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">General</Text>
            {settingsItems.slice(0, 5).map(renderSettingsItem)}
          </View>

          {/* Data Management */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Data Management</Text>
            {settingsItems.slice(5, 7).map(renderSettingsItem)}
          </View>

          {/* Support */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Support</Text>
            {settingsItems.slice(7, 9).map(renderSettingsItem)}
          </View>

          {/* Danger Zone */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-red-600 mb-4">Danger Zone</Text>
            
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-3 active:opacity-80"
              onPress={handleClearData}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-red-600 mb-1">Clear All Data</Text>
                  <Text className="text-sm text-gray-600">Delete all local audit data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-3 active:opacity-80"
              onPress={handleLogout}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-red-600 mb-1">Logout</Text>
                  <Text className="text-sm text-gray-600">Sign out of your account</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="mb-6">
            <View className="bg-white rounded-xl p-4">
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="cube" size={32} color="#3B82F6" />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-1">Asset Management</Text>
                <Text className="text-sm text-gray-600 mb-2">Professional Audit System</Text>
                <Text className="text-xs text-gray-500">Version 1.0.0</Text>
              </View>
            </View>
          </View>

          {/* Bottom spacing */}
          <View className="h-6" />
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
} 