import { Recipe, CreateRecipeDto, UpdateRecipeDto, RecipeQueryParams } from '../models/recipe.model';
import { recipeRepository } from '../repositories/recipe.repository';
import { logger } from '../utility/logger';

export class RecipeService {
    async getAllRecipes(params?: RecipeQueryParams): Promise<Recipe[]> {
        try {
            logger.info('Fetching recipes with params:', params);
            const recipes = await recipeRepository.findAll(params);
            return recipes as Recipe[];
        } catch (error) {
            logger.error('Error in getAllRecipes:', error);
            throw new Error('Failed to fetch recipes');
        }
    }

    async getRecipeById(id: string): Promise<Recipe | null> {
        if (!this.isValidGuid(id)) {
            throw new Error('Invalid recipe ID format');
        }

        try {
            const recipe = await recipeRepository.findById(id);
            if (!recipe) {
                logger.warn(`Recipe not found with id: ${id}`);
                return null;
            }
            return recipe as Recipe;
        } catch (error) {
            logger.error(`Error fetching recipe ${id}:`, error);
            throw new Error('Failed to fetch recipe');
        }
    }

    async createRecipe(data: CreateRecipeDto): Promise<Recipe> {
        this.validateCreateRecipeData(data);

        try {
            const recipe = await recipeRepository.create({
                Id: crypto.randomUUID(),
                Title: data.Title,
                Instructions: data.Instructions,
                Servings: data.Servings,
                UserId: data.UserId,
                CreatedAt: new Date()
            });
            logger.info(`Recipe created successfully with id: ${recipe.Id}`);
            return recipe as Recipe;
        } catch (error) {
            logger.error('Error creating recipe:', error);
            throw new Error('Failed to create recipe');
        }
    }

    async updateRecipe(id: string, data: UpdateRecipeDto): Promise<Recipe | null> {
        if (!this.isValidGuid(id)) {
            throw new Error('Invalid recipe ID format');
        }

        this.validateUpdateRecipeData(data);

        const exists = await recipeRepository.exists(id);
        if (!exists) {
            return null;
        }

        try {
            const updatedRecipe = await recipeRepository.update(id, data);
            logger.info(`Recipe updated successfully: ${id}`);
            return updatedRecipe as Recipe;
        } catch (error) {
            logger.error(`Error updating recipe ${id}:`, error);
            throw new Error('Failed to update recipe');
        }
    }

    async deleteRecipe(id: string): Promise<boolean> {
        if (!this.isValidGuid(id)) {
            throw new Error('Invalid recipe ID format');
        }

        try {
            const exists = await recipeRepository.exists(id);
            if (!exists) {
                return false;
            }

            await recipeRepository.delete(id);
            logger.info(`Recipe deleted successfully: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting recipe ${id}:`, error);
            throw new Error('Failed to delete recipe');
        }
    }

    async getRecipeCount(userId?: string): Promise<number> {
        try {
            return await recipeRepository.count(userId);
        } catch (error) {
            logger.error('Error counting recipes:', error);
            throw new Error('Failed to count recipes');
        }
    }

    private validateCreateRecipeData(data: CreateRecipeDto): void {
        if (!data.Title || data.Title.trim().length === 0) {
            throw new Error('Recipe title is required');
        }
        if (data.Title.length > 500) {
            throw new Error('Recipe title must be 500 characters or less');
        }
        if (data.Servings !== undefined && data.Servings !== null) {
            if (data.Servings < 1 || data.Servings > 100) {
                throw new Error('Servings must be between 1 and 100');
            }
        }
    }

    private validateUpdateRecipeData(data: UpdateRecipeDto): void {
        if (data.Title !== undefined) {
            if (data.Title.trim().length === 0) {
                throw new Error('Recipe title cannot be empty');
            }
            if (data.Title.length > 500) {
                throw new Error('Recipe title must be 500 characters or less');
            }
        }
        if (data.Servings !== undefined && data.Servings !== null) {
            if (data.Servings < 1 || data.Servings > 100) {
                throw new Error('Servings must be between 1 and 100');
            }
        }
    }

    private isValidGuid(guid: string): boolean {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    }
}

export const recipeService = new RecipeService();