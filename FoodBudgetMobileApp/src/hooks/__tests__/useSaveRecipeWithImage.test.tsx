import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSaveRecipeWithImage } from '../useSaveRecipeWithImage';
import { RecipeService, ImageUploadService, RecipeResponseDto, RecipeRequestDto } from '../../lib/shared';
import type { CompressedImageResult } from '../../utils/imageCompression';
import * as FileSystem from 'expo-file-system';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '550e8400-e29b-41d4-a716-446655440000'),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
}));

// Mock RecipeService and ImageUploadService
jest.mock('../../lib/shared', () => ({
  ...jest.requireActual('../../lib/shared'),
  RecipeService: {
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
  },
  ImageUploadService: {
    getUploadToken: jest.fn(),
  },
}));

// Helper to create mock recipe data
const createMockRecipe = (id: string, title: string): RecipeResponseDto => ({
  id,
  title,
  instructions: 'Test cooking instructions',
  category: 'Dinner',
  servings: 4,
  imageUrl: null,
  createdAt: new Date().toISOString(),
  userId: 'user-123',
});

const createMockCompressedImage = (): CompressedImageResult => ({
  uri: 'file:///path/to/compressed.jpg',
  width: 1920,
  height: 1080,
  fileSize: 500000, // 500KB
});

describe('useSaveRecipeWithImage', () => {
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
  // Critical sequential upload-then-save logic
  // ==========================================

  describe('RISK-BASED PRIORITY: Sequential Upload-Then-Save', () => {
    it('GIVEN recipe with image WHEN save is triggered THEN uploads image before creating recipe', async () => {
      // GIVEN: Setup mocks for upload token and recipe creation
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        instructions: 'Test instructions',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(), // 10 min
      };
      const mockCreatedRecipe = createMockRecipe('recipe-1', 'New Recipe');
      mockCreatedRecipe.imageUrl = mockUploadToken.publicUrl;

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCreatedRecipe,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with image
      await act(async () => {
        await result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage });
      });

      // THEN: Upload token should be requested first
      expect(ImageUploadService.getUploadToken).toHaveBeenCalledWith({
        fileName: 'compressed.jpg',
        contentType: 'image/jpeg',
        fileSizeBytes: 500000,
      });

      // THEN: Blob upload should be called with the correct URL and data
      expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
        mockUploadToken.uploadUrl,
        mockImage.uri,
        expect.objectContaining({
          httpMethod: 'PUT',
          headers: expect.objectContaining({
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': 'image/jpeg',
          }),
        })
      );

      // THEN: Recipe should be created with imageUrl from upload
      expect(RecipeService.createRecipe).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockRecipeData,
          imageUrl: mockUploadToken.publicUrl,
        })
      );
    });

    it('GIVEN recipe without image WHEN save is triggered THEN skips upload and saves recipe directly', async () => {
      // GIVEN: Recipe data without image
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        instructions: 'Test instructions',
        category: 'Dinner',
        servings: 4,
      };
      const mockCreatedRecipe = createMockRecipe('recipe-1', 'New Recipe');

      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCreatedRecipe,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves without image
      await act(async () => {
        await result.current.mutateAsync({ recipe: mockRecipeData });
      });

      // THEN: Upload should NOT be called
      expect(ImageUploadService.getUploadToken).not.toHaveBeenCalled();
      expect(FileSystem.uploadAsync).not.toHaveBeenCalled();

      // THEN: Recipe should be created directly
      expect(RecipeService.createRecipe).toHaveBeenCalledWith(mockRecipeData);
    });

    it('GIVEN recipe with ID WHEN save is triggered with image THEN uploads image and updates recipe', async () => {
      // GIVEN: Existing recipe with ID
      const existingRecipe = createMockRecipe('recipe-1', 'Existing Recipe');
      const mockRecipeData: RecipeRequestDto = {
        title: 'Updated Recipe',
        instructions: 'Updated instructions',
        category: 'Lunch',
        servings: 2,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
      const mockUpdatedRecipe = { ...existingRecipe, ...mockRecipeData, imageUrl: mockUploadToken.publicUrl };

      queryClient.setQueryData(['recipe', 'recipe-1'], existingRecipe);

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.updateRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUpdatedRecipe,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with ID (update) and image
      await act(async () => {
        await result.current.mutateAsync({
          recipeId: 'recipe-1',
          recipe: mockRecipeData,
          image: mockImage
        });
      });

      // THEN: Should call update recipe, not create
      expect(RecipeService.updateRecipe).toHaveBeenCalledWith(
        'recipe-1',
        expect.objectContaining({
          ...mockRecipeData,
          imageUrl: mockUploadToken.publicUrl,
        })
      );
      expect(RecipeService.createRecipe).not.toHaveBeenCalled();
    });

    it('GIVEN upload fails WHEN save is triggered THEN throws error and does not save recipe', async () => {
      // GIVEN: Setup for upload failure
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to get upload token',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with image that will fail upload
      // THEN: Should throw error
      await expect(
        result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage })
      ).rejects.toThrow();

      // THEN: Recipe save should NOT be called
      expect(RecipeService.createRecipe).not.toHaveBeenCalled();
    });

    it('GIVEN blob upload fails WHEN save is triggered THEN throws error and does not save recipe', async () => {
      // GIVEN: Setup for blob upload failure
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 500 });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with image that will fail blob upload
      // THEN: Should throw error
      await expect(
        result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage })
      ).rejects.toThrow('Failed to upload image to Azure Blob Storage');

      // THEN: Recipe save should NOT be called
      expect(RecipeService.createRecipe).not.toHaveBeenCalled();
    });

    it('GIVEN recipe save fails after successful upload WHEN save is triggered THEN throws error with save failure', async () => {
      // GIVEN: Setup for recipe save failure after successful upload
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to create recipe',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger save - upload succeeds but recipe save fails
      // THEN: Should throw error about recipe save failure
      await expect(
        result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage })
      ).rejects.toThrow('Failed to create recipe');

      // Note: In production, orphaned blob would exist but will be cleaned up by Azure lifecycle policy
    });
  });

  // ==========================================
  // SECTION 2: HAPPY PATH
  // Primary success scenarios
  // ==========================================

  describe('HAPPY PATH: Successful Operations', () => {
    it('GIVEN valid recipe data with image WHEN save is triggered THEN optimistically updates cache before API responds', async () => {
      // GIVEN: Setup for successful creation with optimistic update
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
      const mockCreatedRecipe = createMockRecipe('recipe-1', 'New Recipe');
      mockCreatedRecipe.imageUrl = mockUploadToken.publicUrl;

      const existingRecipes = [createMockRecipe('recipe-2', 'Existing Recipe')];
      queryClient.setQueryData(['recipes'], existingRecipes);

      (ImageUploadService.getUploadToken as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockUploadToken,
        }), 200)) // Delay to allow checking optimistic state
      );
      (FileSystem.uploadAsync as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 201 }), 200))
      );
      (RecipeService.createRecipe as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockCreatedRecipe,
        }), 200))
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger save
      result.current.mutate({ recipe: mockRecipeData, image: mockImage });

      // THEN: Cache should be optimistically updated with temp recipe (before API responds)
      // Wait for onMutate to run and add temp recipe to cache
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        expect(cachedRecipes).toHaveLength(2);
      }, { timeout: 100 }); // Short timeout since onMutate should run immediately

      const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      expect(cachedRecipes?.[0].id).toContain('temp-'); // Temp ID should be first
      expect(cachedRecipes?.[0].title).toBe('New Recipe');
    });

    it('GIVEN successful recipe save WHEN API responds THEN replaces optimistic data with server response', async () => {
      // GIVEN: Setup for successful creation
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
      const mockCreatedRecipe = createMockRecipe('real-server-id-123', 'New Recipe');
      mockCreatedRecipe.imageUrl = mockUploadToken.publicUrl;

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCreatedRecipe,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves and waits for completion
      await act(async () => {
        await result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage });
      });

      // THEN: Cache should contain server response with real ID
      await waitFor(() => {
        const cachedRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
        const createdRecipe = cachedRecipes?.[0];
        expect(createdRecipe?.id).toBe('real-server-id-123'); // Server ID, not temp
        expect(createdRecipe?.imageUrl).toBe(mockUploadToken.publicUrl);
      });
    });
  });

  // ==========================================
  // SECTION 3: BUSINESS RULES
  // Enforce Azure Blob upload requirements
  // ==========================================

  describe('BUSINESS RULES: Azure Blob Upload', () => {
    it('GIVEN image upload WHEN uploading to Azure THEN uses correct BlockBlob headers', async () => {
      // GIVEN: Setup for image upload
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
      const mockCreatedRecipe = createMockRecipe('recipe-1', 'New Recipe');

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCreatedRecipe,
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with image
      await act(async () => {
        await result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage });
      });

      // THEN: Blob upload should use BlockBlob type header (Azure requirement)
      expect(FileSystem.uploadAsync).toHaveBeenCalledWith(
        mockUploadToken.uploadUrl,
        mockImage.uri,
        expect.objectContaining({
          httpMethod: 'PUT',
          headers: expect.objectContaining({
            'x-ms-blob-type': 'BlockBlob',
          }),
        })
      );
    });

    it('GIVEN image upload WHEN getting upload token THEN sends correct file metadata', async () => {
      // GIVEN: Setup for upload token request
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage: CompressedImageResult = {
        uri: 'file:///path/to/image.png',
        width: 1920,
        height: 1080,
        fileSize: 2500000, // 2.5MB
      };
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.png?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.png',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 201 });
      (RecipeService.createRecipe as jest.Mock).mockResolvedValue({
        success: true,
        data: createMockRecipe('recipe-1', 'New Recipe'),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN: Trigger saves with PNG image
      await act(async () => {
        await result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage });
      });

      // THEN: Upload token request should include correct metadata
      expect(ImageUploadService.getUploadToken).toHaveBeenCalledWith({
        fileName: 'image.png',
        contentType: 'image/png',
        fileSizeBytes: 2500000,
      });
    });
  });

  // ==========================================
  // SECTION 4: ERRORS
  // Error handling and edge cases
  // ==========================================

  describe('ERRORS: Network and Validation Errors', () => {
    it('GIVEN network error during upload token fetch WHEN save is triggered THEN throws network error', async () => {
      // GIVEN: Setup for network error
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Network error: Failed to fetch',
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN/THEN: Should throw network error
      await expect(
        result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage })
      ).rejects.toThrow('Network error: Failed to fetch');
    });

    it('GIVEN Azure returns non-201 status WHEN upload completes THEN throws upload error', async () => {
      // GIVEN: Setup for non-201 response from Azure
      const mockRecipeData: RecipeRequestDto = {
        title: 'New Recipe',
        category: 'Dinner',
        servings: 4,
      };
      const mockImage = createMockCompressedImage();
      const mockUploadToken = {
        uploadUrl: 'https://blob.storage.azure.net/images/test.jpg?sas=token',
        publicUrl: 'https://blob.storage.azure.net/images/test.jpg',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };

      (ImageUploadService.getUploadToken as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUploadToken,
      });
      (FileSystem.uploadAsync as jest.Mock).mockResolvedValue({ status: 403 });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSaveRecipeWithImage(), { wrapper });

      // WHEN/THEN: Should throw blob upload error
      await expect(
        result.current.mutateAsync({ recipe: mockRecipeData, image: mockImage })
      ).rejects.toThrow('Failed to upload image to Azure Blob Storage');
    });
  });
});