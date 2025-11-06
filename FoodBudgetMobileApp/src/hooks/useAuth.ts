/**
 * Platform abstraction for authentication
 *
 * This hook routes to the correct authentication implementation based on a platform:
 * - Web: Uses @azure/msal-react (MSAL React)
 * - Mobile: Uses react-native-msal (Phase 2 - not yet implemented)
 *
 * Components should ONLY import this hook, never platform-specific hooks directly.
 *
 * NOTE (Sprint 5 Phase 1): Currently only web is implemented.
 * Platform detection will be added in Phase 2 when mobile auth is implemented.
 */

import { useMsalWeb } from './useMsal.web';
import { UseAuthResult } from '../lib/auth/authTypes';

/**
 * Authentication hook with platform abstraction
 *
 * Currently, uses MSAL React for a web platform.
 * Mobile platform support will be added in Sprint 5 Phase 2.
 *
 * @returns Authentication state and methods
 */
export const useAuth = (): UseAuthResult => {
  // Phase 1: Web authentication only
  return useMsalWeb();

  // Phase 2: Add platform detection and mobile authentication
  // import { Platform } from 'react-native';
  // if (Platform.OS === 'web') {
  //   return useMsalWeb();
  // }
  // import { useMsalNative } from './useMsal.native';
  // return useMsalNative();
};