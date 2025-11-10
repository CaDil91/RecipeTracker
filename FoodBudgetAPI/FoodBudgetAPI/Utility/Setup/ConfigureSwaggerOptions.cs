using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FoodBudgetAPI.Utility.Setup;

public class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider, IConfiguration configuration) : IConfigureOptions<SwaggerGenOptions>
{
    /// <summary>
    /// Configures the Swagger generation options for the API.
    /// </summary>
    /// <param name="options">The Swagger generation options to be configured.</param>
    public void Configure(SwaggerGenOptions options)
    {
        foreach (ApiVersionDescription description in provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(
                description.GroupName,
                new OpenApiInfo
                {
                    Title = "Food Budget API",
                    Version = description.ApiVersion.ToString(),
                    Description = "API for managing food budgets with Microsoft External ID (CIAM) authentication"
                });
        }

        // Get Azure AD configuration
        string? instance = configuration["AzureAd:Instance"];
        string? tenantId = configuration["AzureAd:TenantId"];
        string? clientId = configuration["AzureAd:ClientId"];

        if (!string.IsNullOrEmpty(instance) && !string.IsNullOrEmpty(tenantId) && !string.IsNullOrEmpty(clientId))
        {
            // Add OAuth2 security definition for Microsoft External ID (CIAM)
            options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.OAuth2,
                Flows = new OpenApiOAuthFlows
                {
                    AuthorizationCode = new OpenApiOAuthFlow
                    {
                        AuthorizationUrl = new Uri($"{instance}{tenantId}/oauth2/v2.0/authorize"),
                        TokenUrl = new Uri($"{instance}{tenantId}/oauth2/v2.0/token"),
                        Scopes = new Dictionary<string, string>
                        {
                            { $"api://{clientId}/access_as_user", "Access API as signed-in user" }
                        }
                    }
                },
                Description = "Microsoft External ID (CIAM) OAuth2 Authorization Code Flow"
            });

            // Make all endpoints require authentication
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "oauth2"
                        }
                    },
                    [$"api://{clientId}/access_as_user"]
                }
            });
        }
    }
}