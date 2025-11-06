import { fetchClient } from '../fetch-client';

// Mock global fetch
global.fetch = jest.fn();
global.clearTimeout = jest.fn();
const originalSetTimeout = global.setTimeout;

// Mock console for development logging tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const mockConsoleLog = jest.fn();
const mockConsoleWarn = jest.fn();

/**
 * Unit tests for fetchClient singleton
 *
 * Tests an HTTP client with timeout, retry, and automatic authentication.
 * Uses a solitary testing approach with mocked fetch and auth functions.
 *
 * Risk-Based Priority: HIGH
 * - Core infrastructure for all API calls
 * - Authentication injection is a critical security requirement-Retry logic affects reliability
 *
 * 2025 Patterns:
 * - Singleton state reset in beforeEach
 * - Tests behavior, not implementation
 * - Semantic assertions for clarity
 */
describe('fetchClient', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;

    // CRITICAL: Reset singleton state between tests (2025 pattern)
    (fetchClient as any).getAccessToken = null;

    // Reset __DEV__ to false for each test
    (global as any).__DEV__ = false;

    // Mock setTimeout to avoid real timers in tests
    global.setTimeout = jest.fn().mockImplementation(() => {
      // Return a mock timer ID without actually creating a timer
      return 123 as any;
    }) as any;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    // Restore original setTimeout
    global.setTimeout = originalSetTimeout;
    // Restore original __DEV__
    (global as any).__DEV__ = originalDev;
  });

  afterAll(() => {
    // Final cleanup to ensure no leaks
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  /**
   * AUTHENTICATION CONFIGURATION TESTS
   * Test the singleton configuration and token injection behavior
   */
  describe('configure', () => {
    /**
     * HAPPY PATH: Configuration sets up authentication
     * Given: A valid getAccessToken function
     * When: configure() is called
     * Then: fetchClient stores the auth function
     */
    it('given valid getAccessToken function, when configure called, then stores authentication function', () => {
      // Arrange
      const mockGetAccessToken = jest.fn().mockResolvedValue('token-123');

      // Act
      fetchClient.configure(mockGetAccessToken);

      // Assert
      expect((fetchClient as any).getAccessToken).toBe(mockGetAccessToken);
    });

    /**
     * DEV EXPERIENCE: Logs configuration success in development
     * Given: Development mode enabled
     * When: configure() is called
     * Then: Logs success message
     */
    it('given development mode, when configure called, then logs configuration success', () => {
      // Arrange
      (global as any).__DEV__ = true;
      const mockGetAccessToken = jest.fn();

      // Act
      fetchClient.configure(mockGetAccessToken);

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ FetchClient configured with authentication');
    });

    /**
     * PRODUCTION: No logging in production mode
     * Given: Development mode disabled
     * When: configure() is called
     * Then: Does not log
     */
    it('given production mode, when configure called, then does not log', () => {
      // Arrange
      (global as any).__DEV__ = false;
      const mockGetAccessToken = jest.fn();

      // Act
      fetchClient.configure(mockGetAccessToken);

      // Assert
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  /**
   * AUTHENTICATION INJECTION TESTS * that Bearer tokens are correctly injected into requests
   */
  describe('request - Authentication', () => {
    /**
     * HAPPY PATH: Injects Bearer token when configured
     * Given: fetchClient configured with getAccessToken
     * When: request() is called
     * Then: Authorization header includes Bearer token
     */
    it('given fetchClient configured, when request called, then injects Bearer token', async () => {
      // Arrange
      const mockToken = 'test-token-123';
      const mockGetAccessToken = jest.fn().mockResolvedValue(mockToken);
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      await fetchClient.request('https://api.example.com/test', {
        method: 'GET',
      });

      // Assert
      expect(mockGetAccessToken).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    /**
     * EDGE CASE: Makes request without token when not configured
     * Given: fetchClient not configured
     * When: request() is called
     * Then: No Authorization header added
     */
    it('given fetchClient not configured, when request called, then makes request without token', async () => {
      // Arrange
      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      await fetchClient.request('https://api.example.com/test', {
        method: 'GET',
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal),
        })
      );
      // Verify no Authorization header was added
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers?.Authorization).toBeUndefined();
    });

    /**
     * EDGE CASE: Makes request without token when getAccessToken returns null
     * Given: getAccessToken returns null
     * When: request() is called
     * Then: No Authorization header added
     */
    it('given getAccessToken returns null, when request called, then makes request without token', async () => {
      // Arrange
      const mockGetAccessToken = jest.fn().mockResolvedValue(null);
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      await fetchClient.request('https://api.example.com/test');

      // Assert
      expect(mockGetAccessToken).toHaveBeenCalled();
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers?.Authorization).toBeUndefined();
    });

    /**
     * ERROR HANDLING: Handles token acquisition errors gracefully
     * Given: getAccessToken throws error
     * When: request() is called
     * Then: Continues request without a token and does not throw
     */
    it('given getAccessToken throws error, when request called, then continues without token', async () => {
      // Arrange
      const mockGetAccessToken = jest.fn().mockRejectedValue(new Error('Token acquisition failed'));
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act & Assert - should not throw
      await expect(fetchClient.request('https://api.example.com/test')).resolves.toBeTruthy();

      // Should have attempted to get token
      expect(mockGetAccessToken).toHaveBeenCalled();

      // Should have made a request without a token
      expect(global.fetch).toHaveBeenCalled();
    });

    /**
     * DEV EXPERIENCE: Warns when token acquisition fails in development
     * Given: Development mode and getAccessToken throws error
     * When: request() is called
     * Then: Logs warning
     */
    it('given development mode and token error, when request called, then logs warning', async () => {
      // Arrange
      (global as any).__DEV__ = true;
      const tokenError = new Error('Token acquisition failed');
      const mockGetAccessToken = jest.fn().mockRejectedValue(tokenError);
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      await fetchClient.request('https://api.example.com/test');

      // Assert
      expect(mockConsoleWarn).toHaveBeenCalledWith('⚠️ Failed to get access token:', tokenError);
    });

    /**
     * BOUNDARY CASE: Preserves manually provided Authorization header
     * Given: Headers include Authorization
     * When: request() is called with configured auth
     * Then: Uses provided header, not injected token
     */
    it('given Authorization header provided, when request called, then preserves manual header', async () => {
      // Arrange
      const mockGetAccessToken = jest.fn().mockResolvedValue('auto-token');
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const manualToken = 'manual-token-override';

      // Act
      await fetchClient.request('https://api.example.com/test', {
        headers: {
          Authorization: `Bearer ${manualToken}`,
        },
      });

      // Assert
      // Should not call getAccessToken if Authorization already present
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${manualToken}`,
          }),
        })
      );
    });

    /**
     * DEV EXPERIENCE: Logs auth status in development
     * Given: Development mode and configured auth
     * When: request() is called
     * Then: Logs hasAuth flag
     */
    it('given development mode, when request called with auth, then logs auth status', async () => {
      // Arrange
      (global as any).__DEV__ = true;
      const mockGetAccessToken = jest.fn().mockResolvedValue('token-123');
      fetchClient.configure(mockGetAccessToken);

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      await fetchClient.request('https://api.example.com/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔵 API Request [POST]'),
        expect.objectContaining({
          hasAuth: true,
        })
      );
    });
  });

  /**
   * EXISTING REQUEST TESTS
   * Rewritten for singleton pattern
   */
  describe('request', () => {
    it('should make a successful request and log in development', async () => {
      // Enable development mode for logging
      (global as any).__DEV__ = true;

      const mockResponse = new Response('{"data": "test"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchClient.request('https://api.example.com/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });

      // Test main functionality
      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          signal: expect.any(AbortSignal),
        })
      );

      // Test logging side effect
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔵 API Request [POST]'),
        expect.objectContaining({
          body: { test: 'data' },
          attempt: 1,
        })
      );
    });

    it('should make a successful request without logging in production', async () => {
      // Disable development mode
      (global as any).__DEV__ = false;

      const mockResponse = new Response('{"data": "test"}', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchClient.request('https://api.example.com/test', {
        method: 'GET',
      });

      // Test main functionality
      expect(result).toBe(mockResponse);

      // Test no logging in production
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should handle request with no body and log correctly', async () => {
      // Enable development mode
      (global as any).__DEV__ = true;

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await fetchClient.request('https://api.example.com/test', {
        method: 'GET',
      });

      // Test main functionality
      expect(result.status).toBe(200);

      // Test logging with an undefined body
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔵 API Request [GET]'),
        expect.objectContaining({
          body: undefined,
          attempt: 1,
        })
      );
    });


    it('should retry on network failure and log errors in development', async () => {
      // Enable development mode for error logging
      (global as any).__DEV__ = true;

      // Mock the sleep function to avoid delays in tests
      const sleepSpy = jest.spyOn(fetchClient as any, 'sleep');
      sleepSpy.mockImplementation(() => Promise.resolve());

      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(new Response('{"success": true}', { status: 200 }));
      });

      try {
        const result = await fetchClient.request('https://api.example.com/test', {
          retries: 3,
          retryDelay: 10,
        });

        // Test main functionality
        expect(result.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledTimes(3);

        // Test error logging during retries
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('⚠️ API Error (attempt 1/3):'),
          'Network error'
        );
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('⚠️ API Error (attempt 2/3):'),
          'Network error'
        );
      } finally {
        sleepSpy.mockRestore();
      }
    });

    it('should handle timeout and transform error message', async () => {
      // Enable development mode
      (global as any).__DEV__ = true;

      const sleepSpy = jest.spyOn(fetchClient as any, 'sleep');
      sleepSpy.mockImplementation(() => Promise.resolve());

      // Mock AbortError (timeout)
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      try {
        await expect(
          fetchClient.request('https://api.example.com/test', {
            retries: 2,
            timeout: 5000,
          })
        ).rejects.toThrow('Request timeout after 5000ms');

        // Should log the transformed timeout error
        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('⚠️ API Error (attempt 1/2):'),
          'Request timeout after 5000ms'
        );
      } finally {
        sleepSpy.mockRestore();
      }
    });


    it('should apply exponential backoff on retries', async () => {
      const sleepSpy = jest.spyOn(fetchClient as any, 'sleep');
      sleepSpy.mockImplementation(() => Promise.resolve());

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('OK', { status: 200 }));

      try {
        await fetchClient.request('https://api.example.com/test', {
          retries: 3,
          retryDelay: 100,
        });

        expect(sleepSpy).toHaveBeenCalledTimes(2);
        expect(sleepSpy).toHaveBeenNthCalledWith(1, 100); // First retry: 100 ms
        expect(sleepSpy).toHaveBeenNthCalledWith(2, 200); // Second retry: 200 ms (exponential)
      } finally {
        sleepSpy.mockRestore();
      }
    });

    it('should not retry after max attempts', async () => {
      // Mock the sleep function to avoid delays in tests
      const sleepSpy = jest.spyOn(fetchClient as any, 'sleep');
      sleepSpy.mockImplementation(() => Promise.resolve());

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await expect(
          fetchClient.request('https://api.example.com/test', {
            retries: 2,
            retryDelay: 10,
          })
        ).rejects.toThrow('Network error');

        expect(global.fetch).toHaveBeenCalledTimes(2);
      } finally {
        sleepSpy.mockRestore();
      }
    });

    it('should preserve custom headers in requests', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/json',
      };

      await fetchClient.request('https://api.example.com/test', {
        method: 'POST',
        headers: customHeaders,
        body: JSON.stringify({ data: 'test' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining(customHeaders),
          body: JSON.stringify({ data: 'test' }),
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should handle different HTTP methods correctly', async () => {
      const mockResponse = new Response('OK', { status: 200 });

      // Test PUT method
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await fetchClient.request('https://api.example.com/test', { method: 'PUT' });
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PUT' })
      );

      // Test DELETE method
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await fetchClient.request('https://api.example.com/test', { method: 'DELETE' });
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );

      // Test PATCH method
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      await fetchClient.request('https://api.example.com/test', { method: 'PATCH' });
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should handle JSON.parse errors in development logging gracefully', async () => {
      // Enable development mode
      (global as any).__DEV__ = true;

      const mockResponse = new Response('OK', { status: 200 });
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Create a body that will cause JSON.parse to fail
      const invalidJsonBody = '{"invalid": json}'; // Missing quotes around 'json'

      // The request should still succeed despite the logging error
      const result = await fetchClient.request('https://api.example.com/test', {
        method: 'POST',
        body: invalidJsonBody,
      });

      expect(result.status).toBe(200);
      // Should still attempt to log, even if JSON.parse fails
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔵 API Request [POST]'),
        expect.objectContaining({
          body: undefined, // Should fall back to undefined when JSON.parse fails
          attempt: 1,
        })
      );
    });

    it('should handle different content-type headers correctly in parseResponse', async () => {
      // Test application/json with charset
      const jsonResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
        json: () => Promise.resolve({ data: 'test' })
      } as Response;

      const result = await fetchClient.parseResponse(jsonResponse);
      expect(result).toEqual({ data: 'test' });

      // Test text/plain (non-JSON)
      const textResponse = {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: () => Promise.resolve()
      } as Response;

      const textResult = await fetchClient.parseResponse(textResponse);
      expect(textResult).toBeUndefined();

      // Test missing content-type header
      const noContentTypeResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve()
      } as Response;

      const noContentTypeResult = await fetchClient.parseResponse(noContentTypeResponse);
      expect(noContentTypeResult).toBeUndefined();
    });
  });

  describe('parseResponse', () => {
    it('should parse JSON response successfully', async () => {
      const mockData = { id: '123', name: 'Test' };
      const mockResponse = new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await fetchClient.parseResponse(mockResponse);
      expect(result).toEqual(mockData);
    });

    it('should handle 204 No Content', async () => {
      const mockResponse = new Response(null, { status: 204 });
      const result = await fetchClient.parseResponse(mockResponse);
      expect(result).toBeUndefined();
    });

    it('should throw ProblemDetails for error responses', async () => {
      const problemDetails = {
        type: 'https://example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
      };

      const mockResponse = new Response(JSON.stringify(problemDetails), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

      await expect(fetchClient.parseResponse(mockResponse)).rejects.toEqual(problemDetails);
    });

    it('should handle non-JSON error responses', async () => {
      const mockResponse = new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'text/plain' },
      });

      await expect(fetchClient.parseResponse(mockResponse)).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should handle malformed JSON in error response', async () => {
      const mockResponse = new Response('{"error": "bad json"', {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      // Override json() to throw
      Object.defineProperty(mockResponse, 'json', {
        value: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(fetchClient.parseResponse(mockResponse)).rejects.toThrow();
    });

    it('should return undefined for successful non-JSON responses', async () => {
      const mockResponse = new Response('Health check OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });

      const result = await fetchClient.parseResponse(mockResponse);
      expect(result).toBeUndefined();
    });

    it('should handle non-ProblemDetails JSON errors with message fallback', async () => {
      // Test with a custom message
      const errorWithMessage = { message: 'Custom validation failed', code: 'ERR_001' };
      const responseWithMessage = new Response(JSON.stringify(errorWithMessage), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      });
      await expect(fetchClient.parseResponse(responseWithMessage)).rejects.toThrow('Custom validation failed');

      // Test fallback to statusText when no message
      const errorWithoutMessage = { code: 'ERR_001' };
      const responseWithoutMessage = new Response(JSON.stringify(errorWithoutMessage), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      });
      await expect(fetchClient.parseResponse(responseWithoutMessage)).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const networkError = new Error('Failed to fetch');
      expect(fetchClient.isRetryableError(networkError)).toBe(true);
    });

    it('should identify timeout errors as retryable', () => {
      const timeoutError = new Error('Request timeout after 30000ms');
      expect(fetchClient.isRetryableError(timeoutError)).toBe(true);
    });

    it('should identify 5xx errors as retryable', () => {
      const serverError = {
        type: 'https://example.com/errors/internal',
        status: 500,
        title: 'Internal Server Error',
      };
      expect(fetchClient.isRetryableError(serverError)).toBe(true);
    });

    it('should not retry 4xx errors', () => {
      const clientError = {
        type: 'https://example.com/errors/bad-request',
        status: 400,
        title: 'Bad Request',
      };
      expect(fetchClient.isRetryableError(clientError)).toBe(false);
    });

  });
});
