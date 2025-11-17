/**
 * API configuration
 */

export const API_CONFIG = {
  // In production, this should be set via environment variables
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://localhost:44322',
  
  ENDPOINTS: {
    RECIPES: '/api/Recipe',
    IMAGES: '/api/Images',
  },
  
  HEADERS: {
    'Content-Type': 'application/json',
  },

  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1-second base delay (exponential backoff)
} as const;

/**
 * Get the full URL for an API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};