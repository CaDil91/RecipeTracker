using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using FoodBudgetAPI.Configuration;
using Microsoft.Extensions.Options;

namespace FoodBudgetAPI.Services;

/// <summary>
/// Service for generating secure SAS tokens for Azure Blob Storage image uploads
/// </summary>
public class ImageUploadService : IImageUploadService
{
    private const int CLOCK_SKEW_MINUTES = 5;

    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<ImageUploadService> _logger;
    private readonly ImageUploadOptions _imageUploadOptions;
    private readonly AzureStorageOptions _azureStorageOptions;

    public ImageUploadService(
        BlobServiceClient blobServiceClient,
        ILogger<ImageUploadService> logger,
        IOptions<ImageUploadOptions>? imageUploadOptions,
        IOptions<AzureStorageOptions> azureStorageOptions)
    {
        _blobServiceClient = blobServiceClient ?? throw new ArgumentNullException(nameof(blobServiceClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _imageUploadOptions = imageUploadOptions?.Value ?? throw new ArgumentNullException(nameof(imageUploadOptions));
        _azureStorageOptions = azureStorageOptions != null ? azureStorageOptions.Value : throw new ArgumentNullException(nameof(azureStorageOptions));
    }

    /// <inheritdoc />
    public Task<UploadTokenResponse> GenerateUploadTokenAsync(
        string userId,
        string fileName,
        string contentType,
        long fileSizeBytes)
    {
        // Validate parameters
        ValidateParameters(userId, fileName, contentType, fileSizeBytes);

        try
        {
            // Generate unique blob name: userId/guid.ext
            string fileExtension = Path.GetExtension(fileName);
            var guidFileName = $"{Guid.NewGuid()}{fileExtension.ToLowerInvariant()}";
            var blobName = $"{userId}/{guidFileName}";

            // Get blob client
            BlobContainerClient? containerClient = _blobServiceClient.GetBlobContainerClient(_azureStorageOptions.ContainerName);
            BlobClient? blobClient = containerClient.GetBlobClient(blobName);

            // Create an SAS token with clock skew protection
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = _azureStorageOptions.ContainerName,
                BlobName = blobName,
                Resource = "b", // "b" = blob (not container)
                StartsOn = DateTimeOffset.UtcNow.AddMinutes(-CLOCK_SKEW_MINUTES), // Clock skew protection
                ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(_imageUploadOptions.TokenExpirationMinutes),
            };

            // CRITICAL: Set Create + Write permissions (prevents large file upload failures)
            sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

            // Generate SAS URI
            Uri sasUri = blobClient.GenerateSasUri(sasBuilder);

            return Task.FromResult(new UploadTokenResponse
            {
                UploadUrl = sasUri.ToString(),
                PublicUrl = blobClient.Uri.ToString(),
                ExpiresAt = sasBuilder.ExpiresOn
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate upload token for user {UserId}, file {FileName}", userId, fileName);
            throw;
        }
    }

    // ReSharper disable once ParameterOnlyUsedForPreconditionCheck.Local
    private void ValidateParameters(string userId, string fileName, string contentType, long fileSizeBytes)
    {
        // Validate userId
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("User ID cannot be null or empty", nameof(userId));

        // Validate fileName
        if (string.IsNullOrWhiteSpace(fileName)) throw new ArgumentException("File name cannot be null or empty", nameof(fileName));

        // Validate file has extension
        string fileExtension = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(fileExtension)) throw new ArgumentException("File must have a valid extension", nameof(fileName));

        // Validate contentType
        if (string.IsNullOrWhiteSpace(contentType)) throw new ArgumentException("Content type cannot be null or empty", nameof(contentType));

        // Validate file type (case-insensitive comparison)
        if (!_imageUploadOptions.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            throw new ArgumentException("Only JPEG and PNG images are allowed", nameof(contentType));

        // Validate file size
        if (fileSizeBytes <= 0) throw new ArgumentException("File cannot be empty", nameof(fileSizeBytes));

        if (fileSizeBytes > _imageUploadOptions.MaxFileSizeBytes) throw new ArgumentException($"File size must be less than {_imageUploadOptions.maxFileSizeMb}MB", nameof(fileSizeBytes));
    }
}