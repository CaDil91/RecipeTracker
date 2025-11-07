using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using Microsoft.Extensions.Logging.Abstractions;

namespace FoodBudgetAPITests.Mapping;

public class RecipeMappingProfileTests
{
    private readonly IMapper _mapper;

    public RecipeMappingProfileTests()
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<RecipeMappingProfile>();
        }, NullLoggerFactory.Instance);
        
        _mapper = configuration.CreateMapper();
    }

    #region Configuration Tests

    [Fact]
    public void AutoMapper_Configuration_Should_Be_Valid()
    {
        // Act & Assert
        _mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }

    #endregion

    #region Recipe to RecipeResponseDto Tests

    [Fact]
    public void Recipe_To_RecipeResponseDto_Should_Map_All_Properties()
    {
        // Arrange
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Test Recipe",
            Instructions = "Test instructions for cooking",
            Servings = 4,
            Category = "Main Course",
            ImageUrl = "https://example.com/recipe.jpg",
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var dto = _mapper.Map<RecipeResponseDto>(recipe);

        // Assert
        dto.Id.Should().Be(recipe.Id);
        dto.Title.Should().Be(recipe.Title);
        dto.Instructions.Should().Be(recipe.Instructions);
        dto.Servings.Should().Be(recipe.Servings);
        dto.Category.Should().Be(recipe.Category);
        dto.ImageUrl.Should().Be(recipe.ImageUrl);
        dto.UserId.Should().Be(recipe.UserId);
        dto.CreatedAt.Should().Be(recipe.CreatedAt);
    }

    [Fact]
    public void Recipe_To_RecipeResponseDto_Should_Handle_Null_Properties()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Minimal Recipe",
            Instructions = null, // Nullable property
            Servings = 1,
            Category = null, // Nullable property
            ImageUrl = null, // Nullable property
            UserId = userId, // Required property
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var dto = _mapper.Map<RecipeResponseDto>(recipe);

        // Assert
        dto.Id.Should().Be(recipe.Id);
        dto.Title.Should().Be(recipe.Title);
        dto.Instructions.Should().BeNull();
        dto.Servings.Should().Be(recipe.Servings);
        dto.Category.Should().BeNull();
        dto.ImageUrl.Should().BeNull();
        dto.UserId.Should().Be(userId);
        dto.CreatedAt.Should().Be(recipe.CreatedAt);
    }

    [Fact]
    public void Recipe_To_RecipeResponseDto_Should_Map_Collection()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 2, Category = "Appetizer", ImageUrl = "https://example.com/recipe1.jpg", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 4, Category = "Dessert", ImageUrl = "https://example.com/recipe2.jpg", CreatedAt = DateTime.UtcNow.AddHours(-1) }
        };

        // Act
        var dtos = _mapper.Map<IEnumerable<RecipeResponseDto>>(recipes);

        // Assert
        IEnumerable<RecipeResponseDto> recipeResponseDTOs = dtos as RecipeResponseDto[] ?? dtos.ToArray();
        recipeResponseDTOs.Should().HaveCount(2);
        List<RecipeResponseDto> dtoList = recipeResponseDTOs.ToList();
        
        dtoList[0].Id.Should().Be(recipes[0].Id);
        dtoList[0].Title.Should().Be(recipes[0].Title);
        dtoList[0].Servings.Should().Be(recipes[0].Servings);
        dtoList[0].Category.Should().Be(recipes[0].Category);
        dtoList[0].ImageUrl.Should().Be(recipes[0].ImageUrl);

        dtoList[1].Id.Should().Be(recipes[1].Id);
        dtoList[1].Title.Should().Be(recipes[1].Title);
        dtoList[1].Servings.Should().Be(recipes[1].Servings);
        dtoList[1].Category.Should().Be(recipes[1].Category);
        dtoList[1].ImageUrl.Should().Be(recipes[1].ImageUrl);
    }

    #endregion

    #region RecipeRequestDto to Recipe Tests

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Map_Allowed_Properties()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "New Recipe",
            Instructions = "Mix ingredients and cook",
            Servings = 6,
            Category = "Main Course",
            ImageUrl = "https://example.com/new-recipe.jpg"
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Instructions.Should().Be(dto.Instructions);
        recipe.Servings.Should().Be(dto.Servings);
        recipe.Category.Should().Be(dto.Category);
        recipe.ImageUrl.Should().Be(dto.ImageUrl);
        recipe.UserId.Should().Be(Guid.Empty, "because UserId must be set from JWT in controller, not from DTO");
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Ignore_Id()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            Category = "Test Category",
            ImageUrl = "https://example.com/test.jpg"
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Id.Should().Be(Guid.Empty, "because Id should be ignored and not set from DTO");
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Ignore_CreatedAt()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            Category = "Test Category",
            ImageUrl = "https://example.com/test.jpg"
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.CreatedAt.Should().Be(default(DateTime), "because CreatedAt should be ignored and not set from DTO");
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Handle_Minimal_Data()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "Minimal Recipe",
            Servings = 1
            // Instructions, Category, and ImageUrl are optional
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Instructions.Should().BeNull();
        recipe.Servings.Should().Be(dto.Servings);
        recipe.Category.Should().BeNull();
        recipe.ImageUrl.Should().BeNull();
        recipe.UserId.Should().Be(Guid.Empty, "because UserId must be set from JWT in controller, not from DTO");
        recipe.Id.Should().Be(Guid.Empty);
        recipe.CreatedAt.Should().Be(default(DateTime));
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Map_Collection()
    {
        // Arrange
        var dtos = new List<RecipeRequestDto>
        {
            new() { Title = "Recipe 1", Servings = 2, Category = "Appetizer", ImageUrl = "https://example.com/recipe1.jpg" },
            new() { Title = "Recipe 2", Servings = 4, Category = "Main Course", ImageUrl = "https://example.com/recipe2.jpg" }
        };

        // Act
        var recipes = _mapper.Map<IEnumerable<Recipe>>(dtos);

        // Assert
        IEnumerable<Recipe> enumerable = recipes as Recipe[] ?? recipes.ToArray();
        enumerable.Should().HaveCount(2);
        List<Recipe> recipeList = enumerable.ToList();

        recipeList[0].Title.Should().Be(dtos[0].Title);
        recipeList[0].Servings.Should().Be(dtos[0].Servings);
        recipeList[0].UserId.Should().Be(Guid.Empty, "because UserId must be set from JWT in controller, not from DTO");
        recipeList[0].Id.Should().Be(Guid.Empty);
        recipeList[0].CreatedAt.Should().Be(default(DateTime));

        recipeList[1].Title.Should().Be(dtos[1].Title);
        recipeList[1].Servings.Should().Be(dtos[1].Servings);
        recipeList[1].UserId.Should().Be(Guid.Empty, "because UserId must be set from JWT in controller, not from DTO");
        recipeList[1].Id.Should().Be(Guid.Empty);
        recipeList[1].CreatedAt.Should().Be(default(DateTime));
    }

    #endregion

    #region Security and Business Rule Tests

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Not_Allow_Id_Injection()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "Malicious Recipe",
            Servings = 1
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Id.Should().Be(Guid.Empty, "because mapping should prevent ID injection attacks");
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Not_Allow_CreatedAt_Manipulation()
    {
        // Arrange
        var dto = new RecipeRequestDto
        {
            Title = "Time Manipulation Recipe",
            Servings = 1
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.CreatedAt.Should().Be(default(DateTime), "because mapping should prevent timestamp manipulation");
    }

    #endregion
}