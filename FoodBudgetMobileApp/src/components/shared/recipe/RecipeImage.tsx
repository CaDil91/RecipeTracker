import React from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import * as ExpoImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomTheme } from '../../../theme/customTheme';
import { spacing } from '../../../theme/typography';
import { useEditableBounce } from '../../../hooks/useEditableBounce';
import { useEditableHaptics } from '../../../hooks/useEditableHaptics';

/**
 * RecipeImage - Co-located VIEW and EDIT components for recipe image
 *
 * Following Kent C. Dodds' Colocation Principle:
 * - Both modes share exact spacing/layout for seamless transitions
 * - Testing transitions is easier when components are together
 * - Shared styles guarantee visual consistency
 *
 * VIEW mode: Simple static image display
 * EDIT mode: Image picker with overlay controls and bounce animation
 */

// ============================================================================
// VIEW MODE
// ============================================================================

export interface ViewRecipeImageProps {
  imageUrl: string;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * ViewRecipeImage - Static image display for VIEW mode
 *
 * Features:
 * - Full-width responsive image
 * - 4:3 aspect ratio (240 px height)
 * - Rounded corners for MD3 aesthetic
 * - Only renders when imageUrl is provided
 * - Accessibility support with optional alt text
 */
export const ViewRecipeImage: React.FC<ViewRecipeImageProps> = ({ imageUrl, testID, accessibilityLabel }) => {
  const theme = useTheme<CustomTheme>();
  const styles = createStyles(theme);

  if (!imageUrl) return null;

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessible={!!accessibilityLabel}
      />
    </View>
  );
};

// ============================================================================
// EDIT MODE
// ============================================================================

export interface EditableRecipeImageProps {
  value: string;
  onChange: (value: string) => void;
  testID?: string;
}

/**
 * EditableRecipeImage - Editable image with picker and controls
 *
 * Features:
 * - Bounce animation on mount using react-native-reanimated
 * - Edit and delete button overlay when image exists
 * - "Add Image" dashed button when no image
 * - Haptic feedback on interactions
 * - Image picker integration with expo-image-picker
 * - 4:3 aspect ratio with quality optimization
 */
export const EditableRecipeImage: React.FC<EditableRecipeImageProps> = ({ value, onChange, testID }) => {
  const theme = useTheme<CustomTheme>();
  const styles = createStyles(theme);
  const bounceStyle = useEditableBounce();
  const { triggerLight, triggerMedium } = useEditableHaptics();

  const handleChangeImage = async () => {
    try {
      // Haptic feedback on tap
      await triggerLight();

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleDeleteImage = async () => {
    await triggerMedium();
    onChange('');
  };

  return (
    <>
      {value ? (
        <Animated.View style={[styles.editableImageContainer, bounceStyle]}>
          <Image
            source={{ uri: value }}
            style={styles.image}
            resizeMode="cover"
            testID={testID}
            accessibilityLabel="Recipe image"
            accessible
          />
          {/* Overlay controls */}
          <View style={styles.imageOverlay}>
            <IconButton
              icon="image-edit"
              mode="contained"
              containerColor={theme.colors.primaryContainer}
              iconColor={theme.colors.onPrimaryContainer}
              size={24}
              onPress={handleChangeImage}
              testID={`${testID}-change`}
              accessibilityLabel="Change recipe image"
            />
            <IconButton
              icon="delete"
              mode="contained"
              containerColor={theme.colors.errorContainer}
              iconColor={theme.colors.onErrorContainer}
              size={24}
              onPress={handleDeleteImage}
              testID={`${testID}-delete`}
              accessibilityLabel="Delete recipe image"
            />
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={handleChangeImage}
          style={styles.addImageButton}
          testID={`${testID}-add`}
          accessibilityLabel="Add recipe image"
          accessibilityHint="Tap to select an image from your photo library"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="image-plus"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Add Image
          </Text>
        </Pressable>
      )}
    </>
  );
};

// ============================================================================
// SHARED STYLES
// ============================================================================

const createStyles = (theme: CustomTheme) => StyleSheet.create({
  // Image container - consistent spacing for both VIEW and EDIT modes
  imageContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 240, // 30 * 8 px grid (4:3 aspect ratio)
    borderRadius: 12,
  },
  // EDIT mode only - container with position for overlay
  editableImageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: spacing.lg,
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addImageButton: {
    width: '100%',
    height: 240, // Same as image height
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.outlineVariant,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.colors.elevation.level1,
  },
});
