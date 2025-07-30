using FoodBudgetAPI.Controllers;
using Microsoft.Extensions.DependencyInjection;

namespace FoodBudgetAPIIntegrationTests.Helpers;

/// <summary>
/// Factory for HTTP-focused integration tests that need controller and middleware testing
/// </summary>
public class HttpTestFactory<TProgram> : BaseTestFactory<TProgram> where TProgram : class
{
    protected override void ConfigureSpecificServices(IServiceCollection services)
    {
        // Add test controller that throws an exception for the integration test
        services.AddControllers()
            .AddApplicationPart(typeof(TestExceptionController).Assembly);
            
        // Register health checks with minimal configuration to avoid DI issues
        services.AddHealthChecks();
    }
}