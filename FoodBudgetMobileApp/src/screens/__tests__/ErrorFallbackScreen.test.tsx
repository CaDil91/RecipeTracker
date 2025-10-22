import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorFallbackScreen } from '../ErrorFallbackScreen';

/**
 * Unit tests for ErrorFallbackScreen component
 *
 * Tests user-friendly error display and recovery actions.
 * Follows TDD approach for Story 12.5: Error Boundary & Offline Detection
 */
describe('ErrorFallbackScreen', () => {
  const mockError = new Error('Test error message');
  const mockErrorInfo = { componentStack: 'at Component\n  at App' };
  const mockOnReset = jest.fn();

  beforeEach(() => {
    mockOnReset.mockClear();
  });

  // ============================================
  // RISK-BASED PRIORITY
  // Test critical error display and recovery functionality
  // ============================================
  describe('Risk-Based Priority', () => {
    /**
     * Test: User-Friendly Message Display
     * GIVEN: Error object with message
     * WHEN: Screen renders
     * THEN: Displays user-friendly error message
     */
    it('given error object, when screen renders, then displays user-friendly message', () => {
      // Arrange & Act
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      expect(screen.getByText(/something went wrong/i)).toBeVisible();
      expect(screen.getByTestId('error-fallback-screen')).toBeOnTheScreen();
    });

    /**
     * Test: Reset Button Functionality
     * GIVEN: Reset function provided
     * WHEN: "Try Again" button pressed
     * THEN: Calls onReset callback
     */
    it('given reset function, when try again pressed, then calls onReset', () => {
      // Arrange
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Act
      const resetButton = screen.getByTestId('error-fallback-reset-button');
      fireEvent.press(resetButton);

      // Assert
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // HAPPY PATH
  // Test normal error display workflow
  // ============================================
  describe('Happy Path', () => {
    /**
     * Test: Clear Error Message Display
     * GIVEN: Error with message
     * WHEN: Screen renders
     * THEN: Shows message clearly and prominently
     */
    it('given error message, when screen renders, then shows message clearly', () => {
      // Arrange & Act
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      const message = screen.getByText(/something went wrong/i);
      expect(message).toBeVisible();
      expect(screen.getByText(/please try again/i)).toBeVisible();
    });

    /**
     * Test: Reset Button Accessibility
     * GIVEN: "Try Again" button
     * WHEN: Screen renders
     * THEN: Button is visible and has an accessibility label
     */
    it('given try again button, when rendered, then is accessible', () => {
      // Arrange & Act
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      const button = screen.getByTestId('error-fallback-reset-button');
      expect(button).toBeVisible();
      expect(button.props.accessibilityLabel).toBeTruthy();
      expect(button.props.accessibilityLabel).toContain('Try again');
    });
  });

  // ============================================
  // NULL/EMPTY/INVALID
  // Test graceful handling of edge cases
  // ============================================
  describe('Null/Empty/Invalid', () => {
    /**
     * Test: Null Error Handling
     * GIVEN: Null error
     * WHEN: Screen renders
     * THEN: Shows generic error message
     */
    it('given null error, when screen renders, then shows generic message', () => {
      // Arrange & Act
      render(
        <ErrorFallbackScreen
          error={null as any}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      expect(screen.getByText(/something went wrong/i)).toBeVisible();
      expect(screen.getByText(/unexpected error/i)).toBeVisible();
    });

    /**
     * Test: Error Without Message
     * GIVEN: Error without message property
     * WHEN: Screen renders
     * THEN: Shows fallback text
     */
    it('given error without message, when screen renders, then shows fallback text', () => {
      // Arrange
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';

      // Act
      render(
        <ErrorFallbackScreen
          error={errorWithoutMessage}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      expect(screen.getByText(/something went wrong/i)).toBeVisible();
    });
  });

  // ============================================
  // BUSINESS RULES
  // Test environment-specific behavior
  // ============================================
  describe('Business Rules', () => {
    /**
     * Test: Development Mode Error Details
     * GIVEN: Development mode (__DEV__ = true)
     * WHEN: Screen renders
     * THEN: Shows technical error details (collapsed)
     */
    it('given development mode, when screen renders, then shows error details collapsed', () => {
      // Arrange
      const originalDev = __DEV__;
      (global as any).__DEV__ = true;

      // Act
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      expect(screen.getByTestId('error-fallback-details')).toBeOnTheScreen();
      expect(screen.getByText(/error details/i)).toBeVisible();

      // Cleanup
      (global as any).__DEV__ = originalDev;
    });

    /**
     * Test: Production Mode Hides Details
     * GIVEN: Production mode (__DEV__ = false)
     * WHEN: Screen renders
     * THEN: Hides technical error details
     */
    it('given production mode, when screen renders, then hides technical details', () => {
      // Arrange
      const originalDev = __DEV__;
      (global as any).__DEV__ = false;

      // Act
      render(
        <ErrorFallbackScreen
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Assert
      expect(screen.queryByTestId('error-fallback-details')).not.toBeOnTheScreen();

      // Cleanup
      (global as any).__DEV__ = originalDev;
    });
  });
});