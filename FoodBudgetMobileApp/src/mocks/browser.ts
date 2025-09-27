import { setupWorker } from 'msw/browser';
import { recipeHandlers } from './handlers/recipes';

/**
 * MSW worker for browser environments (web, Expo web)
 * Intercepts fetch requests and returns mock responses
 */
export const worker = setupWorker(...recipeHandlers);

// Enable MSW devtools in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn', // Warn about unhandled requests
    serviceWorker: {
      url: '/mockServiceWorker.js' // Default MSW service worker path
    }
  });
}