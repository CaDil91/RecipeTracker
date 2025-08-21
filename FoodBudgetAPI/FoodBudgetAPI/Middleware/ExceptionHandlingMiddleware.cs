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
        
        ErrorResponse response = exception switch
        {
            ArgumentException argEx => new ErrorResponse
            {
                Status = (int)HttpStatusCode.BadRequest,
                Message = argEx.Message,
                Detail = env.IsDevelopment() ? argEx.StackTrace : null
            },
            KeyNotFoundException keyNotFoundEx => new ErrorResponse
            {
                Status = (int)HttpStatusCode.NotFound,
                Message = keyNotFoundEx.Message,
                Detail = env.IsDevelopment() ? keyNotFoundEx.StackTrace : null
            },
            UnauthorizedAccessException => new ErrorResponse
            {
                Status = (int)HttpStatusCode.Unauthorized,
                Message = "Unauthorized access.",
                Detail = null
            },
            NotSupportedException notSupportedEx => new ErrorResponse
            {
                Status = (int)HttpStatusCode.BadRequest,
                Message = notSupportedEx.Message,
                Detail = env.IsDevelopment() ? notSupportedEx.StackTrace : null
            },
            _ => new ErrorResponse
            {
                Status = (int)HttpStatusCode.InternalServerError,
                Message = env.IsDevelopment() ? exception.Message : "An internal server error has occurred.",
                Detail = env.IsDevelopment() ? exception.StackTrace : null
            }
        };

        context.Response.StatusCode = response.Status;

        // Use the cached JSON serializer options
        string json = JsonSerializer.Serialize(response, JsonOptions);
        return context.Response.WriteAsync(json);
    }
    
    // Define a class for consistent error response structure
    private class ErrorResponse
    {
        public int Status { get; init; }
        public string Message { get; set; } = string.Empty;
        public string? Detail { get; set; }
    }
}