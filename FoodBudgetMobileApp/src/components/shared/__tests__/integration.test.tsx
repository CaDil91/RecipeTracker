import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockRecipe } from '../../../test/test-utils';
import { RecipeForm } from '../recipe/RecipeForm';
import { RecipeList } from '../recipe/RecipeList';
import { RecipeCard } from '../recipe/RecipeCard';

describe('Component Integration Tests', () => {
  describe('RecipeForm Integration', () => {
    it('should work correctly with Paper theme context', async () => {
      const onSubmit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="integration-form" />
      );

      // Fill out the form
      fireEvent.changeText(getByTestId('integration-form-title'), 'Integration Test Recipe');
      fireEvent.changeText(getByTestId('integration-form-servings'), '6');
      fireEvent.changeText(getByTestId('integration-form-instructions'), 'Test instructions');

      // Submit the form
      fireEvent.press(getByTestId('integration-form-submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          title: 'Integration Test Recipe',
          servings: 6,
          instructions: 'Test instructions',
        });
      });
    });

    it('should work correctly with dark theme', async () => {
      const onSubmit = jest.fn();
      const { getByTestId, getAllByText } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="dark-form" />,
        { theme: 'dark' }
      );

      // Verify form renders in dark theme context
      expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);
      expect(getByTestId('dark-form-title')).toBeTruthy();
    });

    it('should handle complex validation scenarios', async () => {
      const onSubmit = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="validation-form" />
      );

      // Test multiple field validation
      fireEvent.changeText(getByTestId('validation-form-title'), ''); // Empty title
      fireEvent.changeText(getByTestId('validation-form-servings'), '200'); // Over max
      fireEvent.changeText(getByTestId('validation-form-instructions'), 'a'.repeat(5001)); // Over max

      // Blur all fields to trigger validation
      fireEvent(getByTestId('validation-form-title'), 'blur');
      fireEvent(getByTestId('validation-form-servings'), 'blur');
      fireEvent(getByTestId('validation-form-instructions'), 'blur');

      // Try to submit with errors
      fireEvent.press(getByTestId('validation-form-submit'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
        expect(getByText('Servings must be between 1 and 100')).toBeTruthy();
        expect(getByText('Instructions cannot exceed 5000 characters')).toBeTruthy();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('RecipeList Integration', () => {
    const mockRecipes = [
      createMockRecipe({ id: '1', title: 'Recipe 1' }),
      createMockRecipe({ id: '2', title: 'Recipe 2' }),
      createMockRecipe({ id: '3', title: 'Recipe 3' }),
    ];

    it('should handle complete user interaction flow', async () => {
      const onRecipePress = jest.fn();
      const onRecipeEdit = jest.fn();
      const onRecipeDelete = jest.fn();
      const onAddRecipe = jest.fn();

      const { getByTestId, getByText } = renderWithProviders(
        <RecipeList
          recipes={mockRecipes}
          onRecipePress={onRecipePress}
          onRecipeEdit={onRecipeEdit}
          onRecipeDelete={onRecipeDelete}
          onAddRecipe={onAddRecipe}
          testID="integration-list"
        />
      );

      // Test search functionality
      const searchBar = getByTestId('integration-list-search');
      fireEvent.changeText(searchBar, 'Recipe 1');

      // Should show filtered results
      expect(getByText('Recipe 1')).toBeTruthy();

      // Test recipe interaction
      fireEvent.press(getByTestId('integration-list-item-1-edit'));
      expect(onRecipeEdit).toHaveBeenCalledWith(mockRecipes[0]);

      // Test FAB
      fireEvent.press(getByTestId('integration-list-fab'));
      expect(onAddRecipe).toHaveBeenCalled();
    });

    it('should handle empty state with theme context', () => {
      const onAddRecipe = jest.fn();
      const { getByText } = renderWithProviders(
        <RecipeList
          recipes={[]}
          onAddRecipe={onAddRecipe}
          emptyTitle="No recipes found"
          emptyMessage="Add your first recipe!"
        />
      );

      expect(getByText('No recipes found')).toBeTruthy();
      expect(getByText('Add your first recipe!')).toBeTruthy();
    });
  });

  describe('Cross-Component Communication', () => {
    it('should handle RecipeCard to RecipeForm data flow', () => {
      const mockRecipe = createMockRecipe({
        title: 'Existing Recipe',
        servings: 8,
        instructions: 'Existing instructions'
      });

      // Test RecipeCard display
      const { getByText: cardGetByText } = renderWithProviders(
        <RecipeCard recipe={mockRecipe} testID="card" />
      );

      expect(cardGetByText('Existing Recipe')).toBeTruthy();
      expect(cardGetByText('8 servings')).toBeTruthy();

      // Test RecipeForm with initial values
      const onSubmit = jest.fn();
      const { getByDisplayValue } = renderWithProviders(
        <RecipeForm
          initialValues={mockRecipe}
          onSubmit={onSubmit}
          testID="edit-form"
        />
      );

      expect(getByDisplayValue('Existing Recipe')).toBeTruthy();
      expect(getByDisplayValue('8')).toBeTruthy();
      expect(getByDisplayValue('Existing instructions')).toBeTruthy();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to prevent noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const { queryAllByText } = renderWithProviders(
        <RecipeForm
          onSubmit={() => {}}
          // @ts-ignore - intentionally causing error
          customErrorComponent={<ErrorComponent />}
        />
      );

      // Component should still render its main content
      expect(queryAllByText('Recipe Title')[0]).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Integration', () => {
    it('should render large recipe lists efficiently', () => {
      const largeRecipeList = Array.from({ length: 100 }, (_, i) =>
        createMockRecipe({
          id: `recipe-${i}`,
          title: `Recipe ${i}`,
        })
      );

      const startTime = performance.now();
      const { getByTestId } = renderWithProviders(
        <RecipeList
          recipes={largeRecipeList}
          testID="large-list"
        />
      );
      const endTime = performance.now();

      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
      expect(getByTestId('large-list')).toBeTruthy();
    });

    it('should handle rapid form input changes', async () => {
      const onSubmit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="perf-form" />
      );

      const titleInput = getByTestId('perf-form-title');

      // Simulate rapid typing
      const rapidChanges = ['a', 'ab', 'abc', 'abcd', 'abcde'];
      for (const text of rapidChanges) {
        fireEvent.changeText(titleInput, text);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Form should still be functional
      expect(titleInput.props.value).toBe('abcde');
    });
  });
});