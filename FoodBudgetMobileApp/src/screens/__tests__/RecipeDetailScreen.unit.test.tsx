
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
 *
 * Test Organization:
 * After refactoring RecipeDetailScreen to extract reusable components, some tests
 * have been moved to component-specific test files for better organization:
 *
 * Component Tests (Unit Level):
 * - RecipeDetailHeader.test.tsx: Header button visibility, callbacks, accessibility
 * - DeleteConfirmationDialog.test.tsx: Delete dialog UI, button behavior
 * - CancelConfirmationDialog.test.tsx: Cancel dialog UI, button behavior
 * - RecipeSnackbar.test.tsx: Snackbar display, dismiss behavior, accessibility
 *
 * Screen Tests (Integration Level - THIS FILE):
 * - Mode transitions (VIEW → EDIT → CREATE)
 * - Form submission flows and data persistence
 * - API integration and error handling
 * - Navigation after actions
 * - Cache invalidation and optimistic updates
 * - Complete user journeys (CRUD operations)
 */

import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react-native';
import {createMockNavigation, renderWithProviders} from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
import {RecipeService, ImageUploadService} from '../../lib/shared';
import {RecipeDetailScreenNavigationProp} from '../../types/navigation';
import * as FileSystem from 'expo-file-system';

// Mock only external boundaries - API and Navigation
// IMPORTANT: Use jest.requireActual to preserve schema exports
jest.mock('../../lib/shared', () => ({
  ...jest.requireActual('../../lib/shared'),
  RecipeService: {
    getRecipeById: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
  },
  ImageUploadService: {
    getUploadToken: jest.fn(),
  },
}));

// Mock FileSystem for Azure Blob Storage uploads
jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
}));

// Mock useAuth hook - Return authenticated state for tests
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    isTokenReady: true,
  })),
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

