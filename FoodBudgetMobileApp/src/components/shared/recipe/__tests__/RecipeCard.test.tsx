import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeCard } from '../RecipeCard';
import { RecipeResponseDto } from '../../../../lib/shared';

const mockRecipe: RecipeResponseDto = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Recipe',
  instructions: 'Mix ingredients and cook for 30 minutes',
  servings: 4,
  createdAt: '2024-01-15T10:30:00Z',
};

/**
 * Unit tests for the RecipeCard component
 *
 * Tests recipe display card with data formatting, conditional rendering, and user interactions.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('RecipeCard', () => {
  describe('Happy Path', () => {
    /**
     * Test: Basic recipe display
     * Given: Recipe data without handlers
     * When: Card renders
     * Then: Displays recipe information correctly
     */
    it('given recipe data without handlers, when rendered, then displays recipe information', () => {
      // Arrange & Act
      const { getByText } = render(<RecipeCard recipe={mockRecipe} />);

      // Assert
      expect(getByText('Test Recipe')).toBeTruthy();
      expect(getByText(/Created Jan 15, 2024/)).toBeTruthy();
      expect(getByText('4 servings')).toBeTruthy();
      expect(getByText('Mix ingredients and cook for 30 minutes')).toBeTruthy();
    });

    /**
     * Test: Instructions display
     * Given: Recipe with instructions
     * When: Card renders
     * Then: Displays truncated instructions
     */
    it('given recipe with instructions, when rendered, then displays truncated instructions', () => {
      // Arrange
      const longInstructions = {
        ...mockRecipe,
        instructions: 'This is a very long instruction text that should be truncated. '.repeat(10),
      };

      // Act
      const { getByText } = render(<RecipeCard recipe={longInstructions} />);

      // Assert
      const instructionElement = getByText(/This is a very long instruction/);
      expect(instructionElement.props.numberOfLines).toBe(3);
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Singular serving display
     * Given: Recipe with 1 serving
     * When: Card renders
     * Then: Displays "serving" (singular)
     */
    it('given recipe with 1 serving, when rendered, then displays singular serving', () => {
      // Arrange
      const singleServing = { ...mockRecipe, servings: 1 };

      // Act
      const { getByText } = render(<RecipeCard recipe={singleServing} />);

      // Assert
      expect(getByText('1 serving')).toBeTruthy();
    });

    /**
     * Test: Plural servings display
     * Given: Recipe with multiple servings
     * When: Card renders
     * Then: Displays "servings" (plural)
     */
    it('given recipe with multiple servings, when rendered, then displays plural servings', () => {
      // Arrange & Act
      const { getByText } = render(<RecipeCard recipe={mockRecipe} />);

      // Assert
      expect(getByText('4 servings')).toBeTruthy();
    });

    /**
     * Test: Date formatting
     * Given: Recipe with creation date
     * When: Card renders
     * Then: Formats date correctly
     */
    it('given recipe date, when rendered, then formats date correctly', () => {
      // Arrange & Act
      const { getByText } = render(<RecipeCard recipe={mockRecipe} />);

      // Assert
      expect(getByText(/Created Jan 15, 2024/)).toBeTruthy();
    });

    /**
     * Test: Missing instructions handling
     * Given: Recipe without instructions
     * When: Card renders
     * Then: Doesn't show instructions section
     */
    it('given recipe without instructions, when rendered, then no instructions shown', () => {
      // Arrange
      const noInstructions = { ...mockRecipe, instructions: null };

      // Act
      const { queryByText } = render(<RecipeCard recipe={noInstructions} />);

      // Assert
      expect(queryByText(/Mix ingredients/)).toBeNull();
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: Card press interaction
     * Given: onPress handler
     * When: Card pressed
     * Then: Calls onPress callback
     */
    it('given onPress handler, when card pressed, then calls onPress', () => {
      // Arrange
      const onPress = jest.fn();
      const { getByTestId } = render(
        <RecipeCard recipe={mockRecipe} onPress={onPress} testID="recipe-card" />
      );

      // Act
      fireEvent.press(getByTestId('recipe-card'));

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: View Details button interaction
     * Given: onPress handler
     * When: View Details button pressed
     * Then: Calls onPress callback
     */
    it('given onPress handler, when view details pressed, then calls onPress', () => {
      // Arrange
      const onPress = jest.fn();
      const { getByTestId } = render(
        <RecipeCard recipe={mockRecipe} onPress={onPress} testID="recipe-card" />
      );

      // Act
      fireEvent.press(getByTestId('recipe-card-view'));

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    /**
     * Test: No actions section without onPress
     * Given: No onPress handler
     * When: Card renders
     * Then: No Card.Actions section shown
     */
    it('given no onPress handler, when rendered, then no actions section shown', () => {
      // Arrange & Act
      const { queryByText } = render(<RecipeCard recipe={mockRecipe} />);

      // Assert
      expect(queryByText('View Details')).toBeNull();
    });

    /**
     * Test: Actions section with onPress
     * Given: onPress handler
     * When: Card renders
     * Then: Shows Card.Actions section
     */
    it('given onPress handler, when rendered, then shows actions section', () => {
      // Arrange & Act
      const { getByText } = render(
        <RecipeCard recipe={mockRecipe} onPress={jest.fn()} />
      );

      // Assert
      expect(getByText('View Details')).toBeTruthy();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: TestID application
     * Given: testID prop
     * When: Card renders
     * Then: Applies testID to elements correctly
     */
    it('given testID prop, when rendered, then applies testID correctly', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <RecipeCard
          recipe={mockRecipe}
          onPress={jest.fn()}
          testID="recipe-card"
        />
      );

      // Assert
      expect(getByTestId('recipe-card')).toBeTruthy();
      expect(getByTestId('recipe-card-view')).toBeTruthy();
    });
  });
});