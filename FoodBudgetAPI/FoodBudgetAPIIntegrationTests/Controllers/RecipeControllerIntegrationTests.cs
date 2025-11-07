using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using FoodBudgetAPI.Models.DTOs.Requests;
using FoodBudgetAPI.Models.DTOs.Responses;
using FoodBudgetAPIIntegrationTests.Helpers;

namespace FoodBudgetAPIIntegrationTests.Controllers;

/// <summary>
/// Integration tests for RecipeController focusing on cross-user security and ownership validation (Story 5.4).
/// These tests verify that users can only access, modify, and delete their own recipes.
/// </summary>
public class RecipeControllerIntegrationTests : IClassFixture<AuthenticatedHttpTestFactory<FoodBudgetAPI.Program>>
{
    private readonly HttpClient _client;
    private readonly Guid _userA = Guid.NewGuid(); // Test User A
    private readonly Guid _userB = Guid.NewGuid(); // Test User B

    public RecipeControllerIntegrationTests(AuthenticatedHttpTestFactory<FoodBudgetAPI.Program> factory)
    {
        _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    #region Helper Methods

    /// <summary>
    /// Sets the authenticated user for subsequent requests
    /// </summary>
    private void AuthenticateAs(Guid userId)
    {
        _client.DefaultRequestHeaders.Remove(TestAuthHandler.UserIdHeaderName);
        _client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeaderName, userId.ToString());
    }

    /// <summary>
    /// Creates a recipe as the specified user and returns its ID
    /// </summary>
    private async Task<Guid> CreateRecipeAs(Guid userId, string title = "Test Recipe")
    {
        AuthenticateAs(userId);

        var request = new RecipeRequestDto
        {
            Title = title,
            Instructions = "Test instructions",
            Servings = 4
        };

        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/Recipe", request);
        response.EnsureSuccessStatusCode();

        RecipeResponseDto? recipe = await response.Content.ReadFromJsonAsync<RecipeResponseDto>();
        recipe.Should().NotBeNull();
        return recipe!.Id;
    }

    #endregion

