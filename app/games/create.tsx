import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type GameFormat = 'stroke' | 'skins' | 'wolf';
type Player = { id: string; name: string };

export default function CreateGame() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [holes, setHoles] = useState<'9' | '18'>('18');
  const [format, setFormat] = useState<GameFormat>('stroke');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { id: Date.now().toString(), name: '' }]);
    }
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== id));
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };

  const handleStartGame = async () => {
    // Validate form
    if (!gameName || !courseName || players.some(p => !p.name)) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare game data
      const gameData = {
        name: gameName,
        course: courseName,
        date: date.toISOString(),
        holes: parseInt(holes),
        format,
        players: players.map(p => p.name),
        createdAt: serverTimestamp(),
        status: 'active',
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'games'), gameData);

      // Navigate to live game screen with game ID
      router.push({
        pathname: '/games/live',
        params: { gameId: docRef.id }
      });
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Create New Game</Text>

        {/* Game Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Game Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            value={gameName}
            onChangeText={setGameName}
            placeholder="Enter game name"
          />
        </View>

        {/* Course Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Course Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-3 bg-white"
            value={courseName}
            onChangeText={setCourseName}
            placeholder="Enter course name"
          />
        </View>

        {/* Date Picker */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Date</Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-3 bg-white"
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Number of Holes */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Number of Holes</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg border ${
                holes === '9' ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}
              onPress={() => setHoles('9')}
            >
              <Text className={`text-center ${holes === '9' ? 'text-white' : 'text-gray-700'}`}>
                9 Holes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg border ${
                holes === '18' ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}
              onPress={() => setHoles('18')}
            >
              <Text className={`text-center ${holes === '18' ? 'text-white' : 'text-gray-700'}`}>
                18 Holes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Game Format */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Game Format</Text>
          <View className="flex-row space-x-2">
            {(['stroke', 'skins', 'wolf'] as GameFormat[]).map((f) => (
              <TouchableOpacity
                key={f}
                className={`flex-1 p-3 rounded-lg border ${
                  format === f ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}
                onPress={() => setFormat(f)}
              >
                <Text className={`text-center ${format === f ? 'text-white' : 'text-gray-700'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Players */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">Players</Text>
            {players.length < 4 && (
              <TouchableOpacity
                className="bg-green-600 px-3 py-1 rounded-full"
                onPress={addPlayer}
              >
                <Text className="text-white">Add Player</Text>
              </TouchableOpacity>
            )}
          </View>
          {players.map((player, index) => (
            <View key={player.id} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg p-3 bg-white mr-2"
                value={player.name}
                onChangeText={(name) => updatePlayerName(player.id, name)}
                placeholder={`Player ${index + 1}`}
              />
              {players.length > 2 && (
                <TouchableOpacity
                  className="p-2"
                  onPress={() => removePlayer(player.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Start Game Button */}
        <TouchableOpacity
          className={`bg-green-600 p-4 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleStartGame}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? 'Creating Game...' : 'Start Game'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 