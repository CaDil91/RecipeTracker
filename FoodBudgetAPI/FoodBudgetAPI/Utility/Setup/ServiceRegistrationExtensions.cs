// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ServiceRegistrationExtensions.cs
using System.Diagnostics.CodeAnalysis;
using FoodBudgetAPI.Data;
using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Services;
using Microsoft.EntityFrameworkCore;

namespace FoodBudgetAPI.Utility.Setup;

[ExcludeFromCodeCoverage]
public static class ServiceRegistrationExtensions
{
    public static IServiceCollection RegisterServices(this IServiceCollection services, ConfigurationManager builderConfiguration)
    {
        // Register application services
        RegisterInfrastructureServices(services, builderConfiguration);
        RegisterApplicationServices(services);
        RegisterConfigurationOptions(services);
        
        return services;
    }
    
    private static void RegisterInfrastructureServices(IServiceCollection services, IConfiguration configuration)
    {
        // Register database contexts, repositories, and other infrastructure services
        // Example:
        // services.AddDbContext<FoodBudgetDbContext>(options => 
        //     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        // services.AddScoped<IFoodRepository, FoodRepository>();
        
        services.AddDbContext<FoodBudgetDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRecipeRepository, RecipeRepository>();
    }
    
    private static void RegisterApplicationServices(IServiceCollection services)
    {
        // Register application services, managers, and other business logic components
        services.AddScoped<IRecipeService, RecipeService>();
    }
    
    private static void RegisterConfigurationOptions(IServiceCollection services)
    {
        // Bind configuration sections to strongly-typed options
        // Example:
        // services.Configure<AppSettings>(services.BuildServiceProvider().GetRequiredService<IConfiguration>().GetSection("AppSettings"));
        // services.Configure<ConnectionStrings>(services.BuildServiceProvider().GetRequiredService<IConfiguration>().GetSection("ConnectionStrings"));
    }
}