import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Custom brand colors with complementary chromatic grays
const customColors = {
  light: {
    // Main background - very light warm gray
    background: '#FAFBFC',

    // Card surfaces - light chromatic gray with subtle blue undertones
    surface: '#F4F6F8',
    surfaceVariant: '#E8EAED',

    // Keep MD3 primary for consistency
    primary: MD3LightTheme.colors.primary,

    // Elevation levels for consistent depth
    elevation: {
      level0: 'transparent',
      level1: '#F6F7F9',
      level2: '#F2F4F6',
      level3: '#EDEEF1',
      level4: '#E9EAED',
      level5: '#E5E6E9',
    },
  },
  dark: {

    // Main background - deep cool gray
    background: '#0F1013',

    // Card surfaces - medium chromatic gray with warm undertones
    surface: '#1A1C20',
    surfaceVariant: '#252830',

    // Keep MD3 primary for consistency
    primary: MD3DarkTheme.colors.primary,

    // Elevation levels for consistent depth
    elevation: {
      level0: 'transparent',
      level1: '#1E2024',
      level2: '#22252A',
      level3: '#262A30',
      level4: '#2A2E35',
      level5: '#2E323A',
    },
  },
};

// Create a custom light theme
export const customLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: customColors.light.background,
    surface: customColors.light.surface,
    surfaceVariant: customColors.light.surfaceVariant,
    primary: customColors.light.primary,
    elevation: customColors.light.elevation,
  },
};

// Create a custom dark theme
export const customDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: customColors.dark.background,
    surface: customColors.dark.surface,
    surfaceVariant: customColors.dark.surfaceVariant,
    primary: customColors.dark.primary,
    elevation: customColors.dark.elevation,
  },
};

// Helper function to get the appropriate theme based on a color scheme
export const getCustomTheme = (colorScheme: 'light' | 'dark' | null | undefined): MD3Theme => {
  return colorScheme === 'dark' ? customDarkTheme : customLightTheme;
};