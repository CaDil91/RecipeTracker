using System.ComponentModel.DataAnnotations;

namespace FoodBudgetAPI.Models.DTOs.Requests;

/// <summary>
/// Request DTO for generating an image upload token
/// </summary>
public class ImageUploadTokenRequestDto
{
    /// <summary>
    /// The original file name with extension (e.g., "photo.jpg")
    /// </summary>
    [Required(ErrorMessage = "File name is required")]
    [StringLength(255, MinimumLength = 1, ErrorMessage = "File name must be between 1 and 255 characters")]
    public required string FileName { get; init; }

    /// <summary>
    /// The MIME type of the file (e.g., "image/jpeg", "image/png")
    /// </summary>
    [Required(ErrorMessage = "Content type is required")]
    [RegularExpression(@"^image/(jpeg|jpg|png)$", ErrorMessage = "Only JPEG and PNG images are allowed")]
    public required string ContentType { get; init; }

    /// <summary>
    /// The size of the file in bytes (max 10MB)
    /// </summary>
    [Required(ErrorMessage = "File size is required")]
    [Range(1, 10_485_760, ErrorMessage = "File size must be between 1 byte and 10MB")]
    public required long FileSizeBytes { get; init; }
}