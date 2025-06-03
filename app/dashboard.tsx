import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../lib/auth';
import { getGameHistory } from '../lib/game-history';
import { getFavorites } from '../lib/favorites';
import { User } from '../types/user';
import { Game } from '../types/game';
import { MenuItem } from '../types/menu';
import { Course } from '../types/game';
import Shimmer from '../components/Shimmer';
import Tooltip from '../components/Tooltip';

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Menu Items',
    message: 'Try our new summer specials!',
    date: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '2',
    title: 'Weekend Tournament',
    message: 'Sign up for this weekend\'s scramble!',
    date: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: '3',
    title: 'App Update',
    message: 'New features available in the latest update',
    date: new Date(Date.now() - 172800000), // 2 days ago
  },
];

// Mock Spirit World ads
const SPIRIT_ADS = [
  {
    id: '1',
    message: 'Visit the Spirit World for a chance to win a free round!',
    icon: 'golf',
  },
  {
    id: '2',
    message: 'Book your next tee time through Spirit World',
    icon: 'calendar',
  },
  {
    id: '3',
    message: 'Join our loyalty program for exclusive rewards',
    icon: 'star',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [favoriteFood, setFavoriteFood] = useState<MenuItem[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bestRound, setBestRound] = useState<Game | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values for section transitions
  const fadeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadDashboardData();
    setupAdRotation();
  }, []);

  useEffect(() => {
    // Animate sections in sequence
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    });
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const games = await getGameHistory();
      setRecentGames(games.slice(0, 3));

      // Find best round
      const best = games.reduce((best, game) => {
        const total = game.scores.reduce((sum, score) => sum + score, 0);
        const bestTotal = best.scores.reduce((sum, score) => sum + score, 0);
        return total < bestTotal ? game : best;
      }, games[0]);
      setBestRound(best);

      const favorites = await getFavorites();
      setFavoriteFood(favorites.food);
      setFavoriteCourses(favorites.courses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupAdRotation = () => {
    setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % SPIRIT_ADS.length);
    }, 5000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderLoadingState = () => (
    <ScrollView 
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9CA3AF"
          colors={['#9CA3AF']}
        />
      }
    >
      {/* Profile Shimmer */}
      <View className="bg-green-800 p-6">
        <View className="flex-row items-center">
          <Shimmer width={80} height={80} borderRadius={40} />
          <View className="ml-4 flex-1">
            <Shimmer width="60%" height={24} className="mb-2" />
            <Shimmer width="40%" height={20} />
          </View>
          <Shimmer width={100} height={40} borderRadius={8} />
        </View>
      </View>

      {/* Recent Rounds Shimmer */}
      <View className="p-4">
        <Shimmer width="40%" height={24} className="mb-4" />
        {[1, 2, 3].map(i => (
          <Shimmer key={i} height={60} className="mb-3" />
        ))}
      </View>

      {/* Quick Stats Shimmer */}
      <View className="p-4">
        <Shimmer width="30%" height={24} className="mb-4" />
        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row justify-between mb-3">
            {[1, 2, 3].map(i => (
              <Shimmer key={i} width="30%" height={40} />
            ))}
          </View>
          <View className="flex-row justify-between">
            {[1, 2, 3].map(i => (
              <Shimmer key={i} width="30%" height={40} />
            ))}
          </View>
        </View>
      </View>

      {/* Favorites Shimmer */}
      <View className="p-4">
        <Shimmer width="25%" height={24} className="mb-4" />
        <View className="bg-gray-800 rounded-lg p-4">
          <Shimmer width="40%" height={20} className="mb-2" />
          <View className="flex-row flex-wrap">
            {[1, 2, 3, 4].map(i => (
              <Shimmer key={i} width={100} height={32} borderRadius={16} className="mr-2 mb-2" />
            ))}
          </View>
        </View>
      </View>

      {/* Notifications Shimmer */}
      <View className="p-4">
        <Shimmer width="35%" height={24} className="mb-4" />
        {[1, 2, 3].map(i => (
          <Shimmer key={i} height={80} className="mb-3" />
        ))}
      </View>
    </ScrollView>
  );

  if (loading) {
    return renderLoadingState();
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9CA3AF"
          colors={['#9CA3AF']}
        />
      }
    >
      {/* Profile Section */}
      <Animated.View
        style={{
          opacity: fadeAnims[0],
          transform: [{
            translateY: fadeAnims[0].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="bg-green-800 p-6"
      >
        <View className="flex-row items-center">
          <Image
            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/100' }}
            className="w-20 h-20 rounded-full"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
            <Text className="text-gray-300">Handicap: {user?.handicap}</Text>
          </View>
          <TouchableOpacity
            className="bg-green-600 px-4 py-2 rounded-lg"
            onPress={() => router.push('/profile/edit')}
          >
            <Text className="text-white font-semibold">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Recent Rounds */}
      <Animated.View
        style={{
          opacity: fadeAnims[1],
          transform: [{
            translateY: fadeAnims[1].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="p-4"
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-semibold">Recent Rounds</Text>
          <TouchableOpacity onPress={() => router.push('/games/history')}>
            <Text className="text-green-400">View All</Text>
          </TouchableOpacity>
        </View>
        {recentGames.map(game => (
          <View
            key={game.id}
            className="bg-gray-800 rounded-lg p-4 mb-3"
          >
            <Text className="text-white font-semibold">{game.course.name}</Text>
            <Text className="text-gray-400">
              {formatDate(new Date(game.date))} • {game.format}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View
        style={{
          opacity: fadeAnims[2],
          transform: [{
            translateY: fadeAnims[2].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="p-4"
      >
        <Text className="text-white text-xl font-semibold mb-4">Quick Stats</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-gray-400">Avg Score</Text>
              <Text className="text-white text-lg">78</Text>
            </View>
            <View>
              <Text className="text-gray-400">GIR%</Text>
              <Text className="text-white text-lg">65%</Text>
            </View>
            <View>
              <Text className="text-gray-400">Fairway%</Text>
              <Text className="text-white text-lg">70%</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-gray-400">Birdies</Text>
              <Text className="text-white text-lg">12</Text>
            </View>
            <View>
              <Tooltip
                content={
                  bestRound && (
                    <View>
                      <Text className="text-white font-semibold mb-2">{bestRound.course.name}</Text>
                      <Text className="text-gray-400">
                        Front 9: {bestRound.scores.slice(0, 9).reduce((sum, score) => sum + score, 0)}
                      </Text>
                      <Text className="text-gray-400">
                        Back 9: {bestRound.scores.slice(9).reduce((sum, score) => sum + score, 0)}
                      </Text>
                      <Text className="text-gray-400">
                        Total: {bestRound.scores.reduce((sum, score) => sum + score, 0)}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-2">
                        {formatDate(new Date(bestRound.date))}
                      </Text>
                    </View>
                  )
                }
              >
                <View>
                  <Text className="text-gray-400">Best Round</Text>
                  <Text className="text-white text-lg">
                    {bestRound ? bestRound.scores.reduce((sum, score) => sum + score, 0) : '-'}
                  </Text>
                </View>
              </Tooltip>
            </View>
            <View>
              <Text className="text-gray-400">Rounds</Text>
              <Text className="text-white text-lg">24</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Favorites */}
      <Animated.View
        style={{
          opacity: fadeAnims[3],
          transform: [{
            translateY: fadeAnims[3].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="p-4"
      >
        <Text className="text-white text-xl font-semibold mb-4">Favorites</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-gray-400 mb-2">Favorite Food</Text>
          <View className="flex-row flex-wrap mb-4">
            {favoriteFood.map(item => (
              <View
                key={item.id}
                className="bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
              >
                <Text className="text-white">{item.name}</Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-400 mb-2">Favorite Courses</Text>
          <View className="space-y-3">
            {favoriteCourses.map(course => (
              <TouchableOpacity
                key={course.id}
                className="bg-gray-700 rounded-lg p-3"
                onPress={() => router.push(`/courses/${course.id}`)}
              >
                <View className="flex-row items-center">
                  <Ionicons name="golf" size={20} color="#9CA3AF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-semibold">{course.name}</Text>
                    <Text className="text-gray-400 text-sm">{course.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Notifications */}
      <Animated.View
        style={{
          opacity: fadeAnims[4],
          transform: [{
            translateY: fadeAnims[4].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="p-4"
      >
        <Text className="text-white text-xl font-semibold mb-4">Notifications</Text>
        {MOCK_NOTIFICATIONS.map(notification => (
          <View
            key={notification.id}
            className="bg-gray-800 rounded-lg p-4 mb-3"
          >
            <Text className="text-white font-semibold">{notification.title}</Text>
            <Text className="text-gray-400 mt-1">{notification.message}</Text>
            <Text className="text-gray-500 text-sm mt-2">
              {formatDate(notification.date)}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Spirit World Ad Banner */}
      <Animated.View
        style={{
          opacity: fadeAnims[4],
          transform: [{
            translateY: fadeAnims[4].interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }}
        className="p-4"
      >
        <View className="bg-green-900 rounded-lg p-4 flex-row items-center">
          <Ionicons
            name={SPIRIT_ADS[currentAdIndex].icon as any}
            size={24}
            color="#9CA3AF"
          />
          <Text className="text-white ml-3 flex-1">
            {SPIRIT_ADS[currentAdIndex].message}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
} 