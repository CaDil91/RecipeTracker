export interface Recipe {
    Id: string;
    Title: string;
    Instructions?: string | null;
    Servings?: number | null;
    CreatedAt: Date;
    UserId?: string | null;
}

export interface CreateRecipeDto {
    Title: string;
    Instructions?: string | null;
    Servings?: number | null;
    UserId?: string | null;
}

export interface UpdateRecipeDto {
    Title?: string;
    Instructions?: string | null;
    Servings?: number | null;
}

export interface RecipeQueryParams {
    userId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'CreatedAt' | 'Title';
    sortOrder?: 'asc' | 'desc';
}