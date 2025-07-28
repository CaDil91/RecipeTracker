using System.Diagnostics.CodeAnalysis;
using Asp.Versioning;
using FoodBudgetAPI.Utility.Setup;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FoodBudgetAPI;

[ExcludeFromCodeCoverage]
public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        ServiceConfiguration.ConfigureServices(builder);
        WebApplication app = ApplicationConfiguration.ConfigureApplicationPipeline(builder);
        app.Run();
    }
}