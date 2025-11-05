using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Global exception handling middleware to catch and process all unhandled exceptions
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
{
    private static class ProblemTypes
    {
        public const string BAD_REQUEST = "https://foodbudgetapi.example.com/problems/bad-request";
        public const string NOT_FOUND = "https://foodbudgetapi.example.com/problems/not-found";
        public const string UNAUTHORIZED = "https://foodbudgetapi.example.com/problems/unauthorized";
        public const string INTERNAL_SERVER_ERROR = "https://foodbudgetapi.example.com/problems/internal-server-error";
        public const string VALIDATION_ERROR = "https://foodbudgetapi.example.com/problems/validation-error";
    }

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
        context.Response.ContentType = "application/problem+json";
        
        ProblemDetails problemDetails = exception switch
        {
            ArgumentException argEx => new ProblemDetails
            {
                Type = ProblemTypes.BAD_REQUEST,
                Title = "Bad Request",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = argEx.Message,
                Instance = context.Request.Path
            },
            KeyNotFoundException keyNotFoundEx => new ProblemDetails
            {
                Type = ProblemTypes.NOT_FOUND,
                Title = "Not Found",
                Status = (int)HttpStatusCode.NotFound,
                Detail = keyNotFoundEx.Message,
                Instance = context.Request.Path
            },
            UnauthorizedAccessException unauthorizedEx => new ProblemDetails
            {
                Type = ProblemTypes.UNAUTHORIZED,
                Title = "Unauthorized",
                Status = (int)HttpStatusCode.Unauthorized,
                Detail = unauthorizedEx.Message,
                Instance = context.Request.Path
            },
            InvalidOperationException invalidOpEx => new ProblemDetails
            {
                Type = ProblemTypes.BAD_REQUEST,
                Title = "Bad Request",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = invalidOpEx.Message,
                Instance = context.Request.Path
            },
            NotSupportedException notSupportedEx => new ProblemDetails
            {
                Type = ProblemTypes.BAD_REQUEST,
                Title = "Bad Request",
                Status = (int)HttpStatusCode.BadRequest,
                Detail = notSupportedEx.Message,
                Instance = context.Request.Path
            },
            _ => new ProblemDetails
            {
                Type = ProblemTypes.INTERNAL_SERVER_ERROR,
                Title = "Internal Server Error",
                Status = (int)HttpStatusCode.InternalServerError,
                Detail = env.IsDevelopment() ? exception.Message : "An internal server error has occurred.",
                Instance = context.Request.Path
            }
        };

        // Add RFC 9457 compliant extensions
        problemDetails.Extensions["timestamp"] = DateTimeOffset.UtcNow;
        problemDetails.Extensions["traceId"] = context.TraceIdentifier;
        
        if (env.IsDevelopment() && exception.StackTrace != null)
        {
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
        }

        context.Response.StatusCode = problemDetails.Status ?? 500;

        string json = JsonSerializer.Serialize(problemDetails, JsonOptions);
        return context.Response.WriteAsync(json);
    }
}