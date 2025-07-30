using FoodBudgetAPI.Data.Configurations;
using FoodBudgetAPI.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodBudgetAPI.Data;

/// <summary>
/// Represents a database context for the Food Budget application.
/// Provides access to entity sets and configuration of database-related operations.
/// Inherits from <see cref="DbContext"/>.
/// </summary>
public class FoodBudgetDbContext(DbContextOptions<FoodBudgetDbContext> options) : DbContext(options)
{
    /// <summary>
    /// Gets or sets the collection of recipes in the database.
    /// </summary>
    /// <remarks>
    /// This property provides access to the database table associated with the
    /// <see cref="Recipe"/> entity. It allows querying, adding, updating, and
    /// removing recipe records from the database.
    /// </remarks>
    public DbSet<Recipe> Recipes { get; set; } = null!;

    /// <summary>
    /// Configures the entity mappings and relationships for the model using the specified <see cref="ModelBuilder"/>.
    /// This method is called when the model for the context is being created and allows for custom configurations.
    /// </summary>
    /// <param name="modelBuilder">The <see cref="ModelBuilder"/> used to build and configure the entity model.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply entity configurations
        modelBuilder.ApplyConfiguration(new RecipeConfiguration());
    }
}