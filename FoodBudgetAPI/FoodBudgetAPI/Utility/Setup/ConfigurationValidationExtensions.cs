// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ConfigurationValidationExtensions.cs
using System.Diagnostics.CodeAnalysis;

namespace FoodBudgetAPI.Utility.Setup;

[ExcludeFromCodeCoverage]
public static class ConfigurationValidationExtensions
{
    public static IServiceCollection ValidateConfiguration(this IServiceCollection services)
    {
        // Get the configuration from the service collection
        var serviceProvider = services.BuildServiceProvider();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();
        var environment = serviceProvider.GetRequiredService<IWebHostEnvironment>();
        var logger = serviceProvider.GetRequiredService<ILogger<Program>>();
        
        // Validate required configuration settings
        ValidateConnectionStrings(configuration, environment, logger);
        ValidateAppSettings(configuration, environment, logger);
        
        return services;
    }
    
    private static void ValidateConnectionStrings(IConfiguration configuration, IWebHostEnvironment environment, ILogger logger)
    {
        // Example validation for connection strings
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        if (string.IsNullOrEmpty(connectionString) && !environment.IsDevelopment())
        {
            logger.LogError("Database connection string is not configured");
            throw new InvalidOperationException("Database connection string is not configured");
        }
        
        logger.LogInformation("Connection string validation passed");
    }
    
    private static void ValidateAppSettings(IConfiguration configuration, IWebHostEnvironment environment, ILogger logger)
    {
        // Validate Azure AD configuration
        ValidateAzureAdConfiguration(configuration, logger);

        logger.LogInformation("App settings validation passed");
    }

    /// <summary>
    /// Validates Azure AD / Entra External ID configuration at startup.
    /// Ensures all required authentication settings are present and properly formatted.
    /// </summary>
    /// <remarks>
    /// Microsoft.Identity.Web does NOT validate configuration at startup (GitHub issue #3001).
    /// Without this validation, the app starts successfully but authentication fails at runtime.
    /// This fail-fast approach prevents deployment of misconfigured applications.
    /// </remarks>
    private static void ValidateAzureAdConfiguration(IConfiguration configuration, ILogger logger)
    {
        var azureAdSection = configuration.GetSection("AzureAd");

        // Check if AzureAd section exists
        if (!azureAdSection.Exists())
        {
            throw new InvalidOperationException(
                "Azure AD authentication configuration is missing. " +
                "The 'AzureAd' configuration section is required. " +
                "Set via environment variables or user secrets:\n" +
                "  AzureAd__Instance=https://yoursubdomain.ciamlogin.com/\n" +
                "  AzureAd__TenantId=<your-tenant-guid>\n" +
                "  AzureAd__ClientId=<your-client-guid>");
        }

        // Get configuration values
        var instance = azureAdSection["Instance"];
        var tenantId = azureAdSection["TenantId"];
        var clientId = azureAdSection["ClientId"];

        // Validate Instance (Authority URL)
        if (string.IsNullOrWhiteSpace(instance))
        {
            throw new InvalidOperationException(
                "Azure AD Instance is not configured. " +
                "Set via environment variable: AzureAd__Instance=https://yoursubdomain.ciamlogin.com/");
        }

        ValidateInstanceFormat(instance);

        // Validate TenantId (Directory ID)
        if (string.IsNullOrWhiteSpace(tenantId))
        {
            throw new InvalidOperationException(
                "Azure AD TenantId is not configured. " +
                "Set via environment variable: AzureAd__TenantId=<your-tenant-guid>");
        }

        if (!Guid.TryParse(tenantId, out _))
        {
            throw new InvalidOperationException(
                $"Invalid Azure AD TenantId format: '{tenantId}'. " +
                "TenantId must be a valid GUID. " +
                "Example: 644a9317-ded3-439a-8f0a-9a8491ce35e9");
        }

        // Validate ClientId (Application ID)
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException(
                "Azure AD ClientId is not configured. " +
                "Set via environment variable: AzureAd__ClientId=<your-client-guid>");
        }

        if (!Guid.TryParse(clientId, out _))
        {
            throw new InvalidOperationException(
                $"Invalid Azure AD ClientId format: '{clientId}'. " +
                "ClientId must be a valid GUID. " +
                "Example: 877ea87e-5be9-4102-9959-6763e3fdf243");
        }

        logger.LogInformation(
            "Azure AD configuration validation passed. Instance: {Instance}, TenantId: {TenantId}",
            instance,
            tenantId);
    }

    /// <summary>
    /// Validates the format of the Azure AD Instance URL for Entra External ID.
    /// </summary>
    private static void ValidateInstanceFormat(string instance)
    {
        // Entra External ID uses ciamlogin.com domain (not login.microsoftonline.com)
        var validInstancePattern = new System.Text.RegularExpressions.Regex(
            @"^https://[a-zA-Z0-9-]+\.ciamlogin\.com/?$",
            System.Text.RegularExpressions.RegexOptions.Compiled);

        if (!validInstancePattern.IsMatch(instance))
        {
            throw new InvalidOperationException(
                $"Invalid Azure AD Instance format: '{instance}'. " +
                "For Entra External ID, Instance must match pattern: https://<subdomain>.ciamlogin.com/ " +
                "Example: https://foodbudget.ciamlogin.com/ " +
                "Note: If migrating to Azure AD or Azure AD B2C, update validation in ConfigurationValidationExtensions.cs");
        }
    }
}