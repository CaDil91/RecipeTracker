import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { getCustomTheme } from './src/theme/customTheme';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getCustomTheme(colorScheme);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}