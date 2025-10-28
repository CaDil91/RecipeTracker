import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomTheme } from '../../../theme/customTheme';
import { spacing, fontConfig } from '../../../theme/typography';
import { useEditableBounce } from '../../../hooks/useEditableBounce';
import { useEditableHaptics } from '../../../hooks/useEditableHaptics';

/**
 * RecipeServings - Co-located VIEW and EDIT components for recipe servings
 *
 * Following Kent C. Dodds' Colocation Principle:
 * - Both modes use identical icon and text layout
 * - Shared styles ensure consistent typography
 * - EDIT mode adds stepper controls for increment/decrement
 *
 * VIEW mode: Static icon and text display
 * EDIT mode: Icon + text with +/- stepper controls and bounce animation
 */

// ============================================================================
// VIEW MODE
// ============================================================================

export interface ViewRecipeServingsProps {
  servings: number;
  testID?: string;
}

/**
 * ViewRecipeServings - Static servings display for VIEW mode
 *
 * Features:
 * - Account-group icon
 * - Pluralization ("1 serving" vs. "2 servings")
 * - bodyLarge typography
 */
export const ViewRecipeServings: React.FC<ViewRecipeServingsProps> = ({ servings, testID }) => {
  const theme = useTheme<CustomTheme>();
  const effectiveServings = servings || 1;

  return (
    <View style={styles.servingsContainer}>
      <MaterialCommunityIcons
        name="account-group"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="bodyLarge"
        style={styles.servingsText}
        testID={testID}
        accessibilityLabel={`Servings: ${effectiveServings}`}
      >
        {`${effectiveServings} ${effectiveServings === 1 ? 'serving' : 'servings'}`}
      </Text>
    </View>
  );
};

// ============================================================================
// EDIT MODE
// ============================================================================

export interface EditableRecipeServingsProps {
  value: number;
  onChange: (value: number) => void;
  testID?: string;
}

/**
 * EditableRecipeServings - Editable servings with stepper controls
 *
 * Features:
 * - Bounce animation on mount using react-native-reanimated
 * - Stepper controls (+ and - buttons) with green primary color
 * - Min/max validation (1-99 servings)
 * - Haptic feedback on button press
 * - Disabled states for min/max values
 * - Compact button design
 */
export const EditableRecipeServings: React.FC<EditableRecipeServingsProps> = ({ value, onChange, testID }) => {
  const theme = useTheme<CustomTheme>();
  const bounceStyle = useEditableBounce();
  const { triggerLight } = useEditableHaptics();

  const handleIncrement = async () => {
    await triggerLight();
    onChange(Math.min(value + 1, 99)); // Max 99 servings
  };

  const handleDecrement = async () => {
    await triggerLight();
    onChange(Math.max(value - 1, 1)); // Min 1 serving
  };

  return (
    <Animated.View style={[bounceStyle, styles.editableServingsContainer]} testID={testID}>
      <MaterialCommunityIcons
        name="account-group"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
      <Pressable
        onPress={handleDecrement}
        disabled={value <= 1}
        testID={`${testID}-decrement`}
        style={styles.servingsButton}
        accessibilityLabel="Decrease servings"
        accessibilityHint={`Current servings: ${value}. Tap to decrease`}
        accessibilityRole="button"
        accessibilityState={{ disabled: value <= 1 }}
      >
        <MaterialCommunityIcons
          name="minus-circle-outline"
          size={18}
          color={value <= 1 ? theme.colors.onSurfaceDisabled : theme.colors.primary}
        />
      </Pressable>
      <Text
        variant="bodyLarge"
        style={[
          styles.servingsText,
          {
            color: theme.colors.editableText,
          },
        ]}
        accessibilityLabel={`Servings: ${value}`}
      >
        {`${value} ${value === 1 ? 'serving' : 'servings'}`}
      </Text>
      <Pressable
        onPress={handleIncrement}
        disabled={value >= 99}
        testID={`${testID}-increment`}
        style={styles.servingsButton}
        accessibilityLabel="Increase servings"
        accessibilityHint={`Current servings: ${value}. Tap to increase`}
        accessibilityRole="button"
        accessibilityState={{ disabled: value >= 99 }}
      >
        <MaterialCommunityIcons
          name="plus-circle-outline"
          size={18}
          color={value >= 99 ? theme.colors.onSurfaceDisabled : theme.colors.primary}
        />
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// SHARED STYLES
// ============================================================================

const styles = StyleSheet.create({
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editableServingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Tighter spacing for compact stepper
  },
  servingsButton: {
    padding: 4, // Minimal padding to keep it compact
  },
  servingsText: {
    fontFamily: fontConfig.bodyLarge.fontFamily,
  },
});
