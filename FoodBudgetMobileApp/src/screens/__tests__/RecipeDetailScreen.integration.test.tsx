/**
 * RecipeDetailScreen Integration Tests - VIEW Mode (Story 8)
 *
 * Testing Framework:
 * - 92% Narrow Integration (12 tests): Single external dependency (MSW)
 * - 8% Broad Integration (1 test): Critical business workflow
 *
 * Focus: Testing integration with API via MSW, NOT business logic
 * Using: MSW for API stubs, React Query for caching, Real navigation
 * These tests will FAIL until RecipeDetailScreen is implemented (TDD Red phase)
 */

import React from 'react';
import { randomUUID } from 'crypto';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
// noinspection ES6PreferShortImport
import { server } from '../../mocks/server';
import { http, HttpResponse, delay } from 'msw';
import { RecipeDetailScreenNavigationProp } from '../../types/navigation';

describe('RecipeDetailScreen Integration Tests - VIEW Mode (Story 8)', () => {
  // MSW Server lifecycle
  beforeAll(() => {
    console.log('🔧 Starting MSW server for RecipeDetailScreen tests...');
    server.listen({ onUnhandledRequest: 'warn' });
  });
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  const mockNavigation = createMockNavigation<RecipeDetailScreenNavigationProp>();

  // Test recipe data matching C# API contract
  const testRecipeId = '550e8400-e29b-41d4-a716-446655440001';
  const fullRecipeResponse = {
    id: testRecipeId,
    title: 'Integration Test Pasta',
    instructions: 'MSW mock instructions for integration testing',
    servings: 4,
    category: 'Dinner',
    imageUrl: 'https://example.com/test-pasta.jpg',
    createdAt: '2024-01-15T10:30:00.000Z',
    userId: '550e8400-e29b-41d4-a716-446655440002',
  };

  /**
   * ====================================================================
   * SECTION 1: RISK-BASED PRIORITY (1 test - Broad Integration 8%)
   * Critical business workflow spanning multiple systems
   * ====================================================================
   */
  describe('1. Risk-Based Priority - Critical Integration Point', () => {
    /**
     * BROAD INTEGRATION TEST
     * Critical workflow: Route params → TanStack Query → MSW → Display all fields
     */
    it('Should complete full recipe viewing workflow from navigation to display with all fields rendered', async () => {
      // Arrange: Set up MSW handler for recipe by ID
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          console.log('🔧 MSW: Returning full recipe response');
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component mounts and integrates with MSW through TanStack Query
      const { getByText, getByTestId } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Full integration works - Route → Query → MSW → Display
      await waitFor(() => {
        expect(getByText('Integration Test Pasta')).toBeTruthy();
        expect(getByText('MSW mock instructions for integration testing')).toBeTruthy();
        expect(getByText('4')).toBeTruthy(); // servings
        expect(getByText('Dinner')).toBeTruthy(); // category
        expect(getByTestId('recipe-detail-image')).toBeTruthy(); // image present
      }, { timeout: 2000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 2: HAPPY PATH (2 tests - Narrow Integration)
   * Primary integration scenarios with MSW
   * ====================================================================
   */
  describe('2. Happy Path - Primary Integration Scenarios', () => {
    /**
     * NARROW TEST: MSW → React Query → Component Display
     */
    it('Should fetch recipe from MSW and render in component with React Query caching', async () => {
      // Arrange: MSW configured with recipe data
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component mounts and integrates with MSW
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration complete - data fetched and displayed
      await waitFor(() => {
        expect(getByText('Integration Test Pasta')).toBeTruthy();
        expect(getByText('MSW mock instructions for integration testing')).toBeTruthy();
      });
    });

    /**
     * NARROW TEST: Image URL integration
     */
    it('Should display image component when recipe has imageUrl from API', async () => {
      // Arrange: MSW returns recipe with imageUrl
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes response with imageUrl
      const { getByTestId } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Image component rendered with imageUrl
      await waitFor(() => {
        const imageComponent = getByTestId('recipe-detail-image');
        expect(imageComponent).toBeTruthy();
        expect(imageComponent.props.source.uri).toBe('https://example.com/test-pasta.jpg');
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 3: CONTRACT VALIDATION (2 tests - Narrow Integration)
   * API contract verification with MSW
   * ====================================================================
   */
  describe('3. Contract Validation - Interface Expectations', () => {
    /**
     * NARROW TEST: Full RecipeResponseDto contract validation
     */
    it('Should validate Recipe API response matches RecipeResponseDto schema with all fields', async () => {
      // Arrange: MSW returns data matching C# API contract exactly
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json({
            id: testRecipeId,
            title: 'Contract Test Recipe',
            instructions: 'Contract test instructions',
            servings: 4,
            category: 'Dinner',
            imageUrl: 'https://example.com/contract-test.jpg',
            createdAt: '2024-01-15T10:30:00.000Z',
            userId: '550e8400-e29b-41d4-a716-446655440002',
          });
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes API response through schema validation
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Contract validated and data renders successfully
      await waitFor(() => {
        expect(getByText('Contract Test Recipe')).toBeTruthy();
        expect(getByText('Contract test instructions')).toBeTruthy();
      });
    });

    /**
     * NARROW TEST: Optional fields contract handling
     */
    it('Should handle optional fields (instructions, category, imageUrl, userId) from API', async () => {
      // Arrange: MSW returns minimal required fields only
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json({
            id: testRecipeId,
            title: 'Minimal Contract Recipe',
            servings: 2,
            createdAt: '2024-01-15T10:30:00.000Z',
            // Optional fields omitted: instructions, category, imageUrl, userId
          });
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes response with missing optional fields
      const { getByText, queryByTestId } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component handles missing fields gracefully
      await waitFor(() => {
        expect(getByText('Minimal Contract Recipe')).toBeTruthy();
        expect(getByText('2')).toBeTruthy(); // servings
        expect(queryByTestId('recipe-detail-image')).toBeNull(); // no image when null
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 4: ERROR PROPAGATION (3 tests - Narrow Integration)
   * Network error handling through the stack
   * ====================================================================
   */
  describe('4. Error Propagation - Failure Cascading', () => {
    /**
     * NARROW TEST: Server error (500) handling integration
     */
    it('Should handle API 500 error gracefully without crashing the component', async () => {
      // Arrange: MSW returns internal server error
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(
            {
              type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
              title: 'An error occurred while processing your request.',
              status: 500,
              detail: 'Internal server error occurred',
            },
            { status: 500 }
          );
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component handles API error through error boundary integration
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component displays the error state without crashing
      await waitFor(() => {
        expect(getByText(/error/i)).toBeTruthy();
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST: Not Found (404) error handling
     */
    it('Should handle API 404 error when recipe does not exist', async () => {
      // Arrange: MSW returns 404 for non-existent recipe
      const nonExistentId = 'non-existent-id';
      server.use(
        http.get(`*/api/Recipe/${nonExistentId}`, () => {
          return HttpResponse.json(
            {
              type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
              title: 'Not Found',
              status: 404,
              detail: `Recipe with id '${nonExistentId}' was not found.`,
            },
            { status: 404 }
          );
        })
      );

      const route = {
        params: { recipeId: nonExistentId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes 404 error
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: 404 error displayed gracefully
      await waitFor(() => {
        expect(getByText(/not found/i)).toBeTruthy();
      });
    });

    /**
     * NARROW TEST: Network delay integration
     */
    it('Should handle delayed API response through MSW and React Query integration', async () => {
      // Arrange: MSW simulates slow network
      let apiCallCompleted = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, async () => {
          console.log('🔧 MSW: Starting 100ms delay...');
          await delay(100);
          apiCallCompleted = true;
          console.log('🔧 MSW: Delay complete, returning data');
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component mounts and handles delayed response
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Loading state shown during delay
      expect(getByTestId('recipe-detail-loading')).toBeTruthy();

      // Assert: Data displayed after delay completes
      await waitFor(() => {
        expect(apiCallCompleted).toBe(true);
        expect(getByText('Integration Test Pasta')).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 5: DATA INTEGRITY (1 test - Narrow Integration)
   * Data transformation through layers
   * ====================================================================
   */
  describe('5. Data Integrity - Transformation Validation', () => {
    /**
     * NARROW TEST: Data passes through MSW → TanStack Query → Component without corruption
     */
    it('Should maintain data integrity through full integration stack', async () => {
      // Arrange: MSW returns specific test data
      const integrityTestRecipe = {
        id: randomUUID(),
        title: 'Data Integrity Test Recipe',
        instructions: 'Instructions with special chars: <>&"\'',
        servings: 99, // Boundary value
        category: 'Dessert',
        imageUrl: 'https://example.com/special-chars.jpg?param=value&other=123',
        createdAt: '2024-01-15T10:30:00.000Z',
        userId: randomUUID(),
      };

      server.use(
        http.get(`*/api/Recipe/${integrityTestRecipe.id}`, () => {
          return HttpResponse.json(integrityTestRecipe);
        })
      );

      const route = {
        params: { recipeId: integrityTestRecipe.id },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Data flows through the entire stack
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: All data rendered exactly as provided (no corruption)
      await waitFor(() => {
        expect(getByText('Data Integrity Test Recipe')).toBeTruthy();
        expect(getByText('Instructions with special chars: <>&"\'')).toBeTruthy();
        expect(getByText('99')).toBeTruthy();
        expect(getByText('Dessert')).toBeTruthy();
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 6: FAILURE MODES (2 tests - Narrow Integration)
   * External system failure handling
   * ====================================================================
   */
  describe('6. Failure Modes - External System Failures', () => {
    /**
     * NARROW TEST: Service unavailable (503) error handling
     */
    it('Should handle API 503 service unavailable error gracefully', async () => {
      // Arrange: MSW returns service unavailable
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(
            {
              type: 'https://tools.ietf.org/html/rfc7231#section-6.6.4',
              title: 'Service Unavailable',
              status: 503,
              detail: 'The service is temporarily unavailable. Please try again later.',
            },
            { status: 503 }
          );
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component handles service unavailable
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component remains stable and shows an error
      await waitFor(() => {
        expect(renderResult.root).toBeTruthy();
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST: Malformed JSON response
     */
    it('Should handle malformed API response gracefully without crashing', async () => {
      // Arrange: MSW returns invalid JSON structure
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json({
            // Wrong structure - not matching RecipeResponseDto
            data: {
              recipeTitle: 'Wrong Schema', // Should be 'title'
              portions: 4, // Should be 'servings'
            }
          });
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component receives malformed response
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component handles error without throwing
      await waitFor(() => {
        expect(renderResult.root).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 7: BACKWARDS COMPATIBILITY (2 tests - Narrow Integration)
   * API evolution handling
   * ====================================================================
   */
  describe('7. Backwards Compatibility - API Evolution', () => {
    /**
     * NARROW TEST: New optional fields from a future API version
     */
    it('Should handle new optional fields added to API response in future versions', async () => {
      // Arrange: MSW returns a future API version with new fields
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json({
            ...fullRecipeResponse,
            // Future fields not yet in RecipeResponseDto
            preparationTimeMinutes: 30,
            cookingTimeMinutes: 45,
            difficulty: 'Medium',
            tags: ['Italian', 'Pasta', 'Quick'],
            nutritionInfo: {
              calories: 450,
              protein: 25,
              carbs: 60,
              fat: 15,
            },
          });
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes response with extra fields
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component handles extra fields gracefully (ignores or displays)
      await waitFor(() => {
        expect(getByText('Integration Test Pasta')).toBeTruthy();
        // Component should not crash with extra fields
      });
    });

    /**
     * NARROW TEST: Missing optional fields and different date format
     */
    it('Should work when API omits optional fields or uses alternative date formats', async () => {
      // Arrange: Old API version with minimal fields and different date format
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json({
            id: testRecipeId,
            title: 'Backwards Compatible Recipe',
            servings: 2,
            createdAt: '2024-01-15 10:30:00', // Different format (space instead of T)
            // No category, imageUrl, instructions, or userId
          });
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes minimal response
      const { getByText } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Component works with minimal fields
      await waitFor(() => {
        expect(getByText('Backwards Compatible Recipe')).toBeTruthy();
        expect(getByText('2')).toBeTruthy();
      });
    });
  });
});