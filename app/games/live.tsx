import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import debounce from 'lodash/debounce';

type GameData = {
  name: string;
  course: string;
  date: string;
  holes: number;
  format: string;
  players: string[];
  status: string;
  createdAt: any;
  scores?: {
    [playerName: string]: {
      [holeNumber: string]: number;
    };
  };
};

type PlayerScore = {
  name: string;
  scores: (number | null)[];
  total: number;
};

export default function LiveGame() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

  // Debounced function to update scores in Firestore
  const updateScoreInFirestore = useCallback(
    debounce(async (playerName: string, holeNumber: number, score: number) => {
      if (!gameId || !gameData) return;

      try {
        const gameRef = doc(db, 'games', gameId as string);
        await updateDoc(gameRef, {
          [`scores.${playerName}.${holeNumber}`]: score,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error updating score:', err);
        Alert.alert('Error', 'Failed to save score. Please try again.');
      }
    }, 500),
    [gameId, gameData]
  );

  // Subscribe to game updates
  useEffect(() => {
    if (!gameId) return;

    const gameRef = doc(db, 'games', gameId as string);
    const unsubscribe = onSnapshot(
      gameRef,
      (doc) => {
        if (!doc.exists()) {
          setError('Game not found');
          return;
        }

        const data = doc.data() as GameData;
        setGameData(data);

        // Initialize or update player scores
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
        setLoading(false);
      },
      (err) => {
        console.error('Error in game subscription:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  const handleScoreChange = (playerName: string, holeNumber: number, value: string) => {
    const score = parseInt(value) || null;
    
    // Update local state
    setPlayerScores(prev => prev.map(player => {
      if (player.name === playerName) {
        const newScores = [...player.scores];
        newScores[holeNumber - 1] = score;
        return {
          ...player,
          scores: newScores,
          total: newScores.reduce((sum, s) => sum + (s || 0), 0),
        };
      }
      return player;
    }));

    // Update Firestore if score is valid
    if (score !== null) {
      updateScoreInFirestore(playerName, holeNumber, score);
    }
  };

  const handleNextHole = () => {
    if (!gameData) return;

    if (currentHole === gameData.holes) {
      Alert.alert(
        'Game Complete',
        'Would you like to end the game?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'End Game',
            onPress: async () => {
              try {
                const gameRef = doc(db, 'games', gameId as string);
                await updateDoc(gameRef, {
                  status: 'completed',
                  completedAt: serverTimestamp(),
                });
                router.back();
              } catch (err) {
                console.error('Error ending game:', err);
                Alert.alert('Error', 'Failed to end game. Please try again.');
              }
            },
          },
        ]
      );
    } else {
      setCurrentHole(prev => prev + 1);
      // Scroll to next hole after a short delay
      setTimeout(() => {
        scrollViewRef?.scrollTo({ y: (currentHole * 80), animated: true });
      }, 100);
    }
  };

  const renderScoreInput = (player: PlayerScore) => {
    return (
      <View className="bg-white p-4 rounded-lg mb-2">
        <Text className="text-lg font-semibold text-gray-900 mb-2">{player.name}</Text>
        <View className="flex-row flex-wrap">
          {Array.from({ length: gameData?.holes || 18 }).map((_, index) => {
            const holeNumber = index + 1;
            const isCurrentHole = holeNumber === currentHole;
            
            return (
              <View
                key={holeNumber}
                className={`w-1/4 p-2 ${isCurrentHole ? 'bg-green-50' : ''}`}
              >
                <Text className="text-xs text-gray-500 mb-1">Hole {holeNumber}</Text>
                <TextInput
                  className={`border rounded-lg p-2 text-center ${
                    isCurrentHole ? 'border-green-600' : 'border-gray-300'
                  }`}
                  value={player.scores[index]?.toString() || ''}
                  onChangeText={(value) => handleScoreChange(player.name, holeNumber, value)}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="-"
                />
              </View>
            );
          })}
        </View>
        <Text className="text-sm text-gray-500 mt-2">
          Total: {player.total}
        </Text>
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
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-green-600 p-4">
        <Text className="text-white text-xl font-bold">{gameData.course}</Text>
        <Text className="text-white text-sm opacity-80">
          {gameData.format.charAt(0).toUpperCase() + gameData.format.slice(1)} • Hole {currentHole}
        </Text>
      </View>

      {/* Player Scores */}
      <ScrollView
        ref={setScrollViewRef}
        className="flex-1 p-4"
        keyboardShouldPersistTaps="handled"
      >
        {playerScores.map((player) => renderScoreInput(player))}
      </ScrollView>

      {/* Next Hole Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg"
          onPress={handleNextHole}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {currentHole === gameData.holes ? 'End Game' : 'Next Hole'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 