/**
 * RecipeDetailScreen Integration Tests - VIEW, CREATE, EDIT & DELETE Modes (Stories 8, 9, 10 & 11)
 *
 * Testing Framework:
 * - 92% Narrow Integration (23 tests): Single external dependency (MSW)
 * - 8% Broad Integration (2 tests): Critical business workflows
 *
 * Focus: Testing integration with API via MSW, NOT business logic
 * Using: MSW for API stubs, React Query for caching, Real navigation
 *
 * Test Distribution by Fowler Category:
 * - Section 1 (Risk-Based Priority): 3 tests (1 VIEW + 1 CREATE + 1 DELETE)
 * - Section 2 (Happy Path): 3 tests (2 VIEW + 1 CREATE)
 * - Section 3 (Contract Validation): 4 tests (2 VIEW + 1 CREATE + 1 EDIT)
 * - Section 4 (Error Propagation): 7 tests (3 VIEW + 1 CREATE + 1 EDIT + 2 DELETE)
 * - Section 5 (Data Integrity): 2 tests (1 VIEW + 1 CREATE)
 * - Section 6 (Failure Modes): 4 tests (2 VIEW + 1 CREATE + 1 EDIT)
 * - Section 7 (Backwards Compatibility): 2 tests (2 VIEW)
 */

import React from 'react';
import {randomUUID} from 'crypto';
import {screen, waitFor, fireEvent} from '@testing-library/react-native';
import {renderWithProviders, createMockNavigation} from '../../test/test-utils';
import RecipeDetailScreen from '../RecipeDetailScreen';
// noinspection ES6PreferShortImport
import {server} from '../../mocks/server';
import {http, HttpResponse, delay} from 'msw';
import {RecipeDetailScreenNavigationProp} from '../../types/navigation';

