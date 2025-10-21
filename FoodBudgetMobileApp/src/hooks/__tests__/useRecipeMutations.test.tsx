import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteRecipe } from '../useRecipeMutations';
import { RecipeService, RecipeResponseDto } from '../../lib/shared';

// Mock RecipeService
jest.mock('../../lib/shared', () => ({
  ...jest.requireActual('../../lib/shared'),
  RecipeService: {
    deleteRecipe: jest.fn(),
  },
}));

// Note: Snackbar handling will be in the RecipeListScreen, not the hook
//  will be responsible only for optimistic cache updates
// The screen will handle showing snackbars based on mutation status

// Helper to create mock recipe data
const createMockRecipe = (id: string, title: string): RecipeResponseDto => ({
  id,
  title,
  instructions: 'Test cooking instructions',
  category: 'Dinner',
  servings: 4,
  imageUrl: null,
  createdAt: new Date().toISOString(),
  userId: null,
});

describe('useDeleteRecipe', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  // ==========================================
  // SECTION 1: RISK-BASED PRIORITY
  // Critical optimistic update logic that must work correctly
  // ==========================================

  describe('RISK-BASED PRIORITY: Optimistic Updates', () => {
    it('GIVEN cached recipe list WHEN delete mutation is triggered THEN immediately removes recipe from cache optimistically', async () => {
      // GIVEN: Populate cache with recipes
      const mockRecipes = [
        createMockRecipe('recipe-1', 'Recipe 1'),
        createMockRecipe('recipe-2', 'Recipe 2'),
        createMockRecipe('recipe-3', 'Recipe 3'),
      ];
      queryClient.setQueryData(['recipes'], mockRecipes);
      queryClient.setQueryData(['recipes', 'All'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Trigger delete mutation
      result.current.mutate('recipe-2');

      // THEN: Recipe should be immediately removed from the cache (optimistic update)
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toHaveLength(2);
        expect(cachedRecipes?.find((r) => r.id === 'recipe-2')).toBeUndefined();
      });
    });

    it('GIVEN optimistic delete in progress WHEN API call fails THEN rolls back cache to previous state', async () => {
      // GIVEN: Populate cache with recipes
      const mockRecipes = [
        createMockRecipe('recipe-1', 'Recipe 1'),
        createMockRecipe('recipe-2', 'Recipe 2'),
      ];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete fails
      result.current.mutate('recipe-2');

      // THEN: Cache should be rolled back to the original state
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toHaveLength(2);
        expect(cachedRecipes?.find((r) => r.id === 'recipe-2')).toBeDefined();
      });
    });

    it('GIVEN optimistic delete succeeded WHEN API call succeeds THEN refetches to ensure cache consistency', async () => {
      // GIVEN: Populate cache
      const mockRecipes = [createMockRecipe('recipe-1', 'Recipe 1')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete succeeds
      result.current.mutate('recipe-1');

      // THEN: Should refetch to ensure consistency
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });

    it('GIVEN multiple concurrent delete mutations WHEN triggered simultaneously THEN cancels in-flight queries before optimistic update', async () => {
      // GIVEN: Populate cache
      const mockRecipes = [
        createMockRecipe('recipe-1', 'Recipe 1'),
        createMockRecipe('recipe-2', 'Recipe 2'),
      ];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Trigger concurrent deletes
      result.current.mutate('recipe-1');

      // THEN: Should cancel in-flight queries
      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });
  });

  // ==========================================
  // SECTION 2: HAPPY PATH
  // Primary use case - successful delete flow
  // ==========================================

  describe('HAPPY PATH: Successful Delete', () => {
    it('GIVEN valid recipe ID WHEN delete is successful THEN calls RecipeService.deleteRecipe with correct ID', async () => {
      // GIVEN: Valid recipe
      const mockRecipes = [createMockRecipe('recipe-1', 'Recipe 1')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete is triggered
      result.current.mutate('recipe-1');

      // THEN: Service called with correct ID (first argument)
      await waitFor(() => {
        expect(RecipeService.deleteRecipe).toHaveBeenCalled();
        expect((RecipeService.deleteRecipe as jest.Mock).mock.calls[0][0]).toBe('recipe-1');
      });
    });
  });

  // ==========================================
  // SECTION 3: NULL/EMPTY/INVALID
  // Edge cases with invalid inputs
  // ==========================================

  describe('NULL/EMPTY/INVALID: Edge Cases', () => {
    it('GIVEN recipe ID not in cache WHEN delete is triggered THEN handles gracefully without crash', async () => {
      // GIVEN: Cache with different recipes
      const mockRecipes = [createMockRecipe('recipe-1', 'Recipe 1')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete non-existent recipe
      expect(() => {
        result.current.mutate('non-existent-id');
      }).not.toThrow();

      // THEN: Should still call API
      await waitFor(() => {
        expect(RecipeService.deleteRecipe).toHaveBeenCalled();
        expect((RecipeService.deleteRecipe as jest.Mock).mock.calls[0][0]).toBe('non-existent-id');
      });
    });

    it('GIVEN empty cache WHEN delete is triggered THEN handles gracefully without crash', async () => {
      // GIVEN: Empty cache
      queryClient.setQueryData(['recipes'], []);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete from empty cache
      expect(() => {
        result.current.mutate('recipe-1');
      }).not.toThrow();

      // THEN: Should still call API
      await waitFor(() => {
        expect(RecipeService.deleteRecipe).toHaveBeenCalled();
        expect((RecipeService.deleteRecipe as jest.Mock).mock.calls[0][0]).toBe('recipe-1');
      });
    });
  });

  // ==========================================
  // SECTION 4: BOUNDARIES
  // Limit testing - cache sizes, timing
  // ==========================================

  describe('BOUNDARIES: Limit Testing', () => {
    it('GIVEN large cache (100 recipes) WHEN delete is triggered THEN optimistic update completes quickly', async () => {
      // GIVEN: Large cache
      const mockRecipes = Array.from({ length: 100 }, (_, i) =>
        createMockRecipe(`recipe-${i}`, `Recipe ${i}`)
      );
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      const startTime = Date.now();

      // WHEN: Delete from a large cache
      result.current.mutate('recipe-50');

      // THEN: Optimistic update should be near-instant (< 100 ms)
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toHaveLength(99);
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });

    it('GIVEN single recipe in cache WHEN last recipe deleted THEN cache becomes empty array', async () => {
      // GIVEN: Single recipe
      const mockRecipes = [createMockRecipe('recipe-1', 'Last Recipe')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete last recipe
      result.current.mutate('recipe-1');

      // THEN: Cache becomes an empty array
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toEqual([]);
      });
    });
  });

  // ==========================================
  // SECTION 5: BUSINESS RULES
  // Domain-specific rules
  // ==========================================

  describe('BUSINESS RULES: Domain Logic', () => {
    it('GIVEN recipe exists in multiple category caches WHEN deleted THEN removes from all relevant caches', async () => {
      // GIVEN: Recipe in multiple category caches
      const mockRecipe = createMockRecipe('recipe-1', 'Pasta');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipes', 'All'], [mockRecipe]);
      queryClient.setQueryData(['recipes', 'Dinner'], [mockRecipe]);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue(undefined);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete recipe
      result.current.mutate('recipe-1');

      // THEN: Removed from all caches
      await waitFor(() => {
        expect(queryClient.getQueryData(['recipes'])).toEqual([]);
        expect(queryClient.getQueryData(['recipes', 'All'])).toEqual([]);
        expect(queryClient.getQueryData(['recipes', 'Dinner'])).toEqual([]);
      });
    });
  });

  // ==========================================
  // SECTION 6: ERROR HANDLING
  // Exception behavior and recovery
  // Note: Snackbar handling (including retry actions) will be tested in RecipeListScreen tests
  // The hook only handles cache optimistic updates and rollback
  // ==========================================

  describe('ERROR HANDLING: Exception Behavior', () => {
    it('GIVEN API failure WHEN delete fails THEN rolls back cache and allows screen to handle UI feedback', async () => {
      // GIVEN: API will fail
      const mockRecipes = [createMockRecipe('recipe-1', 'Recipe 1')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete fails
      result.current.mutate('recipe-1');

      // THEN: Cache should be rolled back
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toHaveLength(1);
        expect(cachedRecipes?.find((r) => r.id === 'recipe-1')).toBeDefined();
      });
    });
  });
});
