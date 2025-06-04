import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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