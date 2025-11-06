import { renderHook } from '@testing-library/react-native';
import { useAuth } from '../useAuth';

/**
 * Unit tests for the useAuth platform abstraction hook
 *
 * Tests that useAuth correctly delegate to platform-specific authentication.
 * Uses a solitary testing approach with mocked authentication hooks.
 *
 * Risk-Based Priority: MEDIUM
 * - Simple delegation logic
 * - Critical entry point for all authentication
 * - Ensures consistent auth interface across app
 *
 * NOTE (Sprint 5 Phase 1): Currently only tests a web platform.
 * Platform detection and mobile tests will be added in Phase 2.
 */

// Mock useMsalWeb to avoid MSAL initialization
jest.mock('../useMsal.web', () => ({
  useMsalWeb: jest.fn(() => ({
    isAuthenticated: true,
    user: {
      id: 'test-user-123',
      email: 'web@example.com',
      name: 'Web User',
      username: 'web@example.com',
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn(),
  })),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * HAPPY PATH TESTS
   * Test the primary use case that delivers business value
   */
  describe('Happy Path - Web Platform', () => {
    /**
     * Test: A Web platform returns useMsalWeb
     * Given: Platform.OS is 'web'
     * When: useAuth is called
     * Then: Returns useMsalWeb result with all auth methods
     */
    it('given Platform.OS is web, when useAuth called, then returns useMsalWeb result', () => {
      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        id: 'test-user-123',
        email: 'web@example.com',
        name: 'Web User',
        username: 'web@example.com',
      });
      expect(result.current.signIn).toBeDefined();
      expect(result.current.signOut).toBeDefined();
      expect(result.current.getAccessToken).toBeDefined();
    });

    /**
     * Test: A Web platform uses MSAL React
     * Given: Platform.OS is 'web'
     * When: useAuth is called
     * Then: Returns result from useMsalWeb (not mobile auth)
     */
    it('given web platform, when useAuth called, then uses MSAL React', () => {
      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      // Verify its web auth by checking the mocked user data
      expect(result.current.user).toEqual({
        id: 'test-user-123',
        email: 'web@example.com',
        name: 'Web User',
        username: 'web@example.com',
      });
    });
  });

  /**
   * MOBILE PLATFORM TESTS
   * TODO (Sprint 5 Phase 2): Add platform detection tests
   * - Test Platform.OS detection logic
   * - Verify iOS platform routes to useMsalNative (or throws error)
   * - Verify Android platform routes to useMsalNative (or throws error)
   * - Ensure platform separation prevents wrong auth library usage
   * - Test error messages guide developers to Phase 2 implementation
   */
  describe.skip('Mobile Platforms (Sprint 5 Phase 2)', () => {
    it.todo('given Platform.OS is ios, when useAuth called, then routes to mobile auth');
    it.todo('given Platform.OS is android, when useAuth called, then routes to mobile auth');
    it.todo('given non-web platform, when useAuth called, then enforces platform separation');
  });
});