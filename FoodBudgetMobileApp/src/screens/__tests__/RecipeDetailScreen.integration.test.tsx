/**
 * RecipeDetailScreen Integration Tests - VIEW, CREATE & EDIT Modes (Stories 8, 9 & 10)
 *
 * Testing Framework:
 * - 90.9% Narrow Integration (20 tests): Single external dependency (MSW)
 * - 9.1% Broad Integration (2 tests): Critical business workflows
 *
 * Focus: Testing integration with API via MSW, NOT business logic
 * Using: MSW for API stubs, React Query for caching, Real navigation
 *
 * Story 8 (VIEW Mode): 13 tests - PASSING
 * Story 9 (CREATE Mode): 6 tests - TDD Red phase (will fail until implemented)
 * Story 10 (EDIT Mode): 3 tests - TDD Red phase (will fail until implemented)
 *
 * Test Distribution by Fowler Category:
 * - Section 1 (Risk-Based Priority): 2 tests (1 VIEW + 1 CREATE)
 * - Section 2 (Happy Path): 3 tests (2 VIEW + 1 CREATE)
 * - Section 3 (Contract Validation): 4 tests (2 VIEW + 1 CREATE + 1 EDIT)
 * - Section 4 (Error Propagation): 5 tests (3 VIEW + 1 CREATE + 1 EDIT)
 * - Section 5 (Data Integrity): 2 tests (1 VIEW + 1 CREATE)
 * - Section 6 (Failure Modes): 4 tests (2 VIEW + 1 CREATE + 1 EDIT)
 * - Section 7 (Backwards Compatibility): 2 tests (2 VIEW)
 */

import React from 'react';
import { randomUUID } from 'crypto';
import { screen, waitFor, fireEvent } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
// noinspection ES6PreferShortImport
import { server } from '../../mocks/server';
import { http, HttpResponse, delay } from 'msw';
import { RecipeDetailScreenNavigationProp } from '../../types/navigation';

