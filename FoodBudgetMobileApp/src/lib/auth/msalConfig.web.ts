/**
 * MSAL Configuration for Web Platform (React Native Web)
 *
 * This file configures Microsoft Authentication Library (MSAL) for browser-based authentication
 * using Microsoft Entra External ID. It is ONLY imported on web platforms.
 *
 * IMPORTANT: Do NOT import this file on mobile platforms - it will fail.
 * Use the platform abstraction in useAuth() instead.
 */

import { Configuration } from '@azure/msal-browser';
import { Platform } from 'react-native';

/**
 * MSAL Browser Configuration
 *
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/msal-client-application-configuration
 */
export const msalConfig: Configuration = {
  auth: {
    // Client ID from Sprint 4.2 web app registration
    clientId: process.env.EXPO_PUBLIC_MSAL_CLIENT_ID!,

    // Authority URL for Entra External ID tenant
    // Format: https://{tenant-name}.ciamlogin.com/{tenant-id}
    authority: `https://foodbudget.ciamlogin.com/${process.env.EXPO_PUBLIC_MSAL_TENANT_ID}`,

    // Redirect URI - dynamically determined based on environment
    // Localhost: http://localhost:8081/RecipeTracker/
    // GitHub Pages: https://cadil91.github.io/RecipeTracker/
    redirectUri: Platform.OS === 'web'
      ? `${window.location.origin}/RecipeTracker/`
      : undefined,

    // Post-logout redirect URI (return to home after sign-out)
    postLogoutRedirectUri: Platform.OS === 'web'
      ? `${window.location.origin}/RecipeTracker/`
      : undefined,
  },
  cache: {
    // Use sessionStorage (NOT localStorage) for better security
    // Tokens cleared when the browser tab closes
    cacheLocation: 'sessionStorage',
  },
};

/**
 * Login request configuration
 *
 * Scopes define what resources the access token can access.
 * - openid: Required for ID token with login_hint claim (enables promptless logout)
 * - profile: Required for login_hint claim in ID token
 * - API scope: Backend API access
 */
export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    process.env.EXPO_PUBLIC_MSAL_API_SCOPE!,
  ],
};