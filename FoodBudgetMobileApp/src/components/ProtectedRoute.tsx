import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 *
 * Wraps protected content and enforces authentication requirement.
 * - Shows loading indicator during authentication initialization
 * - Shows sign-in UI if the user is not authenticated
 * - Renders children if the user is authenticated
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <YourProtectedScreen />
 * </ProtectedRoute>
 * ```
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, signIn } = useAuth();
  const theme = useTheme();

  // Show loading indicator during authentication initialization
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="loading-indicator">
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show a sign-in prompt if the user is not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="sign-in-prompt">
        <View style={styles.signInContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Sign In Required
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Please sign in to access this content
          </Text>
          <Button
            mode="contained"
            onPress={signIn}
            style={styles.signInButton}
            testID="sign-in-button"
          >
            Sign In with Microsoft
          </Button>
        </View>
      </View>
    );
  }

  // User is authenticated - render-protected content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
  },
  signInContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  signInButton: {
    marginTop: 8,
  },
});