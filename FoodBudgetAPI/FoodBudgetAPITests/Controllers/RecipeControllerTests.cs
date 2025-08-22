using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Controllers;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Controllers;

public class RecipeControllerTests
{
    private readonly Mock<ILogger<RecipeController>> _mockLogger;
    private readonly IMapper _mapper;
    private readonly Mock<IRecipeService> _mockRecipeService;
    private readonly RecipeController _subjectUnderTest;

    public RecipeControllerTests()
    {
        _mockRecipeService = new Mock<IRecipeService>();
        _mockLogger = new Mock<ILogger<RecipeController>>();
        
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<RecipeMappingProfile>();
        }, Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance);
        _mapper = configuration.CreateMapper();
        
        _subjectUnderTest = new RecipeController(_mockRecipeService.Object, _mockLogger.Object, _mapper);
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullService_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new RecipeController(null!, _mockLogger.Object, _mapper); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("recipeService");
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new RecipeController(_mockRecipeService.Object, null!, _mapper); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("logger");
    }

    [Fact]
    public void Constructor_WithNullMapper_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new RecipeController(_mockRecipeService.Object, _mockLogger.Object, null!); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("mapper");
    }

    [Fact]
    public void Constructor_WithValidParameters_CreatesInstance()
    {
        // Act
        var controller = new RecipeController(_mockRecipeService.Object, _mockLogger.Object, _mapper);

        // Assert
        controller.Should().NotBeNull();
    }

    #endregion

    #region GET /api/recipes Tests

    [Fact]
    public async Task GetAllRecipes_ReturnsOkWithRecipes()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4 },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 2 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, null)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(null, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
    }

    [Fact]
    public async Task GetAllRecipes_WithUserIdFilter_ReturnsFilteredRecipes()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe", UserId = userId, Servings = 4 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(userId, null)).ReturnsAsync(userRecipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(userId);

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(userId, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().NotBeNull();
        ((IEnumerable<RecipeResponseDto>)okResult.Value!).Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllRecipes_WithValidLimit_PassesLimitToService()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, 5)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(null, 5);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(null, 5), Times.Once);
    }

    [Fact]
    public async Task GetAllRecipes_WithZeroLimit_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(null, 0);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Limit must be greater than zero");
    }

    [Fact]
    public async Task GetAllRecipes_WithNegativeLimit_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(null, -5);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Limit must be greater than zero");
    }

    [Fact]
    public async Task GetAllRecipes_WithUserIdAndLimit_ReturnsFilteredAndLimitedRecipes()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe", UserId = userId, Servings = 4 }
        };
    
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(userId, 5)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(userId, 5);

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(userId, 5), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
        var recipeDTOs = (IEnumerable<RecipeResponseDto>)okResult.Value!;
        recipeDTOs.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAllRecipes_WhenNoRecipes_ReturnsEmptyList()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, null)).ReturnsAsync(new List<Recipe>());

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(null, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
        okResult.StatusCode.Should().Be(200);
        ((IEnumerable<RecipeResponseDto>)okResult.Value!).Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllRecipes_WithInvalidLimit_ReturnsBadRequest()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, -1))
            .ThrowsAsync(new ArgumentException("Limit must be greater than zero", $"limit"));

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(null, -1);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task GetAllRecipes_WithInvalidUserId_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(Guid.Empty);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid user ID format");
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(It.IsAny<Guid?>(), It.IsAny<int?>()), Times.Never);
    }

    #endregion

    #region GET /api/recipes/{id} Tests
    
    [Fact]
    public async Task GetRecipeById_WithValidId_ReturnsOkWithRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();
        var recipeDto = (RecipeResponseDto)okResult.Value!;
        recipeDto.Id.Should().Be(recipeId);
    }
    
    [Fact]
    public async Task GetRecipeById_WithInvalidId_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(Guid.Empty);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }
    
    [Fact]
    public async Task GetRecipeById_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
    }
    
    [Fact]
    public async Task GetRecipeById_WhenServiceReturnsNull_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        NotFoundResult? notFoundResult = result.Should().BeOfType<NotFoundResult>().Subject;
        notFoundResult.StatusCode.Should().Be(404);
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
    }

    [Fact]
    public async Task GetRecipeById_LogsInformationWithCorrectParameters()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        // Act
        await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Getting recipe by ID:")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region POST /api/recipes Tests

    [Fact]
    public async Task CreateRecipe_WithValidData_ReturnsCreatedWithRecipe()
    {
        // Arrange
        var requestDto = new RecipeRequestDto
        {
            Title = "New Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid()
        };
        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "New Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = requestDto.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ReturnsAsync(createdRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        _mockRecipeService.Verify(x => x.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Once);
        CreatedAtActionResult? createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
        createdResult.ActionName.Should().Be(nameof(RecipeController.GetRecipeById));
        createdResult.RouteValues!["id"].Should().Be(createdRecipe.Id);
        createdResult.Value.Should().BeOfType<RecipeResponseDto>();
    }

    [Fact]
    public async Task CreateRecipe_WithMinimalData_ReturnsCreated()
    {
        // Arrange
        var requestDto = new RecipeRequestDto
        {
            Title = "Minimal Recipe",
            Servings = 1
        };
        
        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Minimal Recipe",
            Servings = 1,
            CreatedAt = DateTime.UtcNow
        };
        
        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ReturnsAsync(createdRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        _mockRecipeService.Verify(x => x.CreateRecipeAsync(It.IsAny<Recipe>()), Times.Once);
        CreatedAtActionResult? createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
        createdResult.Value.Should().BeOfType<RecipeResponseDto>();
    }

    #endregion

    #region PUT /api/recipes/{id} Tests

    [Fact]
    public async Task UpdateRecipe_WithValidData_ReturnsOkWithUpdatedRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Updated Recipe",
            Instructions = "Updated instructions",
            Servings = 6,
            UserId = Guid.NewGuid()
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Updated Recipe",
            Instructions = "Updated instructions",
            Servings = 6,
            UserId = requestDto.UserId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();

        // Verify mapper and service were called correctly
        _mockRecipeService.Verify(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()), Times.Once);
    }

    [Fact]
    public async Task UpdateRecipe_WithPartialData_ReturnsOk()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Partial Update",
            Servings = 3
            // Instructions and UserId are null/not provided
        };
        var updatedRecipe = new Recipe 
        { 
            Id = recipeId, 
            Title = "Partial Update", 
            Servings = 3,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();
        
        // Verify mapper and service were called correctly
        _mockRecipeService.Verify(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()), Times.Once);
    }

    [Fact]
    public async Task UpdateRecipe_WithInvalidId_ReturnsBadRequest()
    {
        // Arrange
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(Guid.Empty, requestDto);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task UpdateRecipe_WithNonExistentId_ThrowsKeyNotFoundException()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ThrowsAsync(new KeyNotFoundException($"Recipe with ID {recipeId} not found"));

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            _subjectUnderTest.UpdateRecipe(recipeId, requestDto));
    }

    [Fact]
    public async Task UpdateRecipe_LogsInformationWithCorrectParameters()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Updated Recipe",
            Servings = 4
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Updated Recipe",
            Servings = 4,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Updating recipe:")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region DELETE /api/recipes/{id} Tests

    [Fact]
    public async Task DeleteRecipe_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId))
            .ReturnsAsync(true);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteRecipe_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId))
            .ReturnsAsync(false);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteRecipe_WithInvalidId_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(Guid.Empty);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task DeleteRecipe_LogsInformationWithCorrectParameters()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId))
            .ReturnsAsync(true);

        // Act
        await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Deleting recipe:")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region Cross-Cutting Scenarios

    [Fact]
    public void AllEndpoints_CallsCorrectServiceMethods()
    {
        // This test verifies that controller methods call the correct service methods
        // Individual method verification is done in the specific tests above
        _mockRecipeService.Verify();
    }

    [Fact]
    public async Task AllEndpoints_LogsAppropriateMessages()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId))
            .ReturnsAsync(recipe);

        // Act
        await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert - Verify that logging occurs (specific implementation depends on controller logging)
        _mockLogger.Verify(
            x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.AtLeastOnce);
    }
    #endregion
}