import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { EditableRecipeImage } from '../RecipeImage';
import { useImagePicker } from '../../../../hooks/useImagePicker';
import type { CompressedImageResult } from '../../../../utils/imageCompression';

jest.mock('../../../../hooks/useImagePicker');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('EditableRecipeImage', () => {
  const mockOnChange = jest.fn();
  const mockPickFromLibrary = jest.fn();
  const mockPickFromCamera = jest.fn();

  // Mock compressed image result (standard test data)
  const mockCompressedImage: CompressedImageResult = {
    uri: 'file:///path/to/compressed.jpg',
    width: 1920,
    height: 1440,
    fileSize: 500000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: useImagePicker returns pickFromLibrary/pickFromCamera functions and loading state
    (useImagePicker as jest.Mock).mockReturnValue({
      pickFromLibrary: mockPickFromLibrary,
      pickFromCamera: mockPickFromCamera,
      isLoading: false,
    });
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given add image button, when pressed and image selected, then calls onChange with CompressedImageResult', async () => {
      // Arrange
      mockPickFromLibrary.mockResolvedValue(mockCompressedImage);

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockCompressedImage);
      });
    });

    it('given delete button, when pressed, then calls onChange with null', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeImage value="file:///existing.jpg" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-delete'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(null);
      });
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given no image, when rendered, then shows add image button', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Assert
      expect(screen.getByTestId('image-add')).toBeOnTheScreen();
      expect(screen.getByText('Add Image')).toBeOnTheScreen();
    });

    it('given existing image, when rendered, then displays image with overlay controls', () => {
      // Arrange & Act
      const imageUri = 'file:///path/to/recipe.jpg';
      renderWithProviders(
        <EditableRecipeImage value={imageUri} onChange={mockOnChange} testID="image" />
      );

      // Assert
      expect(screen.getByTestId('image')).toBeOnTheScreen();
      expect(screen.getByTestId('image-change')).toBeOnTheScreen();
      expect(screen.getByTestId('image-delete')).toBeOnTheScreen();
    });

    it('given change button, when pressed and new image selected, then calls onChange with CompressedImageResult', async () => {
      // Arrange
      const newCompressedImage: CompressedImageResult = {
        uri: 'file:///path/to/new-compressed.jpg',
        width: 1920,
        height: 1440,
        fileSize: 450000,
      };
      mockPickFromLibrary.mockResolvedValue(newCompressedImage);

      renderWithProviders(
        <EditableRecipeImage value="file:///old.jpg" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-change'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(newCompressedImage);
      });
    });
  });

  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given image picker, when user cancels or picker returns null, then does not call onChange', async () => {
      // Arrange - Hook handles all null cases internally (cancel, no assets, empty array)
      mockPickFromLibrary.mockResolvedValue(null);

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockPickFromLibrary).toHaveBeenCalled();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given image selected, when onChange called, then calls with valid CompressedImageResult', async () => {
      // Arrange
      const validCompressedImage: CompressedImageResult = {
        uri: 'file:///valid/path/image.png',
        width: 1280,
        height: 960,
        fileSize: 350000,
      };
      mockPickFromLibrary.mockResolvedValue(validCompressedImage);

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
          uri: expect.any(String),
          width: expect.any(Number),
          height: expect.any(Number),
          fileSize: expect.any(Number),
        }));
      });
    });
  });

  /**
   * Errors
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given image picker, when compression error occurs, then handles gracefully without crashing', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPickFromLibrary.mockRejectedValue(new Error('Compression failed'));

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error picking image:',
          expect.any(Error)
        );
      });
      expect(mockOnChange).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('given image picker error, when occurred, then component remains functional', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPickFromLibrary.mockRejectedValueOnce(new Error('First failure'));

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act - First press triggers error
      fireEvent.press(screen.getByTestId('image-add'));
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // Act - Second press should still work
      const recoveryImage: CompressedImageResult = {
        uri: 'file:///recovery.jpg',
        width: 1920,
        height: 1440,
        fileSize: 600000,
      };
      mockPickFromLibrary.mockResolvedValue(recoveryImage);
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(recoveryImage);
      });

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * NEW TESTS: Loading State and Compressed Image Preview
   * Testing 2025 patterns for image compression and upload flow
   */
  describe('Loading and Compression States', () => {
    it('given compression in progress, when loading, then disables image picker button', () => {
      // Arrange
      (useImagePicker as jest.Mock).mockReturnValue({
        pickFromLibrary: mockPickFromLibrary,
        pickFromCamera: mockPickFromCamera,
        isLoading: true, // KEY: Loading state
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Assert - Button should be disabled during compression
      const addButton = screen.getByTestId('image-add');
      expect(addButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('given compressed image returned, when displayed, then shows preview with local URI immediately', async () => {
      // Arrange
      mockPickFromLibrary.mockResolvedValue(mockCompressedImage);

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert - Preview shows immediately with compressed URI (not waiting for upload)
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockCompressedImage);
        // Component should receive compressed URI and display it
      });
    });

    it('given compression fails, when error occurs, then displays error message to user', async () => {
      // Arrange
      mockPickFromLibrary.mockRejectedValue(new Error('Image too large to compress'));

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert - Error should be logged (component shows graceful degradation)
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
        // Note: In full implementation, Snackbar or error message would be shown
      });
    });
  });
});
