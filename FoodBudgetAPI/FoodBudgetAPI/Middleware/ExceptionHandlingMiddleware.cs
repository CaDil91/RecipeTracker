using System.Net;
using System.Text.Json;

namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Global exception handling middleware to catch and process all unhandled exceptions
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
{
    // Cache the JSON serializer options
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // Create a response object with a consistent structure
        var response = new ErrorResponse
        {
            Status = context.Response.StatusCode,
            Message = env.IsDevelopment() ? exception.Message : "An internal server error has occurred.",
            Detail = env.IsDevelopment() ? exception.StackTrace : null
        };

        // Use the cached JSON serializer options
        string json = JsonSerializer.Serialize(response, JsonOptions);
        return context.Response.WriteAsync(json);
    }
    
    // Define a class for consistent error response structure
    private class ErrorResponse
    {
        public int Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Detail { get; set; }
    }
}