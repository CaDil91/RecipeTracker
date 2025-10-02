import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Searchbar, Divider, FAB } from 'react-native-paper';
import { RecipeResponseDto } from '../../../lib/shared';
import { RecipeCard } from './RecipeCard';
import { EmptyState } from '../feedback/EmptyState';
import { LoadingIndicator } from '../feedback/LoadingIndicator';

export interface RecipeListProps {
  recipes: RecipeResponseDto[];
  onRecipePress?: (recipe: RecipeResponseDto) => void;
  onRecipeEdit?: (recipe: RecipeResponseDto) => void;
  onRecipeDelete?: (recipe: RecipeResponseDto) => void;
  onAddRecipe?: () => void;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
  isRefreshing?: boolean;
  searchable?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  testID?: string;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onRecipePress,
  onRecipeEdit,
  onRecipeDelete,
  onAddRecipe,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  searchable = true,
  emptyTitle = 'No recipes found',
  emptyMessage = 'Add your first recipe to get started!',
  testID = 'recipe-list',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = searchQuery
    ? recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.instructions?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : recipes;

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  if (isLoading && recipes.length === 0) {
    return <LoadingIndicator fullScreen message="Loading recipes..." />;
  }

  const renderItem = ({ item }: { item: RecipeResponseDto }) => (
    <RecipeCard
      recipe={item}
      onPress={onRecipePress ? () => onRecipePress(item) : undefined}
      onEdit={onRecipeEdit ? () => onRecipeEdit(item) : undefined}
      onDelete={onRecipeDelete ? () => onRecipeDelete(item) : undefined}
      testID={`${testID}-item-${item.id}`}
    />
  );

  const ListHeaderComponent = searchable ? (
    <Searchbar
      placeholder="Search recipes..."
      onChangeText={setSearchQuery}
      value={searchQuery}
      style={styles.searchBar}
      testID={`${testID}-search`}
    />
  ) : null;

  const ListEmptyComponent = (
    <EmptyState
      title={searchQuery ? 'No recipes match your search' : emptyTitle}
      message={searchQuery ? 'Try adjusting your search terms' : emptyMessage}
      icon="book-open-variant"
      actionLabel={!searchQuery && onAddRecipe ? 'Add Recipe' : undefined}
      onAction={!searchQuery ? onAddRecipe : undefined}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredRecipes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ItemSeparatorComponent={() => <Divider />}
        contentContainerStyle={[
          styles.listContent,
          filteredRecipes.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          ) : undefined
        }
        testID={testID}
      />
      
      {onAddRecipe && filteredRecipes.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={onAddRecipe}
          testID={`${testID}-fab`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});