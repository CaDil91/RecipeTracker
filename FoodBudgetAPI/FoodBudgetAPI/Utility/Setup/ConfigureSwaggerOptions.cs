﻿using Asp.Versioning.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace FoodBudgetAPI.Utility.Setup;

public class ConfigureSwaggerOptions(IApiVersionDescriptionProvider provider) : IConfigureOptions<SwaggerGenOptions>
{
    /// <summary>
    /// Configures the Swagger generation options for the API.
    /// </summary>
    /// <param name="options">The Swagger generation options to be configured.</param>
    public void Configure(SwaggerGenOptions options)
    {
        foreach (ApiVersionDescription description in provider.ApiVersionDescriptions)
        {
            options.SwaggerDoc(
                description.GroupName,
                new OpenApiInfo
                {
                    Title = "Food Budget API",
                    Version = description.ApiVersion.ToString(),
                    Description = "API for managing food budgets"
                });
        }
    }
}