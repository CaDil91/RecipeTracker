import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { CustomTheme } from '../../../theme/customTheme';
import { spacing, fontConfig } from '../../../theme/typography';
import { useEditableBounce } from '../../../hooks/useEditableBounce';
import { useEditableHaptics } from '../../../hooks/useEditableHaptics';

/**
 * RecipeTitle - Co-located VIEW and EDIT components for recipe title
 *
 * Following Kent C. Dodds' Colocation Principle:
 * - Both modes use identical typography and spacing
 * - Shared styles ensure seamless visual transitions
 * - Testing both modes together is easier
 *
 * VIEW mode: Static headline text
 * EDIT mode: TextInput styled to match headline exactly, with form outline and bounce animation
 */

// ============================================================================
// VIEW MODE
// ============================================================================

export interface ViewRecipeTitleProps {
  title: string;
  testID?: string;
}

/**
 * ViewRecipeTitle - Static title display for VIEW mode
 *
 * Features:
 * - headlineLarge typography (32px)
 * - Poppins SemiBold font
 * - Consistent padding to match EDIT mode spacing
 */
export const ViewRecipeTitle: React.FC<ViewRecipeTitleProps> = ({ title, testID }) => {
  return (
    <Text
      variant="headlineLarge"
      style={[
        styles.title,
        {
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
      ]}
      testID={testID}
      accessibilityLabel="Recipe title"
      accessibilityRole="header"
    >
      {title || 'Untitled Recipe'}
    </Text>
  );
};

// ============================================================================
// EDIT MODE
// ============================================================================

export interface EditableRecipeTitleProps {
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

/**
 * EditableRecipeTitle - Editable title with form outline
 *
 * Features:
 * - Bounce animation on mount using react-native-reanimated
 * - Form outline styling (border, rounded corners, padding)
 * - Espresso brown text color for visual emphasis
 * - Haptic feedback on focus
 * - TextInput styled to match headlineLarge typography exactly
 */
export const EditableRecipeTitle: React.FC<EditableRecipeTitleProps> = ({ value, onChange, testID }) => {
  const theme = useTheme<CustomTheme>();
  const bounceStyle = useEditableBounce();
  const { triggerLight } = useEditableHaptics();

  const handleFocus = async () => {
    // Haptic feedback on focus
    await triggerLight();
  };

  return (
    <Animated.View style={bounceStyle}>
      <RNTextInput
        value={value}
        onChangeText={onChange}
        onFocus={handleFocus}
        placeholder="Recipe Title"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={[
          styles.title,
          styles.editableTitle,
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
        accessibilityLabel="Recipe title"
        accessibilityHint="Enter a name for this recipe"
      />
    </Animated.View>
  );
};

// ============================================================================
// SHARED STYLES
// ============================================================================

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
    fontFamily: fontConfig.headlineLarge.fontFamily,
  },
  // Editable title - TextInput styled to match Text exactly
  editableTitle: {
    fontSize: fontConfig.headlineLarge.fontSize,
    lineHeight: fontConfig.headlineLarge.lineHeight,
    letterSpacing: fontConfig.headlineLarge.letterSpacing,
    fontWeight: fontConfig.headlineLarge.fontWeight,
    padding: 0, // Remove default TextInput padding
    margin: 0, // Remove default margins
    borderWidth: 0, // Remove border (will be added inline)
    outlineWidth: 0, // Remove web outline
  },
});
