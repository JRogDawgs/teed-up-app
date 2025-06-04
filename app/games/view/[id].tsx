import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

type GameData = {
  name: string;
  course: string;
  date: string;
  holes: number;
  format: string;
  players: string[];
  status: 'active' | 'completed';
  scores?: {
    [playerName: string]: {
      [holeNumber: string]: number;
    };
  };
  createdAt: any;
  completedAt?: any;
};

type PlayerScore = {
  name: string;
  scores: (number | null)[];
  total: number;
};

export default function GameViewer() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameDoc = await getDoc(doc(db, 'games', id as string));
        
        if (!gameDoc.exists()) {
          setError('Game not found');
          return;
        }

        const data = gameDoc.data() as GameData;
        setGameData(data);

        // Initialize player scores
        const scores = data.scores || {};
        setPlayerScores(
          data.players.map(name => ({
            name,
            scores: Array(data.holes).fill(null).map((_, i) => 
              scores[name]?.[i + 1] || null
            ),
            total: Object.values(scores[name] || {}).reduce((sum, score) => sum + score, 0),
          }))
        );
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  const handleShare = async () => {
    if (!gameData || !playerScores.length) return;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const shareText = `
${gameData.name} - ${gameData.course}
${formatDate(gameData.date)}
${gameData.format.charAt(0).toUpperCase() + gameData.format.slice(1)} • ${gameData.holes} Holes

Final Scores:
${playerScores
  .map(player => `${player.name}: ${player.total > 0 ? `+${player.total}` : player.total}`)
  .join('\n')}

Hole-by-Hole:
${playerScores.map(player => `
${player.name}:
${player.scores
  .map((score, i) => `Hole ${i + 1}: ${score || '-'}`)
  .join('\n')}
`).join('\n')}
    `.trim();

    try {
      await Share.share({
        message: shareText,
        title: `${gameData.name} - Final Scores`,
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const renderScoreCard = (player: PlayerScore) => {
    return (
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-2">{player.name}</Text>
        <View className="flex-row flex-wrap">
          {Array.from({ length: gameData?.holes || 18 }).map((_, index) => {
            const holeNumber = index + 1;
            const score = player.scores[index];
            
            return (
              <View key={holeNumber} className="w-1/4 p-2">
                <Text className="text-xs text-gray-500 mb-1">Hole {holeNumber}</Text>
                <View className="border border-gray-200 rounded-lg p-2">
                  <Text className="text-center text-gray-900">
                    {score !== null ? score : '-'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View className="border-t border-gray-100 mt-2 pt-2">
          <Text className="text-sm text-gray-500">Total Score</Text>
          <Text className="text-lg font-semibold text-gray-900">
            {player.total > 0 ? `+${player.total}` : player.total}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#15803d" />
      </View>
    );
  }

  if (error || !gameData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-600 text-lg">{error || 'Failed to load game'}</Text>
        <TouchableOpacity
          className="mt-4 bg-green-600 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-600 p-4">
        <Text className="text-white text-xl font-bold">{gameData.course}</Text>
        <Text className="text-white text-sm opacity-80">
          {gameData.format.charAt(0).toUpperCase() + gameData.format.slice(1)} • {gameData.holes} Holes
        </Text>
        <Text className="text-white text-sm opacity-80 mt-1">
          {new Date(gameData.date).toLocaleDateString()}
        </Text>
      </View>

      {/* Share Button */}
      {gameData.status === 'completed' && (
        <TouchableOpacity
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm"
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#15803d" />
        </TouchableOpacity>
      )}

      {/* Score Cards */}
      <ScrollView className="flex-1 p-4">
        {playerScores.map((player) => renderScoreCard(player))}
      </ScrollView>
    </View>
  );
} 