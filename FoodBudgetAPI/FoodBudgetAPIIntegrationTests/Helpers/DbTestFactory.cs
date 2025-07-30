using System.Diagnostics.CodeAnalysis;
using FoodBudgetAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Data.Sqlite;

namespace FoodBudgetAPIIntegrationTests.Helpers;

[ExcludeFromCodeCoverage]
public class DbTestFactory<TProgram> : BaseTestFactory<TProgram> where TProgram : class
{
    public FoodBudgetDbContext CreateContext()
    {
        // Create a proper SQLite in-memory connection
        var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open(); // Keep connection open to maintain in-memory database
        
        var options = new DbContextOptionsBuilder<FoodBudgetDbContext>()
            .UseSqlite(connection)
            .EnableSensitiveDataLogging(false)
            .EnableServiceProviderCaching(false)
            .Options;
            
        var context = new FoodBudgetDbContext(options);
        
        // Ensure the database is created
        context.Database.EnsureCreated();
        
        return context;
    }

    protected override void ConfigureSpecificServices(IServiceCollection services)
    {
        // Remove existing DbContext registrations
        var descriptors = services.Where(d => 
            d.ServiceType == typeof(DbContextOptions<FoodBudgetDbContext>) ||
            d.ServiceType == typeof(FoodBudgetDbContext) ||
            (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
        ).ToList();
        
        foreach (var descriptor in descriptors)
        {
            services.Remove(descriptor);
        }
        
        // Add DbContext with SQLite for testing
        services.AddDbContext<FoodBudgetDbContext>(options =>
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();
            options.UseSqlite(connection)
                   .EnableSensitiveDataLogging(false)
                   .EnableServiceProviderCaching(false);
        });
    }
}