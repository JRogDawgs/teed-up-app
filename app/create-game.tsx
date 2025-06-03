import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchUsers } from '../../lib/user';
import { RegisteredUser, GuestPlayer, Player, isGuestPlayer } from '../../lib/game';
import { chargeGuestFee, GUEST_FEE } from '../../lib/payments';
import { sendGuestInviteEmail } from '../../lib/notifications';

export default function CreateGame() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegisteredUser[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = (player: RegisteredUser) => {
    if (!selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddGuest = async () => {
    if (!guestEmail || !guestName) {
      Alert.alert('Error', 'Please enter both email and name for guest player');
      return;
    }

    setLoading(true);
    try {
      const success = await chargeGuestFee(guestEmail);
      if (success) {
        const guest: GuestPlayer = {
          id: `GUEST-${Date.now()}`,
          name: guestName,
          email: guestEmail,
          paid: true,
        };
        setSelectedPlayers([...selectedPlayers, guest]);
        setGuestEmail('');
        setGuestName('');
      } else {
        Alert.alert('Error', 'Failed to process guest fee payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add guest player');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteGuest = async () => {
    if (!guestEmail) {
      Alert.alert('Error', 'Please enter email address');
      return;
    }

    setLoading(true);
    try {
      await sendGuestInviteEmail(guestEmail, 'Host'); // TODO: Get actual host name
      Alert.alert('Success', 'Invitation sent successfully');
      setGuestEmail('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleCreateGame = () => {
    if (selectedPlayers.length < 1) {
      Alert.alert('Error', 'Please add at least one player');
      return;
    }

    const hasGuests = selectedPlayers.some(isGuestPlayer);
    const hasRegisteredPlayers = selectedPlayers.some(p => !isGuestPlayer(p));

    // TODO: Get actual subscription status from user profile
    const isHostSubscriber = false;

    const gameData = {
      players: selectedPlayers,
      hasGuests,
      hasRegisteredPlayers,
      isHostSubscriber,
    };

    router.push({
      pathname: '/games/game-session',
      params: { gameData: JSON.stringify(gameData) },
    });
  };

  const renderPlayerList = () => {
    const registeredPlayers = selectedPlayers.filter(p => !isGuestPlayer(p));
    const guestPlayers = selectedPlayers.filter(isGuestPlayer);

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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePlayer(player.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePlayer(player.id)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderGuestNotice = () => {
    if (selectedPlayers.some(isGuestPlayer)) {
      return (
        <View style={styles.noticeContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.noticeText}>
            Guests can't save rounds. Only registered users can track stats.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Game</Text>
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Add Players</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="search" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map(user => (
              <TouchableOpacity
                key={user.id}
                style={styles.resultItem}
                onPress={() => handleAddPlayer(user)}
              >
                <Text style={styles.resultName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.resultEmail}>{user.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.guestSection}>
        <Text style={styles.sectionTitle}>Add Guest Player</Text>
        <View style={styles.guestInputs}>
          <TextInput
            style={styles.input}
            placeholder="Guest Name"
            value={guestName}
            onChangeText={setGuestName}
          />
          <TextInput
            style={styles.input}
            placeholder="Guest Email"
            value={guestEmail}
            onChangeText={setGuestEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.guestActions}>
          <TouchableOpacity
            style={[styles.guestButton, styles.inviteButton]}
            onPress={handleInviteGuest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Invite to Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.guestButton, styles.addButton]}
            onPress={handleAddGuest}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              Add Guest (${GUEST_FEE})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderPlayerList()}
      {renderGuestNotice()}

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateGame}
        disabled={selectedPlayers.length === 0}
      >
        <Text style={styles.createButtonText}>Create Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResults: {
    marginTop: 8,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultEmail: {
    fontSize: 14,
    color: '#666',
  },
  guestSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  guestInputs: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  guestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  guestButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteButton: {
    backgroundColor: '#34C759',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  playerLists: {
    padding: 16,
  },
  playerSection: {
    marginBottom: 16,
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
  removeButton: {
    padding: 4,
  },
  createButton: {
    margin: 16,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  noticeText: {
    flex: 1,
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
}); 