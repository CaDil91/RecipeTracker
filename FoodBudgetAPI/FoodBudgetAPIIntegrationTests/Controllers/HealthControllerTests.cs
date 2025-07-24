using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPI;
using FoodBudgetAPIIntegrationTests.Helpers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace FoodBudgetAPIIntegrationTests.Controllers;

public class HealthCheckIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthCheckIntegrationTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Configure test health checks
                services.AddHealthChecks()
                    .AddCheck("test-healthy", () => HealthCheckResult.Healthy());
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOkStatusCode_WhenApiIsHealthy()
    {
        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/Health/health");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Healthy");
    }
    
    [Fact]
    public async Task GetHealth_Returns503StatusCode_WhenApiIsUnhealthy()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new CustomWebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Configure unhealthy health check
                    services.AddHealthChecks()
                        .AddCheck("test-unhealthy", () => HealthCheckResult.Unhealthy("Test unhealthy check"));
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/health");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Unhealthy");
    }
    
    [Fact]
    public async Task GetHealth_Returns200StatusCode_WhenApiIsDegraded()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new CustomWebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Configure degraded health check
                    services.AddHealthChecks()
                        .AddCheck("test-degraded", () => HealthCheckResult.Degraded("Test degraded check"));
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/health");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Degraded");
    }
}