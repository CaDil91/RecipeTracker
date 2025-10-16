import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import { userEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RecipeListScreenNavigationProp } from '../types/navigation';

// Create a fresh QueryClient for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

// Enhanced render function with all necessary providers
interface CustomRenderOptions {
  theme?: 'light' | 'dark';
  initialSafeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  queryClient?: QueryClient;
}

// 2025 Pattern: Return both render results AND user event instance
interface CustomRenderResult extends RenderAPI {
  user: ReturnType<typeof userEvent.setup>;
}

export const renderWithProviders = (
  component: React.ReactElement,
  options: CustomRenderOptions = {}
): CustomRenderResult => {
  const {
    theme = 'light',
    initialSafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 },
    queryClient = createTestQueryClient()
  } = options;

  const selectedTheme = theme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider initialMetrics={{
      insets: initialSafeAreaInsets,
      frame: { x: 0, y: 0, width: 375, height: 812 }
    }}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={selectedTheme}>
          {children}
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );

  const renderResult = render(component, { wrapper: AllProviders });
  const user = userEvent.setup();

  return {
    ...renderResult,
    user,
  };
};

// Generic mock navigation object for tests
export const createMockNavigation = <T extends Record<string, any> = RecipeListScreenNavigationProp>(
  overrides: Partial<T> = {}
): T => {
  const baseNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
    removeListener: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => false),
    getId: jest.fn(() => 'test-screen'),
    getParent: jest.fn(),
    getState: jest.fn(() => ({ key: 'test', index: 0, routeNames: [], routes: [], type: 'stack', stale: false })),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    reset: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
    popTo: jest.fn(),
    popToTop: jest.fn(),
    replace: jest.fn(),
    ...overrides,
  };

  return baseNavigation as unknown as T;
};