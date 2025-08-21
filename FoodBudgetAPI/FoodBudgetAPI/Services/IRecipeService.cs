using FoodBudgetAPI.Entities;

namespace FoodBudgetAPI.Services;

public interface IRecipeService
{
    Task<IEnumerable<Recipe>> GetAllRecipesAsync(Guid? userId = null, int? limit = null);
    Task<Recipe?> GetRecipeByIdAsync(Guid id);
    Task<Recipe> CreateRecipeAsync(Recipe recipe);
    Task<Recipe> UpdateRecipeAsync(Guid id, Recipe recipe);
    Task<bool> DeleteRecipeAsync(Guid id);
}