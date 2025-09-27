/**
 * MSW (Mock Service Worker) setup
 *
 * This module provides mock API responses for development and testing.
 * MSW intercepts network requests at the browser level, providing realistic
 * API behavior without needing a real backend server.
 *
 * Usage:
 * - Browser/Web: Uses service worker to intercept fetch requests
 * - Node.js/Tests: Uses server setup to intercept requests in Node.js
 *
 * Enable via environment variable: EXPO_PUBLIC_USE_MSW=true
 */

export { worker } from './browser';
export { server } from './server';
export { recipeHandlers, resetMockRecipes } from './handlers/recipes';