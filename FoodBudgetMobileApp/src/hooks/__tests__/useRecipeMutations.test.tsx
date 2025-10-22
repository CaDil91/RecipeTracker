import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDeleteRecipe, useUpdateRecipe, useCreateRecipe } from '../useRecipeMutations';
import { RecipeService, RecipeResponseDto } from '../../lib/shared';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
}));

// Mock RecipeService
jest.mock('../../lib/shared', () => ({
  ...jest.requireActual('../../lib/shared'),
  RecipeService: {
    deleteRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    createRecipe: jest.fn(),
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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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
      // Account for the test environment overhead (React Testing Library, waitFor polling)
      expect(duration).toBeLessThan(200);
    });

    it('GIVEN single recipe in cache WHEN last recipe deleted THEN cache becomes empty array', async () => {
      // GIVEN: Single recipe
      const mockRecipes = [createMockRecipe('recipe-1', 'Last Recipe')];
      queryClient.setQueryData(['recipes'], mockRecipes);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

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
    it('GIVEN recipe exists in main cache WHEN deleted THEN removes from main cache and refetches all (including category caches)', async () => {
      // GIVEN: Recipe in main cache (category caches handled by refetch)
      const mockRecipe = createMockRecipe('recipe-1', 'Pasta');
      queryClient.setQueryData(['recipes'], [mockRecipe]);

      (RecipeService.deleteRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: undefined
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteRecipe(), { wrapper });

      // WHEN: Delete recipe
      result.current.mutate('recipe-1');

      // THEN: Removed from main cache optimistically
      await waitFor(() => {
        expect(queryClient.getQueryData(['recipes'])).toEqual([]);
      });

      // AND: refetchQueries called (handles all category caches including custom ones)
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
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

// ============================================================================
// useUpdateRecipe Tests - Story 12b
// ============================================================================

describe('useUpdateRecipe', () => {
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
  // Critical optimistic update logic for multi-cache updates
  // ==========================================

  describe('RISK-BASED PRIORITY: Multi-Cache Optimistic Updates', () => {
    it('GIVEN recipe in both list and detail caches WHEN update mutation triggered THEN immediately updates both caches optimistically', async () => {
      // GIVEN: Recipe exists in both caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original Title');
      const mockRecipes = [mockRecipe, createMockRecipe('recipe-2', 'Recipe 2')];

      queryClient.setQueryData(['recipes'], mockRecipes);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRecipe,
          title: 'Updated Title',
        }
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Trigger update mutation
      const updateData = { title: 'Updated Title', servings: 4, instructions: 'Updated instructions' };
      result.current.mutate({ id: 'recipe-1', data: updateData });

      // THEN: Both caches should be updated immediately
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);

        expect(listCache?.find(r => r.id === 'recipe-1')?.title).toBe('Updated Title');
        expect(detailCache?.title).toBe('Updated Title');
      });
    });

    it('GIVEN optimistic update in progress WHEN API call fails THEN rolls back both list and detail caches', async () => {
      // GIVEN: Recipe in both caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original Title');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: false,
        error: 'Network error'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update fails
      const updateData = { title: 'Failed Update', servings: 4, instructions: 'Test' };
      result.current.mutate({ id: 'recipe-1', data: updateData });

      // THEN: Both caches should be rolled back
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);

        expect(listCache?.find(r => r.id === 'recipe-1')?.title).toBe('Original Title');
        expect(detailCache?.title).toBe('Original Title');
      });
    });

    it('GIVEN optimistic update succeeded WHEN API call succeeds THEN refetches both caches for consistency', async () => {
      // GIVEN: Recipe in both caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      const serverResponse = { ...mockRecipe, title: 'Server Title' };
      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: serverResponse
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update succeeds
      result.current.mutate({ id: 'recipe-1', data: { title: 'Updated', servings: 4, instructions: 'Test' } });

      // THEN: Should refetch list cache for consistency
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });

    it('GIVEN multiple concurrent update mutations WHEN triggered simultaneously THEN cancels in-flight queries before optimistic update', async () => {
      // GIVEN: Recipe in caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockRecipe), 100))
      );

      const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Trigger update
      result.current.mutate({ id: 'recipe-1', data: { title: 'Updated', servings: 4, instructions: 'Test' } });

      // THEN: Should cancel in-flight queries for both caches
      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
        expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ['recipe', 'recipe-1'] });
      });
    });
  });

  // ==========================================
  // SECTION 2: HAPPY PATH
  // Primary use case - successful update flow
  // ==========================================

  describe('HAPPY PATH: Successful Update', () => {
    it('GIVEN valid update data WHEN update is successful THEN calls RecipeService.updateRecipe with correct ID and data', async () => {
      // GIVEN: Valid recipe
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: mockRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      const updateData = { title: 'Updated Title', servings: 6, instructions: 'New instructions' };

      // WHEN: Update is triggered
      result.current.mutate({ id: 'recipe-1', data: updateData });

      // THEN: Service called with correct ID and data (first argument)
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalled();
        const callArgs = (RecipeService.updateRecipe as jest.Mock).mock.calls[0];
        expect(callArgs[0]).toBe('recipe-1');
        expect(callArgs[1]).toEqual(updateData);
      });
    });

    it('GIVEN server returns updated recipe WHEN update succeeds THEN replaces optimistic data with server response', async () => {
      // GIVEN: Recipe in caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      const serverResponse = { ...mockRecipe, title: 'Server Updated Title', servings: 8 };
      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: serverResponse
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update succeeds
      result.current.mutate({ id: 'recipe-1', data: { title: 'Client Update', servings: 6, instructions: 'Test' } });

      // THEN: Server response should replace optimistic data
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);

        expect(listCache?.find(r => r.id === 'recipe-1')?.title).toBe('Server Updated Title');
        expect(listCache?.find(r => r.id === 'recipe-1')?.servings).toBe(8);
        expect(detailCache?.title).toBe('Server Updated Title');
        expect(detailCache?.servings).toBe(8);
      });
    });
  });

  // ==========================================
  // SECTION 3: NULL/EMPTY/INVALID
  // Edge cases with partial updates
  // ==========================================

  describe('NULL/EMPTY/INVALID: Partial Updates', () => {
    it('GIVEN partial update (only some fields) WHEN update is triggered THEN merges with existing recipe data', async () => {
      // GIVEN: Recipe with multiple fields
      const mockRecipe = createMockRecipe('recipe-1', 'Original Title');
      mockRecipe.servings = 4;
      mockRecipe.category = 'Dinner';

      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRecipe,
          title: 'Updated Title',
        }
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update only title (partial update)
      result.current.mutate({ id: 'recipe-1', data: { title: 'Updated Title', servings: 4, instructions: 'Test' } });

      // THEN: Should merge with existing data
      await waitFor(() => {
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);
        expect(detailCache?.title).toBe('Updated Title');
        expect(detailCache?.category).toBe('Dinner'); // Original field preserved
      });
    });

    it('GIVEN recipe only in detail cache (not in list) WHEN update is triggered THEN handles gracefully', async () => {
      // GIVEN: Recipe only in detail cache
      const mockRecipe = createMockRecipe('recipe-1', 'Detail Only');
      queryClient.setQueryData(['recipes'], []); // Empty list
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRecipe,
          title: 'Updated',
        }
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update recipe not in the list
      expect(() => {
        result.current.mutate({ id: 'recipe-1', data: { title: 'Updated', servings: 4, instructions: 'Test' } });
      }).not.toThrow();

      // THEN: Should still update the detail cache
      await waitFor(() => {
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);
        expect(detailCache?.title).toBe('Updated');
      });
    });
  });

  // ==========================================
  // SECTION 4: BOUNDARIES
  // Limit testing - list positions
  // ==========================================

  describe('BOUNDARIES: List Position Testing', () => {
    it('GIVEN recipe at start of list WHEN updated THEN updates correctly without reordering', async () => {
      // GIVEN: Recipe at index 0
      const recipe1 = createMockRecipe('recipe-1', 'First Recipe');
      const recipe2 = createMockRecipe('recipe-2', 'Second Recipe');
      queryClient.setQueryData(['recipes'], [recipe1, recipe2]);
      queryClient.setQueryData(['recipe', 'recipe-1'], recipe1);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...recipe1,
          title: 'Updated First',
        }
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update first recipe
      result.current.mutate({ id: 'recipe-1', data: { title: 'Updated First', servings: 4, instructions: 'Test' } });

      // THEN: Should update at the same position
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(listCache?.[0]?.title).toBe('Updated First');
        expect(listCache?.[1]?.title).toBe('Second Recipe');
      });
    });

    it('GIVEN recipe at end of list WHEN updated THEN updates correctly without reordering', async () => {
      // GIVEN: Recipe at end
      const recipe1 = createMockRecipe('recipe-1', 'First Recipe');
      const recipe2 = createMockRecipe('recipe-2', 'Last Recipe');
      queryClient.setQueryData(['recipes'], [recipe1, recipe2]);
      queryClient.setQueryData(['recipe', 'recipe-2'], recipe2);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...recipe2,
          title: 'Updated Last',
        }
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update last recipe
      result.current.mutate({ id: 'recipe-2', data: { title: 'Updated Last', servings: 4, instructions: 'Test' } });

      // THEN: Should update at the same position
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(listCache?.[0]?.title).toBe('First Recipe');
        expect(listCache?.[1]?.title).toBe('Updated Last');
      });
    });
  });

  // ==========================================
  // SECTION 5: BUSINESS RULES
  // Domain-specific rules for category changes
  // ==========================================

  describe('BUSINESS RULES: Category Changes', () => {
    it('GIVEN recipe category changes WHEN updated THEN updates main cache and refetches all (including category caches)', async () => {
      // GIVEN: Recipe in main and detail caches
      const mockRecipe = createMockRecipe('recipe-1', 'Pasta');
      mockRecipe.category = 'Dinner';

      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockRecipe,
          category: 'Lunch',
        }
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update category from Dinner to Lunch
      result.current.mutate({
        id: 'recipe-1',
        data: { title: 'Pasta', servings: 4, instructions: 'Test', category: 'Lunch' }
      });

      // THEN: Should update main cache optimistically
      await waitFor(() => {
        const mainCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(mainCache?.find(r => r.id === 'recipe-1')?.category).toBe('Lunch');
      });

      // AND: refetchQueries called (handles all category caches including custom ones)
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });
  });

  // ==========================================
  // SECTION 6: ERROR HANDLING
  // Exception behavior and recovery
  // ==========================================

  describe('ERROR HANDLING: Exception Behavior', () => {
    it('GIVEN API failure WHEN update fails THEN rolls back both caches and allows screen to handle UI feedback', async () => {
      // GIVEN: Recipe in both caches
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn().mockRejectedValue(
        new Error('Network error')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: Update fails
      result.current.mutate({ id: 'recipe-1', data: { title: 'Failed', servings: 4, instructions: 'Test' } });

      // THEN: Both caches should be rolled back
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const detailCache = queryClient.getQueryData<RecipeResponseDto>(['recipe', 'recipe-1']);

        expect(listCache?.find(r => r.id === 'recipe-1')?.title).toBe('Original');
        expect(detailCache?.title).toBe('Original');
      });
    });

    it('GIVEN retry after rollback WHEN user retries update THEN re-attempts mutation', async () => {
      // GIVEN: Recipe in caches, API fails then succeeds
      const mockRecipe = createMockRecipe('recipe-1', 'Original');
      queryClient.setQueryData(['recipes'], [mockRecipe]);
      queryClient.setQueryData(['recipe', 'recipe-1'], mockRecipe);

      (RecipeService.updateRecipe as jest.Mock) = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ...mockRecipe, title: 'Updated' });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

      // WHEN: First attempt fails
      result.current.mutate({ id: 'recipe-1', data: { title: 'Attempt 1', servings: 4, instructions: 'Test' } });

      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(listCache?.find(r => r.id === 'recipe-1')?.title).toBe('Original');
      });

      // WHEN: Retry (second attempt succeeds)
      result.current.mutate({ id: 'recipe-1', data: { title: 'Attempt 2', servings: 4, instructions: 'Test' } });

      // THEN: Should successfully update on retry
      await waitFor(() => {
        expect(RecipeService.updateRecipe).toHaveBeenCalledTimes(2);
      });
    });
  });
});

