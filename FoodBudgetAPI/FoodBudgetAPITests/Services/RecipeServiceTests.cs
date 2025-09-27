using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Services;

public class RecipeServiceTests
{
    private readonly Mock<IRecipeRepository> _mockRepository;
    private readonly Mock<ILogger<RecipeService>> _mockLogger; 
    private readonly RecipeService _subjectUnderTest;

    public RecipeServiceTests()
    {
        _mockRepository = new Mock<IRecipeRepository>();
        _mockLogger = new Mock<ILogger<RecipeService>>();
        _subjectUnderTest = new RecipeService(_mockRepository.Object, _mockLogger.Object);
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullRepository_ThrowsArgumentNullException()
    {
        // Arrange & Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => new RecipeService(null!, _mockLogger.Object));
        Assert.Equal("recipeRepository", exception.ParamName);
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Arrange & Act & Assert
        var exception = Assert.Throws<ArgumentNullException>(() => new RecipeService(_mockRepository.Object, null!));
        Assert.Equal("logger", exception.ParamName);
    }

    [Fact]
    public void Constructor_WithValidParameters_CreatesInstance()
    {
        // Arrange & Act
        var service = new RecipeService(_mockRepository.Object, _mockLogger.Object);

        // Assert
        Assert.NotNull(service);
    }

    #endregion

    #region GetAllRecipesAsync Tests

    [Fact]
    public async Task GetAllRecipesAsync_WithNoFilters_ReturnsAllRecipes()
    {
        // Arrange
        var expectedRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4, Category = "Main Course", ImageUrl = "https://example.com/recipe1.jpg" },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 2, Category = "Appetizer", ImageUrl = "https://example.com/recipe2.jpg" }
        };
        _mockRepository.Setup(x => x.GetAllAsync()).ReturnsAsync(expectedRecipes);

        // Act
        IEnumerable<Recipe> result = await _subjectUnderTest.GetAllRecipesAsync();

        // Assert
        Assert.Equal(expectedRecipes, result);
        _mockRepository.Verify(x => x.GetAllAsync(), Times.Once);
        _mockRepository.Verify(x => x.GetByUserIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task GetAllRecipesAsync_WithUserId_ReturnsUserRecipes()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe 1", UserId = userId, Servings = 3, Category = "Breakfast", ImageUrl = "https://example.com/user-recipe1.jpg" },
            new() { Id = Guid.NewGuid(), Title = "User Recipe 2", UserId = userId, Servings = 4, Category = "Lunch", ImageUrl = "https://example.com/user-recipe2.jpg" }
        };
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId)).ReturnsAsync(expectedRecipes);

        // Act
        IEnumerable<Recipe> result = await _subjectUnderTest.GetAllRecipesAsync(userId);

        // Assert
        Assert.Equal(expectedRecipes, result);
        _mockRepository.Verify(x => x.GetByUserIdAsync(userId), Times.Once);
        _mockRepository.Verify(x => x.GetAllAsync(), Times.Never);
    }

    [Fact]
    public async Task GetAllRecipesAsync_WithValidLimit_ReturnsLimitedResults()
    {
        // Arrange
        var allRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 2 },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 4 },
            new() { Id = Guid.NewGuid(), Title = "Recipe 3", Servings = 6 }
        };
        _mockRepository.Setup(x => x.GetAllAsync()).ReturnsAsync(allRecipes);

        // Act
        IEnumerable<Recipe> result = await _subjectUnderTest.GetAllRecipesAsync(limit: 2);

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        Assert.Equal(2, enumerable.Count());
        Assert.Equal(allRecipes.Take(2), enumerable);
    }

    [Fact]
    public async Task GetAllRecipesAsync_WithUserIdAndLimit_ReturnsFilteredAndLimitedResults()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe 1", UserId = userId, Servings = 2 },
            new() { Id = Guid.NewGuid(), Title = "User Recipe 2", UserId = userId, Servings = 4 },
            new() { Id = Guid.NewGuid(), Title = "User Recipe 3", UserId = userId, Servings = 6 }
        };
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId)).ReturnsAsync(userRecipes);

        // Act
        IEnumerable<Recipe> result = await _subjectUnderTest.GetAllRecipesAsync(userId, 2);

        // Assert
        IEnumerable<Recipe> enumerable = result as Recipe[] ?? result.ToArray();
        Assert.Equal(2, enumerable.Count());
        Assert.Equal(userRecipes.Take(2), enumerable);
    }

    [Fact]
    public async Task GetAllRecipesAsync_LogsCorrectInformation()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var limit = 5;
        _mockRepository.Setup(x => x.GetByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(new List<Recipe>());

        // Act
        await _subjectUnderTest.GetAllRecipesAsync(userId, limit);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Getting recipes with filters - UserId: {userId}, Limit: {limit}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region GetRecipeByIdAsync Tests

    [Fact]
    public async Task GetRecipeByIdAsync_WithValidId_ReturnsRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var expectedRecipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync(expectedRecipe);

        // Act
        Recipe? result = await _subjectUnderTest.GetRecipeByIdAsync(recipeId);

        // Assert
        Assert.Equal(expectedRecipe, result);
        _mockRepository.Verify(x => x.GetByIdAsync(recipeId), Times.Once);
    }

    [Fact]
    public async Task GetRecipeByIdAsync_WithNonExistentId_ReturnsNull()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        Recipe? result = await _subjectUnderTest.GetRecipeByIdAsync(recipeId);

        // Assert
        Assert.Null(result);
        _mockRepository.Verify(x => x.GetByIdAsync(recipeId), Times.Once);
    }

    [Fact]
    public async Task GetRecipeByIdAsync_LogsCorrectInformation()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRepository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Recipe?)null);

        // Act
        await _subjectUnderTest.GetRecipeByIdAsync(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Getting recipe by ID: {recipeId}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region CreateRecipeAsync Tests

    [Fact]
    public async Task CreateRecipeAsync_WithValidRecipe_CreatesAndReturnsRecipe()
    {
        // Arrange
        var recipe = new Recipe
        {
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid()
        };

        _mockRepository.Setup(x => x.AddAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        Recipe result = await _subjectUnderTest.CreateRecipeAsync(recipe);

        // Assert
        Assert.Equal(recipe.Title, result.Title);
        Assert.Equal(recipe.Instructions, result.Instructions);
        Assert.Equal(recipe.Servings, result.Servings);
        Assert.Equal(recipe.UserId, result.UserId);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.True(result.CreatedAt > DateTime.MinValue);
        
        _mockRepository.Verify(x => x.AddAsync(recipe), Times.Once);
        _mockRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateRecipeAsync_WithNullRecipe_ThrowsArgumentNullException()
    {
        // Arrange, Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _subjectUnderTest.CreateRecipeAsync(null!));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateRecipeAsync_WithInvalidTitle_ThrowsArgumentException(string? title)
    {
        // Arrange
        var recipe = new Recipe { Title = title!, Servings = 4 };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _subjectUnderTest.CreateRecipeAsync(recipe));
        Assert.Contains("Recipe title is required", exception.Message);
        Assert.Equal("recipe", exception.ParamName);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-10)]
    public async Task CreateRecipeAsync_WithInvalidServings_ThrowsArgumentException(int servings)
    {
        // Arrange
        var recipe = new Recipe { Title = "Test Recipe", Servings = servings };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _subjectUnderTest.CreateRecipeAsync(recipe));
        Assert.Contains("Servings must be greater than zero", exception.Message);
        Assert.Equal("recipe", exception.ParamName);
    }

    [Fact]
    public async Task CreateRecipeAsync_SetsIdAndCreatedAt()
    {
        // Arrange
        var recipe = new Recipe { Title = "Test Recipe", Servings = 4 };
        Guid originalId = recipe.Id;
        DateTime originalCreatedAt = recipe.CreatedAt;

        _mockRepository.Setup(x => x.AddAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        Recipe result = await _subjectUnderTest.CreateRecipeAsync(recipe);

        // Assert
        Assert.NotEqual(originalId, result.Id);
        Assert.NotEqual(originalCreatedAt, result.CreatedAt);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.True(result.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task CreateRecipeAsync_LogsCorrectInformation()
    {
        // Arrange
        var recipe = new Recipe { Title = "Test Recipe", Servings = 4 };
        _mockRepository.Setup(x => x.AddAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        Recipe result = await _subjectUnderTest.CreateRecipeAsync(recipe);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Creating new recipe with ID: {result.Id}, Title: {recipe.Title}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region UpdateRecipeAsync Tests

    [Fact]
    public async Task UpdateRecipeAsync_WithValidData_UpdatesAndReturnsRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Old Title",
            Instructions = "Old instructions",
            Servings = 2,
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        var updateData = new Recipe
        {
            Title = "New Title",
            Instructions = "New instructions",
            Servings = 6,
            UserId = Guid.NewGuid()
        };

        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        Recipe result = await _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData);

        // Assert
        Assert.Equal(updateData.Title, result.Title);
        Assert.Equal(updateData.Instructions, result.Instructions);
        Assert.Equal(updateData.Servings, result.Servings);
        Assert.Equal(updateData.UserId, result.UserId);
        Assert.Equal(recipeId, result.Id); // ID should remain the same
        Assert.Equal(existingRecipe.CreatedAt, result.CreatedAt); // CreatedAt should remain the same

        _mockRepository.Verify(x => x.GetByIdAsync(recipeId), Times.Once);
        _mockRepository.Verify(x => x.UpdateAsync(existingRecipe), Times.Once);
        _mockRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task UpdateRecipeAsync_WithInvalidTitle_ThrowsArgumentException(string? title)
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var updateData = new Recipe { Title = title!, Servings = 4 };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData));
        Assert.Contains("Recipe title is required", exception.Message);
        Assert.Equal("recipe", exception.ParamName);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-10)]
    public async Task UpdateRecipeAsync_WithInvalidServings_ThrowsArgumentException(int servings)
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var updateData = new Recipe { Title = "Valid Title", Servings = servings };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData));
        Assert.Contains("Servings must be greater than zero", exception.Message);
        Assert.Equal("recipe", exception.ParamName);
    }

    [Fact]
    public async Task UpdateRecipeAsync_WithNonExistentId_ThrowsKeyNotFoundException()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var updateData = new Recipe { Title = "Valid Title", Servings = 4 };
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData));
        Assert.Equal($"Recipe with ID {recipeId} not found", exception.Message);
    }

    [Fact]
    public async Task UpdateRecipeAsync_WithNonExistentId_LogsWarning()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var updateData = new Recipe { Title = "Valid Title", Servings = 4 };
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData));

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Recipe not found for update - ID: {recipeId}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateRecipeAsync_LogsCorrectInformation()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe { Id = recipeId, Title = "Old Title", Servings = 2 };
        var updateData = new Recipe { Title = "New Title", Servings = 4 };

        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        await _subjectUnderTest.UpdateRecipeAsync(recipeId, updateData);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Updating recipe - ID: {recipeId}, Title: {updateData.Title}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateRecipeAsync_PreservesOriginalIdAndCreatedAt()
    {
        // Arrange
        var originalId = Guid.NewGuid();
        var originalCreatedAt = DateTime.UtcNow.AddDays(-5);
        
        var existingRecipe = new Recipe
        {
            Id = originalId,
            Title = "Original Title",
            Servings = 2,
            CreatedAt = originalCreatedAt
        };

        var inputRecipe = new Recipe
        {
            Id = Guid.NewGuid(), // Different ID that should be ignored
            Title = "Updated Title",
            Servings = 4,
            CreatedAt = DateTime.UtcNow // Different CreatedAt that should be ignored
        };

        _mockRepository.Setup(x => x.GetByIdAsync(originalId)).ReturnsAsync(existingRecipe);
        _mockRepository.Setup(x => x.UpdateAsync(It.IsAny<Recipe>())).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        Recipe result = await _subjectUnderTest.UpdateRecipeAsync(originalId, inputRecipe);

        // Assert
        Assert.Equal(originalId, result.Id); // Original ID preserved
        Assert.Equal(originalCreatedAt, result.CreatedAt); // Original CreatedAt preserved
        Assert.NotEqual(inputRecipe.Id, result.Id); // Input recipe's ID was not used
        Assert.NotEqual(inputRecipe.CreatedAt, result.CreatedAt); // Input recipe's CreatedAt was not used
    }

    #endregion

    #region DeleteRecipeAsync Tests

    [Fact]
    public async Task DeleteRecipeAsync_WithExistingId_DeletesAndReturnsTrue()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRepository.Setup(x => x.DeleteAsync(recipeId)).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        bool result = await _subjectUnderTest.DeleteRecipeAsync(recipeId);

        // Assert
        Assert.True(result);
        _mockRepository.Verify(x => x.GetByIdAsync(recipeId), Times.Once);
        _mockRepository.Verify(x => x.DeleteAsync(recipeId), Times.Once);
        _mockRepository.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task DeleteRecipeAsync_WithNonExistentId_ReturnsFalse()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        bool result = await _subjectUnderTest.DeleteRecipeAsync(recipeId);

        // Assert
        Assert.False(result);
        _mockRepository.Verify(x => x.GetByIdAsync(recipeId), Times.Once);
        _mockRepository.Verify(x => x.DeleteAsync(It.IsAny<Guid>()), Times.Never);
        _mockRepository.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task DeleteRecipeAsync_WithNonExistentId_LogsWarning()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        await _subjectUnderTest.DeleteRecipeAsync(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Recipe not found for deletion - ID: {recipeId}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteRecipeAsync_WithExistingId_LogsCorrectInformation()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRepository.Setup(x => x.GetByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRepository.Setup(x => x.DeleteAsync(recipeId)).Returns(Task.CompletedTask);
        _mockRepository.Setup(x => x.SaveChangesAsync()).Returns(Task.CompletedTask);

        // Act
        await _subjectUnderTest.DeleteRecipeAsync(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Deleting recipe - ID: {recipeId}, Title: {existingRecipe.Title}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

}