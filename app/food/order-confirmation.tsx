import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OrderConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderType = params.type as 'pickup' | 'grabngo';
  const orderNumber = params.orderId as string;

  const getEstimatedTime = () => {
    // TODO: Calculate based on order items and current kitchen load
    return '10-15 minutes';
  };

  const getPickupInstructions = () => {
    if (orderType === 'pickup') {
      return 'Please pick up your order at the bar.';
    }
    return 'Your order will be delivered between holes 9 & 10.';
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-800 p-4">
        <Text className="text-2xl font-bold text-white text-center">Order Confirmed!</Text>
      </View>

      {/* Order Details */}
      <View className="p-6">
        <View className="bg-gray-800 rounded-lg p-6 mb-6">
          <Text className="text-white text-xl font-semibold mb-4">Order Details</Text>
          
          <View className="mb-4">
            <Text className="text-gray-400">Order Number</Text>
            <Text className="text-white text-lg">{orderNumber}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400">Pickup Method</Text>
            <Text className="text-white text-lg capitalize">
              {orderType === 'pickup' ? 'Pick Up at Bar' : 'Grab & Go'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-400">Estimated Time</Text>
            <Text className="text-white text-lg">{getEstimatedTime()}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-400">Instructions</Text>
            <Text className="text-white text-lg">{getPickupInstructions()}</Text>
          </View>

          {/* Track Order Button */}
          <TouchableOpacity
            className="bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
            onPress={() => router.push({
              pathname: '/food/order-status',
              params: { type: orderType, orderId: orderNumber }
            })}
          >
            <Ionicons name="time-outline" size={24} color="white" />
            <Text className="text-white text-center font-semibold text-lg ml-2">
              Track My Order
            </Text>
          </TouchableOpacity>
        </View>

        {/* Return to Game Button */}
        <TouchableOpacity
          className="bg-gray-700 py-4 rounded-lg"
          onPress={() => router.push('/games/game-session')}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Return to Game
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 