using FoodBudgetAPI.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Moq;

namespace FoodBudgetAPITests.Controllers;

public class HealthControllerTests
{
    private readonly Mock<ILogger<HealthController>> _loggerMock = new();
    private readonly HealthController _subjectUnderTest;

    public HealthControllerTests()
    {
        // Set up service collection with health checks
        var services = new ServiceCollection();
        services.AddLogging();
    
        // Configure health checks with controlled health check implementations
        IHealthChecksBuilder healthChecks = services.AddHealthChecks();
    
        // Add health checks with known behaviors - use the "ready" tag to match controller
        healthChecks.AddCheck("healthy-check", () => HealthCheckResult.Healthy());
        healthChecks.AddCheck("degraded-check", () => HealthCheckResult.Degraded("Test degraded"), tags: ["ready"]);
        healthChecks.AddCheck("unhealthy-check", () => HealthCheckResult.Unhealthy("Test unhealthy"), tags: ["ready"]);

        // Build service provider
        IServiceProvider serviceProvider = services.BuildServiceProvider();
        var healthCheckService = serviceProvider.GetRequiredService<HealthCheckService>();

        // Create controller with real health check service
        _subjectUnderTest = new HealthController(healthCheckService, _loggerMock.Object);
    }

    #region GetHealth Method Tests

    [Fact]
    public async Task GetHealth_LogsInformationMessages_WhenCalled()
    {
        // Arrange
        // We've registered multiple health checks with different statuses,
        // so the overall status will be the most severe: Unhealthy
        
        // Act
        await _subjectUnderTest.GetHealth();

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
        await _subjectUnderTest.GetHealth();

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
    public async Task GetReadiness_LogsInformationMessages_WhenCalled()
    {
        // Arrange
        // We've registered health checks with the "readiness" tag in the constructor
        
        // Act
        await _subjectUnderTest.GetReadiness();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Readiness check requested")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }

    [Fact]
    public async Task GetReadiness_LogsWarningMessage_WhenReadinessIsUnhealthy()
    {
        // Act
        await _subjectUnderTest.GetReadiness();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Readiness check failed")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }

    [Fact]
    public async Task GetReadiness_LogsWarningMessage_WhenReadinessIsDegraded()
    {
        // Arrange
        // Create a new service collection with only degraded health checks
        var services = new ServiceCollection();
        services.AddLogging();
        
        // Configure health checks with only degraded checks
        services.AddHealthChecks()
            .AddCheck("degraded-check", () => HealthCheckResult.Degraded("Test degraded"), tags: ["ready"]);

        // Build service provider
        IServiceProvider serviceProvider = services.BuildServiceProvider();
        var healthCheckService = serviceProvider.GetRequiredService<HealthCheckService>();

        // Create a controller with the specific health check service
        var controller = new HealthController(healthCheckService, _loggerMock.Object);
        
        // Act
        await controller.GetReadiness();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Readiness check degraded")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }

    [Fact]
    public async Task GetReadiness_LogsInformationMessage_WhenReadinessIsHealthy()
    {
        // Arrange
        // Create a new service collection with only healthy health checks
        var services = new ServiceCollection();
        services.AddLogging();
        
        // Configure health checks with only healthy checks
        services.AddHealthChecks()
            .AddCheck("healthy-check", () => HealthCheckResult.Healthy(), tags: ["ready"]);

        // Build service provider
        IServiceProvider serviceProvider = services.BuildServiceProvider();
        var healthCheckService = serviceProvider.GetRequiredService<HealthCheckService>();

        // Create a controller with the specific health check service
        var controller = new HealthController(healthCheckService, _loggerMock.Object);
        
        // Act
        await controller.GetReadiness();

        // Assert
        _loggerMock.Verify(
            l => l.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Readiness check passed")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception, string>>()!),
            Times.Once);
    }

    #endregion
}