// Mock React Native Paper components that cause issues in tests
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const RealModule = jest.requireActual('react-native-paper');
  
  // Mock IconButton component
  const IconButton = ({ icon, onPress, testID, accessibilityLabel, ...props }: any) => {
    return React.createElement(TouchableOpacity, { 
      onPress, 
      testID,
      accessibilityLabel,
      ...props 
    }, React.createElement(Text, {}, `IconButton:${icon}`));
  };

  // Mock FAB component  
  const FAB = ({ icon, onPress, testID, accessibilityLabel, style, ...props }: any) => {
    return React.createElement(TouchableOpacity, { 
      onPress, 
      testID,
      accessibilityLabel,
      style,
      ...props 
    }, React.createElement(Text, {}, `FAB:${icon}`));
  };

  const MockedModule = {
    ...RealModule,
    Portal: ({ children }: any) => children,
    PaperProvider: ({ children }: any) => children,
    Icon: ({ source, ...props }: any) => {
      return React.createElement(Text, { ...props }, `Icon:${source}`);
    },
    IconButton,
    FAB,
  };
  return MockedModule;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(inset),
    useSafeAreaInsets: () => inset,
    SafeAreaView: ({ children }: any) => children,
  };
});

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