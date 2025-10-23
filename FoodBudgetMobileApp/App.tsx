import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme, View, ActivityIndicator, Platform } from 'react-native';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { getCustomTheme } from './src/theme/customTheme';
import WebContainer from './src/components/WebContainer';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ErrorFallbackScreen } from './src/screens/ErrorFallbackScreen';
import { OfflineBanner } from './src/components/OfflineBanner';

// Initialize MSW for development if enabled
if (__DEV__ && process.env.EXPO_PUBLIC_USE_MSW === 'true') {
  require('./src/mocks/browser');
}

// Configure NetInfo for web platform
// Web: Use Google's connectivity check endpoint (industry standard, avoids 404 errors)
// This is the same endpoint used by Android/Chrome OS for internet reachability
// Native: Use default reachability checks (handles captive portals properly)
if (Platform.OS === 'web') {
  NetInfo.configure({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityTest: async (response) => response.status === 204,
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityLongTimeout: 60 * 1000, // 60s - Check every 60s when online
    reachabilityRequestTimeout: 15 * 1000, // 15s timeout for the check itself
    useNativeReachability: false,
  });
}

// Configure TanStack Query to use NetInfo for offline detection (2025 standard)
// This replaces manual health checks - let TanStack Query handle retries and pausing
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    // Web: Only check isConnected (navigator.onLine) since reachability is now properly configured
    // Native: Check both isConnected AND isInternetReachable (handles captive portals)
    const hasInternet = Platform.OS === 'web'
      ? state.isConnected === true
      : state.isConnected === true && state.isInternetReachable !== false;
    setOnline(hasInternet);
  });
});

// Query client with optimized settings for React Native
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed requests twice
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep cached data for 10 minutes
      refetchOnWindowFocus: false, // Disabled for React Native
      refetchOnReconnect: 'always', // Refetch when the network reconnects
      networkMode: 'online', // Pause queries when offline, resume on reconnect
    },
    mutations: {
      retry: 2, // Increased from 1 - mutations are critical (data loss risk)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1 s, 2 s, max 30s
      networkMode: 'online', // Pause mutations when offline
    },
  },
});

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getCustomTheme(colorScheme);

  // Load MaterialCommunityIcons font - Expo handles web bundling automatically
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallbackScreen
          error={null}
          errorInfo={null}
          onReset={() => {
            // Reload the app
            if (Platform.OS === 'web') {
              window.location.reload();
            }
          }}
        />
      }
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <OfflineBanner />
            <WebContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </WebContainer>
          </PaperProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}