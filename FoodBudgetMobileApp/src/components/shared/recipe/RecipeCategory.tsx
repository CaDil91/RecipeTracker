import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Chip, Text, Portal, Dialog, Button as PaperButton, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { CustomTheme } from '../../../theme/customTheme';
import { spacing, fontConfig } from '../../../theme/typography';
import { useEditableBounce } from '../../../hooks/useEditableBounce';
import { useEditableHaptics } from '../../../hooks/useEditableHaptics';

/**
 * RecipeCategory - Co-located VIEW and EDIT components for recipe category
 *
 * Following Kent C. Dodds' Colocation Principle:
 * - Both modes use identical Chip styling
 * - Shared RECIPE_CATEGORIES constant
 * - Shared styles ensure a consistent appearance
 *
 * VIEW mode: Static chip display
 * EDIT mode: Interactive chip with modal picker and bounce animation
 */

// Common recipe categories shared by both modes
export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Appetizer',
  'Main Course',
  'Side Dish',
  'Salad',
  'Soup',
  'Beverage',
  'Baking',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
];

// ============================================================================
// VIEW MODE
// ============================================================================

export interface ViewRecipeCategoryProps {
  category: string;
  testID?: string;
}

/**
 * ViewRecipeCategory - Static category chip for VIEW mode
 *
 * Features:
 * - Material Design 3 Chip component
 * - Primary color theme
 * - Only renders when a category exists
 */
export const ViewRecipeCategory: React.FC<ViewRecipeCategoryProps> = ({ category, testID }) => {
  const theme = useTheme<CustomTheme>();
  const styles = createStyles(theme);

  if (!category) return null;

  return (
    <Chip
      mode="flat"
      style={styles.categoryChip}
      textStyle={styles.categoryChipText}
      testID={testID}
      accessibilityLabel={`Recipe category: ${category}`}
    >
      {category}
    </Chip>
  );
};

// ============================================================================
// EDIT MODE
// ============================================================================

export interface EditableRecipeCategoryProps {
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

/**
 * EditableRecipeCategory - Editable category with modal picker
 *
 * Features:
 * - Bounce animation on mount using react-native-reanimated
 * - Green primary color chip styling
 * - Modal dialog with scrollable category list
 * - Haptic feedback on interactions
 * - Portal rendering for modal (above containers)
 * - Highlights selected category in modal
 */
export const EditableRecipeCategory: React.FC<EditableRecipeCategoryProps> = ({ value, onChange, testID }) => {
  const theme = useTheme<CustomTheme>();
  const styles = createStyles(theme);
  const [showPicker, setShowPicker] = useState(false);
  const bounceStyle = useEditableBounce();
  const { triggerLight } = useEditableHaptics();

  const handlePress = async () => {
    // Haptic feedback on press
    await triggerLight();
    setShowPicker(true);
  };

  const handleSelectCategory = async (category: string) => {
    await triggerLight();
    onChange(category);
    setShowPicker(false);
  };

  return (
    <>
      <Animated.View style={bounceStyle}>
        <Chip
          mode="flat"
          onPress={handlePress}
          style={[
            styles.categoryChip,
            {
              backgroundColor: theme.colors.primaryContainer,
              borderColor: theme.colors.primary,
              borderWidth: 1,
            },
          ]}
          textStyle={[
            styles.categoryChipText,
            { color: theme.colors.primary },
          ]}
          testID={testID}
          accessibilityLabel={value ? `Recipe category: ${value}` : 'Select recipe category'}
          accessibilityHint="Tap to select a category from the list"
          accessibilityRole="button"
        >
          {value || 'Select Category'}
        </Chip>
      </Animated.View>

      {/* Category Picker Modal */}
      <Portal>
        <Dialog
          visible={showPicker}
          onDismiss={() => setShowPicker(false)}
          style={styles.categoryDialog}
        >
          <Dialog.Title>Select Category</Dialog.Title>
          <Dialog.ScrollArea style={styles.categoryScrollArea}>
            <ScrollView contentContainerStyle={styles.categoryList}>
              {RECIPE_CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => handleSelectCategory(category)}
                  style={[
                    styles.categoryOption,
                    value === category && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                >
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.categoryOptionText,
                      value === category && {
                        color: theme.colors.primary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowPicker(false)}>
              Cancel
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

// ============================================================================
// SHARED STYLES
// ============================================================================

const createStyles = (theme: CustomTheme) => StyleSheet.create({
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    fontFamily: fontConfig.labelLarge.fontFamily,
  },
  // EDIT mode - Category picker modal
  categoryDialog: {
    maxHeight: '80%',
  },
  categoryScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  categoryList: {
    paddingVertical: spacing.sm,
  },
  categoryOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  categoryOptionText: {
    fontFamily: fontConfig.bodyLarge.fontFamily,
  },
});
