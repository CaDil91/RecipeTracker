using Asp.Versioning;
using AutoMapper;
using FoodBudgetAPI.Extensions;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodBudgetAPI.Controllers;

[Authorize]
[ApiController]
[ApiVersion(1)]
[Route("api/[controller]")]
public class ImagesController(IImageUploadService imageUploadService, ILogger<ImagesController> logger, IMapper mapper) : ControllerBase
{
    private readonly IImageUploadService _imageUploadService = imageUploadService ?? throw new ArgumentNullException(nameof(imageUploadService));
    private readonly ILogger<ImagesController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    private readonly IMapper _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));

    /// <summary>
    /// Generates a secure upload token for uploading an image to Azure Blob Storage
    /// </summary>
    /// <param name="request">Image upload request containing file metadata</param>
    /// <returns>Upload token with SAS URL, public URL, and expiration time</returns>
    /// <response code="200">Returns the upload token</response>
    /// <response code="400">If the request is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpPost("upload-token")]
    [ProducesResponseType(typeof(ImageUploadTokenResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GenerateUploadToken([FromBody] ImageUploadTokenRequestDto request)
    {
        // Extract user ID from JWT token (throws if invalid - handled by global exception middleware)
        Guid userId = HttpContext.User.GetUserIdAsGuid();
        _logger.LogInformation(
            "Generating upload token for user: {UserId}, file: {FileName}, size: {FileSize} bytes",
            userId, request.FileName, request.FileSizeBytes);

        // Generate upload token using User Delegation SAS (Azure AD-signed)
        UploadTokenResponse uploadToken = await _imageUploadService.GenerateUploadTokenAsync(
            userId.ToString(),
            request.FileName,
            request.ContentType,
            request.FileSizeBytes);

        _logger.LogInformation(
            "Upload token generated successfully for user: {UserId}, expires at: {ExpiresAt}",
            userId, uploadToken.ExpiresAt);

        var responseDto = _mapper.Map<ImageUploadTokenResponseDto>(uploadToken);
        return Ok(responseDto);
    }
}