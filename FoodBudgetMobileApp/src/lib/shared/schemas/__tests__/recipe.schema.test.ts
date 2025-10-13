import {
  RecipeRequestSchema,
  RecipeResponseSchema,
  isValidRecipeRequest,
  isValidRecipeResponse,
  isValidRecipe,
  parseRecipeRequest,
  parseRecipeResponse,
  parseRecipe,
  safeParseRecipeRequest,
  safeParseRecipeResponse,
  safeParseRecipe,
} from '../recipe.schema';

describe('Recipe Schemas', () => {
  describe('RecipeRequestSchema', () => {
    /**
     * Happy Path Tests
     * Test the primary use cases that deliver business value
     */
    describe('Happy Path', () => {
      it('given complete valid recipe request, when validated, then succeeds', () => {
        // Arrange
        const validRequest = {
          title: 'Test Recipe',
          instructions: 'Step 1: Do something',
          servings: 4,
          userId: '123e4567-e89b-12d3-a456-426614174000',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(validRequest);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validRequest);
        }
      });

      it('given minimal valid request (required fields only), when validated, then succeeds', () => {
        // Arrange
        const minimalRequest = {
          title: 'T',
          servings: 1,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(minimalRequest);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given recipe request with category, when validated, then succeeds', () => {
        // Arrange
        const requestWithCategory = {
          title: 'Test Recipe',
          servings: 4,
          category: 'Breakfast',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithCategory);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe('Breakfast');
        }
      });

      it('given recipe request with imageUrl, when validated, then succeeds', () => {
        // Arrange
        const requestWithImage = {
          title: 'Test Recipe',
          servings: 4,
          imageUrl: 'https://example.com/image.jpg',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithImage);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.imageUrl).toBe('https://example.com/image.jpg');
        }
      });

      it('given recipe request with both category and imageUrl, when validated, then succeeds', () => {
        // Arrange
        const requestWithBoth = {
          title: 'Test Recipe',
          servings: 4,
          category: 'Dinner',
          imageUrl: 'https://example.com/dinner.png',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithBoth);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe('Dinner');
          expect(result.data.imageUrl).toBe('https://example.com/dinner.png');
        }
      });
    });

    /**
     * Null/Empty/Invalid Tests
     * Verify graceful handling of edge cases and malformed data
     */
    describe('Null/Empty/Invalid', () => {
      it('given missing title, when validated, then fails', () => {
        // Arrange
        const invalidRequest = {
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(invalidRequest);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given empty title, when validated, then fails', () => {
        // Arrange
        const invalidRequest = {
          title: '',
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(invalidRequest);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given null category, when validated, then succeeds (optional field)', () => {
        // Arrange
        const requestWithNullCategory = {
          title: 'Test Recipe',
          servings: 4,
          category: null,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithNullCategory);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given null imageUrl, when validated, then succeeds (optional field)', () => {
        // Arrange
        const requestWithNullImage = {
          title: 'Test Recipe',
          servings: 4,
          imageUrl: null,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithNullImage);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given null instructions and userId, when validated, then succeeds (optional fields)', () => {
        // Arrange
        const requestWithNulls = {
          title: 'Test Recipe',
          instructions: null,
          servings: 50,
          userId: null,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestWithNulls);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given missing optional fields, when validated, then succeeds', () => {
        // Arrange
        const requestMissingOptional = {
          title: 'Test Recipe',
          servings: 4,
          // instructions, userId, category, imageUrl omitted
        };

        // Act
        const result = RecipeRequestSchema.safeParse(requestMissingOptional);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given invalid imageUrl format, when validated, then fails', () => {
        // Arrange
        const invalidImageUrl = {
          title: 'Test Recipe',
          servings: 4,
          imageUrl: 'not-a-valid-url',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(invalidImageUrl);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given invalid userId format, when validated, then fails', () => {
        // Arrange
        const invalidUserId = {
          title: 'Test Recipe',
          servings: 4,
          userId: 'not-a-uuid',
        };

        // Act
        const result = RecipeRequestSchema.safeParse(invalidUserId);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given wrong data types, when validated, then fails', () => {
        // Arrange
        const wrongTypes = {
          title: 123, // Should be string
          servings: '4', // Should be number
        };

        // Act
        const result = RecipeRequestSchema.safeParse(wrongTypes);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given decimal servings, when validated, then fails', () => {
        // Arrange
        const decimalServings = {
          title: 'Test Recipe',
          servings: 4.5,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(decimalServings);

        // Assert
        expect(result.success).toBe(false);
      });
    });

    /**
     * Boundary Tests
     * Test minimum, maximum, and threshold values
     */
    describe('Boundaries', () => {
      it('given title at max length (200 chars), when validated, then succeeds', () => {
        // Arrange
        const maxTitleRequest = {
          title: 'a'.repeat(200),
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(maxTitleRequest);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given title over max length (201 chars), when validated, then fails', () => {
        // Arrange
        const tooLongTitle = {
          title: 'a'.repeat(201),
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(tooLongTitle);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given instructions at max length (5000 chars), when validated, then succeeds', () => {
        // Arrange
        const maxInstructionsRequest = {
          title: 'Test',
          instructions: 'a'.repeat(5000),
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(maxInstructionsRequest);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given instructions over max length (5001 chars), when validated, then fails', () => {
        // Arrange
        const tooLongInstructions = {
          title: 'Test Recipe',
          instructions: 'a'.repeat(5001),
          servings: 4,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(tooLongInstructions);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given category at max length (100 chars), when validated, then succeeds', () => {
        // Arrange
        const maxCategoryRequest = {
          title: 'Test Recipe',
          servings: 4,
          category: 'a'.repeat(100),
        };

        // Act
        const result = RecipeRequestSchema.safeParse(maxCategoryRequest);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given category over max length (101 chars), when validated, then fails', () => {
        // Arrange
        const tooLongCategory = {
          title: 'Test Recipe',
          servings: 4,
          category: 'a'.repeat(101),
        };

        // Act
        const result = RecipeRequestSchema.safeParse(tooLongCategory);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given servings at min (1), when validated, then succeeds', () => {
        // Arrange
        const minServings = {
          title: 'Test Recipe',
          servings: 1,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(minServings);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given servings below min (0), when validated, then fails', () => {
        // Arrange
        const belowMinServings = {
          title: 'Test Recipe',
          servings: 0,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(belowMinServings);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given servings at max (100), when validated, then succeeds', () => {
        // Arrange
        const maxServings = {
          title: 'Test Recipe',
          servings: 100,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(maxServings);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given servings over max (101), when validated, then fails', () => {
        // Arrange
        const aboveMaxServings = {
          title: 'Test Recipe',
          servings: 101,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(aboveMaxServings);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given negative servings, when validated, then fails', () => {
        // Arrange
        const negativeServings = {
          title: 'Test Recipe',
          servings: -1,
        };

        // Act
        const result = RecipeRequestSchema.safeParse(negativeServings);

        // Assert
        expect(result.success).toBe(false);
      });
    });
  });

  describe('RecipeResponseSchema', () => {
    /**
     * Happy Path Tests
     * Test the primary use cases that deliver business value
     */
    describe('Happy Path', () => {
      it('given complete valid recipe response, when validated, then succeeds', () => {
        // Arrange
        const validResponse = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          instructions: 'Step 1: Do something',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
          userId: '123e4567-e89b-12d3-a456-426614174001',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(validResponse);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validResponse);
        }
      });

      it('given recipe response with category and imageUrl, when validated, then succeeds', () => {
        // Arrange
        const responseWithCategoryAndImage = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          category: 'Breakfast',
          imageUrl: 'https://example.com/image.jpg',
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(responseWithCategoryAndImage);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe('Breakfast');
          expect(result.data.imageUrl).toBe('https://example.com/image.jpg');
        }
      });

      it('given different valid datetime formats, when validated, then succeeds', () => {
        // Arrange
        const validDatetime = [
          '2023-01-01T12:00:00.000Z',
          '2023-12-31T23:59:59.999Z',
          '2023-06-15T08:30:45.123Z',
        ];

        validDatetime.forEach((datetime) => {
          const response = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Recipe',
            servings: 4,
            createdAt: datetime,
          };

          // Act
          const result = RecipeResponseSchema.safeParse(response);

          // Assert
          expect(result.success).toBe(true);
        });
      });
    });

    /**
     * Null/Empty/Invalid Tests
     * Verify graceful handling of edge cases and malformed data
     */
    describe('Null/Empty/Invalid', () => {
      it('given null optional fields, when validated, then succeeds', () => {
        // Arrange
        const responseWithNulls = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          instructions: null,
          servings: 4,
          category: null,
          imageUrl: null,
          createdAt: '2023-01-01T12:00:00.000Z',
          userId: null,
        };

        // Act
        const result = RecipeResponseSchema.safeParse(responseWithNulls);

        // Assert
        expect(result.success).toBe(true);
      });

      it('given missing required id, when validated, then fails', () => {
        // Arrange
        const missingId = {
          title: 'Test',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(missingId);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given missing required title, when validated, then fails', () => {
        // Arrange
        const missingTitle = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(missingTitle);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given missing required servings, when validated, then fails', () => {
        // Arrange
        const missingServings = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test',
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(missingServings);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given missing required createdAt, when validated, then fails', () => {
        // Arrange
        const missingCreatedAt = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test',
          servings: 4,
        };

        // Act
        const result = RecipeResponseSchema.safeParse(missingCreatedAt);

        // Assert
        expect(result.success).toBe(false);
      });

      it('given invalid UUID format for id, when validated, then fails', () => {
        // Arrange
        const invalidUUIDs = [
          'not-a-uuid',
          '123e4567-e89b-12d3-a456', // Too short
          '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
          '123g4567-e89b-12d3-a456-426614174000', // Invalid character
        ];

        invalidUUIDs.forEach((invalidId) => {
          const response = {
            id: invalidId,
            title: 'Test Recipe',
            servings: 4,
            createdAt: '2023-01-01T12:00:00.000Z',
          };

          // Act
          const result = RecipeResponseSchema.safeParse(response);

          // Assert
          expect(result.success).toBe(false);
        });
      });


      it('given invalid imageUrl format, when validated, then fails', () => {
        // Arrange
        const invalidImageUrl = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          imageUrl: 'not-a-valid-url',
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        // Act
        const result = RecipeResponseSchema.safeParse(invalidImageUrl);

        // Assert
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Type Guards', () => {
    describe('isValidRecipeRequest', () => {
      it('should return true for valid recipe request', () => {
        const validRequest = {
          title: 'Test Recipe',
          servings: 4,
        };

        expect(isValidRecipeRequest(validRequest)).toBe(true);
      });

      it('should return false for invalid recipe request', () => {
        const invalidRequest = {
          title: '', // Invalid empty title
          servings: 4,
        };

        expect(isValidRecipeRequest(invalidRequest)).toBe(false);
      });

      it('should return false for null/undefined input', () => {
        expect(isValidRecipeRequest(null)).toBe(false);
        expect(isValidRecipeRequest(undefined)).toBe(false);
      });
    });

    describe('isValidRecipeResponse', () => {
      it('should return true for valid recipe response', () => {
        const validResponse = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        expect(isValidRecipeResponse(validResponse)).toBe(true);
      });

      it('should return false for invalid recipe response', () => {
        const invalidResponse = {
          id: 'not-a-uuid',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        expect(isValidRecipeResponse(invalidResponse)).toBe(false);
      });

      it('should return false for null/undefined input', () => {
        expect(isValidRecipeResponse(null)).toBe(false);
        expect(isValidRecipeResponse(undefined)).toBe(false);
      });
    });

    describe('isValidRecipe', () => {
      it('should return true for valid recipe', () => {
        const validRecipe = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        expect(isValidRecipe(validRecipe)).toBe(true);
      });

      it('should return false for invalid recipe', () => {
        const invalidRecipe = {
          title: 'Test Recipe',
          // Missing required fields
        };

        expect(isValidRecipe(invalidRecipe)).toBe(false);
      });

      it('should return false for null/undefined input', () => {
        expect(isValidRecipe(null)).toBe(false);
        expect(isValidRecipe(undefined)).toBe(false);
      });
    });
  });

  describe('Parse Functions', () => {
    describe('parseRecipeRequest', () => {
      it('should successfully parse valid data', () => {
        const validRequest = {
          title: 'Test Recipe',
          servings: 4,
        };

        const result = parseRecipeRequest(validRequest);
        expect(result).toEqual(validRequest);
      });

      it('should throw error for invalid data', () => {
        const invalidRequest = {
          title: '',
          servings: 4,
        };

        expect(() => parseRecipeRequest(invalidRequest)).toThrow();
      });
    });

    describe('parseRecipeResponse', () => {
      it('should successfully parse valid data', () => {
        const validResponse = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        const result = parseRecipeResponse(validResponse);
        expect(result).toEqual(validResponse);
      });

      it('should throw error for invalid data', () => {
        const invalidResponse = {
          id: 'not-a-uuid',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        expect(() => parseRecipeResponse(invalidResponse)).toThrow();
      });
    });

    describe('parseRecipe', () => {
      it('should successfully parse valid data', () => {
        const validRecipe = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        const result = parseRecipe(validRecipe);
        expect(result).toEqual(validRecipe);
      });

      it('should throw error for invalid data', () => {
        const invalidRecipe = {
          title: 'Test Recipe',
        };

        expect(() => parseRecipe(invalidRecipe)).toThrow();
      });
    });
  });

  describe('Safe Parse Functions', () => {
    describe('safeParseRecipeRequest', () => {
      it('should return success result for valid data', () => {
        const validRequest = {
          title: 'Test Recipe',
          servings: 4,
        };

        const result = safeParseRecipeRequest(validRequest);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validRequest);
        }
      });

      it('should return error result for invalid data', () => {
        const invalidRequest = {
          title: '',
          servings: 4,
        };

        const result = safeParseRecipeRequest(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('safeParseRecipeResponse', () => {
      it('should return success result for valid data', () => {
        const validResponse = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        const result = safeParseRecipeResponse(validResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validResponse);
        }
      });

      it('should return error result for invalid data', () => {
        const invalidResponse = {
          id: 'not-a-uuid',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        const result = safeParseRecipeResponse(invalidResponse);
        expect(result.success).toBe(false);
      });
    });

    describe('safeParseRecipe', () => {
      it('should return success result for valid data', () => {
        const validRecipe = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
        };

        const result = safeParseRecipe(validRecipe);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validRecipe);
        }
      });

      it('should return error result for invalid data', () => {
        const invalidRecipe = {
          title: 'Test Recipe',
        };

        const result = safeParseRecipe(invalidRecipe);
        expect(result.success).toBe(false);
      });
    });
  });
});