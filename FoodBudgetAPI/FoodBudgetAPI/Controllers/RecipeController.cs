using Asp.Versioning;
using AutoMapper;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Extensions;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodBudgetAPI.Controllers;

[Authorize]
[ApiController]
[ApiVersion(1)]
[Route("api/[controller]")]
public class RecipeController(IRecipeService recipeService, ILogger<RecipeController> logger, IMapper mapper) : ControllerBase
{
    private readonly IRecipeService _recipeService = recipeService ?? throw new ArgumentNullException(nameof(recipeService));
    private readonly ILogger<RecipeController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IMapper _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));

    [HttpGet]
    public async Task<IActionResult> GetAllRecipes(int? limit = null)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation("GetAllRecipes called for user: {UserId}, limit: {Limit}", userId, limit);

        if (limit is <= 0) return BadRequest("Limit must be greater than zero");

        IEnumerable<Recipe> recipes = await _recipeService.GetAllRecipesAsync(userId, limit);
        var recipeDTOs = _mapper.Map<IEnumerable<RecipeResponseDto>>(recipes);

        return Ok(recipeDTOs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetRecipeById(Guid id)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation("Getting recipe by ID: {RecipeId} for user: {UserId}", id, userId);

        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");

        Recipe? recipe = await _recipeService.GetRecipeByIdAsync(id);
        if (recipe == null) return NotFound();
        
        // (Ownership check) Return 404 instead of 403 to prevent information leakage (OWASP compliance)
        if (recipe.UserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted unauthorized access to recipe {RecipeId} owned by {OwnerId}", userId, id, recipe.UserId);
            return NotFound();
        }

        var recipeDto = _mapper.Map<RecipeResponseDto>(recipe);
        return Ok(recipeDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRecipe([FromBody] RecipeRequestDto request)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation("Creating recipe for user: {UserId}", userId);

        var recipe = _mapper.Map<Recipe>(request);
        recipe.UserId = userId;

        Recipe createdRecipe = await _recipeService.CreateRecipeAsync(recipe);
        
        var recipeDto = _mapper.Map<RecipeResponseDto>(createdRecipe);
        return CreatedAtAction(nameof(GetRecipeById), new { id = createdRecipe.Id }, recipeDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRecipe(Guid id, [FromBody] RecipeRequestDto request)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation("Updating recipe: {RecipeId} for user: {UserId}", id, userId);
        
        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");
        
        // Verify ownership before allowing update
        Recipe? existingRecipe = await _recipeService.GetRecipeByIdAsync(id);
        if (existingRecipe == null) return NotFound();

        // Ownership check - Return 404 instead of 403 to prevent information leakage (OWASP compliance)
        if (existingRecipe.UserId != userId)
        {
            _logger.LogWarning(
                "User {UserId} attempted unauthorized update of recipe {RecipeId} owned by {OwnerId}",
                userId, id, existingRecipe.UserId);
            return NotFound();
        }

        var recipe = _mapper.Map<Recipe>(request);
        recipe.UserId = userId; // Preserve userId from JWT (Story 5.4 security requirement)
        Recipe updatedRecipe = await _recipeService.UpdateRecipeAsync(id, recipe);
        
        var recipeDto = _mapper.Map<RecipeResponseDto>(updatedRecipe);
        return Ok(recipeDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecipe(Guid id)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation("Deleting recipe: {RecipeId} for user: {UserId}", id, userId);
        
        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");
        
        // Verify ownership before allowing deletion
        Recipe? existingRecipe = await _recipeService.GetRecipeByIdAsync(id);
        if (existingRecipe == null) return NotFound();

        // Ownership check - Return 404 instead of 403 to prevent information leakage (OWASP compliance)
        if (existingRecipe.UserId != userId)
        {
            _logger.LogWarning(
                "User {UserId} attempted unauthorized deletion of recipe {RecipeId} owned by {OwnerId}",
                userId, id, existingRecipe.UserId);
            return NotFound();
        }

        bool deleted = await _recipeService.DeleteRecipeAsync(id);
        
        if (!deleted) return NotFound();
        
        return NoContent();
    }
}