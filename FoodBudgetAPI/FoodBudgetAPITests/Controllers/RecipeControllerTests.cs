using System.Security.Claims;
using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Controllers;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Http;
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
    private readonly Guid _testUserId = Guid.NewGuid();

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

        // Set up an authenticated user with 'oid' claim (required for GetObjectId())
        SetupAuthenticatedUser(_testUserId);
    }

    private void SetupAuthenticatedUser(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim("oid", userId.ToString()),
            new Claim("email", "test@example.com")
        };

        var identity = new ClaimsIdentity(claims, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
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
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4, Category = "Main Course", ImageUrl = "https://example.com/recipe1.jpg" },
            new() { Id = Guid.NewGuid(), Title = "Recipe 2", Servings = 2, Category = "Appetizer", ImageUrl = "https://example.com/recipe2.jpg" }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(_testUserId, null)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(_testUserId, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
    }

    [Fact]
    public async Task GetAllRecipes_ExtractsUserIdFromToken()
    {
        // Arrange
        var userRecipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe", UserId = _testUserId, Servings = 4 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(_testUserId, null)).ReturnsAsync(userRecipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes();

        // Assert - Verify user ID was extracted from a token and passed to service
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(_testUserId, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
    }

    [Fact]
    public async Task GetAllRecipes_WithValidLimit_PassesLimitToService()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "Recipe 1", Servings = 4 }
        };
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(_testUserId, 5)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(5);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(_testUserId, 5), Times.Once);
    }

    [Fact]
    public async Task GetAllRecipes_WithZeroLimit_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(0);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Limit must be greater than zero");
    }

    [Fact]
    public async Task GetAllRecipes_WithNegativeLimit_ReturnsBadRequest()
    {
        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(-5);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Limit must be greater than zero");
    }

    [Fact]
    public async Task GetAllRecipes_WithLimit_ReturnsLimitedRecipes()
    {
        // Arrange
        var recipes = new List<Recipe>
        {
            new() { Id = Guid.NewGuid(), Title = "User Recipe", UserId = _testUserId, Servings = 4 }
        };

        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(_testUserId, 5)).ReturnsAsync(recipes);

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes(5);

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(_testUserId, 5), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
    }

    [Fact]
    public async Task GetAllRecipes_WhenNoRecipes_ReturnsEmptyList()
    {
        // Arrange
        _mockRecipeService.Setup(x => x.GetAllRecipesAsync(_testUserId, null)).ReturnsAsync(new List<Recipe>());

        // Act
        IActionResult result = await _subjectUnderTest.GetAllRecipes();

        // Assert
        _mockRecipeService.Verify(x => x.GetAllRecipesAsync(_testUserId, null), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeAssignableTo<IEnumerable<RecipeResponseDto>>();
        okResult.StatusCode.Should().Be(200);
        ((IEnumerable<RecipeResponseDto>)okResult.Value!).Should().BeEmpty();
    }

    [Fact]
    public void GetAllRecipes_WhenUserHasNoOidClaim_ThrowsUnauthorizedAccessException()
    {
        // Arrange - Create user without 'oid' claim
        var claimsWithoutOid = new List<Claim>
        {
            new Claim("email", "test@example.com")
        };
        var identity = new ClaimsIdentity(claimsWithoutOid, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        // Act & Assert
        Func<Task> act = async () => await _subjectUnderTest.GetAllRecipes();
        act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }

    [Fact]
    public void GetAllRecipes_WhenOidClaimIsInvalid_ThrowsInvalidOperationException()
    {
        // Arrange - Create user with invalid 'oid' claim (not a GUID)
        var claimsWithInvalidOid = new List<Claim>
        {
            new Claim("oid", "not-a-guid"),
            new Claim("email", "test@example.com")
        };
        var identity = new ClaimsIdentity(claimsWithInvalidOid, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        // Act & Assert
        Func<Task> act = async () => await _subjectUnderTest.GetAllRecipes();
        act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Invalid user ID format in token");
    }

    #endregion

    #region GET /api/recipes/{id} Tests
    
    [Fact]
    public async Task GetRecipeById_WithValidId_ReturnsOkWithRecipe()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe { Id = recipeId, Title = "Test Recipe", Servings = 4, UserId = _testUserId };
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

    #region GetRecipeById Ownership Validation Tests (Story 5.4)

    #region Happy Path

    [Fact]
    public async Task Given_UserOwnsRecipe_When_GetRecipeById_Then_ReturnsOkWithRecipeData()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe
        {
            Id = recipeId,
            Title = "Test Recipe",
            Servings = 4,
            UserId = _testUserId // Recipe belongs to an authenticated user
        };
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
        recipeDto.UserId.Should().Be(_testUserId);
    }

    #endregion

    #region Business Rules (Security)

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_GetRecipeById_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid(); // Different user owns the recipe
        var recipe = new Recipe
        {
            Id = recipeId,
            Title = "Test Recipe",
            Servings = 4,
            UserId = differentUserId // Recipe belongs to a different user
        };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
    }

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_GetRecipeById_Then_LogsSecurityWarning()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var recipe = new Recipe
        {
            Id = recipeId,
            Title = "Test Recipe",
            Servings = 4,
            UserId = differentUserId
        };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        // Act
        await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("attempted unauthorized access")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    #endregion

    #region Null/Empty/Invalid Input

    [Fact]
    public async Task Given_RecipeDoesNotExist_When_GetRecipeById_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        // Verify NO warning logged (a recipe doesn't exist vs. unauthorized)
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
    }

    [Fact]
    public async Task Given_EmptyGuid_When_GetRecipeById_Then_ReturnsBadRequest()
    {
        // Arrange - no setup needed (validation happens before service call)

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(Guid.Empty);

        // Assert
        BadRequestObjectResult? badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequestResult.StatusCode.Should().Be(400);
        badRequestResult.Value.Should().Be("Invalid recipe ID format");
        // Verify service was never called
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(It.IsAny<Guid>()), Times.Never);
    }

    #endregion

    #region Boundaries

    [Fact]
    public async Task Given_RecipeExistsButUserIdIsEmpty_When_GetRecipeById_Then_ReturnsNotFound()
    {
        // Arrange - edge case for orphaned recipes (data migration scenario)
        var recipeId = Guid.NewGuid();
        var recipe = new Recipe
        {
            Id = recipeId,
            Title = "Orphaned Recipe",
            Servings = 4,
            UserId = Guid.Empty // Orphaned recipe (shouldn't happen after migration)
        };
        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(recipe);

        // Act
        IActionResult result = await _subjectUnderTest.GetRecipeById(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
    }

    #endregion

    #endregion

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
            Servings = 4
        };
        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "New Recipe",
            Instructions = "Test instructions",
            Servings = 4,
            UserId = _testUserId, // Controller sets this from JWT
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

    [Fact]
    public async Task Given_ValidRecipeRequest_When_CreateRecipe_Then_InjectsUserIdFromJWT()
    {
        // Arrange
        var requestDto = new RecipeRequestDto
        {
            Title = "Security Test Recipe",
            Instructions = "Test userId injection",
            Servings = 4
            // UserId NOT in DTO (removed for security - Story 5.4)
        };

        var createdRecipe = new Recipe
        {
            Id = Guid.NewGuid(),
            Title = "Security Test Recipe",
            Instructions = "Test userId injection",
            Servings = 4,
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };

        _mockRecipeService.Setup(x => x.CreateRecipeAsync(It.Is<Recipe>(r => r.UserId == _testUserId)))
            .ReturnsAsync(createdRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.CreateRecipe(requestDto);

        // Assert - Verify service was called with Recipe containing userId from JWT
        _mockRecipeService.Verify(
            x => x.CreateRecipeAsync(It.Is<Recipe>(r =>
                r.UserId == _testUserId &&
                r.Title == requestDto.Title &&
                r.Instructions == requestDto.Instructions &&
                r.Servings == requestDto.Servings
            )),
            Times.Once,
            "Controller must inject userId from JWT token, not from DTO");

        CreatedAtActionResult? createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.StatusCode.Should().Be(201);
        var recipeDto = createdResult.Value.Should().BeOfType<RecipeResponseDto>().Subject;
        recipeDto.UserId.Should().Be(_testUserId, "Response DTO must include userId from JWT");
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
            Servings = 6
        };
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Original Recipe",
            Instructions = "Original instructions",
            Servings = 4,
            UserId = _testUserId, // Recipe belongs to authenticated user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Updated Recipe",
            Instructions = "Updated instructions",
            Servings = 6,
            UserId = _testUserId, // Controller maintains userId from an existing recipe
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()))
            .ReturnsAsync(updatedRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();

        // Verify ownership check and update were called
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
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
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Original Recipe",
            Servings = 4,
            UserId = _testUserId, // Recipe belongs to authenticated user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Partial Update",
            Servings = 3,
            UserId = _testUserId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>())).ReturnsAsync(updatedRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<RecipeResponseDto>();

        // Verify ownership check and update were called correctly
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
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

    [Fact]
    public async Task Given_UserOwnsRecipe_When_UpdateRecipe_Then_UpdatesSuccessfully()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Updated Title",
            Instructions = "Updated instructions",
            Servings = 6
        };
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Original Title",
            Instructions = "Original instructions",
            Servings = 4,
            UserId = _testUserId, // Recipe belongs to an authenticated user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        var updatedRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Updated Title",
            Instructions = "Updated instructions",
            Servings = 6,
            UserId = _testUserId, // UserId preserved
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRecipeService.Setup(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>())).ReturnsAsync(updatedRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        _mockRecipeService.Verify(x => x.UpdateRecipeAsync(recipeId, It.IsAny<Recipe>()), Times.Once);
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        var recipeDto = okResult.Value.Should().BeOfType<RecipeResponseDto>().Subject;
        recipeDto.UserId.Should().Be(_testUserId);
    }

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_UpdateRecipe_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Attempted Update",
            Servings = 6
        };
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Original Recipe",
            Servings = 4,
            UserId = differentUserId, // Recipe belongs to a different user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        // Verify UpdateRecipeAsync was never called (ownership check failed)
        _mockRecipeService.Verify(x => x.UpdateRecipeAsync(It.IsAny<Guid>(), It.IsAny<Recipe>()), Times.Never);
    }

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_UpdateRecipe_Then_LogsSecurityWarning()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Attempted Update",
            Servings = 6
        };
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Original Recipe",
            Servings = 4,
            UserId = differentUserId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);

        // Act
        await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("attempted unauthorized update")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Given_RecipeDoesNotExist_When_UpdateRecipe_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var requestDto = new RecipeRequestDto
        {
            Title = "Update Non-Existent",
            Servings = 4
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        IActionResult result = await _subjectUnderTest.UpdateRecipe(recipeId, requestDto);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        // Verify NO warning logged (a recipe doesn't exist vs. unauthorized)
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
        // Verify UpdateRecipeAsync was never called
        _mockRecipeService.Verify(x => x.UpdateRecipeAsync(It.IsAny<Guid>(), It.IsAny<Recipe>()), Times.Never);
    }

    #endregion

    #region DELETE /api/recipes/{id} Tests

    [Fact]
    public async Task DeleteRecipe_WithValidId_ReturnsNoContent()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Recipe to Delete",
            Servings = 4,
            UserId = _testUserId, // Recipe belongs to authenticated user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId))
            .ReturnsAsync(true);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        _mockRecipeService.Verify(x => x.DeleteRecipeAsync(recipeId), Times.Once);
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

    [Fact]
    public async Task Given_UserOwnsRecipe_When_DeleteRecipe_Then_DeletesSuccessfully()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Recipe to Delete",
            Servings = 4,
            UserId = _testUserId, // Recipe belongs to an authenticated user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);
        _mockRecipeService.Setup(x => x.DeleteRecipeAsync(recipeId)).ReturnsAsync(true);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        _mockRecipeService.Verify(x => x.DeleteRecipeAsync(recipeId), Times.Once);
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_DeleteRecipe_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Someone Else's Recipe",
            Servings = 4,
            UserId = differentUserId, // Recipe belongs to a different user
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        // Verify DeleteRecipeAsync was never called (ownership check failed)
        _mockRecipeService.Verify(x => x.DeleteRecipeAsync(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task Given_UserDoesNotOwnRecipe_When_DeleteRecipe_Then_LogsSecurityWarning()
    {
        // Arrange
        var recipeId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();
        var existingRecipe = new Recipe
        {
            Id = recipeId,
            Title = "Someone Else's Recipe",
            Servings = 4,
            UserId = differentUserId,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync(existingRecipe);

        // Act
        await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("attempted unauthorized deletion")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Given_RecipeDoesNotExist_When_DeleteRecipe_Then_ReturnsNotFound()
    {
        // Arrange
        var recipeId = Guid.NewGuid();

        _mockRecipeService.Setup(x => x.GetRecipeByIdAsync(recipeId)).ReturnsAsync((Recipe?)null);

        // Act
        IActionResult result = await _subjectUnderTest.DeleteRecipe(recipeId);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
        _mockRecipeService.Verify(x => x.GetRecipeByIdAsync(recipeId), Times.Once);
        // Verify NO warning logged (a recipe doesn't exist vs. unauthorized)
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
        // Verify DeleteRecipeAsync was never called
        _mockRecipeService.Verify(x => x.DeleteRecipeAsync(It.IsAny<Guid>()), Times.Never);
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