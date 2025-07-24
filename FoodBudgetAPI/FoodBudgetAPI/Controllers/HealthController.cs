using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace FoodBudgetAPI.Controllers;

[ApiController]
[ApiVersion(1)]
[Route("api/[controller]")]
public class HealthController(HealthCheckService healthCheckService, ILogger<HealthController> logger) : ControllerBase
{
    /// <summary>
    /// Performs a health check on the system, evaluating various components as defined in the health check service.
    /// </summary>
    /// <returns>
    /// An asynchronous operation that resolves to an object containing the health status of the system
    /// and, in case of failure, additional details about failing components.
    /// </returns>
    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        logger.LogInformation("Health check requested");

        HealthReport healthReport = await healthCheckService.CheckHealthAsync();

        switch (healthReport.Status)
        {
            case HealthStatus.Healthy:
                logger.LogInformation("Health check passed");
                return Ok(new { status = "Healthy" });
            case HealthStatus.Degraded:
                logger.LogWarning("Health check degraded: {Description}", healthReport.Entries.ToString());
                return Ok(new { status = "Degraded" });
            case HealthStatus.Unhealthy:
            default:
                logger.LogWarning("Health check failed: {Description}", healthReport.Entries.ToString());
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "Unhealthy",
                    details = healthReport.Entries.Select(e => new { e.Key, e.Value.Status, e.Value.Description })
                });
        }
    }

    [HttpGet("readiness")]
    public async Task<IActionResult> GetReadiness()
    {
        logger.LogInformation("Readiness check requested");

        HealthReport healthReport = await healthCheckService.CheckHealthAsync(
            check => check.Tags.Contains("ready"));

        switch (healthReport.Status)
        {
            case HealthStatus.Healthy:
                logger.LogInformation("Readiness check passed");
                return Ok(new { status = "Ready" });
            case HealthStatus.Degraded:
                logger.LogWarning("Readiness check degraded: {Description}", healthReport.Entries.ToString());
                return Ok(new { status = "Degraded" });
            case HealthStatus.Unhealthy:
            default:
                logger.LogWarning("Readiness check failed: {Description}", healthReport.Entries.ToString());
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new
                {
                    status = "Not Ready",
                    details = healthReport.Entries.Select(e => new { e.Key, e.Value.Status, e.Value.Description })
                });
        }
    }
}