import React from 'react';
import { View, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { CustomTheme } from '../../../theme/customTheme';
import { spacing, fontConfig } from '../../../theme/typography';
import { useEditableBounce } from '../../../hooks/useEditableBounce';
import { useEditableHaptics } from '../../../hooks/useEditableHaptics';

/**
 * RecipeInstructions - Co-located VIEW and EDIT components for recipe instructions
 *
 * Following Kent C. Dodds' Colocation Principle:
 * - Both modes share section structure and spacing
 * - Shared styles ensure consistent typography
 * - Static "INSTRUCTIONS" label in both modes
 *
 * VIEW mode: Section with title and static text
 * EDIT mode: Section with title and editable multiline input with bounce animation
 */

// ============================================================================
// VIEW MODE
// ============================================================================

export interface ViewRecipeInstructionsProps {
  instructions: string;
  testID?: string;
}

/**
 * ViewRecipeInstructions - Static instructions display for VIEW mode
 *
 * Features:
 * - Section with uppercase "INSTRUCTIONS" label
 * - bodyLarge typography for content
 * - Consistent padding to match EDIT mode
 * - Only renders when instructions exist
 */
export const ViewRecipeInstructions: React.FC<ViewRecipeInstructionsProps> = ({ instructions, testID }) => {
  if (!instructions) return null;

  return (
    <View style={styles.instructionsSection}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Instructions
      </Text>
      <Text
        variant="bodyLarge"
        style={[
          styles.instructionsText,
          {
            paddingHorizontal: 12,
            paddingVertical: 8,
          },
        ]}
        testID={testID}
        accessibilityLabel="Recipe instructions"
      >
        {instructions}
      </Text>
    </View>
  );
};

// ============================================================================
// EDIT MODE
// ============================================================================

export interface EditableRecipeInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

/**
 * EditableRecipeInstructions - Editable instructions with form outline
 *
 * Features:
 * - Static "INSTRUCTIONS" label (no animation)
 * - Bounce animation on the text input
 * - Form outline styling (border, rounded corners, padding)
 * - Espresso brown text color for visual emphasis
 * - Haptic feedback on focus
 * - Multiline text input (min 8 lines)
 */
export const EditableRecipeInstructions: React.FC<EditableRecipeInstructionsProps> = ({ value, onChange, testID }) => {
  const theme = useTheme<CustomTheme>();
  const bounceStyle = useEditableBounce();
  const { triggerLight } = useEditableHaptics();

  const handleFocus = async () => {
    // Haptic feedback on focus
    await triggerLight();
  };

  return (
    <View style={styles.instructionsSection}>
      {/* Static label - no animation or color change */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Instructions
      </Text>

      {/* Animated editable text */}
      <Animated.View style={bounceStyle}>
        <RNTextInput
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          placeholder="Add cooking instructions..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          style={[
            styles.instructionsText,
            styles.editableInstructions,
            {
              color: theme.colors.editableText, // High contrast to indicate editability
              borderWidth: 1,
              borderColor: theme.colors.outline,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            },
          ]}
          testID={testID}
          accessibilityLabel="Recipe instructions"
          accessibilityHint="Enter cooking instructions for this recipe"
        />
      </Animated.View>
    </View>
  );
};

// ============================================================================
// SHARED STYLES
// ============================================================================

const styles = StyleSheet.create({
  instructionsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    fontFamily: fontConfig.titleMedium.fontFamily,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontFamily: fontConfig.bodyLarge.fontFamily,
    lineHeight: 24,
  },
  // Editable instructions - TextInput styled to match Text exactly
  editableInstructions: {
    fontSize: fontConfig.bodyLarge.fontSize,
    lineHeight: fontConfig.bodyLarge.lineHeight,
    letterSpacing: fontConfig.bodyLarge.letterSpacing,
    fontWeight: fontConfig.bodyLarge.fontWeight,
    fontFamily: fontConfig.bodyLarge.fontFamily,
    padding: 0, // Remove default TextInput padding
    margin: 0, // Remove default margins
    borderWidth: 0, // Remove border (will be added inline)
    outlineWidth: 0, // Remove web outline
    minHeight: 120, // Minimum height for multiline input
  },
});
