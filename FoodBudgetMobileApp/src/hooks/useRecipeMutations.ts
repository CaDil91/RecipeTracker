/**
 * Recipe Mutation Hooks with Optimistic Updates
 *
 * 2025 Standards Applied:
 * - Cache Manipulation approach (multi-location updates)
 * - Manual Rollback + Refetch strategy (fast and consistent)
 * - Query Cancellation (concurrent handling)
 * - Retry actions handled by UI layer
 *
 * Story 12a: Optimistic Delete
 * Story 12b: Optimistic Update (future)
 * Story 12c: Optimistic Create (future)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeService } from '../lib/shared';
import type { RecipeResponseDto } from '../lib/shared';

/**
 * useDeleteRecipe Hook
 *
 * Provides optimistic delete mutation with instant UI updates and automatic rollback on failure.
 *
 * Features:
 * - Instant cache removal (optimistic update)
 * - Automatic rollback on API failure
 * - Background refetch for consistency after errors
 * - Concurrent query cancellation
 * - No refetch on success (trust optimistic update)
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteRecipe();
 *
 * const handleDelete = async (recipeId: string) => {
 *   try {
 *     await deleteMutation.mutateAsync(recipeId);
 *     showSnackbar('Recipe deleted successfully', 'success');
 *   } catch (error) {
 *     showSnackbar('Failed to delete recipe', 'error', {
 *       label: 'Retry',
 *       onPress: () => handleDelete(recipeId)
 *     });
 *   }
 * };
 * ```
 */
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RecipeService.deleteRecipe,

    onMutate: async (recipeId: string) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      // Snapshot current state for potential rollback
      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

      // Optimistically remove recipe from all cache locations
      // This makes the UI update instantly before the API responds
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.filter((r) => r.id !== recipeId) || []
      );

      queryClient.setQueryData<RecipeResponseDto[]>(['recipes', 'All'], (old) =>
        old?.filter((r) => r.id !== recipeId) || []
      );

      // Remove from category-specific caches
      // Note: We don't know which category the recipe belongs to, so we update all possible categories
      const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert'];
      categories.forEach((category) => {
        queryClient.setQueryData<RecipeResponseDto[]>(['recipes', category], (old) =>
          old?.filter((r) => r.id !== recipeId) || []
        );
      });

      // Return context for rollback
      return { previousRecipes, recipeId };
    },

    onError: (_err, _recipeId, context) => {
      // Manual Rollback (instant) - restores the cache to its previous state
      if (context?.previousRecipes) {
        queryClient.setQueryData(['recipes'], context.previousRecipes);
      }

      // Background Refetch (eventual consistency) - ensures cache is correct
      // This runs in the background and doesn't block the UI
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Note: Error snackbar with retry action is handled by the UI component
      // The component catches the error and shows appropriate feedback
    },

    onSuccess: () => {
      // Refetch to ensure cache consistency after successful delete
      // This catches any server-side changes or race conditions
      void queryClient.refetchQueries({ queryKey: ['recipes'] });

      // Note: Success snackbar is handled by the UI component
      // The component receives success and shows appropriate feedback
    },
  });
};
