using FluentAssertions;
using FoodBudgetAPI.Data;
using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Entities;
using FoodBudgetAPIIntegrationTests.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FoodBudgetAPIIntegrationTests.Data.Repositories;

public class RecipeRepositoryTests(DbTestFactory<FoodBudgetAPI.Program> factory)
    : IClassFixture<DbTestFactory<FoodBudgetAPI.Program>>
{
    private RecipeRepository CreateRepository(FoodBudgetDbContext context)
    {
        var logger = factory.Services.GetRequiredService<ILogger<RecipeRepository>>();
        return new RecipeRepository(context, logger);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_EmptyDatabase_ReturnsEmptyCollection()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        // Act
        IEnumerable<Recipe> recipes = await repository.GetAllAsync();

        // Assert
        recipes.Should().BeEmpty("a new in-memory database should have no recipes");
    }

    [Fact]
    public async Task GetAllAsync_WithRecipes_ReturnsAllRecipesOrderedByCreatedAtDescending()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var oldRecipe = new Recipe 
        { 
            Title = "Old Recipe", 
            Servings = 4, 
            CreatedAt = DateTime.UtcNow.AddDays(-2) 
        };
        var newRecipe = new Recipe 
        { 
            Title = "New Recipe", 
            Servings = 2, 
            CreatedAt = DateTime.UtcNow 
        };
        var middleRecipe = new Recipe 
        { 
            Title = "Middle Recipe", 
            Servings = 6, 
            CreatedAt = DateTime.UtcNow.AddDays(-1) 
        };

        await repository.AddAsync(oldRecipe);
        await repository.AddAsync(newRecipe);
        await repository.AddAsync(middleRecipe);
        await repository.SaveChangesAsync();

        // Act
        List<Recipe> recipes = (await repository.GetAllAsync()).ToList();

        // Assert
        recipes.Should().HaveCount(3);
        recipes[0].Title.Should().Be("New Recipe");
        recipes[1].Title.Should().Be("Middle Recipe");
        recipes[2].Title.Should().Be("Old Recipe");
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsRecipe()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe = new Recipe 
        { 
            Title = "Test Recipe", 
            Servings = 4, 
            CreatedAt = DateTime.UtcNow 
        };
        await repository.AddAsync(recipe);
        await repository.SaveChangesAsync();

        // Act
        Recipe? result = await repository.GetByIdAsync(recipe.Id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(recipe.Id);
        result.Title.Should().Be("Test Recipe");
        result.Servings.Should().Be(4);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        var nonExistingId = Guid.NewGuid();

        // Act
        Recipe? result = await repository.GetByIdAsync(nonExistingId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetByTitleAsync Tests

    [Fact]
    public async Task GetByTitleAsync_ExactMatch_ReturnsMatchingRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        await repository.AddAsync(new Recipe { Title = "Chocolate Cake", Servings = 8, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "Vanilla Cake", Servings = 10, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "Apple Pie", Servings = 6, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("Chocolate Cake");

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        enumerable.Should().HaveCount(1);
        enumerable.First().Title.Should().Be("Chocolate Cake");
    }

    [Fact]
    public async Task GetByTitleAsync_PartialMatch_ReturnsAllMatchingRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        await repository.AddAsync(new Recipe { Title = "Chocolate Cake", Servings = 8, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "Vanilla Cake", Servings = 10, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "Apple Pie", Servings = 6, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("Cake");

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        enumerable.Should().HaveCount(2);
        enumerable.Should().Contain(r => r.Title == "Chocolate Cake");
        enumerable.Should().Contain(r => r.Title == "Vanilla Cake");
    }

    [Fact]
    public async Task GetByTitleAsync_CaseInsensitive_ReturnsMatches()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        await repository.AddAsync(new Recipe { Title = "Chocolate CAKE", Servings = 8, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "vanilla cake", Servings = 10, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("cake");

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByTitleAsync_NoMatch_ReturnsEmptyCollection()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        await repository.AddAsync(new Recipe { Title = "Chocolate Cake", Servings = 8, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("Pizza");

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByUserIdAsync Tests

    [Fact]
    public async Task GetByUserIdAsync_ExistingUserId_ReturnsUserRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        
        await repository.AddAsync(new Recipe { Title = "User1 Recipe 1", UserId = userId1, Servings = 4, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "User1 Recipe 2", UserId = userId1, Servings = 2, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "User2 Recipe", UserId = userId2, Servings = 6, CreatedAt = DateTime.UtcNow });
        await repository.AddAsync(new Recipe { Title = "No User Recipe", UserId = null, Servings = 8, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByUserIdAsync(userId1);

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        enumerable.Should().HaveCount(2);
        enumerable.Should().AllSatisfy(r => r.UserId.Should().Be(userId1));
    }

    [Fact]
    public async Task GetByUserIdAsync_NonExistingUserId_ReturnsEmptyCollection()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        var nonExistingUserId = Guid.NewGuid();
        
        await repository.AddAsync(new Recipe { Title = "Recipe", UserId = Guid.NewGuid(), Servings = 4, CreatedAt = DateTime.UtcNow });
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByUserIdAsync(nonExistingUserId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region AddAsync Tests

    [Fact]
    public async Task AddAsync_ValidRecipe_AddsToDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe = new Recipe 
        { 
            Title = "New Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        await repository.AddAsync(recipe);
        await repository.SaveChangesAsync();

        // Assert
        Recipe? savedRecipe = await repository.GetByIdAsync(recipe.Id);
        savedRecipe.Should().NotBeNull();
        savedRecipe.Title.Should().Be("New Recipe");
        savedRecipe.Instructions.Should().Be("Test instructions");
        savedRecipe.Servings.Should().Be(4);
    }

    [Fact]
    public async Task AddAsync_MultipleRecipes_AddsAllToDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe1 = new Recipe { Title = "Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow };
        var recipe3 = new Recipe { Title = "Recipe 3", Servings = 6, CreatedAt = DateTime.UtcNow };

        // Act
        await repository.AddAsync(recipe1);
        await repository.AddAsync(recipe2);
        await repository.AddAsync(recipe3);
        await repository.SaveChangesAsync();

        // Assert
        IEnumerable<Recipe> allRecipes = await repository.GetAllAsync();
        allRecipes.Should().HaveCount(3);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_ExistingRecipe_UpdatesInDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe = new Recipe 
        { 
            Title = "Original Title",
            Instructions = "Original instructions",
            Servings = 2,
            CreatedAt = DateTime.UtcNow
        };
        await repository.AddAsync(recipe);
        await repository.SaveChangesAsync();

        // Act
        recipe.Title = "Updated Title";
        recipe.Instructions = "Updated instructions";
        recipe.Servings = 6;
        await repository.UpdateAsync(recipe);
        await repository.SaveChangesAsync();

        // Assert
        Recipe? updatedRecipe = await repository.GetByIdAsync(recipe.Id);
        updatedRecipe.Should().NotBeNull();
        updatedRecipe.Title.Should().Be("Updated Title");
        updatedRecipe.Instructions.Should().Be("Updated instructions");
        updatedRecipe.Servings.Should().Be(6);
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ExistingRecipe_RemovesFromDatabase()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe = new Recipe { Title = "To Delete", Servings = 4, CreatedAt = DateTime.UtcNow };
        await repository.AddAsync(recipe);
        await repository.SaveChangesAsync();
        Guid recipeId = recipe.Id;

        // Act
        await repository.DeleteAsync(recipeId);
        await repository.SaveChangesAsync();

        // Assert
        Recipe? deletedRecipe = await repository.GetByIdAsync(recipeId);
        deletedRecipe.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_NonExistingRecipe_NoExceptionThrown()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        // Add a recipe to ensure a database has content
        var existingRecipe = new Recipe { Title = "Existing", Servings = 2, CreatedAt = DateTime.UtcNow };
        await repository.AddAsync(existingRecipe);
        await repository.SaveChangesAsync();
        
        var nonExistingId = Guid.NewGuid();
        int countBefore = (await repository.GetAllAsync()).Count();

        // Act
        Func<Task> act = async () =>
        {
            await repository.DeleteAsync(nonExistingId);
            await repository.SaveChangesAsync();
        };

        // Assert
        await act.Should().NotThrowAsync();
        int countAfter = (await repository.GetAllAsync()).Count();
        countAfter.Should().Be(countBefore, "no recipes should be deleted when ID doesn't exist");
    }

    #endregion

    #region Transaction Tests

    [Fact]
    public async Task SaveChangesAsync_NotCalled_ChangesNotPersisted()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe = new Recipe 
        { 
            Id = Guid.NewGuid(), // Use explicit ID to ensure we can search for it
            Title = "Not Saved Recipe", 
            Servings = 4, 
            CreatedAt = DateTime.UtcNow 
        };
        Guid recipeId = recipe.Id;

        // Act
        await repository.AddAsync(recipe);
        // Note: NOT calling SaveChangesAsync()

        // Assert - Use a new context to verify
        await using FoodBudgetDbContext verifyContext = factory.CreateContext();
        RecipeRepository verifyRepository = CreateRepository(verifyContext);
        Recipe? resultById = await verifyRepository.GetByIdAsync(recipeId);
        resultById.Should().BeNull("recipe should not be persisted without SaveChangesAsync");
        
        IEnumerable<Recipe> resultByTitle = await verifyRepository.GetByTitleAsync("Not Saved Recipe");
        resultByTitle.Should().BeEmpty("recipe should not be findable by title without SaveChangesAsync");
    }

    [Fact]
    public async Task MultipleOperations_InSingleTransaction_AllSucceedOrFail()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe1 = new Recipe { Title = "Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow };

        // Act
        await repository.AddAsync(recipe1);
        await repository.AddAsync(recipe2);
        await repository.SaveChangesAsync();

        // Update one and delete another
        recipe1.Title = "Updated Recipe 1";
        await repository.UpdateAsync(recipe1);
        await repository.DeleteAsync(recipe2.Id);
        await repository.SaveChangesAsync();

        // Assert
        Recipe? updatedRecipe = await repository.GetByIdAsync(recipe1.Id);
        updatedRecipe!.Title.Should().Be("Updated Recipe 1");
        
        Recipe? deletedRecipe = await repository.GetByIdAsync(recipe2.Id);
        deletedRecipe.Should().BeNull();
    }

    #endregion

    #region Edge Cases and Boundary Tests

    [Fact]
    public async Task GetByTitleAsync_EmptyString_ReturnsAllRecipes()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        var recipe1 = new Recipe { Title = "Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow };
        var recipe2 = new Recipe { Title = "Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow };
        await repository.AddAsync(recipe1);
        await repository.AddAsync(recipe2);
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("");

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        enumerable.Should().HaveCount(2);
        List<string> titles = enumerable.Select(r => r.Title).ToList();
        titles.Should().Contain("Recipe 1", "should include first recipe");
        titles.Should().Contain("Recipe 2", "should include second recipe");
    }

    [Fact]
    public async Task Recipe_WithSpecialCharactersInTitle_HandledCorrectly()
    {
        // Arrange
        await using FoodBudgetDbContext context = factory.CreateContext();
        RecipeRepository repository = CreateRepository(context);
        
        const string specialTitle = "Recipe with 特殊字符 & symbols @#$%";
        var recipe = new Recipe { Title = specialTitle, Servings = 4, CreatedAt = DateTime.UtcNow };
        await repository.AddAsync(recipe);
        await repository.SaveChangesAsync();

        // Act
        IEnumerable<Recipe> result = await repository.GetByTitleAsync("特殊字符");

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        enumerable.Should().HaveCount(1);
        enumerable.First().Title.Should().Be(specialTitle);
    }

    #endregion
}