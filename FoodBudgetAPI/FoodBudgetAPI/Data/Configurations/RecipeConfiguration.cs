using FoodBudgetAPI.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodBudgetAPI.Data.Configurations;

/// <summary>
/// Provides the entity configuration for the <see cref="Recipe"/> entity.
/// Configures properties, relationships, keys, indices, and any other database-specific rules for the Recipe entity.
/// Implements the <see cref="IEntityTypeConfiguration{Recipe}"/> interface to define the configuration.
/// Typically used in conjunction with the Entity Framework Core's <see cref="ModelBuilder"/> in the DbContext.
/// </summary>
public class RecipeConfiguration : IEntityTypeConfiguration<Recipe>
{
    public void Configure(EntityTypeBuilder<Recipe> builder)
    {
        // Primary key
        builder.HasKey(e => e.Id);
        
        // Identity column
        builder.Property(e => e.Id)
            .ValueGeneratedOnAdd();
        
        // Title is required with max length
        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(500); // Note: Enforced by SQL Server, not SQLite in tests
        
        // Instructions are optional with max length
        builder.Property(e => e.Instructions)
            .IsRequired(false)
            .HasMaxLength(10000);  // Note: Enforced by SQL Server, not SQLite in tests
        
        // Servings are required
        builder.Property(e => e.Servings)
            .IsRequired();
        
        // CreatedAt is required
        builder.Property(e => e.CreatedAt)
            .IsRequired();
        
        // UserId is optional
        builder.Property(e => e.UserId)
            .IsRequired(false);
    }
}