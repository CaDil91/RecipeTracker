import React, { useState, ErrorInfo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, TouchableRipple } from 'react-native-paper';

export interface ErrorFallbackScreenProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

/**
 * ErrorFallbackScreen component
 *
 * Displays a user-friendly error screen when the app crashes.
 * Shows error details in development mode.
 *
 * @example
 * ```tsx
 * <ErrorFallbackScreen
 *   error={error}
 *   errorInfo={errorInfo}
 *   onReset={() => window.location.reload()}
 * />
 * ```
 */
export const ErrorFallbackScreen: React.FC<ErrorFallbackScreenProps> = ({
  error,
  errorInfo,
  onReset,
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const isDevelopment = __DEV__ ?? false;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="error-fallback-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {error?.message
              ? "We're sorry for the inconvenience. Please try again."
              : "An unexpected error occurred. Please try again."}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={onReset}
          style={styles.button}
          testID="error-fallback-reset-button"
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to recover from the error"
        >
          Try Again
        </Button>

        {isDevelopment && (
          <Card style={styles.detailsCard} testID="error-fallback-details">
            <TouchableRipple onPress={() => setShowDetails(!showDetails)}>
              <Card.Title
                title="Error Details"
                subtitle="Development mode only"
              />
            </TouchableRipple>
            {showDetails && (
              <Card.Content>
                <Text variant="labelLarge" style={styles.errorLabel}>
                  Error Message:
                </Text>
                <Text variant="bodySmall" style={styles.errorText}>
                  {error?.message || 'Unknown error'}
                </Text>

                {error?.stack && (
                  <>
                    <Text variant="labelLarge" style={[styles.errorLabel, styles.stackLabel]}>
                      Stack Trace:
                    </Text>
                    <Text variant="bodySmall" style={styles.errorText}>
                      {error.stack}
                    </Text>
                  </>
                )}

                {errorInfo?.componentStack && (
                  <>
                    <Text variant="labelLarge" style={[styles.errorLabel, styles.stackLabel]}>
                      Component Stack:
                    </Text>
                    <Text variant="bodySmall" style={styles.errorText}>
                      {errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </Card.Content>
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginBottom: 24,
  },
  detailsCard: {
    marginTop: 16,
  },
  errorLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  stackLabel: {
    marginTop: 16,
  },
  errorText: {
    fontFamily: 'monospace',
    opacity: 0.8,
  },
});