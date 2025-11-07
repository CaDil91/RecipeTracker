namespace FoodBudgetAPI.Configuration;

/// <summary>
/// Configuration options for Azure Blob Storage
/// </summary>
public class AzureStorageOptions
{
    public const string SECTION_NAME = "AzureStorage";

    /// <summary>
    /// Azure Storage connection string
    /// </summary>
    public required string ConnectionString { get; set; }

    /// <summary>
    /// Container name for recipe images (default: recipe-images)
    /// </summary>
    public string ContainerName { get; set; } = "recipe-images";
}