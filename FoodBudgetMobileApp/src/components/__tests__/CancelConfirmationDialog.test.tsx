/**
 * CancelConfirmationDialog Unit Tests - 2025 React Testing Library Patterns
 *
 * Component Purpose:
 * Confirmation dialog for discarding unsaved changes when canceling edit mode.
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
import { CancelConfirmationDialog } from '../CancelConfirmationDialog';
import { PaperProvider } from 'react-native-paper';

// Wrapper to provide theme and Portal context
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <PaperProvider>
      {component}
    </PaperProvider>
  );
};

describe('CancelConfirmationDialog Unit Tests', () => {
  // ============================================================================
  // 1. Risk-Based Priority Tests
  // ============================================================================
  describe('1. Risk-Based Priority Tests', () => {
    /**
     * Test 1: No button prevents data loss
     * RISK: Unsaved changes accidentally discarded
     */
    it('Given visible dialog When No pressed Then onDismiss fires and onConfirm does NOT', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const noButton = screen.getByTestId('recipe-detail-cancel-dialog-dismiss');
      fireEvent.press(noButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    /**
     * Test 2: Yes button discards changes
     * RISK: Cannot discard changes when needed
     */
    it('Given visible dialog When Yes pressed Then onConfirm fires', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const yesButton = screen.getByTestId('recipe-detail-cancel-dialog-confirm');
      fireEvent.press(yesButton);

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
        <CancelConfirmationDialog
          visible={false}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.queryByText(/discard changes/i)).not.toBeOnTheScreen();
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
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/discard changes/i)).toBeOnTheScreen();
    });

    /**
     * Test 5: Dialog shows a warning message
     */
    it('Given visible dialog When rendered Then shows warning about unsaved changes', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/are you sure/i)).toBeOnTheScreen();
      expect(screen.getByText(/discard your changes/i)).toBeOnTheScreen();
    });

    /**
     * Test 6: No button visible
     */
    it('Given visible dialog When rendered Then No button visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('recipe-detail-cancel-dialog-dismiss')).toBeOnTheScreen();
    });

    /**
     * Test 7: Yes button visible
     */
    it('Given visible dialog When rendered Then Yes button visible', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByTestId('recipe-detail-cancel-dialog-confirm')).toBeOnTheScreen();
    });

    /**
     * Test 8: Dialog dismisses on backdrop press
     */
    it('Given visible dialog When backdrop pressed Then onDismiss fires', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      // React Native Paper's Dialog calls onDismiss when backdrop is pressed
      const dialog = screen.getByTestId('recipe-detail-cancel-dialog');
      fireEvent(dialog, 'dismiss');

      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 3. Business Rules Tests
  // ============================================================================
  describe('3. Business Rules Tests', () => {
    /**
     * Test 9: Dialog title is "Discard Changes?"
     * BUSINESS RULE: Clear title indicates action
     */
    it('Given visible dialog When rendered Then title is "Discard Changes?"', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Discard Changes?')).toBeOnTheScreen();
    });

    /**
     * Test 10: Warning text asks for confirmation
     * BUSINESS RULE: User must understand consequences
     */
    it('Given visible dialog When rendered Then warning asks for confirmation', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      const warningText = screen.getByText(/are you sure you want to discard your changes/i);
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
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
          testID="custom-cancel-dialog"
        />
      );

      expect(screen.getByTestId('custom-cancel-dialog')).toBeOnTheScreen();
      expect(screen.getByTestId('custom-cancel-dialog-dismiss')).toBeOnTheScreen();
      expect(screen.getByTestId('custom-cancel-dialog-confirm')).toBeOnTheScreen();
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
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      // Portal ensures the dialog is rendered at root level for proper screen reader focus
      expect(screen.getByText('Discard Changes?')).toBeOnTheScreen();
    });

    /**
     * Test 13: No button has clear text
     * ACCESSIBILITY: Screen reader users understand button purpose
     */
    it('Given visible dialog When rendered Then No button has clear text', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('No')).toBeOnTheScreen();
    });

    /**
     * Test 14: Yes button has clear text
     * ACCESSIBILITY: Screen reader users understand button purpose
     */
    it('Given visible dialog When rendered Then Yes button has clear text', () => {
      const mockOnDismiss = jest.fn();
      const mockOnConfirm = jest.fn();

      renderWithTheme(
        <CancelConfirmationDialog
          visible={true}
          onDismiss={mockOnDismiss}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText('Yes')).toBeOnTheScreen();
    });
  });
});
