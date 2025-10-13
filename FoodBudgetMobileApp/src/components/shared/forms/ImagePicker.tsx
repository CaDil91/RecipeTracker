import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import * as ExpoImagePicker from 'expo-image-picker';

/**
 * Sprint 3: Single image selection with basic editing
 * Sprint 4: Will support multiple images, camera access, and advanced options
 */

export interface ImagePickerProps {
  value: string | null | undefined;
  onChange: (uri: string | null) => void;
  disabled?: boolean;
  testID?: string;

  // Sprint 4 extensibility props (not implemented yet)
  // multiple?: boolean;
  // allowCamera?: boolean;
  // maxSize?: number;
  // aspectRatio?: [number, number];
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  disabled = false,
  testID = 'image-picker',
}) => {
  const theme = useTheme();
  const hasImage = Boolean(value && value.trim());

  const handlePickImage = async () => {
    if (disabled) return;

    try {
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
      // Error handled gracefully - don't call onChange
      console.error('Error picking image:', error);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {hasImage ? (
        <>
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: value as string }}
              style={styles.preview}
              testID="image-preview"
              resizeMode="cover"
            />
            <Text variant="bodyMedium" style={styles.selectedText}>
              Image selected
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handlePickImage}
              disabled={disabled}
              style={styles.button}
              testID={`${testID}-button`}
            >
              Change Image
            </Button>
            <Button
              mode="text"
              onPress={handleRemoveImage}
              disabled={disabled}
              style={styles.button}
              textColor={theme.colors.error}
            >
              Remove
            </Button>
          </View>
        </>
      ) : (
        <Button
          mode="outlined"
          onPress={handlePickImage}
          disabled={disabled}
          icon="image-plus"
          style={styles.selectButton}
          contentStyle={styles.selectButtonContent}
          testID={`${testID}-button`}
        >
          Select Image
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedText: {
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  selectButton: {
    minHeight: 56,
    justifyContent: 'center',
  },
  selectButtonContent: {
    minHeight: 56,
  },
});