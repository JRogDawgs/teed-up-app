import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Game = {
  id: string;
  name: string;
  course: string;
  date: string;
  players: string[];
  status: 'active' | 'completed';
  scores?: {
    [playerName: string]: {
      [holeNumber: string]: number;
    };
  };
  createdAt: any;
};

export default function GameHistory() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const gamesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Game[];

        setGames(gamesData);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load game history');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const calculatePlayerTotal = (playerName: string, scores?: Game['scores']) => {
    if (!scores || !scores[playerName]) return null;
    return Object.values(scores[playerName]).reduce((sum, score) => sum + score, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-600 text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {games.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="golf-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-600 mt-4">
              No Games Yet
            </Text>
            <Text className="text-gray-500 text-center mt-2 px-8">
              Create your first game to start keeping score
            </Text>
          </View>
        ) : (
          games.map((game) => (
            <TouchableOpacity
              key={game.id}
              className="bg-white rounded-lg mb-4 shadow-sm"
              onPress={() => router.push(`/games/view/${game.id}`)}
            >
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-semibold text-gray-900">
                    {game.name}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded-full ${
                      game.status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-yellow-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        game.status === 'completed'
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}
                    >
                      {game.status === 'completed' ? 'Completed' : 'In Progress'}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-600 mb-1">{game.course}</Text>
                <Text className="text-gray-500 text-sm mb-2">
                  {formatDate(game.date)}
                </Text>

                <View className="border-t border-gray-100 pt-2">
                  <Text className="text-sm text-gray-500 mb-1">Players</Text>
                  {game.players.map((player) => {
                    const total = calculatePlayerTotal(player, game.scores);
                    return (
                      <View
                        key={player}
                        className="flex-row justify-between items-center mb-1"
                      >
                        <Text className="text-gray-700">{player}</Text>
                        {total !== null && (
                          <Text className="text-gray-900 font-medium">
                            {total > 0 ? `+${total}` : total}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
} 