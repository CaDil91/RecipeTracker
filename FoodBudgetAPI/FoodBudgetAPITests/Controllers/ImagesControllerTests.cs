using System.Security.Claims;
using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Controllers;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Controllers;

public class ImagesControllerTests
{
    private readonly Mock<ILogger<ImagesController>> _mockLogger;
    private readonly IMapper _mapper;
    private readonly Mock<IImageUploadService> _mockImageUploadService;
    private readonly ImagesController _subjectUnderTest;
    private readonly Guid _testUserId = Guid.NewGuid();

    public ImagesControllerTests()
    {
        _mockImageUploadService = new Mock<IImageUploadService>();
        _mockLogger = new Mock<ILogger<ImagesController>>();

        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<ImageMappingProfile>();
        }, Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance);
        _mapper = configuration.CreateMapper();

        _subjectUnderTest = new ImagesController(_mockImageUploadService.Object, _mockLogger.Object, _mapper);

        // Set up an authenticated user with 'oid' claim (required for GetUserIdAsGuid())
        SetupAuthenticatedUser(_testUserId);
    }

    private void SetupAuthenticatedUser(Guid userId)
    {
        var claims = new List<Claim>
        {
            new Claim("oid", userId.ToString()),
            new Claim("email", "test@example.com")
        };

        var identity = new ClaimsIdentity(claims, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    #region Risk-Based Priority (Constructor Tests - Prevent Runtime Errors)

    [Fact]
    public void Constructor_WithNullService_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new ImagesController(null!, _mockLogger.Object, _mapper); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("imageUploadService");
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new ImagesController(_mockImageUploadService.Object, null!, _mapper); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("logger");
    }

    [Fact]
    public void Constructor_WithNullMapper_ThrowsArgumentNullException()
    {
        // Act
        Action act = () => { _ = new ImagesController(_mockImageUploadService.Object, _mockLogger.Object, null!); };

        // Assert
        act.Should().Throw<ArgumentNullException>().And.ParamName.Should().Be("mapper");
    }

    [Fact]
    public void Constructor_WithValidParameters_CreatesInstance()
    {
        // Act
        var controller = new ImagesController(_mockImageUploadService.Object, _mockLogger.Object, _mapper);

        // Assert
        controller.Should().NotBeNull();
    }

    #endregion

    #region Happy Path - POST /api/images/upload-token

    [Fact]
    public async Task Given_ValidJpegRequest_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "recipe-photo.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 2097152 // 2MB
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/{_testUserId}/recipe-photo.jpg?sv=2024-11-04&se=...",
            PublicUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/{_testUserId}/recipe-photo.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        _mockImageUploadService.Verify(
            x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes),
            Times.Once);

        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<ImageUploadTokenResponseDto>();

        var responseDto = (ImageUploadTokenResponseDto)okResult.Value!;
        responseDto.UploadUrl.Should().Be(uploadToken.UploadUrl);
        responseDto.PublicUrl.Should().Be(uploadToken.PublicUrl);
        responseDto.ExpiresAt.Should().Be(uploadToken.ExpiresAt);
    }

    [Fact]
    public async Task Given_ValidPngRequest_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "recipe-screenshot.png",
            ContentType = "image/png",
            FileSizeBytes = 1536000 // 1.5MB
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/recipe-screenshot.png?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/recipe-screenshot.png",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeOfType<ImageUploadTokenResponseDto>();
    }

    #endregion

    #region Null/Empty/Invalid Input

    [Fact]
    public void Given_UserHasNoOidClaim_When_GenerateUploadToken_Then_ThrowsUnauthorizedAccessException()
    {
        // Arrange - Create user without 'oid' claim
        var claimsWithoutOid = new List<Claim>
        {
            new Claim("email", "test@example.com")
        };
        var identity = new ClaimsIdentity(claimsWithoutOid, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        var request = new ImageUploadTokenRequestDto
        {
            FileName = "test.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        // Act & Assert
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadToken(request);
        act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("User ID not found in token");
    }

    [Fact]
    public void Given_OidClaimIsInvalidGuid_When_GenerateUploadToken_Then_ThrowsInvalidOperationException()
    {
        // Arrange - Create user with invalid 'oid' claim (not a GUID)
        var claimsWithInvalidOid = new List<Claim>
        {
            new Claim("oid", "not-a-valid-guid-format"),
            new Claim("email", "test@example.com")
        };
        var identity = new ClaimsIdentity(claimsWithInvalidOid, "TestAuthentication");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _subjectUnderTest.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        var request = new ImageUploadTokenRequestDto
        {
            FileName = "test.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        // Act & Assert
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadToken(request);
        act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Invalid user ID format in token");
    }

    #endregion

    #region Boundaries

    [Fact]
    public async Task Given_MinimumFileSize_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange - Test boundary: minimum file size (1 byte)
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "tiny-pixel.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1 // 1 byte (minimum allowed by validation)
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/tiny-pixel.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/tiny-pixel.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        _mockImageUploadService.Verify(
            x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes),
            Times.Once);
    }

    [Fact]
    public async Task Given_MaximumFileSize_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange - Test boundary: maximum file size (10MB)
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "high-res-photo.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 10485760 // 10MB (maximum allowed by validation)
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/high-res-photo.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/high-res-photo.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        _mockImageUploadService.Verify(
            x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes),
            Times.Once);
    }

    [Fact]
    public async Task Given_MinimumFileNameLength_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange - Test boundary: minimum file name length (1 character + extension)
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "a.jpg", // 1 character name + extension
            ContentType = "image/jpeg",
            FileSizeBytes = 1024
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/a.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/a.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task Given_MaximumFileNameLength_When_GenerateUploadToken_Then_ReturnsOkWithUploadToken()
    {
        // Arrange - Test boundary: maximum file name length (255 characters)
        var longFileName = new string('a', 250) + ".jpg"; // 255 total characters
        var request = new ImageUploadTokenRequestDto
        {
            FileName = longFileName,
            ContentType = "image/jpeg",
            FileSizeBytes = 1024
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/{longFileName}?sv=2024-11-04",
            PublicUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/{longFileName}",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    #endregion

    #region Business Rules

    [Fact]
    public async Task Given_ValidRequest_When_GenerateUploadToken_Then_ExtractsUserIdFromJwtToken()
    {
        // Arrange - Business rule: UserId must come from JWT, not request body
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "secure-upload.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 2097152
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/{_testUserId}/secure-upload.jpg?sv=2024-11-04",
            PublicUrl = $"https://foodbudgetstorage.blob.core.windows.net/recipe-images/{_testUserId}/secure-upload.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert - Verify user ID was extracted from JWT and passed to service
        _mockImageUploadService.Verify(
            x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes),
            Times.Once,
            "Controller must extract userId from JWT token for security (Story 5.5)");

        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
    }

    [Fact]
    public async Task Given_ValidRequest_When_GenerateUploadToken_Then_ReturnsSasUrlWithQueryParameters()
    {
        // Arrange - Business rule: Upload URL must contain SAS query parameters for authentication
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "authenticated-upload.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/authenticated-upload.jpg?sv=2024-11-04&sr=b&sig=abc123&se=2024-12-31T23:59:59Z&sp=cw",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/authenticated-upload.jpg",
            ExpiresAt = new DateTimeOffset(2024, 12, 31, 23, 59, 59, TimeSpan.Zero)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert - Business rule: SAS URL must have query parameters
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var responseDto = okResult.Value.Should().BeOfType<ImageUploadTokenResponseDto>().Subject;

        responseDto.UploadUrl.Should().Contain("?", "Upload URL must contain SAS query parameters");
        responseDto.UploadUrl.Should().Contain("sv=", "SAS URL must include API version");
        responseDto.UploadUrl.Should().Contain("sig=", "SAS URL must include signature for authentication");
        responseDto.UploadUrl.Should().Contain("sp=", "SAS URL must include permissions");
    }

    [Fact]
    public async Task Given_ValidRequest_When_GenerateUploadToken_Then_PublicUrlHasNoSasToken()
    {
        // Arrange - Business rule: Public URL should NOT contain SAS token (for display only)
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "public-display.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/public-display.jpg?sv=2024-11-04&sig=secret",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/public-display.jpg", // No query params
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        IActionResult result = await _subjectUnderTest.GenerateUploadToken(request);

        // Assert - Business rule: Public URL must NOT have SAS token
        OkObjectResult? okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var responseDto = okResult.Value.Should().BeOfType<ImageUploadTokenResponseDto>().Subject;

        responseDto.PublicUrl.Should().NotContain("?", "Public URL should not contain query parameters");
        responseDto.PublicUrl.Should().NotContain("sv=", "Public URL should not contain SAS version");
        responseDto.PublicUrl.Should().NotContain("sig=", "Public URL should not contain signature");
    }

    #endregion

    #region Errors

    [Fact]
    public async Task Given_ServiceThrowsException_When_GenerateUploadToken_Then_ExceptionPropagates()
    {
        // Arrange
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "error-test.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ThrowsAsync(new InvalidOperationException("Azure storage service unavailable"));

        // Act & Assert
        Func<Task> act = async () => await _subjectUnderTest.GenerateUploadToken(request);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Azure storage service unavailable");
    }

    [Fact]
    public async Task Given_ValidRequest_When_GenerateUploadToken_Then_LogsStartInformation()
    {
        // Arrange
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "log-test.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/log-test.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/log-test.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Generating upload token for user:")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once,
            "Controller should log when starting token generation");
    }

    [Fact]
    public async Task Given_ValidRequest_When_GenerateUploadToken_Then_LogsCompletionInformation()
    {
        // Arrange
        var request = new ImageUploadTokenRequestDto
        {
            FileName = "completion-test.jpg",
            ContentType = "image/jpeg",
            FileSizeBytes = 1048576
        };

        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/completion-test.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/completion-test.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        _mockImageUploadService
            .Setup(x => x.GenerateUploadTokenAsync(_testUserId.ToString(), request.FileName, request.ContentType, request.FileSizeBytes))
            .ReturnsAsync(uploadToken);

        // Act
        await _subjectUnderTest.GenerateUploadToken(request);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Upload token generated successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once,
            "Controller should log when token generation completes successfully");
    }

    #endregion
}