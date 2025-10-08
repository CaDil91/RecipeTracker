import {QueryClient} from '@tanstack/react-query';

// MSW React Native polyfills (official approach)
import 'react-native-url-polyfill/auto';
import 'fast-text-encoding';

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

// Mock react-native-safe-area-context using official built-in mock
// This is an external boundary (platform safe area APIs), so mocking is appropriate
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Mock @expo/vector-icons for tests
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: function MockIcon({ name, ...props }: any) {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, props, name);
  },
}));

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