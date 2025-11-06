import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme, View, ActivityIndicator, Platform } from 'react-native';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { getCustomTheme } from './src/theme/customTheme';
import WebContainer from './src/components/WebContainer';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ErrorFallbackScreen } from './src/screens/ErrorFallbackScreen';
import { OfflineBanner } from './src/components/OfflineBanner';

// MSAL imports (web only)
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './src/lib/auth/msalConfig.web';

// Initialize MSW for development if enabled
if (__DEV__ && process.env.EXPO_PUBLIC_USE_MSW === 'true') {
  require('./src/mocks/browser');
}

// Configure NetInfo for web platform
// Web: Use same-origin URL to avoid CORS issues with clients3.google.com on GitHub Pages
// Native: Use default reachability checks (handles captive portals properly)
if (Platform.OS === 'web') {
  NetInfo.configure({
    reachabilityUrl: window.location.href,
    reachabilityTest: async (response) => response.status >= 200 && response.status < 400,
    reachabilityShortTimeout: 2 * 1000, // 2s
    reachabilityLongTimeout: 5 * 1000, // 5 s - Check every 5s when online
    reachabilityRequestTimeout: 3 * 1000, // 3 s timeout for the check itself
    useNativeReachability: false,
  });
}

// Configure TanStack Query to use NetInfo + navigator.onLine for offline detection (2025 standard)
// This replaces manual health checks - let TanStack Query handle retries and pausing
onlineManager.setEventListener((setOnline) => {
  const handleState = (state: any) => {
    // Combine navigator.onLine (instant) with NetInfo (authoritative)
    const navOnline = typeof navigator !== 'undefined' && 'onLine' in navigator ? navigator.onLine : true;
    const netInfoOnline = state?.isInternetReachable ?? state?.isConnected ?? true;

    // Web: Prefer navigator.onLine combined with NetInfo reachability
    // Native: Check both isConnected AND isInternetReachable (handles captive portals)
    const hasInternet = Platform.OS === 'web'
      ? navOnline && netInfoOnline
      : state.isConnected === true && state.isInternetReachable !== false;

    setOnline(Boolean(hasInternet));
  };

  const unsubscribe = NetInfo.addEventListener(handleState);

  // Fetch initial state
  NetInfo.fetch().then(handleState).catch(() => {
    // Fallback to navigator.onLine if NetInfo fails
    setOnline(Boolean(navigator?.onLine));
  });

  return () => unsubscribe();
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

// Initialize MSAL instance for web authentication (Phase 1: Web only)
// Phase 2 will add mobile authentication with react-native-msal
const msalInstance = Platform.OS === 'web'
  ? new PublicClientApplication(msalConfig)
  : null;

/**
 * Conditional MSAL Provider wrapper
 * - Web: Wraps children with MsalProvider for authentication
 * - Mobile: Returns children unwrapped (Phase 2 will add mobile auth)
 */
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (Platform.OS === 'web' && msalInstance) {
    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
  }
  return <>{children}</>;
};

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getCustomTheme(colorScheme);
  const [msalInitialized, setMsalInitialized] = React.useState(false);

  // Initialize MSAL before rendering the app
  // CRITICAL: MSAL Browser v4.x requires initialization before use
  React.useEffect(() => {
    if (Platform.OS === 'web' && msalInstance) {
      msalInstance.initialize().then(() => {
        setMsalInitialized(true);
      }).catch((error) => {
        console.error('MSAL initialization error:', error);
        // Still set initialized to true to avoid infinite loading
        setMsalInitialized(true);
      });
    } else {
      // Non-web platforms don't need MSAL initialization
      setMsalInitialized(true);
    }
  }, []);

  // Load custom fonts (Poppins) and icon fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    ...MaterialCommunityIcons.font,
  });

  // Show loading indicator while fonts or MSAL are loading
  if (!fontsLoaded || !msalInitialized) {
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
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={theme}>
              <OfflineBanner />
              <WebContainer>
                <AppNavigator />
                <StatusBar style="auto" />
              </WebContainer>
            </PaperProvider>
          </QueryClientProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}