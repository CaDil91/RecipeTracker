namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Middleware that adds security headers to all HTTP responses.
/// Implements Content Security Policy (CSP) and other OWASP-recommended security headers.
/// </summary>
/// <remarks>
/// Security headers implemented:
/// - Content-Security-Policy: Prevents XSS attacks by controlling which resources can be loaded
/// - X-Content-Type-Options: Prevents MIME-sniffing attacks
/// - X-Frame-Options: Prevents clickjacking attacks
/// - X-XSS-Protection: Legacy XSS protection for older browsers
/// - Referrer-Policy: Controls referrer information sent with requests
/// - Permissions-Policy: Controls browser features and APIs
/// </remarks>
public class SecurityHeadersMiddleware(RequestDelegate next, ILogger<SecurityHeadersMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Check if this is a Swagger request (only relax CSP for Swagger UI in development)
        bool isSwaggerRequest = context.Request.Path.StartsWithSegments("/swagger");
        bool isDevelopment = context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        // Add Content Security Policy (CSP)
        // This is CRITICAL for SPAs storing tokens in browser storage
        string cspPolicy = BuildContentSecurityPolicy(isSwaggerRequest && isDevelopment);
        context.Response.Headers.Append("Content-Security-Policy", cspPolicy);

        // Prevent MIME-sniffing attacks
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // Prevent clickjacking attacks (allow frames for Swagger in dev)
        if (isSwaggerRequest && isDevelopment)
        {
            context.Response.Headers.Append("X-Frame-Options", "SAMEORIGIN");
        }
        else
        {
            context.Response.Headers.Append("X-Frame-Options", "DENY");
        }

        // Legacy XSS protection (modern browsers use CSP instead)
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // Control referrer information
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Control browser features and APIs
        context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        logger.LogDebug("Security headers added to response for {Path}", context.Request.Path);

        await next(context);
    }

    /// <summary>
    /// Builds the Content Security Policy string based on application requirements.
    /// Configured to support Microsoft Entra External ID (CIAM) authentication flows.
    /// </summary>
    /// <param name="allowSwagger">If true, relaxes CSP for Swagger UI (development only)</param>
    /// <returns>CSP policy string</returns>
    private string BuildContentSecurityPolicy(bool allowSwagger = false)
    {
        // Scripts directive: relax for Swagger in development only
        string scriptSrc = allowSwagger
            ? "script-src 'self' 'unsafe-inline' https://*.ciamlogin.com"
            : "script-src 'self' https://*.ciamlogin.com";

        // Build CSP directives
        var cspDirectives = new List<string>
        {
            // Default policy: only allow resources from the same origin
            "default-src 'self'",

            // Scripts: Allow the same origin and Microsoft Entra External ID (CIAM)
            // Note: 'unsafe-inline' is only allowed for Swagger UI in development
            // Production should never use 'unsafe-inline' or 'unsafe-eval'
            // External ID uses *.ciamlogin.com (not login.microsoftonline.com)
            scriptSrc,

            // Styles: Allow same origin and inline styles (required for React)
            // Consider using nonce's for better security in production
            "style-src 'self' 'unsafe-inline'",

            // Images: Allow the same origin, data URIs (for inline images), and Azure Blob Storage
            "img-src 'self' data: https://*.blob.core.windows.net",

            // Fonts: Allow the same origin and data URIs
            "font-src 'self' data:",

            // Connect (AJAX/Fetch): Allow the same origin and Microsoft Entra External ID (CIAM)
            "connect-src 'self' https://*.ciamlogin.com",

            // Frames: Allow Microsoft Entra External ID (CIAM) for authentication redirects
            "frame-src 'self' https://*.ciamlogin.com",

            // Form actions: Only allow the same origin
            "form-action 'self'",

            // Base URI: Restrict to the same origin
            "base-uri 'self'",

            // Block all plugins (Flash, Java, etc.)
            "object-src 'none'",

            // Upgrade insecure requests to HTTPS
            "upgrade-insecure-requests"
        };

        return string.Join("; ", cspDirectives);
    }
}