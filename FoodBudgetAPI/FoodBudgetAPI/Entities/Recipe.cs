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
    /// Number of servings the recipe makes (required, must be greater than zero)
    /// </summary>
    public int Servings { get; set; }
    
    /// <summary>
    /// Category of the recipe (e.g., Dessert, Main Course) (optional)
    /// </summary>
    public string? Category { get; set; }
    
    /// <summary>
    /// URL to an image of the prepared dish (optional, must be a valid URL if provided)
    /// </summary>
    public string? ImageUrl { get; set; }
    
    /// <summary>
    /// Date and time when the recipe was created (automatically set)
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Identifier of the user who created this recipe (required)
    /// </summary>
    public Guid UserId { get; set; }
}