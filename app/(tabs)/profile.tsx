import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../_layout';
import { signOut } from '../../lib/auth';

export default function Profile() {
  const router = useRouter();
  const { user } = React.useContext(AuthContext);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null; // This should never happen due to auth protection
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white p-6 items-center border-b border-gray-200">
        {user.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            className="w-24 h-24 rounded-full mb-4"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
            <Ionicons name="person" size={48} color="#9CA3AF" />
          </View>
        )}
        <Text className="text-xl font-semibold text-gray-900">
          {user.displayName}
        </Text>
        <Text className="text-gray-500">{user.email}</Text>
      </View>

      {/* Settings List */}
      <View className="p-4">
        <TouchableOpacity
          className="flex-row items-center bg-white p-4 rounded-lg mb-4"
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#6B7280" />
          <Text className="text-gray-900 ml-3">Settings</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#9CA3AF"
            className="ml-auto"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white p-4 rounded-lg mb-4"
          onPress={() => router.push('/help')}
        >
          <Ionicons name="help-circle-outline" size={24} color="#6B7280" />
          <Text className="text-gray-900 ml-3">Help & Support</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color="#9CA3AF"
            className="ml-auto"
          />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white p-4 rounded-lg"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 ml-3">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View className="p-4 mt-auto">
        <Text className="text-center text-gray-500 text-sm">
          Tee'd Up v1.0.0
        </Text>
      </View>
    </View>
  );
} 