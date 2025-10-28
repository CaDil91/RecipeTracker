/**
 * Material Design 3 Typography Scale
 *
 * Defines a consistent typography system following MD3 type scale guidelines.
 * Uses Poppins font family with system fonts as fallback.
 *
 * @see https://m3.material.io/styles/typography/type-scale-tokens
 */

export const fontConfig = {
  displayLarge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: '700' as const,
  },
  displayMedium: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  displaySmall: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },

  headlineLarge: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  headlineMedium: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  headlineSmall: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },

  titleLarge: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500' as const,
  },
  titleSmall: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },

  labelLarge: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },
  labelMedium: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },
  labelSmall: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },

  bodyLarge: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as const,
  },
} as const;

/**
 * Material Design 3 spacing system
 * Based on 8px grid (4px for smaller increments)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;