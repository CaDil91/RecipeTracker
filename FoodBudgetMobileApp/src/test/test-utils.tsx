import React from 'react';
import { render, RenderAPI } from '@testing-library/react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Enhanced render function with all necessary providers
interface CustomRenderOptions {
  theme?: 'light' | 'dark';
  initialSafeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const renderWithProviders = (
  component: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderAPI => {
  const {
    theme = 'light',
    initialSafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 }
  } = options;

  const selectedTheme = theme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider initialMetrics={{
      insets: initialSafeAreaInsets,
      frame: { x: 0, y: 0, width: 375, height: 812 }
    }}>
      <PaperProvider theme={selectedTheme}>
        {children}
      </PaperProvider>
    </SafeAreaProvider>
  );

  return render(component, { wrapper: AllProviders });
};

// Mock data generators for consistent testing
export const createMockRecipe = (overrides = {}) => ({
  id: 'test-recipe-id',
  title: 'Test Recipe',
  instructions: 'Mix ingredients and cook for 30 minutes',
  servings: 4,
  createdAt: '2024-01-15T10:30:00Z',
  ...overrides,
});

// Accessibility test helpers
export const expectToBeAccessible = (element: any) => {
  expect(element.props.accessibilityRole).toBe('button');
  expect(element.props.accessible).toBe(true);
};

// Performance test helpers
export const measureRenderTime = (renderFn: () => void): number => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// User event simulation helpers
export const simulateUserTyping = async (input: any, text: string, delay = 50) => {
  const { fireEvent } = await import('@testing-library/react-native');
  
  for (const char of text) {
    fireEvent.changeText(input, char);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

// Form validation test helpers
export const expectValidationError = (container: RenderAPI, errorMessage: string) => {
  expect(container.getByText(errorMessage)).toBeTruthy();
};

export const expectNoValidationErrors = (container: RenderAPI, errorMessages: string[]) => {
  errorMessages.forEach(message => {
    expect(container.queryByText(message)).toBeNull();
  });
};

// Common test scenarios
export const commonButtonTests = (ButtonComponent: React.ComponentType<any>) => {
  describe('Common Button Behaviors', () => {
    it('should be focusable and have proper accessibility', () => {
      const { getByRole } = renderWithProviders(
        <ButtonComponent title="Test" />
      );
      
      const button = getByRole('button');
      expectToBeAccessible(button);
    });

    it('should handle rapid successive clicks gracefully', () => {
      const onPress = jest.fn();
      const { getByRole } = renderWithProviders(
        <ButtonComponent title="Test" onPress={onPress} />
      );
      
      const button = getByRole('button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        const { fireEvent } = require('@testing-library/react-native');
        fireEvent.press(button);
      }
      
      expect(onPress).toHaveBeenCalledTimes(5);
    });
  });
};

export default renderWithProviders;