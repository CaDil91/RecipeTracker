using System.Security.Claims;
using Microsoft.Identity.Web;

namespace FoodBudgetAPI.Extensions;

/// <summary>
/// Extension methods for ClaimsPrincipal to extract user identity information from JWT tokens
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Extracts the user ID from the JWT token and returns it as a Guid
    /// </summary>
    /// <param name="user">The ClaimsPrincipal from the authenticated request</param>
    /// <returns>The user ID as a Guid</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when user ID is not found in token</exception>
    /// <exception cref="InvalidOperationException">Thrown when a user ID format is invalid</exception>
    public static Guid GetUserIdAsGuid(this ClaimsPrincipal user)
    {
        // GetObjectId() returns the 'oid' claim from Microsoft Entra External ID tokens
        string? userIdString = user.GetObjectId();
        if (string.IsNullOrEmpty(userIdString)) throw new UnauthorizedAccessException("User ID not found in token");
        if (!Guid.TryParse(userIdString, out Guid userId)) throw new InvalidOperationException("Invalid user ID format in token");
        return userId;
    }
}