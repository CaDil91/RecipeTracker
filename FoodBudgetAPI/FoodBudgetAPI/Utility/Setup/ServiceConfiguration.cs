using System.Diagnostics.CodeAnalysis;
using Asp.Versioning;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FoodBudgetAPI.Utility.Setup;

/// <summary>
/// Handles application service configuration
/// </summary>
[ExcludeFromCodeCoverage]
public static class ServiceConfiguration
{
    /// <summary>
    /// Configures all services for the application
    /// </summary>
    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        // Configuration
        if (builder.Environment.IsDevelopment()) 
        {
            builder.Configuration.AddUserSecrets<Program>();
        }
        
        // Logging
        ConfigureLogging(builder);
        
        // Core services
        builder.Services.RegisterServices(builder.Configuration);
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        
        // CORS
        ConfigureCors(builder);
        
        // Health checks
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());
        
        // API versioning
        ConfigureApiVersioning(builder.Services);
        
        // Swagger documentation
        ConfigureSwagger(builder.Services);
        
        // Validate all configuration
        builder.Services.ValidateConfiguration();
    }
    
    private static void ConfigureLogging(WebApplicationBuilder builder)
    {
        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        builder.Logging.AddDebug();
    }
    
    private static void ConfigureCors(WebApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("MobileApp", policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
    }
    
    private static void ConfigureApiVersioning(IServiceCollection services)
    {
        services.AddApiVersioning(options =>
        {
            options.ReportApiVersions = true;
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.ApiVersionReader = new UrlSegmentApiVersionReader();
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });
    }
    
    private static void ConfigureSwagger(IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            string xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);
        });
        
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
    }
}