using System.Text;
using FluentAssertions;
using FoodBudgetAPI.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Middleware;

public class RequestResponseLoggingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_LogsRequestAndResponseDetails()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);
        var context = new DefaultHttpContext
        {
            Request =
            {
                Method = "POST",
                Path = "/api/test",
                QueryString = new QueryString("?param=value"),
                Headers =
                {
                    ["User-Agent"] = "Test Agent"
                }
            }
        };

        // Set up the request body
        const string requestBodyContent = "Request body content";
        byte[] requestBodyBytes = Encoding.UTF8.GetBytes(requestBodyContent);
        context.Request.ContentLength = requestBodyBytes.Length;
        context.Request.Body = new MemoryStream(requestBodyBytes);

        // Set up a response body
        var responseBodyStream = new MemoryStream();
        context.Response.Body = responseBodyStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        Action verifyRequestLog = () =>
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("=== Request Details ===")),
                    null,
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
                Times.Once);

        verifyRequestLog.Should().NotThrow("because request details should be logged");

        Action verifyResponseLog = () =>
            loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("=== Response Details ===")),
                    null,
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
                Times.Once);

        verifyResponseLog.Should().NotThrow("because response details should be logged");

        // Check the response content
        responseBodyStream.Position = 0;
        string responseContent = await new StreamReader(responseBodyStream).ReadToEndAsync();
        responseContent.Should().Be("Response body content",
            "because the middleware should not alter the response body");
        return;

        async Task Next(HttpContext httpContext)
        {
            // Simulate the next middleware writing to the response
            await httpContext.Response.WriteAsync("Response body content");
        }
    }

    [Fact]
    public async Task InvokeAsync_ShouldRestoreOriginalResponseBodyStream()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var originalBodyStream = new MemoryStream();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);
        var context = new DefaultHttpContext
        {
            Response =
            {
                Body = originalBodyStream
            }
        };

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.Body.Should().BeSameAs(originalBodyStream,
            "because the middleware should restore the original response body stream");
        return;

        Task Next(HttpContext _)
        {
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task InvokeAsync_HandlesEmptyRequestBody()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);
        var context = new DefaultHttpContext
        {
            Request =
            {
                Body = new MemoryStream(),
                ContentLength = 0
            },
            Response =
            {
                Body = new MemoryStream()
            }
        };

        // Act & Assert
        Func<Task> act = async () => await middleware.InvokeAsync(context);
        await act.Should().NotThrowAsync("because the middleware should handle empty request bodies gracefully");
        return;

        Task Next(HttpContext _)
        {
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task InvokeAsync_LogsResponseHeaders()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);

        var context = new DefaultHttpContext();

        // Add response headers
        context.Response.Headers.Append("Content-Type", "application/json");
        context.Response.Headers.Append("X-Test-Header", "TestValue");

        // Setup response body
        var responseBodyStream = new MemoryStream();
        context.Response.Body = responseBodyStream;

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) =>
                    v.ToString()!.Contains("Content-Type: application/json") &&
                    v.ToString()!.Contains("X-Test-Header: TestValue")),
                null,
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
            Times.Once,
            "Response headers should be logged");

        return;

        async Task Next(HttpContext httpContext)
        {
            // Simulate the next middleware in the pipeline
            await Task.CompletedTask;
        }
    }

    [Fact]
    public async Task InvokeAsync_LogsRequestBodyWhenContentLengthIsGreaterThanZero()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);

        const string requestBodyContent = "Test request body for logging";
        byte[] requestBodyBytes = Encoding.UTF8.GetBytes(requestBodyContent);

        var context = new DefaultHttpContext
        {
            Request =
            {
                Method = "POST",
                Path = "/api/test",
                ContentLength = requestBodyBytes.Length, // This triggers the ContentLength > 0 condition
                Body = new MemoryStream(requestBodyBytes)
            },
            Response =
            {
                Body = new MemoryStream()
            }
        };

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        // Verify that the specific request body content was logged
        loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains($"Body: {requestBodyContent}")),
                null,
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
            Times.Once,
            "Request body should be logged when ContentLength > 0");

        // Verify that the request body stream position was reset and can still be read
        context.Request.Body.Position.Should().Be(0,
            "because the middleware should reset the stream position after reading");

        // Verify the stream is still readable by the next middleware
        var verificationBuffer = new byte[requestBodyBytes.Length];
        int bytesRead = await context.Request.Body.ReadAsync(verificationBuffer, 0, verificationBuffer.Length);
        string readContent = Encoding.UTF8.GetString(verificationBuffer, 0, bytesRead);

        readContent.Should().Be(requestBodyContent,
            "because the request body should still be available after middleware processing");

        return;

        Task Next(HttpContext _)
        {
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task InvokeAsync_DoesNotLogRequestBodyWhenContentLengthIsZero()
    {
        // Arrange
        var loggerMock = new Mock<ILogger<RequestResponseLoggingMiddleware>>();
        var middleware = new RequestResponseLoggingMiddleware(Next, loggerMock.Object);
    
        var context = new DefaultHttpContext
        {
            Request =
            {
                Method = "GET",
                Path = "/api/test",
                ContentLength = 0, // This should NOT trigger the body reading logic
                Body = new MemoryStream()
            },
            Response =
            {
                Body = new MemoryStream()
            }
        };

        // Act
        await middleware.InvokeAsync(context);
    
        // Assert
        // Verify that no request body content was logged (but response body logging is still expected)
        loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => 
                    v.ToString()!.Contains("=== Request Details ===") && 
                    v.ToString()!.Contains("Body:")),
                null,
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
            Times.Never,
            "Request body should NOT be logged in request details when ContentLength is 0");

        return;

        Task Next(HttpContext _) => Task.CompletedTask;
    }

}