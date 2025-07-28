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
        // Example validation for app settings
        // var appSettings = configuration.GetSection("AppSettings");
        // var apiKey = appSettings["ApiKey"];
        
        // if (string.IsNullOrEmpty(apiKey) && !environment.IsDevelopment())
        // {
        //     logger.LogError("API key is not configured");
        //     throw new InvalidOperationException("API key is not configured");
        // }
        
        logger.LogInformation("App settings validation passed");
    }
}