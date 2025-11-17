import { renderHook } from '@testing-library/react-native';
import { useMsalWeb } from '../useMsal.web';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../lib/auth/msalConfig.web';

/**
 * Unit tests for the useMsalWeb hook
 *
 * Tests web-specific MSAL authentication integration. Uses solitary testing approach
 * with mocked MSAL React library (external dependency).
 *
 * Risk-Based Priority: HIGH
 * - Critical authentication workflow
 * - External library integration (@azure/msal-react)
 * - Complex error handling
 * - Previously untested code
 */

// Mock @azure/msal-react
jest.mock('@azure/msal-react');
const mockUseMsal = useMsal as jest.MockedFunction<typeof useMsal>;

// Mock MSAL config
jest.mock('../../lib/auth/msalConfig.web', () => ({
  loginRequest: {
    scopes: ['api://test-api/access_as_user'],
  },
}));

describe('useMsalWeb', () => {
  // Test doubles
  let mockInstance: {
    loginRedirect: jest.Mock;
    logoutRedirect: jest.Mock;
    acquireTokenSilent: jest.Mock;
    acquireTokenRedirect: jest.Mock;
  };
  let mockAccounts: any[];

  beforeEach(() => {
    // Arrange: Create fresh mocks for each test
    mockInstance = {
      loginRedirect: jest.fn(),
      logoutRedirect: jest.fn(),
      acquireTokenSilent: jest.fn(),
      acquireTokenRedirect: jest.fn(),
    };
    mockAccounts = [];

    // Default mock implementation
    mockUseMsal.mockReturnValue({
      instance: mockInstance as any,
      accounts: mockAccounts,
      inProgress: 'none' as any,
      logger: {} as any,
    });

    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * HAPPY PATH TESTS
   * Test the primary use cases that deliver business value
   */
  describe('Happy Path', () => {
    /**
     * Test: Authenticated user state
     * Given: MSAL has an authenticated account
     * When: Hook initializes
     * Then: Returns authenticated state with user data
     */
    it('given authenticated account, when hook initializes, then returns authenticated state', () => {
      // Arrange
      const mockAccount = {
        homeAccountId: 'test-user-123',
        localAccountId: 'test-user-123',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'test@example.com',
        name: 'Test User',
      };
      mockAccounts.push(mockAccount);
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });

      // Act
      const { result } = renderHook(() => useMsalWeb());

      // Assert
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        username: 'test@example.com',
      });
    });

    /**
     * Test: Sign-in flow
     * Given: User initiates sign-in
     * When: signIn() is called
     * Then: Calls loginRedirect with correct scopes
     */
    it('given user initiates sign-in, when signIn called, then calls loginRedirect with correct scopes', async () => {
      // Arrange
      mockInstance.loginRedirect.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signIn();

      // Assert
      expect(mockInstance.loginRedirect).toHaveBeenCalledTimes(1);
      expect(mockInstance.loginRedirect).toHaveBeenCalledWith(loginRequest);
    });

    /**
     * Test: Sign-out flow
     * Given: Authenticated user
     * When: signOut() is called
     * Then: Calls logoutRedirect with an account
     */
    it('given authenticated user, when signOut called, then calls logoutRedirect', async () => {
      // Arrange
      const mockAccount = {
        homeAccountId: 'test-user-123',
        localAccountId: 'test-user-123',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'test@example.com',
        name: 'Test User',
      };
      mockAccounts.push(mockAccount);
      mockInstance.logoutRedirect.mockResolvedValue(undefined);
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signOut();

      // Assert
      expect(mockInstance.logoutRedirect).toHaveBeenCalledTimes(1);
      expect(mockInstance.logoutRedirect).toHaveBeenCalledWith({
        account: mockAccount,
        postLogoutRedirectUri: expect.stringContaining('/RecipeTracker/'),
      });
    });

    /**
     * Test: Silent token acquisition
     * Given: Authenticated user
     * When: getAccessToken() is called
     * Then: Returns access token from silent acquisition
     */
    it('given authenticated user, when getAccessToken called, then returns token from silent acquisition', async () => {
      // Arrange
      const mockAccount = {
        homeAccountId: 'test-user-123',
        localAccountId: 'test-user-123',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'test@example.com',
      };
      mockAccounts.push(mockAccount);
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      mockInstance.acquireTokenSilent.mockResolvedValue({
        accessToken: mockToken,
        account: mockAccount,
      });
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });

      const { result } = renderHook(() => useMsalWeb());

      // Clear mock calls from useEffect (proactive token acquisition on mount)
      mockInstance.acquireTokenSilent.mockClear();

      // Act
      const token = await result.current.getAccessToken();

      // Assert
      expect(mockInstance.acquireTokenSilent).toHaveBeenCalledTimes(1);
      expect(mockInstance.acquireTokenSilent).toHaveBeenCalledWith({
        ...loginRequest,
        account: mockAccount,
      });
      expect(token).toBe(mockToken);
    });
  });

  /**
   * NULL/EMPTY/INVALID TESTS
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    /**
     * Test: No authenticated accounts
     * Given: MSAL has no accounts
     * When: Hook initializes
     * Then: Returns unauthenticated state
     */
    it('given no accounts, when hook initializes, then returns unauthenticated state', () => {
      // Arrange
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: [],
        inProgress: 'none' as any,
        logger: {} as any,
      });

      // Act
      const { result } = renderHook(() => useMsalWeb());

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    /**
     * Test: Token acquisition with no accounts
     * Given: No authenticated accounts
     * When: getAccessToken() is called
     * Then: Returns null without throwing
     */
    it('given no accounts, when getAccessToken called, then returns null', async () => {
      // Arrange
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: [],
        inProgress: 'none' as any,
        logger: {} as any,
      });

      const { result } = renderHook(() => useMsalWeb());

      // Act
      const token = await result.current.getAccessToken();

      // Assert
      expect(token).toBeNull();
      expect(mockInstance.acquireTokenSilent).not.toHaveBeenCalled();
    });
  });

  /**
   * BUSINESS RULES TESTS
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    /**
     * Test: API scope enforcement
     * Given: Sign-in initiated
     * When: loginRedirect is called
     * Then: Includes required API scope
     */
    it('given sign-in initiated, when loginRedirect called, then includes required API scope', async () => {
      // Arrange
      mockInstance.loginRedirect.mockResolvedValue(undefined);
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signIn();

      // Assert
      const callArgs = mockInstance.loginRedirect.mock.calls[0][0];
      expect(callArgs.scopes).toContain('api://test-api/access_as_user');
    });

    /**
     * Test: First account selection
     * Given: Multiple accounts exist
     * When: Token is requested
     * Then: Uses the first account (accounts[0])
     */
    it('given multiple accounts, when token requested, then uses first account', async () => {
      // Arrange
      const mockAccount1 = {
        homeAccountId: 'user-1',
        localAccountId: 'user-1',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'user1@example.com',
      };
      const mockAccount2 = {
        homeAccountId: 'user-2',
        localAccountId: 'user-2',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'user2@example.com',
      };
      mockAccounts.push(mockAccount1, mockAccount2);
      mockInstance.acquireTokenSilent.mockResolvedValue({
        accessToken: 'mock-token',
        account: mockAccount1,
      });
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });

      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.getAccessToken();

      // Assert
      const callArgs = mockInstance.acquireTokenSilent.mock.calls[0][0];
      expect(callArgs.account).toBe(mockAccount1);
    });

    /**
     * Test: User data from the first account 
     * Given: Multiple accounts exist
     * When: Hook initializes
     * Then: User populated with the first account
     */
    it('given multiple accounts, when hook initializes, then user is first account', () => {
      // Arrange
      const mockAccount1 = {
        homeAccountId: 'user-1',
        localAccountId: 'user-1',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'user1@example.com',
        name: 'User One',
      };
      const mockAccount2 = {
        homeAccountId: 'user-2',
        localAccountId: 'user-2',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'user2@example.com',
        name: 'User Two',
      };
      mockAccounts.push(mockAccount1, mockAccount2);
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });

      // Act
      const { result } = renderHook(() => useMsalWeb());

      // Assert
      expect(result.current.user).toEqual({
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        username: 'user1@example.com',
      });
      expect(result.current.user?.name).toBe('User One');
    });
  });

  /**
   * ERROR TESTS
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    /**
     * Test: User cancellation
     * Given: User cancels authentication
     * When: user_cancelled error thrown
     * Then: Error logged but not re-thrown
     */
    it('given user cancels authentication, when user_cancelled error thrown, then logs error without crashing', async () => {
      // Arrange
      const cancelError = { errorCode: 'user_cancelled', message: 'User cancelled' };
      mockInstance.loginRedirect.mockRejectedValue(cancelError);
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signIn();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Sign in error:', cancelError);
      // No exception thrown - test completes successfully
    });

    /**
     * Test: Network error during sign-in
     * Given: Network failure
     * When: network_error thrown
     * Then: Error logged gracefully
     */
    it('given network failure, when network_error thrown, then logs error gracefully', async () => {
      // Arrange
      const networkError = { errorCode: 'network_error', message: 'Network unavailable' };
      mockInstance.loginRedirect.mockRejectedValue(networkError);
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signIn();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Sign in error:', networkError);
    });

    /**
     * Test: Silent token acquisition failure triggers redirect
     * Given: Silent acquisition fails with interaction_required
     * When: getAccessToken() is called
     * Then: Triggers interactive redirect and returns null
     */
    it('given silent acquisition fails, when getAccessToken called, then triggers redirect and returns null', async () => {
      // Arrange
      const mockAccount = {
        homeAccountId: 'test-user-123',
        localAccountId: 'test-user-123',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'test@example.com',
      };
      mockAccounts.push(mockAccount);
      const interactionError = { errorCode: 'interaction_required', message: 'User interaction required' };
      mockInstance.acquireTokenSilent.mockRejectedValue(interactionError);
      mockInstance.acquireTokenRedirect.mockResolvedValue(undefined);
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any,
        logger: {} as any,
      });

      const { result } = renderHook(() => useMsalWeb());

      // Clear mock calls from useEffect (proactive token acquisition on mount)
      mockInstance.acquireTokenSilent.mockClear();

      // Act
      const token = await result.current.getAccessToken();

      // Assert
      expect(mockInstance.acquireTokenSilent).toHaveBeenCalledTimes(1);
      expect(mockInstance.acquireTokenRedirect).toHaveBeenCalledTimes(1);
      expect(mockInstance.acquireTokenRedirect).toHaveBeenCalledWith(loginRequest);
      expect(token).toBeNull(); // Returns null after triggering redirect
    });

    /**
     * Test: Generic error during sign-in
     * Given: Unexpected error
     * When: Error thrown during loginRedirect
     * Then: Error logged and handled gracefully
     */
    it('given unexpected error, when loginRedirect throws, then logs error and handles gracefully', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected MSAL error');
      mockInstance.loginRedirect.mockRejectedValue(unexpectedError);
      const { result } = renderHook(() => useMsalWeb());

      // Act
      await result.current.signIn();

      // Assert
      expect(console.error).toHaveBeenCalledWith('Sign in error:', unexpectedError);
    });

    /**
     * Test: Generic error during token acquisition
     * Given: Unexpected error during silent acquisition
     * When: acquireTokenSilent throws non-interaction error
     * Then: Triggers interactively redirect as fallback
     */
    it('given unexpected token error, when acquireTokenSilent throws, then triggers redirect', async () => {
      // Arrange
      const mockAccount = {
        homeAccountId: 'test-user-123',
        localAccountId: 'test-user-123',
        environment: 'foodbudget.ciamlogin.com',
        tenantId: 'test-tenant',
        username: 'test@example.com',
      };
      mockAccounts.push(mockAccount);
      const unknownError = new Error('Unknown token error');
      mockInstance.acquireTokenSilent.mockRejectedValue(unknownError);
      mockInstance.acquireTokenRedirect.mockResolvedValue(undefined);
      mockUseMsal.mockReturnValue({
        instance: mockInstance as any,
        accounts: mockAccounts,
        inProgress: 'none' as any, 
        logger: {} as any,
      });

      const { result } = renderHook(() => useMsalWeb());

      // Act
      const token = await result.current.getAccessToken();

      // Assert
      expect(mockInstance.acquireTokenRedirect).toHaveBeenCalledTimes(1);
      expect(token).toBeNull();
    });
  });
});