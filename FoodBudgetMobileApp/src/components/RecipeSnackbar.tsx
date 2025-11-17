import React, { useMemo } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';

interface RecipeSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  testID?: string;
}

/**
 * RecipeSnackbar Component
 *
 * Reusable snackbar for displaying success/error messages in the RecipeDetailScreen.
 * Styled with inverse surface colors for proper Material Design 3 contrast.
 */
export const RecipeSnackbar: React.FC<RecipeSnackbarProps> = ({
  visible,
  message,
  onDismiss,
  duration = 3000,
  testID = 'recipe-snackbar',
}) => {
  const theme = useTheme();

  // Memoize style to avoid recreating on every render
  const snackbarStyle = useMemo(() => ({
    backgroundColor: theme.colors.inverseSurface,
  }), [theme]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={snackbarStyle}
      action={{
        label: 'Dismiss',
        labelStyle: { color: theme.colors.inverseOnSurface },
        // onPress not needed - Snackbar auto-dismisses on action press
      }}
      testID={testID}
    >
      {message}
    </Snackbar>
  );
};