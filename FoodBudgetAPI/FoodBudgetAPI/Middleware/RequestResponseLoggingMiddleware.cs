using System.Text;
using Microsoft.Extensions.Primitives;

namespace FoodBudgetAPI.Middleware;

/// <summary>
/// Middleware for logging request and response details
/// </summary>
public class RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Log the request
        await LogRequest(context);

        // Capture the original response body stream
        Stream originalBodyStream = context.Response.Body;

        // Create a new memory stream to capture the response
        using var responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            // Continue down the middleware pipeline
            await next(context);

            // Log the response
            await LogResponse(context, responseBody, originalBodyStream);
        }
        finally
        {
            // Ensure the original stream is restored
            context.Response.Body = originalBodyStream;
        }
    }

    private async Task LogRequest(HttpContext context)
    {
        context.Request.EnableBuffering();

        var requestLog = new StringBuilder();
        requestLog.AppendLine("=== Request Details ===");
        requestLog.AppendLine($"Path: {context.Request.Path}");
        requestLog.AppendLine($"Method: {context.Request.Method}");
        requestLog.AppendLine($"QueryString: {context.Request.QueryString}");
        requestLog.AppendLine("Headers:");
        
        foreach (KeyValuePair<string, StringValues> header in context.Request.Headers)
        {
            requestLog.AppendLine($"  {header.Key}: {header.Value}");
        }

        if (context.Request.ContentLength > 0)
        {
            // Read and log the request body
            var buffer = new byte[context.Request.ContentLength.Value];
            await context.Request.Body.ReadExactlyAsync(buffer, 0, buffer.Length);
            string bodyAsText = Encoding.UTF8.GetString(buffer);
            requestLog.AppendLine($"Body: {bodyAsText}");
            
            // Reset the request body position
            context.Request.Body.Position = 0;
        }

        logger.LogInformation(requestLog.ToString());
    }

    private async Task LogResponse(HttpContext context, MemoryStream responseBody, Stream originalBodyStream)
    {
        responseBody.Position = 0;
        string responseBodyText = await new StreamReader(responseBody).ReadToEndAsync();
        
        var responseLog = new StringBuilder();
        responseLog.AppendLine("=== Response Details ===");
        responseLog.AppendLine($"StatusCode: {context.Response.StatusCode}");
        responseLog.AppendLine("Headers:");
        
        foreach (KeyValuePair<string, StringValues> header in context.Response.Headers)
        {
            responseLog.AppendLine($"  {header.Key}: {header.Value}");
        }

        responseLog.AppendLine($"Body: {responseBodyText}");
        
        logger.LogInformation(responseLog.ToString());

        // Copy the response body to the original stream
        responseBody.Position = 0;
        await responseBody.CopyToAsync(originalBodyStream);
    }
}