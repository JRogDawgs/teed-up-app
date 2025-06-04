import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithGoogleAsync } from '../lib/auth';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogleAsync();
      router.replace('/');
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center p-4">
      <View className="w-full max-w-sm">
        {/* Logo and Title */}
        <View className="items-center mb-12">
          <Ionicons name="golf" size={64} color="#15803d" />
          <Text className="text-3xl font-bold text-gray-900 mt-4">Tee'd Up</Text>
          <Text className="text-gray-600 text-center mt-2">
            Your personal golf scorecard
          </Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          className={`flex-row items-center justify-center bg-white border border-gray-300 rounded-lg p-4 mb-4 ${
            loading ? 'opacity-50' : ''
          }`}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#15803d" />
          ) : (
            <>
              <Image
                source={require('../assets/google-logo.png')}
                className="w-6 h-6 mr-3"
              />
              <Text className="text-gray-900 font-medium">
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <Text className="text-red-600 text-center mt-4">{error}</Text>
        )}

        {/* Terms and Privacy */}
        <Text className="text-gray-500 text-center text-sm mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
} 