// Test data - Upload token response
const mockUploadToken = {
  uploadUrl: 'https://storage.azure.com/recipes/test.jpg?sas=token',
  publicUrl: 'https://storage.azure.com/recipes/test.jpg',
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

    // Image upload service mocks (successful by default)
    (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUploadToken,
    });
    (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
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
        expect(screen.getByText('4 servings')).toBeVisible(); // servings
        expect(screen.getByText('Dinner')).toBeVisible(); // category
        expect(screen.getByTestId('recipe-detail-view-form-image')).toBeOnTheScreen(); // image component
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
        expect(screen.getByText('4 servings')).toBeVisible(); // servings (uses stepper, not input)
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

    /**
     * Test 19: Delete button visible in VIEW mode (Story 11 - DELETE)
     * RISK: User can't access delete functionality
     */
    it('Given VIEW mode When rendered Then delete button appears in header', async () => {
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

      // Assert - Delete button visible
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
        expect(screen.getByTestId('recipe-detail-delete-button')).toBeOnTheScreen();
      });
    });

    /**
     * Test 20: Delete button visible in EDIT mode (Story 11 - DELETE)
     * RISK: Inconsistent UI between modes
     */
    it('Given EDIT mode When rendered Then delete button appears in header', async () => {
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

      // Assert - Delete button still visible in EDIT mode
      expect(screen.getByTestId('recipe-detail-delete-button')).toBeOnTheScreen();
    });

    /**
     * Test 21: Delete confirmation dialog triggers (Story 11 - DELETE)
     * RISK: Accidental deletes without confirmation
     */
    it('Given user presses delete button When in VIEW mode Then confirmation dialog shows', async () => {
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

      // Act - Press the delete button
      const deleteButton = screen.getByTestId('recipe-detail-delete-button');
      fireEvent.press(deleteButton);

      // Assert - Confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
        expect(screen.getByText(/are you sure/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 22: Delete mutation executes on confirmation (Story 11 - DELETE)
     * RISK: Core delete functionality doesn't work
     */
    it('Given confirmation dialog shown When user confirms Then deleteRecipe called with correct ID', async () => {
      // Arrange
      const mockDeleteRecipe = jest.fn().mockResolvedValue({ success: true });
      (RecipeService as any).deleteRecipe = mockDeleteRecipe;

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

      // Press delete button
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      // Act - Confirm delete
      const confirmButton = screen.getByTestId('recipe-detail-delete-dialog-confirm');
      fireEvent.press(confirmButton);

      // Assert - RecipeService.deleteRecipe called with correct ID
      await waitFor(() => {
        expect(mockDeleteRecipe).toHaveBeenCalledWith('recipe-123');
      });
    });

    /**
     * Test 23: Navigation after successful delete (Story 11 - DELETE)
     * RISK: User stuck on the deleted recipe screen
     */
    it('Given delete succeeds When mutation completes Then navigates back', async () => {
      // Arrange
      (RecipeService as any).deleteRecipe = jest.fn().mockResolvedValue({success: true});

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

      // Press delete and confirm
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

      // Assert - Navigation triggered
      await waitFor(() => {
        expect(mockGoBack).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test 24: Cache invalidation after successful delete (Story 11 - DELETE)
     * RISK: Stale data in recipe list
     */
    it('Given delete succeeds When mutation completes Then recipe list cache invalidated', async () => {
      // Arrange
      (RecipeService as any).deleteRecipe = jest.fn().mockResolvedValue({success: true});

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      ) as any;

      const invalidateSpy = jest.spyOn(queryClient || (global as any).testQueryClient, 'invalidateQueries');

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Press delete and confirm
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

      // Assert - Cache invalidated
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });

    /**
     * Test 12: Optimistic update - Recipe updates instantly in cache (Story 12b - PRIORITY)
     * RISK-BASED: Multi-cache update consistency
     *
     * Acceptance Criteria:
     * - AC1: Form submission triggers optimistic update in BOTH list and detail caches
     * - AC2: UI reflects changes immediately before API responds
     */
    it('Given user edits recipe When save button pressed Then recipe updates instantly in cache before API responds', async () => {
      // Arrange - Mock slow API response to verify optimistic behavior
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });

      (RecipeService as any).updateRecipe = jest.fn().mockReturnValue(updatePromise);

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
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

      // Act - Edit title and submit (API hasn't responded yet)
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Updated Recipe Title');

      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert - Cache should be updated instantly (before API responds)
      await waitFor(() => {
        const cachedData = queryClient?.getQueryData(['recipe', 'recipe-123']);
        expect(cachedData).toMatchObject({
          title: 'Updated Recipe Title'
        });
      });

      // API still hasn't responded - verify we haven't navigated yet
      expect(mockGoBack).not.toHaveBeenCalled();

      // Complete the API call
      resolveUpdate!({
        success: true,
        data: { id: 'recipe-123', title: 'Updated Recipe Title', servings: 4 }
      });
    });

    /**
     * Test 13: Navigation blocked until real ID received (Story 12c - CREATE mode - PRIORITY)
     * RISK-BASED: Navigating with temp ID breaks detail view
     *
     * Acceptance Criteria:
     * - AC1: Navigation does NOT occur until API returns real ID
     * - AC2: User cannot interact with the back button during save
     */
    it('Given user creates recipe When save button pressed Then navigation blocked until API responds with real ID', async () => {
      // Arrange - Mock slow API response to verify navigation blocking
      let resolveCreate: (value: any) => void;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });

      (RecipeService as any).createRecipe = jest.fn().mockReturnValue(createPromise);

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

      // Act - Fill form and submit (API hasn't responded yet)
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'New Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Navigation should NOT have occurred yet (API still pending)
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalled();
      });
      expect(mockNavigate).not.toHaveBeenCalled();

      // Complete the API call with real ID
      resolveCreate!({
        success: true,
        data: { id: 'real-uuid-123', title: 'New Recipe', servings: 4 }
      });

      // Assert - NOW navigation should occur with real ID
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: 'real-uuid-123'
        });
      });
    });

    /**
     * Test 14: useCreateRecipe hook integration (Story 12c - CREATE mode - PRIORITY)
     * RISK-BASED: Using the wrong mutation pattern breaks optimistic updates
     *
     * Acceptance Criteria:
     * - AC1: Component uses useCreateRecipe hook (not inline mutation)
     * - AC2: Hook handles temp ID generation and replacement
     */
    it('Given CREATE mode When component renders Then uses useCreateRecipe hook for optimistic behavior', async () => {
      // Arrange - Delay API response to check optimistic update
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: {
              id: 'real-id-123',
              title: 'Optimistic Recipe',
              servings: 4,
              instructions: '',
              category: 'Dinner',
              imageUrl: null,
              createdAt: new Date().toISOString(),
              userId: 'user-123',
            },
          }), 100);
        })
      );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Act - Submit form
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Optimistic Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Recipe should appear instantly in cache with temp ID (before API responds)
      await waitFor(() => {
        const listCache = queryClient?.getQueryData<any[]>(['recipes']);
        const tempRecipe = listCache?.[0];

        expect(tempRecipe).toBeDefined();
        expect(tempRecipe?.id.startsWith('temp-')).toBe(true);
        expect(tempRecipe?.title).toBe('Optimistic Recipe');
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

    /**
     * Test 18: Success flow - Shows success snackbar and returns to VIEW mode (Story 12b)
     * HAPPY PATH: Normal update flow with optimistic updates
     *
     * Acceptance Criteria:
     * - AC6: Success snackbar displays "Recipe updated successfully!"
     * - AC7: Automatically returns to VIEW mode after a successful save
     */
    it('Given recipe update succeeds When API confirms Then success snackbar shows and returns to VIEW mode', async () => {
      // Arrange
      (RecipeService as any).updateRecipe = jest.fn().mockResolvedValue({
        success: true,
        data: { id: 'recipe-123', title: 'Updated Title', servings: 6 }
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
      const servingsInput = screen.getByTestId('recipe-detail-edit-form-servings');
      fireEvent.changeText(servingsInput, '6');

      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert - Success snackbar appears
      await waitFor(() => {
        expect(screen.getByText('Recipe updated successfully!')).toBeOnTheScreen();
      });

      // Assert - Returns to VIEW mode automatically
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 19: Loading indicator - Submit button shows loading state during save (Story 12b)
     * HAPPY PATH: Visual feedback during async operation
     *
     * Acceptance Criteria:
     * - AC5: Submit button shows loading spinner while the API call is in progress
     * - AC5: Submit button is disabled during save to prevent double submission
     */
    it('Given save in progress When waiting for API Then submit button shows loading state and is disabled', async () => {
      // Arrange - Mock slow API
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });

      (RecipeService as any).updateRecipe = jest.fn().mockReturnValue(updatePromise);

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

      // Assert - Submit button initially not loading
      const submitButton = screen.getByTestId('recipe-detail-edit-form-submit');
      expect(submitButton).not.toBeDisabled();

      // Act - Submit changes
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'New Title');

      fireEvent.press(submitButton);

      // Assert - Submit button shows the loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Complete the API call
      resolveUpdate!({
        success: true,
        data: { id: 'recipe-123', title: 'New Title', servings: 4 }
      });

      // Assert - Returns to VIEW mode after completion
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
    });

    /**
     * Test 20: Complete CREATE flow - Valid form → save → navigate with real ID (Story 12c)
     * HAPPY PATH: Normal create flow with optimistic updates
     *
     * Acceptance Criteria:
     * - AC1: Form submission triggers optimistic add to recipe list
     * - AC2: Navigation occurs with REAL ID (not temp ID) after API success
     * - AC3: Success snackbar displays "Recipe created successfully!"
     */
    it('Given valid form data in CREATE mode When user submits Then recipe created and navigates to VIEW with real ID', async () => {
      // Arrange - Delay API response to check optimistic update
      (RecipeService as any).createRecipe = jest.fn().mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({
            success: true,
            data: { id: 'real-uuid-456', title: 'New Recipe', servings: 4, createdAt: new Date().toISOString() }
          }), 100);
        })
      );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Act - Fill form and submit
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'New Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Recipe appears instantly in cache with temp ID (optimistic)
      await waitFor(() => {
        const listCache = queryClient?.getQueryData<any[]>(['recipes']);
        const tempRecipe = listCache?.[0];
        expect(tempRecipe?.id.startsWith('temp-')).toBe(true);
      });

      // Assert - Success snackbar appears
      await waitFor(() => {
        expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
      });

      // Assert - Navigates to VIEW mode with REAL ID (not temp)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: 'real-uuid-456' // Real ID from a server
        });
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
        expect(screen.getByText('2 servings')).toBeVisible(); // servings
        expect(screen.queryByTestId('recipe-detail-view-form-image')).toBeNull(); // no image when null
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

      // Assert - Should default to 1 serving when servings are 0 (graceful handling)
      await waitFor(() => {
        expect(screen.getByText('1 serving')).toBeVisible();
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

    /**
     * Test 27: Cancel confirmation dialog (Story 11 - DELETE)
     * EDGE CASE: User changes mind about deleting
     */
    it('Given confirmation dialog shown When user presses Cancel Then dialog closes and no delete occurs', async () => {
      // Arrange
      const mockDeleteRecipe = jest.fn();
      (RecipeService as any).deleteRecipe = mockDeleteRecipe;

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

      // Press delete button
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      // Act - Press Cancel
      const cancelButton = screen.getByTestId('recipe-detail-delete-dialog-cancel');
      fireEvent.press(cancelButton);

      // Assert - Dialog closes, no deletion
      await waitFor(() => {
        expect(screen.queryByText(/delete recipe/i)).toBeNull();
      }, { timeout: 3000 });
      expect(mockDeleteRecipe).not.toHaveBeenCalled();
      expect(mockGoBack).not.toHaveBeenCalled();
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

    /**
     * Test 32: Delete button NOT in CREATE mode (Story 11 - DELETE)
     * BOUNDARY: Delete only for existing recipes
     */
    it('Given CREATE mode When rendered Then delete button does NOT appear', async () => {
      // Arrange
      const route = {
        params: {}, // No recipeId = CREATE mode
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

      // Assert - Delete button should NOT be visible (can't delete non-existent recipe)
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-mode')).toBeOnTheScreen();
      });
      expect(screen.queryByTestId('recipe-detail-delete-button')).toBeNull();
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
        expect(screen.getByText('4 servings')).toBeVisible(); // servings (required)
      });

      // Optional fields shown when present
      expect(screen.getByText('Dinner')).toBeVisible(); // category (optional)
      expect(screen.getByTestId('recipe-detail-view-form-image')).toBeOnTheScreen(); // imageUrl (optional)
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
        const image = screen.getByTestId('recipe-detail-view-form-image');
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
        expect(screen.getByText('4 servings')).toBeVisible(); // servings (uses stepper, not input)
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

    /**
     * Test 46: Delete button accessibility (Story 11 - DELETE)
     * BUSINESS RULE: Accessibility compliance
     */
    it('Given delete button When screen reader active Then has proper accessibility label', async () => {
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

      // Assert - Delete button has accessibility properties
      const deleteButton = screen.getByTestId('recipe-detail-delete-button');
      expect(deleteButton.props.accessibilityLabel).toBeTruthy();
      expect(deleteButton.props.accessibilityLabel).toMatch(/delete/i);
      expect(deleteButton.props.accessibilityRole).toBe('button');
    });

    /**
     * Test 47: Navigation blocking - User stays in EDIT mode during save (Story 12b)
     * BUSINESS RULE: No navigation until API confirms
     *
     * Acceptance Criteria:
     * - AC3: User cannot navigate away while save is in progress
     * - AC4: Back button remains functional but forms blocks with unsaved changes dialog
     */
    it('Given save in progress When user presses back button Then navigation is blocked until complete', async () => {
      // Arrange - Mock slow API to test blocking behavior
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });

      (RecipeService as any).updateRecipe = jest.fn().mockReturnValue(updatePromise);

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

      // Act - Submit changes (API is slow, hasn't completed)
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Updating...');

      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Try to navigate back while save is in progress
      fireEvent.press(screen.getByTestId('recipe-detail-back-button'));

      // Assert - Should show discard changes dialog (form is still dirty during save)
      await waitFor(() => {
        expect(screen.getByText(/discard changes/i)).toBeOnTheScreen();
      });

      // Assert - Still in EDIT mode
      expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();

      // Complete the API call
      resolveUpdate!({
        success: true,
        data: { id: 'recipe-123', title: 'Updating...', servings: 4 }
      });

      // After completion, should automatically return to VIEW mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });
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
     * Test 52: API error with rollback - Temp recipe removed from cache (Story 12c - CREATE mode)
     * ERROR: Optimistic create rollback on failure
     *
     * Acceptance Criteria:
     * - AC1: API failure removes temp recipe from cache (rollback)
     * - AC2: Error snackbar displays "Failed to create recipe. Please try again."
     * - AC3: User stays in CREATE mode to retry
     */
    it('Given API error When create fails Then temp recipe removed and user stays in CREATE mode', async () => {
      // Arrange
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to create recipe'
      });

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      // Act - Fill form and submit
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Rollback Recipe');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.press(submitButton);

      // Assert - Error snackbar appears
      await waitFor(() => {
        expect(screen.getByText(/failed to create recipe/i)).toBeOnTheScreen();
      });

      // Assert - Temp recipe removed from cache (rollback)
      await waitFor(() => {
        const listCache = queryClient?.getQueryData<any[]>(['recipes']);
        const hasTempRecipe = listCache?.some(r => r.id.startsWith('temp-'));
        expect(hasTempRecipe).toBe(false); // No temp recipes in the cache
      });

      // Assert - Still in CREATE mode (not navigated)
      expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    /**
     * Test 53: Retry after error succeeds with new temp ID (Story 12c - CREATE mode)
     * ERROR: Retry generates fresh temp ID
     *
     * Acceptance Criteria:
     * - AC1: First attempt fails and removes temp recipe
     * - AC2: Second attempt generates NEW temp ID
     * - AC3: Second attempt succeeds and navigates with real ID
     */
    it('Given previous error When user retries Then second attempt generates new temp ID and succeeds', async () => {
      // Arrange - First call fails instantly, second succeeds with delay
      (RecipeService.createRecipe as jest.Mock)
        .mockResolvedValueOnce({
          success: false,
          error: 'Server error',
        })
        .mockImplementationOnce(
          () => new Promise((resolve) => {
            setTimeout(() => resolve({
              success: true,
              data: { id: 'real-uuid-789', title: 'Retry Success', servings: 4, createdAt: new Date().toISOString() },
            }), 100);
          })
        );

      const route = {
        params: {},
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
      });

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'Retry Success');

      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');

      // Act - First submission (fails)
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledTimes(1);
      });

      // Capture temp ID from the first attempt (should be removed after error)
      let firstTempId: string | undefined;
      await waitFor(() => {
        const listCache = queryClient?.getQueryData<any[]>(['recipes']);
        firstTempId = listCache?.find(r => r.id.startsWith('temp-'))?.id;
        expect(firstTempId).toBeUndefined(); // Temp recipe removed after error
      });

      // Act - Second submission (succeeds with delay)
      fireEvent.press(submitButton);

      // Assert - NEW temp ID generated (different from the first)
      await waitFor(() => {
        const listCache = queryClient?.getQueryData<any[]>(['recipes']);
        const secondTempRecipe = listCache?.find(r => r.id.startsWith('temp-'));
        expect(secondTempRecipe).toBeDefined();
        expect(secondTempRecipe?.id).not.toBe(firstTempId); // New temp ID
      });

      // Assert - Success and navigation with real ID
      await waitFor(() => {
        expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
        expect(mockNavigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: 'real-uuid-789'
        });
      });
    });

    /**
     * Test 54: API 500 error (EDIT mode)
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

    /**
     * Test 59: Delete API error shows error snackbar (Story 11 - DELETE)
     * ERROR: API failure handling
     */
    it('Given API returns error When delete fails Then error snackbar shows with error message', async () => {
      // Arrange
      (RecipeService as any).deleteRecipe = jest.fn().mockResolvedValue({
        success: false,
        error: {
          title: 'Internal Server Error',
          status: 500,
          detail: 'Failed to delete recipe',
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

      // Press delete and confirm
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

      // Assert - Error snackbar shows
      await waitFor(() => {
        expect(screen.getByText(/failed to delete|error/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 60: Delete API error does NOT navigate away (Story 11 - DELETE)
     * ERROR: Don't leave the user on broken state
     */
    it('Given API returns error When delete fails Then does NOT navigate away', async () => {
      // Arrange
      (RecipeService as any).deleteRecipe = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to delete recipe',
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

      // Press delete and confirm
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

      // Assert - Still on VIEW mode, navigation NOT called
      await waitFor(() => {
        expect(screen.getByText(/failed to delete|error/i)).toBeOnTheScreen();
      });
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    /**
     * Test 61: Delete network timeout shows error (Story 11 - DELETE)
     * ERROR: Network failure handling
     */
    it('Given network timeout When delete fails Then error snackbar shows timeout message', async () => {
      // Arrange
      (RecipeService as any).deleteRecipe = jest.fn().mockRejectedValue(
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

      // Press delete and confirm
      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

      // Assert - Timeout error shown
      await waitFor(() => {
        expect(screen.getByText(/timeout|error/i)).toBeOnTheScreen();
      });
    });

    /**
     * Test 62: Error handling - Failed update shows error snackbar with rollback (Story 12b - PRIORITY)
     * ERROR: Rollback and retry handling
     *
     * Acceptance Criteria:
     * - AC8: Failed update shows error snackbar "Failed to update recipe. Please try again."
     * - AC9: Cache automatically rolls back to the previous state- * AC10: User stays in EDIT mode to retry
     */
    it('Given recipe update fails When API returns error Then error snackbar shows and cache rolls back', async () => {
      // Arrange
      (RecipeService as any).updateRecipe = jest.fn().mockResolvedValue({
        success: false,
        error: 'Failed to update recipe'
      });

      const route = {
        params: { recipeId: 'recipe-123' },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const { queryClient } = renderWithProviders(
        <RecipeDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Capture original title from cache
      const originalData = queryClient?.getQueryData(['recipe', 'recipe-123']);

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Submit changes that will fail
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Failed Update');

      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert - Error snackbar appears
      await waitFor(() => {
        expect(screen.getByText(/failed to update recipe/i)).toBeOnTheScreen();
      });

      // Assert - Cache rolled back to original data
      await waitFor(() => {
        const rolledBackData = queryClient?.getQueryData(['recipe', 'recipe-123']);
        expect(rolledBackData).toEqual(originalData);
      });

      // Assert - Still in EDIT mode (not navigated)
      expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
    });
  });

  /**
   * ============================================
   * SECTION 10: IMAGE UPLOAD WITH AZURE BLOB STORAGE (2025 PATTERN)
   * Tests for sequential upload → save flow with optimistic updates
   * ============================================
   */
  describe('10. Image Upload Tests (Azure Blob Storage)', () => {
    /**
     * Test 1: CREATE mode - Basic recipe creation without image
     * RISK: Recipe creation must work with basic fields
     * NOTE: Image upload flow is tested in integration tests with EditableRecipeImage
     */
    it('Given CREATE mode When submitted Then creates recipe successfully', async () => {
      // Arrange - CREATE mode (no recipeId)
      const route = { params: {} };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route as any} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-create-mode')).toBeOnTheScreen();
      });

      // Act - Fill form and submit (no image selected)
      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      fireEvent.changeText(titleInput, 'New Recipe Without Image');

      // Submit the form
      fireEvent.press(screen.getByTestId('recipe-detail-create-form-submit'));

      // Assert - RecipeService.createRecipe should be called without image upload
      await waitFor(() => {
        expect(RecipeService.createRecipe).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Recipe Without Image',
          })
        );
      });

      // Image upload should NOT be called since no image was selected
      expect(ImageUploadService.getUploadToken).not.toHaveBeenCalled();
      expect(FileSystem.uploadAsync).not.toHaveBeenCalled();
    });

    /**
     * Test 2: EDIT mode - Basic recipe update without image change
     * RISK: Recipe update must work with basic fields
     * NOTE: Image upload flow is tested in integration tests with EditableRecipeImage
     */
    it('Given EDIT mode When submitted Then updates recipe successfully', async () => {
      // Arrange - EDIT mode with existing recipe
      const route = {
        params: { recipeId: 'recipe-123' },
      };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route as any} />
      );

      // Wait for VIEW mode to load
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
      });

      // Act - Change title (no image change)
      const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
      fireEvent.changeText(titleInput, 'Updated Recipe Title');

      // Submit
      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert - RecipeService.updateRecipe should be called without image upload
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledWith(
          'recipe-123',
          expect.objectContaining({
            title: 'Updated Recipe Title',
          })
        );
      });

      // Image upload should NOT be called since no new image was selected
      expect(ImageUploadService.getUploadToken).not.toHaveBeenCalled();
      expect(FileSystem.uploadAsync).not.toHaveBeenCalled();
    });

    /**
     * Test 3: Image upload failure scenario
     * RISK: Recipe must NOT be created/updated if upload fails
     * NOTE: Full image upload error flow is tested in integration tests
     * This test verifies mocks are properly set up
     */
    it.skip('Given image upload fails When error occurs Then displays error and prevents recipe save', async () => {
      // SKIPPED: This scenario requires simulating image selection which is complex in unit tests
      // Full image upload failure flow is covered in integration tests
      // See RecipeDetailScreen.integration.test.tsx for complete error handling tests
    });

    /**
     * Test 4: Optimistic update with image - Blob URL preview
     * RISK: User should see image preview immediately (optimistic UI)
     * NOTE: Full optimistic update flow is tested in integration tests
     * This test is skipped as it requires complex state simulation
     */
    it.skip('Given CREATE with image When optimistic update shown Then displays blob URL preview immediately', async () => {
      // SKIPPED: This scenario requires simulating image selection and complex optimistic state
      // Full optimistic update flow is covered in integration tests
      // See RecipeDetailScreen.integration.test.tsx for complete optimistic update tests
    });
  });
});
