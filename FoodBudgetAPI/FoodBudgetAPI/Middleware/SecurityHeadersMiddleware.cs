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
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityHeadersMiddleware> _logger;
    private readonly IConfiguration _configuration;

    public SecurityHeadersMiddleware(
        RequestDelegate next,
        ILogger<SecurityHeadersMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Add Content Security Policy (CSP)
        // This is CRITICAL for SPAs storing tokens in browser storage
        var cspPolicy = BuildContentSecurityPolicy();
        context.Response.Headers.Append("Content-Security-Policy", cspPolicy);

        // Prevent MIME-sniffing attacks
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // Prevent clickjacking attacks
        context.Response.Headers.Append("X-Frame-Options", "DENY");

        // Legacy XSS protection (modern browsers use CSP instead)
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // Control referrer information
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Control browser features and APIs
        context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

        _logger.LogDebug("Security headers added to response for {Path}", context.Request.Path);

        await _next(context);
    }

    /// <summary>
    /// Builds the Content Security Policy string based on application requirements.
    /// Configured to support Microsoft Entra External ID authentication flows.
    /// </summary>
    /// <returns>CSP policy string</returns>
    private string BuildContentSecurityPolicy()
    {
        // Get allowed origins from configuration
        var allowedOrigins = _configuration.GetSection("Security:AllowedOrigins").Get<string[]>()
            ?? new[] { "'self'" };

        // Build CSP directives
        var cspDirectives = new List<string>
        {
            // Default policy: only allow resources from same origin
            "default-src 'self'",

            // Scripts: Allow same origin and Microsoft Entra External ID
            // Note: 'unsafe-inline' and 'unsafe-eval' should be avoided in production
            // If your React app requires inline scripts, use nonces or hashes instead
            $"script-src 'self' https://*.ciamlogin.com https://login.microsoftonline.com",

            // Styles: Allow same origin and inline styles (required for React)
            // Consider using nonces for better security in production
            "style-src 'self' 'unsafe-inline'",

            // Images: Allow same origin, data URIs (for inline images), and Azure Blob Storage
            "img-src 'self' data: https://*.blob.core.windows.net",

            // Fonts: Allow same origin and data URIs
            "font-src 'self' data:",

            // Connect (AJAX/Fetch): Allow same origin and Microsoft Entra External ID
            $"connect-src 'self' https://*.ciamlogin.com https://login.microsoftonline.com",

            // Frames: Allow Microsoft Entra External ID for authentication redirects
            "frame-src 'self' https://*.ciamlogin.com https://login.microsoftonline.com",

            // Form actions: Only allow same origin
            "form-action 'self'",

            // Base URI: Restrict to same origin
            "base-uri 'self'",

            // Block all plugins (Flash, Java, etc.)
            "object-src 'none'",

            // Upgrade insecure requests to HTTPS
            "upgrade-insecure-requests"
        };

        return string.Join("; ", cspDirectives);
    }
}