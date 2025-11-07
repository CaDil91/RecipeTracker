// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ServiceRegistrationExtensions.cs
using System.Diagnostics.CodeAnalysis;
using Azure.Storage.Blobs;
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

        // Azure Blob Storage
        services.AddSingleton(sp =>
        {
            var azureStorageOptions = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AzureStorageOptions>>().Value;
            return new BlobServiceClient(azureStorageOptions.ConnectionString);
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
        var serviceProvider = services.BuildServiceProvider();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();

        // Azure Storage configuration
        services.Configure<AzureStorageOptions>(configuration.GetSection(AzureStorageOptions.SECTION_NAME));

        // Image Upload configuration
        services.Configure<ImageUploadOptions>(configuration.GetSection(ImageUploadOptions.SECTION_NAME));
    }
}