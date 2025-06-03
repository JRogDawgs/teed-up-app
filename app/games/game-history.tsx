import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getGameHistory, clearGameHistory, GameHistoryEntry } from '../../lib/game-history';

export default function GameHistory() {
  const router = useRouter();
  const [savedRounds, setSavedRounds] = useState<GameHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadSavedRounds();
  }, []);

  const loadSavedRounds = async () => {
    try {
      const rounds = await getGameHistory();
      setSavedRounds(rounds);
    } catch (error) {
      console.error('Error loading saved rounds:', error);
      Alert.alert('Error', 'Failed to load saved rounds');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedRounds();
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all saved rounds? This cannot be undone.',
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
              setClearing(true);
              await clearGameHistory();
              setSavedRounds([]);
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewRound = (round: GameHistoryEntry) => {
    router.push({
      pathname: '/games/game-summary',
      params: { gameData: JSON.stringify(round) },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#004D2D" />
      </View>
    );
  }

  if (savedRounds.length === 0) {
    return (
      <View className="flex-1 bg-white p-4">
        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
            No past games yet
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Go play some golf!
          </Text>
          <TouchableOpacity
            className="bg-masters-green px-8 py-4 rounded-lg"
            onPress={() => router.push('/games/create-game')}
          >
            <Text className="text-white font-semibold text-lg">
              Start New Game
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-masters-green p-6">
        <Text className="text-white text-2xl font-bold text-center">
          Game History
        </Text>
      </View>

      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#004D2D']}
            tintColor="#004D2D"
          />
        }
      >
        {savedRounds.map((round) => (
          <View
            key={round.id}
            className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-100"
          >
            {/* Date and Format */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-600">
                {formatDate(round.date)}
              </Text>
              <Text className="text-sm text-gray-500">
                {round.format}
              </Text>
            </View>

            {/* Course Name */}
            <Text className="text-lg font-semibold mb-3">
              {round.course.name}
            </Text>

            {/* Player Scores */}
            {round.players.map((player) => {
              const playerScore = round.scores[player.id];
              return (
                <View
                  key={player.id}
                  className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <View className="flex-1">
                    <Text className="font-medium">{player.name}</Text>
                    <Text className="text-sm text-gray-500">
                      Handicap: {player.handicap}
                    </Text>
                  </View>
                  <View className="flex-row gap-4">
                    <View>
                      <Text className="text-sm text-gray-500">Front</Text>
                      <Text className="font-semibold">{playerScore.frontNine}</Text>
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">Back</Text>
                      <Text className="font-semibold">{playerScore.backNine}</Text>
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">Total</Text>
                      <Text className="font-bold text-masters-green">
                        {playerScore.totalScore}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* View Button */}
            <TouchableOpacity
              className="bg-masters-green/10 mt-3 p-3 rounded-lg"
              onPress={() => handleViewRound(round)}
            >
              <Text className="text-masters-green text-center font-semibold">
                View Round
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Clear History Button */}
        <TouchableOpacity
          className={`${
            clearing ? 'bg-gray-400' : 'bg-red-500'
          } p-4 rounded-lg mt-4 mb-8`}
          onPress={handleClearHistory}
          disabled={clearing}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {clearing ? 'Clearing...' : 'Clear History'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
} 