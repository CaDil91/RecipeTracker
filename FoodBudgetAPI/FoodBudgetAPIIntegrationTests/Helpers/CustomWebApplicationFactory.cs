using FoodBudgetAPI.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace FoodBudgetAPIIntegrationTests.Helpers;

// ReSharper disable once ClassNeverInstantiated.Global
public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        // Add a test controller that throws an exception for the integration test
        builder.ConfigureServices(services =>
        {
            services.AddControllers()
                .AddApplicationPart(typeof(TestExceptionController).Assembly);
        });
    }
}