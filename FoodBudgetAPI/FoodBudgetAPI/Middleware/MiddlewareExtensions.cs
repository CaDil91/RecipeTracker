namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Extension methods for registering custom middleware
/// </summary>
public static class MiddlewareExtensions
{
    /// <summary>
    /// Adds global exception handling middleware to the application pipeline
    /// </summary>
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }

    /// <summary>
    /// Adds request and response logging middleware to the application pipeline
    /// </summary>
    public static IApplicationBuilder UseRequestResponseLogging(this IApplicationBuilder app)
    {
        return app.UseMiddleware<RequestResponseLoggingMiddleware>();
    }

    /// <summary>
    /// Adds security headers middleware to the application pipeline.
    /// Implements Content Security Policy (CSP) and OWASP-recommended security headers.
    /// </summary>
    /// <remarks>
    /// This middleware should be registered early in the pipeline to ensure
    /// security headers are added to all responses.
    /// Required for security for SPAs storing tokens in browser storage.
    /// </remarks>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }

    /// <summary>
    /// Adds CORS logging middleware to the application pipeline.
    /// Logs CORS requests for security monitoring and debugging (2025 standard).
    /// </summary>
    /// <remarks>
    /// This middleware should be registered AFTER UseCors() to properly detect
    /// whether CORS headers were added or rejected by the CORS middleware.
    /// Logs rejected CORS requests at WARNING level for security monitoring.
    /// </remarks>
    public static IApplicationBuilder UseCorsLogging(this IApplicationBuilder app) => return app.UseMiddleware<CorsLoggingMiddleware>();
    
}