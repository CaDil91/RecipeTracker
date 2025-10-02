import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RecipeResponseDto } from '../../../lib/shared';
import { RecipeGridCard } from './RecipeGridCard';
import { EmptyState } from '../feedback/EmptyState';

export interface RecipeGridProps {
  recipes: RecipeResponseDto[];
  onRecipePress?: (recipe: RecipeResponseDto) => void;
  onRecipeEdit?: (recipe: RecipeResponseDto) => void;
  onRecipeDelete?: (recipe: RecipeResponseDto) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  columns?: 2 | 3 | 4;
  emptyTitle?: string;
  emptyMessage?: string;
  testID?: string;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onRecipePress,
  onRecipeEdit,
  onRecipeDelete,
  onRefresh,
  isRefreshing = false,
  columns = 2,
  emptyTitle = 'No recipes yet',
  emptyMessage = 'Start by adding your first recipe!',
  testID,
}) => {
  const theme = useTheme();

  const renderRecipe = ({ item, index }: { item: RecipeResponseDto; index: number }) => (
    <RecipeGridCard
      recipe={item}
      onPress={() => onRecipePress?.(item)}
      onEdit={() => onRecipeEdit?.(item)}
      onDelete={() => onRecipeDelete?.(item)}
      columns={columns}
      testID={`${testID}-recipe-${index}`}
    />
  );

  if (recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      renderItem={renderRecipe}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      key={`grid-${columns}`} // Force re-render when columns change
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={{ height: 0 }} />} // Handled by card margins
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        ) : undefined
      }
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});