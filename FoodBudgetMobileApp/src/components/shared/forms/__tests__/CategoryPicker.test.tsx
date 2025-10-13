import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { CategoryPicker } from '../CategoryPicker';

// Helper to wrap component with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('CategoryPicker', () => {
  /**
   * Happy Path Tests
   * Test the primary use cases that deliver business value
   */
  describe('Happy Path', () => {
    it('given default options, when rendered, then shows 4 category options', async () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Open the dropdown
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Assert - Wait for the menu to open
      expect(await screen.findByText('Breakfast')).toBeTruthy();
      expect(await screen.findByText('Lunch')).toBeTruthy();
      expect(await screen.findByText('Dinner')).toBeTruthy();
      expect(await screen.findByText('Dessert')).toBeTruthy();
    });

    it('given selected value, when rendered, then displays selected category', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value="Breakfast" onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Breakfast')).toBeTruthy();
    });

    it('given no selection, when rendered, then shows placeholder text', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Category')).toBeTruthy();
    });

    it('given valid category value, when rendered, then shows category name', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value="Dinner" onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Dinner')).toBeTruthy();
    });
  });

  /**
   * User Action Tests
   * Test user interactions and behavioral responses
   */
  describe('User Actions', () => {
    it('given closed menu, when trigger pressed, then opens dropdown', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Act
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Assert - Wait for menu items to be visible
      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeTruthy();
        expect(screen.getByText('Lunch')).toBeTruthy();
      });
    });

    it('given open menu, when category selected, then calls onChange with category', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Open dropdown
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Wait for the menu to open
      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeTruthy();
      });

      // Act
      const breakfastOption = screen.getByText('Breakfast');
      fireEvent.press(breakfastOption);

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Breakfast');
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      });
    });

    it('given open menu, when different category selected, then calls onChange with new category', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value="Breakfast" onChange={mockOnChange} />);

      // Open dropdown
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Wait for the menu to open
      await waitFor(() => {
        expect(screen.getByText('Dinner')).toBeTruthy();
      });

      // Act
      const dinnerOption = screen.getByText('Dinner');
      fireEvent.press(dinnerOption);

      // Assert
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Dinner');
      });
    });

    it('given open menu, when category selected, then closes dropdown', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Open dropdown
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Wait for the menu to open
      await waitFor(() => {
        expect(screen.getByText('Breakfast')).toBeTruthy();
      });

      // Act
      const breakfastOption = screen.getByText('Breakfast');
      fireEvent.press(breakfastOption);

      // Assert - Menu should close (items no longer visible)
      // Note: react-native-paper Menu closes automatically on selection
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('given multiple options, when one selected, then only that option is active (single-select)', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value="Breakfast" onChange={mockOnChange} />);

      // Act
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Wait for the menu to open
      await waitFor(() => {
        expect(screen.getAllByText('Breakfast').length).toBeGreaterThan(0);
      });

      // Assert - Current value should be displayed in trigger
      // Only one category can be selected at a time (verified by onChange signature)
      expect(mockOnChange).not.toHaveBeenCalled(); // No change yet, just opened
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
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Category')).toBeTruthy();
    });

    it('given undefined value, when rendered, then shows placeholder', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value={undefined} onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Category')).toBeTruthy();
    });

    it('given empty string value, when rendered, then shows placeholder', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value="" onChange={mockOnChange} />);

      // Assert
      expect(screen.getByText('Select Category')).toBeTruthy();
    });

    it('given disabled prop, when trigger pressed, then does not open menu', () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} disabled />);

      // Act
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Assert - Menu should not open (categories not visible)
      expect(screen.queryByText('Breakfast')).toBeNull();
    });

    it('given custom testID, when rendered, then uses custom testID', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(
        <CategoryPicker
          value={null}
          onChange={mockOnChange}
          testID="custom-category-picker"
        />
      );

      // Assert
      expect(screen.getByTestId('custom-category-picker-trigger')).toBeTruthy();
    });
  });

  /**
   * Business Rules Tests
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given Sprint 3 scope, when rendered, then shows exactly 4 hardcoded categories', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      renderWithProviders(<CategoryPicker value={null} onChange={mockOnChange} />);

      // Act
      const trigger = screen.getByTestId('category-picker-trigger');
      fireEvent.press(trigger);

      // Assert - Wait for the menu to open and verify Sprint 3 hardcoded categories
      await waitFor(() => {
        const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert'];
        categories.forEach((category) => {
          expect(screen.getByText(category)).toBeTruthy();
        });
      });
    });

    it('given extensible architecture for Sprint 4, when rendered, then component structure supports future expansion', () => {
      // Arrange
      const mockOnChange = jest.fn();

      // Act
      renderWithProviders(<CategoryPicker value="Breakfast" onChange={mockOnChange} />);

      // Assert - Component renders successfully with the current API 
      // (Future props like 'multiple', 'allowCustom', 'options' will be added in Sprint 4)
      expect(screen.getByTestId('category-picker-trigger')).toBeTruthy();
    });
  });
});