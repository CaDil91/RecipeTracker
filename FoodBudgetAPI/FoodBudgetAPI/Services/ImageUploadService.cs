using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FoodBudgetAPI.Configuration;
using Microsoft.Extensions.Options;

namespace FoodBudgetAPI.Services;

/// <summary>
/// Service for generating secure SAS tokens for Azure Blob Storage image uploads
/// </summary>
public class ImageUploadService(BlobServiceClient blobServiceClient, ILogger<ImageUploadService> logger,
    IOptions<ImageUploadOptions>? imageUploadOptions, IOptions<AzureStorageOptions> azureStorageOptions) : IImageUploadService
{
    private const int CLOCK_SKEW_MINUTES = 5;

    private readonly BlobServiceClient _blobServiceClient = blobServiceClient ?? throw new ArgumentNullException(nameof(blobServiceClient));
    private readonly ILogger<ImageUploadService> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly ImageUploadOptions _imageUploadOptions = imageUploadOptions?.Value ?? throw new ArgumentNullException(nameof(imageUploadOptions));
    private readonly AzureStorageOptions _azureStorageOptions = azureStorageOptions != null ? azureStorageOptions.Value : throw new ArgumentNullException(nameof(azureStorageOptions));

    /// <inheritdoc />
    public async Task<UploadTokenResponse> GenerateUploadTokenAsync(
        string userId,
        string fileName,
        string contentType,
        long fileSizeBytes)
    {
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

            // Get user delegation key from Azure AD (valid for up to 7 days)
            DateTimeOffset delegationKeyStartTime = DateTimeOffset.UtcNow.AddMinutes(-CLOCK_SKEW_MINUTES);
            DateTimeOffset delegationKeyExpiryTime = DateTimeOffset.UtcNow.AddMinutes(_imageUploadOptions.TokenExpirationMinutes);
            Response<UserDelegationKey>? userDelegationKey = await _blobServiceClient.GetUserDelegationKeyAsync(
                delegationKeyStartTime,
                delegationKeyExpiryTime);

            // Create SAS token using user delegation key (not account key)
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = _azureStorageOptions.ContainerName,
                BlobName = blobName,
                Resource = "b", // "b" = blob (not container)
                StartsOn = delegationKeyStartTime, // Clock skew protection
                ExpiresOn = delegationKeyExpiryTime,
            };

            // CRITICAL: Set Create + Write permissions (prevents large file upload failures)
            sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

            // Generate SAS query parameters signed with user delegation key
            BlobSasQueryParameters? sasQueryParams = sasBuilder.ToSasQueryParameters(userDelegationKey.Value, _azureStorageOptions.AccountName);

            // Build the full SAS URI
            var blobUriBuilder = new BlobUriBuilder(blobClient.Uri) { Sas = sasQueryParams };

            return new UploadTokenResponse
            {
                UploadUrl = blobUriBuilder.ToUri().ToString(),
                PublicUrl = blobClient.Uri.ToString(),
                ExpiresAt = sasBuilder.ExpiresOn
            };
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