namespace FoodBudgetAPI.Entities;

/// <summary>
/// Represents a cooking recipe in the food budget system
/// </summary>
public class Recipe
{
    /// <summary>
    /// Unique identifier for the recipe
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Title of the recipe (required)
    /// </summary>
    public string Title { get; set; } = null!;
    
    /// <summary>
    /// Cooking instructions (optional)
    /// </summary>
    public string? Instructions { get; set; }
    
    /// <summary>
    /// Number of servings the recipe makes
    /// </summary>
    public int? Servings { get; set; }
    
    /// <summary>
    /// Date and time when the recipe was created (automatically set)
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Optional identifier of the user who created this recipe
    /// </summary>
    public Guid? UserId { get; set; }
}