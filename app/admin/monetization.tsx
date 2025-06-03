import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth';
import { checkAdminAccess, getAdminStats } from '../../lib/admin';

export default function MonetizationDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const { user, signOut } = useAuth();

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!checkAdminAccess(user)) {
      setLoading(false);
      return;
    }

    await loadData();
  };

  const loadData = async () => {
    try {
      const stats = await getAdminStats();
      setData(stats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!checkAdminAccess(user)) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Ionicons name="lock-closed" size={48} color="#FF3B30" />
        <Text style={styles.unauthorizedTitle}>Unauthorized</Text>
        <Text style={styles.unauthorizedText}>
          You don't have permission to access this page.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Monetization Dashboard</Text>
          <View style={styles.adminTag}>
            <Text style={styles.adminTagText}>Admin</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Subscribers</Text>
          <Text style={styles.statValue}>{data.totalSubscribers}</Text>
          <View style={styles.statBreakdown}>
            <Text style={styles.breakdownText}>
              Monthly: {data.subscriptionBreakdown.monthly}
            </Text>
            <Text style={styles.breakdownText}>
              Yearly: {data.subscriptionBreakdown.yearly}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Guest Games Paid</Text>
          <Text style={styles.statValue}>{data.totalGuestGames}</Text>
          <Text style={styles.statSubtext}>
            ${(data.totalGuestGames * 0.25).toFixed(2)} in guest fees
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Monthly Revenue</Text>
          <Text style={styles.statValue}>${data.monthlyRevenue.total.toFixed(2)}</Text>
          <View style={styles.statBreakdown}>
            <Text style={styles.breakdownText}>
              Subscriptions: ${data.monthlyRevenue.subscriptions.toFixed(2)}
            </Text>
            <Text style={styles.breakdownText}>
              Guest Fees: ${data.monthlyRevenue.guestFees.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {data.recentActivity.map((activity: any, index: number) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons
                name={activity.type === 'subscription' ? 'card' : 'people'}
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityType}>
                {activity.type === 'subscription'
                  ? `${activity.plan.charAt(0).toUpperCase() + activity.plan.slice(1)} Subscription`
                  : 'Guest Fee Payment'}
              </Text>
              <Text style={styles.activityAmount}>
                ${activity.amount.toFixed(2)}
                {activity.type === 'guest_fee' && ` (${activity.guests} guest)`}
              </Text>
            </View>
            <Text style={styles.activityDate}>
              {new Date(activity.date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
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
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  adminTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  statsGrid: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  statSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statBreakdown: {
    marginTop: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recentActivity: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  activityAmount: {
    fontSize: 14,
    color: '#007AFF',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
}); 