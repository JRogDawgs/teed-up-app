import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getLeaderboardData, LeaderboardPlayer } from '../../lib/leaderboard';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function TournamentLeaderboard() {
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const leaderboardData = await getLeaderboardData();
      setData(leaderboardData);
      setLastUpdated(new Date(leaderboardData.lastUpdated).toLocaleTimeString());
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard data');
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out the live leaderboard for ${data.tournamentName} - Round ${data.round}!`,
        title: `${data.tournamentName} Leaderboard`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderHoleIndicator = (hole: string) => {
    const color = {
      birdie: '#4CAF50',
      eagle: '#2196F3',
      par: '#9E9E9E',
      bogey: '#F44336',
      double: '#D32F2F',
    }[hole] || '#9E9E9E';

    return (
      <View style={[styles.holeIndicator, { backgroundColor: color }]}>
        <Text style={styles.holeIndicatorText}>
          {hole === 'birdie' ? 'B' : hole === 'eagle' ? 'E' : hole === 'bogey' ? 'B' : hole === 'double' ? 'D' : 'P'}
        </Text>
      </View>
    );
  };

  const renderPlayerRow = (player: LeaderboardPlayer, index: number) => {
    const position = useSharedValue(player.position);
    const scale = useSharedValue(1);

    useEffect(() => {
      if (position.value !== player.position) {
        scale.value = withSequence(
          withTiming(1.1, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
        position.value = withSpring(player.position);
      }
    }, [player.position]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedView
        key={player.id}
        style={[
          styles.playerRow,
          player.isCurrentUser && styles.currentUserRow,
          animatedStyle,
        ]}
      >
        <View style={styles.positionContainer}>
          <Text style={styles.positionText}>{player.position}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <View style={styles.holeIndicators}>
            {player.lastThreeHoles.map((hole, i) => (
              <View key={i} style={styles.holeIndicatorWrapper}>
                {renderHoleIndicator(hole)}
              </View>
            ))}
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {player.totalScore > 0 ? `+${player.totalScore}` : player.totalScore}
          </Text>
          <Text style={styles.thruText}>Thru {player.thruHole}</Text>
        </View>
      </AnimatedView>
    );
  };

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{data.tournamentName}</Text>
          <Text style={styles.roundInfo}>Round {data.round}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.leaderboardHeader}>
        <Text style={styles.headerText}>Pos</Text>
        <Text style={[styles.headerText, { flex: 1 }]}>Player</Text>
        <Text style={styles.headerText}>Score</Text>
      </View>

      {data.players.map(renderPlayerRow)}

      <Text style={styles.lastUpdated}>
        Last updated: {lastUpdated}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  roundInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  shareButton: {
    padding: 8,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 60,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentUserRow: {
    backgroundColor: '#E8F5E9',
  },
  positionContainer: {
    width: 60,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  holeIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  holeIndicatorWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holeIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    width: 60,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  thruText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lastUpdated: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontSize: 12,
  },
}); 