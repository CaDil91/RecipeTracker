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
        dto.UserId.Should().Be(recipe.UserId);
        dto.CreatedAt.Should().Be(recipe.CreatedAt);
    }

    [Fact]
    public void Recipe_To_RecipeResponseDto_Should_Handle_Null_Properties()
    {
        // Arrange
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Minimal Recipe",
            Instructions = null, // Nullable property
            Servings = 1,
            UserId = null, // Nullable property
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var dto = _mapper.Map<RecipeResponseDto>(recipe);

        // Assert
        dto.Id.Should().Be(recipe.Id);
        dto.Title.Should().Be(recipe.Title);
        dto.Instructions.Should().BeNull();
        dto.Servings.Should().Be(recipe.Servings);
        dto.UserId.Should().BeNull();
        dto.CreatedAt.Should().Be(recipe.CreatedAt);
    }

    [Fact]
    public void Recipe_To_RecipeResponseDto_Should_Map_Collection()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 2, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 4, CreatedAt = DateTime.UtcNow.AddHours(-1) }
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
        
        dtoList[1].Id.Should().Be(recipes[1].Id);
        dtoList[1].Title.Should().Be(recipes[1].Title);
        dtoList[1].Servings.Should().Be(recipes[1].Servings);
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
            UserId = Guid.NewGuid()
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Instructions.Should().Be(dto.Instructions);
        recipe.Servings.Should().Be(dto.Servings);
        recipe.UserId.Should().Be(dto.UserId);
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
            UserId = Guid.NewGuid()
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
            UserId = Guid.NewGuid()
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
            // Instructions and UserId are null
        };

        // Act
        var recipe = _mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Instructions.Should().BeNull();
        recipe.Servings.Should().Be(dto.Servings);
        recipe.UserId.Should().BeNull();
        recipe.Id.Should().Be(Guid.Empty);
        recipe.CreatedAt.Should().Be(default(DateTime));
    }

    [Fact]
    public void RecipeRequestDto_To_Recipe_Should_Map_Collection()
    {
        // Arrange
        var dtos = new List<RecipeRequestDto>
        {
            new() { Title = "Recipe 1", Servings = 2, UserId = Guid.NewGuid() },
            new() { Title = "Recipe 2", Servings = 4, UserId = Guid.NewGuid() }
        };

        // Act
        var recipes = _mapper.Map<IEnumerable<Recipe>>(dtos);

        // Assert
        IEnumerable<Recipe> enumerable = recipes as Recipe[] ?? recipes.ToArray();
        enumerable.Should().HaveCount(2);
        List<Recipe> recipeList = enumerable.ToList();
        
        recipeList[0].Title.Should().Be(dtos[0].Title);
        recipeList[0].Servings.Should().Be(dtos[0].Servings);
        recipeList[0].UserId.Should().Be(dtos[0].UserId);
        recipeList[0].Id.Should().Be(Guid.Empty);
        recipeList[0].CreatedAt.Should().Be(default(DateTime));
        
        recipeList[1].Title.Should().Be(dtos[1].Title);
        recipeList[1].Servings.Should().Be(dtos[1].Servings);
        recipeList[1].UserId.Should().Be(dtos[1].UserId);
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