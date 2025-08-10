import { useAuth } from '@/lib/core/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  const handleGetStarted = () => {
    router.push('/login');
  };

  // Don't render anything while checking auth status
  if (isLoading) {
    return null;
  }

  // Don't render if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Background decoration */}
      <View className="absolute top-0 right-0">
        <View 
          className="w-40 h-40 rounded-full opacity-10"
          style={{ 
            backgroundColor: '#009688',
            transform: [{ translateX: 20 }, { translateY: -20 }],
          }}
        />
      </View>

      <View className="absolute bottom-20 left-0">
        <View 
          className="w-32 h-32 rounded-full opacity-10"
          style={{ 
            backgroundColor: '#2196f3',
            transform: [{ translateX: -20 }, { translateY: 20 }],
          }}
        />
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        {/* Illustration */}
        <View className="items-center mb-12">
          <View className="flex-row items-center justify-center mb-6">
            {/* Smartphone */}
            <View className="bg-white border-2 border-gray-300 rounded-lg p-2 mr-4">
              <View className="w-12 h-16 bg-gray-100 rounded-md">
                <View className="p-1 space-y-1">
                  <View className="h-1 bg-gray-400 rounded" />
                  <View className="h-1 bg-gray-400 rounded" />
                  <View className="h-1 bg-gray-400 rounded" />
                </View>
              </View>
            </View>

            {/* Person */}
            <View className="items-center">
              {/* Head */}
              <View className="w-12 h-12 bg-gray-800 rounded-full mb-2" />
              {/* Body */}
              <View className="w-16 h-20 bg-blue-600 rounded-t-2xl" />
              {/* Arms */}
              <View className="absolute top-6 left-2 w-2 h-6 bg-blue-600 rounded-full" style={{ transform: [{ rotate: '-20deg' }] }} />
              <View className="absolute top-6 right-2 w-2 h-6 bg-blue-600 rounded-full" style={{ transform: [{ rotate: '20deg' }] }} />
              {/* Pants */}
              <View className="w-16 h-12 bg-gray-800 rounded-b-2xl" />
            </View>

            {/* Tablet */}
            <View className="bg-white border-2 border-gray-300 rounded-lg p-2 ml-4">
              <View className="w-16 h-12 bg-gray-100 rounded-md">
                <View className="p-1 space-y-1">
                  <View className="h-1 bg-gray-400 rounded" />
                  <View className="h-1 bg-gray-400 rounded" />
                  <View className="h-1 bg-gray-400 rounded" />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Welcome text */}
        <Text className="text-4xl font-bold text-gray-900 text-center mb-4">
          Asset Management
        </Text>
        <Text className="text-xl text-gray-600 text-center mb-8 leading-relaxed">
          Professional audit system for managing and tracking assets with precision and efficiency
        </Text>

        {/* Get Started button */}
        <TouchableOpacity
          className="w-full py-4 rounded-xl shadow-lg active:opacity-90"
          style={{ backgroundColor: '#009688' }}
          onPress={handleGetStarted}
        >
          <Text className="text-white text-center font-bold text-lg">
            Get Started
          </Text>
        </TouchableOpacity>

        {/* Features */}
        <View className="mt-12 w-full">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
            <Text className="text-gray-700 text-base">Real-time asset tracking</Text>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
            <Text className="text-gray-700 text-base">Professional audit workflows</Text>
          </View>
          
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
            <Text className="text-gray-700 text-base">Offline-first design</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Ionicons name="checkmark" size={20} color="#10B981" />
            </View>
            <Text className="text-gray-700 text-base">Secure data synchronization</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


