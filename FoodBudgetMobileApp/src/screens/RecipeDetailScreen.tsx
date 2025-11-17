/**
 * RecipeDetailScreen - Unified screen for viewing, editing, and creating recipes
 *
 * VIEW Mode Features:
 * - Display recipe details with Material Design 3 styling
 * - Loading and error states with accessibility support
 * - TanStack Query integration for data fetching
 * - Responsive layout with scrolling support
 * - Conditional rendering for optional fields (image, category, instructions)
 * - Edit FAB to transition to EDIT mode
 * - Delete button in header with confirmation dialog
 */
import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, useTheme, FAB } from 'react-native-paper';
import { RecipeDetailScreenNavigationProp, RecipeDetailScreenRouteProp } from '../types/navigation';
import { RecipeService, RecipeRequestDto } from '../lib/shared';
import { RecipeForm, RecipeFormRef } from '../components/shared';
import { RecipeDetailHeader } from '../components/RecipeDetailHeader';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { CancelConfirmationDialog } from '../components/CancelConfirmationDialog';
import { RecipeSnackbar } from '../components/RecipeSnackbar';
import { useSaveRecipeWithImage } from '../hooks/useSaveRecipeWithImage';
import type { CompressedImageResult } from '../utils/imageCompression';
import { useAuth } from '../hooks/useAuth';
import { spacing } from '../theme/typography';

type RecipeDetailScreenProps = {
  navigation: RecipeDetailScreenNavigationProp;
  route?: RecipeDetailScreenRouteProp; // Optional for test scenarios
};

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    padding: spacing.md,
  },
});

/**
 * RecipeDetailScreen Component
 *
 * Mode Management:
 * - recipeId present → VIEW mode (read-only)
 * - recipeId absent → CREATE mode (editable)
 * - User taps Edit FAB in VIEW → EDIT mode (internal state change)
 */
