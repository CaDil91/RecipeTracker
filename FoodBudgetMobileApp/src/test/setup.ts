import {QueryClient} from '@tanstack/react-query';

// Simple hook mocking approach for mobile app testing

// Global test query client - shared across all tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries in tests
      gcTime: Infinity, // Doesn't garbage collect during tests
    },
    mutations: {
      retry: false, // Disable mutation retries in tests
    },
  },
});

// Create a global instance
(global as any).testQueryClient = createTestQueryClient();

// Note: We're NOT mocking react-native-paper anymore
// Using real Paper components follows a "sociable unit test" approach
// Only mock true external boundaries like API services

// Mock react-native-safe-area-context using official built-in mock
// This is an external boundary (platform safe area APIs), so mocking is appropriate
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, ...props }: any) => React.createElement(Text, props, name);
});

// Silence console warnings about missing icons in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Tried to use the icon')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Note: We're NOT mocking React Query globally anymore
// Tests should use real React Query with test QueryClient
// This follows the "sociable unit test" pattern - testing with real collaborators
// Only mock external boundaries like API services