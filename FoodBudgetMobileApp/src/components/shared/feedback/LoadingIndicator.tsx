import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  message,
  fullScreen = false,
  style,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={[containerStyle, style]}>
      <ActivityIndicator animating={true} size={size} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inline: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});