using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPIIntegrationTests.Helpers;

namespace FoodBudgetAPIIntegrationTests.Middleware;

public class ExceptionHandlingMiddlewareTests(CustomWebApplicationFactory<FoodBudgetAPI.Program> factory)
    : IClassFixture<CustomWebApplicationFactory<FoodBudgetAPI.Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task ExceptionMiddleware_CatchesExceptions_ReturnsErrorResponse()
    { 
        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/TestException/throw-test-exception");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement errorResponse = JsonDocument.Parse(content).RootElement;
        
        errorResponse.GetProperty("status").GetInt32().Should().Be(500);
        errorResponse.GetProperty("message").GetString().Should().NotBeNull();
    }
}