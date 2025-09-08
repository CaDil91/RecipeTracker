import {
  RecipeRequestSchema,
  RecipeResponseSchema,
  RecipeSchema,
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
    describe('valid data', () => {
      it('should validate complete valid recipe request', () => {
        const validRequest = {
          title: 'Test Recipe',
          instructions: 'Step 1: Do something',
          servings: 4,
          userId: '123e4567-e89b-12d3-a456-426614174000',
        };

        const result = RecipeRequestSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validRequest);
        }
      });

      it('should validate minimal valid request (required fields only)', () => {
        const minimalRequest = {
          title: 'T',
          servings: 1,
        };

        const result = RecipeRequestSchema.safeParse(minimalRequest);
        expect(result.success).toBe(true);
      });

      it('should validate with optional fields as null', () => {
        const requestWithNulls = {
          title: 'Test Recipe',
          instructions: null,
          servings: 50,
          userId: null,
        };

        const result = RecipeRequestSchema.safeParse(requestWithNulls);
        expect(result.success).toBe(true);
      });

      it('should validate boundary values', () => {
        // Test min/max title length
        const maxTitleRequest = {
          title: 'a'.repeat(200), // Max title length
          servings: 100, // Max servings
        };

        expect(RecipeRequestSchema.safeParse(maxTitleRequest).success).toBe(true);

        // Test max instructions length
        const maxInstructionsRequest = {
          title: 'Test',
          instructions: 'a'.repeat(5000), // Max instructions length
          servings: 1, // Min servings
        };

        expect(RecipeRequestSchema.safeParse(maxInstructionsRequest).success).toBe(true);
      });

      it('should validate with missing optional fields', () => {
        const requestMissingOptional = {
          title: 'Test Recipe',
          servings: 4,
          // instructions and userId omitted
        };

        const result = RecipeRequestSchema.safeParse(requestMissingOptional);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid data', () => {
      it('should reject missing title', () => {
        const invalidRequest = {
          servings: 4,
        };

        const result = RecipeRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject empty title', () => {
        const invalidRequest = {
          title: '',
          servings: 4,
        };

        const result = RecipeRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject title too long', () => {
        const invalidRequest = {
          title: 'a'.repeat(201), // Over max length
          servings: 4,
        };

        const result = RecipeRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject instructions too long', () => {
        const invalidRequest = {
          title: 'Test Recipe',
          instructions: 'a'.repeat(5001), // Over max length
          servings: 4,
        };

        const result = RecipeRequestSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject invalid servings values', () => {
        // Test servings = 0
        const zeroServings = {
          title: 'Test Recipe',
          servings: 0,
        };
        let result = RecipeRequestSchema.safeParse(zeroServings);
        expect(result.success).toBe(false);

        // Test servings > 100
        const tooManyServings = {
          title: 'Test Recipe',
          servings: 101,
        };
        result = RecipeRequestSchema.safeParse(tooManyServings);
        expect(result.success).toBe(false);

        // Test negative servings
        const negativeServings = {
          title: 'Test Recipe',
          servings: -1,
        };
        result = RecipeRequestSchema.safeParse(negativeServings);
        expect(result.success).toBe(false);
      });

      it('should reject decimal servings', () => {
        const decimalServings = {
          title: 'Test Recipe',
          servings: 4.5,
        };

        const result = RecipeRequestSchema.safeParse(decimalServings);
        expect(result.success).toBe(false);
      });

      it('should reject invalid userId format', () => {
        const invalidUserId = {
          title: 'Test Recipe',
          servings: 4,
          userId: 'not-a-uuid',
        };

        const result = RecipeRequestSchema.safeParse(invalidUserId);
        expect(result.success).toBe(false);
      });

      it('should reject wrong data types', () => {
        const wrongTypes = {
          title: 123, // Should be string
          servings: '4', // Should be number
        };

        const result = RecipeRequestSchema.safeParse(wrongTypes);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('RecipeResponseSchema', () => {
    describe('valid data', () => {
      it('should validate complete valid recipe response', () => {
        const validResponse = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          instructions: 'Step 1: Do something',
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
          userId: '123e4567-e89b-12d3-a456-426614174001',
        };

        const result = RecipeResponseSchema.safeParse(validResponse);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validResponse);
        }
      });

      it('should validate with optional fields as null', () => {
        const responseWithNulls = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Recipe',
          instructions: null,
          servings: 4,
          createdAt: '2023-01-01T12:00:00.000Z',
          userId: null,
        };

        const result = RecipeResponseSchema.safeParse(responseWithNulls);
        expect(result.success).toBe(true);
      });

      it('should validate different datetime formats', () => {
        const validDatetimes = [
          '2023-01-01T12:00:00.000Z',
          '2023-12-31T23:59:59.999Z',
          '2023-06-15T08:30:45.123Z',
        ];

        validDatetimes.forEach((datetime) => {
          const response = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Recipe',
            servings: 4,
            createdAt: datetime,
          };

          const result = RecipeResponseSchema.safeParse(response);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('invalid data', () => {
      it('should reject missing required fields', () => {
        const missingFields = [
          { title: 'Test', servings: 4, createdAt: '2023-01-01T12:00:00.000Z' }, // Missing id
          { id: '123e4567-e89b-12d3-a456-426614174000', servings: 4, createdAt: '2023-01-01T12:00:00.000Z' }, // Missing title
          { id: '123e4567-e89b-12d3-a456-426614174000', title: 'Test', createdAt: '2023-01-01T12:00:00.000Z' }, // Missing servings
          { id: '123e4567-e89b-12d3-a456-426614174000', title: 'Test', servings: 4 }, // Missing createdAt
        ];

        missingFields.forEach((invalidResponse) => {
          const result = RecipeResponseSchema.safeParse(invalidResponse);
          expect(result.success).toBe(false);
        });
      });

      it('should reject invalid UUID formats', () => {
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

          const result = RecipeResponseSchema.safeParse(response);
          expect(result.success).toBe(false);
        });
      });

      it('should reject invalid datetime formats', () => {
        const invalidDatetimes = [
          'not-a-date',
          '2023-01-01', // Missing time
          '2023-13-01T12:00:00.000Z', // Invalid month
          '2023-01-32T12:00:00.000Z', // Invalid day
          '2023-01-01T25:00:00.000Z', // Invalid hour
        ];

        invalidDatetimes.forEach((invalidDate) => {
          const response = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Recipe',
            servings: 4,
            createdAt: invalidDate,
          };

          const result = RecipeResponseSchema.safeParse(response);
          expect(result.success).toBe(false);
        });
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