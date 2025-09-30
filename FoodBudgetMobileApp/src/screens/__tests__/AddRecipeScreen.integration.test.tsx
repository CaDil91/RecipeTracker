/**
 * AddRecipeScreen Integration Tests
 *
 * Testing Framework:
 * - 100% Narrow Integration: Single external dependency (RecipeService)
 *
 * Focus: Testing API integration for recipe creation, NOT business logic
 * Using: MSW for API stubs, Real RecipeService, Mocked navigation
 */

import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, createMockNavigation } from '../../test/test-utils';
import AddRecipeScreen from '../AddRecipeScreen';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

describe('AddRecipeScreen Integration Tests', () => {
  // MSW Server lifecycle
  beforeAll(() => {
    console.log('🔧 Starting MSW server for AddRecipeScreen tests...');
    server.listen({ onUnhandledRequest: 'warn' });
  });
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  // Mock Alert
  const mockAlert = jest.spyOn(Alert, 'alert');

  /**
   * ====================================================================
   * SECTION 1: Happy Path - Recipe Creation (2 tests)
   * Testing successful recipe creation workflow
   * ====================================================================
   */
  describe('Happy Path - Recipe Creation', () => {

    it('Should send correct request payload to Recipe API', async () => {
      // Arrange
      const mockNavigation = createMockNavigation<StackNavigationProp<RootStackParamList, 'AddRecipe'>>();
      let capturedRequestBody: any = null;

      server.use(
        http.post('*/api/Recipe', async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            id: '550e8400-e29b-41d4-a716-446655440001',
            ...capturedRequestBody,
            createdAt: new Date().toISOString(),
          }, { status: 201 });
        })
      );

      const { getByTestId } = renderWithProviders(
        <AddRecipeScreen navigation={mockNavigation} />
      );

      // Act: Fill form and save
      fireEvent.changeText(getByTestId('add-recipe-form-title'), 'Integration Test Recipe');
      fireEvent.changeText(getByTestId('add-recipe-form-instructions'), 'Test instructions for API');
      fireEvent.changeText(getByTestId('add-recipe-form-servings'), '4');
      fireEvent.press(getByTestId('add-recipe-form-submit'));

      // Assert: Verify API was called with correct data
      await waitFor(() => {
        expect(capturedRequestBody).toEqual({
          title: 'Integration Test Recipe',
          instructions: 'Test instructions for API',
          servings: 4,
        });
      });
    });

    it('Should propagate API success response to user feedback', async () => {
      // Arrange
      const mockNavigation = createMockNavigation<StackNavigationProp<RootStackParamList, 'AddRecipe'>>();

      server.use(
        http.post('*/api/Recipe', async ({ request }) => {
          const body = await request.json() as Record<string, any>;
          return HttpResponse.json({
            id: '550e8400-e29b-41d4-a716-446655440002',
            ...body,
            createdAt: new Date().toISOString(),
          }, { status: 201 });
        })
      );

      const { getByTestId } = renderWithProviders(
        <AddRecipeScreen navigation={mockNavigation} />
      );

      // Act: Fill form and save
      fireEvent.changeText(getByTestId('add-recipe-form-title'), 'Success Test Recipe');
      fireEvent.changeText(getByTestId('add-recipe-form-servings'), '2');
      fireEvent.press(getByTestId('add-recipe-form-submit'));

      // Assert: Success alert is shown
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Success',
          'Recipe saved successfully!',
          expect.any(Array)
        );
      });
    });
  });

  /**
   * ====================================================================
   * SECTION 2: Error Propagation (3 tests)
   * Testing API error handling and user feedback
   * ====================================================================
   */
  describe('Error Propagation', () => {

    it('Should propagate API 400 validation errors to user', async () => {
      // Arrange
      const mockNavigation = createMockNavigation<StackNavigationProp<RootStackParamList, 'AddRecipe'>>();

      server.use(
        http.post('*/api/Recipe', () => {
          return HttpResponse.json({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Validation Error',
            status: 400,
            detail: 'Title cannot exceed 200 characters',
            errors: {
              Title: ['Title cannot exceed 200 characters'],
            },
          }, { status: 400 });
        })
      );

      const { getByTestId } = renderWithProviders(
        <AddRecipeScreen navigation={mockNavigation} />
      );

      // Act: Submit with title that will fail server-side validation
      fireEvent.changeText(getByTestId('add-recipe-form-title'), 'Validation Error Test');
      fireEvent.changeText(getByTestId('add-recipe-form-servings'), '4');
      fireEvent.press(getByTestId('add-recipe-form-submit'));

      // Assert: Error alert is shown
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          'Title cannot exceed 200 characters'
        );
      });
    });

    it('Should propagate API 500 server errors to user', async () => {
      // Arrange
      const mockNavigation = createMockNavigation<StackNavigationProp<RootStackParamList, 'AddRecipe'>>();

      server.use(
        http.post('*/api/Recipe', () => {
          return HttpResponse.json({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
            title: 'Internal Server Error',
            status: 500,
            detail: 'An unexpected error occurred',
          }, { status: 500 });
        })
      );

      const { getByTestId } = renderWithProviders(
        <AddRecipeScreen navigation={mockNavigation} />
      );

      // Act: Fill form and save
      fireEvent.changeText(getByTestId('add-recipe-form-title'), 'Server Error Test');
      fireEvent.changeText(getByTestId('add-recipe-form-servings'), '4');
      fireEvent.press(getByTestId('add-recipe-form-submit'));

      // Assert: Error alert is shown with API error message
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          'An unexpected error occurred'
        );
      });
    });

    it('Should handle network failures after retry exhaustion', async () => {
      // Arrange
      const mockNavigation = createMockNavigation<StackNavigationProp<RootStackParamList, 'AddRecipe'>>();

      // Mock network error for all retry attempts
      let callCount = 0;
      server.use(
        http.post('*/api/Recipe', () => {
          callCount++;
          // Return network error for all attempts
          return HttpResponse.error();
        })
      );

      const { getByTestId } = renderWithProviders(
        <AddRecipeScreen navigation={mockNavigation} />
      );

      // Act: Fill form and save
      fireEvent.changeText(getByTestId('add-recipe-form-title'), 'Network Error Test');
      fireEvent.changeText(getByTestId('add-recipe-form-servings'), '4');
      fireEvent.press(getByTestId('add-recipe-form-submit'));

      // Assert: Error alert is shown after retries exhausted
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      }, { timeout: 10000 });

      // Verify error message from RecipeService
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Network error: Unable to reach the server. Please check your connection.'
      );

      // Verify retries happened (3 attempts)
      expect(callCount).toBeGreaterThanOrEqual(3);
    }, 15000);
  });
});