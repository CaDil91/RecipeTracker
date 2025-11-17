import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Surface, useTheme } from 'react-native-paper';
import { spacing } from '../theme/typography';

interface RecipeDetailHeaderProps {
  mode: 'view' | 'edit' | 'create';
  onBack: () => void;
  onDelete?: () => void;
  testID?: string;
}

/**
 * RecipeDetailHeader Component
 *
 * Unified header for RecipeDetailScreen across all modes (VIEW/EDIT/CREATE).
 * - All modes: Back button
 * - VIEW and EDIT modes: Delete button
 * - CREATE mode: Back button only
 */
export const RecipeDetailHeader: React.FC<RecipeDetailHeaderProps> = ({
  mode,
  onBack,
  onDelete,
  testID = 'recipe-detail',
}) => {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: theme.colors.surface,
      elevation: 2,
    },
    spacer: {
      flex: 1,
    },
  }), [theme]);

  return (
    <Surface style={styles.header}>
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={onBack}
        testID={`${testID}-back-button`}
        accessibilityLabel="Go back to recipe list"
        accessibilityRole="button"
      />
      <View style={styles.spacer} />
      {mode !== 'create' && onDelete && (
        <IconButton
          icon="delete"
          size={24}
          onPress={onDelete}
          testID={`${testID}-delete-button`}
          accessibilityLabel="Delete recipe"
          accessibilityRole="button"
        />
      )}
    </Surface>
  );
};