    #region Story 5.4: Cross-User Security Tests

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserBTriesToGetIt_Then_Returns404NotFound()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "User A's Private Recipe");

        // Act - User B tries to access User A's recipe
        AuthenticateAs(_userB);
        HttpResponseMessage response = await _client.GetAsync($"/api/Recipe/{recipeId}");

        // Assert - Should return 404 to prevent information leakage (OWASP compliance)
        response.StatusCode.Should().Be(HttpStatusCode.NotFound,
            "User B should not be able to access User A's recipe");
    }

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserBTriesToUpdateIt_Then_Returns404NotFound()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "User A's Recipe");

        var updateRequest = new RecipeRequestDto
        {
            Title = "User B's Malicious Update",
            Instructions = "Attempting to modify User A's recipe",
            Servings = 8
        };

        // Act - User B tries to update User A's recipe
        AuthenticateAs(_userB);
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/api/Recipe/{recipeId}", updateRequest);

        // Assert - Should return 404 to prevent information leakage
        response.StatusCode.Should().Be(HttpStatusCode.NotFound,
            "User B should not be able to update User A's recipe");

        // Verify recipe was not modified by checking as User A
        AuthenticateAs(_userA);
        HttpResponseMessage getResponse = await _client.GetAsync($"/api/Recipe/{recipeId}");
        getResponse.EnsureSuccessStatusCode();
        RecipeResponseDto? recipe = await getResponse.Content.ReadFromJsonAsync<RecipeResponseDto>();
        recipe.Should().NotBeNull();
        recipe!.Title.Should().Be("User A's Recipe", "Recipe should not have been modified by User B");
    }

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserBTriesToDeleteIt_Then_Returns404NotFound()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "User A's Recipe to Protect");

        // Act - User B tries to delete User A's recipe
        AuthenticateAs(_userB);
        HttpResponseMessage response = await _client.DeleteAsync($"/api/Recipe/{recipeId}");

        // Assert - Should return 404 to prevent information leakage
        response.StatusCode.Should().Be(HttpStatusCode.NotFound,
            "User B should not be able to delete User A's recipe");

        // Verify recipe still exists by checking as User A
        AuthenticateAs(_userA);
        HttpResponseMessage getResponse = await _client.GetAsync($"/api/Recipe/{recipeId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK, "Recipe should still exist after failed delete attempt");
    }

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserAAccessesIt_Then_ReturnsOkWithRecipe()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "User A's Own Recipe");

        // Act - User A accesses their own recipe
        AuthenticateAs(_userA);
        HttpResponseMessage response = await _client.GetAsync($"/api/Recipe/{recipeId}");

        // Assert - Should successfully retrieve own recipe
        response.StatusCode.Should().Be(HttpStatusCode.OK, "User A should be able to access their own recipe");

        RecipeResponseDto? recipe = await response.Content.ReadFromJsonAsync<RecipeResponseDto>();
        recipe.Should().NotBeNull();
        recipe!.Id.Should().Be(recipeId);
        recipe.Title.Should().Be("User A's Own Recipe");
        recipe.UserId.Should().Be(_userA, "Recipe should belong to User A");
    }

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserAUpdatesIt_Then_ReturnsOkWithUpdatedRecipe()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "Original Title");

        var updateRequest = new RecipeRequestDto
        {
            Title = "Updated Title by Owner",
            Instructions = "Updated instructions",
            Servings = 6
        };

        // Act - User A updates their own recipe
        AuthenticateAs(_userA);
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/api/Recipe/{recipeId}", updateRequest);

        // Assert - Should successfully update own recipe
        response.StatusCode.Should().Be(HttpStatusCode.OK, "User A should be able to update their own recipe");

        RecipeResponseDto? recipe = await response.Content.ReadFromJsonAsync<RecipeResponseDto>();
        recipe.Should().NotBeNull();
        recipe!.Title.Should().Be("Updated Title by Owner");
        recipe.Servings.Should().Be(6);
        recipe.UserId.Should().Be(_userA);
    }

    [Fact]
    public async Task Given_UserACreatesRecipe_When_UserADeletesIt_Then_ReturnsNoContent()
    {
        // Arrange - User A creates a recipe
        Guid recipeId = await CreateRecipeAs(_userA, "Recipe to Delete");

        // Act - User A deletes their own recipe
        AuthenticateAs(_userA);
        HttpResponseMessage response = await _client.DeleteAsync($"/api/Recipe/{recipeId}");

        // Assert - Should successfully delete own recipe
        response.StatusCode.Should().Be(HttpStatusCode.NoContent, "User A should be able to delete their own recipe");

        // Verify recipe no longer exists
        HttpResponseMessage getResponse = await _client.GetAsync($"/api/Recipe/{recipeId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound, "Recipe should no longer exist after deletion");
    }

    [Fact]
    public async Task Given_MultipleUsersCreateRecipes_When_GetAllRecipes_Then_ReturnsOnlyOwnRecipes()
    {
        // Arrange - User A creates 2 recipes
        await CreateRecipeAs(_userA, "User A Recipe 1");
        await CreateRecipeAs(_userA, "User A Recipe 2");

        // User B creates 2 recipes
        await CreateRecipeAs(_userB, "User B Recipe 1");
        await CreateRecipeAs(_userB, "User B Recipe 2");

        // Act - User A gets all recipes
        AuthenticateAs(_userA);
        HttpResponseMessage responseA = await _client.GetAsync("/api/Recipe");
        responseA.EnsureSuccessStatusCode();

        List<RecipeResponseDto>? recipesA = await responseA.Content.ReadFromJsonAsync<List<RecipeResponseDto>>();
        recipesA.Should().NotBeNull();

        // Act - User B gets all recipes
        AuthenticateAs(_userB);
        HttpResponseMessage responseB = await _client.GetAsync("/api/Recipe");
        responseB.EnsureSuccessStatusCode();

        List<RecipeResponseDto>? recipesB = await responseB.Content.ReadFromJsonAsync<List<RecipeResponseDto>>();
        recipesB.Should().NotBeNull();

        // Assert - User A should only see their own recipes
        recipesA!.Should().HaveCount(2, "User A should only see their 2 recipes");
        recipesA.Should().AllSatisfy(recipe =>
            recipe.UserId.Should().Be(_userA, "All recipes should belong to User A"));
        recipesA.Select(r => r.Title).Should().Contain(new[] { "User A Recipe 1", "User A Recipe 2" });

        // Assert - User B should only see their own recipes
        recipesB!.Should().HaveCount(2, "User B should only see their 2 recipes");
        recipesB.Should().AllSatisfy(recipe =>
            recipe.UserId.Should().Be(_userB, "All recipes should belong to User B"));
        recipesB.Select(r => r.Title).Should().Contain(new[] { "User B Recipe 1", "User B Recipe 2" });
    }

    [Fact]
    public async Task Given_UserCreatesRecipe_When_CreateRecipe_Then_UserIdIsAutomaticallyInjectedFromJWT()
    {
        // Arrange
        var request = new RecipeRequestDto
        {
            Title = "JWT UserId Injection Test",
            Instructions = "Verify userId comes from JWT, not request body",
            Servings = 4
            // Note: UserId is NOT in the DTO (removed for security - Story 5.4)
        };

        // Act - User A creates a recipe
        AuthenticateAs(_userA);
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/Recipe", request);

        // Assert - Recipe should be created with userId from JWT
        response.StatusCode.Should().Be(HttpStatusCode.Created, "Recipe creation should succeed");

        RecipeResponseDto? recipe = await response.Content.ReadFromJsonAsync<RecipeResponseDto>();
        recipe.Should().NotBeNull();
        recipe!.UserId.Should().Be(_userA, "UserId must be injected from JWT token, not client request");
        recipe.Title.Should().Be("JWT UserId Injection Test");
    }

    #endregion

    #region Authentication Tests

    [Fact]
    public async Task Given_UnauthenticatedRequest_When_GetRecipes_Then_Returns401Unauthorized()
    {
        // Arrange - Remove authentication header
        _client.DefaultRequestHeaders.Remove(TestAuthHandler.UserIdHeaderName);

        // Act
        HttpResponseMessage response = await _client.GetAsync("/api/Recipe");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "Unauthenticated requests should be rejected");
    }

    [Fact]
    public async Task Given_UnauthenticatedRequest_When_CreateRecipe_Then_Returns401Unauthorized()
    {
        // Arrange - Remove authentication header
        _client.DefaultRequestHeaders.Remove(TestAuthHandler.UserIdHeaderName);

        var request = new RecipeRequestDto
        {
            Title = "Test Recipe",
            Servings = 4
        };

        // Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/Recipe", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized,
            "Unauthenticated requests should be rejected");
    }

    #endregion
}