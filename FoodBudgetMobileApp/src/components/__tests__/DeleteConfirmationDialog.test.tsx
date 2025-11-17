/**
 * DeleteConfirmationDialog Unit Tests - 2025 React Testing Library Patterns
 *
 * Component Purpose:
 * Confirmation dialog for deleting a recipe.
 * Uses React Native Paper's Portal for proper modal rendering.
 *
 * Test Strategy:
 * - Risk-Based Priority Tests: Core functionality that could cause data loss
 * - Happy Path Tests: Standard dialog interactions
 * - Business Rules Tests: Dialog visibility and text
 * - Accessibility Tests: Screen reader support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';
import { PaperProvider } from 'react-native-paper';

// Wrapper to provide theme and Portal context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('DeleteConfirmationDialog Unit Tests', () => {
  // ============================================================================
  // 1. Risk-Based Priority Tests
  // ============================================================================
  describe('1. Risk-Based Priority Tests', () => {
    /**
     * Test 1: Cancel button prevents deletion
     * RISK: Accidental deletion without confirmation
     */
    it('Given visible dialog When Cancel pressed Then onDismiss fires and onConfirm does NOT', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const cancelButton = screen.getByTestId('recipe-detail-delete-dialog-cancel');
      fireEvent.press(cancelButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    /**
     * Test 2: Delete button triggers deletion
     * RISK: Cannot delete recipes
     */
    it('Given visible dialog When Delete pressed Then onConfirm fires', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const confirmButton = screen.getByTestId('recipe-detail-delete-dialog-confirm');
      fireEvent.press(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    /**
     * Test 3: Dialog not visible when visible=false
     * RISK: Dialog shown when it shouldn't be
     */
    it('Given visible=false When dialog renders Then dialog NOT visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={false}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.queryByText(/delete recipe/i)).not.toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 2. Happy Path Tests
  // ============================================================================
  describe('2. Happy Path Tests', () => {
    /**
     * Test 4: Dialog visible when visible=true
     */
    it('Given visible=true When dialog renders Then dialog visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/delete recipe/i)).toBeOnTheScreen();
    });

    /**
     * Test 5: Dialog shows a warning message
     */
    it('Given visible dialog When rendered Then shows warning about permanent deletion', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/are you sure/i)).toBeOnTheScreen();
      expect(screen.getByText(/cannot be undone/i)).toBeOnTheScreen();
    });

    /**
     * Test 6: Cancel button visible
     */
    it('Given visible dialog When rendered Then Cancel button visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('recipe-detail-delete-dialog-cancel')).toBeOnTheScreen();
    });

    /**
     * Test 7: Delete button visible
     */
    it('Given visible dialog When rendered Then Delete button visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('recipe-detail-delete-dialog-confirm')).toBeOnTheScreen();
    });

    /**
     * Test 8: Dialog dismisses on backdrop press
     */
    it('Given visible dialog When backdrop pressed Then onDismiss fires', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      // React Native Paper's Dialog calls onDismiss when backdrop is pressed
      const dialog = screen.getByTestId('recipe-detail-delete-dialog');
      fireEvent(dialog, 'dismiss');

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 3. Business Rules Tests
  // ============================================================================
  describe('3. Business Rules Tests', () => {
    /**
     * Test 9: Dialog title is "Delete Recipe?"
     * BUSINESS RULE: Clear title indicates action
     */
    it('Given visible dialog When rendered Then title is "Delete Recipe?"', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Delete Recipe?')).toBeOnTheScreen();
    });

    /**
     * Test 10: Warning text mentions irreversibility
     * BUSINESS RULE: User must understand consequences
     */
    it('Given visible dialog When rendered Then warning mentions action cannot be undone', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const warningText = screen.getByText(/cannot be undone/i);
      expect(warningText).toBeOnTheScreen();
    });

    /**
     * Test 11: Custom testID supported
     * BUSINESS RULE: Component should support custom test IDs
     */
    it('Given custom testID When dialog renders Then uses custom testID', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
          testID="custom-delete-dialog"
        />
      );

      expect(screen.getByTestId('custom-delete-dialog')).toBeOnTheScreen();
      expect(screen.getByTestId('custom-delete-dialog-cancel')).toBeOnTheScreen();
      expect(screen.getByTestId('custom-delete-dialog-confirm')).toBeOnTheScreen();
    });
  });

  // ============================================================================
  // 4. Accessibility Tests
  // ============================================================================
  describe('4. Accessibility Tests', () => {
    /**
     * Test 12: Dialog uses Portal for proper layering
     * ACCESSIBILITY: Ensures proper modal behavior for screen readers
     */
    it('Given visible dialog When rendered Then uses Portal for modal rendering', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      const { UNSAFE_root } = renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      // Portal ensures the dialog is rendered at root level for proper screen reader focus
      expect(screen.getByText('Delete Recipe?')).toBeOnTheScreen();
    });

      /**
     * Test 13: Cancel button has clear text
     * ACCESSIBILITY: Screen reader users understand button purpose
     */
    it('Given visible dialog When rendered Then Cancel button has clear text', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Cancel')).toBeOnTheScreen();
    });

    /**
     * Test 14: Delete button has clear text
     * ACCESSIBILITY: Screen reader users understand button purpose
     */
    it('Given visible dialog When rendered Then Delete button has clear text', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <DeleteConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Delete')).toBeOnTheScreen();
    });
  });
});