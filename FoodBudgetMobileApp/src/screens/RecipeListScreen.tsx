import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { FAB, useTheme, Snackbar, ActivityIndicator, Button, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { InteractionStatus } from '@azure/msal-browser';
import { RecipeListScreenNavigationProp } from '../types/navigation';
import { Container } from '../components/shared';
import { RecipeResponseDto } from '../lib/shared';
import SearchBar from '../components/SearchBar';
import FilterChips, { FilterType } from '../components/FilterChips';
import { RecipeGrid } from '../components/shared/recipe/RecipeGrid';
import { RecipeService } from '../lib/shared';
import { useDeleteRecipe } from '../hooks/useRecipeMutations';
import { useAuth } from '../hooks/useAuth';

// TODO: Move grid column selection (2/3/4) to a Settings menu/screen
type GridColumns = 2 | 3 | 4;

type RecipeListScreenProps = {
  navigation: RecipeListScreenNavigationProp;
};

// Main screen component for displaying and managing recipes
const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  // Authentication state - needed to prevent race condition with token acquisition
  const { isAuthenticated, inProgress } = useAuth();

  // 🔍 DEBUG - Check auth state (remove after fixing)
  console.log('🔍 RecipeListScreen Auth State:', {
    isAuthenticated,
    inProgress,
    inProgressType: typeof inProgress,
    inProgressValue: String(inProgress),
    InteractionStatusNone: InteractionStatus.None,
    comparison: inProgress === InteractionStatus.None,
    shouldQueryRun: isAuthenticated && inProgress === InteractionStatus.None,
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [gridColumns] = useState<GridColumns>(2);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    action?: { label: string; onPress: () => void };
  } | null>(null);

  // Story 12a: Optimistic delete mutation hook
  const deleteMutation = useDeleteRecipe();

  // Fetch recipes using TanStack Query
  const queryEnabled = isAuthenticated && inProgress === InteractionStatus.None;
  console.log('🔍 Query enabled:', queryEnabled); // Debug

  const {
    data: recipesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      console.log('🚀 Query executing - this should NOT happen until token ready!');
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
    enabled: queryEnabled, // Wait for token acquisition
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
    // Navigate to the RecipeDetail screen in VIEW mode
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  }, [navigation]);

  const handleRecipeEdit = useCallback((recipe: RecipeResponseDto) => {
    console.log('Edit recipe:', recipe);
    // TODO: Story 10 - Navigate to RecipeDetail screen in EDIT mode
    // navigation.navigate('RecipeDetail', { recipeId: recipe.id, mode: 'EDIT' });
  }, [navigation]);

  // Story 12a: Optimistic delete handler with retry support
  const handleRecipeDelete = useCallback((recipe: RecipeResponseDto) => {
    const performDelete = async () => {
      try {
        await deleteMutation.mutateAsync(recipe.id);
        setSnackbar({
          message: 'Recipe deleted successfully',
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete recipe';
        setSnackbar({
          message: errorMessage,
          action: {
            label: 'Retry',
            onPress: performDelete,
          },
        });
      }
    };

    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ],
    );
  }, [deleteMutation]);

  const handleAddRecipe = useCallback(() => {
    // Navigate to the RecipeDetail screen in CREATE mode (no recipeId)
    navigation.navigate('RecipeDetail', {});
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    void refetch();
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 24,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
  });

  // Error state
  if (error) {
    const errorMessage = error.message;
    return (
      <Container padded={false} useSafeArea={false}>
        <View style={styles.errorContainer}>
          <Text
            style={styles.errorText}
            testID="recipe-list-error"
          >
            {errorMessage}
          </Text>
          <Button
            mode="contained"
            onPress={() => void refetch()}
            testID="recipe-list-retry-button"
          >
            Retry
          </Button>
        </View>
      </Container>
    );
  }

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
              testID="recipe-list-loading"
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
          visible={!!snackbar}
          onDismiss={() => setSnackbar(null)}
          duration={snackbar?.action ? 5000 : 3000}
          style={{ backgroundColor: theme.colors.inverseSurface }}
          action={
            snackbar?.action || {
              label: 'Dismiss',
              labelStyle: { color: theme.colors.inverseOnSurface },
              onPress: () => setSnackbar(null),
            }
          }
        >
          {snackbar?.message}
        </Snackbar>
      </Container>
    </>
  );
};

export default RecipeListScreen;