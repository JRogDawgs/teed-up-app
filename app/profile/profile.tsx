import { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getCurrentUser } from '../../lib/auth';
import { User } from '../../types/user';
import { router } from 'expo-router';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00471B" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-600 mb-4">Please log in to view your profile</Text>
        <TouchableOpacity
          className="bg-masters-green px-6 py-3 rounded-lg"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="items-center mb-6">
        {user.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            className="w-24 h-24 rounded-full mb-4"
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 mb-4 items-center justify-center">
            <Text className="text-3xl text-gray-500">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
        <Text className="text-gray-500">{user.email}</Text>
      </View>

      <View className="space-y-4">
        {user.handicap && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-600">Handicap</Text>
            <Text className="text-xl font-semibold">{user.handicap}</Text>
          </View>
        )}

        {user.favoriteCourse && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-600">Favorite Course</Text>
            <Text className="text-xl font-semibold">{user.favoriteCourse}</Text>
          </View>
        )}

        {user.bio && (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-600">Bio</Text>
            <Text className="text-gray-800">{user.bio}</Text>
          </View>
        )}

        <TouchableOpacity
          className="bg-masters-green p-4 rounded-lg mt-4"
          onPress={() => router.push('/profile/edit-profile')}
        >
          <Text className="text-white text-center font-semibold">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 