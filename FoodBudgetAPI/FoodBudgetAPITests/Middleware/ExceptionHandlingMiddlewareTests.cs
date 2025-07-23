using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPI.Middleware;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Middleware;

public class ExceptionHandlingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_WhenNoException_CallsNextDelegate()
    {
        // Arrange
        var nextDelegateCalled = false;
        var loggerMock = new Mock<ILogger<ExceptionHandlingMiddleware>>();
        var envMock = new Mock<IWebHostEnvironment>();
        var middleware = new ExceptionHandlingMiddleware(Next, loggerMock.Object, envMock.Object);
        
        var context = new DefaultHttpContext();
        
        // Act
        await middleware.InvokeAsync(context);
        
        // Assert
        nextDelegateCalled.Should().BeTrue("because the middleware should call the next delegate when no exception occurs");
        return;

        Task Next(HttpContext _)
        {
            nextDelegateCalled = true;
            return Task.CompletedTask;
        }
    }
    
    [Fact]
    public async Task InvokeAsync_WhenExceptionThrown_ReturnsCorrectErrorResponse()
    {
        // Arrange
        const string expectedMessage = "Test exception";
        var loggerMock = new Mock<ILogger<ExceptionHandlingMiddleware>>();
        var envMock = new Mock<IWebHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns("Development"); // This is what IsDevelopment() checks
        var middleware = new ExceptionHandlingMiddleware(Next, loggerMock.Object, envMock.Object);
        var context = new DefaultHttpContext();
        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;
        
        // Act
        await middleware.InvokeAsync(context);
        
        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError, 
            "because exceptions should result in a 500 status code");
            
        context.Response.ContentType.Should().Be("application/json", 
            "because the error response should be in JSON format");
        
        responseBody.Position = 0;
        string responseText = await new StreamReader(responseBody).ReadToEndAsync();
        JsonElement response = JsonSerializer.Deserialize<JsonDocument>(responseText)!.RootElement;
        
        response.GetProperty("status").GetInt32().Should().Be(500);
        response.GetProperty("message").GetString().Should().Be(expectedMessage,
            "because in development mode, the real exception message should be returned");
        response.GetProperty("detail").GetString().Should().NotBeNullOrEmpty(
            "because in development mode, stack trace details should be included");
        
        // Verify logging occurred
        loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)!),
            Times.Once);
        return;

        Task Next(HttpContext _)
        {
            throw new Exception(expectedMessage);
        }
    }
    
    [Fact]
    public async Task InvokeAsync_InProductionEnvironment_HidesExceptionDetails()
    {
        var loggerMock = new Mock<ILogger<ExceptionHandlingMiddleware>>();
        
        // Use "Production" instead of mocking IsDevelopment directly
        var envMock = new Mock<IWebHostEnvironment>();
        envMock.Setup(e => e.EnvironmentName).Returns("Production");
        
        var middleware = new ExceptionHandlingMiddleware(Next, loggerMock.Object, envMock.Object);
        
        var context = new DefaultHttpContext();
        var responseBody = new MemoryStream();
        context.Response.Body = responseBody;
        
        // Act
        await middleware.InvokeAsync(context);
        
        // Assert
        responseBody.Position = 0;
        string responseText = await new StreamReader(responseBody).ReadToEndAsync();
        JsonElement response = JsonSerializer.Deserialize<JsonDocument>(responseText)!.RootElement;
        
        response.GetProperty("message").GetString().Should().Be("An internal server error has occurred.",
            "because production environments should not expose exception details");
            
        response.GetProperty("detail").ValueKind.Should().Be(JsonValueKind.Null,
            "because stack traces should be hidden in production");
        return;

        // Arrange

        // Arrange
        Task Next(HttpContext _)
        {
            throw new Exception("Sensitive error details");
        }
    }
}