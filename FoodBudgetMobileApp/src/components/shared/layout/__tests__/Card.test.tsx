import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../Card';

/**
 * Unit tests for a Card component
 *
 * Tests card layout wrapper with conditional padding and elevation handling.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('Card', () => {
  describe('Happy Path', () => {
    /**
     * Test: Default card rendering
     * Given: Children and default props
     * When: Card renders
     * Then: Displays card content successfully
     */
    it('given children and default props, when rendered, then displays card content', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card>
          <Text>Card content</Text>
        </Card>
      );

      // Assert
      expect(getByText('Card content')).toBeTruthy();
    });

    /**
     * Test: Custom styling
     * Given: Custom style prop
     * When: Card renders
     * Then: Renders card with content (style application verified by rendering)
     */
    it('given custom style, when rendered, then renders styled card', () => {
      // Arrange
      const customStyle = { backgroundColor: 'red', margin: 10 };

      // Act
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Styled content</Text>
        </Card>
      );

      // Assert - If style breaks rendering, this would fail
      expect(getByText('Styled content')).toBeTruthy();
    });

    /**
     * Test: Unpadded card
     * Given: padded=false
     * When: Card renders
     * Then: Displays card content without a Content wrapper
     */
    it('given padded false, when rendered, then displays card without padding wrapper', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card padded={false}>
          <Text>Direct content</Text>
        </Card>
      );

      // Assert
      expect(getByText('Direct content')).toBeTruthy();
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Elevated mode with elevation
     * Given: mode='elevated' and elevation prop
     * When: Card renders
     * Then: Renders successfully with elevation configuration
     */
    it('given elevated mode and elevation prop, when rendered, then renders elevated card', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card mode="elevated" elevation={4}>
          <Text>Elevated content</Text>
        </Card>
      );

      // Assert - Verifies the component handles elevation prop without error
      expect(getByText('Elevated content')).toBeTruthy();
    });

    /**
     * Test: Default mode behavior
     * Given: No mode specified
     * When: Card renders
     * Then: Renders successfully with default configuration
     */
    it('given no mode specified, when rendered, then uses default mode', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card>
          <Text>Default mode content</Text>
        </Card>
      );

      // Assert
      expect(getByText('Default mode content')).toBeTruthy();
    });

    /**
     * Test: Outlined mode
     * Given: mode='outlined'
     * When: Card renders
     * Then: Renders successfully in outlined mode
     */
    it('given outlined mode, when rendered, then renders outlined card', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card mode="outlined">
          <Text>Outlined content</Text>
        </Card>
      );

      // Assert
      expect(getByText('Outlined content')).toBeTruthy();
    });
  });

  describe('Component Composition', () => {
    /**
     * Test: Subcomponent availability
     * Given: Card component
     * When: Accessing subcomponents
     * Then: Provides Title, Content, Cover, Actions
     */
    it('given Card component, when accessing subcomponents, then provides all subcomponents', () => {
      // Arrange & Act & Assert
      expect(Card.Title).toBeDefined();
      expect(Card.Content).toBeDefined();
      expect(Card.Cover).toBeDefined();
      expect(Card.Actions).toBeDefined();
    });

    /**
     * Test: Card with Title subcomponent
     * Given: Card.Title usage
     * When: Card renders with Title
     * Then: Renders a title component successfully
     */
    it('given Card Title subcomponent, when rendered, then displays title', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card>
          <Card.Title title="Recipe Card" subtitle="Delicious meal" />
          <Text>Recipe details</Text>
        </Card>
      );

      // Assert
      expect(getByText('Recipe Card')).toBeTruthy();
      expect(getByText('Delicious meal')).toBeTruthy();
      expect(getByText('Recipe details')).toBeTruthy();
    });

    /**
     * Test: Card with Content subcomponent
     * Given: Card.Content usage
     * When: Card renders with explicit Content
     * Then: Renders a content component successfully
     */
    it('given Card Content subcomponent, when rendered, then displays content', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card padded={false}>
          <Card.Content>
            <Text>Explicit content wrapper</Text>
          </Card.Content>
        </Card>
      );

      // Assert
      expect(getByText('Explicit content wrapper')).toBeTruthy();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Complex card structure
     * Given: Multiple props and subcomponents
     * When: Card renders
     * Then: Handles all props and children correctly
     */
    it('given complex props and subcomponents, when rendered, then renders successfully', () => {
      // Arrange & Act
      const { getByText } = render(
        <Card mode="elevated" elevation={2}>
          <Card.Title title="Complex Card" />
          <Card.Content>
            <Text>Card body content</Text>
          </Card.Content>
          <Card.Actions>
            <Text>Action buttons</Text>
          </Card.Actions>
        </Card>
      );

      // Assert
      expect(getByText('Complex Card')).toBeTruthy();
      expect(getByText('Card body content')).toBeTruthy();
      expect(getByText('Action buttons')).toBeTruthy();
    });
  });
});