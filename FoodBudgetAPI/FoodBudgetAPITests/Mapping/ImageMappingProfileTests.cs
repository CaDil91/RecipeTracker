using AutoMapper;
using FluentAssertions;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.Extensions.Logging.Abstractions;

namespace FoodBudgetAPITests.Mapping;

public class ImageMappingProfileTests
{
    private readonly IMapper _mapper;

    public ImageMappingProfileTests()
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<ImageMappingProfile>();
        }, NullLoggerFactory.Instance);

        _mapper = configuration.CreateMapper();
    }

    #region Configuration Tests

    [Fact]
    public void AutoMapper_Configuration_Should_Be_Valid()
    {
        // Act & Assert
        _mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }

    #endregion

    #region UploadTokenResponse to ImageUploadTokenResponseDto Tests

    [Fact]
    public void UploadTokenResponse_To_ImageUploadTokenResponseDto_Should_Map_All_Properties()
    {
        // Arrange
        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/test.jpg?sv=2024-11-04&se=...",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/test.jpg",
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(5)
        };

        // Act
        var dto = _mapper.Map<ImageUploadTokenResponseDto>(uploadToken);

        // Assert
        dto.UploadUrl.Should().Be(uploadToken.UploadUrl);
        dto.PublicUrl.Should().Be(uploadToken.PublicUrl);
        dto.ExpiresAt.Should().Be(uploadToken.ExpiresAt);
    }

    [Fact]
    public void UploadTokenResponse_To_ImageUploadTokenResponseDto_Should_Preserve_SAS_Query_Parameters()
    {
        // Arrange
        var sasUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/image.jpg?sv=2024-11-04&sr=b&sig=abc123&se=2024-12-31T23:59:59Z&sp=cw";
        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = sasUrl,
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/user123/image.jpg",
            ExpiresAt = new DateTimeOffset(2024, 12, 31, 23, 59, 59, TimeSpan.Zero)
        };

        // Act
        var dto = _mapper.Map<ImageUploadTokenResponseDto>(uploadToken);

        // Assert
        dto.UploadUrl.Should().Be(sasUrl);
        dto.UploadUrl.Should().Contain("sv=2024-11-04");
        dto.UploadUrl.Should().Contain("sr=b");
        dto.UploadUrl.Should().Contain("sig=abc123");
        dto.UploadUrl.Should().Contain("sp=cw");
    }

    [Fact]
    public void UploadTokenResponse_To_ImageUploadTokenResponseDto_Should_Handle_Different_Expiration_Times()
    {
        // Arrange
        var shortExpiry = DateTimeOffset.UtcNow.AddMinutes(5);
        var uploadToken = new UploadTokenResponse
        {
            UploadUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/test.jpg?sv=2024-11-04",
            PublicUrl = "https://foodbudgetstorage.blob.core.windows.net/recipe-images/test.jpg",
            ExpiresAt = shortExpiry
        };

        // Act
        var dto = _mapper.Map<ImageUploadTokenResponseDto>(uploadToken);

        // Assert
        dto.ExpiresAt.Should().Be(shortExpiry);
        dto.ExpiresAt.Should().BeCloseTo(DateTimeOffset.UtcNow.AddMinutes(5), TimeSpan.FromSeconds(1));
    }

    #endregion
}