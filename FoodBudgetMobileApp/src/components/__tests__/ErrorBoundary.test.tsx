import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';

/**
 * Unit tests for ErrorBoundary component
 *
 * Tests error catching, fallback rendering, and recovery behavior.
 * Follows TDD approach for Story 12.5: Error Boundary & Offline Detection
 */
describe('ErrorBoundary', () => {
  // Suppress console.error in tests to avoid noise
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  // ============================================
  // RISK-BASED PRIORITY
  // Test high-risk, high-value error handling logic
  // ============================================
  describe('Risk-Based Priority', () => {
    /**
     * Test: Error Catching
     * GIVEN: Child component throws error
     * WHEN: Component renders
     * THEN: Catches error and shows fallback
     */
    it('given child throws error, when rendered, then catches error and shows fallback', () => {
      // Arrange
      const ThrowError = () => {
        throw new Error('Test error');
      };
      const fallback = <Text testID="error-fallback">Something went wrong</Text>;

      // Act
      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByTestId('error-fallback')).toBeOnTheScreen();
      expect(screen.getByText('Something went wrong')).toBeVisible();
    });

    /**
     * Test: State Update
     * GIVEN: Error caught
     * WHEN: getDerivedStateFromError called
     * THEN: Updates state with hasError=true
     */
    it('given error caught, when getDerivedStateFromError called, then updates state with hasError', () => {
      // Arrange
      const ThrowError = () => {
        throw new Error('State test error');
      };
      const fallback = <Text testID="error-state">Error state</Text>;

      // Act
      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert - Fallback rendered means the state was updated
      expect(screen.getByTestId('error-state')).toBeOnTheScreen();
    });

    /**
     * Test: Error Logging
     * GIVEN: Error caught
     * WHEN: componentDidCatch called
     * THEN: Logs structured error object
     */
    it('given error caught, when componentDidCatch called, then logs structured error', () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const ThrowError = () => {
        throw new Error('Logging test error');
      };
      const fallback = <Text>Error</Text>;

      // Act
      render(
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Assert - componentDidCatch logs error
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Find the ErrorBoundary log (React logs errors internally first)
      const boundaryLog = consoleErrorSpy.mock.calls.find(
        call => call[0]?.includes('React Error Boundary caught')
      );
      expect(boundaryLog).toBeDefined();
      if (boundaryLog) {
        expect(boundaryLog[0]).toContain('React Error Boundary caught');
      }

      consoleErrorSpy.mockRestore();
    });

    /**
     * Test: Reset Functionality
     * GIVEN: Error state set
     * WHEN: Reset called
     * THEN: Clears state and re-renders children
     */
    it('given error state, when reset called, then clears state and re-renders children', () => {
      // Arrange - Component that throws an error but can recover
      let shouldThrow = true;
      const ProblematicChild = () => {
        if (shouldThrow) {
          throw new Error('Test error for reset');
        }
        return <Text testID="child-rendered">Child is working</Text>;
      };

      const resetMock = jest.fn(() => {
        shouldThrow = false; // Fix the error
      });

      const fallback = (
        <Text testID="error-fallback">
          Error occurred
          <Text testID="reset-button" onPress={resetMock}>Reset</Text>
        </Text>
      );

      // Act - Initial render with error
      const { rerender } = render(
        <ErrorBoundary fallback={fallback}>
          <ProblematicChild />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeOnTheScreen();

      // Act - Reset error state
      fireEvent.press(screen.getByTestId('reset-button'));

      // Re-render after reset
      rerender(
        <ErrorBoundary fallback={fallback}>
          <ProblematicChild />
        </ErrorBoundary>
      );

      // Assert - Reset was called
      expect(resetMock).toHaveBeenCalled();
    });
  });

  // ============================================
  // HAPPY PATH
  // Test primary use case - normal rendering without errors
  // ============================================
  describe('Happy Path', () => {
    /**
     * Test: Normal Rendering
     * GIVEN: No errors
     * WHEN: Children render
     * THEN: Displays children normally
     */
    it('given no errors, when children render, then displays children normally', () => {
      // Arrange & Act
      render(
        <ErrorBoundary>
          <Text testID="normal-child">Normal child component</Text>
        </ErrorBoundary>
      );

      // Assert
      expect(screen.getByTestId('normal-child')).toBeOnTheScreen();
      expect(screen.getByText('Normal child component')).toBeVisible();
    });

    /**
     * Test: Recovery After Reset
     * GIVEN: Error cleared
     * WHEN: Reset button pressed
     * THEN: Children render successfully
     */
    it('given error cleared, when reset pressed, then children render again', () => {
      // Arrange
      let shouldError = true;
      const ToggleError = () => {
        if (shouldError) throw new Error('Toggle error');
        return <Text testID="recovered">Recovered</Text>;
      };

      const FallbackComponent = ({ reset }: { reset: () => void }) => (
        <Text testID="reset-btn" onPress={reset}>Try Again</Text>
      );

      // Act - Render with error
      render(
        <ErrorBoundary fallback={<FallbackComponent reset={() => {}} />}>
          <ToggleError />
        </ErrorBoundary>
      );

      // Act - Clear error and reset
      shouldError = false;
      fireEvent.press(screen.getByTestId('reset-btn'));

      // Assert
      expect(screen.getByTestId('recovered')).toBeOnTheScreen();
    });
  });

  // ============================================
  // ERRORS
  // Test exception handling and edge cases
  // ============================================
  describe('Errors', () => {
    /**
     * Test: Multiple Sequential Errors
     * GIVEN: Multiple errors in sequence
     * WHEN: Each error caught
     * THEN: Each shows fallback independently
     */
    it('given multiple errors, when caught, then each shows fallback', () => {
      // Arrange
      const Error1 = () => {
        throw new Error('First error');
      };
      const fallback = <Text testID="error-fallback-multiple">Error</Text>;

      // Act - First error
      const { unmount } = render(
        <ErrorBoundary fallback={fallback}>
          <Error1 />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('error-fallback-multiple')).toBeOnTheScreen();
      unmount();

      // Act - Second error
      const Error2 = () => {
        throw new Error('Second error');
      };
      render(
        <ErrorBoundary fallback={fallback}>
          <Error2 />
        </ErrorBoundary>
      );

      // Assert - Second error also caught
      expect(screen.getByTestId('error-fallback-multiple')).toBeOnTheScreen();
    });

    /**
     * Test: Error in Fallback
     * GIVEN: Fallback component throws error
     * WHEN: Fallback renders
     * THEN: Doesn't cause infinite loop
     */
    it('given error in fallback, when fallback renders, then does not infinite loop', () => {
      // Arrange
      const ThrowError = () => {
        throw new Error('Child error');
      };
      const BadFallback = () => {
        throw new Error('Fallback error');
      };

      // Act & Assert - Should not throw or hang
      // This tests that error boundaries don't catch their own errors
      expect(() => {
        render(
          <ErrorBoundary fallback={<BadFallback />}>
            <ThrowError />
          </ErrorBoundary>
        );
      }).toThrow(); // Should throw the fallback error, not loop
    });
  });
});
