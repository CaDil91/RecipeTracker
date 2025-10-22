/**
 * Recipe Mutation Hooks with Optimistic Updates
 *
 * 2025 Standards Applied:
 * - Cache Manipulation approach (multi-location updates)
 * - Manual Rollback + Refetch strategy (fast and consistent)
 * - Query Cancellation (concurrent handling)
 * - Retry actions handled by UI layer
 *
 * Story 12a: Optimistically Delete
 * Story 12b: Optimistic Update
 * Story 12c: Optimistically Create
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { RecipeService } from '../lib/shared';
import type { RecipeResponseDto, RecipeRequestDto } from '../lib/shared';

/**
 * useDeleteRecipe Hook
 *
 * Provides optimistic delete mutation with instant UI updates and automatic rollback on failure.
 *
 * Features:
 * - Instant cache removal (optimistic update)
 * - Automatic rollback on API failure
 * - Background refetch for consistency (on both success and error)
 * - Concurrent query cancellation
 * - Scalable category cache handling via invalidation
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
    mutationFn: async (recipeId: string) => {
      const response = await RecipeService.deleteRecipe(recipeId);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to delete recipe'
        );
      }
      return response.data;
    },

    onMutate: async (recipeId: string) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      // Snapshot current state for potential rollback
      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

      // Optimistically remove recipe from main cache
      // This makes the UI update instantly before the API responds
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.filter((r) => r.id !== recipeId) || []
      );

      // Category caches will be handled by invalidateQueries (supports custom categories)

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

/**
 * useUpdateRecipe Hook - Story 12b
 *
 * Provides optimistic update mutation with instant UI updates in both list and detail caches.
 *
 * Features:
 * - Instant cache updates in BOTH list and detail views (multi-cache)
 * - Automatic rollback on API failure for both caches
 * - Background refetch for consistency after errors
 * - Server response replaces optimistic data on success
 * - Concurrent query cancellation for both caches
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateRecipe();
 *
 * const handleSave = async (recipeId: string, data: RecipeRequestDto) => {
 *   try {
 *     await updateMutation.mutateAsync({ id: recipeId, data });
 *     showSnackbar('Recipe updated successfully', 'success');
 *     navigation.goBack(); // Navigate only after API confirms
 *   } catch (error) {
 *     showSnackbar('Failed to update recipe', 'error', {
 *       label: 'Retry',
 *       onPress: () => handleSave(recipeId, data)
 *     });
 *   }
 * };
 * ```
 */
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RecipeRequestDto }) => {
      const response = await RecipeService.updateRecipe(id, data);
      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : response.error.title || 'Failed to update recipe'
        );
      }
      return response.data;
    },

    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches for BOTH list and detail caches
      await queryClient.cancelQueries({ queryKey: ['recipes'] });
      await queryClient.cancelQueries({ queryKey: ['recipe', id] });

      // Snapshot current state for both caches
      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      const previousRecipe = queryClient.getQueryData<RecipeResponseDto>(['recipe', id]);

      // Optimistically update LIST cache
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.map((r) => (r.id === id ? { ...r, ...data } : r)) || []
      );

      // Optimistically update DETAIL cache
      queryClient.setQueryData<RecipeResponseDto>(['recipe', id], (old) =>
        old ? { ...old, ...data } : old
      );

      // Category caches will be handled by invalidateQueries (supports custom categories)

      // Return context for rollback
      return { previousRecipes, previousRecipe, id };
    },

    onError: (_err, { id }, context) => {
      // Manual Rollback (instant) - restores BOTH caches
      if (context?.previousRecipes) {
        queryClient.setQueryData(['recipes'], context.previousRecipes);
      }
      if (context?.previousRecipe) {
        queryClient.setQueryData(['recipe', id], context.previousRecipe);
      }

      // Background Refetch (eventual consistency) - ensures both caches are correct
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });
      void queryClient.invalidateQueries({ queryKey: ['recipe', id] });

      // Note: Error snackbar with retry action is handled by the UI component
    },

    onSuccess: (updatedRecipe, { id }) => {
      // Replace optimistic data with server response for both caches
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.map((r) => (r.id === id ? updatedRecipe : r)) || []
      );
      queryClient.setQueryData(['recipe', id], updatedRecipe);

      // Refetch list for consistency (catches any server-side changes)
      void queryClient.refetchQueries({ queryKey: ['recipes'] });

      // Note: Success snackbar and navigation are handled by the UI component
    },
  });
};

