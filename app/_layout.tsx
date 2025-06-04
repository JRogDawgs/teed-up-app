import React, { useEffect, useState } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import { User } from 'firebase/auth';
import { getCurrentUser } from '../lib/auth';

// Create auth context
export const AuthContext = React.createContext<{
  user: User | null;
  initialized: boolean;
}>({
  user: null,
  initialized: false,
});

// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const user = getCurrentUser();
    setUser(user);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/');
    }
  }, [user, initialized, segments]);

  return (
    <AuthContext.Provider value={{ user, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#15803d', // green-600
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Tee\'d Up',
          }}
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#15803d', // green-600
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Tee\'d Up',
        }}
      />
      <Stack.Screen
        name="games/index"
        options={{
          title: 'Games',
        }}
      />
      <Stack.Screen
        name="games/create"
        options={{
          title: 'Create Game',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="games/live"
        options={{
          title: 'Live Game',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
} 