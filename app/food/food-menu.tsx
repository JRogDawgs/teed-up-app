import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { menuItems, getMenuItemsByCategory, MenuItem } from '../../lib/menu';
import { getFavorites, toggleFavorite, isFavorite } from '../../lib/favorites';
import { Ionicons } from '@expo/vector-icons';

interface CartItem extends MenuItem {
  quantity: number;
}

type Category = 'food' | 'drink' | 'snack' | 'favorites';

export default function FoodMenu() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('food');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [fadeAnims] = useState(() => 
    menuItems.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    loadFavorites();
    // Animate items in sequence
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  const handleToggleFavorite = async (itemId: string) => {
    const isFav = await toggleFavorite(itemId);
    setFavorites(prev => 
      isFav 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getFilteredItems = () => {
    if (selectedCategory === 'favorites') {
      return menuItems.filter(item => favorites.includes(item.id));
    }
    return getMenuItemsByCategory(selectedCategory as 'food' | 'drink' | 'snack');
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-green-800 p-4">
        <Text className="text-2xl font-bold text-white text-center">Turn Menu</Text>
        <Text className="text-white text-center mt-1">Order now for pickup at the turn</Text>
      </View>

      {/* Category Tabs */}
      <View className="flex-row bg-green-900">
        {(['food', 'drink', 'snack', 'favorites'] as Category[]).map(category => (
          <TouchableOpacity
            key={category}
            className={`flex-1 py-3 ${
              selectedCategory === category ? 'bg-green-700' : 'bg-green-900'
            }`}
            onPress={() => setSelectedCategory(category)}
          >
            <Text className="text-white text-center font-semibold capitalize">
              {category === 'favorites' ? '⭐' : `${category}s`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu Items */}
      <ScrollView className="flex-1 p-4">
        {getFilteredItems().map((item, index) => (
          <Animated.View
            key={item.id}
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
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-400 mt-1">{item.description}</Text>
                <Text className="text-green-400 mt-2">${item.price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                className="ml-4"
                onPress={() => handleToggleFavorite(item.id)}
              >
                <Ionicons
                  name={favorites.includes(item.id) ? 'star' : 'star-outline'}
                  size={24}
                  color={favorites.includes(item.id) ? '#FCD34D' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-green-600 px-4 py-2 rounded-full mt-3 self-end"
              onPress={() => addToCart(item)}
            >
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <View className="bg-gray-800 p-4 border-t border-gray-700">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-lg">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
            </Text>
            <Text className="text-green-400 text-lg">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-green-600 py-3 rounded-lg"
            onPress={() => router.push('/food/food-cart')}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Review Order
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
} 