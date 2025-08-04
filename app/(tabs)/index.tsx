import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StatusBar, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Top-left cloud decoration */}
      <View className="absolute top-0 left-0">
        <View 
          className="w-32 h-32 rounded-full opacity-20"
          style={{ 
            backgroundColor: '#009688',
            transform: [{ translateX: -20 }, { translateY: -20 }],
            borderRadius: 100,
          }}
        />
      </View>

      {/* Main content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Illustration */}
        <View className="items-center mb-12">
          <View className="flex-row items-center justify-center mb-8">
            {/* Person */}
            <View className="mr-6">
              <View className="w-16 h-16 bg-blue-500 rounded-full mb-2" />
              <View className="w-12 h-8 bg-gray-800 rounded-full" />
              <View className="w-8 h-12 bg-gray-800 rounded-full mt-1" />
            </View>
            
            {/* Smartphone */}
            <View className="bg-white border-4 border-gray-300 rounded-2xl p-3 shadow-lg">
              <View className="w-24 h-32 bg-gray-100 rounded-lg">
                {/* Todo list items */}
                <View className="p-2 space-y-2">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <View className="w-12 h-2 bg-gray-400 rounded" />
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <View className="w-10 h-2 bg-gray-400 rounded" />
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-gray-300 rounded-full mr-2" />
                    <View className="w-14 h-2 bg-gray-400 rounded" />
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <View className="w-8 h-2 bg-gray-400 rounded" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Text content */}
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Gets things done with Asset Management
          </Text>
          <Text className="text-lg text-gray-600 text-center leading-6">
            Professional asset auditing and management system for enterprise organizations.
          </Text>
        </View>

        {/* Get Started button */}
        <TouchableOpacity
          className="w-full bg-teal-500 py-4 rounded-xl shadow-lg active:opacity-90"
          onPress={handleGetStarted}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


