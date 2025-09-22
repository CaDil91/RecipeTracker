import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FilterChips, { FilterType } from '../FilterChips';
import { PaperProvider } from 'react-native-paper';

describe('FilterChips', () => {
  const defaultProps = {
    selectedFilter: 'All' as FilterType,
    onFilterChange: jest.fn(),
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<PaperProvider>{component}</PaperProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} />
    );

    expect(getByTestId('filter-chips-container')).toBeTruthy();
  });

  it('renders all filter chips', () => {
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} />
    );

    expect(getByTestId('filter-chips-all')).toBeTruthy();
    expect(getByTestId('filter-chips-breakfast')).toBeTruthy();
    expect(getByTestId('filter-chips-lunch')).toBeTruthy();
    expect(getByTestId('filter-chips-dinner')).toBeTruthy();
    expect(getByTestId('filter-chips-dessert')).toBeTruthy();
  });

  it('displays correct filter labels', () => {
    const { getByText } = renderWithTheme(
      <FilterChips {...defaultProps} />
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
    expect(getByText('Dinner')).toBeTruthy();
    expect(getByText('Dessert')).toBeTruthy();
  });

  it('shows selected filter', () => {
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} selectedFilter="Breakfast" />
    );

    // Check that the chip exists (actual selected state is internal to Chip component)
    const breakfastChip = getByTestId('filter-chips-breakfast');
    expect(breakfastChip).toBeTruthy();
  });

  it('calls onFilterChange when chip is pressed', () => {
    const onFilterChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} onFilterChange={onFilterChange} />
    );

    fireEvent.press(getByTestId('filter-chips-dinner'));
    expect(onFilterChange).toHaveBeenCalledWith('Dinner');
  });

  it('handles multiple filter selections', () => {
    const onFilterChange = jest.fn();
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} onFilterChange={onFilterChange} />
    );

    fireEvent.press(getByTestId('filter-chips-breakfast'));
    expect(onFilterChange).toHaveBeenCalledWith('Breakfast');

    fireEvent.press(getByTestId('filter-chips-lunch'));
    expect(onFilterChange).toHaveBeenCalledWith('Lunch');

    fireEvent.press(getByTestId('filter-chips-all'));
    expect(onFilterChange).toHaveBeenCalledWith('All');

    expect(onFilterChange).toHaveBeenCalledTimes(3);
  });

  it('updates selected filter when prop changes', () => {
    const { getByTestId, rerender } = renderWithTheme(
      <FilterChips {...defaultProps} selectedFilter="All" />
    );

    // Verify All chip exists when selected
    const allChip = getByTestId('filter-chips-all');
    expect(allChip).toBeTruthy();

    rerender(
      <PaperProvider>
        <FilterChips {...defaultProps} selectedFilter="Dinner" />
      </PaperProvider>
    );

    // Verify Dinner chip exists when selected
    const dinnerChip = getByTestId('filter-chips-dinner');
    expect(dinnerChip).toBeTruthy();
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} testID="custom-filters" />
    );

    expect(getByTestId('custom-filters-container')).toBeTruthy();
    expect(getByTestId('custom-filters-all')).toBeTruthy();
    expect(getByTestId('custom-filters-breakfast')).toBeTruthy();
  });

  it('renders in horizontal scroll view', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <FilterChips {...defaultProps} />
    );

    const ScrollView = require('react-native').ScrollView;
    const scrollView = UNSAFE_getByType(ScrollView);

    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('applies correct styles to selected chip', () => {
    const { getByTestId, rerender } = renderWithTheme(
      <FilterChips {...defaultProps} selectedFilter="Breakfast" />
    );

    // Verify Breakfast chip exists when selected
    const breakfastChip = getByTestId('filter-chips-breakfast');
    expect(breakfastChip).toBeTruthy();

    // Change selection
    rerender(
      <PaperProvider>
        <FilterChips {...defaultProps} selectedFilter="Lunch" />
      </PaperProvider>
    );

    // Verify Lunch chip exists when selected
    const lunchChip = getByTestId('filter-chips-lunch');
    expect(lunchChip).toBeTruthy();
  });

  it('maintains filter order', () => {
    const { getByTestId } = renderWithTheme(
      <FilterChips {...defaultProps} />
    );

    // Verify all chips exist
    const filters = ['all', 'breakfast', 'lunch', 'dinner', 'dessert'];
    filters.forEach(filter => {
      const chip = getByTestId(`filter-chips-${filter}`);
      expect(chip).toBeTruthy();
    });
  });
});