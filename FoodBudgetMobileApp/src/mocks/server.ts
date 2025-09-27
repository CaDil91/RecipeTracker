import { setupServer } from 'msw/node';
import { recipeHandlers } from './handlers/recipes';

/**
 * MSW server for Node.js environments (testing, SSR)
 * Intercepts fetch requests in Node.js runtime
 */
export const server = setupServer(...recipeHandlers);

// Configure server behavior
server.events.on('request:start', ({ request }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('MSW intercepted:', request.method, request.url);
  }
});

server.events.on('request:unhandled', ({ request }) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('MSW unhandled request:', request.method, request.url);
  }
});