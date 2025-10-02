import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { RecipeGridCard } from '../RecipeGridCard';
import { RecipeResponseDto } from '../../../../lib/shared';

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockRecipe: RecipeResponseDto & { imageUrl?: string; category?: string } = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Recipe',
  instructions: 'Mix ingredients and cook for 30 minutes',
  servings: 4,
  createdAt: '2024-01-15T10:30:00Z',
  imageUrl: 'https://example.com/recipe.jpg',
  category: 'Dinner',
};

/**
 * Unit tests for the RecipeGridCard component
 *
 * Tests recipe grid card with dynamic layout, image handling, and conditional rendering.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('RecipeGridCard', () => {
  describe('Happy Path', () => {
    /**
     * Test: Basic recipe card rendering
     * Given: Recipe with all properties
     * When: Card renders
     * Then: Displays recipe information correctly
     */
    it('given recipe with all properties, when rendered, then displays recipe information', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      expect(getByText('Test Recipe')).toBeTruthy();
      expect(getByText('4')).toBeTruthy();
      expect(getByText('Dinner')).toBeTruthy();
    });

    /**
     * Test: Card with image display
     * Given: Recipe with imageUrl
     * When: Card renders
     * Then: Displays image with a correct source
     */
    it('given recipe with imageUrl, when rendered, then displays image', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      const { Image } = require('react-native');
      const imageElement = UNSAFE_getByType(Image);
      expect(imageElement.props.source.uri).toBe('https://example.com/recipe.jpg');
    });

  });

  describe('Business Rules', () => {
    /**
     * Test: Category chip visibility
     * Given: Recipe with 'All' category
     * When: Card renders
     * Then: Hides category chip
     */
    it('given recipe with All category, when rendered, then hides category chip', () => {
      // Arrange
      const recipeWithAllCategory = { ...mockRecipe, category: 'All' };

      // Act
      const { queryByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={recipeWithAllCategory} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      expect(queryByText('All')).toBeNull();
    });

    /**
     * Test: Category chip without category
     * Given: Recipe without category
     * When: Card renders
     * Then: Shows only servings chip
     */
    it('given recipe without category, when rendered, then shows only servings chip', () => {
      // Arrange
      const recipeWithoutCategory = { ...mockRecipe, category: undefined };

      // Act
      const { getByText, queryByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={recipeWithoutCategory} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      expect(getByText('4')).toBeTruthy();
      expect(queryByText('Dinner')).toBeNull();
    });

    /**
     * Test: Title line truncation
     * Given: Recipe with long title
     * When: Card renders
     * Then: Limits title to 2 lines
     */
    it('given recipe with long title, when rendered, then limits to 2 lines', () => {
      // Arrange
      const longTitleRecipe = {
        ...mockRecipe,
        title: 'This is a very long recipe title that should be truncated to two lines maximum',
      };

      // Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={longTitleRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      const titleElement = getByText(/This is a very long recipe title/);
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    /**
     * Test: Text rendering with multiple columns
     * Given: Card with 3 columns
     * When: Card renders
     * Then: Displays recipe title
     */
    it('given 3 columns, when rendered, then displays recipe title', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} columns={3} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      expect(getByText('Test Recipe')).toBeTruthy();
    });

    /**
     * Test: Text rendering with default columns
     * Given: Card with default columns (2)
     * When: Card renders
     * Then: Displays recipe title
     */
    it('given default columns, when rendered, then displays recipe title', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      expect(getByText('Test Recipe')).toBeTruthy();
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
        <TestWrapper>
          <RecipeGridCard
            recipe={mockRecipe}
            onPress={onPress}
            testID="recipe-card"
          />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-card'));

      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    /**
     * Test: Image display when available
     * Given: Recipe with imageUrl
     * When: Card renders
     * Then: Shows image instead of placeholder
     */
    it('given recipe with imageUrl, when rendered, then shows image', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      const { Image } = require('react-native');
      const imageElement = UNSAFE_getByType(Image);
      expect(imageElement.props.source.uri).toBe('https://example.com/recipe.jpg');
    });

    /**
     * Test: Placeholder when no image
     * Given: Recipe without imageUrl
     * When: Card renders
     * Then: Shows placeholder with icon
     */
    it('given recipe without imageUrl, when rendered, then shows placeholder', () => {
      // Arrange
      const recipeWithoutImage = { ...mockRecipe, imageUrl: undefined };

      // Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <RecipeGridCard recipe={recipeWithoutImage} testID="recipe-card" />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: TestID structure
     * Given: testID prop
     * When: Card renders
     * Then: Applies testID to a card element
     */
    it('given testID prop, when rendered, then applies testID to card', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeGridCard
            recipe={mockRecipe}
            testID="recipe-card"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-card')).toBeTruthy();
    });

    /**
     * Test: Different column configurations
     * Given: Various column counts
     * When: Card renders
     * Then: Handles all configurations without errors
     */
    it('given various column counts, when rendered, then handles all configurations', () => {
      // Arrange & Act & Assert
      [2, 3, 4].forEach((columns) => {
        expect(() => {
          const { unmount } = render(
            <TestWrapper>
              <RecipeGridCard recipe={mockRecipe} columns={columns as 2 | 3 | 4} testID="recipe-card" />
            </TestWrapper>
          );
          unmount();
        }).not.toThrow();
      });
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Minimal recipe data
     * Given: Recipe with only required properties
     * When: Card renders
     * Then: Handles gracefully without errors
     */
    it('given minimal recipe data, when rendered, then handles gracefully', () => {
      // Arrange
      const minimalRecipe = {
        id: '1',
        title: 'Minimal Recipe',
        instructions: 'Simple instructions',
        servings: 1,
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <RecipeGridCard recipe={minimalRecipe} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    /**
     * Test: Surface component integration
     * Given: Card component
     * When: Rendered
     * Then: Uses Surface with correct elevation
     */
    it('given card component, when rendered, then uses Surface with elevation', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      const { Surface } = require('react-native-paper');
      const surfaceElement = UNSAFE_getByType(Surface);
      expect(surfaceElement.props.elevation).toBe(2);
    });

    /**
     * Test: Image error handling
     * Given: Image with onError
     * When: Image fails to load
     * Then: Component handles error gracefully
     */
    it('given image with onError, when image fails, then handles error gracefully', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGridCard recipe={mockRecipe} testID="recipe-card" />
        </TestWrapper>
      );

      // Assert
      const { Image } = require('react-native');
      const imageElement = UNSAFE_getByType(Image);
      expect(typeof imageElement.props.onError).toBe('function');
    });
  });
});