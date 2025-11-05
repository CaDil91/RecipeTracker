using System.Net;
using FluentAssertions;
using FoodBudgetAPIIntegrationTests.Helpers;

namespace FoodBudgetAPIIntegrationTests.Middleware;

public class RateLimitingTests(HttpTestFactory<FoodBudgetAPI.Program> factory)
    : IClassFixture<HttpTestFactory<FoodBudgetAPI.Program>>
{
    private readonly HttpTestFactory<FoodBudgetAPI.Program> _factory = factory;

    [Fact]
    public async Task ApiEndpoint_ExceedingRateLimit_Returns429()
    {
        // Arrange
        HttpClient client = _factory.CreateClient();
        int rateLimitPerMinute = 60;

        // Act - Make requests exceeding the rate limit (using public test endpoint)
        var responses = new List<HttpResponseMessage>();
        for (int i = 0; i < rateLimitPerMinute + 5; i++)
        {
            responses.Add(await client.GetAsync("/api/TestException/public-endpoint"));
        }

        // Assert
        // First 60 requests should succeed
        responses.Take(rateLimitPerMinute).Should().AllSatisfy(r =>
            r.StatusCode.Should().Be(HttpStatusCode.OK));

        // Requests beyond the limit should be rate limited
        responses.Skip(rateLimitPerMinute).Should().AllSatisfy(r =>
            r.StatusCode.Should().Be(HttpStatusCode.TooManyRequests));

        // Verify the 429 response includes Retry-After header
        HttpResponseMessage rateLimitedResponse = responses.Skip(rateLimitPerMinute).First();
        rateLimitedResponse.Headers.Should().ContainKey("Retry-After");
    }

    [Fact]
    public async Task HealthEndpoint_ExceedingRequests_NeverRateLimited()
    {
        // Arrange
        HttpClient client = _factory.CreateClient();
        int requestCount = 75; // Well beyond the 60/min rate limit

        // Act - Make many requests to the whitelisted health endpoint
        var responses = new List<HttpResponseMessage>();
        for (int i = 0; i < requestCount; i++)
        {
            responses.Add(await client.GetAsync("/health"));
        }

        // Assert - All requests should succeed (health check is whitelisted)
        responses.Should().AllSatisfy(r =>
            r.StatusCode.Should().Be(HttpStatusCode.OK));
    }
}
