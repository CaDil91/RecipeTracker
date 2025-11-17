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

// Mock expo-image-picker (native module required by useImagePicker hook)
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' })),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted', granted: true, canAskAgain: true, expires: 'never' })),
  MediaTypeOptions: { Images: 'images', Videos: 'videos', All: 'all' },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
}));

// Mock expo-image-manipulator (used by imageCompression utility)
// expo-image-manipulator v13+ uses contextual API: ImageManipulator.manipulate()
jest.mock('expo-image-manipulator', () => {
  const mockSaveAsync = jest.fn();
  const mockRenderAsync = jest.fn();
  const mockResize = jest.fn();
  const mockManipulate = jest.fn();

  // Set up the contextual API chain
  mockManipulate.mockImplementation(() => ({
    resize: mockResize,
    renderAsync: mockRenderAsync,
  }));

  mockResize.mockImplementation(() => ({
    resize: mockResize,
    renderAsync: mockRenderAsync,
  }));

  mockRenderAsync.mockImplementation(() => Promise.resolve({
    saveAsync: mockSaveAsync,
  }));

  mockSaveAsync.mockImplementation(() => Promise.resolve({
    uri: 'file:///path/to/compressed.jpg',
    width: 1920,
    height: 1080,
  }));

  return {
    ImageManipulator: {
      manipulate: mockManipulate,
    },
    SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
    FlipType: { Horizontal: 'horizontal', Vertical: 'vertical' },
    Action: {},
    // Expose mock functions for test assertions
    __mocks: {
      manipulate: mockManipulate,
      resize: mockResize,
      renderAsync: mockRenderAsync,
      saveAsync: mockSaveAsync,
    },
  };
});

// Mock react-native-paper Portal to avoid async rendering issues in tests
// Portal normally renders content asynchronously outside the component tree,
// but for testing we want synchronous rendering
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  require('react');
  return {
    ...RealModule,
  };
});

// Silence console warnings about missing icons and Surface overflow in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Tried to use the icon') ||
       args[0].includes('Surface') ||
       args[0].includes('maxFontSizeMultiplier'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Silence act() warnings from React Query async updates
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});