import { z } from 'zod';
import type { Recipe, RecipeRequestDto, RecipeResponseDto } from '../types';

/**
 * Validation schema for RecipeRequestDto
 * Matches C# DataAnnotations validation rules
 */
export const RecipeRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),

  instructions: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .refine((val) => val === null || (val.length <= 5000), {
      message: 'Instructions cannot exceed 5000 characters',
    })
    .optional(),

  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be between 1 and 100')
    .max(100, 'Servings must be between 1 and 100'),

  category: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .refine((val) => val === null || (val.length <= 100), {
      message: 'Category cannot exceed 100 characters',
    })
    .optional(),

  imageUrl: z
    .string()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .refine(
      (val) => {
        if (val === null) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid image URL format' }
    )
    .optional(),
});

/**
 * Validation schema for RecipeResponseDto
 */
export const RecipeResponseSchema = z.object({
  id: z
    .string()
    .refine(
      (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Invalid recipe ID format' }
    ),

  title: z.string().min(1).max(200),

  instructions: z.string().max(5000).nullable().optional(),

  servings: z.number().int().min(1).max(100),

  category: z.string().max(100).nullable().optional(),

  imageUrl: z
    .string()
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid image URL format' }
    )
    .nullable()
    .optional(),

  createdAt: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid datetime format' }
    )
    .transform((val) => {
      // Accept various date formats from the API
      const date = new Date(val);
      return date.toISOString();
    }),

  userId: z
    .string()
    .refine(
      (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Invalid user ID format' }
    ),
});

/**
 * Validation schema for Recipe entity
 */
export const RecipeSchema = RecipeResponseSchema;

/**
 * Type guards for runtime validation
 */
export const isValidRecipeRequest = (data: unknown): data is RecipeRequestDto => {
  return RecipeRequestSchema.safeParse(data).success;
};

export const isValidRecipeResponse = (data: unknown): data is RecipeResponseDto => {
  return RecipeResponseSchema.safeParse(data).success;
};

export const isValidRecipe = (data: unknown): data is Recipe => {
  return RecipeSchema.safeParse(data).success;
};

/**
 * Parse and validate functions with error handling
 */
export const parseRecipeRequest = (data: unknown): RecipeRequestDto => {
  return RecipeRequestSchema.parse(data);
};

export const parseRecipeResponse = (data: unknown): RecipeResponseDto => {
  return RecipeResponseSchema.parse(data);
};

export const parseRecipe = (data: unknown): Recipe => {
  return RecipeSchema.parse(data);
};

/**
 * Safe parse functions that return result objects
 */
export const safeParseRecipeRequest = (data: unknown) => {
  return RecipeRequestSchema.safeParse(data);
};

export const safeParseRecipeResponse = (data: unknown) => {
  return RecipeResponseSchema.safeParse(data);
};

export const safeParseRecipe = (data: unknown) => {
  return RecipeSchema.safeParse(data);
};