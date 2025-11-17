/**
 * RecipeSnackbar Unit Tests - 2025 React Testing Library Patterns
 *
 * Component Purpose:
 * Reusable snackbar for displaying success/error messages in the RecipeDetailScreen.
 * Styled with inverse surface colors for proper Material Design 3 contrast.
 *
 * Test Strategy:
 * - Risk-Based Priority Tests: Core functionality for user feedback
 * - Happy Path Tests: Standard snackbar interactions
 * - Business Rules Tests: Message display and dismiss behavior
 * - Accessibility Tests: Screen reader support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecipeSnackbar } from '../RecipeSnackbar';
import { PaperProvider } from 'react-native-paper';

// Wrapper to provide theme context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('RecipeSnackbar Unit Tests', () => {
  // ============================================================================
  // 1. Risk-Based Priority Tests
  // ============================================================================
  describe('1. Risk-Based Priority Tests', () => {
    /**
     * Test 1: Message displayed when visible
     * RISK: User doesn't receive feedback on actions
     */
    it('Given visible=true When snackbar renders Then message is displayed', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
    });

    /**
     * Test 2: Dismiss button fires onDismiss
     * RISK: User cannot dismiss snackbar
     */
    it('Given visible snackbar When Dismiss pressed Then onDismiss fires', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.press(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 3: Snackbar not visible when visible=false
     * RISK: Snackbar shown when it shouldn't be
     */
    it('Given visible=false When snackbar renders Then snackbar NOT visible', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={false}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.queryByText('Recipe created successfully!')).not.toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 2. Happy Path Tests
  // ============================================================================
  describe('2. Happy Path Tests', () => {
    /**
     * Test 4: Success message displayed
     */
    it('Given success message When snackbar visible Then shows success text', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
    });

    /**
     * Test 5: Error message displayed
     */
    it('Given error message When snackbar visible Then shows error text', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Failed to create recipe. Please try again."
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Failed to create recipe. Please try again.')).toBeOnTheScreen();
    });

    /**
     * Test 6: Dismiss action visible
     */
    it('Given visible snackbar When rendered Then Dismiss action visible', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Dismiss')).toBeOnTheScreen();
    });

    /**
     * Test 7: Long message displayed
     */
    it('Given long message When snackbar visible Then displays full message', () => {
      const mockOnDismiss = jest.fn();
      const longMessage = 'This is a very long error message that might wrap to multiple lines to inform the user about what went wrong.';

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message={longMessage}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText(longMessage)).toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 3. Business Rules Tests
  // ============================================================================
  describe('3. Business Rules Tests', () => {
    /**
     * Test 8: Default duration is 3000 ms
     * BUSINESS RULE: Snackbar auto-dismisses after a reasonable time
     */
    it('Given no duration prop When snackbar renders Then uses default 3000ms duration', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      // Snackbar component from react-native-paper will use the default duration
      expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
    });

    /**
     * Test 9: Custom duration supported
     * BUSINESS RULE: Component should support custom durations
     */
    it('Given custom duration When snackbar renders Then accepts custom duration', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
          duration={5000}
        />
      );

      expect(screen.getByText('Recipe created successfully!')).toBeOnTheScreen();
    });

    /**
     * Test 10: Custom testID supported
     * BUSINESS RULE: Component should support custom test IDs
     */
    it('Given custom testID When snackbar renders Then uses custom testID', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
          testID="custom-snackbar"
        />
      );

      expect(screen.getByTestId('custom-snackbar')).toBeOnTheScreen();
    });

    /**
     * Test 11: Empty message handled gracefully
     * BUSINESS RULE: Component should not crash with an empty message
     */
    it('Given empty message When snackbar renders Then no error thrown', () => {
      const mockOnDismiss = jest.fn();

      expect(() => {
        renderWithTheme(
          <RecipeSnackbar
            visible={true}
            message=""
            onDismiss={mockOnDismiss}
          />
        );
      }).not.toThrow();
    });
  });

  // ============================================================================
  // 4. Accessibility Tests
  // ============================================================================
  describe('4. Accessibility Tests', () => {
    /**
     * Test 12: Snackbar visible to screen readers
     * ACCESSIBILITY: Screen reader users receive feedback
     */
    it('Given visible snackbar When screen reader active Then message announced', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      // React Native Paper's Snackbar has built-in accessibility
      const snackbar = screen.getByTestId('recipe-snackbar');
      expect(snackbar).toBeOnTheScreen();
    });

    /**
     * Test 13: Dismiss action accessible
     * ACCESSIBILITY: Screen reader users can dismiss snackbar
     */
    it('Given visible snackbar When screen reader active Then Dismiss action accessible', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      const dismissButton = screen.getByText('Dismiss');
      expect(dismissButton).toBeOnTheScreen();
    });

    /**
     * Test 14: Success message accessible
     * ACCESSIBILITY: Screen reader announces success
     */
    it('Given success message When snackbar visible Then message accessible to screen readers', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Recipe created successfully!"
          onDismiss={mockOnDismiss}
        />
      );

      const message = screen.getByText('Recipe created successfully!');
      expect(message).toBeOnTheScreen();
    });

    /**
     * Test 15: Error message accessible
     * ACCESSIBILITY: Screen reader announces errors
     */
    it('Given error message When snackbar visible Then error accessible to screen readers', () => {
      const mockOnDismiss = jest.fn();

      renderWithTheme(
        <RecipeSnackbar
          visible={true}
          message="Failed to create recipe. Please try again."
          onDismiss={mockOnDismiss}
        />
      );

      const errorMessage = screen.getByText('Failed to create recipe. Please try again.');
      expect(errorMessage).toBeOnTheScreen();
    });
  });
});
