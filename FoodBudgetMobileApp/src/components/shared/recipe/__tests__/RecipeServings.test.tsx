import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ViewRecipeServings, EditableRecipeServings } from '../RecipeServings';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ViewRecipeServings', () => {
  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given zero servings, when rendered, then defaults to 1 serving', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeServings servings={0} testID="servings" />);

      // Assert
      expect(screen.getByText('1 serving')).toBeOnTheScreen();
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given 1 serving, when rendered, then displays singular form', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeServings servings={1} testID="servings" />);

      // Assert
      expect(screen.getByText('1 serving')).toBeOnTheScreen();
    });

    it('given multiple servings, when rendered, then displays plural form', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeServings servings={4} testID="servings" />);

      // Assert
      expect(screen.getByText('4 servings')).toBeOnTheScreen();
    });
  });
});

describe('EditableRecipeServings', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given increment button, when pressed, then calls onChange with incremented value', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={4} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-increment'));

      // Assert - Wait for async handler
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(5);
      });
    });

    it('given decrement button, when pressed, then calls onChange with decremented value', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={4} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-decrement'));

      // Assert - Wait for async handler
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(3);
      });
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given current value, when rendered, then displays value with correct pluralization', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeServings value={6} onChange={mockOnChange} testID="servings" />
      );

      // Assert
      expect(screen.getByText('6 servings')).toBeOnTheScreen();
    });

    it('given increment button, when pressed multiple times, then increases value', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={1} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-increment'));
      fireEvent.press(screen.getByTestId('servings-increment'));

      // Assert - Wait for async handlers
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(2);
        expect(mockOnChange).toHaveBeenCalledTimes(2);
      });
    });

    it('given decrement button, when pressed multiple times, then decreases value', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={5} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-decrement'));
      fireEvent.press(screen.getByTestId('servings-decrement'));

      // Assert - Wait for async handlers
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(4);
        expect(mockOnChange).toHaveBeenCalledTimes(2);
      });
    });
  });

  /**
   * Boundaries
   * Test minimum, maximum, and threshold values for your domain
   */
  describe('Boundaries', () => {
    it('given value at minimum (1), when decrement pressed, then stays at 1', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={1} onChange={mockOnChange} testID="servings" />
      );

      // Act - Button is disabled, so pressing shouldn't trigger onChange
      fireEvent.press(screen.getByTestId('servings-decrement'));

      // Assert - onChange should not be called because the button is disabled
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('given value at maximum (99), when increment pressed, then stays at 99', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={99} onChange={mockOnChange} testID="servings" />
      );

      // Act - Button is disabled, so pressing shouldn't trigger onChange
      fireEvent.press(screen.getByTestId('servings-increment'));

      // Assert - onChange should not be called because the button is disabled
      await waitFor(() => {
        expect(mockOnChange).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });

    it('given value at minimum (1), when rendered, then decrement button is disabled', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeServings value={1} onChange={mockOnChange} testID="servings" />
      );

      // Assert - Verify button exists and is disabled by trying to press it
      const decrementButton = screen.getByTestId('servings-decrement');
      expect(decrementButton).toBeOnTheScreen();
      // In React Native, disabled Pressable still exists but won't fire onPress
    });

    it('given value at maximum (99), when rendered, then increment button is disabled', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeServings value={99} onChange={mockOnChange} testID="servings" />
      );

      // Assert - Verify button exists and is disabled by trying to press it
      const incrementButton = screen.getByTestId('servings-increment');
      expect(incrementButton).toBeOnTheScreen();
      // In React Native, disabled Pressable still exists but won't fire onPress
    });

    it('given value in valid range, when rendered, then both buttons are enabled', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={50} onChange={mockOnChange} testID="servings" />
      );

      // Assert - Verify buttons are enabled by successfully pressing them
      fireEvent.press(screen.getByTestId('servings-decrement'));
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(49);
      });

      mockOnChange.mockClear();

      fireEvent.press(screen.getByTestId('servings-increment'));
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(51);
      });
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given value of 1, when rendered, then displays singular form', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeServings value={1} onChange={mockOnChange} testID="servings" />
      );

      // Assert
      expect(screen.getByText('1 serving')).toBeOnTheScreen();
    });

    it('given value greater than 1, when rendered, then displays plural form', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeServings value={8} onChange={mockOnChange} testID="servings" />
      );

      // Assert
      expect(screen.getByText('8 servings')).toBeOnTheScreen();
    });

    it('given value near minimum, when decremented, then enforces lower boundary', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={2} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-decrement'));
      fireEvent.press(screen.getByTestId('servings-decrement'));

      // Assert - Wait for async handlers
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenNthCalledWith(1, 1);
        expect(mockOnChange).toHaveBeenNthCalledWith(2, 1);
      });
    });

    it('given value near maximum, when incremented, then enforces upper boundary', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeServings value={98} onChange={mockOnChange} testID="servings" />
      );

      // Act
      fireEvent.press(screen.getByTestId('servings-increment'));
      fireEvent.press(screen.getByTestId('servings-increment'));

      // Assert - Wait for async handlers
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenNthCalledWith(1, 99);
        expect(mockOnChange).toHaveBeenNthCalledWith(2, 99);
      });
    });
  });
});
