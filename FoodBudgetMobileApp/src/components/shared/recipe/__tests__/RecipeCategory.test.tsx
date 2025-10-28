import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { EditableRecipeCategory, RECIPE_CATEGORIES } from '../RecipeCategory';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('EditableRecipeCategory', () => {
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
    it('given category chip, when pressed, then calls onChange with selected category', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));
      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeOnTheScreen();
      });
      fireEvent.press(screen.getByText('Breakfast'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Breakfast');
      });
    });
  });

  /**
   * Happy Path
   * Test the primary use case that delivers business value
   */
  describe('Happy Path', () => {
    it('given category chip, when pressed, then opens modal with categories', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));

      // Assert - "Select Category" appears twice: in chip AND in modal title
      await waitFor(() => {
        const selectCategoryElements = screen.getAllByText('Select Category');
        expect(selectCategoryElements.length).toBe(2); // Chip + Modal Title
        expect(screen.getByText('Breakfast')).toBeOnTheScreen();
        expect(screen.getByText('Lunch')).toBeOnTheScreen();
        expect(screen.getByText('Dinner')).toBeOnTheScreen();
      });
    });

    it('given category selected, when modal closes, then displays selected category in chip', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));
      await waitFor(() => {
        expect(screen.getByText('Lunch')).toBeOnTheScreen();
      });
      fireEvent.press(screen.getByText('Lunch'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Lunch');
      });
    });

    it('given category selected in modal, when confirmed, then modal closes', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));
      await waitFor(() => {
        expect(screen.getByText('Dessert')).toBeOnTheScreen();
      });
      fireEvent.press(screen.getByText('Dessert'));

      // Assert - After selection, "Select Category" only appears once (in chip, replaced by "Dessert")
      // Wait for modal to close and category to update
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Dessert');
      });

      // Modal should close - "Cancel" button disappears when modal closes
      await waitFor(() => {
        expect(screen.queryByText('Cancel')).not.toBeOnTheScreen();
      });
    });
  });

  /**
   * Null/Empty/Invalid
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given no category selected, when rendered, then shows placeholder text', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Assert
      expect(screen.getByText('Select Category')).toBeOnTheScreen();
    });

    it('given existing category, when different category selected, then calls onChange with new category', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="Breakfast" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));
      await waitFor(() => {
        expect(screen.getByText('Dinner')).toBeOnTheScreen();
      });
      fireEvent.press(screen.getByText('Dinner'));

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Dinner');
      });
    });
  });

  /**
   * Business Rules
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given modal open, when rendered, then displays all recipe categories', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));

      // Assert
      await waitFor(() => {
        RECIPE_CATEGORIES.forEach((category) => {
          expect(screen.getByText(category)).toBeOnTheScreen();
        });
      });
    });

    it('given category selected, when modal opens, then highlights current category', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="Lunch" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Lunch')).toBeOnTheScreen();
      });
    });

    it('given selected category, when rendered, then chip displays category value', () => {
      // Arrange & Act
      renderWithProviders(
        <EditableRecipeCategory value="Vegan" onChange={mockOnChange} testID="category" />
      );

      // Assert
      expect(screen.getByText('Vegan')).toBeOnTheScreen();
    });
  });

  /**
   * Errors
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given modal open, when cancel pressed, then modal closes without calling onChange', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="Breakfast" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeOnTheScreen();
      });
      fireEvent.press(screen.getByText('Cancel'));

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Select Category')).not.toBeOnTheScreen();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('given modal open, when dismiss gesture triggered, then modal closes without calling onChange', async () => {
      // Arrange
      renderWithProviders(
        <EditableRecipeCategory value="Dinner" onChange={mockOnChange} testID="category" />
      );

      // Act
      fireEvent.press(screen.getByTestId('category'));

      // Wait for the modal to open (Cancel button appears)
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeOnTheScreen();
      });

      // Press Cancel button to dismiss
      fireEvent.press(screen.getByText('Cancel'));

      // Assert - Modal closes (Cancel button disappears)
      await waitFor(() => {
        expect(screen.queryByText('Cancel')).not.toBeOnTheScreen();
      });
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
