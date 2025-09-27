import { http, HttpResponse } from 'msw';
import { placeholderRecipes, RecipeWithCategory } from '../../data/mockRecipes';
import { RecipeRequestDto } from '../../lib/shared';

// In-memory storage for MSW (resets on app reload)
let recipes: RecipeWithCategory[] = [...placeholderRecipes];
let nextId = 6; // Start after existing IDs

/**
 * MSW handlers for recipe API endpoints
 * Intercepts network requests and returns mock data
 */
export const recipeHandlers = [
  // GET /api/recipes - Get all recipes
  http.get('*/api/recipes', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limit = url.searchParams.get('limit');

    let result = [...recipes];

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum)) {
        result = result.slice(0, limitNum);
      }
    }

    // Simulate network delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json(result));
      }, 300); // 300ms delay to simulate real API
    });
  }),

  // GET /api/recipes/:id - Get recipe by ID
  http.get('*/api/recipes/:id', ({ params }) => {
    const { id } = params;
    const recipe = recipes.find(r => r.id === id);

    if (!recipe) {
      return new HttpResponse(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Recipe with ID ${id} was not found`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json(recipe));
      }, 200);
    });
  }),

  // GET /api/recipes/search - Search recipes by title
  http.get('*/api/recipes/search', ({ request }) => {
    const url = new URL(request.url);
    const title = url.searchParams.get('title');

    if (!title) {
      return HttpResponse.json([]);
    }

    const searchTerm = title.toLowerCase();
    const results = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.instructions?.toLowerCase().includes(searchTerm)
    );

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json(results));
      }, 250);
    });
  }),

  // POST /api/recipes - Create new recipe
  http.post('*/api/recipes', async ({ request }) => {
    try {
      const newRecipeData = await request.json() as RecipeRequestDto;

      const newRecipe: RecipeWithCategory = {
        id: `550e8400-e29b-41d4-a716-44665544000${nextId}`,
        title: newRecipeData.title,
        instructions: newRecipeData.instructions,
        servings: newRecipeData.servings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'All', // Default category for new recipes
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=500&fit=crop', // Default image
      };

      recipes.push(newRecipe);
      nextId++;

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(HttpResponse.json(newRecipe, { status: 201 }));
        }, 400);
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
          detail: 'Invalid recipe data provided',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }
  }),

  // PUT /api/recipes/:id - Update existing recipe
  http.put('*/api/recipes/:id', async ({ params, request }) => {
    const { id } = params;
    const recipeIndex = recipes.findIndex(r => r.id === id);

    if (recipeIndex === -1) {
      return new HttpResponse(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Recipe with ID ${id} was not found`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }

    try {
      const updateData = await request.json() as RecipeRequestDto;
      const existingRecipe = recipes[recipeIndex];

      const updatedRecipe: RecipeWithCategory = {
        ...existingRecipe,
        title: updateData.title,
        instructions: updateData.instructions,
        servings: updateData.servings,
        updatedAt: new Date().toISOString(),
      };

      recipes[recipeIndex] = updatedRecipe;

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(HttpResponse.json(updatedRecipe));
        }, 350);
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
          detail: 'Invalid recipe data provided',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }
  }),

  // DELETE /api/recipes/:id - Delete recipe
  http.delete('*/api/recipes/:id', ({ params }) => {
    const { id } = params;
    const recipeIndex = recipes.findIndex(r => r.id === id);

    if (recipeIndex === -1) {
      return new HttpResponse(
        JSON.stringify({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: `Recipe with ID ${id} was not found`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/problem+json' }
        }
      );
    }

    recipes.splice(recipeIndex, 1);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(new HttpResponse(null, { status: 204 }));
      }, 200);
    });
  }),
];

/**
 * Reset mock data to initial state
 * Useful for testing or development reset
 */
export const resetMockRecipes = (): void => {
  recipes = [...placeholderRecipes];
  nextId = 6;
};