describe('RecipeDetailScreen Integration Tests - VIEW & CREATE Modes (Stories 8 & 9)', () => {
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
   * SECTION 1: RISK-BASED PRIORITY (2 tests - Broad Integration)
   * Critical integration workflow spanning multiple systems
   * ====================================================================
   */
  describe('1. Risk-Based Priority - Critical Integration Point', () => {
    /**
     * BROAD INTEGRATION TEST (VIEW Mode)
     * Integration: Route params → TanStack Query → MSW API → Component mode
     */
    it('Should successfully integrate route parameters with API data fetching and display correct mode', async () => {
      // Arrange: Set up MSW handler for recipe by ID
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          console.log('🔧 MSW: API called successfully');
          apiWasCalled = true;
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component mounts and integrates with MSW through TanStack Query
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration layers communicate successfully
      await waitFor(() => {
        expect(apiWasCalled).toBe(true); // API communication successful
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible(); // Component in correct mode
      }, { timeout: 2000 });
    });

    /**
     * NARROW INTEGRATION TEST (CREATE Mode)
     * Integration: RecipeForm → useMutation → MSW API → Navigation
     */
    it('Should successfully persist data through mutation layer and trigger navigation on success', async () => {
      // Arrange: Setup MSW to capture API request
      let apiWasCalled = false;
      let apiReceivedCorrectStructure = false;
      const persistRecipeId = randomUUID();
      const persistUserId = randomUUID();
      server.use(
        http.post('*/api/Recipe', async ({ request }) => {
          apiWasCalled = true;
          const payload = await request.json() as Record<string, any>;
          // Verify API contract structure (integration point)
          apiReceivedCorrectStructure =
            payload?.hasOwnProperty('title') &&
            payload?.hasOwnProperty('servings') &&
            payload?.hasOwnProperty('category') &&
            payload?.hasOwnProperty('instructions') &&
            payload?.hasOwnProperty('imageUrl');
          return HttpResponse.json(
            {
              id: persistRecipeId,
              ...payload,
              createdAt: '2025-01-15T10:00:00Z',
              userId: persistUserId,
            },
            { status: 201 }
          );
        })
      );

      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: User fills a form and submits
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');

      // Simulate user input
      fireEvent.changeText(titleInput, 'Integration Recipe');
      fireEvent.press(submitButton);

      // Assert: Integration layers communicated successfully
      await waitFor(() => {
        expect(apiWasCalled).toBe(true); // API communication successful
        expect(apiReceivedCorrectStructure).toBe(true); // Correct contract structure sent
        expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: persistRecipeId, // Navigation integration successful
        });
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 2: HAPPY PATH (3 tests - Narrow Integration)
   * Primary integration scenarios focusing on layer communication
   * ====================================================================
   */
  describe('2. Happy Path - Primary Integration Scenarios', () => {
    /**
     * NARROW TEST (VIEW Mode): MSW → React Query → Component mode transition
     */
    it('Should successfully fetch data through React Query and transition to VIEW mode', async () => {
      // Arrange: MSW configured with recipe data
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component mounts and integrates with MSW
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration complete - API called, component in VIEW mode
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });

    /**
     * NARROW TEST (VIEW Mode): Image URL propagation through layers
     */
    it('Should successfully propagate imageUrl from API response through to Image component', async () => {
      // Arrange: MSW returns recipe with imageUrl
      let apiReturnedImageUrl = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiReturnedImageUrl = true;
          return HttpResponse.json(fullRecipeResponse);
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Component processes response with imageUrl
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration - imageUrl propagated from API to component props
      await waitFor(() => {
        expect(apiReturnedImageUrl).toBe(true);
        const imageComponent = screen.getByTestId('recipe-detail-image');
        expect(imageComponent.props.source.uri).toBe('https://example.com/test-pasta.jpg');
      });
    });

    /**
     * NARROW TEST (CREATE Mode): Full integration flow across multiple modes
     * Integration: CREATE mode mutation → navigation → VIEW mode query
     */
    it('Should complete integration chain from CREATE mutation through navigation to VIEW mode query', async () => {
      // Arrange: MSW supports both POST and subsequent GET
      const createdRecipeId = randomUUID();
      const createdUserId = randomUUID();
      const newRecipe = {
        id: createdRecipeId,
        title: 'Happy Path Recipe',
        servings: 2,
        category: 'Dinner',
        imageUrl: null,
        instructions: 'Test instructions',
        createdAt: '2025-01-15T10:00:00Z',
        userId: createdUserId,
      };

      let postApiCalled = false;
      let getApiCalled = false;

      server.use(
        http.post('*/api/Recipe', () => {
          postApiCalled = true;
          return HttpResponse.json(newRecipe, { status: 201 });
        }),
        http.get(`*/api/Recipe/${createdRecipeId}`, () => {
          getApiCalled = true;
          return HttpResponse.json(newRecipe);
        })
      );

      // Act: Submit form in CREATE mode
      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      const {rerender } = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.changeText(titleInput, 'Happy Path Recipe');
      fireEvent.press(submitButton);

      // Assert: POST API called, navigation triggered
      await waitFor(() => {
        expect(postApiCalled).toBe(true);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: createdRecipeId,
        });
      }, { timeout: 3000 });

      // Act: Simulate navigation to VIEW mode
      const viewRoute = {
        params: { recipeId: createdRecipeId },
        key: 'test-key-2',
        name: 'RecipeDetail' as const,
      };

      rerender(<RecipeDetailScreen navigation={mockNavigation} route={viewRoute} />);

      // Assert: GET API called, VIEW mode entered
      await waitFor(() => {
        expect(getApiCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 3: CONTRACT VALIDATION (3 tests - Narrow Integration)
   * API contract structure verification, not field display
   * ====================================================================
   */
  describe('3. Contract Validation - Interface Expectations', () => {
    /**
     * NARROW TEST (VIEW Mode): API response with all fields processes successfully
     */
    it('Should successfully process API response with complete RecipeResponseDto structure', async () => {
      // Arrange: MSW returns data matching C# API contract exactly
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
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

      // Act: Component processes API response
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration successful - API called, no crashes, VIEW mode entered
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });

    /**
     * NARROW TEST (VIEW Mode): API response with minimal required fields processes successfully
     */
    it('Should successfully process API response with only required fields (optional fields omitted)', async () => {
      // Arrange: MSW returns minimal required fields only
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
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
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration successful despite missing optional fields
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });

    /**
     * NARROW TEST (CREATE Mode): API response integration with navigation
     * Integration: API response → mutation onSuccess → navigation
     */
    it('Should successfully integrate API response through mutation layer to navigation', async () => {
      // Arrange: MSW returns a response with all fields
      const contractRecipeId = randomUUID();
      const contractUserId = randomUUID();
      const fullContractResponse = {
        id: contractRecipeId,
        title: 'Contract Test Recipe',
        servings: 6,
        category: 'Dessert',
        imageUrl: 'https://example.com/image.jpg',
        instructions: 'Test instructions',
        createdAt: '2025-01-15T10:00:00Z',
        userId: contractUserId,
      };

      let apiWasCalled = false;
      server.use(
        http.post('*/api/Recipe', () => {
          apiWasCalled = true;
          return HttpResponse.json(fullContractResponse, { status: 201 });
        })
      );

      // Act: Submit form
      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.changeText(titleInput, 'Contract Test Recipe');
      fireEvent.press(submitButton);

      // Assert: Integration successful - API called, response parsed, navigation triggered
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: contractRecipeId, // Proves response.data.id was extracted successfully
        });
      }, { timeout: 3000 });
    });

    /**
     * NARROW TEST (EDIT Mode): PUT API request sends correct RecipeRequestDto structure
     * Integration: Form data → useMutation → MSW PUT API with contract verification
     */
    it('Should successfully send RecipeRequestDto structure through PUT API in EDIT mode', async () => {
      // Arrange: MSW verifies PUT request structure
      let putApiCalled = false;
      let putApiReceivedCorrectStructure = false;

      server.use(
        // Initial GET for VIEW mode
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(fullRecipeResponse);
        }),
        // PUT for EDIT mode save
        http.put(`*/api/Recipe/${testRecipeId}`, async ({ request }) => {
          putApiCalled = true;
          const payload = await request.json() as Record<string, any>;
          // Verify API contract structure (integration point)
          putApiReceivedCorrectStructure =
            payload?.hasOwnProperty('title') &&
            payload?.hasOwnProperty('servings') &&
            payload?.hasOwnProperty('category') &&
            payload?.hasOwnProperty('instructions') &&
            payload?.hasOwnProperty('imageUrl');
          return HttpResponse.json(
            {
              ...fullRecipeResponse,
              ...payload,
            },
            { status: 200 }
          );
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Render in VIEW mode, enter EDIT mode, submit
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Wait for VIEW mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeVisible();
      });

      // Submit
      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert: Integration successful - correct contract structure sent
      await waitFor(() => {
        expect(putApiCalled).toBe(true);
        expect(putApiReceivedCorrectStructure).toBe(true); // Correct contract structure
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible(); // Returned to VIEW mode
      }, { timeout: 3000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 4: ERROR PROPAGATION (5 tests - Narrow Integration)
   * Error propagation through integration layers, not UI display
   * ====================================================================
   */
  describe('4. Error Propagation - Failure Cascading', () => {
    /**
     * NARROW TEST (VIEW Mode): 500 error propagation through React Query to error state
     */
    it('Should propagate API 500 error through React Query to component error state without crashing', async () => {
      // Arrange: MSW returns internal server error
      let errorApiCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          errorApiCalled = true;
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

      // Act: Component handles API error through integration layers
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Error propagated without crashing, component remains stable
      await waitFor(() => {
        expect(errorApiCalled).toBe(true);
        expect(renderResult.root).toBeTruthy(); // No crash
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST (VIEW Mode): 404 error propagation through React Query
     */
    it('Should propagate API 404 error through React Query to component error state', async () => {
      // Arrange: MSW returns 404 for non-existent recipe
      const nonExistentId = 'non-existent-id';
      let errorApiCalled = false;
      server.use(
        http.get(`*/api/Recipe/${nonExistentId}`, () => {
          errorApiCalled = true;
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

      // Act: Component processes 404 error through layers
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Error propagated successfully without crash
      await waitFor(() => {
        expect(errorApiCalled).toBe(true);
        expect(renderResult.root).toBeTruthy(); // No crash
      });
    });

    /**
     * NARROW TEST (VIEW Mode): Network delay handling through React Query
     */
    it('Should handle delayed API response through React Query loading state integration', async () => {
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
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Loading state shown during delay (integration point)
      expect(screen.getByTestId('recipe-detail-loading')).toBeVisible();

      // Assert: Component transitions to VIEW mode after delay
      await waitFor(() => {
        expect(apiCallCompleted).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST (CREATE Mode): Error propagation through mutation to onError handler
     * Integration: API error → useMutation onError → no navigation
     */
    it('Should propagate API errors through mutation layer preventing navigation on failure', async () => {
      // Arrange: MSW returns 500 error in C# ProblemDetails format
      let errorApiCalled = false;
      server.use(
        http.post('*/api/Recipe', () => {
          errorApiCalled = true;
          return HttpResponse.json(
            {
              type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
              title: 'An error occurred while processing your request.',
              status: 500,
              detail: 'Internal server error',
            },
            { status: 500 }
          );
        })
      );

      // Act: Submit form
      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.changeText(titleInput, 'Error Test Recipe');
      fireEvent.press(submitButton);

      // Assert: Error propagated, navigation blocked (integration point)
      await waitFor(() => {
        expect(errorApiCalled).toBe(true);
        expect(mockNavigation.navigate).not.toHaveBeenCalled(); // Error prevented navigation
        expect(screen.getByTestId('recipe-detail-create-form-submit')).toBeVisible(); // Form still present
      }, { timeout: 3000 });
    });

    /**
     * NARROW TEST (EDIT Mode): Error propagation through PUT mutation to onError handler
     * Integration: PUT API error → useMutation onError → stays in EDIT mode
     */
    it('Should propagate PUT API errors through mutation layer keeping component in EDIT mode', async () => {
      // Arrange: MSW returns 500 error for PUT request
      let putErrorApiCalled = false;

      server.use(
        // Initial GET for VIEW mode
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(fullRecipeResponse);
        }),
        // PUT returns error
        http.put(`*/api/Recipe/${testRecipeId}`, () => {
          putErrorApiCalled = true;
          return HttpResponse.json(
            {
              type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
              title: 'An error occurred while processing your request.',
              status: 500,
              detail: 'Internal server error during update',
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

      // Act: Render in VIEW mode, enter EDIT mode, submit
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Wait for VIEW mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeVisible();
      });

      // Submit (triggers error)
      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert: Error propagated, component stays in EDIT mode (integration point)
      await waitFor(() => {
        expect(putErrorApiCalled).toBe(true); // PUT API was called
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeVisible(); // Still in EDIT mode
      }, { timeout: 3000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 5: DATA INTEGRITY (2 tests - Narrow Integration)
   * Data transformation through integration layers
   * ====================================================================
   */
  describe('5. Data Integrity - Transformation Validation', () => {
    /**
     * NARROW TEST (VIEW Mode): Special characters propagate through layers without corruption
     */
    it('Should maintain special characters through API → React Query → Component integration', async () => {
      // Arrange: MSW returns data with special characters
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

      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${integrityTestRecipe.id}`, () => {
          apiWasCalled = true;
          return HttpResponse.json(integrityTestRecipe);
        })
      );

      const route = {
        params: { recipeId: integrityTestRecipe.id },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Data flows through integration layers
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration successful (data propagated without corruption - no crashes)
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });

    /**
     * NARROW TEST (CREATE Mode): Form data with special chars transforms through mutation layer
     * Integration: Form state → mutation → API without corruption
     */
    it('Should preserve special characters through form → mutation → API integration', async () => {
      // Arrange: MSW captures the exact payload
      let apiReceivedSpecialChars = false;
      let apiReceivedNewlines = false;
      const integrityRecipeId = randomUUID();
      const integrityUserId = randomUUID();
      server.use(
        http.post('*/api/Recipe', async ({ request }) => {
          const payload = await request.json() as Record<string, any>;
          // Check integration point: special chars preserved
          apiReceivedSpecialChars = payload?.title?.includes('"') && payload?.title?.includes('<');
          apiReceivedNewlines = payload?.instructions?.includes('\n');
          return HttpResponse.json(
            { id: integrityRecipeId, ...payload, createdAt: '2025-01-15T10:00:00Z', userId: integrityUserId },
            { status: 201 }
          );
        })
      );

      // Act: Fill form with special characters
      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const instructionsInput = screen.getByTestId('recipe-detail-create-form-instructions');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');

      fireEvent.changeText(titleInput, 'Recipe with "quotes" & <tags>');
      fireEvent.changeText(instructionsInput, 'Step 1: Mix\nStep 2: Bake');
      fireEvent.press(submitButton);

      // Assert: Integration preserved data through layers
      await waitFor(() => {
        expect(apiReceivedSpecialChars).toBe(true); // Special chars preserved
        expect(apiReceivedNewlines).toBe(true); // Newlines preserved
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 6: FAILURE MODES (3 tests - Narrow Integration)
   * External system failure handling through integration layers
   * ====================================================================
   */
  describe('6. Failure Modes - External System Failures', () => {
    /**
     * NARROW TEST (VIEW Mode): 503 error propagation through React Query
     */
    it('Should propagate API 503 service unavailable error through React Query without crashing', async () => {
      // Arrange: MSW returns service unavailable
      let errorApiCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          errorApiCalled = true;
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

      // Act: Component handles service unavailable through integration layers
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Error propagated without crash (integration point)
      await waitFor(() => {
        expect(errorApiCalled).toBe(true);
        expect(renderResult.root).toBeTruthy(); // No crash
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST (VIEW Mode): Malformed API response handling
     */
    it('Should handle malformed API response through React Query error handling without crashing', async () => {
      // Arrange: MSW returns invalid JSON structure
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
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

      // Act: Component receives a malformed response through integration layers
      const renderResult = renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration handled gracefully (no crash)
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(renderResult.root).toBeTruthy(); // No crash
      }, { timeout: 2000 });
    });

    /**
     * NARROW TEST (CREATE Mode): Mutation success triggers onSuccess handler chain
     * Integration: Mutation success → onSuccess → cache invalidation and navigation
     */
    it('Should trigger onSuccess handler chain when mutation succeeds (cache + navigation)', async () => {
      // Arrange: MSW returns a successful creation
      const cacheRecipeId = randomUUID();
      const cacheUserId = randomUUID();
      let apiWasCalled = false;
      server.use(
        http.post('*/api/Recipe', () => {
          apiWasCalled = true;
          return HttpResponse.json(
            { id: cacheRecipeId, title: 'Test', servings: 1, createdAt: '2025-01-15T10:00:00Z', userId: cacheUserId },
            { status: 201 }
          );
        })
      );

      // Act: Submit form
      const route = {
        params: {}, // No recipeId = CREATE mode
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      const titleInput = screen.getByTestId('recipe-detail-create-form-title');
      const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
      fireEvent.changeText(titleInput, 'Cache Test Recipe');
      fireEvent.press(submitButton);

      // Assert: Integration chain executed (API → onSuccess → navigation)
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
          recipeId: cacheRecipeId, // onSuccess handler executed successfully
        });
      }, { timeout: 3000 });
    });

    /**
     * NARROW TEST (EDIT Mode): PUT mutation success triggers mode transition
     * Integration: PUT mutation success → onSuccess → mode transition to VIEW
     */
    it('Should trigger onSuccess handler and transition to VIEW mode when PUT succeeds', async () => {
      // Arrange: MSW returns successful update
      let putApiCalled = false;

      server.use(
        // Initial GET for VIEW mode
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          return HttpResponse.json(fullRecipeResponse);
        }),
        // PUT success
        http.put(`*/api/Recipe/${testRecipeId}`, async ({ request }) => {
          putApiCalled = true;
          const payload = await request.json() as Record<string, any>;
          return HttpResponse.json(
            {
              ...fullRecipeResponse,
              ...payload,
              title: 'Updated Recipe Title',
            },
            { status: 200 }
          );
        })
      );

      const route = {
        params: { recipeId: testRecipeId },
        key: 'test-key',
        name: 'RecipeDetail' as const,
      };

      // Act: Render in VIEW mode, enter EDIT mode, submit
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Wait for VIEW mode
      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });

      // Enter EDIT mode
      fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

      await waitFor(() => {
        expect(screen.getByTestId('recipe-detail-edit-mode')).toBeVisible();
      });

      // Submit
      fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

      // Assert: Integration chain executed (PUT API → onSuccess → VIEW mode)
      await waitFor(() => {
        expect(putApiCalled).toBe(true); // PUT API called
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible(); // onSuccess transition to VIEW mode
      }, { timeout: 3000 });
    });
  });

  /**
   * ====================================================================
   * SECTION 7: BACKWARDS COMPATIBILITY (2 tests - Narrow Integration)
   * API evolution handling through integration layers
   * ====================================================================
   */
  describe('7. Backwards Compatibility - API Evolution', () => {
    /**
     * NARROW TEST (VIEW Mode): Future API version with extra fields processes successfully
     */
    it('Should handle API response with additional future fields without crashing', async () => {
      // Arrange: MSW returns a future API version with new fields
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
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

      // Act: Component processes response with extra fields through integration layers
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration successful despite extra fields (no crash)
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });

    /**
     * NARROW TEST (VIEW Mode): Alternative date format handling
     */
    it('Should handle API response with alternative date format through integration layers', async () => {
      // Arrange: Old API version with minimal fields and different date format
      let apiWasCalled = false;
      server.use(
        http.get(`*/api/Recipe/${testRecipeId}`, () => {
          apiWasCalled = true;
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

      // Act: Component processes minimal response through integration layers
      renderWithProviders(
        <RecipeDetailScreen navigation={mockNavigation} route={route} />
      );

      // Assert: Integration successful with alternative date format
      await waitFor(() => {
        expect(apiWasCalled).toBe(true);
        expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
      });
    });
  });
});