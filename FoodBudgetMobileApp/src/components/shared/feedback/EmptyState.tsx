import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'folder-open',
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon source={icon} size={64} />
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {message && (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    marginTop: 24,
  },
});