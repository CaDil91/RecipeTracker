namespace FoodBudgetAPI.Models.DTOs.Responses;

public class RecipeResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Instructions { get; set; }
    public int Servings { get; set; }
    public string? Category { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? UserId { get; set; }
}