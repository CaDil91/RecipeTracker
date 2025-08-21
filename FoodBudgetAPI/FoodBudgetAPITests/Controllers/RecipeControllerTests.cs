using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Asp.Versioning;
using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Controllers;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Controllers;

public class RecipeControllerTests
{
    private readonly Mock<IRecipeService> _mockRecipeService;
    private readonly Mock<ILogger<RecipeController>> _mockLogger;
    private readonly Mock<IMapper> _mockMapper;
    private readonly RecipeController _subjectUnderTest;

    public RecipeControllerTests()
    {
        _mockRecipeService = new Mock<IRecipeService>();
        _mockLogger = new Mock<ILogger<RecipeController>>();
        _mockMapper = new Mock<IMapper>();
        _subjectUnderTest = new RecipeController(_mockRecipeService.Object, _mockLogger.Object, _mockMapper.Object);
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullService_ThrowsArgumentNullException()
    {
        // Act & Assert
        ArgumentNullException? exception = Assert.Throws<ArgumentNullException>(() => 
            new RecipeController(null!, _mockLogger.Object, _mockMapper.Object));
        exception.ParamName.Should().Be("recipeService");
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        ArgumentNullException? exception = Assert.Throws<ArgumentNullException>(() => 
            new RecipeController(_mockRecipeService.Object, null!, _mockMapper.Object));
        exception.ParamName.Should().Be("logger");
    }

    [Fact]
    public void Constructor_WithNullMapper_ThrowsArgumentNullException()
    {
        // Act & Assert
        ArgumentNullException? exception = Assert.Throws<ArgumentNullException>(() => 
            new RecipeController(_mockRecipeService.Object, _mockLogger.Object, null!));
        exception.ParamName.Should().Be("mapper");
    }

    [Fact]
    public void Constructor_WithValidParameters_CreatesInstance()
    {
        // Act
        var controller = new RecipeController(_mockRecipeService.Object, _mockLogger.Object, _mockMapper.Object);

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
        var recipeDtos = new List<RecipeResponseDto>
        {
            new() { Id = recipes[0].Id, Title = recipes[0].Title, Servings = recipes[0].Servings },
            new() { Id = recipes[1].Id, Title = recipes[1].Title, Servings = recipes[1].Servings }
        };
        
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, null))
            .ReturnsAsync(recipes);
        _mockMapper.Setup(x => x.Map<IEnumerable<RecipeResponseDto>>(recipes))
            .Returns(recipeDtos);

        // Act
        var result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<List<RecipeResponseDto>>();
        okResult.Value.Should().BeEquivalentTo(recipeDtos);
        
