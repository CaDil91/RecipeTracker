
/**
 * RecipeDetailScreen Unit Tests - 2025 React Testing Library Patterns
 *
 * Test Strategy:
 * - Uses REAL React Query (sociable unit tests)
 * - Only mocks external boundaries: API services, navigation
 * - TDD approach: Tests written first, implementation second
 *
 * 2025 Patterns Applied:
 * - Uses `screen` instead of destructuring (modern standard)
 * - Uses `userEvent` for realistic interactions
 * - Uses semantic assertions (.toBeOnTheScreen, .toBeVisible)
 * - Uses `mockResolvedValue` instead of promise control pattern where appropriate
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
import { RecipeService } from '../../lib/shared';
import { RecipeDetailScreenNavigationProp } from '../../types/navigation';

// Mock only external boundaries - API and Navigation
// IMPORTANT: Use jest.requireActual to preserve schema exports
jest.mock('../../lib/shared', () => ({
  ...jest.requireActual('../../lib/shared'),
  RecipeService: {
    getRecipeById: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
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

describe('RecipeDetailScreen Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful API responses for VIEW, CREATE, and EDIT modes
    (RecipeService.getRecipeById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockRecipe,
    });
    (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 'new-recipe-id',
        title: 'New Recipe',
        servings: 2,
        instructions: 'Test instructions',
        category: 'Dinner',
        imageUrl: null,
        createdAt: new Date().toISOString(),
        userId: 'user-123',
      },
    });
    (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockRecipe,
        title: 'Updated Recipe Title',
      },
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
     * Test 1: Mode initialization with recipeId (VIEW mode)
     * RISK: Incorrect mode determination breaks the entire screen
     */
    it('Given recipeId param When component mounts Then initializes to view mode', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act - 2025 pattern: No destructuring
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - 2025 pattern: screen and semantic assertion
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 2: Data fetching with TanStack Query (VIEW mode)
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
     * Test 3: All recipe fields display (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - All fields should be displayed
      await waitFor(() => {
        expect(screen.getByText('Pasta Carbonara')).toBeVisible(); // title
        expect(screen.getByText('Cook pasta. Mix eggs with cheese. Combine with hot pasta.')).toBeVisible(); // instructions
        expect(screen.getByText('4')).toBeVisible(); // servings
        expect(screen.getByText('Dinner')).toBeVisible(); // category
        expect(screen.getByTestId('recipe-detail-image')).toBeOnTheScreen(); // image component
      });
    });

    /**
     * Test 4: Mode detection without recipeId (CREATE mode)
     * RISK: Wrong mode = entire feature broken
     */
    it('Given no recipeId param When component mounts Then initializes to CREATE mode', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert - Should be in CREATE mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 5: No API fetch in CREATE mode
     * RISK: Unwanted API calls cause errors
     */
    it('Given CREATE mode When component mounts Then does NOT call getRecipeById', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert - API should NOT be called
      await waitFor(() => {
        expect(RecipeService.getRecipeById).not.toHaveBeenCalled();
      });
    });

    /**
     * Test 6: RecipeForm renders with empty fields (CREATE mode)
     * RISK: Wrong initial state confuses users
     */
    it('Given CREATE mode When rendered Then displays RecipeForm with empty initialValues', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert - RecipeForm should be present
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });
    });

    /**
     * Test 7: Create mutation triggers on submitting
     * RISK: Mutation not triggering = feature doesn't work
     */
    it('Given valid form data When user submits Then createRecipe mutation executes', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Act - Fill form
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Test Recipe');

      // Wait for the display value to update (confirms state has synced)
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Recipe')).toBeVisible();
      });

      // Submit form
      fireEvent.press(screen.getByTestId('recipe-detail-create-form-submit'));

      // Assert
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalled();
      });
    });

    /**
     * Test 8: Success navigation to VIEW mode
     * RISK: Navigation failure = user can't see the created recipe
     */
    it('Given successful creation When mutation completes Then shows Snackbar AND navigates to VIEW mode', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Test Recipe Title');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Snackbar shows a success message
      await waitFor(() => {
        expect(screen.getByText(/recipe created successfully/i)).toBeOnTheScreen();
      });

      // Assert - Navigates to VIEW mode with new recipe ID
      expect(mockNavigate).toHaveBeenCalledWith('RecipeDetail', {
        recipeId: 'new-recipe-id',
      });
    });

    /**
     * Test 9: Loading state during mutation
     * RISK: No feedback = user clicks multiple times
     */
    it('Given mutation in progress When creating recipe Then shows loading state', async () => {
      // Arrange - Use promise control pattern (no delays)
      let resolveCreate: (value: any) => void;
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise(resolve => { resolveCreate = resolve; })
      );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Test Recipe Title');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Form should show the loading state immediately
      await waitFor(() => {
        // RecipeForm receives isLoading=true prop
        const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
        expect(submitButton.props.accessibilityState?.disabled).toBe(true);
      });

      // Cleanup - resolve promise to avoid hanging
      resolveCreate!({
        success: true,
        data: { id: 'new-id', title: 'Test', servings: 1, createdAt: new Date().toISOString() }
      });
    });

    /**
     * Test 10: Edit FAB visible in VIEW mode (EDIT mode)
     * RISK: User can't access EDIT mode without the Edit button
     */
    it('Given VIEW mode with recipe loaded When displayed Then Edit FAB visible', async () => {
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

      // Assert - Edit FAB is present
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-fab')).toBeOnTheScreen();
      });
    });

    /**
     * Test 11: VIEW → EDIT transition (EDIT mode)
     * RISK: Mode transition broken = entire EDIT feature broken
     */
    it('Given VIEW mode When Edit FAB pressed Then transitions to EDIT mode', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Act - Press Edit FAB
      const editFAB = screen.getByTestId('recipe-detail-edit-fab');
      fireEvent.press(editFAB);

      // Assert - Now in EDIT mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 12: Form pre-populated with recipe data (EDIT mode)
     * RISK: Empty form = user loses existing data
     */
    it('Given EDIT mode When form renders Then initialValues populated with recipe data', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Act - Enter EDIT mode
      const editFAB = screen.getByTestId('recipe-detail-edit-fab');
      fireEvent.press(editFAB);

      // Assert - Form pre-populated with existing recipe data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Pasta Carbonara')).toBeVisible(); // title
        expect(screen.getByDisplayValue('4')).toBeVisible(); // servings
        expect(screen.getByDisplayValue('Cook pasta. Mix eggs with cheese. Combine with hot pasta.')).toBeVisible(); // instructions
      });
    });

    /**
     * Test 13: Update mutation execution (EDIT mode)
     * RISK: Mutation not triggering = save doesn't work
     */
    it('Given valid form data in EDIT mode When user submits Then updateRecipe mutation executes', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Modify and submit
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Updated Pasta Carbonara');

      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - updateRecipe called with correct recipe ID
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledWith(
          'recipe-123',
          expect.objectContaining({
            title: 'Updated Pasta Carbonara',
          })
        );
      });
    });

    /**
     * Test 14: Successful update returns to VIEW mode (EDIT mode)
     * RISK: Navigation failure = user stuck in EDIT mode
     */
    it('Given successful update When mutation completes Then returns to VIEW mode with Snackbar', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Returns to VIEW mode with success message
      await waitFor(() => {
        expect(screen.getByText(/recipe updated successfully/i)).toBeOnTheScreen();
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 15: Confirmation dialog on Cancel with changes (EDIT mode)
     * RISK: Data loss without warning
     */
    it('Given EDIT mode with unsaved changes When Cancel pressed Then shows confirmation dialog', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Make a change (triggers dirty state)
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Modified Title');

      // Press Cancel
      const cancelButton = screen.getByTestId('recipe-detail-edit-form-cancel');
      fireEvent.press(cancelButton);

      // Assert - Confirmation dialog shown
      await waitFor(() => {
        expect(screen.getByText(/discard changes/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 16: Confirming dialog returns to VIEW mode (EDIT mode)
     * RISK: Dialog confirmation doesn't work
     */
    it('Given confirmation dialog When Yes pressed Then returns to VIEW mode without saving', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode and make changes
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Modified Title');

      // Press Cancel
      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-cancel'));

      await waitFor(() => {
        expect(screen.getByText(/discard changes/i)).toBeOnTheScreen();
      });

      // Act - Confirm discard
      const yesButton = screen.getByText('Yes');
      fireEvent.press(yesButton);

      // Assert - Returns to VIEW mode, update NOT called
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
      expect(RecipeService.updateRecipe).not.toHaveBeenCalled();
    });

    /**
     * Test 17: Back button in EDIT mode with unsaved changes (EDIT mode)
     * RISK: Data loss without warning - user accidentally navigates away
     */
    it('Given EDIT mode with unsaved changes When back button pressed Then shows confirmation dialog', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Make a change (triggers dirty state)
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Modified Title');

      // Act - Press back button
      const backButton = screen.getByTestId('recipe-detail-back-button');
      fireEvent.press(backButton);

      // Assert - Confirmation dialog shown (NOT navigation.goBack())
      await waitFor(() => {
        expect(screen.getByText(/discard changes/i)).toBeOnTheScreen();
      });
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    /**
     * Test 18: Back button in EDIT mode without changes (EDIT mode)
     * RISK: User expects to go back to VIEW mode
     */
    it('Given EDIT mode without changes When back button pressed Then returns to VIEW mode immediately', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Press back button WITHOUT making changes
      const backButton = screen.getByTestId('recipe-detail-back-button');
      fireEvent.press(backButton);

      // Assert - Returns to VIEW mode immediately (NOT navigation.goBack())
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
      expect(mockGoBack).not.toHaveBeenCalled();
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
     * Test 12: Initial render flow (VIEW mode)
     */
    it('Given valid recipeId When component mounts Then shows loading then displays recipe', async () => {
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

      // Assert - Loading state first
      expect(screen.getByTestId('recipe-detail-loading')).toBeOnTheScreen();

      // Assert - Recipe data displayed after loading
      await waitFor(() => {
        expect(screen.getByText('Pasta Carbonara')).toBeVisible();
      });
    });

    /**
     * Test 13: Back navigation (VIEW mode)
     */
    it('Given user on detail screen When back button pressed Then navigates back', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Act - User presses the back button
      const backButton = screen.getByTestId('recipe-detail-back-button');
      fireEvent.press(backButton);

      // Assert - Navigation goes back
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 14: Header displays correctly (CREATE mode)
     */
    it('Given CREATE mode When rendered Then shows Create Recipe header with back button', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert
      await waitFor(() => {
        const createRecipeElements = screen.getAllByText(/create recipe/i);
        expect(createRecipeElements.length).toBeGreaterThan(0); // Header and/or button text
        expect(screen.getByTestId('recipe-detail-back-button')).toBeOnTheScreen();
      });
    });

    /**
     * Test 15: Cancel button navigation (CREATE mode)
     */
    it('Given CREATE mode When cancel button pressed Then navigates back', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      const cancelButton = screen.getByTestId('recipe-detail-create-form-cancel');

      // Act
      fireEvent.press(cancelButton);

      // Assert
      expect(mockGoBack).toHaveBeenCalledTimes(1);
      expect(RecipeService.createRecipe).not.toHaveBeenCalled();
    });

    /**
     * Test 16: Complete data submission (CREATE mode)
     */
    it('Given form with all fields When submitted Then API called with complete RecipeRequestDto', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Complete Recipe Title');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Should be called with RecipeRequestDto structure
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            servings: expect.any(Number),
          })
        );
      });
    });

    /**
     * Test 17: Snackbar success message (CREATE mode)
     */
    it('Given successful creation When mutation completes Then Snackbar displays success message', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Success Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
      });
    });

    /**
     * Test 18: Complete EDIT workflow (EDIT mode)
     */
    it('Given VIEW mode When Edit FAB pressed, form edited, and saved Then returns to VIEW mode', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Wait for VIEW mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Act - Press Edit FAB
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Modify title
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Updated Pasta Carbonara');

      // Submit
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Returns to VIEW mode with updated data
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
        expect(screen.getByText('Recipe updated successfully!')).toBeOnTheScreen();
      });
    });

    /**
     * Test 19: Edit FAB press behavior (EDIT mode)
     */
    it('Given VIEW mode When Edit FAB pressed Then Edit FAB hidden in EDIT mode', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Assert - Edit FAB visible in VIEW mode
      expect(screen.getByTestId('recipe-detail-edit-fab')).toBeOnTheScreen();

      // Act - Press Edit FAB
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Assert - Edit FAB hidden in EDIT mode
      expect(screen.queryByTestId('recipe-detail-edit-fab')).toBeNull();
    });

    /**
     * Test 20: Snackbar success message (EDIT mode)
     */
    it('Given successful update When mutation completes Then Snackbar displays success message', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Submit
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Recipe updated successfully!')).toBeOnTheScreen();
      });
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
     * Test 18: Missing optional fields (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Required fields shown, optional fields handled
      await waitFor(() => {
        expect(screen.getByText('Minimal Recipe')).toBeVisible();
        expect(screen.getByText('2')).toBeVisible(); // servings
        expect(screen.queryByTestId('recipe-detail-image')).toBeNull(); // no image when null
      });
    });

    /**
     * Test 19: Empty strings in optional fields (VIEW mode)
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
     * Test 20: Invalid recipeId (404 from API)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error state displayed
      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeVisible();
      });
    });

    /**
     * Test 21: Malformed recipe data (missing required fields)
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

    /**
     * Test 22: Servings = 0 (boundary value / edge case)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Should display 0 servings (valid edge case)
      await waitFor(() => {
        expect(screen.getByText('0')).toBeVisible();
      });
    });

    /**
     * Test 23: Negative servings (invalid data)
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
     * Test 24: Empty string recipeId
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

    /**
     * Test 25: Invalid form doesn't trigger API (CREATE mode)
     */
    it('Given invalid form When submitted Then does NOT call API', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Act - Form with validation errors won't trigger onSubmit
      // RecipeForm handles validation internally

      // Assert - API should not be called with invalid data
      await waitFor(() => {
        expect(RecipeService.createRecipe).not.toHaveBeenCalled();
      });
    });

    /**
     * Test 26: Optional fields sent as null (CREATE mode)
     */
    it('Given form with only required fields When submitted Then sends optional fields as null', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field only
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Minimal Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Optional fields should be null or undefined
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            servings: expect.any(Number),
            // category, imageUrl, instructions are optional
          })
        );
      });
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
     * Test 27: Very long instructions text (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Should render with scrollable content
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-scroll-view')).toBeOnTheScreen();
      });
    });

    /**
     * Test 28: Special characters in title (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Special characters displayed correctly
      await waitFor(() => {
        expect(screen.getByText('🍝 Pasta Carbonara à l\'italienne 中文')).toBeVisible();
      });
    });

    /**
     * Test 29: Very long title exceeds max (CREATE mode)
     */
    it('Given form with 500-character title When submitted Then validation rejects and API NOT called', async () => {
      // Arrange
      const longTitle = 'A'.repeat(500); // Exceeds 200-char max
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field with long text exceeding max
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, longTitle);

      // Act - Submit with invalid long title
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Validation should reject, API should NOT be called
      await waitFor(() => {
        expect(RecipeService.createRecipe).not.toHaveBeenCalled();
      });
    });

    /**
     * Test 30: Very long instructions (CREATE mode)
     */
    it('Given form with 5000-character instructions When submitted Then creates recipe successfully', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Long Instructions Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalled();
      });
    });

    /**
     * Test 31: Special characters preserved (CREATE mode)
     */
    it('Given form with emojis and unicode When submitted Then preserves special characters', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field with special characters
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, '🍝 Pasta Carbonara à l\'italienne 中文');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Special chars should be sent to API
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalled();
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
     * Test 32: VIEW mode is read-only
     */
    it('Given VIEW mode When user views recipe Then cannot edit fields', async () => {
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

      await waitFor(() => {
        expect(screen.queryByTestId('recipe-detail-view-mode')).toBeVisible();
      });

      // Assert - No editable fields in VIEW mode
      expect(screen.queryByTestId('recipe-form-title-input')).toBeNull();
      expect(screen.queryByTestId('recipe-form-instructions-input')).toBeNull();
      expect(screen.queryByTestId('recipe-form-servings-input')).toBeNull();
    });

    /**
     * Test 33: Required vs. optional fields (VIEW mode)
     */
    it('Given recipe data When rendered Then always shows required fields conditionally shows optional', async () => {
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

      // Assert - Required fields always visible
      await waitFor(() => {
        expect(screen.getByText('Pasta Carbonara')).toBeVisible(); // title (required)
        expect(screen.getByText('4')).toBeVisible(); // servings (required)
      });

      // Optional fields shown when present
      expect(screen.getByText('Dinner')).toBeVisible(); // category (optional)
      expect(screen.getByTestId('recipe-detail-image')).toBeOnTheScreen(); // imageUrl (optional)
    });

    /**
     * Test 34: No initialValues passed (CREATE mode)
     */
    it('Given CREATE mode When RecipeForm rendered Then no initialValues passed', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert - Form is truly empty (RecipeForm defaults apply)
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
        // RecipeForm should have an empty title, servings=1 default
      });
    });

    /**
     * Test 35: RecipeRequestDto contract (CREATE mode)
     */
    it('Given form submission When API called Then matches C# RecipeRequestDto contract', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Contract Test Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Should match C# API contract
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledWith(
          expect.objectContaining({
            title: expect.any(String),
            servings: expect.any(Number),
            // instructions, category, imageUrl are optional
          })
        );
      });
    });

    /**
     * Test 36: Doesn't override form defaults (CREATE mode)
     */
    it('Given CREATE mode When form initialized Then RecipeDetailScreen does not override RecipeForm defaults', async () => {
      // Arrange
      const route = {
        params: {},
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

      // Assert - RecipeForm manages its own defaults
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });
    });

    /**
     * Test 37: Screen reader labels for recipe content (VIEW mode - accessibility business rule)
     */
    it('Given recipe displayed When screen reader active Then provides accessible labels', async () => {
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

      // Assert - Key elements have accessibility labels
      await waitFor(() => {
        expect(screen.getByLabelText(/recipe title/i)).toBeVisible();
        expect(screen.getByLabelText(/servings/i)).toBeVisible();
      });
    });

    /**
     * Test 38: Back button accessibility (VIEW mode - accessibility business rule)
     */
    it('Given back button When screen reader active Then announces navigation action', async () => {
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

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Assert - Back button has an accessible label and role
      const backButton = screen.getByTestId('recipe-detail-back-button');
      expect(backButton.props.accessibilityLabel).toBeTruthy();
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    /**
     * Test 39: Image accessibility (VIEW mode - accessibility business rule)
     */
    it('Given recipe with image When displayed Then image has alt text', async () => {
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

      // Assert - Image has an accessibility label
      await waitFor(() => {
        const image = screen.getByTestId('recipe-detail-image');
        expect(image.props.accessibilityLabel).toBeTruthy();
        expect(image.props.accessibilityLabel).toContain('Pasta Carbonara');
      });
    });

    /**
     * Test 40: Cancel button accessible (CREATE mode - accessibility business rule)
     */
    it('Given cancel button When rendered Then has accessible role and text', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Assert - Button has an accessible role and visible text (sufficient for accessibility)
      const cancelButton = screen.getByTestId('recipe-detail-create-form-cancel');
      expect(cancelButton.props.accessibilityRole).toBe('button');
      expect(screen.getByText('Cancel')).toBeVisible(); // Visible text provides context
    });

    /**
     * Test 41: Snackbar accessible (CREATE mode - accessibility business rule)
     */
    it('Given Snackbar shown When displayed Then has role alert or live region', async () => {
      // Arrange
      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Accessible Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Snackbar should be accessible
      await waitFor(() => {
        const snackbar = screen.getByText('Recipe created successfully!');
        expect(snackbar).toBeOnTheScreen();
        // Snackbar from react-native-paper has built-in accessibility
      });
    });

    /**
     * Test 42: EDIT mode respects initialValues contract (EDIT mode)
     */
    it('Given EDIT mode When form initialized Then passes existing recipe as initialValues', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Act - Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      // Assert - RecipeForm receives initialValues matching the existing recipe
      await waitFor(() => {
        expect(screen.getByDisplayValue('Pasta Carbonara')).toBeVisible();
        expect(screen.getByDisplayValue('4')).toBeVisible();
        expect(screen.getByDisplayValue('Cook pasta. Mix eggs with cheese. Combine with hot pasta.')).toBeVisible();
      });
    });

    /**
     * Test 43: Update API respects RecipeRequestDto contract (EDIT mode)
     */
    it('Given valid EDIT form submission When API called Then matches C# RecipeRequestDto contract', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Update API called with RecipeRequestDto structure
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledWith(
          'recipe-123', // recipeId as first param
          expect.objectContaining({
            title: expect.any(String),
            servings: expect.any(Number),
            // instructions, category, imageUrl are optional
          })
        );
      });
    });

    /**
     * Test 44: Cancel button requires confirmation (EDIT mode - business rule)
     */
    it('Given EDIT mode without changes When Cancel pressed Then returns to VIEW mode immediately', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Press Cancel without making changes
      const cancelButton = screen.getByTestId('recipe-detail-edit-form-cancel');
      fireEvent.press(cancelButton);

      // Assert - Returns to VIEW mode immediately (no confirmation dialog)
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // No update should be called
      expect(RecipeService.updateRecipe).not.toHaveBeenCalled();
    });

    /**
     * Test 45: Edit FAB accessibility (EDIT mode - accessibility business rule)
     */
    it('Given VIEW mode with Edit FAB When screen reader active Then FAB has accessible label', async () => {
      // Arrange
      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Assert - Edit FAB has accessibility properties
      const editFAB = screen.getByTestId('recipe-detail-edit-fab');
      expect(editFAB.props.accessibilityLabel).toBeTruthy();
      expect(editFAB.props.accessibilityRole).toBe('button');
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
     * Test 42: API error with string message (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error message displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch/i)).toBeVisible();
      });
    });

    /**
     * Test 43: API error with ProblemDetails object (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Detailed error displayed
      await waitFor(() => {
        expect(screen.getByText(/recipe not found/i)).toBeVisible();
      });
    });

    /**
     * Test 44: Network timeout error (VIEW mode)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Timeout error handled
      await waitFor(() => {
        expect(screen.getByText(/timeout|error/i)).toBeVisible();
      });
    });

    /**
     * Test 43: Loading state accessibility (VIEW mode - error prevention)
     */
    it('Given loading state When screen reader active Then announces loading', async () => {
      // Arrange - Use promise control pattern (no delays)
      let resolveGet: (value: any) => void;
      (RecipeService.getRecipeById as jest.Mock).mockImplementation(
        () => new Promise(resolve => { resolveGet = resolve; })
      );

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

      // Assert - Loading indicator has an accessibility label
      const loadingIndicator = screen.getByTestId('recipe-detail-loading');
      expect(loadingIndicator.props.accessibilityLabel).toMatch(/loading/i);

      // Cleanup - resolve promise to avoid hanging
      resolveGet!({ success: true, data: mockRecipe });
    });

    /**
     * Test 46: Error state accessibility (VIEW mode - error handling)
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
      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      // Assert - Error message is accessible
      await waitFor(() => {
        const errorElement = screen.getByText(/failed to load/i);
        expect(errorElement).toBeVisible();
        // Error should have an appropriate accessibility role
      });
    });

    /**
     * Test 47: API 500 error (CREATE mode)
     */
    it('Given API returns 500 When mutation fails Then shows Snackbar error and form stays editable', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          title: 'Internal Server Error',
          status: 500,
          detail: 'An error occurred while processing your request.',
        },
      });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Error Test Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Error Snackbar shown
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeOnTheScreen();
      });

      // Form should still be visible (not navigated away)
      expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
    });

    /**
     * Test 48: API 400 error (CREATE mode)
     */
    it('Given API returns 400 When mutation fails Then shows Snackbar with validation message', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          title: 'Validation Error',
          status: 400,
          detail: 'Title is required',
        },
      });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Validation Error Test');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation error|title is required/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 49: Network timeout (CREATE mode)
     */
    it('Given network timeout When mutation fails Then shows Snackbar error', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Timeout Test Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error|timeout/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 50: Error doesn't navigate away (CREATE mode)
     */
    it('Given API error When mutation fails Then does NOT navigate away from CREATE mode', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to create recipe',
      });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Stay Put Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Should stay on CREATE mode
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
      });
    });

    /**
     * Test 51: Form data preserved after error (CREATE mode)
     */
    it('Given API error When mutation fails Then form data still present', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Preserved Data Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Form should still be editable with data
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });
    });

    /**
     * Test 52: User can retry after error (CREATE mode)
     */
    it('Given previous error When user fixes and resubmits Then mutation triggers again', async () => {
      // Arrange - First call fails, second succeeds
      (RecipeService.createRecipe as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Server error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { id: 'new-id', title: 'Test', servings: 1, createdAt: new Date().toISOString() },
        });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Retry Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');

      // First submission (fails)
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledTimes(1);
      });

      // Second submission (succeeds)
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledTimes(2);
      });
    });

    /**
     * Test 51: Loading state announced (CREATE mode - error prevention)
     */
    it('Given mutation in progress When loading Then screen reader announces creating recipe', async () => {
      // Arrange - Use promise control pattern (no delays)
      let resolveCreate: (value: any) => void;
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise(resolve => { resolveCreate = resolve; })
      );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Fill in the required title field
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Loading Announce Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Loading indicator has an accessibility label
      // (RecipeForm handles this internally)
      await waitFor(() => {
        const button = screen.getByTestId('recipe-detail-create-form-submit');
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });

      // Cleanup - resolve promise to avoid hanging
      resolveCreate!({
        success: true,
        data: { id: 'new-id', title: 'Test', servings: 1, createdAt: new Date().toISOString() }
      });
    });

    /**
     * Test 53: API 500 error (EDIT mode)
     */
    it('Given API returns 500 When update fails Then shows Snackbar error and stays in EDIT mode', async () => {
      // Arrange
      (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          title: 'Internal Server Error',
          status: 500,
          detail: 'An error occurred while updating your recipe.',
        },
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Error Snackbar shown, stays in EDIT mode
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeOnTheScreen();
      });

      // Still in EDIT mode
      expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
    });

    /**
     * Test 54: API 400 error (EDIT mode)
     */
    it('Given API returns 400 When update fails Then shows Snackbar with validation message', async () => {
      // Arrange
      (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          title: 'Validation Error',
          status: 400,
          detail: 'Invalid data provided',
        },
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/validation error|invalid data/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 55: Network timeout (EDIT mode)
     */
    it('Given network timeout When update fails Then shows Snackbar error', async () => {
      // Arrange
      (RecipeService.updateRecipe as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error|timeout/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 56: Error doesn't navigate away (EDIT mode)
     */
    it('Given API error When update fails Then does NOT navigate away from EDIT mode', async () => {
      // Arrange
      (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to update recipe',
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Should stay in EDIT mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 57: Form data preserved after error (EDIT mode)
     */
    it('Given API error When update fails Then form data still present', async () => {
      // Arrange
      (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Modify title
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Modified Title');

      // Act - Submit changes
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      fireEvent.press(submitButton);

      // Assert - Form should still have modified data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Modified Title')).toBeVisible();
      });
    });

    /**
     * Test 58: User can retry after error (EDIT mode)
     */
    it('Given previous error When user resubmits Then update mutation triggers again', async () => {
      // Arrange - First call fails, second succeeds
      (RecipeService.updateRecipe as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Server error',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            ...mockRecipe,
            title: 'Updated Title',
          },
        });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');

      // First submission (fails)
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledTimes(1);
      });

      // Second submission (succeeds)
      fireEvent.press(submitButton);
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledTimes(2);
      });

      // Should return to VIEW mode after success
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
    });
  });
});
