using Azure;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FluentAssertions;
using FoodBudgetAPI.Configuration;
using FoodBudgetAPI.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace FoodBudgetAPITests.Services;

public class ImageUploadServiceTests
{
    private readonly Mock<BlobServiceClient> _mockBlobServiceClient;
    private readonly Mock<BlobContainerClient> _mockBlobContainerClient;
    private readonly Mock<BlobClient> _mockBlobClient;
    private readonly Mock<ILogger<ImageUploadService>> _mockLogger;
    private readonly Mock<IOptions<ImageUploadOptions>> _mockImageUploadOptions;
    private readonly Mock<IOptions<AzureStorageOptions>> _mockAzureStorageOptions;
    private readonly ImageUploadService _subjectUnderTest;

    public ImageUploadServiceTests()
    {
        _mockBlobServiceClient = new Mock<BlobServiceClient>();
        _mockBlobContainerClient = new Mock<BlobContainerClient>();
        _mockBlobClient = new Mock<BlobClient>();
        _mockLogger = new Mock<ILogger<ImageUploadService>>();

        // Mock configuration options
        _mockImageUploadOptions = new Mock<IOptions<ImageUploadOptions>>();
        _mockImageUploadOptions.Setup(x => x.Value).Returns(new ImageUploadOptions
        {
            maxFileSizeMb = 10,
            TokenExpirationMinutes = 5,
            AllowedContentTypes = new List<string> { "image/jpeg", "image/jpg", "image/png" }
        });

        _mockAzureStorageOptions = new Mock<IOptions<AzureStorageOptions>>();
        _mockAzureStorageOptions.Setup(x => x.Value).Returns(new AzureStorageOptions
        {
            ConnectionString = "DefaultEndpointsProtocol=https;AccountName=foodbudgetstorage;AccountKey=test-key;EndpointSuffix=core.windows.net",
            ContainerName = "recipe-images"
        });

        // Setup mock chain: BlobServiceClient -> BlobContainerClient -> BlobClient
        _mockBlobServiceClient
            .Setup(x => x.GetBlobContainerClient(It.IsAny<string>()))
            .Returns(_mockBlobContainerClient.Object);

        _mockBlobContainerClient
            .Setup(x => x.GetBlobClient(It.IsAny<string>()))
            .Returns(_mockBlobClient.Object);

        _subjectUnderTest = new ImageUploadService(
            _mockBlobServiceClient.Object,
            _mockLogger.Object,
            _mockImageUploadOptions.Object,
            _mockAzureStorageOptions.Object
        );
    }

    #region Risk-Based Priority: Critical Security & Business Logic

    #region SAS Token Generation - Happy Path

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenReturnsSasTokenWithCorrectStructure()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000; // 5 MB

        // Mock BlobClient to return a Uri with SAS token
        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        var result = await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        result.Should().NotBeNull();
        result.UploadUrl.Should().NotBeNullOrEmpty();
        result.PublicUrl.Should().NotBeNullOrEmpty();
        result.ExpiresAt.Should().BeAfter(DateTimeOffset.UtcNow);

        // UploadUrl should contain SAS token query parameters
        result.UploadUrl.Should().Contain("sv="); // version
        result.UploadUrl.Should().Contain("sig="); // signature
        result.UploadUrl.Should().Contain("se="); // expiry
        result.UploadUrl.Should().Contain("sp="); // permissions

        // PublicUrl should NOT contain query parameters
        result.PublicUrl.Should().NotContain("?");
        result.PublicUrl.Should().Contain("foodbudgetstorage");
        result.PublicUrl.Should().Contain("recipe-images");
        result.PublicUrl.Should().Contain(userId);
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenTokenExpiresInFiveMinutes()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        var beforeCall = DateTimeOffset.UtcNow;

        // Act
        var result = await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        var afterCall = DateTimeOffset.UtcNow;
        var expectedExpiry = beforeCall.AddMinutes(5);

