/**
 * RecipeListScreen - User Workflow Integration Tests
 *
 * These tests focus on user workflows and component integration.
 * Uses simple hook mocking for reliable, fast mobile app testing.
 *
 * Test Philosophy:
 * - User-centric scenarios: Focus on what users actually do
 * - Component integration: Test how components work together
 * - Simple & reliable: Use proven mobile testing approaches
 * - Fast feedback: No network complexity or polyfills needed
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import RecipeListScreen from '../RecipeListScreen';
import { useQuery, useMutation } from '@tanstack/react-query';

// Mock the hooks for specific test scenarios
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('RecipeListScreen - User Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * USER WORKFLOW 1: Loading Recipes from App Data
   * Scenario: User opens the app and sees recipes loaded from state
   */
  it('loads and displays recipes on mount', async () => {
    const mockNavigation = createMockNavigation();

    const { getByText } = renderWithProviders(
      <RecipeListScreen navigation={mockNavigation} />
    );

    // Should display recipes from mocked hook
    await waitFor(() => {
      expect(getByText('Pasta Carbonara')).toBeTruthy();
      expect(getByText('Chicken Tikka Masala')).toBeTruthy();
      expect(getByText('Chocolate Chip Cookies')).toBeTruthy();
    });
  });

  /**
   * USER WORKFLOW 2: Error Handling
   * Scenario: User sees error message when loading fails
   */
  it('shows error message when loading fails', async () => {
    // Mock error state
    mockUseQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
      isRefetching: false,
    } as any);

    const mockNavigation = createMockNavigation();

    const { getByText } = renderWithProviders(
      <RecipeListScreen navigation={mockNavigation} />
    );

    // Should show error message
    await waitFor(() => {
      expect(getByText('Failed to load recipes')).toBeTruthy();
    });
  });

  /**
   * USER WORKFLOW 3: Navigation to Add Recipe
   * Scenario: User taps FAB to add new recipe
   */
  it('navigates to add recipe when FAB is tapped', async () => {
    const mockNavigate = jest.fn();
    const mockNavigation = createMockNavigation({ navigate: mockNavigate });

    const { getByTestId } = renderWithProviders(
      <RecipeListScreen navigation={mockNavigation} />
    );

    // Wait for component to load
    await waitFor(() => {
      expect(getByTestId('add-recipe-fab')).toBeTruthy();
    });

    // Tap the FAB
    fireEvent.press(getByTestId('add-recipe-fab'));

    // Should navigate to add recipe screen
    expect(mockNavigate).toHaveBeenCalledWith('AddRecipe');
  });

  /**
   * USER WORKFLOW 4: Empty State
   * Scenario: User sees empty state when no recipes exist
   */
  it('shows empty state when no recipes exist', async () => {
    // Mock empty state
    mockUseQuery.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    } as any);

    const mockNavigation = createMockNavigation();

    const { getByText } = renderWithProviders(
      <RecipeListScreen navigation={mockNavigation} />
    );

    // Should show empty state
    await waitFor(() => {
      expect(getByText('No recipes yet')).toBeTruthy();
      expect(getByText('Start by adding your first recipe!')).toBeTruthy();
    });
  });

  /**
   * USER WORKFLOW 5: Loading State
   * Scenario: User sees loading indicator while recipes are loading
   */
  it('shows loading state while recipes are loading', async () => {
    // Mock loading state
    mockUseQuery.mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      isRefetching: false,
    } as any);

    const mockNavigation = createMockNavigation();

    const { getByTestId } = renderWithProviders(
      <RecipeListScreen navigation={mockNavigation} />
    );

    // Should show loading indicator
    await waitFor(() => {
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });
  });
});

/**
 * SIMPLE INTEGRATION TEST SUMMARY:
 *
 * These tests focus on user workflows using simple hook mocking:
 * ✅ Fast & reliable - no network complexity
 * ✅ Mobile-focused - designed for React Native
 * ✅ User-centric - tests actual user interactions
 * ✅ Maintainable - standard React Testing Library approach
 *
 * This approach is perfect for mobile app component testing.
 */