// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ServiceRegistrationExtensions.cs
using System.Diagnostics.CodeAnalysis;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using FoodBudgetAPI.Configuration;
using FoodBudgetAPI.Data;
using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace FoodBudgetAPI.Utility.Setup;

[ExcludeFromCodeCoverage]
public static class ServiceRegistrationExtensions
{
    public static void RegisterServices(this IServiceCollection services, ConfigurationManager builderConfiguration)
    {
        RegisterInfrastructureServices(services, builderConfiguration);
        RegisterApplicationServices(services);
        RegisterConfigurationOptions(services);
    }
    
    private static void RegisterInfrastructureServices(IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<FoodBudgetDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRecipeRepository, RecipeRepository>();

        services.AddAutoMapper(_ => { }, typeof(RecipeMappingProfile));

        // Azure Blob Storage with DefaultAzureCredential (Managed Identity + Local Dev)
        services.AddSingleton(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<BlobServiceClient>>();
            var configuration = sp.GetRequiredService<IConfiguration>();
            AzureStorageOptions azureStorageOptions = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AzureStorageOptions>>().Value;

            var blobEndpoint = new Uri($"https://{azureStorageOptions.AccountName}.blob.core.windows.net");
            var blobServiceClient = new BlobServiceClient(blobEndpoint, new DefaultAzureCredential());

            // Configure CORS
            ConfigureBlobStorageCorsAsync(blobServiceClient, configuration, logger).GetAwaiter().GetResult();

            return blobServiceClient;
        });
    }
    
    private static void RegisterApplicationServices(IServiceCollection services)
    {
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IImageUploadService, ImageUploadService>();
    }
    
    private static void RegisterConfigurationOptions(IServiceCollection services)
    {
        // Get the configuration from the service provider
        ServiceProvider serviceProvider = services.BuildServiceProvider();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();

        // Azure Storage configuration
        services.Configure<AzureStorageOptions>(configuration.GetSection(AzureStorageOptions.SECTION_NAME));

        // Image Upload configuration
        services.Configure<ImageUploadOptions>(configuration.GetSection(ImageUploadOptions.SECTION_NAME));
    }

    /// <summary>
    /// Configures CORS for Azure Blob Storage to allow browser uploads from web clients
    /// </summary>
    private static async Task ConfigureBlobStorageCorsAsync(
        BlobServiceClient blobServiceClient,
        IConfiguration configuration,
        ILogger logger)
    {
        try
        {
            logger.LogInformation("Configuring CORS for Azure Blob Storage...");

            // Get allowed origins from configuration
            var allowedOrigins = configuration["AzureStorage:AllowedOrigins"]
                ?? "http://localhost:8081,https://cadil91.github.io";

            var corsRule = new BlobCorsRule
            {
                AllowedOrigins = allowedOrigins,
                AllowedMethods = "GET,PUT,OPTIONS",
                AllowedHeaders = "*",
                ExposedHeaders = "*",
                MaxAgeInSeconds = 3600
            };

            var properties = await blobServiceClient.GetPropertiesAsync();
            properties.Value.Cors.Clear();
            properties.Value.Cors.Add(corsRule);

            await blobServiceClient.SetPropertiesAsync(properties.Value);

            logger.LogInformation(
                "CORS configured successfully for origins: {AllowedOrigins}",
                allowedOrigins);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to configure CORS for Azure Blob Storage");
            // Don't throw - allow app to start even if CORS config fails
        }
    }
}