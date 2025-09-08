import { API_CONFIG, getApiUrl } from '../config';

describe('API Configuration', () => {
  describe('API_CONFIG', () => {
    it('should have correct default configuration', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(API_CONFIG.ENDPOINTS.RECIPES).toBe('/api/recipes');
      expect(API_CONFIG.HEADERS['Content-Type']).toBe('application/json');
      expect(API_CONFIG.TIMEOUT).toBe(30000);
      expect(API_CONFIG.MAX_RETRIES).toBe(3);
      expect(API_CONFIG.RETRY_DELAY).toBe(1000);
    });

    it('should use environment variable for BASE_URL when available', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      
      // Mock environment variable
      process.env.EXPO_PUBLIC_API_URL = 'https://api.production.com';
      
      // Re-import to get new value
      jest.resetModules();
      const { API_CONFIG: config } = require('../config');
      
      expect(config.BASE_URL).toBe('https://api.production.com');
      
      // Restore original
      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('getApiUrl', () => {
    it('should construct full API URL', () => {
      const endpoint = '/api/test';
      const url = getApiUrl(endpoint);
      
      expect(url).toBe(`${API_CONFIG.BASE_URL}${endpoint}`);
    });

    it('should handle endpoints with query parameters', () => {
      const endpoint = '/api/recipes?userId=123&limit=10';
      const url = getApiUrl(endpoint);
      
      expect(url).toContain('userId=123');
      expect(url).toContain('limit=10');
    });

    it('should handle endpoints with path parameters', () => {
      const endpoint = '/api/recipes/123';
      const url = getApiUrl(endpoint);
      
      expect(url).toContain('/api/recipes/123');
    });
  });
});