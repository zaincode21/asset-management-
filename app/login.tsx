import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check credentials
      if (email === 'serge@gmail.com' && password === '123456') {
        // Successful login - navigate directly
        router.push('/dashboard');
      } else {
        Alert.alert('Error', 'Invalid email or password. Please use:\nEmail: serge@gmail.com\nPassword: 123456');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Top-left teal cloud decoration */}
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

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View className="flex-row items-center p-6">
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View className="flex-1 px-8 justify-center">
            {/* Welcome Text */}
            <Text className="text-3xl font-bold text-gray-800 text-center mb-8">
              Welcome Back!
            </Text>

            {/* Illustration */}
            <View className="items-center mb-12">
              <View className="flex-row items-center justify-center">
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

            {/* Input Fields */}
            <View className="space-y-5 mb-8">
              {/* Email Input */}
              <View className="relative">
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View className="relative">
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-800 shadow-sm pr-12"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end mb-8">
              <Text className="text-blue-600 font-medium">forgot password</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`w-full py-4 rounded-xl shadow-lg ${isLoading ? 'opacity-70' : 'active:opacity-90'}`}
              style={{ backgroundColor: '#009688' }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isLoading ? 'Signing In...' : 'Login'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity>
                <Text className="text-blue-600 font-bold">Sign up.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
} 




