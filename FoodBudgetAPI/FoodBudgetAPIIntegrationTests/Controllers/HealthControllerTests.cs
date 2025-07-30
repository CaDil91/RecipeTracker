using System.Net;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPI;
using FoodBudgetAPIIntegrationTests.Helpers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace FoodBudgetAPIIntegrationTests.Controllers;

public class HealthCheckIntegrationTests : IClassFixture<HttpTestFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthCheckIntegrationTests(HttpTestFactory<Program> factory)
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
    
    #region GetHealth
    
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
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
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
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
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
    #endregion GetHealth
    
    #region GetReadiness
    [Fact]
    public async Task GetReadiness_ReturnsOkStatusCode_WhenSystemIsReady()
    {
        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/Health/readiness");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Ready");
    }
    
    [Fact]
    public async Task GetReadiness_Returns503StatusCode_WhenSystemIsNotReady()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Configure unhealthy health check with the "ready" tag
                    services.AddHealthChecks()
                        .AddCheck("ready-test-unhealthy", 
                            () => HealthCheckResult.Unhealthy("Test unhealthy check"), 
                            tags: ["ready"]);
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/readiness");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Not Ready");
        result.GetProperty("details").EnumerateArray().Should().NotBeEmpty();
    }
    
    [Fact]
    public async Task GetReadiness_Returns200StatusCode_WhenSystemIsDegraded()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Configure a degraded health check with the "ready" tag
                    services.AddHealthChecks()
                        .AddCheck("ready-test-degraded", 
                            () => HealthCheckResult.Degraded("Test degraded check"), 
                            tags: ["ready"]);
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/readiness");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Degraded");
    }
    
    [Fact]
    public async Task GetReadiness_ReturnsHealthyStatus_WhenNoReadyTaggedChecksExist()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Configure health checks without any "ready" tag
                    services.AddHealthChecks()
                        .AddCheck("non-ready-test", () => HealthCheckResult.Healthy());
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/readiness");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        result.GetProperty("status").GetString().Should().Be("Ready");
    }
    
    [Fact]
    public async Task GetReadiness_IncludesDetailsInResponse_WhenSystemIsNotReady()
    {
        // Arrange
        WebApplicationFactory<Program> factory = new HttpTestFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Add multiple health checks with the "ready" tag to test details in response
                    services.AddHealthChecks()
                        .AddCheck("ready-db", () => HealthCheckResult.Unhealthy("Database connection failed"), 
                            tags: ["ready"])
                        .AddCheck("ready-cache", () => HealthCheckResult.Healthy(), 
                            tags: ["ready"])
                        .AddCheck("ready-messaging", () => HealthCheckResult.Degraded("High latency"), 
                            tags: ["ready"]);
                });
            });

        HttpClient client = factory.CreateClient();

        // Act
        HttpResponseMessage response = await client.GetAsync("/api/Health/readiness");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.ServiceUnavailable);
        string content = await response.Content.ReadAsStringAsync();
        JsonElement result = JsonDocument.Parse(content).RootElement;
        
        // Check details array
        JsonElement detailsArray = result.GetProperty("details");
        detailsArray.EnumerateArray().Count().Should().Be(3);
        
        // Check if keys exist in the details
        var hasDbEntry = false;
        var hasCacheEntry = false;
        var hasMessagingEntry = false;
        
        foreach (string key in detailsArray.EnumerateArray().Select(detail => detail.GetProperty("key").GetString()!))
        {
            switch (key)
            {
                case "ready-db":
                    hasDbEntry = true;
                    break;
                case "ready-cache":
                    hasCacheEntry = true;
                    break;
                case "ready-messaging":
                    hasMessagingEntry = true;
                    break;
            }
        }
        
        hasDbEntry.Should().BeTrue("because db health check should be in the details");
        hasCacheEntry.Should().BeTrue("because cache health check should be in the details");
        hasMessagingEntry.Should().BeTrue("because messaging health check should be in the details");
    }
    #endregion GetReadiness
}