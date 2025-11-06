import { API_CONFIG, getApiUrl } from './config';
import {
  RecipeRequestDto,
  RecipeResponseDto,
  ProblemDetails
} from '../types';
import {
  parseRecipeResponse,
  parseRecipeRequest,
  safeParseRecipeResponse
} from '../schemas';
import { fetchClient } from './fetch-client';

/**
 * API response wrapper for success/error handling
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ProblemDetails | string };

/**
 * Recipe API service
 * Handles all recipe-related API operations
 */
export class RecipeService {
  private static headers = API_CONFIG.HEADERS;

  /**
   * Get all recipes with optional filters
   */
  static async getAllRecipes(
    userId?: string,
    limit?: number
  ): Promise<ApiResponse<RecipeResponseDto[]>> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (limit) params.append('limit', limit.toString());
      
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.RECIPES}?${params}`
        : API_CONFIG.ENDPOINTS.RECIPES;

      const response = await fetchClient.request(getApiUrl(url), {
        method: 'GET',
        headers: this.headers,
        timeout: API_CONFIG.TIMEOUT,
        retries: API_CONFIG.MAX_RETRIES,
        retryDelay: API_CONFIG.RETRY_DELAY,
      });

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      const data = await response.json();
      const validatedRecipes = data.map((recipe: unknown) =>
        parseRecipeResponse(recipe)
      );

      return { success: true, data: validatedRecipes };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Get a single recipe by ID
   */
  static async getRecipeById(id: string): Promise<ApiResponse<RecipeResponseDto>> {
    try {
      const response = await fetchClient.request(
        getApiUrl(`${API_CONFIG.ENDPOINTS.RECIPES}/${id}`),
        {
          method: 'GET',
          headers: this.headers,
          timeout: API_CONFIG.TIMEOUT,
          retries: API_CONFIG.MAX_RETRIES,
          retryDelay: API_CONFIG.RETRY_DELAY,
        }
      );

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      const data = await response.json();
      const validatedRecipe = parseRecipeResponse(data);
      
      return { success: true, data: validatedRecipe };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Search recipes by title
   */
  static async searchRecipesByTitle(title: string): Promise<ApiResponse<RecipeResponseDto[]>> {
    try {
      const params = new URLSearchParams({ title });
      const response = await fetchClient.request(
        getApiUrl(`${API_CONFIG.ENDPOINTS.RECIPES}/search?${params}`),
        {
          method: 'GET',
          headers: this.headers,
          timeout: API_CONFIG.TIMEOUT,
          retries: API_CONFIG.MAX_RETRIES,
          retryDelay: API_CONFIG.RETRY_DELAY,
        }
      );

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      const data = await response.json();
      const validatedRecipes = data.map((recipe: unknown) => 
        parseRecipeResponse(recipe)
      );
      
      return { success: true, data: validatedRecipes };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Create a new recipe
   */
  static async createRecipe(recipe: RecipeRequestDto): Promise<ApiResponse<RecipeResponseDto>> {
    try {
      // Validate request data before sending
      const validatedRequest = parseRecipeRequest(recipe);
      
      const response = await fetchClient.request(getApiUrl(API_CONFIG.ENDPOINTS.RECIPES), {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(validatedRequest),
        timeout: API_CONFIG.TIMEOUT,
        retries: API_CONFIG.MAX_RETRIES,
        retryDelay: API_CONFIG.RETRY_DELAY,
      });

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      const data = await response.json();
      const validatedRecipe = parseRecipeResponse(data);
      
      return { success: true, data: validatedRecipe };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Update an existing recipe
   */
  static async updateRecipe(
    id: string, 
    recipe: RecipeRequestDto
  ): Promise<ApiResponse<RecipeResponseDto>> {
    try {
      // Validate request data before sending
      const validatedRequest = parseRecipeRequest(recipe);
      
      const response = await fetchClient.request(
        getApiUrl(`${API_CONFIG.ENDPOINTS.RECIPES}/${id}`),
        {
          method: 'PUT',
          headers: this.headers,
          body: JSON.stringify(validatedRequest),
          timeout: API_CONFIG.TIMEOUT,
          retries: API_CONFIG.MAX_RETRIES,
          retryDelay: API_CONFIG.RETRY_DELAY,
        }
      );

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      const data = await response.json();
      const validatedRecipe = parseRecipeResponse(data);
      
      return { success: true, data: validatedRecipe };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Delete a recipe
   */
  static async deleteRecipe(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetchClient.request(
        getApiUrl(`${API_CONFIG.ENDPOINTS.RECIPES}/${id}`),
        {
          method: 'DELETE',
          headers: this.headers,
          timeout: API_CONFIG.TIMEOUT,
          retries: API_CONFIG.MAX_RETRIES,
          retryDelay: API_CONFIG.RETRY_DELAY,
        }
      );

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        return { success: false, error };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Handle error responses from the API
   */
  private static async handleErrorResponse(response: Response): Promise<ProblemDetails | string> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/problem+json')) {
        // RFC 9457 Problem Details response
        return await response.json() as ProblemDetails;
      }
      
      // Try to parse as JSON
      if (contentType?.includes('application/json')) {
        const error = await response.json();
        
        // Check if it's a ProblemDetails structure
        if (error.type || error.title || error.status) {
          return error as ProblemDetails;
        }
        
        return error.message || JSON.stringify(error);
      }
      
      // Fallback to text
      return await response.text() || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  /**
   * Handle exceptions during API calls
   */
  private static handleException(error: unknown): ApiResponse<any> {
    if (error instanceof Error) {
      // Check for network errors
      if (error.message === 'Failed to fetch') {
        return { 
          success: false, 
          error: 'Network error: Unable to reach the server. Please check your connection.' 
        };
      }
      
      // Zod validation errors
      if (error.message.includes('Invalid')) {
        return { 
          success: false, 
          error: `Validation error: ${error.message}` 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'An unexpected error occurred' };
  }
}