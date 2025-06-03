import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Game,
  GameSummary,
  Player,
  isGuestPlayer,
  getPlayerName,
  getPlayerEmail,
} from '../../lib/game';

export default function GameSummary() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams();
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load game summary from backend
    const mockSummary: GameSummary = {
      gameId: gameId as string,
      courseId: 'COURSE-123',
      startTime: Date.now() - 3600000, // 1 hour ago
      endTime: Date.now(),
      players: [],
      courseStats: {
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        mostFairways: 0,
        mostGreens: 0,
        leastPutts: 0,
      },
    };
    setGameSummary(mockSummary);
    setLoading(false);
  }, [gameId]);

  const handleSaveGame = () => {
    if (!gameSummary) return;

    // Filter out guest players before saving
    const registeredPlayers = gameSummary.players.filter(p => !p.isGuest);
    if (registeredPlayers.length === 0) {
      Alert.alert(
        'No Registered Players',
        'This game cannot be saved to history as it only contains guest players.'
      );
      return;
    }

    // TODO: Save game to history
    Alert.alert('Success', 'Game saved to history');
    router.push('/games/game-history');
  };

  const renderPlayerList = () => {
    if (!gameSummary) return null;

    const registeredPlayers = gameSummary.players.filter(p => !p.isGuest);
    const guestPlayers = gameSummary.players.filter(p => p.isGuest);

    return (
      <View style={styles.playerLists}>
        {registeredPlayers.length > 0 && (
          <View style={styles.playerSection}>
            <Text style={styles.sectionTitle}>Registered Players</Text>
            {registeredPlayers.map(player => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.scoreText}>Score: {player.totalScore}</Text>
                  <Text style={styles.statsText}>
                    Putts: {player.stats.putts} | Fairways: {player.stats.fairways} | Greens: {player.stats.greens}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {guestPlayers.length > 0 && (
          <View style={styles.playerSection}>
            <Text style={styles.sectionTitle}>Guest Players</Text>
            {guestPlayers.map(player => (
              <View key={player.id} style={[styles.playerCard, styles.guestCard]}>
                <View style={styles.playerInfo}>
                  <View style={styles.guestTag}>
                    <Text style={styles.guestTagText}>Guest</Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.scoreText}>Score: {player.totalScore}</Text>
                  <Text style={styles.statsText}>
                    Putts: {player.stats.putts} | Fairways: {player.stats.fairways} | Greens: {player.stats.greens}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCourseStats = () => {
    if (!gameSummary) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Course Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Score</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.averageScore}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best Score</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.bestScore}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Worst Score</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.worstScore}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Most Fairways</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.mostFairways}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Most Greens</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.mostGreens}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Least Putts</Text>
            <Text style={styles.statValue}>{gameSummary.courseStats.leastPutts}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Summary</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveGame}
        >
          <Text style={styles.saveButtonText}>Save to History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderPlayerList()}
        {renderCourseStats()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  playerLists: {
    padding: 16,
  },
  playerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerCard: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  guestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  playerInfo: {
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerEmail: {
    fontSize: 14,
    color: '#666',
  },
  guestTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guestTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  playerStats: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
}); 