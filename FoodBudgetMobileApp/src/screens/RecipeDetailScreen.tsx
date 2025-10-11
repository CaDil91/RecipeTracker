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
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, useTheme, IconButton, Surface, Divider } from 'react-native-paper';
import { RecipeDetailScreenNavigationProp, RecipeDetailScreenRouteProp } from '../types/navigation';
import { RecipeService } from '../lib/shared';

type RecipeDetailScreenProps = {
  navigation: RecipeDetailScreenNavigationProp;
  route: RecipeDetailScreenRouteProp;
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
  const { recipeId } = route.params || {};

  // Local state for mode management (not navigation params)
  const [currentMode] = useState<'view' | 'edit' | 'create'>(() =>
    recipeId ? 'view' : 'create'
  );

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

  // CREATE mode (Story 9) - Not yet implemented
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.errorText}>CREATE mode not yet implemented</Text>
    </View>
  );
};

export default RecipeDetailScreen;