import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getOrderHistory, clearOrderHistory, OrderHistoryItem } from '../../lib/order-history';

export default function OrderHistory() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnims = useRef(orders.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Animate items in sequence when orders are loaded
    if (!loading && orders.length > 0) {
      fadeAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [loading, orders]);

  const loadOrders = async () => {
    try {
      const history = await getOrderHistory();
      setOrders(history);
      // Update fadeAnims array when orders change
      fadeAnims.current = history.map(() => new Animated.Value(0));
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Order History',
      'Are you sure you want to clear your order history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearOrderHistory();
              setOrders([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          },
        },
      ]
    );
  };

  const handleOrderAgain = (order: OrderHistoryItem) => {
    // Navigate to cart with pre-filled items
    router.push({
      pathname: '/food/food-cart',
      params: {
        items: JSON.stringify(order.items),
        orderType: order.orderType,
        isReordering: 'true'
      }
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const getItemSummary = (items: OrderHistoryItem['items']) => {
    const summary = items.map(item => `${item.quantity} ${item.name}`).join(', ');
    return summary.length > 50 ? summary.substring(0, 47) + '...' : summary;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-800 p-4">
        <Text className="text-2xl font-bold text-white text-center">Order History</Text>
      </View>

      {/* Order List */}
      <ScrollView className="flex-1 p-4">
        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-400 text-lg">No orders yet</Text>
          </View>
        ) : (
          orders.map((order, index) => (
            <Animated.View
              key={order.id}
              style={{
                opacity: fadeAnims[index],
                transform: [{
                  translateY: fadeAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              }}
              className="bg-gray-800 rounded-lg p-4 mb-4"
            >
              {/* Order Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-lg font-semibold">
                  {formatDate(order.timestamp)}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name={order.orderType === 'pickup' ? 'restaurant' : 'car'}
                    size={20}
                    color="#9CA3AF"
                  />
                  <Text className="text-gray-400 ml-2 capitalize">
                    {order.orderType === 'pickup' ? 'Pick Up' : 'Grab & Go'}
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <Text className="text-gray-400 mb-2">
                {getItemSummary(order.items)}
              </Text>
              <Text className="text-green-400 text-lg font-semibold">
                ${order.totalPrice.toFixed(2)}
              </Text>

              {/* Order Again Button */}
              <TouchableOpacity
                className="bg-green-600 py-2 rounded-lg mt-3"
                onPress={() => handleOrderAgain(order)}
              >
                <Text className="text-white text-center font-semibold">
                  Order Again
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Clear History Button */}
      {orders.length > 0 && (
        <View className="p-4 border-t border-gray-700">
          <TouchableOpacity
            className="bg-red-600 py-3 rounded-lg"
            onPress={handleClearHistory}
          >
            <Text className="text-white text-center font-semibold">
              Clear History
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 