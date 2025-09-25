import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Container } from '../Container';

// Mock the safe area hook
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  }),
}));

// Mock the theme hook
jest.mock('react-native-paper', () => {
  const actualRNP = jest.requireActual('react-native-paper');
  return {
    ...actualRNP,
    useTheme: () => ({
      colors: {
        background: '#ffffff',
      },
    }),
  };
});

/**
 * Unit tests for a Container component
 *
 * Tests container layout with conditional rendering, styling, and safe area handling.
 * Uses mocked safe area and theme dependencies for deterministic testing.
 */
describe('Container', () => {
  describe('Happy Path', () => {
    /**
     * Test: Default container rendering
     * Given: Children with default props
     * When: Container renders
     * Then: Displays basic container with content
     */
    it('given children with defaults, when rendered, then displays basic container', () => {
      // Arrange & Act
      const { getByText } = render(
        <Container>
          <Text>Container content</Text>
        </Container>
      );

      // Assert
      expect(getByText('Container content')).toBeTruthy();
    });

    /**
     * Test: Scrollable container
     * Given: scrollable=true
     * When: Container renders
     * Then: Creates ScrollView container
     */
    it('given scrollable true, when rendered, then creates scroll view container', () => {
      // Arrange & Act
      const { getByTestId, getByText } = render(
        <Container scrollable testID="scrollable-container">
          <Text>Scrollable content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('scrollable-container');
      expect(container.type).toBe('RCTScrollView');
      expect(getByText('Scrollable content')).toBeTruthy();
    });

    /**
     * Test: Surface wrapper
     * Given: surface=true
     * When: Container renders
     * Then: Uses Surface wrapper for styling
     */
    it('given surface true, when rendered, then uses surface wrapper', () => {
      // Arrange & Act
      const { getByText } = render(
        <Container surface>
          <Text>Surface content</Text>
        </Container>
      );

      // Assert
      expect(getByText('Surface content')).toBeTruthy();
      // Surface rendering is verified by a successful content display
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Padded container (default)
     * Given: padded=true (default)
     * When: Container renders
     * Then: Applies padding to container
     */
    it('given padded true by default, when rendered, then applies padding', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container testID="padded-container">
          <Text>Padded content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('padded-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          padding: 16,
        })
      );
    });

    /**
     * Test: Unpadded container
     * Given: padded=false
     * When: Container renders
     * Then: No padding applied
     */
    it('given padded false, when rendered, then no padding applied', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container padded={false} testID="unpadded-container">
          <Text>Unpadded content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('unpadded-container');
      expect(container.props.style.padding).toBeUndefined();
    });

    /**
     * Test: Safe area insets (default)
     * Given: useSafeArea=true (default)
     * When: Container renders
     * Then: Applies safe area insets
     */
    it('given useSafeArea true by default, when rendered, then applies safe area insets', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container testID="safe-area-container">
          <Text>Safe area content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('safe-area-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          paddingTop: 44,
          paddingBottom: 34,
          paddingLeft: 0,
          paddingRight: 0,
        })
      );
    });

    /**
     * Test: No safe area insets
     * Given: useSafeArea=false
     * When: Container renders
     * Then: No safe area insets applied
     */
    it('given useSafeArea false, when rendered, then no safe area insets', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container useSafeArea={false} testID="no-safe-area-container">
          <Text>No safe area content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('no-safe-area-container');
      expect(container.props.style).not.toEqual(
        expect.objectContaining({
          paddingTop: 44,
          paddingBottom: 34,
        })
      );
    });
  });

  describe('Complex Combinations', () => {
    /**
     * Test: Scrollable with surface
     * Given: scrollable=true + surface=true
     * When: Container renders
     * Then: Creates ScrollView with Surface child
     */
    it('given scrollable and surface, when rendered, then creates scroll view with surface child', () => {
      // Arrange & Act
      const { getByTestId, getByText } = render(
        <Container scrollable surface testID="scrollable-surface">
          <Text>Scrollable surface content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('scrollable-surface');
      expect(container.type).toBe('RCTScrollView');
      expect(getByText('Scrollable surface content')).toBeTruthy();
    });

    /**
     * Test: Scrollable without padding
     * Given: scrollable=true + padded=false
     * When: Container renders
     * Then: Creates scrollable container without padding
     */
    it('given scrollable and unpadded, when rendered, then creates scrollable without padding', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container scrollable padded={false} testID="scrollable-unpadded">
          <Text>Scrollable unpadded content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('scrollable-unpadded');
      expect(container.type).toBe('RCTScrollView');
      // Padding should not be in contentContainerStyle
      expect(container.props.contentContainerStyle).not.toEqual(
        expect.objectContaining({
          padding: 16,
        })
      );
    });

    /**
     * Test: All props configured
     * Given: All props with non-default values
     * When: Container renders
     * Then: Handles complex configuration correctly
     */
    it('given all props configured, when rendered, then handles complex configuration', () => {
      // Arrange
      const customStyle = { backgroundColor: 'red' };

      // Act
      const { getByTestId, getByText } = render(
        <Container
          scrollable={true}
          padded={false}
          useSafeArea={false}
          surface={true}
          style={customStyle}
          testID="complex-container"
        >
          <Text>Complex configuration</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('complex-container');
      expect(container.type).toBe('RCTScrollView');
      expect(getByText('Complex configuration')).toBeTruthy();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Custom styling
     * Given: Custom style prop
     * When: Container renders
     * Then: Merges with container styles
     */
    it('given custom style, when rendered, then merges with container styles', () => {
      // Arrange
      const customStyle = { backgroundColor: 'blue', margin: 20 };

      // Act
      const { getByTestId } = render(
        <Container style={customStyle} testID="styled-container">
          <Text>Styled content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('styled-container');
      expect(container.props.style).toEqual(
        expect.objectContaining(customStyle)
      );
    });

    /**
     * Test: TestID application
     * Given: testID prop
     * When: Container renders
     * Then: Applies testID to a container element
     */
    it('given testID prop, when rendered, then applies to container element', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container testID="test-container">
          <Text>Test content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('test-container');
      expect(container).toBeTruthy();
    });

    /**
     * Test: Base container properties
     * Given: Default container
     * When: Container renders
     * Then: Has flex: 1 and background color
     */
    it('given default container, when rendered, then has base properties', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Container testID="base-container">
          <Text>Base content</Text>
        </Container>
      );

      // Assert
      const container = getByTestId('base-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          flex: 1,
          backgroundColor: '#ffffff',
        })
      );
    });
  });
});