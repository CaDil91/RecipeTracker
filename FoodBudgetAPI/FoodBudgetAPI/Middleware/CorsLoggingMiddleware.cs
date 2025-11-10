namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Middleware that logs CORS-related requests for security monitoring.
/// Implements 2025 security standard for CORS visibility and debugging.
/// </summary>
/// <remarks>
/// This middleware logs:
/// - Requests with Origin header (potential CORS requests)
/// - CORS preflight (OPTIONS) requests
/// - Successful CORS responses
/// - Rejected CORS requests (WARNING level for security monitoring)
/// </remarks>
public class CorsLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CorsLoggingMiddleware> _logger;

    public CorsLoggingMiddleware(
        RequestDelegate next,
        ILogger<CorsLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var origin = context.Request.Headers["Origin"].ToString();

        // Only log if this is a CORS request (has Origin header)
        if (!string.IsNullOrEmpty(origin))
        {
            var method = context.Request.Method;
            var path = context.Request.Path;

            // Log preflight requests
            if (method == "OPTIONS")
            {
                _logger.LogDebug("CORS preflight request from origin: {Origin} for {Path}", origin, path);
            }

            // Execute the rest of the pipeline
            await _next(context);

            // Check if CORS headers were added by CORS middleware
            var accessControlAllowOrigin = context.Response.Headers["Access-Control-Allow-Origin"].ToString();

            if (!string.IsNullOrEmpty(accessControlAllowOrigin))
            {
                // CORS headers present - request was allowed
                _logger.LogDebug("CORS request allowed from origin: {Origin} for {Method} {Path}", origin, method, path);
            }
            else
            {
                // No CORS headers - request was rejected
                // Log at WARNING level for security monitoring
                _logger.LogWarning(
                    "CORS request REJECTED from origin: {Origin} for {Method} {Path}. " +
                    "Origin not in whitelist. Check Security:AllowedOrigins configuration.",
                    origin, method, path);
            }
        }
        else
        {
            // Not a CORS request (no Origin header) - pass through
            await _next(context);
        }
    }
}