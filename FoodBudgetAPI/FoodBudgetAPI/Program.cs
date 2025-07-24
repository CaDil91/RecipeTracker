using System.Diagnostics.CodeAnalysis;
using Asp.Versioning;
using FoodBudgetAPI.Utility.Setup;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;

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
        builder.Services.AddHealthChecks().AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy());

        // Add API versioning services
        builder.Services.AddApiVersioning(options =>
        {
            options.ReportApiVersions = true; // Return API version info in response headers
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.DefaultApiVersion = new ApiVersion(1, 0);
            
            // Support multiple versioning schemes
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new QueryStringApiVersionReader("api-version"),
                new HeaderApiVersionReader("X-Version"),
                new MediaTypeApiVersionReader("v"));
        })
        .AddApiExplorer(options =>
        {
            // Format version as "'v'major[.minor]"
            options.GroupNameFormat = "'v'VVV";
            
            // Substitute version in the URL path
            options.SubstituteApiVersionInUrl = true;
        });

        // Configure Swagger to support versioning
        builder.Services.AddSwaggerGen(options =>
        {
            // XML comments configuration
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            string xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);

        });
        builder.Services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();

        WebApplication app = ApplicationConfiguration.ConfigureApplicationPipeline(builder);

        app.Run();
    }
    
}