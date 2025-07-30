using FoodBudgetAPI.Entities;

namespace FoodBudgetAPI.Data.Repositories;

public interface IRecipeRepository : IRepository<Recipe>
{
    Task<IEnumerable<Recipe>> GetByTitleAsync(string title);
    Task<IEnumerable<Recipe>> GetByUserIdAsync(Guid userId);
}