        result.ExpiresAt.Should().BeCloseTo(expectedExpiry, TimeSpan.FromSeconds(10)); // ±10 seconds tolerance
        result.ExpiresAt.Should().BeAfter(afterCall);
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenTokenHasCreateAndWritePermissions()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        BlobSasBuilder? capturedSasBuilder = null;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Callback<BlobSasBuilder>(builder => capturedSasBuilder = builder)
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedSasBuilder.Should().NotBeNull();
        var permissions = capturedSasBuilder!.Permissions;

        // Must have BOTH Create AND Write permissions (prevents large file upload failures)
        permissions.Should().Contain("c"); // Create
        permissions.Should().Contain("w"); // Write
        permissions.Should().NotContain("r"); // Should NOT have Read
        permissions.Should().NotContain("d"); // Should NOT have Delete
    }

    #endregion

    #region File Type Validation

    [Theory]
    [InlineData("image/jpeg")]
    [InlineData("image/png")]
    [InlineData("image/jpg")]
    [InlineData("IMAGE/JPEG")] // Case insensitive
    public async Task GenerateUploadTokenAsync_GivenValidFileType_WhenCalled_ThenDoesNotThrow(string contentType)
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const long fileSizeBytes = 5_000_000;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Theory]
    [InlineData("application/pdf")]
    [InlineData("image/gif")]
    [InlineData("text/plain")]
    [InlineData("video/mp4")]
    public async Task GenerateUploadTokenAsync_GivenInvalidFileType_WhenCalled_ThenThrowsArgumentException(string contentType)
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const long fileSizeBytes = 5_000_000;

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Only JPEG and PNG images are allowed*");
    }

    #endregion

    #endregion

    #region Boundaries

    #region File Size Validation

    [Theory]
    [InlineData(1)] // 1 byte
    [InlineData(5_000_000)] // 5 MB
    [InlineData(9_999_999)] // 9.99 MB
    [InlineData(10_485_760)] // Exactly 10 MB
    public async Task GenerateUploadTokenAsync_GivenFileSizeUnderOrAt10MB_WhenCalled_ThenDoesNotThrow(long fileSizeBytes)
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().NotThrowAsync();
    }

    [Theory]
    [InlineData(10_485_761)] // 10 MB + 1 byte
    [InlineData(20_000_000)] // 20 MB
    [InlineData(50_000_000)] // 50 MB
    public async Task GenerateUploadTokenAsync_GivenFileSizeOver10MB_WhenCalled_ThenThrowsArgumentException(long fileSizeBytes)
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*File size must be less than 10MB*");
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenFileSizeZero_WhenCalled_ThenThrowsArgumentException()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 0;

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*File cannot be empty*");
    }

    #endregion

    #region Clock Skew Protection

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenSasTokenStartsInPast()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        BlobSasBuilder? capturedSasBuilder = null;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Callback<BlobSasBuilder>(builder => capturedSasBuilder = builder)
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        var beforeCall = DateTimeOffset.UtcNow;

        // Act
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedSasBuilder.Should().NotBeNull();
        var expectedStartTime = beforeCall.AddMinutes(-5);

        capturedSasBuilder!.StartsOn.Should().BeCloseTo(expectedStartTime, TimeSpan.FromSeconds(10));
        capturedSasBuilder.StartsOn.Should().BeBefore(beforeCall); // Must be in the past
    }

    #endregion

    #endregion

    #region Business Rules

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenGeneratesGuidFilename()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        string? capturedBlobName = null;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobContainerClient
            .Setup(x => x.GetBlobClient(It.IsAny<string>()))
            .Callback<string>(blobName => capturedBlobName = blobName)
            .Returns(_mockBlobClient.Object);

        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedBlobName.Should().NotBeNullOrEmpty();
        capturedBlobName.Should().NotContain("photo"); // Should NOT use original filename

        // Extract filename from path (format: user-123/guid.jpg)
        var fileNamePart = Path.GetFileNameWithoutExtension(capturedBlobName!.Split('/').Last());

        // Should be a valid GUID format (8-4-4-4-12)
        Guid.TryParse(fileNamePart, out _).Should().BeTrue();
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenMultipleCalls_WhenCalled_ThenGeneratesUniqueFilenames()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        var capturedBlobNames = new List<string>();

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobContainerClient
            .Setup(x => x.GetBlobClient(It.IsAny<string>()))
            .Callback<string>(blobName => capturedBlobNames.Add(blobName))
            .Returns(_mockBlobClient.Object);

        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedBlobNames.Should().HaveCount(2);
        capturedBlobNames[0].Should().NotBe(capturedBlobNames[1]); // Must be unique
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenValidRequest_WhenCalled_ThenUsesUserSpecificFolder()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        string? capturedBlobName = null;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg");
        _mockBlobContainerClient
            .Setup(x => x.GetBlobClient(It.IsAny<string>()))
            .Callback<string>(blobName => capturedBlobName = blobName)
            .Returns(_mockBlobClient.Object);

        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.jpg?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        var result = await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedBlobName.Should().StartWith($"{userId}/");
        result.PublicUrl.Should().Contain($"/{userId}/");
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenPngFile_WhenCalled_ThenPreservesFileExtension()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.png";
        const string contentType = "image/png";
        const long fileSizeBytes = 5_000_000;

        string? capturedBlobName = null;

        var blobUri = new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.png");
        _mockBlobContainerClient
            .Setup(x => x.GetBlobClient(It.IsAny<string>()))
            .Callback<string>(blobName => capturedBlobName = blobName)
            .Returns(_mockBlobClient.Object);

        _mockBlobClient.Setup(x => x.Uri).Returns(blobUri);
        _mockBlobClient.Setup(x => x.GenerateSasUri(It.IsAny<BlobSasBuilder>()))
            .Returns(new Uri("https://foodbudgetstorage.blob.core.windows.net/recipe-images/user-123/guid.png?sv=2024-11-04&sig=test&se=2025-01-01&sp=cw"));

        // Act
        await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        capturedBlobName.Should().EndWith(".png");
    }

    #endregion

    #region Null/Empty/Invalid

    [Theory]
    [InlineData(null, "photo.jpg", "image/jpeg", 5_000_000)]
    [InlineData("", "photo.jpg", "image/jpeg", 5_000_000)]
    [InlineData("user-123", null, "image/jpeg", 5_000_000)]
    [InlineData("user-123", "", "image/jpeg", 5_000_000)]
    [InlineData("user-123", "photo.jpg", null, 5_000_000)]
    [InlineData("user-123", "photo.jpg", "", 5_000_000)]
    public async Task GenerateUploadTokenAsync_GivenNullOrEmptyParameters_WhenCalled_ThenThrowsArgumentException(
        string? userId, string? fileName, string? contentType, long fileSizeBytes)
    {
        // Arrange & Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId!, fileName!, contentType!, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenFileNameWithoutExtension_WhenCalled_ThenThrowsArgumentException()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo"; // No extension
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*File must have a valid extension*");
    }

    #endregion

    #region Errors

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenAzureBlobClientThrows_WhenCalled_ThenPropagatesException()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        _mockBlobServiceClient
            .Setup(x => x.GetBlobContainerClient(It.IsAny<string>()))
            .Throws(new RequestFailedException("Azure unavailable"));

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<RequestFailedException>()
            .WithMessage("*Azure unavailable*");
    }

    [Fact]
    public async Task GenerateUploadTokenAsync_GivenAzureBlobClientThrows_WhenCalled_ThenLogsError()
    {
        // Arrange
        const string userId = "user-123";
        const string fileName = "photo.jpg";
        const string contentType = "image/jpeg";
        const long fileSizeBytes = 5_000_000;

        var exception = new RequestFailedException("Azure unavailable");
        _mockBlobServiceClient
            .Setup(x => x.GetBlobContainerClient(It.IsAny<string>()))
            .Throws(exception);

        // Act
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadTokenAsync(userId, fileName, contentType, fileSizeBytes);

        // Assert
        await act.Should().ThrowAsync<RequestFailedException>();

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.Once);
    }

    #endregion
}