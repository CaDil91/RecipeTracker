/**
 * Web-specific MSAL authentication hook
 *
 * This hook wraps @azure/msal-react for browser-based authentication.
 * It provides a simplified, application-specific interface for authentication.
 *
 * IMPORTANT: Only import this hook on web platforms.
 * Use the platform abstraction in useAuth() instead.
 */

import { useMsal } from '@azure/msal-react';
import { AccountInfo } from '@azure/msal-browser';
import { loginRequest } from '../lib/auth/msalConfig.web';
import { UseAuthResult, AuthUser } from '../lib/auth/authTypes';

/**
 * Maps MSAL AccountInfo to our AuthUser type
 */
const mapAccountToAuthUser = (account: AccountInfo): AuthUser => ({
  id: account.localAccountId,
  email: account.username,
  name: account.name,
  username: account.username,
});

/**
 * Web authentication hook using MSAL React
 *
 * @returns Authentication state and methods
 */
export const useMsalWeb = (): UseAuthResult => {
  const { instance, accounts, inProgress } = useMsal();

  /**
   * Sign in using Microsoft Entra External ID
   * Redirects user to Entra sign-in page
   */
  const signIn = async (): Promise<void> => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Sign in error:', error);
      // Don't re-throw - let the app continue gracefully
      // User can retry sign-in
    }
  };

  /**
   * Sign out and clear authentication state
   * Redirects user to Entra to clear the session, then back to app
   */
  const signOut = async (): Promise<void> => {
    try {
      if (accounts.length === 0) return;

      await instance.logoutRedirect({
        account: accounts[0],
        postLogoutRedirectUri: window.location.origin + '/RecipeTracker/',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Get access token for API calls
   * Automatically refreshes the token if expired
   *
   * @returns Access token or null if not authenticated
   */
  const getAccessToken = async (): Promise<string | null> => {
    // No accounts - user not authenticated
    if (accounts.length === 0) {
      return null;
    }

    try {
      // Attempt silent token acquisition (uses cached/refreshed token)
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0], // Use first account (business rule)
      });
      return response.accessToken;
    } catch (error) {
      // Silent acquisition failed - trigger interactive redirect
      // This happens when refresh token expires or user interaction required
      await instance.acquireTokenRedirect(loginRequest);
      return null; // Token will be available after redirect completes
    }
  };

  return {
    isAuthenticated: accounts.length > 0,
    user: accounts[0] ? mapAccountToAuthUser(accounts[0]) : null,
    inProgress, // Add interaction status to prevent race conditions with token acquisition
    signIn,
    signOut,
    getAccessToken,
  };
};