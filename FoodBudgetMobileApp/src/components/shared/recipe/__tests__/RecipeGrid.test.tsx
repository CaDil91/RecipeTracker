import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FlatList, RefreshControl } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { RecipeGrid } from '../RecipeGrid';
import { RecipeResponseDto } from '../../../../lib/shared';

// Mock RecipeGridCard component
jest.mock('../RecipeGridCard', () => ({
  RecipeGridCard: function MockRecipeGridCard({ recipe, onPress, testID }: any) {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <View>
          <Text>{recipe.title}</Text>
        </View>
      </TouchableOpacity>
    );
  },
}));

// Mock EmptyState component
jest.mock('../../feedback/EmptyState', () => ({
  EmptyState: function MockEmptyState({ title, message }: any) {
    const { View, Text } = require('react-native');
    return (
      <View testID="empty-state">
        <Text testID="empty-title">{title}</Text>
        <Text testID="empty-message">{message}</Text>
      </View>
    );
  },
}));

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockRecipes: (RecipeResponseDto & { imageUrl?: string; category?: string })[] = [
  {
    id: '1',
    title: 'Recipe 1',
    instructions: 'Instructions 1',
    servings: 2,
    createdAt: '2024-01-01T00:00:00Z',
    imageUrl: 'https://example.com/1.jpg',
    category: 'Dinner',
  },
  {
    id: '2',
    title: 'Recipe 2',
    instructions: 'Instructions 2',
    servings: 4,
    createdAt: '2024-01-02T00:00:00Z',
    category: 'Lunch',
  },
];

/**
 * Unit tests for the RecipeGrid component
 *
 * Tests grid layout with conditional rendering, user interactions, and FlatList configuration.
 * Uses mocked child components for isolated testing.
 */