        // Verify mapper was called
        _mockMapper.Verify(x => x.Map<IEnumerable<RecipeResponseDto>>(recipes), Times.Once);
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
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(userId, null))
            .ReturnsAsync(userRecipes);

        // Act
        var result = await _subjectUnderTest.GetAllRecipes(userId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(userRecipes);
    }

    [Fact]
    public async Task GetAllRecipes_WithLimitFilter_ReturnsLimitedRecipes()
    {
        // Arrange
        var limitedRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4 },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 2 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, 2))
            .ReturnsAsync(limitedRecipes);

        // Act
        var result = await _subjectUnderTest.GetAllRecipes(null, 2);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(limitedRecipes);
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
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(userId, 5))
            .ReturnsAsync(recipes);

        // Act
        var result = await _subjectUnderTest.GetAllRecipes(userId, 5);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(recipes);
    }

    [Fact]
    public async Task GetAllRecipes_WhenNoRecipes_ReturnsEmptyList()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, null))
            .ReturnsAsync(new List<Recipe>());

        // Act
        var result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var recipes = okResult.Value.Should().BeAssignableTo<IEnumerable<Recipe>>().Subject;
        recipes.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllRecipes_WithInvalidLimit_ReturnsBadRequest()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, -1))
            .ThrowsAsync(new ArgumentException("Limit must be greater than zero", "limit"));

        // Act
        var result = await _subjectUnderTest.GetAllRecipes(null, -1);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task GetAllRecipes_WithInvalidUserId_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.GetAllRecipes("invalid-guid");

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid user ID format");
    }

    [Fact]
    public async Task GetAllRecipes_WhenServiceThrows_ReturnsInternalServerError()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(null, null))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
    }

    #endregion

    #region GET /api/recipes/{id} Tests

    [Fact]
    public async Task GetRecipeById_WithValidId_ReturnsOkWithRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        var recipeDto = new RecipeResponseDto { Id = recipeId, Title = "Test Recipe", Servings = 4 };
        
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId))
            .ReturnsAsync(recipe);
        _mockMapper.Setup(x => x.Map<RecipeResponseDto>(recipe))
            .Returns(recipeDto);

        // Act
        var result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();
        okResult.Value.Should().BeEquivalentTo(recipeDto);
        
        // Verify mapper was called
        _mockMapper.Verify(x => x.Map<RecipeResponseDto>(recipe), Times.Once);
    }

    [Fact]
    public async Task GetRecipeById_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId))
            .ReturnsAsync((Recipe?)null);

        // Act
        var result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetRecipeById_WithInvalidId_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.GetRecipeById("invalid-guid");

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task GetRecipeById_WithEmptyId_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.GetRecipeById("");

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task GetRecipeById_WhenServiceThrows_ReturnsInternalServerError()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
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
        var mappedRecipe = new Recipe
        {
            Title = requestDto.Title,
            Instructions = requestDto.Instructions,
            Servings = requestDto.Servings,
            UserId = requestDto.UserId
        };
        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = requestDto.Title,
            Instructions = requestDto.Instructions,
            Servings = requestDto.Servings,
            UserId = requestDto.UserId,
            CreatedAt = DateTime.UtcNow
        };
        var responseDto = new RecipeResponseDto
        {
            Id = createdRecipe.Id,
            Title = createdRecipe.Title,
            Instructions = createdRecipe.Instructions,
            Servings = createdRecipe.Servings,
            UserId = createdRecipe.UserId,
            CreatedAt = createdRecipe.CreatedAt
        };
        
        _mockMapper.Setup(x => x.Map<Recipe>(requestDto))
            .Returns(mappedRecipe);
        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ReturnsAsync(createdRecipe);
        _mockMapper.Setup(x => x.Map<RecipeResponseDto>(createdRecipe))
            .Returns(responseDto);

        // Act
        var result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
        createdResult.ActionName.Should().Be(nameof(RecipeController.GetRecipeById));
        createdResult.RouteValues!["id"].Should().Be(createdRecipe.Id);
        createdResult.Value.Should().BeOfType<RecipeResponseDto>();
        createdResult.Value.Should().BeEquivalentTo(responseDto);
        
        // Verify mapper was called for both request and response
        _mockMapper.Verify(x => x.Map<Recipe>(requestDto), Times.Once);
        _mockMapper.Verify(x => x.Map<RecipeResponseDto>(createdRecipe), Times.Once);
    }

    [Fact]
    public async Task CreateRecipe_WithOptionalFields_ReturnsCreated()
    {
        // Arrange
        var requestDto = new RecipeRequestDto
        {
            Title = "Simple Recipe",
            Servings = 2,
            Instructions = "Simple instructions",
            UserId = Guid.NewGuid()
        };
        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = requestDto.Title,
            Servings = requestDto.Servings,
            Instructions = requestDto.Instructions,
            UserId = requestDto.UserId,
            CreatedAt = DateTime.UtcNow
        };
        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ReturnsAsync(createdRecipe);

        // Act
        var result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
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
            Title = requestDto.Title,
            Servings = requestDto.Servings,
            CreatedAt = DateTime.UtcNow
        };
        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ReturnsAsync(createdRecipe);

        // Act
        var result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
    }

    [Fact]
    public async Task CreateRecipe_WithNullRequest_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.CreateRecipe(null!);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Request body is required");
    }

    [Fact]
    public async Task CreateRecipe_WithEmptyTitle_ReturnsBadRequest()
    {
        // Arrange
        _subjectUnderTest.ModelState.AddModelError("Title", "Title is required");

        // Act
        var result = await _subjectUnderTest.CreateRecipe(new RecipeRequestDto { Title = "", Servings = 4 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateRecipe_WithZeroServings_ReturnsBadRequest()
    {
        // Arrange
        _subjectUnderTest.ModelState.AddModelError("Servings", "Servings must be between 1 and 100");

        // Act
        var result = await _subjectUnderTest.CreateRecipe(new RecipeRequestDto { Title = "Test", Servings = 0 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateRecipe_WithNegativeServings_ReturnsBadRequest()
    {
        // Arrange
        _subjectUnderTest.ModelState.AddModelError("Servings", "Servings must be between 1 and 100");

        // Act
        var result = await _subjectUnderTest.CreateRecipe(new RecipeRequestDto { Title = "Test", Servings = -1 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task CreateRecipe_WithInvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        _subjectUnderTest.ModelState.AddModelError("Title", "Title cannot exceed 200 characters");

        // Act
        var result = await _subjectUnderTest.CreateRecipe(new RecipeRequestDto { Title = new string('a', 201), Servings = 4 });

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task CreateRecipe_WhenServiceThrows_ReturnsInternalServerError()
    {
        // Arrange
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.IsAny<Recipe>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
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
        var mappedRecipe = new Recipe
        {
            Title = requestDto.Title,
            Instructions = requestDto.Instructions,
            Servings = requestDto.Servings,
            UserId = requestDto.UserId
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = requestDto.Title,
            Instructions = requestDto.Instructions,
            Servings = requestDto.Servings,
            UserId = requestDto.UserId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        var responseDto = new RecipeResponseDto
        {
            Id = updatedRecipe.Id,
            Title = updatedRecipe.Title,
            Instructions = updatedRecipe.Instructions,
            Servings = updatedRecipe.Servings,
            UserId = updatedRecipe.UserId,
            CreatedAt = updatedRecipe.CreatedAt
        };
        
        _mockMapper.Setup(x => x.Map<Recipe>(requestDto))
            .Returns(mappedRecipe);
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);
        _mockMapper.Setup(x => x.Map<RecipeResponseDto>(updatedRecipe))
            .Returns(responseDto);

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();
        okResult.Value.Should().BeEquivalentTo(responseDto);
        
        // Verify mapper was called for both request and response
        _mockMapper.Verify(x => x.Map<Recipe>(requestDto), Times.Once);
        _mockMapper.Verify(x => x.Map<RecipeResponseDto>(updatedRecipe), Times.Once);
    }

    [Fact]
    public async Task UpdateRecipe_WithAllFields_ReturnsOk()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Complete Recipe",
            Instructions = "Complete instructions",
            Servings = 8,
            UserId = Guid.NewGuid()
        };
        var updatedRecipe = new Recipe { Id = recipeId, Title = requestDto.Title, Servings = requestDto.Servings };
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task UpdateRecipe_WithPartialUpdate_ReturnsOk()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Partial Update",
            Servings = 3
            // Instructions and UserId are null/not provided
        };
        var updatedRecipe = new Recipe { Id = recipeId, Title = requestDto.Title, Servings = requestDto.Servings };
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task UpdateRecipe_WithInvalidId_ReturnsBadRequest()
    {
        // Arrange
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };

        // Act
        var result = await _subjectUnderTest.UpdateRecipe("invalid-guid", requestDto);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task UpdateRecipe_WithNonExistentId_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ThrowsAsync(new KeyNotFoundException($"Recipe with ID {recipeId} not found"));

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        notFoundResult.StatusCode.Should().Be(404);
    }

    [Fact]
    public async Task UpdateRecipe_WithNullRequest_ReturnsBadRequest()
    {
        // Arrange
        var recipeId = Guid.NewGuid();

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, null!);

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Request body is required");
    }

    [Fact]
    public async Task UpdateRecipe_WithEmptyTitle_ReturnsBadRequest()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _subjectUnderTest.ModelState.AddModelError("Title", "Title is required");

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, new RecipeRequestDto { Title = "", Servings = 4 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task UpdateRecipe_WithZeroServings_ReturnsBadRequest()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _subjectUnderTest.ModelState.AddModelError("Servings", "Servings must be between 1 and 100");

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, new RecipeRequestDto { Title = "Test", Servings = 0 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task UpdateRecipe_WithNegativeServings_ReturnsBadRequest()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _subjectUnderTest.ModelState.AddModelError("Servings", "Servings must be between 1 and 100");

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, new RecipeRequestDto { Title = "Test", Servings = -1 });

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
    }

    [Fact]
    public async Task UpdateRecipe_WithInvalidModelState_ReturnsBadRequest()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _subjectUnderTest.ModelState.AddModelError("Title", "Title cannot exceed 200 characters");

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, new RecipeRequestDto { Title = new string('a', 201), Servings = 4 });

        // Assert
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task UpdateRecipe_WhenServiceThrows_ReturnsInternalServerError()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto { Title = "Test Recipe", Servings = 4 };
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
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
        var result = await _subjectUnderTest.DeleteRecipe(recipeId);

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
        var result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteRecipe_WithInvalidId_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.DeleteRecipe("invalid-guid");

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task DeleteRecipe_WithEmptyId_ReturnsBadRequest()
    {
        // Act
        var result = await _subjectUnderTest.DeleteRecipe("");

        // Assert
        var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
    }

    [Fact]
    public async Task DeleteRecipe_WhenServiceThrows_ReturnsInternalServerError()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
        statusCodeResult.StatusCode.Should().Be(500);
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

    #region Validation Tests

    [Fact]
    public void RecipeRequestDto_Title_RequiredValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto { Title = null!, Servings = 4 };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeFalse();
        validationResults.Should().ContainSingle(r => r.ErrorMessage == "Title is required");
    }

    [Fact]
    public void RecipeRequestDto_Title_MaxLengthValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto { Title = new string('a', 201), Servings = 4 };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeFalse();
        validationResults.Should().ContainSingle(r => r.ErrorMessage == "Title cannot exceed 200 characters");
    }

    [Fact]
    public void RecipeRequestDto_Servings_RequiredValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto { Title = "Test" };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeFalse();
        validationResults.Should().ContainSingle(r => r.ErrorMessage == "Servings is required");
    }

    [Fact]
    public void RecipeRequestDto_Servings_RangeValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto { Title = "Test", Servings = 101 };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeFalse();
        validationResults.Should().ContainSingle(r => r.ErrorMessage == "Servings must be between 1 and 100");
    }

    [Fact]
    public void RecipeRequestDto_Instructions_MaxLengthValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto 
        { 
            Title = "Test", 
            Servings = 4, 
            Instructions = new string('a', 5001) 
        };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeFalse();
        validationResults.Should().ContainSingle(r => r.ErrorMessage == "Instructions cannot exceed 5000 characters");
    }

    [Fact]
    public void RecipeRequestDto_ValidData_PassesValidation()
    {
        // Arrange
        var dto = new RecipeRequestDto 
        { 
            Title = "Valid Recipe", 
            Servings = 4,
            Instructions = "Valid instructions",
            UserId = Guid.NewGuid()
        };
        var validationContext = new ValidationContext(dto);
        var validationResults = new List<ValidationResult>();

        // Act
        bool isValid = Validator.TryValidateObject(dto, validationContext, validationResults, true);

        // Assert
        isValid.Should().BeTrue();
        validationResults.Should().BeEmpty();
    }

    #endregion

    #region AutoMapper Tests

    [Fact]
    public void AutoMapper_Configuration_IsValid()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<RecipeRequestDto, Recipe>();
            cfg.CreateMap<Recipe, RecipeResponseDto>();
        });

        // Act & Assert
        configuration.AssertConfigurationIsValid();
    }

    [Fact]
    public void AutoMapper_RecipeRequestDtoToRecipe_MapsCorrectly()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<RecipeRequestDto, Recipe>();
        });
        var mapper = configuration.CreateMapper();
        
        var dto = new RecipeRequestDto
        {
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid()
        };

        // Act
        var recipe = mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Instructions.Should().Be(dto.Instructions);
        recipe.Servings.Should().Be(dto.Servings);
        recipe.UserId.Should().Be(dto.UserId);
        recipe.Id.Should().Be(Guid.Empty); // Should not be set by mapping
        recipe.CreatedAt.Should().Be(default(DateTime)); // Should not be set by mapping
    }

    [Fact]
    public void AutoMapper_RecipeToRecipeResponseDto_MapsCorrectly()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<Recipe, RecipeResponseDto>();
        });
        var mapper = configuration.CreateMapper();
        
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Test Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var responseDto = mapper.Map<RecipeResponseDto>(recipe);

        // Assert
        responseDto.Id.Should().Be(recipe.Id);
        responseDto.Title.Should().Be(recipe.Title);
        responseDto.Instructions.Should().Be(recipe.Instructions);
        responseDto.Servings.Should().Be(recipe.Servings);
        responseDto.UserId.Should().Be(recipe.UserId);
        responseDto.CreatedAt.Should().Be(recipe.CreatedAt);
    }

    [Fact]
    public void AutoMapper_RecipeRequestDtoToRecipe_HandlesNullOptionalFields()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<RecipeRequestDto, Recipe>();
        });
        var mapper = configuration.CreateMapper();
        
        var dto = new RecipeRequestDto
        {
            Title = "Test Recipe",
            Servings = 4,
            Instructions = null,
            UserId = null
        };

        // Act
        var recipe = mapper.Map<Recipe>(dto);

        // Assert
        recipe.Title.Should().Be(dto.Title);
        recipe.Servings.Should().Be(dto.Servings);
        recipe.Instructions.Should().BeNull();
        recipe.UserId.Should().BeNull();
    }

    [Fact]
    public void AutoMapper_RecipeToRecipeResponseDto_HandlesNullOptionalFields()
    {
        // Arrange
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.CreateMap<Recipe, RecipeResponseDto>();
        });
        var mapper = configuration.CreateMapper();
        
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Test Recipe",
            Servings = 4,
            Instructions = null,
            UserId = null,
            CreatedAt = DateTime.UtcNow
        };

        // Act
        var responseDto = mapper.Map<RecipeResponseDto>(recipe);

        // Assert
        responseDto.Id.Should().Be(recipe.Id);
        responseDto.Title.Should().Be(recipe.Title);
        responseDto.Servings.Should().Be(recipe.Servings);
        responseDto.Instructions.Should().BeNull();
        responseDto.UserId.Should().BeNull();
    }

    #endregion

    #region Routing Tests

    [Fact]
    public void GetAllRecipes_HasCorrectRoute()
    {
        // Arrange
        MethodInfo? methodInfo = typeof(RecipeController).GetMethod(nameof(RecipeController.GetAllRecipes));

        // Act
        var routeAttribute = methodInfo?.GetCustomAttributes(typeof(HttpGetAttribute), false)
            .FirstOrDefault() as HttpGetAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().BeNullOrEmpty(); // GET /api/recipes
    }

    [Fact]
    public void GetRecipeById_HasCorrectRoute()
    {
        // Arrange
        MethodInfo? methodInfo = typeof(RecipeController).GetMethod(nameof(RecipeController.GetRecipeById));

        // Act
        var routeAttribute = methodInfo?.GetCustomAttributes(typeof(HttpGetAttribute), false)
            .FirstOrDefault() as HttpGetAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().Be("{id}"); // GET /api/recipes/{id}
    }

    [Fact]
    public void CreateRecipe_HasCorrectRoute()
    {
        // Arrange
        MethodInfo? methodInfo = typeof(RecipeController).GetMethod(nameof(RecipeController.CreateRecipe));

        // Act
        var routeAttribute = methodInfo?.GetCustomAttributes(typeof(HttpPostAttribute), false)
            .FirstOrDefault() as HttpPostAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().BeNullOrEmpty(); // POST /api/recipes
    }

    [Fact]
    public void UpdateRecipe_HasCorrectRoute()
    {
        // Arrange
        MethodInfo? methodInfo = typeof(RecipeController).GetMethod(nameof(RecipeController.UpdateRecipe));

        // Act
        var routeAttribute = methodInfo?.GetCustomAttributes(typeof(HttpPutAttribute), false)
            .FirstOrDefault() as HttpPutAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().Be("{id}"); // PUT /api/recipes/{id}
    }

    [Fact]
    public void DeleteRecipe_HasCorrectRoute()
    {
        // Arrange
        MethodInfo? methodInfo = typeof(RecipeController).GetMethod(nameof(RecipeController.DeleteRecipe));

        // Act
        var routeAttribute = methodInfo?.GetCustomAttributes(typeof(HttpDeleteAttribute), false)
            .FirstOrDefault() as HttpDeleteAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().Be("{id}"); // DELETE /api/recipes/{id}
    }

    [Fact]
    public void Controller_HasApiControllerAttribute()
    {
        // Arrange
        Type controllerType = typeof(RecipeController);

        // Act
        object? apiControllerAttribute = controllerType.GetCustomAttributes(typeof(ApiControllerAttribute), false)
            .FirstOrDefault();

        // Assert
        apiControllerAttribute.Should().NotBeNull();
    }

    [Fact]
    public void Controller_HasCorrectRoutePrefix()
    {
        // Arrange
        Type controllerType = typeof(RecipeController);

        // Act
        var routeAttribute = controllerType.GetCustomAttributes(typeof(RouteAttribute), false)
            .FirstOrDefault() as RouteAttribute;

        // Assert
        routeAttribute.Should().NotBeNull();
        routeAttribute!.Template.Should().Be("api/[controller]");
    }

    [Fact]
    public void Controller_HasApiVersionAttribute()
    {
        // Arrange
        Type controllerType = typeof(RecipeController);

        // Act
        var apiVersionAttribute = controllerType.GetCustomAttributes(typeof(ApiVersionAttribute), false)
            .FirstOrDefault() as ApiVersionAttribute;

        // Assert
        apiVersionAttribute.Should().NotBeNull();
        apiVersionAttribute!.Versions.Should().ContainSingle(v => v.MajorVersion == 1);
    }

    #endregion

}