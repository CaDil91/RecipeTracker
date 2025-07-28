// FoodBudgetAPI/FoodBudgetAPI/Utility/Setup/ServiceRegistrationExtensions.cs
using System.Diagnostics.CodeAnalysis;

namespace FoodBudgetAPI.Utility.Setup;

[ExcludeFromCodeCoverage]
public static class ServiceRegistrationExtensions
{
    public static IServiceCollection RegisterServices(this IServiceCollection services)
    {
        // Register application services
        RegisterInfrastructureServices(services);
        RegisterApplicationServices(services);
        RegisterConfigurationOptions(services);
        
        return services;
    }
    
    private static void RegisterInfrastructureServices(IServiceCollection services)
    {
        // Register database contexts, repositories, and other infrastructure services
        // Example:
        // services.AddDbContext<FoodBudgetDbContext>(options => 
        //     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
        // services.AddScoped<IFoodRepository, FoodRepository>();
    }
    
    private static void RegisterApplicationServices(IServiceCollection services)
    {
        // Register application services, managers, and other business logic components
        // Example:
        // services.AddScoped<IFoodService, FoodService>();
        // services.AddScoped<IBudgetCalculator, BudgetCalculator>();
    }
    
    private static void RegisterConfigurationOptions(IServiceCollection services)
    {
        // Bind configuration sections to strongly-typed options
        // Example:
        // services.Configure<AppSettings>(services.BuildServiceProvider().GetRequiredService<IConfiguration>().GetSection("AppSettings"));
        // services.Configure<ConnectionStrings>(services.BuildServiceProvider().GetRequiredService<IConfiguration>().GetSection("ConnectionStrings"));
    }
}