import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';
import { PaperProvider } from 'react-native-paper';

// Mock expo icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: function MockIcon({ name }: { name: string }) {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

/**
 * Unit tests for the SearchBar component
 *
 * Tests search input with focus states, clear functionality, and theme integration.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    /**
     * Test: Basic search bar rendering
     * Given: SearchBar with required props
     * When: Component renders
     * Then: Displays search input with icons
     */
    it('given required props, when rendered, then displays search input', () => {
      // Arrange & Act
      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('search-bar')).toBeTruthy();
      expect(getByTestId('search-bar-container')).toBeTruthy();
      expect(getByTestId('icon-magnify')).toBeTruthy();
      expect(getByPlaceholderText('Search recipes...')).toBeTruthy();
    });

    /**
     * Test: Text input interaction
     * Given: SearchBar with onChangeText handler
     * When: User types in search field
     * Then: Calls onChangeText with typed text
     */
    it('given onChangeText handler, when user types, then calls with typed text', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Act
      fireEvent.changeText(getByTestId('search-bar'), 'pasta');

      // Assert
      expect(mockOnChangeText).toHaveBeenCalledWith('pasta');
      expect(mockOnChangeText).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Clear button functionality
     * Given: SearchBar with text value and clear handler
     * When: Clear button pressed
     * Then: Clears text and calls onClear
     */
    it('given text value and clear handler, when clear pressed, then clears text', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar
            value="test search"
            onChangeText={mockOnChangeText}
            onClear={mockOnClear}
          />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('search-bar-clear'));

      // Assert
      expect(mockOnChangeText).toHaveBeenCalledWith('');
      expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Clear button visibility
     * Given: SearchBar with empty value
     * When: Component renders
     * Then: Hides clear button
     */
    it('given empty value, when rendered, then hides clear button', () => {
      // Arrange & Act
      const { queryByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(queryByTestId('search-bar-clear')).toBeNull();
    });

    /**
     * Test: Clear button visibility with text
     * Given: SearchBar with text value
     * When: Component renders
     * Then: Shows clear button
     */
    it('given text value, when rendered, then shows clear button', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="search text" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('search-bar-clear')).toBeTruthy();
    });

    /**
     * Test: Clear without onClear handler
     * Given: SearchBar without onClear handler
     * When: Clear button pressed
     * Then: Clears text without error
     */
    it('given no onClear handler, when clear pressed, then clears text gracefully', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="test" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Act & Assert - Should not throw
      expect(() => {
        fireEvent.press(getByTestId('search-bar-clear'));
      }).not.toThrow();
      expect(mockOnChangeText).toHaveBeenCalledWith('');
    });

    /**
     * Test: Custom placeholder
     * Given: SearchBar with custom placeholder
     * When: Component renders
     * Then: Uses custom placeholder text
     */
    it('given custom placeholder, when rendered, then uses custom placeholder', () => {
      // Arrange & Act
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <SearchBar
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Find your recipe..."
          />
        </TestWrapper>
      );

      // Assert
      expect(getByPlaceholderText('Find your recipe...')).toBeTruthy();
    });

    /**
     * Test: Keyboard configuration
     * Given: SearchBar component
     * When: Component renders
     * Then: Sets correct keyboard properties
     */
    it('given component, when rendered, then sets keyboard properties', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      const input = getByTestId('search-bar');
      expect(input.props.returnKeyType).toBe('search');
      expect(input.props.autoCorrect).toBe(false);
      expect(input.props.autoCapitalize).toBe('none');
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: Focus state handling
     * Given: SearchBar component
     * When: Input receives focus
     * Then: Handles focus state internally
     */
    it('given input field, when focused, then handles focus state', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Act & Assert - Should not throw
      const input = getByTestId('search-bar');
      expect(() => {
        fireEvent(input, 'focus');
      }).not.toThrow();
    });

    /**
     * Test: Blur state handling
     * Given: Focused SearchBar
     * When: Input loses focus
     * Then: Handles blur state internally
     */
    it('given focused input, when blurred, then handles blur state', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Act & Assert - Should not throw
      const input = getByTestId('search-bar');
      fireEvent(input, 'focus');
      expect(() => {
        fireEvent(input, 'blur');
      }).not.toThrow();
    });

    /**
     * Test: Value updates from props
     * Given: SearchBar with initial value
     * When: Value prop changes
     * Then: Updates displayed value
     */
    it('given value prop change, when rerendered, then updates displayed value', () => {
      // Arrange
      const { getByTestId, rerender } = render(
        <TestWrapper>
          <SearchBar value="initial" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Act
      const input = getByTestId('search-bar');
      expect(input.props.value).toBe('initial');

      rerender(
        <TestWrapper>
          <SearchBar value="updated" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(input.props.value).toBe('updated');
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Default testID structure
     * Given: SearchBar without custom testID
     * When: Component renders
     * Then: Uses default testID structure
     */
    it('given no custom testID, when rendered, then uses default structure', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('search-bar')).toBeTruthy();
      expect(getByTestId('search-bar-container')).toBeTruthy();
    });

    /**
     * Test: Custom testID structure
     * Given: SearchBar with custom testID
     * When: Component renders
     * Then: Uses custom testID structure
     */
    it('given custom testID, when rendered, then uses custom structure', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar
            value="test"
            onChangeText={mockOnChangeText}
            testID="custom-search"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('custom-search')).toBeTruthy();
      expect(getByTestId('custom-search-container')).toBeTruthy();
      expect(getByTestId('custom-search-clear')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Icon rendering
     * Given: SearchBar component
     * When: Component renders
     * Then: Displays search and clear icons
     */
    it('given component, when rendered, then displays icons', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <SearchBar value="test" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('icon-magnify')).toBeTruthy();
      expect(getByTestId('icon-close-circle')).toBeTruthy();
    });

    /**
     * Test: Empty string handling
     * Given: SearchBar with empty string value
     * When: Component renders and operates
     * Then: Handles empty state correctly
     */
    it('given empty string value, when operated, then handles gracefully', () => {
      // Arrange & Act
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <SearchBar value="" onChangeText={mockOnChangeText} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('search-bar')).toBeTruthy();
      expect(queryByTestId('search-bar-clear')).toBeNull();

      // Act - Type and clear
      fireEvent.changeText(getByTestId('search-bar'), 'test');
      expect(mockOnChangeText).toHaveBeenCalledWith('test');
    });

    /**
     * Test: Theme integration
     * Given: SearchBar with theme provider
     * When: Component renders
     * Then: Integrates with theme without errors
     */
    it('given theme provider, when rendered, then integrates with theme', () => {
      // Arrange & Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <SearchBar
              value="themed search"
              onChangeText={mockOnChangeText}
              onClear={mockOnClear}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});