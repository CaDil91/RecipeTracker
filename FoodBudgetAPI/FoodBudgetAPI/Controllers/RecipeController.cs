using Asp.Versioning;
using AutoMapper;
using FoodBudgetAPI.Entities;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace FoodBudgetAPI.Controllers;

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
    public async Task<IActionResult> GetAllRecipes(Guid? userId = null, int? limit = null)
    {
        _logger.LogInformation("GetAllRecipes called with userId: {UserId}, limit: {Limit}", userId, limit);
        
        if (userId == Guid.Empty) return BadRequest("Invalid user ID format");
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecipe(Guid id, [FromBody] RecipeRequestDto request)
    {
        throw new NotImplementedException();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecipe(Guid id)
    {
        throw new NotImplementedException();
    }
}