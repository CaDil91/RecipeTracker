/**
 * RecipeDetailHeader Unit Tests - 2025 React Testing Library Patterns
 *
 * Component Purpose:
 * Unified header for RecipeDetailScreen across all modes (VIEW/EDIT/CREATE).
 * - All modes: Back button
 * - VIEW and EDIT modes: Delete button
 * - CREATE mode: Back button only
 *
 * Test Strategy:
 * - Risk-Based Priority Tests: Core functionality that could break user flows
 * - Happy Path Tests: Standard use cases
 * - Business Rules Tests: Mode-specific behavior
 * - Accessibility Tests: Screen reader support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecipeDetailHeader } from '../RecipeDetailHeader';
import { PaperProvider } from 'react-native-paper';

// Wrapper to provide theme context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('RecipeDetailHeader Unit Tests', () => {
  // ============================================================================
  // 1. Risk-Based Priority Tests
  // ============================================================================
  describe('1. Risk-Based Priority Tests', () => {
    /**
     * Test 1: Back button functions in VIEW mode
     * RISK: User cannot navigate away from the screen
     */
    it('Given VIEW mode When back button pressed Then onBack callback fires', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByTestId('recipe-detail-back-button'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 2: Delete button functions in VIEW mode
     * RISK: User cannot delete recipes
     */
    it('Given VIEW mode When delete button pressed Then onDelete callback fires', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 3: Delete button hidden in CREATE mode
     * RISK: User can delete non-existent recipe
     */
    it('Given CREATE mode When header renders Then delete button NOT visible', () => {
      const mockOnBack = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="create"
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByTestId('recipe-detail-delete-button')).not.toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 2. Happy Path Tests
  // ============================================================================
  describe('2. Happy Path Tests', () => {
    /**
     * Test 4: Back button renders in VIEW mode
     */
    it('Given VIEW mode When header renders Then back button visible', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('recipe-detail-back-button')).toBeOnTheScreen();
    });

    /**
     * Test 5: Delete button renders in VIEW mode
     */
    it('Given VIEW mode When header renders Then delete button visible', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('recipe-detail-delete-button')).toBeOnTheScreen();
    });

    /**
     * Test 6: Back button functions in EDIT mode
     */
    it('Given EDIT mode When back button pressed Then onBack callback fires', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="edit"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(screen.getByTestId('recipe-detail-back-button'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 7: Back button functions in CREATE mode
     */
    it('Given CREATE mode When back button pressed Then onBack callback fires', () => {
      const mockOnBack = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="create"
          onBack={mockOnBack}
        />
      );

      fireEvent.press(screen.getByTestId('recipe-detail-back-button'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // 3. Business Rules Tests
  // ============================================================================
  describe('3. Business Rules Tests', () => {
    /**
     * Test 8: EDIT mode shows the delete button
     * BUSINESS RULE: Users can delete it while editing
     */
    it('Given EDIT mode When header renders Then delete button visible', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="edit"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByTestId('recipe-detail-delete-button')).toBeOnTheScreen();
    });

    /**
     * Test 9: CREATE mode hides the delete button
     * BUSINESS RULE: Cannot delete recipe that doesn't exist yet
     */
    it('Given CREATE mode When header renders Then delete button NOT rendered', () => {
      const mockOnBack = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="create"
          onBack={mockOnBack}
        />
      );

      expect(screen.queryByTestId('recipe-detail-delete-button')).not.toBeOnTheScreen();
    });

    /**
     * Test 10: Undefined onDelete handled gracefully
     * BUSINESS RULE: Component should not crash if onDelete not provided
     */
    it('Given undefined onDelete When header renders Then no error thrown', () => {
      const mockOnBack = jest.fn();

      expect(() => {
        renderWithTheme(
          <RecipeDetailHeader
            mode="create"
            onBack={mockOnBack}
            onDelete={undefined}
          />
        );
      }).not.toThrow();
    });

    /**
     * Test 11: Custom testID supported
     * BUSINESS RULE: Component should support custom test IDs for flexibility
     */
    it('Given custom testID When header renders Then uses custom testID prefix', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
          testID="custom-header"
        />
      );

      expect(screen.getByTestId('custom-header-back-button')).toBeOnTheScreen();
      expect(screen.getByTestId('custom-header-delete-button')).toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 4. Accessibility Tests
  // ============================================================================
  describe('4. Accessibility Tests', () => {
    /**
     * Test 12: Back button accessibility *: Screen reader users can understand button purpose
     */
    it('Given VIEW mode When screen reader active Then back button has accessible label', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      const backButton = screen.getByTestId('recipe-detail-back-button');
      expect(backButton.props.accessibilityLabel).toBe('Go back to recipe list');
      expect(backButton.props.accessibilityRole).toBe('button');
    });

    /**
     * Test 13: Delete button accessibility     * : Screen reader users can understand button purpose
     */
    it('Given VIEW mode When screen reader active Then delete button has accessible label', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="view"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTestId('recipe-detail-delete-button');
      expect(deleteButton.props.accessibilityLabel).toBe('Delete recipe');
      expect(deleteButton.props.accessibilityRole).toBe('button');
    });

    /**
     * Test 14: Back button accessibility in EDIT mode
     * ACCESSIBILITY: Accessibility consistent across modes
     */
    it('Given EDIT mode When screen reader active Then back button has accessible label', () => {
      const mockOnBack = jest.fn();
      const mockOnDelete = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="edit"
          onBack={mockOnBack}
          onDelete={mockOnDelete}
        />
      );

      const backButton = screen.getByTestId('recipe-detail-back-button');
      expect(backButton.props.accessibilityLabel).toBe('Go back to recipe list');
    });

    /**
     * Test 15: Back button accessibility in CREATE mode
     * ACCESSIBILITY: Accessibility consistent across modes
     */
    it('Given CREATE mode When screen reader active Then back button has accessible label', () => {
      const mockOnBack = jest.fn();

      renderWithTheme(
        <RecipeDetailHeader
          mode="create"
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId('recipe-detail-back-button');
      expect(backButton.props.accessibilityLabel).toBe('Go back to recipe list');
    });
  });
});
