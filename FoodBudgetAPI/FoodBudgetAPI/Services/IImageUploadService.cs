namespace FoodBudgetAPI.Services;

/// <summary>
/// Service for generating secure upload tokens for Azure Blob Storage
/// </summary>
public interface IImageUploadService
{
    /// <summary>
    /// Generates a SAS token for uploading an image to Azure Blob Storage
    /// </summary>
    /// <param name="userId">The user ID for folder organization</param>
    /// <param name="fileName">The original file name with extension</param>
    /// <param name="contentType">The MIME type of the file (e.g., image/jpeg)</param>
    /// <param name="fileSizeBytes">The size of the file in bytes</param>
    /// <returns>Upload token response containing upload URL, public URL, and expiration time</returns>
    Task<UploadTokenResponse> GenerateUploadTokenAsync(
        string userId,
        string fileName,
        string contentType,
        long fileSizeBytes);
}

/// <summary>
/// Response containing SAS token information for image upload
/// </summary>
public class UploadTokenResponse
{
    /// <summary>
    /// URL with SAS token for uploading the blob (includes query parameters)
    /// </summary>
    public required string UploadUrl { get; init; }

    /// <summary>
    /// Public URL without SAS token for accessing the blob after upload
    /// </summary>
    public required string PublicUrl { get; init; }

    /// <summary>
    /// When the SAS token expires (5 minutes from generation)
    /// </summary>
    public required DateTimeOffset ExpiresAt { get; init; }
}