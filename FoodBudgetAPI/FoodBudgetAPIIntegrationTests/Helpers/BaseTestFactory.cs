using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FoodBudgetAPIIntegrationTests.Helpers;

/// <summary>
/// Abstract base class providing a factory for creating a web application instance to be used in integration tests.
/// Designed to streamline the setup process for derived test factories while allowing customization of specific services.
/// </summary>
/// <typeparam name="TProgram">The entry point class of the web application to be tested.</typeparam>
[ExcludeFromCodeCoverage]
public abstract class BaseTestFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            // Configure minimal logging for tests to reduce noise
            services.AddLogging(logging =>
            {
                logging.ClearProviders();
                logging.SetMinimumLevel(LogLevel.Warning); // Only show warnings and errors
                logging.AddConsole();
            });
            
            // Let derived classes configure specific services
            ConfigureSpecificServices(services);
        });

        // Suppress startup logs for cleaner test output
        builder.ConfigureLogging(logging =>
        {
            logging.ClearProviders();
            logging.SetMinimumLevel(LogLevel.Warning);
        });
    }

    /// <summary>
    /// Allows derived classes to configure services specific to their test scenarios.
    /// This method should be overridden in a derived class to add or replace services in the DI container
    /// required for testing specific functionalities of the application.
    /// </summary>
    /// <param name="services">The service collection provided by the base class, allowing the addition, replacement, or removal of services.</param>
    protected abstract void ConfigureSpecificServices(IServiceCollection services);

    /// <summary>
    /// Helper method to remove a service descriptor from the service collection.
    /// Useful for replacing services with test doubles.
    /// </summary>
    /// <typeparam name="TService">The service type to remove</typeparam>
    /// <param name="services">The service collection</param>
    protected static void RemoveService<TService>(IServiceCollection services)
    {
        ServiceDescriptor? descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(TService));
        if (descriptor != null)
        {
            services.Remove(descriptor);
        }
    }

    /// <summary>
    /// Helper method to remove all service descriptors matching a predicate.
    /// Useful for removing multiple related services.
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="predicate">Predicate to match services to remove</param>
    protected static void RemoveServices(IServiceCollection services, Func<ServiceDescriptor, bool> predicate)
    {
        ServiceDescriptor[] descriptors = services.Where(predicate).ToArray();
        foreach (ServiceDescriptor descriptor in descriptors)
        {
            services.Remove(descriptor);
        }
    }
}