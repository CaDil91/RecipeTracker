// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ServiceRegistrationExtensions.cs
using System.Diagnostics.CodeAnalysis;
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
    }
    
    private static void RegisterApplicationServices(IServiceCollection services)
    {
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