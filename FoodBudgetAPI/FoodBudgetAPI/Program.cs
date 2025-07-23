using System.Diagnostics.CodeAnalysis;
using FoodBudgetAPI.Middleware;
using Microsoft.OpenApi.Models;

namespace FoodBudgetAPI;

[ExcludeFromCodeCoverage]
public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // Configure built-in logging
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();

        // Add services to the container
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "Food Budget API",
                Description = "API for managing food budgets",
                Version = "v1"
            });
            
            // Include XML comments from automatically generated documentation file for Swagger UI display
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            string xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            c.IncludeXmlComments(xmlPath);
        });

        // CORS configuration
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("MobileApp", policy =>
            {
                if (builder.Environment.IsDevelopment())
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                }
                else
                {
                    // TODO: If no WebViews are used, don't need a specific origin
                    // Future to implement JWT authentication and/or API keys
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();

                }
            });
        });

        // Health checks
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

        WebApplication app = builder.Build();

        // Configure the HTTP request pipeline
        // The order in which you register middleware is crucial. Each middleware gets a chance to process the
        // request in the order registered, and then process the response in reverse order.
        // The middleware pipeline creates a nested structure like Russian dolls. Each middleware wraps
        // around all subsequent middleware.
        // 1. Exception handling should be the first to catch any errors in subsequent middleware
        app.UseGlobalExceptionHandler();
        
        // 2. Request/response logging early in the pipeline
        app.UseRequestResponseLogging();
        
        // 3. Development-specific middleware
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // 4. Security and routing middleware
        app.UseHttpsRedirection();
        app.UseCors("MobileApp");
        
        // 5. Authentication and authorization would go here if implemented
        // app.UseAuthentication();
        // app.UseAuthorization();

        // 6. Endpoints
        app.MapControllers();
        app.MapHealthChecks("/health");

        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Food Budget API starting up...");

        app.Run();
    }
}