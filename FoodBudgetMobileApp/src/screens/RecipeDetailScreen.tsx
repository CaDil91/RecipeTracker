/**
 * RecipeDetailScreen - Unified screen for viewing, editing, and creating recipes
 * Story 9: CREATE Mode (Future)
 * Story 10: EDIT Mode (Future)
 *
 * VIEW Mode Features:
 * - Display recipe details with Material Design 3 styling
 * - Loading and error states with accessibility support
 * - TanStack Query integration for data fetching
 * - Responsive layout with scrolling support
 * - Conditional rendering for optional fields (image, category, instructions)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, useTheme, IconButton, Surface, Divider, Snackbar } from 'react-native-paper';
import { RecipeDetailScreenNavigationProp, RecipeDetailScreenRouteProp } from '../types/navigation';
import { RecipeService, RecipeRequestDto } from '../lib/shared';
import { RecipeForm } from '../components/shared';

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
  const [isEditing] = useState(false);

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

  // Handle form submission
  const handleCreateSubmit = (data: RecipeRequestDto) => {
    createMutation.mutate(data);
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
        {/* Header with back button */}
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