const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ navigation, route }) => {
  // 1. Props destructuring
  const routeParams = route?.params || {};
  const { recipeId } = routeParams;

  // 2. Context hooks
  const { isAuthenticated, isTokenReady } = useAuth();
  const theme = useTheme();
  const queryClient = useQueryClient();
  
  // 3. State hooks 
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [compressedImage, setCompressedImage] = useState<CompressedImageResult | null>(null);
  
  // 4. Refs
  const recipeFormRef = useRef<RecipeFormRef>(null);
  
  // 5. Derived values
  const currentMode: 'view' | 'edit' | 'create' =
    !recipeId ? 'create' :
    isEditing ? 'edit' :
    'view';
  
  // 6. Query hooks
  const {
    data: recipeResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      if (!recipeId) {
        throw new Error('Recipe ID is required');
      }
      const response = await RecipeService.getRecipeById(recipeId);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to fetch recipe'
        );
      }
      return response.data;
    },
    enabled: !!recipeId && isAuthenticated && isTokenReady,
  });

  const recipe = recipeResponse;
  
  // 7. Mutation hooks
  const saveMutation = useSaveRecipeWithImage();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!recipeId) {
        throw new Error('Recipe ID is required for delete');
      }
      const response = await RecipeService.deleteRecipe(recipeId);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to delete recipe'
        );
      }
    },
    onSuccess: () => {
      // Show a success message
      setSnackbarMessage('Recipe deleted successfully!');
      setSnackbarVisible(true);

      // Invalidate recipe list cache
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Navigate back to the list
      navigation.goBack();
    },
    onError: (error: Error) => {
      // Show error message (stay on screen)
      setSnackbarMessage(error.message || 'Failed to delete recipe. Please try again.');
      setSnackbarVisible(true);
    },
  });
  
  // 8. Memoized values
  const dynamicColors = useMemo(() => ({
    background: theme.colors.background,
    error: theme.colors.error,
    primary: theme.colors.primary,
  }), [theme]);
  
  // 9. Event handlers
  const handleCreateSubmit = async (data: RecipeRequestDto) => {
    try {
      // Use mutateAsync to wait for real ID before navigation
      // Sequential: upload image → save recipe with imageUrl
      const createdRecipe = await saveMutation.mutateAsync({
        recipe: data,
        image: compressedImage || undefined,
      });
      setSnackbarMessage('Recipe created successfully!');
      setSnackbarVisible(true);
      // Navigate with real ID from server (not temp ID)
      navigation.navigate('RecipeDetail', { recipeId: createdRecipe.id });
    } catch (error) {
      // Error snackbar (user stays in CREATE mode to allow retry)
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to create recipe. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
      // Note: Stays in CREATE mode to allow retry
    }
  };

  // Update with image upload (sequential: upload → save)
  const handleEditSubmit = async (data: RecipeRequestDto) => {
    if (!recipeId) return;

    try {
      // Sequential: upload image → update recipe with imageUrl
      await saveMutation.mutateAsync({
        recipeId,
        recipe: data,
        image: compressedImage || undefined,
      });
      setSnackbarMessage('Recipe updated successfully!');
      setSnackbarVisible(true);
      setIsEditing(false); // Return to VIEW mode after a successful update
    } catch (error) {
      // Error snackbar with the original error message (preserves existing behavior)
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update recipe. Please try again.';
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
      // Note: Stays in EDIT mode to allow retry
    }
  };

  // Handle cancel in EDIT mode - receives hasChanges from RecipeForm
  const handleEditCancel = (hasChanges: boolean) => {
    if (hasChanges) {
      // Show a confirmation dialog if there are unsaved changes
      setShowCancelDialog(true);
    } else {
      // Return to VIEW mode immediately if no changes
      setIsEditing(false);
    }
  };

  // Confirm cancellation (discard changes)
  const confirmCancel = () => {
    setShowCancelDialog(false);
    setIsEditing(false);
  };

  // Handle delete button press
  const handleDeletePress = () => {
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setShowDeleteDialog(false);
    deleteMutation.mutate();
  };

  // Handle back button press (mode-aware)
  const handleBackButton = () => {
    if (currentMode === 'edit') {
      // In EDIT mode, check for changes and behave like the Cancel button
      const hasChanges = recipeFormRef.current?.hasFormChanges() ?? false;
      handleEditCancel(hasChanges);
    } else {
      // In VIEW or CREATE mode, navigate back
      navigation.goBack();
    }
  };
  
  // 10. Early returns (loading, error states)
  if (isLoading && recipeId) {
    return (
      <View style={[staticStyles.loadingContainer, { backgroundColor: dynamicColors.background }]}>
        <ActivityIndicator
          size="large"
          color={dynamicColors.primary}
          testID="recipe-detail-loading"
          accessibilityLabel="Loading recipe details"
        />
      </View>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error.message;
    return (
      <View style={[staticStyles.errorContainer, { backgroundColor: dynamicColors.background }]}>
        <Text style={[staticStyles.errorText, { color: dynamicColors.error }]}>
          {errorMessage}
        </Text>
      </View>
    );
  }
  
  // 11. Final render logic
  const isViewMode = currentMode === 'view';
  const isEditMode = currentMode === 'edit';
  const isCreateMode = currentMode === 'create';

  const headerOnBack = isEditMode ? handleBackButton : () => navigation.goBack();
  const headerOnDelete = !isCreateMode ? handleDeletePress : undefined;

  const formInitialValues = recipe ? {
    title: recipe.title,
    servings: recipe.servings,
    category: recipe.category,
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
  } : undefined;

  const formOnSubmit = isEditMode ? handleEditSubmit : handleCreateSubmit;
  const formOnCancel = isEditMode ? handleEditCancel : () => navigation.goBack();
  const formSubmitLabel = isEditMode ? "Save Changes" : "Create Recipe";

  // A single return-structure stays the same, only props/visibility change
  return (
    <View
      style={[staticStyles.container, { backgroundColor: dynamicColors.background }]}
      testID={`recipe-detail-${currentMode}-mode`}
    >
      <RecipeDetailHeader
        mode={currentMode}
        onBack={headerOnBack}
        onDelete={headerOnDelete}
      />

      {/* Scrollable content - always present, same structure */}
      <ScrollView
        style={staticStyles.container}
        contentContainerStyle={staticStyles.contentContainer}
        testID="recipe-detail-scroll-view"
      >
        <RecipeForm
          ref={isEditMode ? recipeFormRef : undefined}
          initialValues={formInitialValues}
          onSubmit={isViewMode ? undefined : formOnSubmit}
          onCancel={isViewMode ? undefined : formOnCancel}
          onImageChange={isViewMode ? undefined : setCompressedImage}
          submitLabel={isViewMode ? undefined : formSubmitLabel}
          isLoading={saveMutation.isPending}
          readOnly={isViewMode}
          testID={`recipe-detail-${currentMode}-form`}
        />
      </ScrollView>

      {/* Conditional overlays - don't affect layout (FAB uses absolute positioning) */}
      {isViewMode && (
        <FAB
          icon="pencil"
          style={{ position: 'absolute', right: 16, bottom: 16 }}
          onPress={() => setIsEditing(true)}
          testID="recipe-detail-edit-fab"
          accessibilityLabel="Edit recipe"
        />
      )}

      {/* Dialogs - rendered via Portal, don't affect layout */}
      {isEditMode && (
        <CancelConfirmationDialog
          visible={showCancelDialog}
          onDismiss={() => setShowCancelDialog(false)}
          onConfirm={confirmCancel}
        />
      )}

      {!isCreateMode && (
        <DeleteConfirmationDialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
        />
      )}

      <RecipeSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

export default RecipeDetailScreen;