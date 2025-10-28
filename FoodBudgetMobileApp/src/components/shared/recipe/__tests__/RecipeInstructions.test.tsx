import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ViewRecipeInstructions, EditableRecipeInstructions } from '../RecipeInstructions';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('ViewRecipeInstructions', () => {
  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given no instructions, when rendered, then returns null', () => {
      // Arrange & Act
      renderWithProviders(<ViewRecipeInstructions instructions="" testID="instructions" />);

      // Assert
      expect(screen.queryByText('Instructions')).not.toBeOnTheScreen();
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given instructions provided, when rendered, then displays section with label and content', () => {
      // Arrange & Act
      const instructionsText = 'Mix all ingredients and bake at 350°F for 30 minutes.';
      renderWithProviders(
        <ViewRecipeInstructions instructions={instructionsText} testID="instructions" />
      );

      // Assert
      expect(screen.getByText('Instructions')).toBeOnTheScreen();
      expect(screen.getByText(instructionsText)).toBeOnTheScreen();
    });
  });
});

describe('EditableRecipeInstructions', () => {
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
    it('given multiline input, when user types, then calls onChange with new value', () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeInstructions value="" onChange={mockOnChange} testID="instructions" />
      );

      // Act
      const instructionsText = 'Step 1: Prepare ingredients\nStep 2: Mix together';
      fireEvent.changeText(screen.getByTestId('instructions'), instructionsText);

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith(instructionsText);
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given component rendered, when displayed, then shows "Instructions" label', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeInstructions value="" onChange={mockOnChange} testID="instructions" />
      );

      // Assert
      expect(screen.getByText('Instructions')).toBeOnTheScreen();
    });

    it('given value provided, when rendered, then displays value in multiline input', () => {
      // Arrange & Act
      const existingInstructions = 'Existing cooking instructions';
      renderWithProviders(
        <EditableRecipeInstructions
          value={existingInstructions}
          onChange={mockOnChange}
          testID="instructions"
        />
      );

      // Assert
      const input = screen.getByTestId('instructions');
      expect(input.props.value).toBe(existingInstructions);
      expect(input.props.multiline).toBe(true);
    });

    it('given no value, when rendered, then shows placeholder', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeInstructions value="" onChange={mockOnChange} testID="instructions" />
      );

      // Assert
      const input = screen.getByTestId('instructions');
      expect(input.props.placeholder).toBe('Add cooking instructions...');
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
        <EditableRecipeInstructions
          value="Some instructions"
          onChange={mockOnChange}
          testID="instructions"
        />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('instructions'), '');

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given multiline input, when rendered, then configured for multiple lines', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeInstructions value="" onChange={mockOnChange} testID="instructions" />
      );

      // Assert
      const input = screen.getByTestId('instructions');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(8);
      expect(input.props.textAlignVertical).toBe('top');
    });
  });
});
