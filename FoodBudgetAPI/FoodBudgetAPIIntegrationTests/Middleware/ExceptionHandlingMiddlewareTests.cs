using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPIIntegrationTests.Helpers;

namespace FoodBudgetAPIIntegrationTests.Middleware;

public class ExceptionHandlingMiddlewareTests(HttpTestFactory<FoodBudgetAPI.Program> factory)
    : IClassFixture<HttpTestFactory<FoodBudgetAPI.Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task ExceptionMiddleware_CatchesExceptions_ReturnsRfc9457ProblemDetails()
    { 
        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/TestException/throw-test-exception");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        
        string content = await response.Content.ReadAsStringAsync();
        JsonElement problemDetails = JsonDocument.Parse(content).RootElement;
        
        // RFC 9457 standard properties
        problemDetails.GetProperty("status").GetInt32().Should().Be(500);
        problemDetails.GetProperty("title").GetString().Should().Be("Internal Server Error");
        problemDetails.GetProperty("detail").GetString().Should().NotBeNull();
        problemDetails.GetProperty("instance").GetString().Should().Be("/api/TestException/throw-test-exception");
        problemDetails.GetProperty("type").GetString().Should().Be("https://foodbudgetapi.example.com/problems/internal-server-error");
        
        // RFC 9457 extensions
        problemDetails.GetProperty("timestamp").Should().NotBeNull();
        problemDetails.GetProperty("traceId").GetString().Should().NotBeNull();
    }
}