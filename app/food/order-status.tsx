import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { saveOrder } from '../../lib/order-history';

type OrderStatus = 'received' | 'preparing' | 'ready' | 'enRoute';

interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: string;
  notificationMessage: string;
}

const STATUS_STEPS: StatusStep[] = [
  { 
    status: 'received', 
    label: 'Order Received', 
    icon: 'checkmark-circle',
    notificationMessage: 'Your order has been received!'
  },
  { 
    status: 'preparing', 
    label: 'Preparing', 
    icon: 'restaurant',
    notificationMessage: 'Your order is now being prepared.'
  },
  { 
    status: 'ready', 
    label: 'Ready for Pickup', 
    icon: 'time',
    notificationMessage: 'Your order is ready for pickup!'
  },
  { 
    status: 'enRoute', 
    label: 'En Route', 
    icon: 'car',
    notificationMessage: 'A server is bringing your order out.'
  },
];

export default function OrderStatus() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderType = params.type as 'pickup' | 'grabngo';
  const orderNumber = params.orderId as string;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('received');
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    requestNotificationPermissions();
    setupOrderProgress();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
    }
  };

  const sendNotification = async (message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Order Update',
          body: message,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const setupOrderProgress = () => {
    // Simulate order progress
    const timers = [
      setTimeout(async () => {
        setCurrentStatus('preparing');
        const step = STATUS_STEPS.find(s => s.status === 'preparing');
        if (step) {
          await sendNotification(step.notificationMessage);
        }
      }, 30000),
      setTimeout(async () => {
        const newStatus = orderType === 'pickup' ? 'ready' : 'enRoute';
        setCurrentStatus(newStatus);
        const step = STATUS_STEPS.find(s => s.status === newStatus);
        if (step) {
          await sendNotification(step.notificationMessage);
        }
        // Save completed order to history
        await saveOrder({
          items: orderItems,
          totalPrice: orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
          orderType,
          status: 'completed',
        });
      }, 60000),
    ];

    // Animate progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 60000,
      useNativeDriver: false,
    }).start();

    return () => timers.forEach(clearTimeout);
  };

  const getStatusIndex = (status: OrderStatus) => {
    return STATUS_STEPS.findIndex(step => step.status === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-800 p-4">
        <Text className="text-2xl font-bold text-white text-center">Order Status</Text>
        <Text className="text-white text-center mt-1">#{orderNumber}</Text>
      </View>

      {/* Status Progress */}
      <View className="p-6">
        <View className="bg-gray-800 rounded-lg p-6">
          {/* Progress Bar */}
          <View className="h-2 bg-gray-700 rounded-full mb-8">
            <Animated.View
              className="h-full bg-green-600 rounded-full"
              style={{
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>

          {/* Status Steps */}
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <View
                key={step.status}
                className={`flex-row items-center mb-6 ${
                  index === STATUS_STEPS.length - 1 ? 'mb-0' : ''
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isActive ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={24}
                    color={isActive ? 'white' : '#9CA3AF'}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className={`text-lg font-semibold ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Text className="text-green-400 mt-1">
                      {orderType === 'pickup'
                        ? 'Please pick up at the bar'
                        : 'Will be delivered between holes 9 & 10'}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Return to Game Button */}
        <TouchableOpacity
          className="bg-green-600 py-4 rounded-lg mt-6"
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