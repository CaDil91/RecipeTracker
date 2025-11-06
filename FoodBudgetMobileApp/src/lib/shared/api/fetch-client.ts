import { ProblemDetails } from '../types';

/**
 * Configuration options for fetch requests
 */
export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Enhanced fetch client with timeout, retry, and automatic authentication
 *
 * Singleton pattern - configure once in App.tsx, use everywhere
 * Follows 2025 best practices for React Native authentication
 */
class FetchClient {
  private getAccessToken: (() => Promise<string | null>) | null = null;

  private get isDevelopment() {
    return __DEV__ ?? false;
  }

  /**
   * Configure the fetch client with authentication
   *
   * Call this ONCE in App.tsx after authentication is initialized:
   * ```ts
   * const { getAccessToken } = useAuth();
   * fetchClient.configure(getAccessToken);
   * ```
   */
  configure(getAccessToken: () => Promise<string | null>): void {
    this.getAccessToken = getAccessToken;
    if (this.isDevelopment) {
      console.log('✅ FetchClient configured with authentication');
    }
  }

  /**
   * Make an HTTP request with timeout and retry support
   * Automatically injects Authorization header if configured
   */
  async request(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const {
      timeout = 30000, // 30 seconds default
      retries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    // Automatically inject Authorization header if configured
    // Only inject if Authorization header not already provided (preserves manual overrides)
    const hasManualAuth = fetchOptions.headers && 'Authorization' in fetchOptions.headers;

    if (this.getAccessToken && !hasManualAuth) {
      try {
        const token = await this.getAccessToken();
        if (token) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      } catch (error) {
        if (this.isDevelopment) {
          console.warn('⚠️ Failed to get access token:', error);
        }
        // Continue without token - API will return 401 if needed
      }
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Log request in development
        if (this.isDevelopment) {
          let parsedBody: any = undefined;
          if (fetchOptions.body) {
            try {
              parsedBody = JSON.parse(fetchOptions.body as string);
            } catch {
              // If JSON.parse fails, leave the body as undefined
              parsedBody = undefined;
            }
          }
          const headers = fetchOptions.headers as Record<string, string> | undefined;
          console.log(`🔵 API Request [${fetchOptions.method || 'GET'}] ${url}`, {
            body: parsedBody,
            attempt: attempt + 1,
            hasAuth: !!(headers && 'Authorization' in headers),
          });
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Log response in development
          if (this.isDevelopment) {
            const isSuccess = response.ok;
            const emoji = isSuccess ? '✅' : '❌';
            console.log(`${emoji} API Response [${response.status}] ${url}`);
          }

          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error as Error;

        // Don't retry on abort (timeout) or if it's the last attempt
        const isTimeout = lastError.name === 'AbortError';
        const isLastAttempt = attempt === retries - 1;

        if (isTimeout) {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        }

        if (this.isDevelopment) {
          console.log(`⚠️ API Error (attempt ${attempt + 1}/${retries}):`, lastError.message);
        }

        // Don't retry for client errors or last attempt
        if (isLastAttempt) {
          break;
        }

        // Exponential backoff for retries
        const delay = retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Parse response as JSON and handle ProblemDetails
   */
  async parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Check if it's a ProblemDetails response
      if (this.isProblemDetails(data)) {
        throw data; // Throw ProblemDetails directly to maintain RFC 9457 compliance
      }

      // Fallback for non-standard error responses
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  /**
   * Type guard for ProblemDetails
   */
  private isProblemDetails(obj: any): obj is ProblemDetails {
    return obj && (
      typeof obj.type === 'string' ||
      typeof obj.title === 'string' ||
      typeof obj.status === 'number' ||
      typeof obj.detail === 'string'
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if the error is retryable
   */
  isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error instanceof Error) {
      if (error.message.includes('fetch')) return true;
      if (error.message.includes('network')) return true;
      if (error.message.includes('timeout')) return true;
    }

    // Server errors (5xx) are retryable
    if (this.isProblemDetails(error) && error.status) {
      return error.status >= 500;
    }

    return false;
  }
}

/**
 * Singleton instance of FetchClient
 * Configure once in App.tsx, use everywhere
 */
export const fetchClient = new FetchClient();