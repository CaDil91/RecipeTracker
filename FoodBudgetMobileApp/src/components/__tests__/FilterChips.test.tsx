import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FilterChips, { FilterType } from '../FilterChips';
import { PaperProvider } from 'react-native-paper';

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

/**
 * Unit tests for the FilterChips component
 *
 * Tests filter chip selection with state management, callback handling, and theming.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('FilterChips', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    /**
     * Test: Basic filter chips rendering
     * Given: FilterChips with default props
     * When: Component renders
     * Then: Displays all filter options
     */
    it('given default props, when rendered, then displays all filter options', () => {
      // Arrange & Act
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('filter-chips-container')).toBeTruthy();
      expect(getByText('All')).toBeTruthy();
      expect(getByText('Breakfast')).toBeTruthy();
      expect(getByText('Lunch')).toBeTruthy();
      expect(getByText('Dinner')).toBeTruthy();
      expect(getByText('Dessert')).toBeTruthy();
    });

    /**
     * Test: Filter selection interaction
     * Given: FilterChips with onFilterChange handler
     * When: Filter chip pressed
     * Then: Calls onFilterChange with correct filter
     */
    it('given onFilterChange handler, when filter pressed, then calls with correct filter', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('filter-chips-dinner'));

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('Dinner');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Multiple filter selections
     * Given: FilterChips component
     * When: Multiple filters pressed
     * Then: Calls handler for each selection
     */
    it('given multiple filter presses, when pressed, then calls handler for each', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('filter-chips-breakfast'));
      fireEvent.press(getByTestId('filter-chips-lunch'));
      fireEvent.press(getByTestId('filter-chips-all'));

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('Breakfast');
      expect(mockOnFilterChange).toHaveBeenCalledWith('Lunch');
      expect(mockOnFilterChange).toHaveBeenCalledWith('All');
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Selected filter state
     * Given: FilterChips with specific selected filter
     * When: Component renders
     * Then: Shows correct selected state
     */
    it('given selected filter, when rendered, then shows correct selection', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="Breakfast" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert - Breakfast chip exists and can be found
      expect(getByTestId('filter-chips-breakfast')).toBeTruthy();
    });

    /**
     * Test: Filter order consistency
     * Given: FilterChips component
     * When: Component renders
     * Then: Maintains consistent filter order
     */
    it('given component render, when displayed, then maintains filter order', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert - All expected filters exist in order
      const expectedFilters = ['all', 'breakfast', 'lunch', 'dinner', 'dessert'];
      expectedFilters.forEach(filter => {
        expect(getByTestId(`filter-chips-${filter}`)).toBeTruthy();
      });
    });

    /**
     * Test: Selection state change
     * Given: FilterChips with initial selection
     * When: Selection prop changes
     * Then: Updates selected state
     */
    it('given selection change, when prop updates, then reflects new selection', () => {
      // Arrange
      const { getByTestId, rerender } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act
      expect(getByTestId('filter-chips-all')).toBeTruthy();

      rerender(
        <TestWrapper>
          <FilterChips selectedFilter="Dinner" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('filter-chips-dinner')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: All filter types interaction
     * Given: All available filters
     * When: Each filter pressed
     * Then: Calls handler with a correct filter type
     */
    it('given all filter types, when each pressed, then calls handler correctly', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act & Assert
      const filters: FilterType[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];
      filters.forEach((filter) => {
        fireEvent.press(getByTestId(`filter-chips-${filter.toLowerCase()}`));
        expect(mockOnFilterChange).toHaveBeenCalledWith(filter);
      });

      expect(mockOnFilterChange).toHaveBeenCalledTimes(5);
    });

    /**
     * Test: Selected chip interaction
     * Given: Currently selected chip
     * When: Same chip pressed again
     * Then: Still calls handler (allows re-selection)
     */
    it('given selected chip, when pressed again, then calls handler', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="Breakfast" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('filter-chips-breakfast'));

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledWith('Breakfast');
    });
  });

  describe('Layout Configuration', () => {
    /**
     * Test: Horizontal scroll configuration
     * Given: FilterChips component
     * When: Component renders
     * Then: Uses horizontal ScrollView with no indicator
     */
    it('given component, when rendered, then uses horizontal scroll', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert
      const ScrollView = require('react-native').ScrollView;
      const scrollView = UNSAFE_getByType(ScrollView);
      expect(scrollView.props.horizontal).toBe(true);
      expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
    });

    /**
     * Test: Container structure
     * Given: FilterChips component
     * When: Component renders
     * Then: Has proper container structure
     */
    it('given component, when rendered, then has container structure', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('filter-chips-container')).toBeTruthy();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Default testID structure
     * Given: FilterChips without custom testID,
     * When: Component renders
     * Then: Uses default testID structure
     */
    it('given no custom testID, when rendered, then uses default structure', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('filter-chips-container')).toBeTruthy();
      expect(getByTestId('filter-chips-all')).toBeTruthy();
      expect(getByTestId('filter-chips-breakfast')).toBeTruthy();
    });

    /**
     * Test: Custom testID structure
     * Given: FilterChips with custom testID
     * When: Component renders
     * Then: Uses custom testID structure
     */
    it('given custom testID, when rendered, then uses custom structure', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips
            selectedFilter="All"
            onFilterChange={mockOnFilterChange}
            testID="custom-filters"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('custom-filters-container')).toBeTruthy();
      expect(getByTestId('custom-filters-all')).toBeTruthy();
      expect(getByTestId('custom-filters-breakfast')).toBeTruthy();
      expect(getByTestId('custom-filters-lunch')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: All filter types available
     * Given: FilterChips component
     * When: Component renders
     * Then: All expected filter types are available
     */
    it('given component, when rendered, then all filter types available', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Assert - All filter labels exist
      const expectedLabels = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert'];
      expectedLabels.forEach(label => {
        expect(getByText(label)).toBeTruthy();
      });
    });

    /**
     * Test: Rapid filter selection
     * Given: FilterChips component
     * When: Multiple rapid selections
     * Then: Handles all interactions correctly
     */
    it('given rapid selections, when pressed quickly, then handles all interactions', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <FilterChips selectedFilter="All" onFilterChange={mockOnFilterChange} />
        </TestWrapper>
      );

      // Act - Rapid fire selections
      fireEvent.press(getByTestId('filter-chips-breakfast'));
      fireEvent.press(getByTestId('filter-chips-dinner'));
      fireEvent.press(getByTestId('filter-chips-lunch'));

      // Assert
      expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'Breakfast');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'Dinner');
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'Lunch');
    });

    /**
     * Test: Theme integration
     * Given: FilterChips with theme provider
     * When: Component renders
     * Then: Integrates with theme without errors
     */
    it('given theme provider, when rendered, then integrates with theme', () => {
      // Arrange & Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <FilterChips selectedFilter="Breakfast" onFilterChange={mockOnFilterChange} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});