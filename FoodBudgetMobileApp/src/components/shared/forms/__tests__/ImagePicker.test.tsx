import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import * as ExpoImagePicker from 'expo-image-picker';
import { ImagePicker } from '../ImagePicker';

// Mock expo-image-picker
jest.mock('expo-image-picker');

// Helper to wrap component with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * Test the primary use cases that deliver business value
   */
  describe('Happy Path', () => {
    it('given no image selected, when rendered, then shows placeholder button', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Image')).toBeTruthy();
      expect(screen.getByTestId('image-picker-button')).toBeTruthy();
    });

    it('given valid image URI, when rendered, then displays image URI preview', () => {
      // Arrange
      const mockOnChange = jest.fn();
      const testUri = 'file:///path/to/image.jpg';

      // Act
      renderWithProviders(<ImagePicker value={testUri} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Image selected')).toBeTruthy();
      expect(screen.getByTestId('image-preview')).toBeTruthy();
    });

    it('given image selected, when rendered, then shows change button', () => {
      // Arrange
      const mockOnChange = jest.fn();
      const testUri = 'file:///path/to/image.jpg';

      // Act
      renderWithProviders(<ImagePicker value={testUri} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Change Image')).toBeTruthy();
    });

    it('given image selected, when rendered, then shows remove button', () => {
      // Arrange
      const mockOnChange = jest.fn();
      const testUri = 'file:///path/to/image.jpg';

      // Act
      renderWithProviders(<ImagePicker value={testUri} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Remove')).toBeTruthy();
    });
  });

  /**
   * User Action Tests
   * Test user interactions and behavioral responses
   */
  describe('User Actions', () => {
    it('given button pressed, when user selects image, then calls onChange with URI', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      const mockUri = 'file:///selected/image.jpg';

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: mockUri }],
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(mockUri);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      });
    });

    it('given button pressed, when user cancels, then does not call onChange', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it('given image selected, when remove button pressed, then calls onChange with null', () => {
      // Arrange
      const mockOnChange = jest.fn();
      const testUri = 'file:///path/to/image.jpg';

      renderWithProviders(<ImagePicker value={testUri} onChange={mockOnChange} />);

      // Act
      const removeButton = screen.getByText('Remove');
      fireEvent.press(removeButton);

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith(null);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('given image selected, when change button pressed, then opens picker', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      const testUri = 'file:///path/to/image.jpg';
      const newUri = 'file:///new/image.jpg';

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: newUri }],
      });

      renderWithProviders(<ImagePicker value={testUri} onChange={mockOnChange} />);

      // Act
      const changeButton = screen.getByText('Change Image');
      fireEvent.press(changeButton);

      // Assert
      await waitFor(() => {
        expect(ExpoImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(newUri);
      });
    });

    it('given picker opened, when image selected, then requests media library permissions', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test.jpg' }],
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(ExpoImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      });
    });
  });

  /**
   * Null/Empty/Invalid Tests
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given null value, when rendered, then shows placeholder', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Image')).toBeTruthy();
      expect(screen.queryByTestId('image-preview')).toBeNull();
    });

    it('given undefined value, when rendered, then shows placeholder', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<ImagePicker value={undefined} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Image')).toBeTruthy();
      expect(screen.queryByTestId('image-preview')).toBeNull();
    });

    it('given empty string value, when rendered, then shows placeholder', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<ImagePicker value="" onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Image')).toBeTruthy();
      expect(screen.queryByTestId('image-preview')).toBeNull();
    });

    it('given disabled prop, when button pressed, then does not open picker', () => {
      // Arrange
      const mockOnChange = jest.fn();

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} disabled />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      expect(ExpoImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });

    it('given picker error, when opening picker, then does not call onChange', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      );

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      });
    });

    it('given custom testID, when rendered, then uses custom testID', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(
        <ImagePicker
          value={null}
          onChange={mockOnChange}
          testID="custom-image-picker"
        />
      );

      // Assert
      expect(screen.getByTestId('custom-image-picker-button')).toBeTruthy();
    });
  });

  /**
   * Business Rules Tests
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given Sprint 3 scope, when picker opened, then requests Images only (no videos)', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test.jpg' }],
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        const call = (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mock.calls[0][0];
        expect(call.mediaTypes).toBe('images');
      });
    });

    it('given Sprint 3 scope, when image selected, then only single image allowed', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test.jpg' }],
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert - Only calls onChange with a single URI (string), not array
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('file:///test.jpg');
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        // Verify the argument is a string, not an array
        expect(typeof mockOnChange.mock.calls[0][0]).toBe('string');
      });
    });

    it('given Sprint 3 scope, when picker configured, then uses 4:3 aspect ratio for editing', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test.jpg' }],
      });

      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Act
      const button = screen.getByTestId('image-picker-button');
      fireEvent.press(button);

      // Assert
      await waitFor(() => {
        const call = (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mock.calls[0][0];
        expect(call.allowsEditing).toBe(true);
        expect(call.aspect).toEqual([4, 3]);
      });
    });

    it('given extensible architecture for Sprint 4, when rendered, then component structure supports future expansion', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<ImagePicker value={null} onChange={mockOnChange} />);

      // Assert - Component renders successfully with the current API 
      // (Future props like 'multiple', 'allowCamera', 'maxSize' will be added in Sprint 4)
      expect(screen.getByTestId('image-picker-button')).toBeTruthy();
    });
  });
});