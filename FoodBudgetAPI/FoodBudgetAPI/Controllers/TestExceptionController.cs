using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Mvc;

namespace FoodBudgetAPI.Controllers;

[ExcludeFromCodeCoverage]
[ApiController]
[Route("api/[controller]")]
public class TestExceptionController : ControllerBase
{
    [HttpGet("throw-test-exception")]
    public IActionResult ThrowException()
    {
        throw new InvalidOperationException("This is a test exception");
    }
}