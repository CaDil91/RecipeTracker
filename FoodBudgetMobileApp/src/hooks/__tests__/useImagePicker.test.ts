import { renderHook } from '@testing-library/react-native';
import { useImagePicker } from '../useImagePicker';
import * as ExpoImagePicker from 'expo-image-picker';
import * as ImageCompression from '../../utils/imageCompression';

/**
 * Unit tests for the useImagePicker hook
 *
 * Tests that useImagePicker correctly launches camera/library and compresses images.
 * Uses a solitary testing approach with mocked external dependencies.
 *
 * Risk-Based Priority: HIGH
 * - Critical user workflow (image selection)
 * - Error handling complexity (picker and compression)
 * - Memory management (cleanup after selection)
 */

jest.mock('expo-image-picker');
jest.mock('../../utils/imageCompression');

describe('useImagePicker', () => {
  const mockLaunchImageLibraryAsync = ExpoImagePicker.launchImageLibraryAsync as jest.Mock;
  const mockLaunchCameraAsync = ExpoImagePicker.launchCameraAsync as jest.Mock;
  const mockCompressImage = ImageCompression.compressImage as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given pickFromLibrary called, when image selected and compressed, then returns compressed image result', async () => {
      // Arrange
      const mockImageUri = 'file:///path/to/image.jpg';
      const mockCompressedUri = 'file:///path/to/compressed.jpg';

      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockImageUri,
            width: 3840,
            height: 2160,
          },
        ],
      });

      mockCompressImage.mockResolvedValue({
        uri: mockCompressedUri,
        width: 1920,
        height: 1080,
      });

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromLibrary();

      // Assert
      expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      expect(mockCompressImage).toHaveBeenCalledWith(mockImageUri, {
        width: 3840,
        height: 2160,
      });
      expect(compressedImage).toEqual({
        uri: mockCompressedUri,
        width: 1920,
        height: 1080,
      });
    });

    it('given pickFromCamera called, when image selected and compressed, then returns compressed image result', async () => {
      // Arrange
      const mockImageUri = 'file:///path/to/camera-image.jpg';
      const mockCompressedUri = 'file:///path/to/compressed-camera.jpg';

      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockImageUri,
            width: 4000,
            height: 3000,
          },
        ],
      });

      mockCompressImage.mockResolvedValue({
        uri: mockCompressedUri,
        width: 1920,
        height: 1440,
      });

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromCamera();

      // Assert
      expect(mockLaunchCameraAsync).toHaveBeenCalled();
      expect(mockCompressImage).toHaveBeenCalledWith(mockImageUri, {
        width: 4000,
        height: 3000,
      });
      expect(compressedImage).toEqual({
        uri: mockCompressedUri,
        width: 1920,
        height: 1440,
      });
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given pickFromLibrary called, when user cancels selection, then returns null', async () => {
      // Arrange
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromLibrary();

      // Assert
      expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      expect(mockCompressImage).not.toHaveBeenCalled();
      expect(compressedImage).toBeNull();
    });

    it('given pickFromCamera called, when user cancels selection, then returns null', async () => {
      // Arrange
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: true,
      });

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromCamera();

      // Assert
      expect(mockLaunchCameraAsync).toHaveBeenCalled();
      expect(mockCompressImage).not.toHaveBeenCalled();
      expect(compressedImage).toBeNull();
    });
  });

  /**
   * Errors
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given pickFromLibrary called, when picker throws error, then logs error and returns null', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const pickerError = new Error('Library access denied');

      mockLaunchImageLibraryAsync.mockRejectedValue(pickerError);

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromLibrary();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error picking image from library:',
        pickerError
      );
      expect(compressedImage).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('given pickFromCamera called, when picker throws error, then logs error and returns null', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const cameraError = new Error('Camera permission denied');

      mockLaunchCameraAsync.mockRejectedValue(cameraError);

      const { result } = renderHook(() => useImagePicker());

      // Act
      const compressedImage = await result.current.pickFromCamera();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error picking image from camera:',
        cameraError
      );
      expect(compressedImage).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('given image selected, when compression fails, then propagates compression error', async () => {
      // Arrange
      const compressionError = new Error('Image compression failed');

      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///path/to/image.jpg',
            width: 3840,
            height: 2160,
          },
        ],
      });

      mockCompressImage.mockRejectedValue(compressionError);

      const { result } = renderHook(() => useImagePicker());

      // Act & Assert
      await expect(result.current.pickFromLibrary()).rejects.toThrow(
        'Image compression failed'
      );
    });
  });
});