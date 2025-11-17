import { ImageUploadService } from '../imageUpload.service';
import { fetchClient } from '../fetch-client';
import {
  ImageUploadTokenRequestDto,
  ImageUploadTokenResponseDto,
  ProblemDetails,
} from '../../types';

/**
 * Unit tests for ImageUploadService
 *
 * Tests the upload token API client following the RecipeService pattern.
 * Uses a solitary testing approach with mocked fetchClient.
 *
 * Risk-Based Priority: HIGH
 * - Critical for image upload workflow
 * - Security-sensitive (SAS token generation)
 * - Error handling complexity (validation, auth, network)
 */

// Mock fetchClient singleton (2025 pattern)
jest.mock('../fetch-client', () => ({
  fetchClient: {
    request: jest.fn(),
    configure: jest.fn(),
    parseResponse: jest.fn(),
    isRetryableError: jest.fn(),
  },
}));

describe('ImageUploadService', () => {
  const mockRequest = fetchClient.request as jest.MockedFunction<
    typeof fetchClient.request
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadToken', () => {
    /**
     * Risk-Based Priority
     * Test high-risk, high-value code first: complex business logic, frequently changing code,
     * previously buggy code, critical workflows
     */
    describe('Risk-Based Priority', () => {
      it('given valid request, when getUploadToken called, then returns upload token with SAS URLs and expiration', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: 'recipe-photo.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048576, // 2MB
        };

        const mockResponse: ImageUploadTokenResponseDto = {
          uploadUrl:
            'https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/abc-123.jpg?sas-token',
          publicUrl:
            'https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/abc-123.jpg',
          expiresAt: '2025-01-13T12:00:00Z',
        };

        const mockFetchResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockResponse),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as unknown as Response;

        mockRequest.mockResolvedValue(mockFetchResponse);

        // Act
        const result = await ImageUploadService.getUploadToken(request);

        // Assert
        expect(result.success).toBe(true);
        if (!result.success) {
          throw new Error('Expected successful response');
        }
        expect(result.data.uploadUrl).toBe(mockResponse.uploadUrl);
        expect(result.data.publicUrl).toBe(mockResponse.publicUrl);
        expect(result.data.expiresAt).toBe(mockResponse.expiresAt);
      });
    });

    /**
     * Happy Path
     * Test the primary use case that delivers business value
     */
    describe('Happy Path', () => {
      it('given valid image metadata, when getUploadToken called, then sends POST to correct endpoint with request body', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: 'test-image.png',
          contentType: 'image/png',
          fileSizeBytes: 1024000, // ~1MB
        };

        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({
            uploadUrl: 'https://example.com/upload',
            publicUrl: 'https://example.com/public',
            expiresAt: '2025-01-13T12:00:00Z',
          }),
        } as unknown as Response;

        mockRequest.mockResolvedValue(mockResponse);

        // Act
        await ImageUploadService.getUploadToken(request);

        // Assert
        expect(mockRequest).toHaveBeenCalledWith(
          expect.stringContaining('/api/Images/upload-token'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(request),
          })
        );
      });
    });

    /**
     * Null/Empty/Invalid
     * Verify graceful handling of edge cases and malformed data
     */
    describe('Null/Empty/Invalid', () => {
      it('given API returns 400 with ProblemDetails, when validation fails, then returns error response', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: '',
          contentType: 'image/jpeg',
          fileSizeBytes: 999999999, // Too large
        };

        const problemDetails: ProblemDetails = {
          type: 'https://example.com/errors/validation',
          title: 'Validation Error',
          status: 400,
          detail: 'File size must be between 1 byte and 10MB',
        };

        const mockResponse = {
          ok: false,
          status: 400,
          headers: new Headers({ 'content-type': 'application/problem+json' }),
          json: jest.fn().mockResolvedValue(problemDetails),
        } as unknown as Response;

        mockRequest.mockResolvedValue(mockResponse);

        // Act
        const result = await ImageUploadService.getUploadToken(request);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toEqual(problemDetails);
        }
      });

      it('given API returns 401, when unauthorized, then returns authentication error response', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048000,
        };

        const problemDetails: ProblemDetails = {
          type: 'https://example.com/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required',
        };

        const mockResponse = {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/problem+json' }),
          json: jest.fn().mockResolvedValue(problemDetails),
        } as unknown as Response;

        mockRequest.mockResolvedValue(mockResponse);

        // Act
        const result = await ImageUploadService.getUploadToken(request);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toEqual(problemDetails);
        }
      });
    });

    /**
     * Errors
     * Verify appropriate error responses and cleanup behavior
     */
    describe('Errors', () => {
      it('given network error, when request fails, then returns network error response', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048000,
        };

        mockRequest.mockRejectedValue(new Error('Failed to fetch'));

        // Act
        const result = await ImageUploadService.getUploadToken(request);

        // Assert
        expect(result.success).toBe(false);
        if (result.success) {
          throw new Error('Expected network error');
        }
        expect(result.error).toContain('Network error');
      });

      it('given API returns 500 with ProblemDetails, when server error occurs, then returns server error response', async () => {
        // Arrange
        const request: ImageUploadTokenRequestDto = {
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSizeBytes: 2048000,
        };

        const problemDetails: ProblemDetails = {
          type: 'https://example.com/errors/server-error',
          title: 'Internal Server Error',
          status: 500,
          detail: 'Failed to generate upload token',
        };

        const mockResponse = {
          ok: false,
          status: 500,
          headers: new Headers({ 'content-type': 'application/problem+json' }),
          json: jest.fn().mockResolvedValue(problemDetails),
        } as unknown as Response;

        mockRequest.mockResolvedValue(mockResponse);

        // Act
        const result = await ImageUploadService.getUploadToken(request);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toEqual(problemDetails);
        }
      });
    });
  });
});