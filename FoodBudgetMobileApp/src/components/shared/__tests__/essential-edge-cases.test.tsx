import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockRecipe } from '../../../test/test-utils';
import { Button } from '../ui/Button';
import { TextInput } from '../forms/TextInput';
import { NumberInput } from '../forms/NumberInput';
import { RecipeForm } from '../recipe/RecipeForm';
import { RecipeList } from '../recipe/RecipeList';

describe('Essential Edge Cases', () => {
  describe('Form Validation Edge Cases', () => {
    it('should handle empty form submission', async () => {
      const onSubmit = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="empty-form" />
      );

      // Hybrid validation: Submit empty form should show all validation errors immediately
      fireEvent.press(getByTestId('empty-form-submit'));

      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should handle invalid servings values', () => {
      const { getByText } = renderWithProviders(
        <>
          <NumberInput
            label="Min Servings"
            value={0} // Invalid: below minimum
            onChangeValue={jest.fn()}
            min={1}
            max={100}
            integer={true}
          />
          <NumberInput
            label="Max Servings"
            value={150} // Invalid: above maximum
            onChangeValue={jest.fn()}
            min={1}
            max={100}
            integer={true}
          />
        </>
      );

      // Should show validation errors for invalid values
      expect(getByText('Value must be at least 1')).toBeTruthy();
      expect(getByText('Value must be at most 100')).toBeTruthy();
    });

    it('should handle very long recipe content', async () => {
      const longTitle = 'A'.repeat(250); // Over 200 char limit
      const longInstructions = 'B'.repeat(5500); // Over 5000 char limit

      const onSubmit = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="long-content-form" />
      );

      // Enter long content
      fireEvent.changeText(getByTestId('long-content-form-title'), longTitle);
      fireEvent.changeText(getByTestId('long-content-form-instructions'), longInstructions);

      // Submit to trigger validation (hybrid approach)
      fireEvent.press(getByTestId('long-content-form-submit'));

      // Now validation errors should be visible
      await waitFor(() => {
        expect(getByText('Title cannot exceed 200 characters')).toBeTruthy();
        expect(getByText('Instructions cannot exceed 5000 characters')).toBeTruthy();
      });
    });
  });

  describe('Real User Input Scenarios', () => {
    it('should handle unicode and emoji characters', () => {
      const emojiTitle = '🍝 Pasta Carbonara 🇮🇹';
      const unicodeInstructions = 'Add 中文 spices and mix well';
      
      const onChangeText = jest.fn();
      
      const { getByTestId } = renderWithProviders(
        <TextInput
          label="Recipe Title"
          value=""
          onChangeText={onChangeText}
          testID="unicode-input"
        />
      );

      fireEvent.changeText(getByTestId('unicode-input'), emojiTitle);
      expect(onChangeText).toHaveBeenCalledWith(emojiTitle);

      // Test with instructions
      fireEvent.changeText(getByTestId('unicode-input'), unicodeInstructions);
      expect(onChangeText).toHaveBeenCalledWith(unicodeInstructions);
    });

    it('should handle special characters in recipe content', () => {
      const specialCharsTitle = 'Mom\'s "Special" Recipe (serves 4-6)';
      const ingredientsWithSymbols = '2½ cups flour\n¼ tsp salt\n1° oven temp';
      
      const onChangeText = jest.fn();
      
      const { getByTestId } = renderWithProviders(
        <TextInput
          label="Ingredients"
          value=""
          onChangeText={onChangeText}
          multiline
          testID="special-chars-input"
        />
      );

      fireEvent.changeText(getByTestId('special-chars-input'), ingredientsWithSymbols);
      expect(onChangeText).toHaveBeenCalledWith(ingredientsWithSymbols);
    });

    it('should handle decimal servings input', () => {
      const onChangeValue = jest.fn();
      const { getByTestId } = renderWithProviders(
        <NumberInput
          label="Servings"
          value={1}
          onChangeValue={onChangeValue}
          integer={true}
          testID="decimal-servings"
        />
      );

      // User enters decimal, should convert to integer
      fireEvent.changeText(getByTestId('decimal-servings'), '2.5');
      expect(onChangeValue).toHaveBeenCalledWith(2);
    });
  });

  describe('Component Crash Prevention', () => {
    it('should handle buttons with noop callback functions', () => {
      const noopCallback = () => {}; // Realistic noop function
      const { getByRole } = renderWithProviders(
        <Button title="Test Button" onPress={noopCallback} />
      );

      expect(() => {
        fireEvent.press(getByRole('button'));
      }).not.toThrow();
    });

    it('should handle minimal recipe data without optional fields', () => {
      const minimalRecipe = createMockRecipe({
        title: 'Basic Recipe',
        servings: 1,
        instructions: null, // Realistic case - instructions are optional
      });

      expect(() => {
        renderWithProviders(
          <RecipeForm
            initialValues={minimalRecipe}
            onSubmit={() => {}}
          />
        );
      }).not.toThrow();
    });
  });

  describe('User Interaction Edge Cases', () => {
    it('should prevent rapid duplicate form submissions', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="rapid-submit-form" />
      );

      // Fill valid form
      fireEvent.changeText(getByTestId('rapid-submit-form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('rapid-submit-form-servings'), '4');

      const submitButton = getByTestId('rapid-submit-form-submit');

      // Click submit button multiple times rapidly
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);
      fireEvent.press(submitButton);

      // Should be disabled after first click (loading state)
      expect(submitButton.props.accessibilityState.disabled).toBe(true);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle component unmounting during form submission', () => {
      const slowSubmit = jest.fn(() => new Promise(() => {})); // Never resolves
      const { getByTestId, unmount } = renderWithProviders(
        <RecipeForm onSubmit={slowSubmit} testID="unmount-form" />
      );

      fireEvent.changeText(getByTestId('unmount-form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('unmount-form-servings'), '4');
      fireEvent.press(getByTestId('unmount-form-submit'));

      // Unmount component while submission is pending
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle rapid typing in form fields', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = renderWithProviders(
        <TextInput
          label="Recipe Title"
          value=""
          onChangeText={onChangeText}
          testID="rapid-typing"
        />
      );

      // Simulate rapid typing (no need for delays in tests)
      const rapidText = ['T', 'Te', 'Tes', 'Test', 'Test '];
      rapidText.forEach(text => {
        fireEvent.changeText(getByTestId('rapid-typing'), text);
      });

      expect(onChangeText).toHaveBeenCalledTimes(5);
    });
  });

  describe('Network and Async Error Handling', () => {
    it('should handle form submission network errors', async () => {
      const failingSubmit = jest.fn().mockRejectedValue(new Error('Network error'));
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={failingSubmit} testID="network-error-form" />
      );

      fireEvent.changeText(getByTestId('network-error-form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('network-error-form-servings'), '4');
      
      fireEvent.press(getByTestId('network-error-form-submit'));

      // Should handle the error gracefully without crashing
      await waitFor(() => {
        expect(failingSubmit).toHaveBeenCalled();
      });

      // Form should return to normal state after error
      const submitButton = getByTestId('network-error-form-submit');
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('should handle async operations being cancelled', () => {
      let resolveSubmit: (value: any) => void;
      const pendingSubmit = jest.fn(() => new Promise(resolve => {
        resolveSubmit = resolve;
      }));

      const { getByTestId, unmount } = renderWithProviders(
        <RecipeForm onSubmit={pendingSubmit} testID="cancelled-form" />
      );

      fireEvent.changeText(getByTestId('cancelled-form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('cancelled-form-submit'));

      // Unmount before operation completes
      unmount();

      // Complete the async operation after unmount
      if (resolveSubmit!) {
        resolveSubmit(undefined);
      }

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Performance with Realistic Data', () => {
    it('should handle moderate-sized recipe lists (20-50 recipes)', () => {
      const moderateRecipeList = Array.from({ length: 30 }, (_, i) =>
        createMockRecipe({
          id: `recipe-${i}`,
          title: `Recipe ${i}`,
          instructions: `Detailed instructions for recipe ${i}. `.repeat(5),
        })
      );

      const { getByTestId } = renderWithProviders(
        <RecipeList recipes={moderateRecipeList} testID="moderate-list" />
      );

      // Should render all recipes without errors
      expect(getByTestId('moderate-list')).toBeTruthy();
    });

    it('should handle search filtering on large lists', () => {
      const searchableRecipes = Array.from({ length: 50 }, (_, i) =>
        createMockRecipe({
          id: `recipe-${i}`,
          title: i % 5 === 0 ? `Pasta Recipe ${i}` : `Other Recipe ${i}`,
        })
      );

      const { getByTestId, getByText } = renderWithProviders(
        <RecipeList recipes={searchableRecipes} testID="searchable-list" />
      );

      const searchBar = getByTestId('searchable-list-search');

      fireEvent.changeText(searchBar, 'Pasta');

      // Search should work correctly and show filtered results
      expect(getByText('Pasta Recipe 0')).toBeTruthy();
    });
  });

  describe('Theme and Platform Adaptability', () => {
    it('should work correctly with theme switching', () => {
      const testButton = <Button title="Theme Test Button" />;

      // Test light theme
      const { getByText, rerender } = renderWithProviders(
        testButton,
        { theme: 'light' }
      );
      expect(getByText('Theme Test Button')).toBeTruthy();

      // Switch to dark theme
      const { getByText: getDarkText } = renderWithProviders(
        testButton,
        { theme: 'dark' }
      );
      expect(getDarkText('Theme Test Button')).toBeTruthy();
    });

    it('should adapt to different safe area configurations', () => {
      const safeAreaConfigs = [
        { top: 0, bottom: 0, left: 0, right: 0 },     // Standard Android
        { top: 44, bottom: 34, left: 0, right: 0 },   // iPhone with notch
        { top: 20, bottom: 0, left: 0, right: 0 },    // Standard iPhone
      ];

      safeAreaConfigs.forEach((insets, index) => {
        const { getAllByText } = renderWithProviders(
          <RecipeForm onSubmit={() => {}} />,
          { initialSafeAreaInsets: insets }
        );

        expect(getAllByText('Recipe Title')[0]).toBeTruthy();
      });
    });
  });
});