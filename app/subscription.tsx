import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SUBSCRIPTION_PLANS, createSubscriptionCheckout } from '../lib/stripe';
import { useAuth } from '../lib/auth';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const router = useRouter();
  const { user } = useAuth();

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const { url } = await createSubscriptionCheckout(
        SUBSCRIPTION_PLANS[selectedPlan].id,
        user?.stripeCustomerId
      );
      
      // Open Stripe Checkout in browser
      router.push(url);
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert(
        'Subscription Error',
        'There was an error processing your subscription. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Get unlimited saved rounds and advanced statistics
        </Text>
      </View>

      <View style={styles.plansContainer}>
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'MONTHLY' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('MONTHLY')}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>${SUBSCRIPTION_PLANS.MONTHLY.amount}/mo</Text>
          </View>
          <View style={styles.planFeatures}>
            <Text style={styles.featureText}>• Unlimited saved rounds</Text>
            <Text style={styles.featureText}>• Advanced statistics</Text>
            <Text style={styles.featureText}>• Full guest support</Text>
            <Text style={styles.featureText}>• Priority support</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'YEARLY' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('YEARLY')}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Yearly</Text>
            <Text style={styles.planPrice}>${SUBSCRIPTION_PLANS.YEARLY.amount}/yr</Text>
            <Text style={styles.savings}>Save 30%</Text>
          </View>
          <View style={styles.planFeatures}>
            <Text style={styles.featureText}>• All monthly features</Text>
            <Text style={styles.featureText}>• 30% discount</Text>
            <Text style={styles.featureText}>• Annual billing</Text>
            <Text style={styles.featureText}>• Best value</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.terms}>
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel anytime.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  plansContainer: {
    gap: 20,
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  planHeader: {
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  savings: {
    fontSize: 14,
    color: '#34C759',
    marginTop: 5,
  },
  planFeatures: {
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  terms: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
}); 