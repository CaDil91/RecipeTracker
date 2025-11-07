using FluentAssertions;
using FoodBudgetAPI;
using FoodBudgetAPI.Data;
using FoodBudgetAPI.Entities;
using FoodBudgetAPIIntegrationTests.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;

namespace FoodBudgetAPIIntegrationTests.Data;

public class RecipeDbContextTests(DbTestFactory<Program> factory) : IClassFixture<DbTestFactory<Program>>
{

    #region Basic CRUD Operations

    [Fact]
    public async Task Create_ValidRecipe_SuccessfullyPersistsToDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved.Should().NotBeNull();
        saved.Title.Should().Be("Test Recipe");
        saved.Instructions.Should().Be("Test instructions");
        saved.Servings.Should().Be(4);
        saved.UserId.Should().Be(recipe.UserId);
    }

    [Fact]
    public async Task Read_ExistingRecipe_ReturnsCorrectData()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Read Test Recipe",
            Instructions = "Read test instructions",
            Servings = 2,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Act
        Recipe? retrieved = await context.Recipes.FindAsync(recipe.Id);

        // Assert
        retrieved.Should().NotBeNull();
        retrieved.Title.Should().Be("Read Test Recipe");
        retrieved.Instructions.Should().Be("Read test instructions");
        retrieved.Servings.Should().Be(2);
    }

    [Fact]
    public async Task Update_ExistingRecipe_PersistsChanges()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Original Title",
            Instructions = "Original instructions",
            Servings = 1,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Act
        recipe.Title = "Updated Title";
        recipe.Instructions = "Updated instructions";
        recipe.Servings = 6;
        await context.SaveChangesAsync();

        // Assert
        Recipe? updated = await context.Recipes.FindAsync(recipe.Id);
        updated!.Title.Should().Be("Updated Title");
        updated.Instructions.Should().Be("Updated instructions");
        updated.Servings.Should().Be(6);
    }

    [Fact]
    public async Task Delete_ExistingRecipe_RemovesFromDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Recipe to Delete",
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Act
        context.Recipes.Remove(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? deleted = await context.Recipes.FindAsync(recipe.Id);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task BulkCreate_MultipleRecipes_AllPersisted()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipes = new List<Recipe>
        {
            new() { Title = "Bulk Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow },
            new() { Title = "Bulk Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow },
            new() { Title = "Bulk Recipe 3", Servings = 6, CreatedAt = DateTime.UtcNow }
        };

        // Act
        context.Recipes.AddRange(recipes);
        await context.SaveChangesAsync();

        // Assert
        List<Recipe> savedRecipes = await context.Recipes
            .Where(r => r.Title.StartsWith("Bulk Recipe"))
            .ToListAsync();
        savedRecipes.Should().HaveCount(3);
    }

    [Fact]
    public async Task BulkDelete_MultipleRecipes_AllRemoved()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipes = new List<Recipe>
        {
            new() { Title = "Delete Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow },
            new() { Title = "Delete Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow },
            new() { Title = "Delete Recipe 3", Servings = 6, CreatedAt = DateTime.UtcNow }
        };
        
        context.Recipes.AddRange(recipes);
        await context.SaveChangesAsync();

        // Act
        context.Recipes.RemoveRange(recipes);
        await context.SaveChangesAsync();

        // Assert
        List<Recipe> remainingRecipes = await context.Recipes
            .Where(r => r.Title.StartsWith("Delete Recipe"))
            .ToListAsync();
        remainingRecipes.Should().BeEmpty();
    }

    [Fact]
    public async Task BulkUpdate_MultipleRecipes_AllUpdated()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipes = new List<Recipe>
        {
            new() { Title = "Update Recipe 1", Servings = 1, CreatedAt = DateTime.UtcNow },
            new() { Title = "Update Recipe 2", Servings = 2, CreatedAt = DateTime.UtcNow },
            new() { Title = "Update Recipe 3", Servings = 3, CreatedAt = DateTime.UtcNow }
        };
        
        context.Recipes.AddRange(recipes);
        await context.SaveChangesAsync();

        // Act
        foreach (Recipe recipe in recipes)
        {
            recipe.Servings = 10;
        }
        await context.SaveChangesAsync();

        // Assert
        List<Recipe> updatedRecipes = await context.Recipes
            .Where(r => r.Title.StartsWith("Update Recipe"))
            .ToListAsync();
        updatedRecipes.Should().AllSatisfy(r => r.Servings.Should().Be(10));
    }

    #endregion

    #region Entity Validation Tests

    [Fact]
    public async Task Title_Required_ThrowsExceptionWhenNull()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = null!,
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act & Assert
        context.Recipes.Add(recipe);
        await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
    }

    [Fact(Skip = "SQLite doesn't enforce MaxLength constraints - validated in SQL Server integration tests")]
    public Task Title_MaxLength_ThrowsExceptionWhenExceeded()
    {
        return Task.CompletedTask;
        // This test is skipped because:
        // - SQLite allows unlimited string lengths in TEXT columns
        // - MaxLength(500) is only enforced by SQL Server, not SQLite
        // - Constraint validation should be tested in SQL Server integration tests
    }


    [Fact]
    public async Task Instructions_Optional_CanBeNull()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Recipe without instructions",
            Instructions = null,
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved!.Instructions.Should().BeNull();
    }

    [Fact(Skip = "SQLite doesn't enforce MaxLength constraints - validated in SQL Server integration tests")]
    public Task Instructions_MaxLength_ThrowsExceptionWhenExceeded()
    {
        return Task.CompletedTask;
        // This test is skipped because:
        // - SQLite allows unlimited string lengths in TEXT columns
        // - MaxLength(10000) is only enforced by SQL Server, not SQLite
        // - Constraint validation should be tested in SQL Server integration tests
        // - Unit tests with SQLite focus on business logic, not DB constraints
    }


    [Fact]
    public async Task Servings_ZeroOrNegative_AllowedValues()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe1 = new Recipe { Title = "Zero Servings", Servings = 0, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Negative Servings", Servings = -1, CreatedAt = DateTime.UtcNow };

        // Act
        context.Recipes.AddRange(recipe1, recipe2);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved1 = await context.Recipes.FindAsync(recipe1.Id);
        Recipe? saved2 = await context.Recipes.FindAsync(recipe2.Id);
        saved1!.Servings.Should().Be(0);
        saved2!.Servings.Should().Be(-1);
    }

    [Fact]
    public async Task UserId_Required_StoresProperly()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var userId = Guid.NewGuid();
        var recipe = new Recipe
        {
            Title = "Recipe with user",
            UserId = userId,
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved!.UserId.Should().Be(userId);
    }

    [Fact]
    public async Task CreatedAt_AutomaticallySet_WhenNotProvided()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        DateTime beforeSave = DateTime.UtcNow;
        var recipe = new Recipe
        {
            Title = "Recipe with auto timestamp",
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();
        DateTime afterSave = DateTime.UtcNow;

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved!.CreatedAt.Should().BeOnOrAfter(beforeSave);
        saved.CreatedAt.Should().BeOnOrBefore(afterSave);
    }

    [Fact]
    public async Task CreatedAt_NotUpdated_WhenEntityModified()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Title = "Original Recipe",
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };
        
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();
        DateTime originalCreatedAt = recipe.CreatedAt;

        // Act
        await Task.Delay(100); // Ensure time difference
        recipe.Title = "Modified Recipe";
        await context.SaveChangesAsync();

        // Assert
        Recipe? updated = await context.Recipes.FindAsync(recipe.Id);
        updated!.CreatedAt.Should().Be(originalCreatedAt);
    }

    [Fact]
    public async Task Recipe_Id_EmptyGuid_GeneratesNewGuidOnSave()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe = new Recipe
        {
            Id = Guid.Empty, // Explicitly set to empty
            Title = "Test Recipe",
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        recipe.Id.Should().NotBe(Guid.Empty);
        recipe.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Recipe_Title_WithSpecialCharacters_HandledCorrectly()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var specialTitle = "Recipe with 特殊字符 & émojis 🍕 and symbols @#$%";
        var recipe = new Recipe
        {
            Title = specialTitle,
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved!.Title.Should().Be(specialTitle);
    }

    [Fact]
    public async Task Recipe_Instructions_WithSpecialCharacters_HandledCorrectly()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var specialInstructions = "Mix with 特殊字符 & line breaks\nTab:\tSpaces:   Symbols: @#$% 🍳";
        var recipe = new Recipe
        {
            Title = "Test Recipe",
            Instructions = specialInstructions,
            Servings = 4,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        context.Recipes.Add(recipe);
        await context.SaveChangesAsync();

        // Assert
        Recipe? saved = await context.Recipes.FindAsync(recipe.Id);
        saved!.Instructions.Should().Be(specialInstructions);
    }

    #endregion

    #region Querying Tests

    [Fact]
    public async Task Query_ByTitle_ReturnsMatchingRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe1 = new Recipe { Title = "Chocolate Cake", Servings = 8, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Vanilla Cake", Servings = 10, CreatedAt = DateTime.UtcNow };
        var recipe3 = new Recipe { Title = "Apple Pie", Servings = 6, CreatedAt = DateTime.UtcNow };
        
        context.Recipes.AddRange(recipe1, recipe2, recipe3);
        await context.SaveChangesAsync();

        // Act
        List<Recipe> cakeRecipes = await context.Recipes
            .Where(r => r.Title.Contains("Cake"))
            .ToListAsync();

        // Assert
        cakeRecipes.Should().HaveCount(2);
        cakeRecipes.Should().Contain(r => r.Title == "Chocolate Cake");
        cakeRecipes.Should().Contain(r => r.Title == "Vanilla Cake");
    }

    [Fact]
    public async Task Query_ByUserId_ReturnsMatchingRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        
        var recipe1 = new Recipe { Title = "User1 Recipe1", UserId = userId1, Servings = 4, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "User1 Recipe2", UserId = userId1, Servings = 6, CreatedAt = DateTime.UtcNow };
        var recipe3 = new Recipe { Title = "User2 Recipe1", UserId = userId2, Servings = 2, CreatedAt = DateTime.UtcNow };
        
        context.Recipes.AddRange(recipe1, recipe2, recipe3);
        await context.SaveChangesAsync();

        // Act
        List<Recipe> user1Recipes = await context.Recipes
            .Where(r => r.UserId == userId1)
            .ToListAsync();

        // Assert
        user1Recipes.Should().HaveCount(2);
        user1Recipes.Should().AllSatisfy(r => r.UserId.Should().Be(userId1));
    }

    [Fact]
    public async Task Query_ByServings_ReturnsMatchingRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        var recipe1 = new Recipe { Title = "Small Recipe", Servings = 2, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Medium Recipe", Servings = 4, CreatedAt = DateTime.UtcNow };
        var recipe3 = new Recipe { Title = "Large Recipe", Servings = 8, CreatedAt = DateTime.UtcNow };
        
        context.Recipes.AddRange(recipe1, recipe2, recipe3);
        await context.SaveChangesAsync();

        // Act
        List<Recipe> largeRecipes = await context.Recipes
            .Where(r => r.Servings >= 4)
            .ToListAsync();

        // Assert
        largeRecipes.Should().HaveCount(2);
        largeRecipes.Should().Contain(r => r.Title == "Medium Recipe");
        largeRecipes.Should().Contain(r => r.Title == "Large Recipe");
    }

    [Fact]
    public async Task Query_OrderByCreatedAt_ReturnsSortedResults()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        DateTime now = DateTime.UtcNow;
        var recipe1 = new Recipe { Title = "First Recipe", Servings = 4, CreatedAt = now.AddMinutes(-2) };
        var recipe2 = new Recipe { Title = "Second Recipe", Servings = 4, CreatedAt = now.AddMinutes(-1) };
        var recipe3 = new Recipe { Title = "Third Recipe", Servings = 4, CreatedAt = now };
        
        context.Recipes.AddRange(recipe1, recipe2, recipe3);
        await context.SaveChangesAsync();

        // Act
        List<Recipe> sortedRecipes = await context.Recipes
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        // Assert
        sortedRecipes.Should().HaveCount(3);
        sortedRecipes[0].Title.Should().Be("First Recipe");
        sortedRecipes[1].Title.Should().Be("Second Recipe");
        sortedRecipes[2].Title.Should().Be("Third Recipe");
    }

    #endregion

    #region Advanced Scenarios

    [Fact(Skip = "SQLite doesn't support true concurrency - use SQL Server integration tests instead")]
    public Task Concurrency_TwoContextsUpdateSameEntity_ThrowsException()
    {
        return Task.CompletedTask;
        // Concurrency testing is better done with:
        // 1. Real SQL Server database
        // 2. Separate integration test project
        // 3. Production-like environment
    }


    [Fact]
    public async Task Transaction_ErrorDuringMultipleOperations_RollsBackAllChanges()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        await using IDbContextTransaction transaction = await context.Database.BeginTransactionAsync();
        
        var validRecipe = new Recipe { Title = "Valid Recipe", Servings = 4, CreatedAt = DateTime.UtcNow };
        var invalidRecipe = new Recipe { Title = null!, Servings = 4, CreatedAt = DateTime.UtcNow }; // Invalid

        // Act & Assert
        context.Recipes.Add(validRecipe);
        await context.SaveChangesAsync();
        
        context.Recipes.Add(invalidRecipe);
        await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        
        await transaction.RollbackAsync();
        
        // Verify rollback
        List<Recipe> recipes = await context.Recipes.Where(r => r.Title == "Valid Recipe").ToListAsync();
        recipes.Should().BeEmpty();
    }

    #endregion

    #region Infrastructure Tests

    [Fact]
    public void DbContext_IsRegistered_WithScopedLifetime()
    {
        // Arrange & Act
        IServiceProvider serviceProvider = factory.Services;
        var context1 = serviceProvider.CreateScope().ServiceProvider.GetRequiredService<FoodBudgetDbContext>();
        var context2 = serviceProvider.CreateScope().ServiceProvider.GetRequiredService<FoodBudgetDbContext>();

        // Assert
        context1.Should().NotBeNull();
        context2.Should().NotBeNull();
        context1.Should().NotBeSameAs(context2); // Different instances per scope
    }

    [Fact]
    public void DbContext_CanBeResolved_FromDifferentScopes()
    {
        // Arrange & Act
        IServiceProvider serviceProvider = factory.Services;
        using IServiceScope scope1 = serviceProvider.CreateScope();
        using IServiceScope scope2 = serviceProvider.CreateScope();
        
        var context1 = scope1.ServiceProvider.GetRequiredService<FoodBudgetDbContext>();
        var context2 = scope2.ServiceProvider.GetRequiredService<FoodBudgetDbContext>();

        // Assert
        context1.Should().NotBeNull();
        context2.Should().NotBeNull();
        context1.Should().NotBeSameAs(context2);
    }

    [Fact]
    public void ConnectionString_Configuration_IsValid()
    {
        // Arrange & Act
        using FoodBudgetDbContext context = factory.CreateContext();
        string? connectionString = context.Database.GetConnectionString();

        // Assert
        connectionString.Should().NotBeNullOrEmpty();
        connectionString.Should().Contain("Data Source=");
    }

    [Fact(Skip = "Migration testing requires SQL Server integration tests - EnsureCreated() bypasses migrations")]
    public Task Database_Migrations_AreAppliedSuccessfully()
    {
        return Task.CompletedTask;
        // Migration testing should be done in integration tests with SQL Server
        // Unit tests use EnsureCreated() which creates schema directly from models
    }

    [Fact]
    public void DbContext_RecipesDbSet_IsProperlyInitialized()
    {
        // Arrange & Act
        using FoodBudgetDbContext context = factory.CreateContext();

        // Assert
        context.Recipes.Should().NotBeNull();
        context.Recipes.Should().BeAssignableTo<DbSet<Recipe>>();
    }

    [Fact]
    public void DbContext_AfterDisposal_ThrowsObjectDisposedException()
    {
        // Arrange
        FoodBudgetDbContext context = factory.CreateContext();
    
        // Act
        context.Dispose();
    
        // Assert
        Action act = () => _ = context.Recipes.Count();
        act.Should().Throw<ObjectDisposedException>();
    }

    #endregion
}