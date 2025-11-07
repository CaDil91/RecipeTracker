namespace FoodBudgetAPI.Configuration;

/// <summary>
/// Configuration options for image upload functionality
/// </summary>
public class ImageUploadOptions
{
    public const string SECTION_NAME = "ImageUpload";

    /// <summary>
    /// Maximum file size in megabytes (default: 10 MB)
    /// </summary>
    public int maxFileSizeMb { get; set; } = 10;

    /// <summary>
    /// SAS token expiration time in minutes (default: 5 minutes)
    /// </summary>
    public int TokenExpirationMinutes { get; set; } = 5;

    /// <summary>
    /// Allowed image content types (default: JPEG and PNG)
    /// </summary>
    public List<string> AllowedContentTypes { get; set; } =
    [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    /// <summary>
    /// Gets the maximum file size in bytes
    /// </summary>
    public long MaxFileSizeBytes => maxFileSizeMb * 1_048_576L; // Convert MB to bytes
}
