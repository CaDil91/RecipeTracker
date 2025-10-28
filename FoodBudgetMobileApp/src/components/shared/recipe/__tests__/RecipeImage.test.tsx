import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { EditableRecipeImage } from '../RecipeImage';
import * as ExpoImagePicker from 'expo-image-picker';

jest.mock('expo-image-picker');

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('EditableRecipeImage', () => {
  const mockOnChange = jest.fn();
  const mockLaunchImageLibraryAsync = ExpoImagePicker.launchImageLibraryAsync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given add image button, when pressed and image selected, then calls onChange with URI', async () => {
      // Arrange
      const mockImageUri = 'file:///path/to/image.jpg';
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockImageUri }],
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockImageUri);
      });
    });

    it('given delete button, when pressed, then calls onChange with empty string', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeImage value="file:///existing.jpg" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-delete'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('');
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

    it('given change button, when pressed and new image selected, then calls onChange with new URI', async () => {
      // Arrange
      const newImageUri = 'file:///path/to/new-image.jpg';
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: newImageUri }],
      });

      renderWithProviders(
        <EditableRecipeImage value="file:///old.jpg" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-change'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(newImageUri);
      });
    });
  });

  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given image picker, when user cancels, then does not call onChange', async () => {
      // Arrange
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: true,
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('given image picker, when result has no assets, then does not call onChange', async () => {
      // Arrange
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: null,
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('given image picker, when assets array is empty, then does not call onChange', async () => {
      // Arrange
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [],
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  /**
   * Boundaries
   * Test minimum, maximum, and threshold values for your domain
   */
  describe('Boundaries', () => {
    it('given image picker launched, when called, then uses correct configuration', async () => {
      // Arrange
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: true,
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      });
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given image selected, when onChange called, then only calls with valid URI', async () => {
      // Arrange
      const validUri = 'file:///valid/path/image.png';
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: validUri }],
      });

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(validUri);
      });
    });
  });

  /**
   * Errors
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given image picker, when error thrown, then handles gracefully without crashing', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLaunchImageLibraryAsync.mockRejectedValue(new Error('Picker failed'));

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
      mockLaunchImageLibraryAsync.mockRejectedValueOnce(new Error('First failure'));

      renderWithProviders(
        <EditableRecipeImage value="" onChange={mockOnChange} testID="image" />
      );

      // Act - First press triggers error
      fireEvent.press(screen.getByTestId('image-add'));
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // Act - Second press should still work
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///recovery.jpg' }],
      });
      fireEvent.press(screen.getByTestId('image-add'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('file:///recovery.jpg');
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
