import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FAB, useTheme, Snackbar, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeListScreenNavigationProp } from '../types/navigation';
import { Container } from '../components/shared';
import { RecipeResponseDto } from '../lib/shared';
import SearchBar from '../components/SearchBar';
import FilterChips, { FilterType } from '../components/FilterChips';
import { RecipeGrid } from '../components/shared/recipe/RecipeGrid';
import { RecipeService } from '../lib/shared';

// TODO: Move grid column selection (2/3/4) to a Settings menu/screen
type GridColumns = 2 | 3 | 4;

type RecipeListScreenProps = {
  navigation: RecipeListScreenNavigationProp;
};

// Main screen component for displaying and managing recipes
const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [gridColumns, setGridColumns] = useState<GridColumns>(2);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  // Fetch recipes using TanStack Query
  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await RecipeService.getAllRecipes();
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to fetch recipes'
        );
      }
      return response.data;
    },
  });

  // Use an empty array if no data yet
  const recipes = recipesData || [];

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply category filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.instructions?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recipes, searchQuery, selectedFilter]);

  const handleRecipePress = useCallback((recipe: RecipeResponseDto) => {
    console.log('View recipe:', recipe);
    // TODO: Navigate to recipe detail screen when RecipeDetail screen is implemented
    // navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  }, [navigation]);

  const handleRecipeEdit = useCallback((recipe: RecipeResponseDto) => {
    console.log('Edit recipe:', recipe);
    // Navigate to Add tab for editing
    navigation.navigate('Add');
  }, [navigation]);

  // Delete mutation using TanStack Query
  const deleteMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await RecipeService.deleteRecipe(recipeId);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to delete recipe'
        );
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch recipes after successful deletion
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setSnackbarMessage('Recipe deleted successfully');
    },
    onError: (error) => {
      setSnackbarMessage(error.message || 'Failed to delete recipe');
    },
  });

  const handleRecipeDelete = useCallback((recipe: RecipeResponseDto) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(recipe.id),
        },
      ],
    );
  }, [deleteMutation]);

  const handleAddRecipe = useCallback(() => {
    // Navigate to the Add tab
    navigation.navigate('Add');
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Dynamic styles using theme
  const styles = StyleSheet.create({
    searchContainer: {
      backgroundColor: theme.colors.surface,
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
  });

  return (
    <>
      <Container padded={false} useSafeArea={false}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search recipes..."
            onClear={handleSearchClear}
            testID="recipe-search-bar"
          />
          <FilterChips
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            testID="recipe-filter-chips"
          />
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <RecipeGrid
            recipes={filteredRecipes}
            onRecipePress={handleRecipePress}
            onRecipeEdit={handleRecipeEdit}
            onRecipeDelete={handleRecipeDelete}
            onRefresh={handleRefresh}
            isRefreshing={isRefetching}
            columns={gridColumns}
            emptyTitle={searchQuery || selectedFilter !== 'All' ? 'No results found' : 'No recipes yet'}
            emptyMessage={
              searchQuery || selectedFilter !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first recipe!'
            }
            testID="recipe-grid"
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddRecipe}
          testID="fab-add-recipe"
        />

        <Snackbar
          visible={!!snackbarMessage}
          onDismiss={() => setSnackbarMessage(null)}
          duration={3000}
          style={{ backgroundColor: theme.colors.inverseSurface }}
          action={{
            label: 'Dismiss',
            labelStyle: { color: theme.colors.inverseOnSurface },
            onPress: () => setSnackbarMessage(null),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Container>
    </>
  );
};

export default RecipeListScreen;