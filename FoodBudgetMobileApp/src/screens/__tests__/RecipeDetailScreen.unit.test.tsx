/**
 * RecipeDetailScreen Unit Tests - VIEW Mode Only (Story 8)
 *
 * Test Strategy:
 * - Uses REAL React Query (sociable unit tests)
 * - Only mocks external boundaries: API services, navigation
 * - Focuses on VIEW mode behavior and state management
 * - Tests will FAIL until RecipeDetailScreen is implemented (TDD Red phase)
 */

import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
import { RecipeService } from '../../lib/shared';
import { RecipeDetailScreenNavigationProp } from '../../types/navigation';

// Mock only external boundaries - API and Navigation
jest.mock('../../lib/shared', () => ({
  RecipeService: {
    getRecipeById: jest.fn(),
  },
}));

// Mock navigation - External navigation system
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = createMockNavigation<RecipeDetailScreenNavigationProp>({
  navigate: mockNavigate,
  goBack: mockGoBack,
});

// Test data - Full recipe with all fields
const mockRecipe = {
  id: 'recipe-123',
  title: 'Pasta Carbonara',
  instructions: 'Cook pasta. Mix eggs with cheese. Combine with hot pasta.',
  servings: 4,
  category: 'Dinner',
  imageUrl: 'https://example.com/pasta.jpg',
  createdAt: '2024-01-15T10:30:00.000Z',
  userId: 'user-456',
};

