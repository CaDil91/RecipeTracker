import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { RecipeList } from '../RecipeList';
import { RecipeResponseDto } from '../../../../lib/shared';

// Mock child components
jest.mock('../RecipeCard', () => ({
  RecipeCard: function MockRecipeCard({
    recipe,
    onPress,
    onEdit,
    onDelete,
    testID,
  }: any) {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID={testID}>
        <Text>{recipe.title}</Text>
        {onPress && (
          <TouchableOpacity testID={`${testID}-press`} onPress={onPress}>
            <Text>View</Text>
          </TouchableOpacity>
        )}
        {onEdit && (
          <TouchableOpacity testID={`${testID}-edit`} onPress={onEdit}>
            <Text>Edit</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity testID={`${testID}-delete`} onPress={onDelete}>
            <Text>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
}));

jest.mock('../../feedback/EmptyState', () => ({
  EmptyState: function MockEmptyState({
    title,
    message,
    actionLabel,
    onAction,
  }: any) {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="empty-state">
        <Text testID="empty-title">{title}</Text>
        <Text testID="empty-message">{message}</Text>
        {actionLabel && onAction && (
          <TouchableOpacity testID="empty-action" onPress={onAction}>
            <Text>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
}));

jest.mock('../../feedback/LoadingIndicator', () => ({
  LoadingIndicator: function MockLoadingIndicator({ message }: any) {
    const { View, Text } = require('react-native');
    return (
      <View testID="loading-indicator">
        <Text>{message}</Text>
      </View>
    );
  },
}));

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockRecipes: RecipeResponseDto[] = [
  {
    id: '1',
    title: 'Pasta Carbonara',
    instructions: 'Cook pasta, mix with eggs and cheese',
    servings: 4,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Chicken Curry',
    instructions: 'Marinate chicken, cook with spices',
    servings: 6,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Chocolate Cake',
    instructions: 'Mix ingredients, bake in oven',
    servings: 8,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

/**
 * Unit tests for the RecipeList component
 *
 * Tests a recipe list with search, loading states, and user interactions.
 * Uses mocked child components for isolated testing.
 */
describe('RecipeList', () => {
  const mockOnRecipePress = jest.fn();
  const mockOnRecipeEdit = jest.fn();
  const mockOnRecipeDelete = jest.fn();
  const mockOnAddRecipe = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    /**
     * Test: Basic recipe list rendering
     * Given: RecipeList with recipes
     * When: Component renders
     * Then: Displays all recipes in list format
     */
    it('given recipes array, when rendered, then displays all recipes', () => {
      // Arrange & Act
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-list')).toBeTruthy();
      expect(getByText('Pasta Carbonara')).toBeTruthy();
      expect(getByText('Chicken Curry')).toBeTruthy();
      expect(getByText('Chocolate Cake')).toBeTruthy();
    });

    /**
     * Test: Recipe list with search functionality
     * Given: RecipeList with searchable=true
     * When: Component renders
     * Then: Displays search bar
     */
    it('given searchable true, when rendered, then displays search bar', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={true} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-list-search')).toBeTruthy();
    });

    /**
     * Test: Recipe list with all handlers
     * Given: RecipeList with all event handlers
     * When: Component renders
     * Then: Displays interactive elements
     */
    it('given all event handlers, when rendered, then displays interactive elements', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList
            recipes={mockRecipes}
            onRecipePress={mockOnRecipePress}
            onRecipeEdit={mockOnRecipeEdit}
            onRecipeDelete={mockOnRecipeDelete}
            onAddRecipe={mockOnAddRecipe}
          />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-list-fab')).toBeTruthy();
      expect(getByTestId('recipe-list-item-1-press')).toBeTruthy();
      expect(getByTestId('recipe-list-item-1-edit')).toBeTruthy();
      expect(getByTestId('recipe-list-item-1-delete')).toBeTruthy();
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Search functionality
     * Given: RecipeList with search enabled
     * When: User searches for "pasta"
     * Then: Filters recipes containing "pasta"
     */
    it('given search enabled, when user searches pasta, then filters recipes', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={true} />
        </TestWrapper>
      );

      // Act
      fireEvent.changeText(getByTestId('recipe-list-search'), 'pasta');

      // Assert
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
        expect(queryByText('Chicken Curry')).toBeNull();
        expect(queryByText('Chocolate Cake')).toBeNull();
      });
    });

    /**
     * Test: Search in instructions
     * Given: RecipeList with search enabled
     * When: User searches for text in instructions
     * Then: Filters recipes by instruction content
     */
    it('given search enabled, when searching instructions, then filters by instructions', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={true} />
        </TestWrapper>
      );

      // Act
      fireEvent.changeText(getByTestId('recipe-list-search'), 'spices');

      // Assert
      await waitFor(() => {
        expect(getByText('Chicken Curry')).toBeTruthy();
        expect(queryByText('Pasta Carbonara')).toBeNull();
        expect(queryByText('Chocolate Cake')).toBeNull();
      });
    });

    /**
     * Test: Loading state with empty recipes
     * Given: RecipeList with isLoading=true and empty recipes
     * When: Component renders
     * Then: Shows loading indicator
     */
    it('given loading true and empty recipes, when rendered, then shows loading', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={[]} isLoading={true} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    /**
     * Test: Loading state with existing recipes
     * Given: RecipeList with isLoading=true and existing recipes
     * When: Component renders
     * Then: Shows recipes (not loading indicator)
     */
    it('given loading true with existing recipes, when rendered, then shows recipes', () => {
      // Arrange & Act
      const { queryByTestId, getByText } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} isLoading={true} />
        </TestWrapper>
      );

      // Assert
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Pasta Carbonara')).toBeTruthy();
    });

    /**
     * Test: Empty state without search
     * Given: RecipeList with empty recipes
     * When: Component renders without search
     * Then: Shows empty state with add action
     */
    it('given empty recipes without search, when rendered, then shows empty state with action', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={[]} onAddRecipe={mockOnAddRecipe} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByTestId('empty-action')).toBeTruthy();
    });

    /**
     * Test: Empty search results
     * Given: RecipeList with active search yielding no results
     * When: Component renders
     * Then: Shows search-specific empty state
     */
    it('given active search with no results, when rendered, then shows search empty state', async () => {
      // Arrange
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={true} />
        </TestWrapper>
      );

      // Act
      fireEvent.changeText(getByTestId('recipe-list-search'), 'nonexistent');

      // Assert
      await waitFor(() => {
        expect(getByText('No recipes match your search')).toBeTruthy();
        expect(getByText('Try adjusting your search terms')).toBeTruthy();
      });
    });

    /**
     * Test: FAB visibility with recipes
     * Given: RecipeList with recipes and onAddRecipe
     * When: Component renders
     * Then: Shows FAB button
     */
    it('given recipes and onAddRecipe, when rendered, then shows FAB', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onAddRecipe={mockOnAddRecipe} />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('recipe-list-fab')).toBeTruthy();
    });

    /**
     * Test: FAB visibility without recipes
     * Given: RecipeList with empty recipes and onAddRecipe
     * When: Component renders
     * Then: Hides FAB button
     */
    it('given empty recipes and onAddRecipe, when rendered, then hides FAB', () => {
      // Arrange & Act
      const { queryByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={[]} onAddRecipe={mockOnAddRecipe} />
        </TestWrapper>
      );

      // Assert
      expect(queryByTestId('recipe-list-fab')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: Recipe press interaction
     * Given: RecipeList with onRecipePress handler
     * When: Recipe pressed
     * Then: Calls handler with recipe data
     */
    it('given onRecipePress handler, when recipe pressed, then calls handler', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onRecipePress={mockOnRecipePress} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-list-item-1-press'));

      // Assert
      expect(mockOnRecipePress).toHaveBeenCalledWith(mockRecipes[0]);
    });

    /**
     * Test: Recipe edit interaction
     * Given: RecipeList with onRecipeEdit handler
     * When: Edit button pressed
     * Then: Calls handler with recipe data
     */
    it('given onRecipeEdit handler, when edit pressed, then calls handler', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onRecipeEdit={mockOnRecipeEdit} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-list-item-2-edit'));

      // Assert
      expect(mockOnRecipeEdit).toHaveBeenCalledWith(mockRecipes[1]);
    });

    /**
     * Test: Recipe delete interaction
     * Given: RecipeList with onRecipeDelete handler
     * When: Delete button pressed
     * Then: Calls handler with recipe data
     */
    it('given onRecipeDelete handler, when delete pressed, then calls handler', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onRecipeDelete={mockOnRecipeDelete} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-list-item-3-delete'));

      // Assert
      expect(mockOnRecipeDelete).toHaveBeenCalledWith(mockRecipes[2]);
    });

    /**
     * Test: FAB interaction
     * Given: RecipeList with onAddRecipe handler
     * When: FAB pressed
     * Then: Calls onAddRecipe handler
     */
    it('given onAddRecipe handler, when FAB pressed, then calls handler', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onAddRecipe={mockOnAddRecipe} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('recipe-list-fab'));

      // Assert
      expect(mockOnAddRecipe).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Empty state action
     * Given: Empty RecipeList with onAddRecipe handler
     * When: Empty state action pressed
     * Then: Calls onAddRecipe handler
     */
    it('given empty state with action, when action pressed, then calls onAddRecipe', () => {
      // Arrange
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={[]} onAddRecipe={mockOnAddRecipe} />
        </TestWrapper>
      );

      // Act
      fireEvent.press(getByTestId('empty-action'));

      // Assert
      expect(mockOnAddRecipe).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Refresh interaction
     * Given: RecipeList with onRefresh handler
     * When: Refresh triggered
     * Then: Calls onRefresh handler
     */
    it('given onRefresh handler, when refresh triggered, then calls handler', async () => {
      // Arrange
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeList
            recipes={mockRecipes}
            onRefresh={mockOnRefresh}
            isRefreshing={false}
          />
        </TestWrapper>
      );

      // Act
      const flatList = UNSAFE_getByType(FlatList);
      const refreshControl = flatList.props.refreshControl;
      await refreshControl.props.onRefresh();

      // Assert
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conditional Rendering', () => {
    /**
     * Test: Search bar without searchable
     * Given: RecipeList with searchable=false
     * When: Component renders
     * Then: Hides search bar
     */
    it('given searchable false, when rendered, then hides search bar', () => {
      // Arrange & Act
      const { queryByTestId } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={false} />
        </TestWrapper>
      );

      // Assert
      expect(queryByTestId('recipe-list-search')).toBeNull();
    });

    /**
     * Test: RefreshControl with handler
     * Given: RecipeList with onRefresh handler
     * When: Component renders
     * Then: Includes RefreshControl
     */
    it('given onRefresh handler, when rendered, then includes RefreshControl', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onRefresh={mockOnRefresh} />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.refreshControl).toBeDefined();
    });

    /**
     * Test: No RefreshControl without handler
     * Given: RecipeList without onRefresh handler
     * When: Component renders
     * Then: No RefreshControl included
     */
    it('given no onRefresh handler, when rendered, then no RefreshControl', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.refreshControl).toBeUndefined();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Custom empty messages
     * Given: RecipeList with custom empty title and message
     * When: Rendered with empty recipes
     * Then: Uses custom empty messages
     */
    it('given custom empty messages, when rendered empty, then uses custom messages', () => {
      // Arrange & Act
      const { getByText } = render(
        <TestWrapper>
          <RecipeList
            recipes={[]}
            emptyTitle="Custom Empty Title"
            emptyMessage="Custom empty message"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByText('Custom Empty Title')).toBeTruthy();
      expect(getByText('Custom empty message')).toBeTruthy();
    });

    /**
     * Test: TestID propagation
     * Given: RecipeList with custom testID
     * When: Component renders
     * Then: Applies testID to child elements
     */
    it('given custom testID, when rendered, then applies to child elements', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TestWrapper>
          <RecipeList
            recipes={mockRecipes}
            onAddRecipe={mockOnAddRecipe}
            searchable={true}
            testID="custom-list"
          />
        </TestWrapper>
      );

      // Assert
      expect(getByTestId('custom-list')).toBeTruthy();
      expect(getByTestId('custom-list-search')).toBeTruthy();
      expect(getByTestId('custom-list-fab')).toBeTruthy();
      expect(getByTestId('custom-list-item-1')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Case-insensitive search
     * Given: RecipeList with mixed case recipes
     * When: User searches with different case
     * Then: Performs case-insensitive filtering
     */
    it('given mixed case recipes, when searching different case, then filters case-insensitive', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} searchable={true} />
        </TestWrapper>
      );

      // Act
      fireEvent.changeText(getByTestId('recipe-list-search'), 'PASTA');

      // Assert
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
        expect(queryByText('Chicken Curry')).toBeNull();
      });
    });

    /**
     * Test: FlatList key extraction
     * Given: RecipeList with recipes
     * When: Component renders
     * Then: Uses recipe ID as a key
     */
    it('given recipes, when rendered, then uses recipe ID as key', () => {
      // Arrange & Act
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} />
        </TestWrapper>
      );

      // Assert
      const flatList = UNSAFE_getByType(FlatList);
      expect(flatList.props.keyExtractor(mockRecipes[0])).toBe('1');
      expect(flatList.props.keyExtractor(mockRecipes[1])).toBe('2');
    });

    /**
     * Test: Async refresh handling
     * Given: RecipeList with async onRefresh
     * When: Refresh triggered
     * Then: Handles async refresh correctly
     */
    it('given async onRefresh, when refresh triggered, then handles async', async () => {
      // Arrange
      const asyncRefresh = jest.fn().mockResolvedValue(undefined);
      const { UNSAFE_getByType } = render(
        <TestWrapper>
          <RecipeList recipes={mockRecipes} onRefresh={asyncRefresh} />
        </TestWrapper>
      );

      // Act
      const flatList = UNSAFE_getByType(FlatList);
      const refreshControl = flatList.props.refreshControl;
      await refreshControl.props.onRefresh();

      // Assert
      expect(asyncRefresh).toHaveBeenCalledTimes(1);
    });
  });
});