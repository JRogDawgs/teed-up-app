import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MenuItem } from '../../lib/menu';
import { createOrder, sendOrderToBar } from '../../lib/printer';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function FoodCart() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'grabngo'>('pickup');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Check if we're reordering
    if (params.isReordering === 'true' && params.items) {
      try {
        const items = JSON.parse(params.items as string);
        setCart(items);
        if (params.orderType) {
          setOrderType(params.orderType as 'pickup' | 'grabngo');
        }
      } catch (error) {
        console.error('Error parsing reorder items:', error);
      }
    }

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    try {
      const order = createOrder(
        cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        'Test Player', // TODO: Get from auth context
        7 // TODO: Get current hole from game context
      );

      const success = await sendOrderToBar(order, orderType);
      if (success) {
        router.push({
          pathname: '/food/order-confirmation',
          params: {
            type: orderType,
            orderId: order.id,
            items: JSON.stringify(cart)
          }
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <Animated.View 
      className="flex-1 bg-gray-900"
      style={{ opacity: fadeAnim }}
    >
      {/* Header */}
      <View className="bg-green-800 p-4">
        <Text className="text-2xl font-bold text-white text-center">
          {params.isReordering === 'true' ? 'Review Reorder' : 'Review Order'}
        </Text>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 p-4">
        {cart.map(item => (
          <View
            key={item.id}
            className="bg-gray-800 rounded-lg p-4 mb-4"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-400 mt-1">${item.price.toFixed(2)} each</Text>
              </View>
              <TouchableOpacity
                className="bg-red-600 px-3 py-1 rounded-full"
                onPress={() => removeItem(item.id)}
              >
                <Text className="text-white">Remove</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-3">
              <TouchableOpacity
                className="bg-gray-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text className="text-white text-xl">-</Text>
              </TouchableOpacity>
              <Text className="text-white text-lg mx-4">{item.quantity}</Text>
              <TouchableOpacity
                className="bg-gray-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Text className="text-white text-xl">+</Text>
              </TouchableOpacity>
              <Text className="text-green-400 ml-auto">
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Order Type Selection */}
      <View className="bg-gray-800 p-4 border-t border-gray-700">
        <Text className="text-white text-lg font-semibold mb-4">Pickup Method</Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              orderType === 'pickup' ? 'bg-green-600' : 'bg-gray-700'
            }`}
            onPress={() => setOrderType('pickup')}
          >
            <Text className="text-white text-center font-semibold">Pick Up at Bar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              orderType === 'grabngo' ? 'bg-green-600' : 'bg-gray-700'
            }`}
            onPress={() => setOrderType('grabngo')}
          >
            <Text className="text-white text-center font-semibold">Grab & Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Summary */}
      <View className="bg-gray-800 p-4 border-t border-gray-700">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
          <Text className="text-green-400 text-xl font-semibold">
            ${totalPrice.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-green-600 py-3 rounded-lg"
          onPress={handlePlaceOrder}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
} 