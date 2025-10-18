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

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, useTheme, IconButton, Surface, Divider, Snackbar, FAB, Portal, Dialog, Button } from 'react-native-paper';
import { RecipeDetailScreenNavigationProp, RecipeDetailScreenRouteProp } from '../types/navigation';
import { RecipeService, RecipeRequestDto } from '../lib/shared';
import { RecipeForm, RecipeFormRef } from '../components/shared';

type RecipeDetailScreenProps = {
  navigation: RecipeDetailScreenNavigationProp;
  route?: RecipeDetailScreenRouteProp; // Optional for test scenarios
};

/**
 * RecipeDetailScreen Component
 *
 * Mode Management:
 * - recipeId present → VIEW mode (read-only)
 * - recipeId absent → CREATE mode (editable)
 * - User taps Edit FAB in VIEW → EDIT mode (internal state change)
 */
const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ navigation, route }) => {
  // Extract recipeId from route params (2025 best practice: minimal params)
  // Defensive: handle undefined route/params for test scenarios
  const routeParams = route?.params || {};
  const { recipeId } = routeParams;

  // Track edit state for VIEW → EDIT transition (local state, not navigation)
  const [isEditing, setIsEditing] = useState(false);

  // Confirmation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Ref to access RecipeForm's hasFormChanges function (2025 pattern: useImperativeHandle)
  const recipeFormRef = useRef<RecipeFormRef>(null);

  // Derive mode from recipeId and edit state (React 19 best practice: derive from props)
  const currentMode: 'view' | 'edit' | 'create' =
    !recipeId ? 'create' :    // No ID = CREATE mode
    isEditing ? 'edit' :       // Edit flag = EDIT mode
    'view';                    // Default = VIEW mode

  // Fetch recipe data using TanStack Query (only when recipeId is present)
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
    enabled: !!recipeId, // Only fetch when recipeId is present (VIEW/EDIT mode)
  });

  // Extract recipe data (undefined in CREATE mode or while loading)
  const recipe = recipeResponse;
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Snackbar state for success/error messages
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // CREATE mode mutation
  const createMutation = useMutation({
    mutationFn: async (data: RecipeRequestDto) => {
      const response = await RecipeService.createRecipe(data);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to create recipe'
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Show a success message
      setSnackbarMessage('Recipe created successfully!');
      setSnackbarVisible(true);

      // Invalidate recipe list cache
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Navigate to VIEW mode with a new recipe ID
      navigation.navigate('RecipeDetail', { recipeId: data.id });
    },
    onError: (error: Error) => {
      // Show error message
      setSnackbarMessage(error.message || 'Failed to create recipe. Please try again.');
      setSnackbarVisible(true);
    },
  });

  // EDIT mode mutation
  const updateMutation = useMutation({
    mutationFn: async (data: RecipeRequestDto) => {
      if (!recipeId) {
        throw new Error('Recipe ID is required for update');
      }
      const response = await RecipeService.updateRecipe(recipeId, data);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to update recipe'
        );
      }
      return response.data;
    },
    onSuccess: () => {
      // Show a success message
      setSnackbarMessage('Recipe updated successfully!');
      setSnackbarVisible(true);

      // Invalidate caches
      void queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Transition back to VIEW mode
      setIsEditing(false);
    },
    onError: (error: Error) => {
      // Show an error message (stay in EDIT mode)
      setSnackbarMessage(error.message || 'Failed to update recipe. Please try again.');
      setSnackbarVisible(true);
    },
  });

  // DELETE mutation (Story 11)
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

  // Handle form submissions
  const handleCreateSubmit = (data: RecipeRequestDto) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: RecipeRequestDto) => {
    updateMutation.mutate(data);
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

  // Dynamic styles using theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      elevation: 2,
    },
    contentContainer: {
      padding: 16,
    },
    image: {
      width: '100%',
      height: 240,
      borderRadius: 12,
      marginBottom: 16,
    },
    titleContainer: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
    },
    sectionContainer: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionContent: {
      fontSize: 16,
      color: theme.colors.onBackground,
      lineHeight: 24,
    },
    divider: {
      marginVertical: 16,
    },
  });

  // Loading state
  if (isLoading && recipeId) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
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
      <View style={dynamicStyles.errorContainer}>
        <Text style={dynamicStyles.errorText}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  // VIEW mode - display recipe
  if (currentMode === 'view' && recipe) {
    return (
      <View style={dynamicStyles.container} testID="recipe-detail-view-mode">
        {/* Header with a back button and delete button */}
        <Surface style={dynamicStyles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            testID="recipe-detail-back-button"
            accessibilityLabel="Go back to recipe list"
            accessibilityRole="button"
          />
          <View style={{ flex: 1 }} />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDeletePress}
            testID="recipe-detail-delete-button"
            accessibilityLabel="Delete recipe"
            accessibilityRole="button"
          />
        </Surface>

        {/* Scrollable content */}
        <ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={dynamicStyles.contentContainer}
          testID="recipe-detail-scroll-view"
        >
          {/* Recipe image */}
          {recipe.imageUrl && (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={dynamicStyles.image}
              resizeMode="cover"
              testID="recipe-detail-image"
              accessibilityLabel={`${recipe.title} image`}
            />
          )}

          {/* Title */}
          <View style={dynamicStyles.titleContainer}>
            <Text
              style={dynamicStyles.title}
              accessibilityLabel="Recipe title"
            >
              {recipe.title}
            </Text>
          </View>

          {/* Category */}
          {recipe.category && (
            <View style={dynamicStyles.sectionContainer}>
              <Text style={dynamicStyles.sectionLabel}>Category</Text>
              <Text style={dynamicStyles.sectionContent}>{recipe.category}</Text>
            </View>
          )}

          {/* Servings */}
          <View style={dynamicStyles.sectionContainer}>
            <Text style={dynamicStyles.sectionLabel}>Servings</Text>
            <Text
              style={dynamicStyles.sectionContent}
              accessibilityLabel={`Servings: ${recipe.servings}`}
            >
              {recipe.servings}
            </Text>
          </View>

          <Divider style={dynamicStyles.divider} />

          {/* Instructions */}
          {recipe.instructions && (
            <View style={dynamicStyles.sectionContainer}>
              <Text style={dynamicStyles.sectionLabel}>Instructions</Text>
              <Text style={dynamicStyles.sectionContent}>{recipe.instructions}</Text>
            </View>
          )}
        </ScrollView>

        {/* Edit FAB - Story 10 */}
        <FAB
          icon="pencil"
          style={{ position: 'absolute', right: 16, bottom: 16 }}
          onPress={() => setIsEditing(true)}
          testID="recipe-detail-edit-fab"
          accessibilityLabel="Edit recipe"
        />

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={showDeleteDialog}
            onDismiss={() => setShowDeleteDialog(false)}
            testID="recipe-detail-delete-dialog"
          >
            <Dialog.Title>Delete Recipe?</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this recipe? This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setShowDeleteDialog(false)}
                testID="recipe-detail-delete-dialog-cancel"
              >
                Cancel
              </Button>
              <Button
                onPress={confirmDelete}
                testID="recipe-detail-delete-dialog-confirm"
              >
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Snackbar for success/error messages */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }

  // EDIT mode - edit existing recipe (Story 10)
  if (currentMode === 'edit' && recipe) {
    return (
      <View style={dynamicStyles.container} testID="recipe-detail-edit-mode">
        {/* Header with a back button and delete button */}
        <Surface style={dynamicStyles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBackButton}
            testID="recipe-detail-back-button"
            accessibilityLabel="Go back to recipe list"
            accessibilityRole="button"
          />
          <View style={{ flex: 1 }} />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDeletePress}
            testID="recipe-detail-delete-button"
            accessibilityLabel="Delete recipe"
            accessibilityRole="button"
          />
        </Surface>

        {/* Scrollable form content */}
        <ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={dynamicStyles.contentContainer}
          testID="recipe-detail-scroll-view"
        >
          <RecipeForm
            ref={recipeFormRef}
            initialValues={{
              title: recipe.title,
              servings: recipe.servings,
              category: recipe.category,
              instructions: recipe.instructions,
              imageUrl: recipe.imageUrl,
            }}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            submitLabel="Save Changes"
            isLoading={updateMutation.isPending}
            testID="recipe-detail-edit-form"
          />
        </ScrollView>

        {/* Cancel Changes Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={showCancelDialog}
            onDismiss={() => setShowCancelDialog(false)}
            testID="recipe-detail-cancel-dialog"
          >
            <Dialog.Title>Discard Changes?</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to discard your changes?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setShowCancelDialog(false)}
                testID="recipe-detail-cancel-dialog-dismiss"
              >
                No
              </Button>
              <Button
                onPress={confirmCancel}
                testID="recipe-detail-cancel-dialog-confirm"
              >
                Yes
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog
            visible={showDeleteDialog}
            onDismiss={() => setShowDeleteDialog(false)}
            testID="recipe-detail-delete-dialog"
          >
            <Dialog.Title>Delete Recipe?</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this recipe? This action cannot be undone.</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setShowDeleteDialog(false)}
                testID="recipe-detail-delete-dialog-cancel"
              >
                Cancel
              </Button>
              <Button
                onPress={confirmDelete}
                testID="recipe-detail-delete-dialog-confirm"
              >
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Snackbar for success/error messages */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    );
  }

  // CREATE mode (Story 9)
  return (
    <View style={dynamicStyles.container} testID="recipe-detail-create-mode">
      {/* Header with the back button only (matches VIEW mode) */}
      <Surface style={dynamicStyles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          testID="recipe-detail-back-button"
          accessibilityLabel="Go back to recipe list"
          accessibilityRole="button"
        />
      </Surface>

      {/* Scrollable form content (matches VIEW mode scroll structure) */}
      <ScrollView
        style={dynamicStyles.container}
        contentContainerStyle={dynamicStyles.contentContainer}
        testID="recipe-detail-scroll-view"
      >
        <RecipeForm
          onSubmit={handleCreateSubmit}
          onCancel={() => navigation.goBack()}
          submitLabel="Create Recipe"
          isLoading={createMutation.isPending}
          testID="recipe-detail-create-form"
        />
      </ScrollView>

      {/* Snackbar for success/error messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default RecipeDetailScreen;