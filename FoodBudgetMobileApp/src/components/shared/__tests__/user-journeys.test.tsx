import React, { useState } from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockRecipe } from '../../../test/test-utils';
import { RecipeForm } from '../recipe/RecipeForm';
import { RecipeList } from '../recipe/RecipeList';
import { RecipeCard } from '../recipe/RecipeCard';

describe('User Journey Integration Tests', () => {
  describe('Complete Recipe Management Flow', () => {
    it('should handle the full add-recipe workflow', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      const mockCancel = jest.fn();

      // Step 1: User opens add recipe form
      const { getByTestId, getAllByText } = renderWithProviders(
        <RecipeForm
          onSubmit={mockSubmit}
          onCancel={mockCancel}
          testID="journey-form"
        />
      );

      expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);
      expect(getAllByText('Servings').length).toBeGreaterThan(0);
      expect(getAllByText('Instructions').length).toBeGreaterThan(0);

      // Step 2: User fills out form with validation
      fireEvent.changeText(getByTestId('journey-form-title'), 'My Famous Pasta');
      fireEvent.changeText(getByTestId('journey-form-servings'), '6');
      fireEvent.changeText(getByTestId('journey-form-instructions'), 'Boil pasta, add sauce, serve hot');

      // Step 3: User submits form
      fireEvent.press(getByTestId('journey-form-submit'));

      // Step 4: Verify submission
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: 'My Famous Pasta',
          servings: 6,
          instructions: 'Boil pasta, add sauce, serve hot',
        });
      });
    });

    it('should handle the search and filter workflow', () => {
      const recipes = [
        createMockRecipe({ id: '1', title: 'Pasta Carbonara' }),
        createMockRecipe({ id: '2', title: 'Chicken Curry' }),
        createMockRecipe({ id: '3', title: 'Pasta Bolognese' }),
        createMockRecipe({ id: '4', title: 'Beef Stew' }),
      ];

      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <RecipeList recipes={recipes} testID="journey-list" />
      );

      // Step 1: User sees all recipes initially
      expect(getByText('Pasta Carbonara')).toBeTruthy();
      expect(getByText('Chicken Curry')).toBeTruthy();
      expect(getByText('Pasta Bolognese')).toBeTruthy();
      expect(getByText('Beef Stew')).toBeTruthy();

      // Step 2: User searches for "pasta"
      const searchBar = getByTestId('journey-list-search');
      fireEvent.changeText(searchBar, 'pasta');

      // Step 3: Only pasta recipes should be visible
      expect(getByText('Pasta Carbonara')).toBeTruthy();
      expect(getByText('Pasta Bolognese')).toBeTruthy();
      expect(queryByText('Chicken Curry')).toBeNull();
      expect(queryByText('Beef Stew')).toBeNull();

      // Step 4: User clears search
      fireEvent.changeText(searchBar, '');

      // Step 5: All recipes visible again
      expect(getByText('Chicken Curry')).toBeTruthy();
      expect(getByText('Beef Stew')).toBeTruthy();
    });

    it('should handle the edit recipe workflow', () => {
      const existingRecipe = createMockRecipe({
        title: 'Original Recipe',
        servings: 4,
        instructions: 'Original instructions',
      });

      const mockSubmit = jest.fn();

      // Step 1: User opens edit form with existing data
      const { getByDisplayValue, getByTestId } = renderWithProviders(
        <RecipeForm
          initialValues={existingRecipe}
          onSubmit={mockSubmit}
          submitLabel="Update Recipe"
          testID="edit-journey-form"
        />
      );

      // Step 2: Verify form is pre-populated
      expect(getByDisplayValue('Original Recipe')).toBeTruthy();
      expect(getByDisplayValue('4')).toBeTruthy();
      expect(getByDisplayValue('Original instructions')).toBeTruthy();

      // Step 3: User modifies the recipe
      fireEvent.changeText(getByTestId('edit-journey-form-title'), 'Updated Recipe');
      fireEvent.changeText(getByTestId('edit-journey-form-servings'), '6');

      // Step 4: User saves changes
      fireEvent.press(getByTestId('edit-journey-form-submit'));

      expect(mockSubmit).toHaveBeenCalledWith({
        title: 'Updated Recipe',
        servings: 6,
        instructions: 'Original instructions',
      });
    });

    it('should handle the recipe card interaction workflow', () => {
      const recipe = createMockRecipe({
        title: 'Interactive Recipe',
        servings: 4,
        instructions: 'Test instructions',
      });

      const mockView = jest.fn();
      const mockEdit = jest.fn();
      const mockDelete = jest.fn();

      // Step 1: User sees recipe card
      const { getByText, getByTestId } = renderWithProviders(
        <RecipeCard
          recipe={recipe}
          onPress={mockView}
          onEdit={mockEdit}
          onDelete={mockDelete}
          testID="journey-card"
        />
      );

      expect(getByText('Interactive Recipe')).toBeTruthy();
      expect(getByText('4 servings')).toBeTruthy();

      // Step 2: User clicks different actions
      fireEvent.press(getByTestId('journey-card-view'));
      expect(mockView).toHaveBeenCalled();

      fireEvent.press(getByTestId('journey-card-edit'));
      expect(mockEdit).toHaveBeenCalled();

      fireEvent.press(getByTestId('journey-card-delete'));
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should handle validation error recovery workflow', async () => {
      const mockSubmit = jest.fn();
      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <RecipeForm onSubmit={mockSubmit} testID="error-recovery-form" />
      );

      // Step 1: User submits invalid form (hybrid validation - show all errors on submit)
      fireEvent.press(getByTestId('error-recovery-form-submit'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      // Step 2: User fixes the error
      fireEvent.changeText(getByTestId('error-recovery-form-title'), 'Fixed Recipe');
      fireEvent.changeText(getByTestId('error-recovery-form-servings'), '4');

      // Step 3: Error should disappear when field is valid
      fireEvent(getByTestId('error-recovery-form-title'), 'blur');
      
      // Step 4: User can now submit successfully
      fireEvent.press(getByTestId('error-recovery-form-submit'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          title: 'Fixed Recipe',
          servings: 4,
          instructions: null,
        });
      });
    });

    it('should handle network error recovery workflow', async () => {
      let shouldFail = true;
      const mockSubmit = jest.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve();
      });

      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockSubmit} testID="network-recovery-form" />
      );

      // Step 1: Fill form and submit (will fail)
      fireEvent.changeText(getByTestId('network-recovery-form-title'), 'Network Test Recipe');
      fireEvent.changeText(getByTestId('network-recovery-form-servings'), '4');
      fireEvent.press(getByTestId('network-recovery-form-submit'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      // Wait for form to reset after error
      await waitFor(() => {
        const submitButton = getByTestId('network-recovery-form-submit');
        expect(submitButton.props.accessibilityState?.disabled).toBe(false);
      });

      // Step 2: Fix network issue and retry
      shouldFail = false;
      fireEvent.press(getByTestId('network-recovery-form-submit'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Multi-Component Interaction Workflows', () => {
    it('should handle list-to-form data flow', () => {
      // Simulate parent component managing state between list and form
      const TestWorkflow = () => {
        const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
        const [isEditing, setIsEditing] = useState(false);

        const recipes = [
          createMockRecipe({ id: '1', title: 'Test Recipe', servings: 4 }),
        ];

        const handleEdit = (recipe: any) => {
          setSelectedRecipe(recipe);
          setIsEditing(true);
        };

        const handleSubmit = (data: any) => {
          setIsEditing(false);
          setSelectedRecipe(null);
        };

        const handleCancel = () => {
          setIsEditing(false);
          setSelectedRecipe(null);
        };

        if (isEditing) {
          return (
            <RecipeForm
              initialValues={selectedRecipe}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              testID="workflow-form"
            />
          );
        }

        return (
          <RecipeList
            recipes={recipes}
            onRecipeEdit={handleEdit}
            testID="workflow-list"
          />
        );
      };

      const { getByTestId, getByDisplayValue } = renderWithProviders(
        <TestWorkflow />
      );

      // Step 1: User clicks edit on recipe from list
      fireEvent.press(getByTestId('workflow-list-item-1-edit'));

      // Step 2: Form should open with recipe data pre-populated
      expect(getByDisplayValue('Test Recipe')).toBeTruthy();
      expect(getByDisplayValue('4')).toBeTruthy();

      // Step 3: User cancels editing
      fireEvent.press(getByTestId('workflow-form-cancel'));

      // Step 4: Should return to list view
      expect(getByTestId('workflow-list')).toBeTruthy();
    });

    it('should handle empty state to add recipe workflow', () => {
      const mockAddRecipe = jest.fn();
      
      // Step 1: User sees empty state
      const { getByText } = renderWithProviders(
        <RecipeList
          recipes={[]}
          onAddRecipe={mockAddRecipe}
          emptyTitle="No recipes yet"
          emptyMessage="Start by adding your first recipe!"
        />
      );

      expect(getByText('No recipes yet')).toBeTruthy();
      expect(getByText('Start by adding your first recipe!')).toBeTruthy();

      // Step 2: User clicks add recipe from empty state
      const addButton = getByText('Add Recipe');
      fireEvent.press(addButton);

      expect(mockAddRecipe).toHaveBeenCalled();
    });

    it('should handle pull-to-refresh workflow', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);
      const recipes = [createMockRecipe({ title: 'Refreshable Recipe' })];

      const { getByTestId } = renderWithProviders(
        <RecipeList
          recipes={recipes}
          onRefresh={mockRefresh}
          isRefreshing={false}
          testID="refresh-list"
        />
      );

      // Step 1: User pulls down to refresh (simulated)
      const list = getByTestId('refresh-list');
      fireEvent(list, 'refresh');

      // Step 2: Refresh handler should be called
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Performance and UX Workflows', () => {
    it('should maintain form state during rapid interactions', () => {
      const mockSubmit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockSubmit} testID="rapid-interaction-form" />
      );

      const titleInput = getByTestId('rapid-interaction-form-title');
      const servingsInput = getByTestId('rapid-interaction-form-servings');

      // Step 1: User rapidly switches between fields
      fireEvent.changeText(titleInput, 'Rapid');
      fireEvent(titleInput, 'blur');
      fireEvent(servingsInput, 'focus');
      fireEvent.changeText(servingsInput, '2');
      fireEvent(servingsInput, 'blur');
      fireEvent(titleInput, 'focus');
      fireEvent.changeText(titleInput, 'Rapid Recipe');

      // Step 2: Values should be maintained correctly
      expect(titleInput.props.value).toBe('Rapid Recipe');
      expect(servingsInput.props.value).toBe('2');
    });

    it('should handle theme switching during user interaction', () => {
      const mockSubmit = jest.fn();
      
      // Step 1: Start with light theme
      const { getAllByText, rerender } = renderWithProviders(
        <RecipeForm onSubmit={mockSubmit} />,
        { theme: 'light' }
      );

      expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);

      // Step 2: Switch to dark theme (simulating user preference change)
      const { getAllByText: getDarkText } = renderWithProviders(
        <RecipeForm onSubmit={mockSubmit} />,
        { theme: 'dark' }
      );

      expect(getDarkText('Recipe Title').length).toBeGreaterThan(0);
    });
  });
});