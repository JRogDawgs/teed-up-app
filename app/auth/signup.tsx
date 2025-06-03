import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { signup } from '../../lib/auth';
import { router } from 'expo-router';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      await signup(name, email, password);
      router.replace('/');
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-masters-green mb-8 text-center">Create Account</Text>
        
        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2">Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          {error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            className="bg-masters-green p-4 rounded-lg mt-4"
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4"
            onPress={() => router.push('/auth/login')}
          >
            <Text className="text-masters-green text-center">
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 