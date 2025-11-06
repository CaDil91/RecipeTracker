/**
 * Unit tests for the ProtectedRoute component
 *
 * Tests authentication-based conditional rendering logic.
 * Uses solitary testing approach with mocked useAuth hook.
 *
 * Risk-Based Priority: HIGH
 * - Critical security component
 * - Controls access to protected screens
 * - Enforces authentication requirement
 * - Previously untested code
 */

// Mock useAuth hook
jest.mock('../../hooks/useAuth');

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react-native';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';
import { Text } from 'react-native';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * HAPPY PATH TESTS
   * Test the primary use cases that deliver business value
   */
  describe('Happy Path', () => {
    /**
     * Test: Authenticated user sees protected content
     * Given: User is authenticated
     * When: ProtectedRoute renders with children
     * Then: Children are displayed
     */
    it('given authenticated user, when ProtectedRoute renders, then displays children', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          username: 'test@example.com',
        },
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeTruthy();
      expect(screen.getByText('Protected Content')).toBeTruthy();
    });

    /**
     * Test: Authentication persists across re-renders
     * Given: User is authenticated
     * When: Component re-renders
     * Then: Children remain visible
     */
    it('given authenticated user, when component re-renders, then children remain visible', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          username: 'test@example.com',
        },
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      const { rerender } = render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      rerender(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('protected-content')).toBeTruthy();
    });
  });

  /**
   * NULL/EMPTY/INVALID TESTS
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    /**
     * Test: Unauthenticated user blocked from content
     * Given: User is NOT authenticated
     * When: ProtectedRoute renders
     * Then: Children are NOT displayed
     */
    it('given unauthenticated user, when ProtectedRoute renders, then does not display children', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).toBeNull();
      expect(screen.queryByText('Protected Content')).toBeNull();
    });

    /**
     * Test: Null user handled gracefully
     * Given: User is null
     * When: ProtectedRoute renders
     * Then: Treated as unauthenticated
     */
    it('given null user, when ProtectedRoute renders, then treats as unauthenticated', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.queryByTestId('protected-content')).toBeNull();
      // Sign-in UI should be shown instead
      expect(screen.getByTestId('sign-in-prompt')).toBeTruthy();
    });
  });

  /**
   * BUSINESS RULES TESTS
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    /**
     * Test: Loading state shown during initialization
     * Given: Authentication is loading (isLoading=true)
     * When: ProtectedRoute renders
     * Then: Shows loading indicator (not children, not sign-in)
     */
    it('given authentication loading, when ProtectedRoute renders, then shows loading indicator', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('loading-indicator')).toBeTruthy();
      expect(screen.queryByTestId('protected-content')).toBeNull();
      expect(screen.queryByTestId('sign-in-prompt')).toBeNull();
    });

    /**
     * Test: Sign-in UI shown for unauthenticated users
     * Given: User is unauthenticated
     * When: ProtectedRoute renders
     * Then: Displays sign-in prompt with a button
     */
    it('given unauthenticated user, when ProtectedRoute renders, then shows sign-in prompt', () => {
      // Arrange
      const mockSignIn = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert
      expect(screen.getByTestId('sign-in-prompt')).toBeTruthy();
      expect(screen.getByTestId('sign-in-button')).toBeTruthy();
    });

    /**
     * Test: Sign-in button triggers authentication
     * Given: User clicks sign-in button
     * When: Button pressed
     * Then: Calls signIn() from useAuth
     */
    it('given sign-in button pressed, when user clicks, then triggers signIn', async () => {
      // Arrange
      const mockSignIn = jest.fn();
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        signIn: mockSignIn,
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      // Act
      render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      const signInButton = screen.getByTestId('sign-in-button');
      fireEvent.press(signInButton);

      // Assert
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });

    /**
     * Test: Only authenticated users see content
     * Given: Authentication state changes from false to true
     * When: User signs in
     * Then: Content becomes visible
     */
    it('given authentication state changes, when user signs in, then content becomes visible', () => {
      // Arrange - Start unauthenticated
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      const { rerender } = render(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert - Content not visible
      expect(screen.queryByTestId('protected-content')).toBeNull();

      // Act - User signs in
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          username: 'test@example.com',
        },
        signIn: jest.fn(),
        signOut: jest.fn(),
        getAccessToken: jest.fn(),
      });

      rerender(
        <ProtectedRoute>
          <Text testID="protected-content">Protected Content</Text>
        </ProtectedRoute>
      );

      // Assert - Content now visible
      expect(screen.getByTestId('protected-content')).toBeTruthy();
    });
  });
});