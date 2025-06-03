import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { GameFormat, TeeBox } from '../../types/game';
import { User } from '../../types/user';
import { getCurrentUser } from '../../lib/auth';

const GAME_FORMATS: GameFormat[] = ['Stroke Play', 'Skins', 'Wolf', 'Match Play', 'Stableford'];
const TEE_BOXES: TeeBox[] = ['Black', 'Blue', 'White', 'Gold', 'Red'];

export default function CreateGame() {
  const [format, setFormat] = useState<GameFormat>('Stroke Play');
  const [teeBox, setTeeBox] = useState<TeeBox>('White');
  const [isMoneyGame, setIsMoneyGame] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      // TODO: Implement game creation
      router.push('/games/game-session');
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-masters-green mb-6">New Game</Text>

      {/* Game Format Selection */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Game Format</Text>
        <View className="flex-row flex-wrap gap-2">
          {GAME_FORMATS.map((gameFormat) => (
            <TouchableOpacity
              key={gameFormat}
              className={`px-4 py-2 rounded-lg ${
                format === gameFormat
                  ? 'bg-masters-green'
                  : 'bg-gray-100'
              }`}
              onPress={() => setFormat(gameFormat)}
            >
              <Text
                className={`${
                  format === gameFormat
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {gameFormat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tee Box Selection */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Tee Box</Text>
        <View className="flex-row flex-wrap gap-2">
          {TEE_BOXES.map((box) => (
            <TouchableOpacity
              key={box}
              className={`px-4 py-2 rounded-lg ${
                teeBox === box
                  ? 'bg-masters-green'
                  : 'bg-gray-100'
              }`}
              onPress={() => setTeeBox(box)}
            >
              <Text
                className={`${
                  teeBox === box
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {box}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Money Game Toggle */}
      <View className="mb-6">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setIsMoneyGame(!isMoneyGame)}
        >
          <View
            className={`w-12 h-6 rounded-full mr-2 ${
              isMoneyGame ? 'bg-masters-green' : 'bg-gray-300'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white mt-0.5 ml-0.5 ${
                isMoneyGame ? 'ml-6' : 'ml-0.5'
              }`}
            />
          </View>
          <Text className="text-lg font-semibold">Money Game</Text>
        </TouchableOpacity>
      </View>

      {/* Create Game Button */}
      <TouchableOpacity
        className="bg-masters-green p-4 rounded-lg mt-4"
        onPress={handleCreateGame}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? 'Creating...' : 'Start Game'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
} 