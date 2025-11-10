namespace FoodBudgetAPI.Configuration;

/// <summary>
/// Configuration options for Azure Blob Storage
/// </summary>
public class AzureStorageOptions
{
    public const string SECTION_NAME = "AzureStorage";

    /// <summary>
    /// Azure Storage account name used with DefaultAzureCredential for authentication
    /// </summary>
    public required string AccountName { get; init; }

    /// <summary>
    /// Container name for recipe images (default: recipe-images)
    /// </summary>
    public string ContainerName { get; init; } = "recipe-images";
}