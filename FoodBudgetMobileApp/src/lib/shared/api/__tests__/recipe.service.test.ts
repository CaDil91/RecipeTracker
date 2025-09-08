import { RecipeService } from '../recipe.service';
import { FetchClient } from '../fetch-client';
import { API_CONFIG } from '../config';
import { RecipeRequestDto, RecipeResponseDto, ProblemDetails } from '../../types';

// Mock FetchClient
jest.mock('../fetch-client');

// Mock the schema parsers
jest.mock('../../schemas', () => ({
  parseRecipeResponse: jest.fn((data) => data),
  parseRecipeRequest: jest.fn((data) => data),
  safeParseRecipeResponse: jest.fn((data) => ({ success: true, data })),
}));

describe('RecipeService', () => {
  const mockFetchClient = FetchClient as jest.MockedClass<typeof FetchClient>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRecipes', () => {
    it('should fetch all recipes successfully', async () => {
      const mockRecipes: RecipeResponseDto[] = [
        {
          id: '123',
          title: 'Test Recipe',
          instructions: 'Test instructions',
          servings: 4,
          createdAt: '2024-01-01T00:00:00Z',
          userId: 'user123',
        },
      ];

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockRecipes),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(true);
      if (!result.success) {
        throw new Error('Expected successful response but got: ' + result.error);
      }
      expect(result.data).toEqual(mockRecipes);
      expect(result.data[0].id).toBe('123'); // Verify specific field
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes'),
        expect.objectContaining({
          method: 'GET',
          headers: API_CONFIG.HEADERS,
        })
      );
    });

    it('should fetch recipes with userId and limit parameters', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([]),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      await RecipeService.getAllRecipes('user123', 10);

      // Verify the exact URL construction
      const callArgs = mockFetchClient.request.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('userId=user123');
      expect(url).toContain('limit=10');
      // Verify both params are in the same call
      expect(url).toMatch(/userId=user123.*limit=10|limit=10.*userId=user123/);
    });

    it('should handle API errors with ProblemDetails', async () => {
      const problemDetails: ProblemDetails = {
        type: 'https://example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Recipes not found',
      };

      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: jest.fn().mockResolvedValue(problemDetails),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(problemDetails);
      }
    });

    it('should handle network errors', async () => {
      mockFetchClient.request.mockRejectedValue(new Error('Failed to fetch'));

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Expected network error but got success');
      }
      expect(result.error).toContain('Network error');
    });

    it('should fail when schema validation rejects the data', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([{ invalid: 'data' }]),
      } as unknown as Response;

      // Mock schema validation to fail
      const mockParseRecipeResponse = require('../../schemas').parseRecipeResponse;
      mockParseRecipeResponse.mockImplementationOnce(() => {
        throw new Error('Invalid recipe format: missing required fields');
      });

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Expected validation error but got success');
      }
      expect(result.error).toContain('Validation error');
      expect(result.error).toContain('Invalid recipe format');
    });
  });

  describe('getRecipeById', () => {
    it('should fetch a single recipe successfully', async () => {
      const mockRecipe: RecipeResponseDto = {
        id: '123',
        title: 'Test Recipe',
        instructions: 'Test instructions',
        servings: 4,
        createdAt: '2024-01-01T00:00:00Z',
        userId: 'user123',
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockRecipe),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getRecipeById('123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockRecipe);
      }
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes/123'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle 404 not found', async () => {
      const problemDetails: ProblemDetails = {
        type: 'https://example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Recipe with ID 999 not found',
      };

      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: jest.fn().mockResolvedValue(problemDetails),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getRecipeById('999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(problemDetails);
      }
    });
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      const newRecipe: RecipeRequestDto = {
        title: 'New Recipe',
        instructions: 'Instructions',
        servings: 2,
        userId: 'user123',
      };

      const createdRecipe: RecipeResponseDto = {
        id: '456',
        ...newRecipe,
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(createdRecipe),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.createRecipe(newRecipe);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(createdRecipe);
      }
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newRecipe),
        })
      );
    });

    it('should handle validation errors', async () => {
      const problemDetails: ProblemDetails = {
        type: 'https://example.com/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'One or more validation errors occurred',
        errors: {
          title: ['Title is required'],
          servings: ['Servings must be between 1 and 100'],
        },
      };

      const mockResponse = {
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: jest.fn().mockResolvedValue(problemDetails),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const invalidRecipe: RecipeRequestDto = {
        title: '',
        servings: 0,
      };

      const result = await RecipeService.createRecipe(invalidRecipe);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(problemDetails);
      }
    });
  });

  describe('updateRecipe', () => {
    it('should update a recipe successfully', async () => {
      const updatedRecipe: RecipeRequestDto = {
        title: 'Updated Recipe',
        instructions: 'Updated instructions',
        servings: 6,
      };

      const returnedRecipe: RecipeResponseDto = {
        id: '123',
        ...updatedRecipe,
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(returnedRecipe),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.updateRecipe('123', updatedRecipe);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(returnedRecipe);
      }
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes/123'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updatedRecipe),
        })
      );
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.deleteRecipe('123');

      expect(result.success).toBe(true);
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes/123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle delete of non-existent recipe', async () => {
      const problemDetails: ProblemDetails = {
        type: 'https://example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Recipe not found',
      };

      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/problem+json' }),
        json: jest.fn().mockResolvedValue(problemDetails),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.deleteRecipe('999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(problemDetails);
      }
    });
  });

  describe('searchRecipesByTitle', () => {
    it('should search recipes by title successfully', async () => {
      const mockRecipes: RecipeResponseDto[] = [
        {
          id: '123',
          title: 'Pasta Carbonara',
          instructions: 'Instructions',
          servings: 4,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockRecipes),
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.searchRecipesByTitle('Pasta');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockRecipes);
      }
      expect(mockFetchClient.request).toHaveBeenCalledWith(
        expect.stringContaining('/api/recipes/search?title=Pasta'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle non-JSON error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Map([['content-type', 'text/plain']]),
        text: jest.fn().mockResolvedValue('Internal Server Error'),
        statusText: 'Internal Server Error',
      } as unknown as Response;

      mockFetchClient.request.mockResolvedValue(mockResponse);

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Internal Server Error');
      }
    });

    it('should handle timeout errors', async () => {
      mockFetchClient.request.mockRejectedValue(new Error('Request timeout after 30000ms'));

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Request timeout after 30000ms');
      }
    });

    it('should handle validation exceptions from Zod', async () => {
      mockFetchClient.request.mockRejectedValue(new Error('Invalid recipe format'));

      const result = await RecipeService.getAllRecipes();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation error');
      }
    });
  });
});