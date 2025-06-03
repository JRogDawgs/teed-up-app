import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Game,
  Player,
  isGuestPlayer,
  getPlayerName,
  getPlayerEmail,
  getGuestPlayerCount,
} from '../../lib/game';
import { sendGuestRecapEmail } from '../../lib/notifications';
import { createGuestFeeCheckout } from '../../lib/stripe';

export default function GameSession() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMonetizationPrompt, setShowMonetizationPrompt] = useState(false);

  useEffect(() => {
    if (params.gameData) {
      try {
        const gameData = JSON.parse(params.gameData as string);
        setGame({
          ...gameData,
          id: `GAME-${Date.now()}`,
          startTime: Date.now(),
          status: 'active',
          currentHole: 1,
          currentPlayerIndex: 0,
          roundData: {},
        });
      } catch (error) {
        console.error('Error parsing game data:', error);
        router.back();
      }
    }
    setLoading(false);
  }, [params.gameData]);

  const handleEndGame = async () => {
    if (!game) return;

    try {
      // Send recap emails to guest players
      const guestPlayers = game.players.filter(isGuestPlayer);
      for (const guest of guestPlayers) {
        try {
          await sendGuestRecapEmail(guest, {
            gameId: game.id,
            courseId: game.courseId,
            startTime: game.startTime,
            endTime: Date.now(),
            players: game.players.map(player => ({
              id: player.id,
              name: getPlayerName(player),
              email: getPlayerEmail(player),
              isGuest: isGuestPlayer(player),
              scores: game.roundData[player.id]?.scores || [],
              totalScore: game.roundData[player.id]?.scores.reduce((a, b) => a + b, 0) || 0,
              stats: {
                putts: game.roundData[player.id]?.putts.reduce((a, b) => a + b, 0) || 0,
                fairways: game.roundData[player.id]?.fairways.filter(f => f === 'hit').length || 0,
                greens: game.roundData[player.id]?.greens.filter(g => g).length || 0,
                penalties: game.roundData[player.id]?.penalties.reduce((a, b) => a + b, 0) || 0,
              },
            })),
            courseStats: {
              averageScore: 0, // TODO: Calculate
              bestScore: 0, // TODO: Calculate
              worstScore: 0, // TODO: Calculate
              mostFairways: 0, // TODO: Calculate
              mostGreens: 0, // TODO: Calculate
              leastPutts: 0, // TODO: Calculate
            },
          });
        } catch (error) {
          console.error('Error sending guest recap email:', error);
        }
      }

      // Show monetization prompt if there are multiple guests and host is not a subscriber
      if (getGuestPlayerCount(game) > 1 && !game.isHostSubscriber) {
        setShowMonetizationPrompt(true);
      } else {
        navigateToSummary();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to end game');
    }
  };

  const navigateToSummary = () => {
    router.push({
      pathname: '/games/game-summary',
      params: { gameId: game?.id },
    });
  };

  const handleMonetizationPrompt = async (action: 'skip' | 'pay') => {
    if (action === 'skip') {
      setShowMonetizationPrompt(false);
      return;
    }

    try {
      setLoading(true);
      const { url } = await createGuestFeeCheckout(
        game.id,
        getGuestPlayerCount(game)
      );
      
      // Open Stripe Checkout in browser
      router.push(url);
    } catch (error) {
      console.error('Error creating guest fee checkout:', error);
      Alert.alert(
        'Payment Error',
        'There was an error processing your payment. Please try again.'
      );
    } finally {
      setLoading(false);
      setShowMonetizationPrompt(false);
    }
  };

  const renderMonetizationPrompt = () => (
    <Modal
      visible={showMonetizationPrompt}
      transparent
      animationType="fade"
      onRequestClose={() => setShowMonetizationPrompt(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Save Guest Rounds</Text>
          <Text style={styles.modalText}>
            Would you like to save this game's guest rounds to your history?
            This will allow you to track guest performance over time.
          </Text>
          <Text style={styles.modalPrice}>
            ${(0.25 * getGuestPlayerCount(game)).toFixed(2)} for{' '}
            {getGuestPlayerCount(game)} guest round
            {getGuestPlayerCount(game) > 1 ? 's' : ''}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.skipButton]}
              onPress={() => handleMonetizationPrompt('skip')}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.payButton]}
              onPress={() => handleMonetizationPrompt('pay')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>Pay Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPlayerList = () => {
    if (!game) return null;

    const registeredPlayers = game.players.filter(p => !isGuestPlayer(p));
    const guestPlayers = game.players.filter(isGuestPlayer);

    return (
      <View style={styles.playerLists}>
        {registeredPlayers.length > 0 && (
          <View style={styles.playerSection}>
            <Text style={styles.sectionTitle}>Registered Players</Text>
            {registeredPlayers.map(player => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>
                    {player.firstName} {player.lastName}
                  </Text>
                  <Text style={styles.playerEmail}>{player.email}</Text>
                </View>
                <View style={styles.playerScore}>
                  <Text style={styles.scoreText}>
                    {game.roundData[player.id]?.scores.reduce((a, b) => a + b, 0) || 0}
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
                <View style={styles.playerScore}>
                  <Text style={styles.scoreText}>
                    {game.roundData[player.id]?.scores.reduce((a, b) => a + b, 0) || 0}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
        <Text style={styles.title}>Game Session</Text>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndGame}
        >
          <Text style={styles.endButtonText}>End Game</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderPlayerList()}
      </ScrollView>

      {renderMonetizationPrompt()}
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
  endButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endButtonText: {
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
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
  playerScore: {
    marginLeft: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 22,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
  },
  payButton: {
    backgroundColor: '#007AFF',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 