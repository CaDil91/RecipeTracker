using System.ComponentModel.DataAnnotations;

namespace FoodBudgetAPI.Models.DTOs.Requests;

public class RecipeRequestDto
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = null!;
    
    [StringLength(5000, ErrorMessage = "Instructions cannot exceed 5000 characters")]
    public string? Instructions { get; set; }
    
    [Required(ErrorMessage = "Servings is required")]
    [Range(1, 100, ErrorMessage = "Servings must be between 1 and 100")]
    public int Servings { get; set; }
    
    public Guid? UserId { get; set; }
}