/**
 * API configuration
 */

export const API_CONFIG = {
  // Default to localhost for development
  // In production, this should be set via environment variables
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://localhost:7117',
  
  ENDPOINTS: {
    RECIPES: '/api/recipes',
  },
  
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Get the full URL for an API endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};