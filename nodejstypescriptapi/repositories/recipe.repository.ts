import { Recipes, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { RecipeQueryParams } from '../models/recipe.model';

export class RecipeRepository {
    async findAll(params?: RecipeQueryParams): Promise<Recipes[]> {
        const { userId, limit = 100, offset = 0, sortBy = 'CreatedAt', sortOrder = 'desc' } = params || {};

        const where: Prisma.RecipesWhereInput = userId ? { UserId: userId } : {};
        const orderBy: Prisma.RecipesOrderByWithRelationInput = { [sortBy]: sortOrder };

        return await prisma.recipes.findMany({
            where,
            orderBy,
            take: limit,
            skip: offset
        });
    }

    async findById(id: string): Promise<Recipes | null> {
        return await prisma.recipes.findUnique({
            where: { Id: id }
        });
    }

    async create(data: Prisma.RecipesCreateInput): Promise<Recipes> {
        return await prisma.recipes.create({
            data: {
                ...data,
                Id: data.Id || crypto.randomUUID(),
                CreatedAt: data.CreatedAt || new Date()
            }
        });
    }

    async update(id: string, data: Prisma.RecipesUpdateInput): Promise<Recipes> {
        return await prisma.recipes.update({
            where: { Id: id },
            data
        });
    }

    async delete(id: string): Promise<Recipes> {
        return await prisma.recipes.delete({
            where: { Id: id }
        });
    }

    async count(userId?: string): Promise<number> {
        return await prisma.recipes.count({
            where: userId ? { UserId: userId } : {}
        });
    }

    async exists(id: string): Promise<boolean> {
        const count = await prisma.recipes.count({
            where: { Id: id }
        });
        return count > 0;
    }
}

export const recipeRepository = new RecipeRepository();
