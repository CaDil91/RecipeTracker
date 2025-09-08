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
 * Enhanced fetch with timeout, retry, and logging support
 */
export class FetchClient {
  private static get isDevelopment() {
    return __DEV__ ?? false;
  }

  /**
   * Make an HTTP request with timeout and retry support
   */
  static async request(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const {
      timeout = 30000, // 30 seconds default
      retries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

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
              // If JSON.parse fails, leave body as undefined
              parsedBody = undefined;
            }
          }
          console.log(`🔵 API Request [${fetchOptions.method || 'GET'}] ${url}`, {
            body: parsedBody,
            attempt: attempt + 1,
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
  static async parseResponse<T>(response: Response): Promise<T> {
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
  private static isProblemDetails(obj: any): obj is ProblemDetails {
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
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: any): boolean {
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