/**
 * Authentication type definitions shared across web and mobile platforms
 * Used by both MSAL React (web) and react-native-msal (mobile)
 */

/**
 * User account information from an authentication provider
 */
export interface AuthUser {
  id: string;                    // User ID (oid claim from Entra)
  email: string;                 // User email address
  name?: string;                 // Display name (optional)
  username?: string;             // Username (if applicable)
}

/**
 * Authentication hook return type
 * Used by both web (MSAL React) and mobile (react-native-msal)
 */
export interface UseAuthResult {
  isAuthenticated: boolean;      // True if a user is signed in
  user: AuthUser | null;         // Current user or null
  isLoading?: boolean;           // Optional: true during initialization
  isTokenReady: boolean;         // True only after token has been successfully acquired from the cache
  signIn: () => Promise<void>;   // Trigger sign-in flow
  signOut: () => Promise<void>;  // Trigger sign-out flow
  getAccessToken: () => Promise<string | null>; // Get an access token for API calls
}