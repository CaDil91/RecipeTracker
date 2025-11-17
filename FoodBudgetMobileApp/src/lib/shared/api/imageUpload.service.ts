import { API_CONFIG, getApiUrl } from './config';
import {
  ImageUploadTokenRequestDto,
  ImageUploadTokenResponseDto,
  ProblemDetails,
} from '../types';
import { fetchClient } from './fetch-client';
import type { ApiResponse } from './recipe.service';

/**
 * Image Upload API service
 * Handles image upload token generation for Azure Blob Storage
 */
export class ImageUploadService {
  private static headers = API_CONFIG.HEADERS;

  /**
   * Get an upload token for uploading an image to Azure Blob Storage
   *
   * @param request Image upload token request with file metadata
   * @returns Upload token with SAS URLs and expiration
   */
  static async getUploadToken(
    request: ImageUploadTokenRequestDto
  ): Promise<ApiResponse<ImageUploadTokenResponseDto>> {
    try {
      const response = await fetchClient.request(
        getApiUrl(`${API_CONFIG.ENDPOINTS.IMAGES}/upload-token`),
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(request),
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

      return { success: true, data };
    } catch (error) {
      return this.handleException(error);
    }
  }

  /**
   * Handle error responses from the API
   */
  private static async handleErrorResponse(
    response: Response
  ): Promise<ProblemDetails | string> {
    try {
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/problem+json')) {
        // RFC 9457 Problem Details response
        return (await response.json()) as ProblemDetails;
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
      return (
        (await response.text()) ||
        `HTTP ${response.status}: ${response.statusText}`
      );
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  /**
   * Handle exceptions during API calls
   */
  private static handleException(error: unknown): ApiResponse<any> {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Network error: ${error.message}`,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}