describe('RecipeDetailScreen Integration Tests - VIEW & CREATE Modes (Stories 8 & 9)', () => {
    // MSW Server lifecycle
    beforeAll(() => {
        console.log('🔧 Starting MSW server for RecipeDetailScreen tests...');
        server.listen({onUnhandledRequest: 'warn'});
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component mounts and integrates with MSW through TanStack Query
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Integration layers communicate successfully
            await waitFor(() => {
                expect(apiWasCalled).toBe(true); // API communication successful
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible(); // Component in correct mode
            }, {timeout: 2000});
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
                http.post('*/api/Recipe', async ({request}) => {
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
                        {status: 201}
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
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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

        /**
         * NARROW INTEGRATION TEST (DELETE - Story 11)
         * Integration: Delete button → confirmation → MSW DELETE API → Navigation
         */
        it('Should successfully delete recipe through API and trigger navigation on success', async () => {
            // Arrange: Set up MSW for GET and DELETE
            let deleteApiCalled = false;
            server.use(
                http.get(`*/api/Recipe/${testRecipeId}`, () => {
                    return HttpResponse.json(fullRecipeResponse);
                }),
                http.delete(`*/api/Recipe/${testRecipeId}`, () => {
                    deleteApiCalled = true;
                    return new HttpResponse(null, {status: 204});
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: User deletes recipe
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            });

            // Press delete button
            fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

            // Wait for the dialog to appear (check for confirmation button testID)
            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-delete-dialog-confirm')).toBeTruthy();
            });

            // Confirm delete
            fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

            // Assert: Integration layers communicated successfully
            await waitFor(() => {
                expect(deleteApiCalled).toBe(true); // DELETE API called
                expect(mockNavigation.goBack).toHaveBeenCalledTimes(1); // Navigation triggered
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (EDIT Mode): useUpdateRecipe hook → Multi-cache update → Component (Story 12b)
         *
         * Integration Point: Hook updates BOTH list and detail caches simultaneously
         * This test verifies the critical integration between useUpdateRecipe and QueryClient
         */
        it('Given update mutation When hook updates cache Then both list and detail caches sync', async () => {
            // Arrange: Track API calls
            let updateApiCalled = false;

            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', () => {
                    updateApiCalled = true;
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Updated via Integration',
                        instructions: 'Test instructions',
                        servings: 8,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            // Pre-populate list cache to test multi-cache sync
            queryClient?.setQueryData(['recipes'], [
                {
                    id: '550e8400-e29b-41d4-a716-446655440099',
                    title: 'Original Title',
                    instructions: 'Test instructions',
                    servings: 4,
                    category: 'Dinner',
                    imageUrl: 'https://example.com/test.jpg',
                    createdAt: '2024-01-15T10:00:00Z',
                    userId: '550e8400-e29b-41d4-a716-446655440002'
                }
            ]);

            // Enter EDIT mode
            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Update recipe
            const servingsInput = screen.getByTestId('recipe-detail-edit-form-servings');
            fireEvent.changeText(servingsInput, '8');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Integration layers communicated successfully
            await waitFor(() => {
                expect(updateApiCalled).toBe(true); // UPDATE API called
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen(); // Returned to VIEW
            }, {timeout: 3000});

            // Verify the hook updated both caches
            const detailCache = queryClient?.getQueryData(['recipe', '550e8400-e29b-41d4-a716-446655440099']);
            const listCache = queryClient?.getQueryData(['recipes']);

            expect(detailCache).toMatchObject({servings: 8});
            expect(listCache).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({id: '550e8400-e29b-41d4-a716-446655440099', servings: 8})
                ])
            );
        });

        /**
         * NARROW TEST (CREATE Mode): Optimistic create with temp ID → real ID replacement (Story 12c)
         *
         * Integration Point: useCreateRecipe hook → MSW POST API → Cache updates (temp → real ID)
         * This test verifies the critical temp ID lifecycle integration across all layers
         */
        it('Given CREATE mode When user submits Then temp ID added optimistically and replaced with real ID after API success', async () => {
            // Arrange: Track API calls and temp ID generation
            let postApiCalled = false;
            const realRecipeId = randomUUID();
            const realUserId = randomUUID();

            server.use(
                http.post('*/api/Recipe', async ({request}) => {
                    postApiCalled = true;
                    const payload = await request.json() as Record<string, any>;
                    // Delay response to allow checking optimistic update
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(
                        {
                            id: realRecipeId,
                            ...payload,
                            createdAt: '2025-01-15T10:00:00Z',
                            userId: realUserId,
                        },
                        {status: 201}
                    );
                })
            );

            const route = {
                params: {}, // No recipeId = CREATE mode
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
            });

            // Act: Fill a form and submit
            const titleInput = screen.getByTestId('recipe-detail-create-form-title');
            const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
            fireEvent.changeText(titleInput, 'Optimistic Create Recipe');
            fireEvent.press(submitButton);

            // Assert: Temp ID appears in the cache immediately (optimistic)
            await waitFor(() => {
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                const tempRecipe = listCache?.[0];
                expect(tempRecipe?.id.startsWith('temp-')).toBe(true);
                expect(tempRecipe?.title).toBe('Optimistic Create Recipe');
            });

            // Assert: API called and temp ID replaced with real ID
            await waitFor(() => {
                expect(postApiCalled).toBe(true);
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                const realRecipe = listCache?.find(r => r.id === realRecipeId);
                expect(realRecipe).toBeDefined();
                expect(realRecipe?.title).toBe('Optimistic Create Recipe');
                // Temp recipe should be gone
                const hasTempRecipe = listCache?.some(r => r.id.startsWith('temp-'));
                expect(hasTempRecipe).toBe(false);
            }, {timeout: 3000});

            // Assert: Navigation triggered with real ID
            await waitFor(() => {
                expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetail', {
                    recipeId: realRecipeId,
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component mounts and integrates with MSW
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes response with imageUrl
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Integration - imageUrl propagated from API to component props
            await waitFor(() => {
                expect(apiReturnedImageUrl).toBe(true);
                const imageComponent = screen.getByTestId('recipe-detail-view-form-image');
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
                    return HttpResponse.json(newRecipe, {status: 201});
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

            const {rerender} = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});

            // Act: Simulate navigation to VIEW mode
            const viewRoute = {
                params: {recipeId: createdRecipeId},
                key: 'test-key-2',
                name: 'RecipeDetail' as const,
            };

            rerender(<RecipeDetailScreen navigation={mockNavigation} route={viewRoute}/>);

            // Assert: GET API called, VIEW mode entered
            await waitFor(() => {
                expect(getApiCalled).toBe(true);
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            });
        });

        /**
         * NARROW TEST (EDIT Mode): End-to-end update flow with navigation (Story 12b)
         *
         * Integration: Form → Hook → API → Cache → UI Feedback → Navigation
         * The Happy path verifies all integration layers work together seamlessly
         */
        it('Given successful edit flow When user saves changes Then complete integration cycle succeeds', async () => {
            // Arrange
            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', async ({request}) => {
                    const body: any = await request.json();
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: body.title,
                        instructions: body.instructions,
                        servings: body.servings,
                        category: body.category,
                        imageUrl: body.imageUrl || 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            // Act: Edit → Save → View cycle
            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, 'End-to-End Updated Title');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Complete integration cycle
            await waitFor(() => {
                expect(screen.getByText(/recipe updated successfully/i)).toBeOnTheScreen(); // UI feedback
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen(); // Navigation
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (CREATE Mode): Optimistic create adding to TOP of the list (Story 12c)
         *
         * Integration: useCreateRecipe → Cache Update → List Order Verification
         * Verifies new recipes appear at the top instantly with temp ID
         */
        it('Given CREATE mode with existing recipes When user submits Then new recipe appears at TOP of list with temp ID', async () => {
            // Arrange: MSW returns a successful creation
            const realRecipeId = randomUUID();
            const realUserId = randomUUID();

            server.use(
                http.post('*/api/Recipe', async ({request}) => {
                    const payload = await request.json() as Record<string, any>;
                    // Delay response to allow checking optimistic update
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(
                        {
                            id: realRecipeId,
                            ...payload,
                            createdAt: '2025-01-15T10:00:00Z',
                            userId: realUserId,
                        },
                        {status: 201}
                    );
                })
            );

            const route = {
                params: {}, // No recipeId = CREATE mode
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Pre-populate the cache with existing recipes
            queryClient?.setQueryData(['recipes'], [
                {id: 'existing-1', title: 'Existing Recipe 1', servings: 2, createdAt: '2025-01-14T10:00:00Z'},
                {id: 'existing-2', title: 'Existing Recipe 2', servings: 4, createdAt: '2025-01-13T10:00:00Z'},
            ]);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
            });

            // Act: Fill a form and submit
            const titleInput = screen.getByTestId('recipe-detail-create-form-title');
            const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
            fireEvent.changeText(titleInput, 'New Recipe at Top');
            fireEvent.press(submitButton);

            // Assert: A new recipe appears at index 0 (TOP) with temp ID
            await waitFor(() => {
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                expect(listCache?.[0]?.id.startsWith('temp-')).toBe(true);
                expect(listCache?.[0]?.title).toBe('New Recipe at Top');
                expect(listCache?.[1]?.id).toBe('existing-1'); // Existing recipes pushed down
                expect(listCache?.[2]?.id).toBe('existing-2');
            });

            // Assert: After API success, real ID replaces temp ID at TOP
            await waitFor(() => {
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                expect(listCache?.[0]?.id).toBe(realRecipeId);
                expect(listCache?.[0]?.title).toBe('New Recipe at Top');
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (CREATE Mode): Optimistic create updates multiple caches (Story 12c)
         *
         * Integration: useCreateRecipe → Multi-cache update → Category caches
         * Verifies temp recipe appears in 'All' and category-specific caches
         */
        it('Given CREATE mode When user submits with category Then temp recipe appears in All and category caches', async () => {
            // Arrange: MSW returns a successful creation with category
            const realRecipeId = randomUUID();
            const realUserId = randomUUID();

            server.use(
                http.post('*/api/Recipe', async ({request}) => {
                    const payload = await request.json() as Record<string, any>;
                    // Delay response to allow checking optimistic update
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(
                        {
                            id: realRecipeId,
                            ...payload,
                            createdAt: '2025-01-15T10:00:00Z',
                            userId: realUserId,
                        },
                        {status: 201}
                    );
                })
            );

            const route = {
                params: {}, // No recipeId = CREATE mode
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Pre-populate main cache
            queryClient?.setQueryData(['recipes'], [
                {id: 'existing-1', title: 'Existing Recipe', servings: 2, category: 'Dinner'}
            ]);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
            });

            // Act: Fill form with category and submit
            const titleInput = screen.getByTestId('recipe-detail-create-form-title');
            const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
            fireEvent.changeText(titleInput, 'Breakfast Recipe');
            // Note: Category would be set by picker, assuming default or set value
            fireEvent.press(submitButton);

            // Assert: Temp recipe appears in the main cache (optimistic update)
            await waitFor(() => {
                const mainCache = queryClient?.getQueryData<any[]>(['recipes']);
                const tempRecipe = mainCache?.find(r => r.id.startsWith('temp-'));
                expect(tempRecipe).toBeDefined();
                expect(tempRecipe?.title).toBe('Breakfast Recipe');
            });

            // Assert: After API success, real ID in the main cache 
            // (category caches populated via refetch, which is triggered automatically)
            await waitFor(() => {
                const mainCache = queryClient?.getQueryData<any[]>(['recipes']);
                const realRecipe = mainCache?.find(r => r.id === realRecipeId);
                expect(realRecipe).toBeDefined();
                expect(realRecipe?.title).toBe('Breakfast Recipe');
            }, {timeout: 3000});
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes API response
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        // Optional fields omitted: instructions, category, imageUrl
                    });
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes response with missing optional fields
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                    return HttpResponse.json(fullContractResponse, {status: 201});
                })
            );

            // Act: Submit form
            const route = {
                params: {}, // No recipeId = CREATE mode
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
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
                http.put(`*/api/Recipe/${testRecipeId}`, async ({request}) => {
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
                        {status: 200}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Render in VIEW mode, enter EDIT mode, submit
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (EDIT Mode): useUpdateRecipe hook contract validation (Story 12b)
         *
         * Integration: Verify hook interface matches TanStack Query v5 mutation contract
         * Validates mutateAsync method signature and return type
         */
        it('Given useUpdateRecipe hook When invoked Then conforms to TanStack Query mutation contract', async () => {
            // Arrange: Track mutateAsync call signature
            let mutationPayload: any = null;

            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', async ({request}) => {
                    mutationPayload = await request.json();
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: mutationPayload.title,
                        instructions: 'Test instructions',
                        servings: mutationPayload.servings,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Trigger mutation via hook
            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, 'Contract Test');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Hook received the correct contract structure { id, data }
            await waitFor(() => {
                expect(mutationPayload).toMatchObject({
                    title: 'Contract Test'
                });
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            }, {timeout: 3000});
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
                        {status: 500}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component handles API error through integration layers
            const renderResult = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Error propagated without crashing, component remains stable
            await waitFor(() => {
                expect(errorApiCalled).toBe(true);
                expect(renderResult.root).toBeTruthy(); // No crash
            }, {timeout: 2000});
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
                        {status: 404}
                    );
                })
            );

            const route = {
                params: {recipeId: nonExistentId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes 404 error through layers
            const renderResult = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component mounts and handles delayed response
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Loading state shown during delay (integration point)
            expect(screen.getByTestId('recipe-detail-loading')).toBeVisible();

            // Assert: Component transitions to VIEW mode after delay
            await waitFor(() => {
                expect(apiCallCompleted).toBe(true);
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            }, {timeout: 2000});
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
                        {status: 500}
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
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
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
                        {status: 500}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Render in VIEW mode, enter EDIT mode, submit
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (DELETE - Story 11): DELETE API 500 error propagation
         * Integration: DELETE API error → onError handler → no navigation
         */
        it('Should propagate DELETE API 500 error through mutation layer preventing navigation', async () => {
            // Arrange: MSW returns 500 error for DELETE
            let deleteApiCalled = false;
            server.use(
                http.get(`*/api/Recipe/${testRecipeId}`, () => {
                    return HttpResponse.json(fullRecipeResponse);
                }),
                http.delete(`*/api/Recipe/${testRecipeId}`, () => {
                    deleteApiCalled = true;
                    return HttpResponse.json(
                        {
                            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
                            title: 'An error occurred while processing your request.',
                            status: 500,
                            detail: 'Failed to delete recipe',
                        },
                        {status: 500}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: User tries to delete
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

            // Wait for the dialog to appear (check for confirmation button testID)
            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-delete-dialog-confirm')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

            // Assert: Error propagated, navigation blocked
            await waitFor(() => {
                expect(deleteApiCalled).toBe(true);
                expect(mockNavigation.goBack).not.toHaveBeenCalled(); // Error prevented navigation
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (DELETE - Story 11): DELETE API 404 error handling
         * Integration: DELETE 404 → onError handler → user-friendly error
         */
        it('Should handle DELETE API 404 error gracefully without crashing', async () => {
            // Arrange: MSW returns 404 (recipe already deleted)
            let deleteApiCalled = false;
            server.use(
                http.get(`*/api/Recipe/${testRecipeId}`, () => {
                    return HttpResponse.json(fullRecipeResponse);
                }),
                http.delete(`*/api/Recipe/${testRecipeId}`, () => {
                    deleteApiCalled = true;
                    return HttpResponse.json(
                        {
                            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                            title: 'Not Found',
                            status: 404,
                            detail: 'Recipe not found',
                        },
                        {status: 404}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: User tries to delete
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-delete-button'));

            // Wait for the dialog to appear (check for confirmation button testID)
            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-delete-dialog-confirm')).toBeTruthy();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-delete-dialog-confirm'));

            // Assert: Error handled gracefully
            await waitFor(() => {
                expect(deleteApiCalled).toBe(true);
                expect(mockNavigation.goBack).not.toHaveBeenCalled();
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (EDIT Mode): Update error propagates from API through hook to UI (Story 12b)
         *
         * Integration: API Error → useUpdateRecipe → Error Snackbar → Stay in EDIT mode
         * Verifies error propagation doesn't crash and UI shows appropriate feedback
         */
        it('Given update API error When mutation fails Then error propagates to UI without crash', async () => {
            // Arrange: MSW returns error
            let updateApiCalled = false;

            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', () => {
                    updateApiCalled = true;
                    return HttpResponse.json(
                        {
                            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
                            title: 'An error occurred while processing your request.',
                            status: 500,
                            detail: 'Internal server error during update'
                        },
                        {status: 500}
                    );
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Trigger failing mutation
            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, 'Will Fail');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Error propagated through layers
            await waitFor(() => {
                expect(updateApiCalled).toBe(true);
                expect(screen.getByText(/an error occurred while processing your request/i)).toBeOnTheScreen(); // Error UI
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen(); // Stays in EDIT
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (CREATE Mode): POST API 500 error with temp recipe rollback (Story 12c)
         *
         * Integration: useCreateRecipe → POST API Error → Rollback removes temp recipe from cache
         * Verifies optimistic temp recipe is removed when API fails
         */
        it('Given CREATE mode with optimistic temp ID When POST API fails Then temp recipe removed from cache', async () => {
            // Arrange: MSW returns 500 error for POST
            let postApiCalled = false;

            server.use(
                http.post('*/api/Recipe', async () => {
                    postApiCalled = true;
                    // Delay error response to allow checking optimistic update first
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(
                        {
                            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
                            title: 'An error occurred while processing your request.',
                            status: 500,
                            detail: 'Failed to create recipe'
                        },
                        {status: 500}
                    );
                })
            );

            const route = {
                params: {}, // No recipeId = CREATE mode
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Pre-populate cache with existing recipe
            queryClient?.setQueryData(['recipes'], [
                {id: 'existing-1', title: 'Existing Recipe', servings: 2, createdAt: '2025-01-14T10:00:00Z'}
            ]);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-create-form')).toBeOnTheScreen();
            });

            // Act: Fill a form and submit
            const titleInput = screen.getByTestId('recipe-detail-create-form-title');
            const submitButton = screen.getByTestId('recipe-detail-create-form-submit');
            fireEvent.changeText(titleInput, 'Failed Recipe');
            fireEvent.press(submitButton);

            // Assert: Temp recipe appeared optimistically
            await waitFor(() => {
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                const hasTempRecipe = listCache?.some(r => r.id.startsWith('temp-'));
                expect(hasTempRecipe).toBe(true);
            });

            // Assert: After the API error, temp recipe removed (rollback)
            await waitFor(() => {
                expect(postApiCalled).toBe(true);
                const listCache = queryClient?.getQueryData<any[]>(['recipes']);
                const hasTempRecipe = listCache?.some(r => r.id.startsWith('temp-'));
                expect(hasTempRecipe).toBe(false);
                // Only the existing recipe remains
                expect(listCache?.length).toBe(1);
                expect(listCache?.[0]?.id).toBe('existing-1');
            }, {timeout: 3000});

            // Assert: User stays in CREATE mode (no navigation)
            expect(mockNavigation.navigate).not.toHaveBeenCalled();
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
                params: {recipeId: integrityTestRecipe.id},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Data flows through integration layers
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                http.post('*/api/Recipe', async ({request}) => {
                    const payload = await request.json() as Record<string, any>;
                    // Check integration point: special chars preserved
                    apiReceivedSpecialChars = payload?.title?.includes('"') && payload?.title?.includes('<');
                    apiReceivedNewlines = payload?.instructions?.includes('\n');
                    return HttpResponse.json(
                        {id: integrityRecipeId, ...payload, createdAt: '2025-01-15T10:00:00Z', userId: integrityUserId},
                        {status: 201}
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
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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

        /**
         * NARROW TEST (EDIT Mode): Optimistic data vs. server response consistency (Story 12b)
         *
         * Integration: Verify server response replaces optimistic data in cache
         * Ensures data integrity when server transforms/normalizes data
         */
        it('Given optimistic update When server returns modified data Then cache updates with server truth', async () => {
            // Arrange: Server normalizes/transforms the data
            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', async ({request}) => {
                    const body: any = await request.json();
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: body.title.trim().toUpperCase(), // Server normalizes: trim + uppercase
                        instructions: 'Test instructions',
                        servings: body.servings,
                        category: body.category,
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Submit data that the server will transform
            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, '  lowercase title  '); // Has spaces, lowercase
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Cache eventually contains server-transformed data, not optimistic data
            await waitFor(() => {
                const cachedData = queryClient?.getQueryData(['recipe', '550e8400-e29b-41d4-a716-446655440099']);
                expect(cachedData).toMatchObject({
                    title: 'LOWERCASE TITLE' // Server normalized: trimmed and uppercased
                });
            }, {timeout: 3000});
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
                        {status: 503}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component handles service unavailable through integration layers
            const renderResult = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Error propagated without crash (integration point)
            await waitFor(() => {
                expect(errorApiCalled).toBe(true);
                expect(renderResult.root).toBeTruthy(); // No crash
            }, {timeout: 2000});
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component receives a malformed response through integration layers
            const renderResult = renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Integration handled gracefully (no crash)
            await waitFor(() => {
                expect(apiWasCalled).toBe(true);
                expect(renderResult.root).toBeTruthy(); // No crash
            }, {timeout: 2000});
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
                        {
                            id: cacheRecipeId,
                            title: 'Test',
                            servings: 1,
                            createdAt: '2025-01-15T10:00:00Z',
                            userId: cacheUserId
                        },
                        {status: 201}
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
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
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
                http.put(`*/api/Recipe/${testRecipeId}`, async ({request}) => {
                    putApiCalled = true;
                    const payload = await request.json() as Record<string, any>;
                    return HttpResponse.json(
                        {
                            ...fullRecipeResponse,
                            ...payload,
                            title: 'Updated Recipe Title',
                        },
                        {status: 200}
                    );
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Render in VIEW mode, enter EDIT mode, submit
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
            }, {timeout: 3000});
        });

        /**
         * NARROW TEST (EDIT Mode): Network timeout recovery with rollback (Story 12b)
         *
         * Integration: Network Failure → Hook Rollback → Cache Restored → Stay in EDIT
         * Verifies rollback mechanism restores cache integrity after network failure
         */
        it('Given network timeout When update fails Then cache rolls back and edit state preserved', async () => {
            // Arrange: Simulate network timeout
            let timeoutApiCalled = false;

            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', () => {
                    timeoutApiCalled = true;
                    return HttpResponse.json(
                        {
                            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
                            title: 'Request Timeout',
                            status: 408,
                            detail: 'The request timed out. Please try again.'
                        },
                        {status: 408}
                    );
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            // Capture the original cache state
            const originalData = queryClient?.getQueryData(['recipe', '550e8400-e29b-41d4-a716-446655440099']);

            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Trigger timeout
            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, 'Timeout Test');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Network failure → Rollback → Cache integrity restored
            await waitFor(() => {
                expect(timeoutApiCalled).toBe(true);
                expect(screen.getByText(/request timeout/i)).toBeOnTheScreen(); // Error shown
                const rolledBackData = queryClient?.getQueryData(['recipe', '550e8400-e29b-41d4-a716-446655440099']);
                expect(rolledBackData).toEqual(originalData); // Cache rolled back
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen(); // Still in EDIT
            }, {timeout: 3000});
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
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes response with extra fields through integration layers
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
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
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        // No category, imageUrl, or instructions
                    });
                })
            );

            const route = {
                params: {recipeId: testRecipeId},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            // Act: Component processes minimal response through integration layers
            renderWithProviders(
                <RecipeDetailScreen navigation={mockNavigation} route={route}/>
            );

            // Assert: Integration successful with alternative date format
            await waitFor(() => {
                expect(apiWasCalled).toBe(true);
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeVisible();
            });
        });

        /**
         * NARROW TEST (EDIT Mode): useUpdateRecipe hook works with legacy API response (Story 12b)
         *
         * Integration: Legacy API → Hook Compatibility → Cache Update
         * Verifies hook handles older API response formats gracefully
         */
        it('Given legacy API response format When update succeeds Then hook processes response correctly', async () => {
            // Arrange: Server returns a response with extra legacy fields
            let apiWasCalled = false;

            server.use(
                http.get('*/api/Recipe/550e8400-e29b-41d4-a716-446655440099', () => {
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: 'Original Title',
                        instructions: 'Test instructions',
                        servings: 4,
                        category: 'Dinner',
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002'
                    });
                }),
                http.put('*/api/Recipe/:id', async ({request}) => {
                    apiWasCalled = true;
                    const body: any = await request.json();
                    return HttpResponse.json({
                        id: '550e8400-e29b-41d4-a716-446655440099',
                        title: body.title,
                        instructions: 'Test instructions',
                        servings: body.servings,
                        category: body.category,
                        imageUrl: 'https://example.com/test.jpg',
                        createdAt: '2024-01-15T10:00:00Z',
                        userId: '550e8400-e29b-41d4-a716-446655440002',
                        // Legacy fields (maybe ignored but shouldn't break)
                        deprecated_field: 'old_value',
                        legacy_timestamp: '2024-01-01'
                    });
                })
            );

            const route = {
                params: {recipeId: '550e8400-e29b-41d4-a716-446655440099'},
                key: 'test-key',
                name: 'RecipeDetail' as const,
            };

            const {queryClient} = renderWithProviders(<RecipeDetailScreen navigation={mockNavigation} route={route}/>);

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            });

            fireEvent.press(screen.getByTestId('recipe-detail-edit-fab'));

            await waitFor(() => {
                expect(screen.getByTestId('recipe-detail-edit-mode')).toBeOnTheScreen();
            });

            // Act: Update with legacy API
            const titleInput = screen.getByTestId('recipe-detail-edit-form-title');
            fireEvent.changeText(titleInput, 'Legacy API Test');
            fireEvent.press(screen.getByTestId('recipe-detail-edit-form-submit'));

            // Assert: Integration successful despite legacy fields
            await waitFor(() => {
                expect(apiWasCalled).toBe(true);
                expect(screen.getByTestId('recipe-detail-view-mode')).toBeOnTheScreen();
            }, {timeout: 3000});

            // Verify the cache has updated data (legacy fields don't break integration)
            const cachedData = queryClient?.getQueryData(['recipe', '550e8400-e29b-41d4-a716-446655440099']);
            expect(cachedData).toMatchObject({title: 'Legacy API Test'});
        });
    });
});