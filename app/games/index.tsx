import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function GamesScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Create Game Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 z-10 bg-green-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/games/create')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <ScrollView className="flex-1 p-4">
        {/* Empty State */}
        <View className="flex-1 items-center justify-center py-12">
          <Ionicons name="golf-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-600 mt-4">
            No Active Games
          </Text>
          <Text className="text-gray-500 text-center mt-2 px-8">
            Create a new game to start keeping score
          </Text>
        </View>
      </ScrollView>
    </View>
  );
} 