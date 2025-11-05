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
public class RecipeController(IRecipeService recipeService, ILogger<RecipeController> logger, IMapper mapper)
    : ControllerBase
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
        _logger.LogInformation("Getting recipe by ID: {RecipeId}", id);
        
        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");
        
        Recipe? recipe = await _recipeService.GetRecipeByIdAsync(id);
        if (recipe == null) return NotFound();
        
        var recipeDto = _mapper.Map<RecipeResponseDto>(recipe);
        return Ok(recipeDto);
    }

    [HttpPost]
    public async Task<IActionResult> CreateRecipe([FromBody] RecipeRequestDto request)
    {
        var recipe = _mapper.Map<Recipe>(request);
        Recipe createdRecipe = await _recipeService.CreateRecipeAsync(recipe);
        
        var recipeDto = _mapper.Map<RecipeResponseDto>(createdRecipe);
        return CreatedAtAction(nameof(GetRecipeById), new { id = createdRecipe.Id }, recipeDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRecipe(Guid id, [FromBody] RecipeRequestDto request)
    {
        _logger.LogInformation("Updating recipe: {RecipeId}", id);
        
        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");
        
        var recipe = _mapper.Map<Recipe>(request);
        Recipe updatedRecipe = await _recipeService.UpdateRecipeAsync(id, recipe);
        
        var recipeDto = _mapper.Map<RecipeResponseDto>(updatedRecipe);
        return Ok(recipeDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecipe(Guid id)
    {
        _logger.LogInformation("Deleting recipe: {RecipeId}", id);
        
        if (id == Guid.Empty) return BadRequest("Invalid recipe ID format");
        
        bool deleted = await _recipeService.DeleteRecipeAsync(id);
        
        if (!deleted) return NotFound();
        
        return NoContent();
    }
}