using Asp.Versioning.ApiExplorer;
using FoodBudgetAPI.Middleware;

namespace FoodBudgetAPI.Utility.Setup;

public static class ApplicationConfiguration
{
    public static WebApplication ConfigureApplicationPipeline(WebApplicationBuilder builder)
    {
        WebApplication app = builder.Build();

        // Configure the HTTP request pipeline
        // The order in which you register middleware is crucial. Each middleware gets a chance to process the
        // request in the order registered and then process the response in reverse order.
        // The middleware pipeline creates a nested structure like Russian dolls. Each middleware wraps
        // around all later middleware.
        // 1. Exception handling should be the first to catch any errors in later middleware
        app.UseGlobalExceptionHandler();
        
        // 2. Request/response logging early in the pipeline
        app.UseRequestResponseLogging();
        
        // 3. Swagger middleware (enabled for demo purposes)
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

            foreach (ApiVersionDescription description in provider.ApiVersionDescriptions)
            {
                options.SwaggerEndpoint(
                    $"/swagger/{description.GroupName}/swagger.json",
                    $"Food Budget API {description.GroupName}");
            }
        });

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
        return app;
    }
}