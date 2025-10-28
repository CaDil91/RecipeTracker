import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { fontConfig } from './typography';

/**
 * Earthy Natural Color Palette
 * Forest green primary with warm chromatic grays - perfect for a food app
 */
const customColors = {
  light: {
    // Main background - soft warm white
    background: '#FAFAF9',

    // Card surfaces - light warm neutral
    surface: '#F5F4F2',
    surfaceVariant: '#E7E5E2',

    // Primary - Deep forest green (main brand color)
    primary: '#304529',
    primaryContainer: '#B8CCB0',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#0D1F0A',

    // Secondary - Warm medium gray for secondary actions
    secondary: '#6E6C69',
    secondaryContainer: '#E5E3E0',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#272624',

    // Tertiary - Warm charcoal gray (chromatic, subtle warmth)
    tertiary: '#4A4745',
    tertiaryContainer: '#D1CFCC',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#1B1918',

    // Error - Material Design default (remains accessible)
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',

    // Surface tones
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(47, 48, 55, 0.4)',

    // Outline - warm neutral
    outline: '#787673',
    outlineVariant: '#C8C6C3',

    // Editable text - deep espresso brown for edit mode (earthy, warm)
    editableText: '#3E2723',
    editableContainer: '#E8E6E3',

    // Elevation levels for consistent depth (subtle warm tint)
    elevation: {
      level0: 'transparent',
      level1: '#F7F6F4',
      level2: '#F3F2EF',
      level3: '#EFEEE9',
      level4: '#EAE9E4',
      level5: '#E6E5DF',
    },
  },
  dark: {
    // Main background - deep warm black
    background: '#131312',

    // Card surfaces - dark warm neutral
    surface: '#1C1C1A',
    surfaceVariant: '#46444F',

    // Primary - Light sage green for dark mode
    primary: '#9CB892',
    primaryContainer: '#1E3118',
    onPrimary: '#0A1608',
    onPrimaryContainer: '#B8CCB0',

    // Secondary - Light warm gray for dark mode
    secondary: '#C9C7C4',
    secondaryContainer: '#515050',
    onSecondary: '#1E1D1C',
    onSecondaryContainer: '#E5E3E0',

    // Tertiary - Light warm gray (chromatic) for dark mode accents
    tertiary: '#B8B6B3',
    tertiaryContainer: '#353331',
    onTertiary: '#161514',
    onTertiaryContainer: '#D1CFCC',

    // Error - Material Design default (dark mode)
    error: '#FFB4AB',
    errorContainer: '#93000A',
    onError: '#690005',
    onErrorContainer: '#FFDAD6',

    // Surface tones
    surfaceDisabled: 'rgba(231, 224, 236, 0.12)',
    onSurfaceDisabled: 'rgba(231, 224, 236, 0.38)',
    backdrop: 'rgba(47, 48, 55, 0.4)',

    // Outline - warm neutral for dark mode
    outline: '#918F8C',
    outlineVariant: '#47454F',

    // Editable text - light espresso for edit mode (dark mode)
    editableText: '#D7CCC8',
    editableContainer: '#2C2A28',

    // Elevation levels for consistent depth (subtle warm tint)
    elevation: {
      level0: 'transparent',
      level1: '#201F1E',
      level2: '#252423',
      level3: '#2A2927',
      level4: '#2F2D2B',
      level5: '#34322F',
    },
  },
};

// Configure Poppins fonts for react-native-paper
const fonts = configureFonts({ config: fontConfig });

/**
 * Custom theme type that extends MD3Theme with our additional colors
 */
export type CustomTheme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    editableText: string;
    editableContainer: string;
  };
};

/**
 * Create a custom light theme with:
 * - Minimal neutral color palette
 * - Poppins typography
 * - MD3 elevation system
 */
export const customLightTheme: CustomTheme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors.light,
  },
};

/**
 * Create a custom dark theme with:
 * - Minimal neutral color palette (dark mode optimized)
 * - Poppins typography
 * - MD3 elevation system
 */
export const customDarkTheme: CustomTheme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors.dark,
  },
};

/**
 * Helper function to get the appropriate theme based on a color scheme
 * @param colorScheme - 'light', 'dark', null, or undefined
 * @returns The appropriate theme (defaults to light theme)
 */
export const getCustomTheme = (colorScheme: 'light' | 'dark' | null | undefined): CustomTheme => {
  return colorScheme === 'dark' ? customDarkTheme : customLightTheme;
};