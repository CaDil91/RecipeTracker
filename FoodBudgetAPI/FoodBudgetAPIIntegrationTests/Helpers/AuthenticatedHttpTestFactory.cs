using System.Security.Claims;
using System.Text.Encodings.Web;
using FoodBudgetAPI.Data;
using FoodBudgetAPI.Data.Repositories;
using FoodBudgetAPI.Mapping;
using FoodBudgetAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FoodBudgetAPIIntegrationTests.Helpers;

/// <summary>
/// Factory for integration tests that require authenticated HTTP requests with database access.
/// Combines HTTP controller setup, SQLite in-memory database, and test authentication for Microsoft Entra External ID.
/// </summary>
/// <type param name="TProgram">The entry point class of the web application to be tested.</typeparam>
public class AuthenticatedHttpTestFactory<TProgram> : HttpTestFactory<TProgram> where TProgram : class
{
    public const string TestAuthScheme = "TestAuth";
    private readonly SqliteConnection _connection;

    public AuthenticatedHttpTestFactory()
    {
        // Create persistent in-memory SQLite connection (must stay open for lifetime of factory)
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    protected override void ConfigureSpecificServices(IServiceCollection services)
    {
        // Call base to get HTTP/controller setup
        base.ConfigureSpecificServices(services);

        // Remove ALL database-related services (SQL Server and DbContext)
        // This includes EF Core internal services to prevent the "multiple providers" error
        RemoveServices(services, d =>
            d.ServiceType == typeof(DbContextOptions<FoodBudgetDbContext>) ||
            d.ServiceType == typeof(FoodBudgetDbContext) ||
            d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true ||
            (d.ServiceType.IsGenericType && d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>)));

        // Add DbContext with persistent SQLite connection for testing
        services.AddDbContext<FoodBudgetDbContext>(options =>
        {
            options.UseSqlite(_connection)
                .EnableSensitiveDataLogging(false)
                .EnableServiceProviderCaching(false);
        });

        // Ensure database is created with schema
        using (var context = new FoodBudgetDbContext(
            new DbContextOptionsBuilder<FoodBudgetDbContext>()
                .UseSqlite(_connection)
                .Options))
        {
            context.Database.EnsureCreated();
        }

        // Register application services (BaseTestFactory doesn't use Program.cs services)
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRecipeRepository, RecipeRepository>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IImageUploadService, ImageUploadService>();

        // Register AutoMapper with RecipeMappingProfile
        services.AddAutoMapper(_ => { }, typeof(RecipeMappingProfile));

        // Add test authentication and authorization
        services.AddAuthentication(defaultScheme: TestAuthScheme)
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                TestAuthScheme,
                options => { });

        services.AddAuthorization();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection?.Close();
            _connection?.Dispose();
        }
        base.Dispose(disposing);
    }
}

/// <summary>
/// Test authentication handler that authenticates requests with the "X-Test-UserId" header.
/// Mimics Microsoft Entra External ID JWT token structure with "oid", "name", and "email" claims.
/// This allows integration testing of authentication-protected endpoints without real JWT tokens.
/// </summary>
public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string UserIdHeaderName = "X-Test-UserId";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Check if the request has a test user ID header
        if (!Request.Headers.TryGetValue(UserIdHeaderName, out var userIdValue))
        {
            return Task.FromResult(AuthenticateResult.Fail("No test user ID provided"));
        }

        if (!Guid.TryParse(userIdValue.ToString(), out Guid userId))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid user ID format"));
        }

        // Create claims matching Microsoft Entra External ID JWT structure
        var claims = new[]
        {
            new Claim("oid", userId.ToString()), // Object ID - primary user identifier in External ID
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()), // Standard .NET claim
            new Claim("name", $"Test User {userId.ToString()[..8]}"), // Display name
            new Claim("email", $"testuser{userId.ToString()[..8]}@example.com"), // Email
            new Claim(ClaimTypes.Email, $"testuser{userId.ToString()[..8]}@example.com") // Standard .NET email claim
        };

        var identity = new ClaimsIdentity(claims, AuthenticatedHttpTestFactory<object>.TestAuthScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, AuthenticatedHttpTestFactory<object>.TestAuthScheme);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
