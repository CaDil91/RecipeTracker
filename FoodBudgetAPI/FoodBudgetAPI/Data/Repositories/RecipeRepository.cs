using FoodBudgetAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodBudgetAPI.Data.Repositories;

public class RecipeRepository(FoodBudgetDbContext context, ILogger<RecipeRepository> logger)
    : Repository<Recipe>(context, logger), IRecipeRepository
{
    public async Task<IEnumerable<Recipe>> GetByTitleAsync(string title)
    {
        return await DbSet
            .Where(r => r.Title.Contains(title))
            .ToListAsync();
    }

    public async Task<IEnumerable<Recipe>> GetByUserIdAsync(Guid userId)
    {
        return await DbSet
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }

    // You can override base methods if needed for Recipe-specific logic
    public override async Task<IEnumerable<Recipe>> GetAllAsync()
    {
        return await DbSet
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }
}