/**
 * useCreateRecipe Hook - Story 12c
 *
 * Provides optimistic create mutation with temp UUID and instant UI updates.
 *
 * Features:
 * - Temp UUID generation with "temp-" prefix (expo-crypto)
 * - Instant cache addition to TOP of list (newest first)
 * - Temp ID → Real ID replacement on API success
 * - Automatic rollback on API failure (removes temp recipe)
 * - Multi-cache updates (list, detail, category)
 * - Concurrent query cancellation
 * - Returns real recipe for navigation
 *
 * @example
 * ```tsx
 * const createMutation = useCreateRecipe();
 *
 * const handleCreate = async (data: RecipeRequestDto) => {
 *   try {
 *     const createdRecipe = await createMutation.mutateAsync(data);
 *     showSnackbar('Recipe created successfully!', 'success');
 *     // Navigate with real ID from server
 *     navigation.navigate('RecipeDetail', { recipeId: createdRecipe. I'd });
 *   } catch (error) {
 *     showSnackbar('Failed to create recipe', 'error', {
 *       label: 'Retry',
 *       onPress: () => handleCreate(data)
 *     });
 *   }
 * };
 * ```
 */
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
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

    onMutate: async (data: RecipeRequestDto) => {
      // Generate temp UUID with "temp-" prefix
      const tempId = `temp-${Crypto.randomUUID()}`;

      // Create temp recipe for optimistic update
      const tempRecipe: RecipeResponseDto = {
        id: tempId,
        title: data.title,
        instructions: data.instructions || '',
        servings: data.servings,
        category: data.category,
        imageUrl: data.imageUrl,
        createdAt: new Date().toISOString(),
        userId: 'temp-user', // Placeholder - will be replaced by server response
      };

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      // Snapshot current state for potential rollback
      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

      // Optimistically add recipe to TOP of main list (newest first)
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        [tempRecipe, ...(old || [])]
      );

      // Populate the detail cache for instant navigation (if needed)
      queryClient.setQueryData(['recipe', tempId], tempRecipe);

      // Category caches will be handled by invalidateQueries (supports custom categories)

      // Return context for rollback
      return { previousRecipes, tempId, tempRecipe };
    },

    onError: (_err, _data, context) => {
      const tempId = context?.tempId;

      if (!tempId) return;

      // Manual Rollback (instant) - removes temp recipe from main cache
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.filter((r) => r.id !== tempId) || []
      );

      // Remove from the detail cache
      queryClient.removeQueries({ queryKey: ['recipe', tempId] });

      // Background Refetch (eventual consistency) - ensures the cache is correct
      void queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Note: Error snackbar with retry action is handled by the UI component
    },

    onSuccess: (serverRecipe, _data, context) => {
      const tempId = context?.tempId;

      if (!tempId) return;

      // Replace temp recipe with server response in the main list cache
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.map((r) => (r.id === tempId ? serverRecipe : r)) || []
      );

      // Remove temp detail cache and add real detail cache
      queryClient.removeQueries({ queryKey: ['recipe', tempId] });
      queryClient.setQueryData(['recipe', serverRecipe.id], serverRecipe);

      // Background refetch for consistency (catches any server-side changes)
      void queryClient.refetchQueries({ queryKey: ['recipes'] });

      // Note: Success snackbar and navigation are handled by the UI component
      // The component uses the returned serverRecipe.id for navigation
    },
  });
};
