/**
 * useImagePicker Hook
 *
 * Custom hook for picking and compressing images using expo-image-picker.
 *
 * Features:
 * - Image selection from library or camera with aspect ratio 4:3
 * - Automatic compression using expo-image-manipulator
 * - Loading state during compression
 * - Error handling
 * - Returns compressed image with dimensions and file size
 * - Returns loading state for UI feedback
 * - Handles errors gracefully
 * - Single responsibility: pick and compress
 */

import {useState} from 'react';
import * as ExpoImagePicker from 'expo-image-picker';
import {CompressedImageResult, compressImage} from '../utils/imageCompression';

export interface UseImagePickerReturn {
  pickFromLibrary: () => Promise<CompressedImageResult | null>;
  pickFromCamera: () => Promise<CompressedImageResult | null>;
  isLoading: boolean;
}

/**
 * Hook for picking and compressing images from a library or camera
 *
 * @returns Object with pickFromLibrary, pickFromCamera functions and isLoading state
 *
 * @example
 * ```tsx
 * const { pickFromLibrary, pickFromCamera, isLoading } = useImagePicker();
 *
 * const handleSelectFromLibrary = async () => {
 *   const result = await pickFromLibrary();
 *   if (result) {
 *     setImage(result);
 *   }
 * };
 *
 * const handleTakePhoto = async () => {
 *   const result = await pickFromCamera();
 *   if (result) {
 *     setImage(result);
 *   }
 * };
 * ```
 */
export const useImagePicker = (): UseImagePickerReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const pickFromLibrary = async (): Promise<CompressedImageResult | null> => {
    setIsLoading(true);
    try {        
      // Launch image library picker
      let result;
      try {
        result = await ExpoImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1, // High quality for picker, compress after
        });
      } catch (pickerError) {
        console.error('Error picking image from library:', pickerError);
        return null;
      }

      // User cancelled
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const selectedImage = result.assets[0];

      // Step 2: Compress the selected image
      // Note: Compression errors propagate to caller for proper error handling
        return await compressImage(selectedImage.uri, {
          width: selectedImage.width,
          height: selectedImage.height,
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromCamera = async (): Promise<CompressedImageResult | null> => {
    setIsLoading(true);
    try {
      // Step 1: Launch camera
      let result;
      try {
        result = await ExpoImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1, // High quality for camera, compress after
        });
      } catch (cameraError) {
        // Camera errors (permission denied, etc.) - log and return null
        console.error('Error picking image from camera:', cameraError);
        return null;
      }

      // User cancelled
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const selectedImage = result.assets[0];

      // Step 2: Compress the selected image
      // Note: Compression errors propagate to caller for proper error handling
        return await compressImage(selectedImage.uri, {
          width: selectedImage.width,
          height: selectedImage.height,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { pickFromLibrary, pickFromCamera, isLoading };
};