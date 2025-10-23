import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';

/**
 * OfflineBanner component
 *
 * Displays a banner at the top of the screen when the device is offline.
 * Uses platform-specific offline detection to match App.tsx configuration.
 *
 * Web: Uses navigator.onLine only (isConnected)
 * Native: Uses both connection and internet reachability (handles captive portals)
 *
 * Handles edge cases:
 * - Wi-Fi connected but no internet (captive portal) - Native only
 * - Airplane mode
 * - Cellular with no data
 *
 * @example
 * ```tsx
 * <View>
 *   <OfflineBanner />
 *   <App />
 * </View>
 * ```
 */
export const OfflineBanner: React.FC = () => {
  const theme = useTheme();
  const netInfo = useNetInfo();

  // Check if offline: must match the inverse of the online detection logic in App.tsx
  // Web: Only check isConnected (navigator.onLine is sufficient with proper NetInfo config)
  // Native: Check both isConnected AND isInternetReachable (handles captive portals)
  const isOffline = Platform.OS === 'web'
    ? netInfo.isConnected !== true
    : netInfo.isConnected !== true || netInfo.isInternetReachable === false;

  if (!isOffline) {
    return null;
  }

  return (
    <View
      testID="offline-banner"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.errorContainer,
        },
      ]}
    >
      <Text
        variant="bodySmall"
        style={[styles.text, { color: theme.colors.onErrorContainer }]}
      >
        You're offline - No internet connection
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    textAlign: 'center',
    fontWeight: '500',
  },
});