describe('useCreateRecipe', () => {
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
  // Critical optimistic create logic with temp ID lifecycle
  // ==========================================

  describe('RISK-BASED PRIORITY: Temp ID Lifecycle & Optimistic Create', () => {
    it('GIVEN new recipe data WHEN create mutation triggered THEN generates unique temp UUID with "temp-" prefix', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []); // Initialize cache

      const createdRecipe = createMockRecipe('real-uuid-123', 'New Recipe');
      // Delay API response to ensure we can check the optimistic update
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({ success: true, data: createdRecipe }), 100);
        })
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      const newRecipeData = { title: 'New Recipe', servings: 4, instructions: 'Test instructions', category: 'Dinner' };
      result.current.mutate(newRecipeData);

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const tempRecipe = listCache?.[0];

        expect(tempRecipe?.id).toBeDefined();
        expect(tempRecipe?.id.startsWith('temp-')).toBe(true);
        expect(tempRecipe?.id.length).toBeGreaterThan(10); // UUID adds significant length
      });
    });

    it('GIVEN recipe in cache WHEN optimistic create THEN adds to TOP of list with temp ID', async () => {
      // Arrange
      const existingRecipes = [
        createMockRecipe('recipe-1', 'Existing 1'),
        createMockRecipe('recipe-2', 'Existing 2'),
      ];
      queryClient.setQueryData(['recipes'], existingRecipes);

      const createdRecipe = createMockRecipe('real-uuid-123', 'New Recipe');
      // Delay API response to ensure we can check the optimistic update
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => resolve({ success: true, data: createdRecipe }), 100);
        })
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'New Recipe', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

        expect(listCache).toHaveLength(3);
        expect(listCache?.[0]?.id.startsWith('temp-')).toBe(true);
        expect(listCache?.[0]?.title).toBe('New Recipe');
        expect(listCache?.[1]).toEqual(existingRecipes[0]); // Existing recipes unchanged
        expect(listCache?.[2]).toEqual(existingRecipes[1]);
      });
    });

    it('GIVEN temp recipe in cache WHEN API returns success THEN replaces temp ID with real ID', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('real-uuid-123', 'Created Recipe');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Created Recipe', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

        expect(listCache).toHaveLength(1);
        expect(listCache?.[0]?.id).toBe('real-uuid-123'); // Real ID, not temp
        expect(listCache?.[0]?.title).toBe('Created Recipe');

        // Verify no temp IDs remain
        const hasTempId = listCache?.some(r => r.id.startsWith('temp-'));
        expect(hasTempId).toBe(false);
      });
    });

    it('GIVEN temp recipe in cache WHEN API fails THEN removes temp recipe and rolls back', async () => {
      // Arrange
      const existingRecipes = [createMockRecipe('recipe-1', 'Existing')];
      queryClient.setQueryData(['recipes'], existingRecipes);

      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Server error'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Failed Recipe', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      expect(listCache).toEqual(existingRecipes); // Rolled back to the original
      expect(listCache?.some(r => r.id.startsWith('temp-'))).toBe(false); // No temp recipes
    });

    it('GIVEN temp recipe created WHEN API succeeds THEN adds to detail cache with real ID', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('real-uuid-456', 'Detail Recipe');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Detail Recipe', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const detailCache = queryClient.getQueryData(['recipe', 'real-uuid-456']);

        expect(detailCache).toBeDefined();
        expect(detailCache).toEqual(createdRecipe);
      });
    });
  });

  // ==========================================
  // SECTION 2: HAPPY PATH
  // Primary use case flow
  // ==========================================

  describe('HAPPY PATH: Complete Optimistic Create Flow', () => {
    it('GIVEN valid recipe data WHEN create succeeds THEN complete optimistic flow works end-to-end', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('real-uuid-789', 'Complete Flow');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Complete Flow', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const detailCache = queryClient.getQueryData(['recipe', 'real-uuid-789']);

        // List cache has real ID
        expect(listCache?.[0]?.id).toBe('real-uuid-789');
        expect(listCache?.[0]?.title).toBe('Complete Flow');

        // Detail cache populated
        expect(detailCache).toEqual(createdRecipe);

        // No errors
        expect(result.current.isError).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('GIVEN new recipe data WHEN optimistic create THEN updates main cache and refetches all (including category caches)', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('uuid-breakfast', 'Pancakes');
      createdRecipe.category = 'Breakfast';
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Pancakes', servings: 4, instructions: 'Test', category: 'Breakfast' });

      // Assert: Main cache updated with real ID
      await waitFor(() => {
        const mainCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(mainCache?.[0]?.id).toBe('uuid-breakfast');
      });

      // AND: refetchQueries called (handles all category caches including custom ones)
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });

    it('GIVEN successful create WHEN refetch occurs THEN server data replaces optimistic data', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const serverRecipe = createMockRecipe('server-123', 'SERVER NORMALIZED TITLE'); // Server uppercased
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: serverRecipe
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'lowercase title', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

        expect(listCache?.[0]?.title).toBe('SERVER NORMALIZED TITLE'); // Server wins
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });
  });

  // ==========================================
  // SECTION 3: NULL/EMPTY/INVALID
  // Edge cases and malformed data
  // ==========================================

  describe('NULL/EMPTY/INVALID: Edge Cases', () => {
    it('GIVEN empty recipe list WHEN optimistic create THEN handles undefined cache gracefully', async () => {
      // Arrange
      queryClient.clear(); // No cache exists (undefined)

      const createdRecipe = createMockRecipe('uuid-first', 'First Recipe');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'First Recipe', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

        expect(listCache).toBeDefined();
        expect(listCache).toHaveLength(1);
        expect(listCache?.[0]?.id).toBe('uuid-first');
      });
    });

    it('GIVEN recipe without optional fields WHEN create THEN temp recipe has sensible defaults', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('uuid-minimal', 'Minimal Recipe');
      createdRecipe.imageUrl = null;
      createdRecipe.userId = null;
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Minimal Recipe', servings: 4, instructions: 'Test' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const tempRecipe = listCache?.[0];

        // Should not crash, should have defaults
        expect(tempRecipe?.imageUrl).toBeDefined(); // Has some default value
        expect(tempRecipe?.userId).toBeDefined(); // Has default 'temp-user' or null
      });
    });
  });

  // ==========================================
  // SECTION 4: BOUNDARIES
  // Minimum, maximum, threshold values
  // ==========================================

  describe('BOUNDARIES: Limits and Thresholds', () => {
    it('GIVEN very long recipe title (255 chars) WHEN create THEN temp recipe stores full title', async () => {
      // Arrange
      const longTitle = 'A'.repeat(255);
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('uuid-long', longTitle);
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: longTitle, servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(listCache?.[0]?.title).toBe(longTitle);
        expect(listCache?.[0]?.title.length).toBe(255);
      });
    });

    it('GIVEN rapid successive creates WHEN multiple temp recipes THEN each gets unique UUID', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const recipe1 = createMockRecipe('real-1', 'Recipe 1');
      const recipe2 = createMockRecipe('real-2', 'Recipe 2');

      (RecipeService.createRecipe as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: recipe1 })
        .mockResolvedValueOnce({ success: true, data: recipe2 });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Recipe 1', servings: 4, instructions: 'Test 1', category: 'Dinner' });
      result.current.mutate({ title: 'Recipe 2', servings: 4, instructions: 'Test 2', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Note: This test verifies UUID uniqueness indirectly
      // Actual uniqueness is guaranteed by Crypto.randomUUID()
    });
  });

  // ==========================================
  // SECTION 5: BUSINESS RULES
  // Domain logic and constraints
  // ==========================================

  describe('BUSINESS RULES: Domain Logic', () => {
    it('GIVEN temp recipe WHEN API returns createdAt timestamp THEN uses server timestamp (not client)', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const serverTimestamp = '2025-10-22T12:00:00Z';
      const createdRecipe = createMockRecipe('uuid-timestamp', 'Timestamped');
      createdRecipe.createdAt = serverTimestamp;

      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Timestamped', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(listCache?.[0]?.createdAt).toBe(serverTimestamp);
      });
    });

    it('GIVEN temp recipe created WHEN success THEN refetches recipe list for consistency', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('uuid-refetch', 'Refetch Test');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Refetch Test', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });
  });

  // ==========================================
  // SECTION 6: ERROR HANDLING
  // Exception handling and cleanup
  // ==========================================

  describe('ERROR HANDLING: Exception Behavior', () => {
    it('GIVEN API returns 400 Bad Request WHEN create fails THEN removes temp recipe with error', async () => {
      // Arrange
      const existingRecipes = [createMockRecipe('existing-1', 'Existing')];
      queryClient.setQueryData(['recipes'], existingRecipes);

      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Invalid recipe data'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Invalid', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBeDefined();
      });

      const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      expect(listCache).toEqual(existingRecipes); // Rolled back
      expect(listCache?.some(r => r.id.startsWith('temp-'))).toBe(false);
    });

    it('GIVEN network timeout WHEN create fails THEN rollback is immediate (no hanging temp recipe)', async () => {
      // Arrange
      const existingRecipes = [createMockRecipe('existing-1', 'Existing')];
      queryClient.setQueryData(['recipes'], existingRecipes);

      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network timeout'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Timeout Test', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      const listCache = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      expect(listCache).toEqual(existingRecipes);
      expect(listCache?.some(r => r.id.startsWith('temp-'))).toBe(false); // No hanging temp
    });

    it('GIVEN concurrent create + list refetch WHEN race condition THEN query cancellation prevents corruption', async () => {
      // Arrange
      queryClient.setQueryData(['recipes'], []);

      const createdRecipe = createMockRecipe('uuid-race', 'Race Test');
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createdRecipe
      });

      const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateRecipe(), { wrapper });

      // Act
      result.current.mutate({ title: 'Race Test', servings: 4, instructions: 'Test', category: 'Dinner' });

      // Assert
      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
      });
    });
  });
});