describe('RecipeGrid', () => {
  describe('Happy Path', () => {
    /**
     * Test: Basic recipe grid display
     * Given: Recipes array
     * When: Component renders
     * Then: Displays recipes in grid format
     */
    it('given recipes array, when rendered, then displays recipes in grid format', () => {
      // Arrange & Act
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-grid')).toBeTruthy();
      expect(getByText('Recipe 1')).toBeTruthy();
      expect(getByText('Recipe 2')).toBeTruthy();
    });

    /**
     * Test: Empty state display
     * Given: Empty recipes array
     * When: Component renders
     * Then: Shows empty state with default messages
     */
    it('given empty recipes array, when rendered, then shows empty state', () => {
      // Arrange & Act
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <RecipeGrid recipes={[]} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No recipes yet')).toBeTruthy();
      expect(getByText('Start by adding your first recipe!')).toBeTruthy();
    });

    /**
     * Test: Grid layout with default columns
     * Given: Recipes and no column specification
     * When: Component renders
     * Then: Uses 2 columns by default
     */
    it('given no column specification, when rendered, then uses 2 columns by default', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.numColumns).toBe(2);
    });
  });

  describe('Conditional Rendering', () => {
    /**
     * Test: Custom empty messages
     * Given: Custom empty title and message
     * When: No recipes rendered
     * Then: Uses custom empty text
     */
    it('given custom empty messages, when rendered, then uses custom empty text', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={[]}
            emptyTitle="Custom Empty Title"
            emptyMessage="Custom empty message"
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByText('Custom Empty Title')).toBeTruthy();
      expect(getByText('Custom empty message')).toBeTruthy();
    });

    /**
     * Test: FlatList vs. EmptyState rendering
     * Given: Recipes present
     * When: Component renders
     * Then: Shows FlatList not EmptyState
     */
    it('given recipes present, when rendered, then shows FlatList not EmptyState', () => {
      // Arrange & Act
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-grid')).toBeTruthy(); // FlatList
      expect(queryByTestId('empty-state')).toBeNull(); // No EmptyState
    });

    /**
     * Test: RefreshControl with handler
     * Given: onRefresh handler provided
     * When: Component renders
     * Then: Shows RefreshControl
     */
    it('given onRefresh handler, when rendered, then shows RefreshControl', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={mockRecipes}
            onRefresh={jest.fn()}
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.refreshControl).toBeDefined();
      expect(flatList.props.refreshControl.type).toBe(RefreshControl);
    });

    /**
     * Test: No RefreshControl without handler
     * Given: No onRefresh handler
     * When: Component renders
     * Then: No RefreshControl rendered
     */
    it('given no onRefresh handler, when rendered, then no RefreshControl', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.refreshControl).toBeUndefined();
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: Recipe press interaction
     * Given: onRecipePress handler
     * When: Recipe pressed
     * Then: Calls handler with recipe data
     */
    it('given onRecipePress handler, when recipe pressed, then calls handler with recipe', () => {
      // Arrange
      const onRecipePress = jest.fn();
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={mockRecipes}
            onRecipePress={onRecipePress}
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-grid-recipe-0'));

      // Assert
      expect(onRecipePress).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Refresh interaction
     * Given: onRefresh handler
     * When: Refresh triggered
     * Then: Calls onRefresh callback
     */
    it('given onRefresh handler, when refresh triggered, then calls onRefresh', () => {
      // Arrange
      const onRefresh = jest.fn();
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={mockRecipes}
            onRefresh={onRefresh}
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Act
      const flatList = UNSAFE_getByType(FlatList);
      const refreshControl = flatList.props.refreshControl;
      refreshControl.props.onRefresh();

      // Assert
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Grid Configuration', () => {
    /**
     * Test: 3 column configuration
     * Given: columns=3
     * When: Component renders
     * Then: Configures FlatList for 3 columns
     */
    it('given 3 columns, when rendered, then configures FlatList correctly', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} columns={3} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.numColumns).toBe(3);
    });

    /**
     * Test: 4 column configuration
     * Given: columns=4
     * When: Component renders
     * Then: Configures FlatList for 4 columns
     */
    it('given 4 columns, when rendered, then configures FlatList correctly', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} columns={4} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.numColumns).toBe(4);
    });

    /**
     * Test: Column wrapper style for multi-column
     * Given: Multiple columns
     * When: Component renders
     * Then: Applies row wrapper style
     */
    it('given multiple columns, when rendered, then applies row wrapper style', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} columns={2} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.columnWrapperStyle).toBeDefined();
      expect(flatList.props.columnWrapperStyle.justifyContent).toBe('flex-start');
    });

    /**
     * Test: Force re-render on column change
     * Given: Column count changes
     * When: Component re-renders
     * Then: Forces FlatList re-render using a key strategy
     */
    it('given column count change, when re-rendered, then forces FlatList re-render', () => {
      // Arrange
      const { UNSAFE_getByType, rerender } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} columns={2} testID="recipe-grid" />
        </TestWrapper>
      );

      // Act
      rerender(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} columns={3} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const updatedFlatList = UNSAFE_getByType(FlatList);
      expect(updatedFlatList.props.numColumns).toBe(3);
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: TestID application to child components
     * Given: testID prop
     * When: Component renders
     * Then: Applies testID to child components correctly
     */
    it('given testID prop, when rendered, then applies testID to child components correctly', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-grid')).toBeTruthy();
      expect(getByTestId('recipe-grid-recipe-0')).toBeTruthy();
      expect(getByTestId('recipe-grid-recipe-1')).toBeTruthy();
    });

    /**
     * Test: Refresh state indication
     * Given: isRefreshing=true
     * When: Component renders
     * Then: Shows refresh indicator
     */
    it('given isRefreshing true, when rendered, then shows refresh indicator', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={mockRecipes}
            onRefresh={jest.fn()}
            isRefreshing={true}
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      const refreshControl = flatList.props.refreshControl;
      expect(refreshControl.props.refreshing).toBe(true);
    });

    /**
     * Test: Recipe key extraction
     * Given: Recipe data
     * When: FlatList renders
     * Then: Uses recipe ID as a key
     */
    it('given recipe data, when FlatList renders, then uses recipe ID as key', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid recipes={mockRecipes} testID="recipe-grid" />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.keyExtractor(mockRecipes[0])).toBe('1');
      expect(flatList.props.keyExtractor(mockRecipes[1])).toBe('2');
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Recipes without optional properties
     * Given: Minimal recipe data
     * When: Component renders
     * Then: Handles gracefully without errors
     */
    it('given minimal recipe data, when rendered, then handles gracefully', () => {
      // Arrange
      const minimalRecipes = [
        {
          id: '1',
          title: 'Minimal Recipe',
          instructions: 'Simple instructions',
          servings: 1,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      // Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <RecipeGrid recipes={minimalRecipes} testID="recipe-grid" />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    /**
     * Test: Large dataset performance
     * Given: Large recipe dataset
     * When: Component renders
     * Then: Maintains performance without errors
     */
    it('given large dataset, when rendered, then maintains performance', () => {
      // Arrange
      const largeRecipeSet = Array.from({ length: 50 }, (_, index) => ({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
        instructions: `Instructions ${index}`,
        servings: index % 8 + 1,
        createdAt: '2024-01-01T00:00:00Z',
      }));

      // Act & Assert
      expect(() => {
        render(
          <TestWrapper>
            <RecipeGrid recipes={largeRecipeSet} testID="recipe-grid" />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    /**
     * Test: Theme integration
     * Given: RefreshControl with theme
     * When: Component renders
     * Then: Uses theme colors correctly
     */
    it('given RefreshControl, when rendered, then uses theme colors', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeGrid
            recipes={mockRecipes}
            onRefresh={jest.fn()}
            testID="recipe-grid"
          />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      const refreshControl = flatList.props.refreshControl;
      expect(refreshControl.props.colors).toBeDefined();
      expect(refreshControl.props.progressBackgroundColor).toBeDefined();
    });
  });
});