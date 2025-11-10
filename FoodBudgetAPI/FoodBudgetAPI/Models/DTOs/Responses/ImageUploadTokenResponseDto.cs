namespace FoodBudgetAPI.Models.DTOs.Responses;

public class ImageUploadTokenResponseDto
{
    public string UploadUrl { get; init; } = null!;
    public string PublicUrl { get; init; } = null!;
    public DateTimeOffset ExpiresAt { get; init; }
}