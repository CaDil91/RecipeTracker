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
    .max(5000, 'Instructions cannot exceed 5000 characters')
    .nullable()
    .optional(),

  servings: z
    .number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be between 1 and 100')
    .max(100, 'Servings must be between 1 and 100'),

  category: z
    .string()
    .max(100, 'Category cannot exceed 100 characters')
    .nullable()
    .optional(),

  imageUrl: z
    .string()
    .url('Invalid image URL format')
    .nullable()
    .optional(),

  userId: z
    .string()
    .uuid('Invalid user ID format')
    .nullable()
    .optional(),
});

/**
 * Validation schema for RecipeResponseDto
 */
export const RecipeResponseSchema = z.object({
  id: z.string().uuid('Invalid recipe ID format'),

  title: z.string().min(1).max(200),

  instructions: z.string().max(5000).nullable().optional(),

  servings: z.number().int().min(1).max(100),

  category: z.string().max(100).nullable().optional(),

  imageUrl: z.string().url('Invalid image URL format').nullable().optional(),

  createdAt: z.string(),

  userId: z.string().uuid('Invalid user ID format').nullable().optional(),
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