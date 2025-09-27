import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { getCustomTheme } from './src/theme/customTheme';

// Initialize MSW for development if enabled
if (__DEV__ && process.env.EXPO_PUBLIC_USE_MSW === 'true') {
  require('./src/mocks/browser');
}

// Query db client with optimized settings for React Native
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep cached data for 10 minutes
      refetchOnWindowFocus: false, // Disabled for React Native
      refetchOnReconnect: 'always', // Refetch when the network reconnects
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getCustomTheme(colorScheme);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}