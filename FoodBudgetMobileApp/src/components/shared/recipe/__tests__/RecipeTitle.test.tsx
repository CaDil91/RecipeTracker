import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ViewRecipeTitle, EditableRecipeTitle } from '../RecipeTitle';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ViewRecipeTitle', () => {
  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given no title, when rendered, then shows "Untitled Recipe"', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeTitle title="" testID="title" />);

      // Assert
      expect(screen.getByText('Untitled Recipe')).toBeOnTheScreen();
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given title provided, when rendered, then displays title', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeTitle title="Pasta Carbonara" testID="title" />);

      // Assert
      expect(screen.getByText('Pasta Carbonara')).toBeOnTheScreen();
    });
  });
});

describe('EditableRecipeTitle', () => {
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
    it('given text input, when user types, then calls onChange with new value', () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeTitle value="" onChange={mockOnChange} testID="title" />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('title'), 'New Recipe Title');

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('New Recipe Title');
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given value provided, when rendered, then displays value in input', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeTitle value="Existing Title" onChange={mockOnChange} testID="title" />
      );

      // Assert
      const input = screen.getByTestId('title');
      expect(input.props.value).toBe('Existing Title');
    });

    it('given no value, when rendered, then shows placeholder', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeTitle value="" onChange={mockOnChange} testID="title" />
      );

      // Assert
      const input = screen.getByTestId('title');
      expect(input.props.placeholder).toBe('Recipe Title');
    });
  });

  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given empty string, when user clears input, then calls onChange with empty string', () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeTitle value="Some Title" onChange={mockOnChange} testID="title" />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('title'), '');

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });
});
