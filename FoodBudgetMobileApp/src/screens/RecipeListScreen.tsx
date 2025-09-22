import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';
import { RecipeListScreenNavigationProp } from '../types/navigation';
import { Container, RecipeList } from '../components/shared';
import { RecipeResponseDto } from '../lib/shared';
import SearchBar from '../components/SearchBar';
import FilterChips, { FilterType } from '../components/FilterChips';
import { placeholderRecipes, RecipeWithCategory } from '../data/mockRecipes';

type RecipeListScreenProps = {
  navigation: RecipeListScreenNavigationProp;
};

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<RecipeWithCategory[]>(placeholderRecipes);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply category filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.instructions?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [recipes, searchQuery, selectedFilter]);

  const handleRecipePress = useCallback((recipe: RecipeResponseDto) => {
    console.log('View recipe:', recipe);
    // TODO: Navigate to recipe detail screen
  }, []);

  const handleRecipeEdit = useCallback((recipe: RecipeResponseDto) => {
    console.log('Edit recipe:', recipe);
    // Navigate to Add tab for editing
    navigation.navigate('Add');
  }, [navigation]);

  const handleRecipeDelete = useCallback((recipe: RecipeResponseDto) => {
    console.log('Delete recipe:', recipe);
    // TODO: Implement delete confirmation and API call
    setRecipes(prev => prev.filter(r => r.id !== recipe.id));
  }, []);

  const handleAddRecipe = useCallback(() => {
    // Navigate to Add tab
    navigation.navigate('Add');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TODO: Fetch recipes from API
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="My Recipes" />
      </Appbar.Header>

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

        <RecipeList
          recipes={filteredRecipes}
          onRecipePress={handleRecipePress}
          onRecipeEdit={handleRecipeEdit}
          onRecipeDelete={handleRecipeDelete}
          onAddRecipe={handleAddRecipe}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          emptyTitle={searchQuery || selectedFilter !== 'All' ? 'No results found' : 'No recipes yet'}
          emptyMessage={
            searchQuery || selectedFilter !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first recipe!'
          }
        />

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleAddRecipe}
          testID="fab-add-recipe"
        />
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: 'transparent',
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default RecipeListScreen;