describe('RecipeDetailScreen Unit Tests - VIEW Mode (Story 8)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful API response (tests can override)
    (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRecipe,
    });
  });

  /**
   * ============================================
   * SECTION 1: RISK-BASED PRIORITY TESTS
   * Critical workflows and state management
   * ============================================
   */
  describe('1. Risk-Based Priority Tests', () => {
    /**
     * Test 1: Mode initialization with recipeId
     * RISK: Incorrect mode determination breaks the entire screen
     */
    it('Given recipeId param When component mounts Then initializes to view mode', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Should be in VIEW mode (read-only display)
      await waitFor(() => {
        expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
      });
    });

    /**
     * Test 2: Data fetching with TanStack Query
     * RISK: Recipe data not loading breaks the entire feature
     */
    it('Given valid recipeId When component mounts Then fetches recipe using TanStack Query', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - TanStack Query should trigger an API call
      await waitFor(() => {
        expect(RecipeService.getRecipeById).toHaveBeenCalledWith('recipe-123');
      });
    });

    /**
     * Test 3: All recipe fields display
     * RISK: Missing critical data breaks user experience
     */
    it('Given recipe data loaded When in VIEW mode Then displays all recipe fields', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText, getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - All fields should be displayed
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy(); // title
        expect(getByText('Cook pasta. Mix eggs with cheese. Combine with hot pasta.')).toBeTruthy(); // instructions
        expect(getByText('4')).toBeTruthy(); // servings
        expect(getByText('Dinner')).toBeTruthy(); // category
        expect(getByTestId('recipe-detail-image')).toBeTruthy(); // image component
      });
    });
  });

  /**
   * ============================================
   * SECTION 2: HAPPY PATH TESTS
   * Primary use cases
   * ============================================
   */
  describe('2. Happy Path Tests', () => {
    /**
     * Test 4: Initial render flow
     */
    it('Given valid recipeId When component mounts Then shows loading then displays recipe', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Loading state first
      expect(getByTestId('recipe-detail-loading')).toBeTruthy();

      // Assert - Recipe data displayed after loading
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
      });
    });

    /**
     * Test 5: Back navigation
     */
    it('Given user on detail screen When back button pressed Then navigates back', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
      });

      // Act - User presses the back button
      const backButton = getByTestId('recipe-detail-back-button');
      fireEvent.press(backButton);

      // Assert - Navigation goes back
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * ============================================
   * SECTION 3: NULL/EMPTY/INVALID TESTS
   * Edge cases with missing or invalid data
   * ============================================
   */
  describe('3. Null/Empty/Invalid Tests', () => {
    /**
     * Test 6: Missing optional fields
     */
    it('Given recipe with null optional fields When displayed Then handles gracefully', async () => {
      // Arrange
      const minimalRecipe = {
        id: 'recipe-123',
        title: 'Minimal Recipe',
        servings: 2,
        createdAt: '2024-01-15T10:30:00.000Z',
        instructions: null, // optional
        category: null, // optional
        imageUrl: null, // optional
        userId: null, // optional
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: minimalRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText, queryByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Required fields shown, optional fields handled
      await waitFor(() => {
        expect(getByText('Minimal Recipe')).toBeTruthy();
        expect(getByText('2')).toBeTruthy(); // servings
        expect(queryByTestId('recipe-detail-image')).toBeNull(); // no image when null
      });
    });

    /**
     * Test 7: Empty strings in optional fields
     */
    it('Given recipe with empty string fields When displayed Then handles gracefully', async () => {
      // Arrange
      const emptyFieldsRecipe = {
        ...mockRecipe,
        instructions: '', // empty
        category: '', // empty
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: emptyFieldsRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act & Assert - Should not crash
      expect(() => {
        renderWithProviders(
          <RecipeDetailScreen
            navigation={mockNavigation}
            route={route}
          />
        );
      }).not.toThrow();
    });

    /**
     * Test 8: Invalid recipeId (404 from API)
     */
    it('Given invalid recipeId When API returns 404 Then shows error state', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: false,
        error: { title: 'Not Found', detail: 'Recipe not found', status: 404 },
      });

      const route = {
        params: { recipeId: 'invalid-id' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error state displayed
      await waitFor(() => {
        expect(getByText(/not found/i)).toBeTruthy();
      });
    });

    /**
     * Test 9: Malformed recipe data (missing required fields)
     */
    it('Given malformed recipe data When API returns incomplete data Then handles gracefully', async () => {
      // Arrange - Missing required 'title' field
      const malformedRecipe = {
        id: 'recipe-123',
        servings: 4,
        createdAt: '2024-01-15T10:30:00.000Z',
        // Missing title (required field)
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: malformedRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act & Assert - Should not crash (may show error state)
      expect(() => {
        renderWithProviders(
          <RecipeDetailScreen
            navigation={mockNavigation}
            route={route}
          />
        );
      }).not.toThrow();
    });
  });

  /**
   * ============================================
   * SECTION 4: BOUNDARIES TESTS
   * Extreme values and limits
   * ============================================
   */
  describe('4. Boundaries Tests', () => {
    /**
     * Test 10: Very long instructions text
     */
    it('Given recipe with very long instructions When displayed Then scrolls properly', async () => {
      // Arrange
      const longInstructions = 'Step 1: '.repeat(500); // ~5000 characters
      const longTextRecipe = {
        ...mockRecipe,
        instructions: longInstructions,
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: longTextRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Should render with scrollable content
      await waitFor(() => {
        expect(getByTestId('recipe-detail-scroll-view')).toBeTruthy();
      });
    });

    /**
     * Test 11: Special characters in title
     */
    it('Given recipe with emojis and unicode When displayed Then renders correctly', async () => {
      // Arrange
      const specialCharRecipe = {
        ...mockRecipe,
        title: '🍝 Pasta Carbonara à l\'italienne 中文',
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: specialCharRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Special characters displayed correctly
      await waitFor(() => {
        expect(getByText('🍝 Pasta Carbonara à l\'italienne 中文')).toBeTruthy();
      });
    });
  });

  /**
   * ============================================
   * SECTION 5: BUSINESS RULES TESTS
   * Domain-specific logic
   * ============================================
   */
  describe('5. Business Rules Tests', () => {
    /**
     * Test 12: VIEW mode is read-only
     */
    it('Given VIEW mode When user views recipe Then cannot edit fields', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { queryByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(queryByTestId('recipe-detail-view-mode')).toBeTruthy();
      });

      // Assert - No editable fields in VIEW mode
      expect(queryByTestId('recipe-form-title-input')).toBeNull();
      expect(queryByTestId('recipe-form-instructions-input')).toBeNull();
      expect(queryByTestId('recipe-form-servings-input')).toBeNull();
    });

    /**
     * Test 13: Required vs optional fields
     */
    it('Given recipe data When rendered Then always shows required fields conditionally shows optional', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText, getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Required fields always visible
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy(); // title (required)
        expect(getByText('4')).toBeTruthy(); // servings (required)
      });

      // Optional fields shown when present
      expect(getByText('Dinner')).toBeTruthy(); // category (optional)
      expect(getByTestId('recipe-detail-image')).toBeTruthy(); // imageUrl (optional)
    });
  });

  /**
   * ============================================
   * SECTION 6: ERROR HANDLING TESTS
   * API and network errors
   * ============================================
   */
  describe('6. Error Handling Tests', () => {
    /**
     * Test 14: API error with string message
     */
    it('Given API returns string error When fetching fails Then shows error state', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to fetch recipe',
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error message displayed
      await waitFor(() => {
        expect(getByText(/failed to fetch/i)).toBeTruthy();
      });
    });

    /**
     * Test 15: API error with ProblemDetails object
     */
    it('Given API returns ProblemDetails When fetching fails Then shows detailed error', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          type: 'https://example.com/errors/not-found',
          title: 'Recipe Not Found',
          status: 404,
          detail: 'The requested recipe does not exist.',
          instance: '/api/Recipe/invalid-id',
        },
      });

      const route = {
        params: { recipeId: 'invalid-id' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Detailed error displayed
      await waitFor(() => {
        expect(getByText(/recipe not found/i)).toBeTruthy();
      });
    });

    /**
     * Test 16: Network timeout error
     */
    it('Given network timeout When API call fails Then shows error state', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Timeout error handled
      await waitFor(() => {
        expect(getByText(/timeout|error/i)).toBeTruthy();
      });
    });
  });

  /**
   * ============================================
   * SECTION 7: ADDITIONAL EDGE CASES
   * Boundary values and extreme inputs
   * ============================================
   */
  describe('7. Additional Edge Cases', () => {
    /**
     * Test 19: Servings = 0 (boundary value)
     */
    it('Given recipe with servings = 0 When displayed Then handles zero servings gracefully', async () => {
      // Arrange
      const zeroServingsRecipe = {
        ...mockRecipe,
        servings: 0,
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: zeroServingsRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Should display 0 servings (valid edge case)
      await waitFor(() => {
        expect(getByText('0')).toBeTruthy();
      });
    });

    /**
     * Test 20: Negative servings (invalid data)
     */
    it('Given recipe with negative servings When displayed Then handles gracefully', async () => {
      // Arrange
      const negativeServingsRecipe = {
        ...mockRecipe,
        servings: -5,
      };

      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: true,
        data: negativeServingsRecipe,
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act & Assert - Should not crash (may show validation error or display as-is)
      expect(() => {
        renderWithProviders(
          <RecipeDetailScreen
            navigation={mockNavigation}
            route={route}
          />
        );
      }).not.toThrow();
    });

    /**
     * Test 21: Empty string recipeId
     */
    it('Given empty string recipeId When component mounts Then handles gracefully', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid recipe ID',
      });

      const route = {
        params: { recipeId: '' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act & Assert - Should handle empty ID without crashing
      expect(() => {
        renderWithProviders(
          <RecipeDetailScreen
            navigation={mockNavigation}
            route={route}
          />
        );
      }).not.toThrow();
    });
  });

  /**
   * ============================================
   * SECTION 8: ACCESSIBILITY TESTS
   * Screen reader and assistive technology support
   * ============================================
   */
  describe('8. Accessibility Tests', () => {
    /**
     * Test 22: Screen reader labels for recipe content
     */
    it('Given recipe displayed When screen reader active Then provides accessible labels', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByLabelText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Key elements have accessibility labels
      await waitFor(() => {
        expect(getByLabelText(/recipe title/i)).toBeTruthy();
        expect(getByLabelText(/servings/i)).toBeTruthy();
      });
    });

    /**
     * Test 23: Back button accessibility
     */
    it('Given back button When screen reader active Then announces navigation action', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
      });

      // Assert - Back button has an accessible label and role
      const backButton = getByTestId('recipe-detail-back-button');
      expect(backButton.props.accessibilityLabel).toBeTruthy();
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    /**
     * Test 24: Loading state accessibility
     */
    it('Given loading state When screen reader active Then announces loading', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockRecipe }), 200))
      );

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Loading indicator has an accessibility label
      const loadingIndicator = getByTestId('recipe-detail-loading');
      expect(loadingIndicator.props.accessibilityLabel).toMatch(/loading/i);
    });

    /**
     * Test 25: Error state accessibility
     */
    it('Given error state When screen reader active Then announces error clearly', async () => {
      // Arrange
      (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to load recipe',
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error message is accessible
      await waitFor(() => {
        const errorElement = getByText(/failed to load/i);
        expect(errorElement).toBeTruthy();
        // Error should have an appropriate accessibility role
      });
    });

    /**
     * Test 26: Image accessibility
     */
    it('Given recipe with image When displayed Then image has alt text', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Image has an accessibility label
      await waitFor(() => {
        const image = getByTestId('recipe-detail-image');
        expect(image.props.accessibilityLabel).toBeTruthy();
        expect(image.props.accessibilityLabel).toContain('Pasta Carbonara');
      });
    });
  });

  /**
   * ============================================
   * SECTION 9: REACT QUERY INTEGRATION TESTS
   * TanStack Query behavior
   * ============================================
   */
  describe('9. React Query Integration Tests', () => {
    /**
     * Test 27: Loading state management
     */
    it('Given query in progress When fetching recipe Then shows loading indicator', async () => {
      // Arrange - Simulate slow API response
      (RecipeService.getRecipeById as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockRecipe }), 100))
      );

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Loading state shown while query is in progress
      expect(getByTestId('recipe-detail-loading')).toBeTruthy();

      // Wait for data to load
      await waitFor(() => {
        expect(getByTestId('recipe-detail-view-mode')).toBeTruthy();
      }, { timeout: 2000 });
    });

    /**
     * Test 28: Cache behavior on remount
     */
    it('Given cached recipe data When component remounts Then uses cached data', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Initial mount
      const { unmount, getByText } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
      });

      expect(RecipeService.getRecipeById).toHaveBeenCalledTimes(1);

      unmount();

      // Act - Remount component (should use cache)
      const { getByText: getByTextRemount } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Data available from cache immediately
      await waitFor(() => {
        expect(getByTextRemount('Pasta Carbonara')).toBeTruthy();
      });

      // API should have been called (React Query will refetch in the background), 
      // But cached data is shown immediately
      expect(RecipeService.getRecipeById).toHaveBeenCalled();
    });
  });
});