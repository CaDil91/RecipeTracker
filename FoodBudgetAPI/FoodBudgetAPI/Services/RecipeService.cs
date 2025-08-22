using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Entities;

namespace FoodBudgetAPI.Services;

/// <summary>
/// Provides functionality to manage recipes, including retrieving, creating, updating, and deleting recipes.
/// </summary>
public class RecipeService(IRecipeRepository recipeRepository, ILogger<RecipeService> logger)
    : IRecipeService
{
    private readonly IRecipeRepository _recipeRepository = recipeRepository ?? throw new ArgumentNullException(nameof(recipeRepository));
    private readonly ILogger<RecipeService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Retrieves all recipes, optionally filtered by user ID and limited to a specified number of results.
    /// </summary>
    /// <param name="userId">The optional ID of the user to filter recipes for. If null, all recipes are retrieved.</param>
    /// <param name="limit">The optional maximum number of recipes to retrieve. Must be greater than zero if provided.</param>
    /// <returns>A collection of recipes based on the specified filters.</returns>
    /// <exception cref="ArgumentException">Thrown when the limit is less than or equal to zero.</exception>
    public async Task<IEnumerable<Recipe>> GetAllRecipesAsync(Guid? userId = null, int? limit = null)
    {
        _logger.LogInformation("Getting recipes with filters - UserId: {UserId}, Limit: {Limit}", 
            userId, limit);

        IEnumerable<Recipe> recipes = userId.HasValue 
            ? await _recipeRepository.GetByUserIdAsync(userId.Value)
            : await _recipeRepository.GetAllAsync();

        if (limit.HasValue) recipes = recipes.Take(limit.Value);

        return recipes;
    }

    /// <summary>
    /// Retrieves a recipe by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the recipe to retrieve.</param>
    /// <returns>The recipe with the specified identifier, or null if not found.</returns>
    public async Task<Recipe?> GetRecipeByIdAsync(Guid id)
    {
        _logger.LogInformation("Getting recipe by ID: {RecipeId}", id);
        return await _recipeRepository.GetByIdAsync(id);
    }

    /// <summary>
    /// Creates a new recipe and persists it to the data store.
    /// </summary>
    /// <param name="recipe">The recipe to be created, including details such as title, servings, and optional instructions.</param>
    /// <returns>The newly created recipe with its assigned unique identifier and timestamp.</returns>
    /// <exception cref="ArgumentNullException">Thrown when the provided recipe is null.</exception>
    /// <exception cref="ArgumentException">Thrown when the recipe's title is null, empty, or whitespace, or if the serving count is less than or equal to zero.</exception>
    public async Task<Recipe> CreateRecipeAsync(Recipe recipe)
    {
        ArgumentNullException.ThrowIfNull(recipe);

        if (string.IsNullOrWhiteSpace(recipe.Title)) throw new ArgumentException("Recipe title is required", nameof(recipe));

        if (recipe.Servings <= 0) throw new ArgumentException("Servings must be greater than zero", nameof(recipe));

        recipe.Id = Guid.NewGuid();
        recipe.CreatedAt = DateTime.UtcNow;

        _logger.LogInformation("Creating new recipe with ID: {RecipeId}, Title: {Title}", 
            recipe.Id, recipe.Title);

        await _recipeRepository.AddAsync(recipe);
        await _recipeRepository.SaveChangesAsync();

        return recipe;
    }

    /// <summary>
    /// Updates an existing recipe with new details.
    /// </summary>
    /// <param name="id">The unique identifier of the recipe to update.</param>
    /// <param name="recipe">The updated recipe details to be applied.</param>
    /// <returns>The updated recipe object.</returns>
    /// <exception cref="ArgumentException">Thrown when the recipe details are invalid (e.g., title is empty or servings are non-positive).</exception>
    /// <exception cref="KeyNotFoundException">Thrown when a recipe with the specified ID does not exist.</exception>
    public async Task<Recipe> UpdateRecipeAsync(Guid id, Recipe recipe)
    {
        if (string.IsNullOrWhiteSpace(recipe.Title))
            throw new ArgumentException("Recipe title is required", nameof(recipe));

        if (recipe.Servings <= 0) throw new ArgumentException("Servings must be greater than zero", nameof(recipe));

        Recipe? existingRecipe = await _recipeRepository.GetByIdAsync(id);
        if (existingRecipe == null)
        {
            _logger.LogWarning("Recipe not found for update - ID: {RecipeId}", id);
            throw new KeyNotFoundException($"Recipe with ID {id} not found");
        }

        existingRecipe.Title = recipe.Title;
        existingRecipe.Instructions = recipe.Instructions;
        existingRecipe.Servings = recipe.Servings;
        existingRecipe.UserId = recipe.UserId;

        _logger.LogInformation("Updating recipe - ID: {RecipeId}, Title: {Title}", id, recipe.Title);

        await _recipeRepository.UpdateAsync(existingRecipe);
        await _recipeRepository.SaveChangesAsync();

        return existingRecipe;
    }

    /// <summary>
    /// Deletes a recipe identified by its unique ID.
    /// </summary>
    /// <param name="id">The unique identifier of the recipe to delete.</param>
    /// <returns>A boolean indicating whether the deletion was successful. Returns false if the recipe was not found.</returns>
    public async Task<bool> DeleteRecipeAsync(Guid id)
    {
        Recipe? existingRecipe = await _recipeRepository.GetByIdAsync(id);
        if (existingRecipe == null)
        {
            _logger.LogWarning("Recipe not found for deletion - ID: {RecipeId}", id);
            return false;
        }

        _logger.LogInformation("Deleting recipe - ID: {RecipeId}, Title: {Title}", 
            id, existingRecipe.Title);

        await _recipeRepository.DeleteAsync(id);
        await _recipeRepository.SaveChangesAsync();

        return true;
    }
}