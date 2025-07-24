using FluentAssertions;
using FoodBudgetAPI.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Controllers;

public class HealthControllerTests
{
    private readonly Mock<ILogger<HealthController>> _loggerMock = new();
    private readonly HealthController _controller;

    public HealthControllerTests()
    {
        // Set up service collection with health checks
        var services = new ServiceCollection();
        services.AddLogging();
        
        // Configure health checks with controlled health check implementations
        IHealthChecksBuilder healthChecks = services.AddHealthChecks();
        
        // Add health checks with known behaviors
        healthChecks.AddCheck("healthy-check", () => HealthCheckResult.Healthy());
        healthChecks.AddCheck("degraded-check", () => HealthCheckResult.Degraded("Test degraded"), tags: ["readiness"]);
        healthChecks.AddCheck("unhealthy-check", () => HealthCheckResult.Unhealthy("Test unhealthy"), tags: ["readiness"
        ]);

        // Build service provider
        IServiceProvider serviceProvider = services.BuildServiceProvider();
        var healthCheckService = serviceProvider.GetRequiredService<HealthCheckService>();

        // Create controller with real health check service
        _controller = new HealthController(healthCheckService, _loggerMock.Object);
    }

    #region GetHealth Method Tests

    [Fact]
    public async Task GetHealth_LogsInformationMessages_WhenCalled()
    {
        // Arrange
        // We've registered multiple health checks with different statuses,
        // so the overall status will be the most severe: Unhealthy
        
        // Act
        await _controller.GetHealth();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Health check requested")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }
    
    [Fact]
    public async Task GetHealth_LogsWarningMessage_WhenHealthIsUnhealthy()
    {
        // Arrange
        // The combined health check status is Unhealthy due to our unhealthy-check
        
        // Act
        await _controller.GetHealth();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Health check failed")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }

    #endregion

    #region GetReadiness Method Tests

    [Fact]
    public async Task GetReadiness_ThrowsNotImplementedException()
    {
        // Act & Assert
        await _controller.Invoking(c => c.GetReadiness())
            .Should().ThrowAsync<NotImplementedException>();
    }

    #endregion
}