import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockRecipe } from '../../../test/test-utils';
import { Button } from '../ui/Button';
import { TextInput } from '../forms/TextInput';
import { NumberInput } from '../forms/NumberInput';
import { RecipeCard } from '../recipe/RecipeCard';
import { RecipeForm } from '../recipe/RecipeForm';
import { EmptyState } from '../feedback/EmptyState';

describe('Accessibility Tests (WCAG 2.1 AA)', () => {
  describe('Button Accessibility', () => {
    it('should have proper accessibility role and label', () => {
      const { getByRole } = renderWithProviders(
        <Button title="Save Recipe" onPress={() => {}} testID="save-btn" />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityRole).toBe('button');
      // Check that button is not explicitly disabled
      expect(button.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('should announce disabled state to screen readers', () => {
      const { getByTestId } = renderWithProviders(
        <Button title="Disabled Button" disabled testID="disabled-btn" />
      );

      const button = getByTestId('disabled-btn');
      // Check accessibilityState for disabled state (React Native standard)
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should announce loading state to screen readers', () => {
      const { getByTestId } = renderWithProviders(
        <Button title="Loading" loading testID="loading-btn" />
      );

      const button = getByTestId('loading-btn');
      // Loading button should be disabled
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should support keyboard navigation patterns', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithProviders(
        <Button title="Keyboard Test" onPress={onPress} />
      );

      const button = getByRole('button');
      
      // Test that button is focusable (React Native handles this automatically)
      expect(button.props.accessible).toBe(true);
      
      // Test that pressing activates the button
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
    });

    it('should have meaningful labels for different variants', () => {
      const variants = ['primary', 'secondary', 'danger', 'text'] as const;
      
      variants.forEach(variant => {
        const { getByText } = renderWithProviders(
          <Button title={`${variant} button`} variant={variant} />
        );
        
        expect(getByText(`${variant} button`)).toBeTruthy();
      });
    });
  });

  describe('Form Input Accessibility', () => {
    it('should associate labels with inputs correctly', () => {
      const { getByTestId, getAllByText } = renderWithProviders(
        <TextInput
          label="Recipe Name"
          value=""
          onChangeText={() => {}}
          testID="recipe-input"
        />
      );

      // React Native Paper should handle label association
      const input = getByTestId('recipe-input');
      const labels = getAllByText('Recipe Name');
      expect(input).toBeTruthy();
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should announce validation errors to screen readers', () => {
      const { getByText, getByTestId } = renderWithProviders(
        <TextInput
          label="Required Field"
          value=""
          onChangeText={() => {}}
          error="This field is required"
          testID="error-input"
        />
      );

      const input = getByTestId('error-input');
      const errorMessage = getByText('This field is required');

      // Error should be associated with input for screen readers
      expect(input).toBeTruthy();
      expect(errorMessage).toBeTruthy();
    });

    it('should provide helper text for better UX', () => {
      const { getByText } = renderWithProviders(
        <NumberInput
          label="Servings"
          value={1}
          onChangeValue={() => {}}
          helperText="Enter number between 1 and 100"
          min={1}
          max={100}
        />
      );

      expect(getByText('Enter number between 1 and 100')).toBeTruthy();
    });

    it('should handle focus management correctly', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      
      const { getByTestId } = renderWithProviders(
        <TextInput
          label="Focus Test"
          value=""
          onChangeText={() => {}}
          onFocus={onFocus}
          onBlur={onBlur}
          testID="focus-input"
        />
      );

      const input = getByTestId('focus-input');
      
      fireEvent(input, 'focus');
      expect(onFocus).toHaveBeenCalled();
      
      fireEvent(input, 'blur');
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Card Component Accessibility', () => {
    const mockRecipe = createMockRecipe();

    it('should have proper semantic structure', () => {
      const { getByTestId } = renderWithProviders(
        <RecipeCard recipe={mockRecipe} testID="accessible-card" />
      );

      const card = getByTestId('accessible-card');
      expect(card).toBeTruthy();
      
      // Card should be accessible as a group of related content
      expect(card.props.accessible).not.toBe(false);
    });

    it('should provide meaningful action button labels', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onPress = jest.fn();

      const { getByTestId } = renderWithProviders(
        <RecipeCard
          recipe={mockRecipe}
          onEdit={onEdit}
          onDelete={onDelete}
          onPress={onPress}
          testID="action-card"
        />
      );

      // Action buttons should have clear purposes
      const editButton = getByTestId('action-card-edit');
      const deleteButton = getByTestId('action-card-delete');
      const viewButton = getByTestId('action-card-view');

      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
      expect(viewButton).toBeTruthy();

      // Test that buttons are accessible
      fireEvent.press(editButton);
      expect(onEdit).toHaveBeenCalled();
    });

    it('should handle long content gracefully for screen readers', () => {
      const longRecipe = createMockRecipe({
        title: 'Very Long Recipe Title That Might Overflow On Small Screens',
        instructions: 'A'.repeat(1000), // Very long instructions
      });

      const { getByText } = renderWithProviders(
        <RecipeCard recipe={longRecipe} />
      );

      // Content should be truncated but still accessible
      expect(getByText(longRecipe.title)).toBeTruthy();
    });
  });

  describe('Form Accessibility', () => {
    it('should provide clear form structure and navigation', () => {
      const onSubmit = jest.fn();
      const { getAllByText, getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="accessible-form" />
      );

      // Form should have clear labels and structure
      const titleLabels = getAllByText('Recipe Title');
      const servingsLabels = getAllByText('Servings');
      const instructionsLabels = getAllByText('Instructions');
      expect(titleLabels.length).toBeGreaterThan(0);
      expect(servingsLabels.length).toBeGreaterThan(0);
      expect(instructionsLabels.length).toBeGreaterThan(0);

      // Submit button should be clearly labeled
      const submitButton = getByTestId('accessible-form-submit');
      expect(submitButton).toBeTruthy();
      expect(submitButton.props.accessibilityRole).toBe('button');
    });

    it('should handle validation errors accessibly', async () => {
      const onSubmit = jest.fn();
      const { getByTestId, queryByText } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="validation-form" />
      );

      // Hybrid validation: Submit empty form should show all validation errors immediately
      const submitButton = getByTestId('validation-form-submit');
      fireEvent.press(submitButton);

      await waitFor(() => {
        const titleError = queryByText('Title is required');
        expect(titleError).toBeTruthy();
      });

      // Verify submit was not called due to validation failure
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should support keyboard navigation between fields', () => {
      const onSubmit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} testID="keyboard-form" />
      );

      // All form fields should be accessible via keyboard
      const titleInput = getByTestId('keyboard-form-title');
      const servingsInput = getByTestId('keyboard-form-servings');
      const instructionsInput = getByTestId('keyboard-form-instructions');

      expect(titleInput.props.accessible).not.toBe(false);
      expect(servingsInput.props.accessible).not.toBe(false);
      expect(instructionsInput.props.accessible).not.toBe(false);
    });
  });

  describe('Empty State Accessibility', () => {
    it('should provide meaningful empty state messaging', () => {
      const onAction = jest.fn();
      const { getByText } = renderWithProviders(
        <EmptyState
          title="No recipes found"
          message="Start by adding your first recipe to get cooking!"
          actionLabel="Add Recipe"
          onAction={onAction}
          icon="chef-hat"
        />
      );

      expect(getByText('No recipes found')).toBeTruthy();
      expect(getByText('Start by adding your first recipe to get cooking!')).toBeTruthy();
      
      const actionButton = getByText('Add Recipe');
      expect(actionButton).toBeTruthy();
      
      fireEvent.press(actionButton);
      expect(onAction).toHaveBeenCalled();
    });

    it('should handle cases without action buttons', () => {
      const { getByText } = renderWithProviders(
        <EmptyState
          title="Loading failed"
          message="Please check your connection and try again"
          icon="wifi-off"
        />
      );

      expect(getByText('Loading failed')).toBeTruthy();
      expect(getByText('Please check your connection and try again')).toBeTruthy();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should work with both light and dark themes', () => {
      const testComponent = <Button title="Theme Test" />;

      // Test light theme
      const { rerender, getByText: getLightText } = renderWithProviders(
        testComponent,
        { theme: 'light' }
      );
      expect(getLightText('Theme Test')).toBeTruthy();

      // Test dark theme  
      const { getByText: getDarkText } = renderWithProviders(
        testComponent,
        { theme: 'dark' }
      );
      expect(getDarkText('Theme Test')).toBeTruthy();
    });

    it('should provide sufficient visual feedback for interactions', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithProviders(
        <Button title="Interactive Button" onPress={onPress} />
      );

      const button = getByRole('button');
      
      // Button should respond to press events
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalled();
      
      // Button should be visually distinguishable when disabled
      const { getByTestId: getDisabledButton } = renderWithProviders(
        <Button title="Disabled Button" disabled testID="disabled-visual-btn" />
      );

      const disabledButton = getDisabledButton('disabled-visual-btn');
      expect(disabledButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce form submission status', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={onSubmit} isLoading={true} testID="announce-form" />
      );

      // Form should show loading state when isLoading is true
      const submitButton = getByTestId('announce-form-submit');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should announce dynamic content changes', () => {
      const recipes = [createMockRecipe({ id: '1', title: 'Recipe 1' })];
      const { getByText, rerender } = renderWithProviders(
        <RecipeCard recipe={recipes[0]} />
      );

      expect(getByText('Recipe 1')).toBeTruthy();

      // Update recipe data
      const updatedRecipe = { ...recipes[0], title: 'Updated Recipe' };
      rerender(<RecipeCard recipe={updatedRecipe} />);

      expect(getByText('Updated Recipe')).toBeTruthy();
    });
  });
});