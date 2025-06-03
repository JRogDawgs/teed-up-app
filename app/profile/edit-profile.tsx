import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser, updateUser } from '../../lib/auth';
import { User } from '../../types/user';

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handicap, setHandicap] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setHandicap(currentUser?.handicap?.toString() || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !handicap.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const handicapNum = parseFloat(handicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      Alert.alert('Error', 'Please enter a valid handicap (0-54)');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        ...user,
        name: name.trim(),
        email: email.trim(),
        handicap: handicapNum,
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-800 p-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold flex-1 text-center mr-4">
          Edit Profile
        </Text>
      </View>

      {/* Profile Picture */}
      <View className="items-center p-6">
        <Image
          source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/150' }}
          className="w-32 h-32 rounded-full"
        />
        <TouchableOpacity
          className="bg-green-600 px-4 py-2 rounded-lg mt-4"
          onPress={() => {
            // TODO: Implement image picker
            Alert.alert('Coming Soon', 'Profile picture upload will be available soon!');
          }}
        >
          <Text className="text-white font-semibold">Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View className="p-4 space-y-4">
        {/* Name */}
        <View>
          <Text className="text-gray-400 mb-2">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-gray-800 text-white p-4 rounded-lg"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Email */}
        <View>
          <Text className="text-gray-400 mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            className="bg-gray-800 text-white p-4 rounded-lg"
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Handicap */}
        <View>
          <Text className="text-gray-400 mb-2">Handicap</Text>
          <TextInput
            value={handicap}
            onChangeText={setHandicap}
            className="bg-gray-800 text-white p-4 rounded-lg"
            placeholder="Enter your handicap"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className={`bg-green-600 p-4 rounded-lg mt-6 ${saving ? 'opacity-50' : ''}`}
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 