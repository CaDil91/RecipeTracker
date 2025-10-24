using System.Diagnostics.CodeAnalysis;
using Asp.Versioning;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.Mvc;
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

        // Memory cache (required for rate limiting)
        builder.Services.AddMemoryCache();

        // Rate limiting
        ConfigureRateLimiting(builder);

        // Core services
        builder.Services.RegisterServices(builder.Configuration);
        builder.Services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                // Configure RFC 9457 compliant validation error responses
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Type = "https://foodbudgetapi.example.com/problems/validation-error",
                        Title = "Validation Error",
                        Status = StatusCodes.Status400BadRequest,
                        Detail = "One or more validation errors occurred.",
                        Instance = context.HttpContext.Request.Path,
                        Extensions =
                        {
                            ["timestamp"] = DateTimeOffset.UtcNow,
                            ["traceId"] = context.HttpContext.TraceIdentifier
                        }
                    };

                    return new BadRequestObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json" }
                    };
                };
            });
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

    private static void ConfigureRateLimiting(WebApplicationBuilder builder)
    {
        // Load configuration from appsettings.json
        builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));

        // Inject counter and rules stores
        builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
        builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
        builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();
    }
}