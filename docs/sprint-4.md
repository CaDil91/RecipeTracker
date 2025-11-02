# Sprint 4: Backend API Authentication

**Sprint Goal:** Secure the FoodBudget backend API to require and validate JWT access tokens from Microsoft Entra External ID.

**Status:** 📋 READY FOR IMPLEMENTATION
**Target Completion:** TBD
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)

---

## Sprint Context

**What This Sprint Delivers:**
- Protected backend API that rejects unauthenticated requests
- JWT token validation from Microsoft Entra External ID
- Foundation for Sprint 5 (user sign-up and mobile app integration)

**What This Sprint Does NOT Include:**
- User sign-up/sign-in flows (Sprint 5)
- Mobile app authentication integration (Sprint 5)
- Social provider configuration (Sprint 5)
- Custom branding (Sprint 5)

**Authentication Platform:** Microsoft Entra External ID (External Tenants)
**Backend:** ASP.NET Core Web API (.NET 8) on Azure App Service

**Key Architectural Decision:**
- Backend validates JWT tokens (no Entra API calls during request processing)
- Production tenant for all environments (FREE up to 50K MAU)
- Testing with manually generated tokens (via Azure Portal "Run user flow")

**Reference Documentation:**
- 📖 [Implementation Guide](./entra-external-id-setup-guide.md) - Complete technical reference
- 📖 [Operations Guide](./operations/entra-operations-guide.md) - Post-launch admin procedures
- 📚 [Research Archive](./archive/entra-research-archive.md) - Decision history

---

## User Stories

### Story 4.1: Create Authentication Infrastructure

**Title:** Set up Microsoft Entra External ID tenant and API registration

**User Story:**
As a **developer**, I want to create the authentication infrastructure in Azure, so that the FoodBudget API can validate JWT tokens from Entra External ID.

**Acceptance Criteria:**
- [ ] External tenant created with domain `foodbudget.ciamlogin.com`
- [ ] Tenant is production-tier (not trial) and linked to Azure subscription
- [ ] Backend API registration created with Application ID URI set to `api://<client-id>`
- [ ] API token version set to v2 in manifest (`"accessTokenAcceptedVersion": 2`)
- [ ] Application (client) ID and tenant ID documented securely
- [ ] Authority URL documented: `https://foodbudget.ciamlogin.com/`

**Definition of Done:**
- [ ] Tenant accessible via Microsoft Entra admin center
- [ ] API app registration visible in tenant
- [ ] Configuration values documented in secure location (e.g., Azure Key Vault, password manager)
- [ ] Tenant ID, API client ID, and authority URL ready for backend configuration

**Technical Notes/Constraints:**
- **Tenant location:** United States (cannot be changed after creation)
- **Domain name:** `foodbudget` becomes `foodbudget.ciamlogin.com` (permanent, cannot change)
- **Critical:** Must set API token version to v2 - prevents `IDX20804` cryptographic errors
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Prerequisites:** Azure subscription, account with Tenant Creator role, MFA enabled on admin account
- **Mobile app registration:** Created in Story 4.2 (needed for testing)
- **Reference:** [Tenant Setup Process](./entra-external-id-setup-guide.md#6-tenant-setup-process-) (lines 6-305)

**Configuration Checklist:**
1. Navigate to Microsoft Entra admin center (https://entra.microsoft.com)
2. Create external tenant (tenant type: External, subscription-based)
3. Record tenant ID and domain name
4. Register API application
5. Set Application ID URI: `api://<client-id>`
6. Edit manifest: Set `"accessTokenAcceptedVersion": 2`
7. Save and document all configuration values

**Estimated Effort:** 1-3 hours

**Priority:** 🔴 MUST HAVE (Foundation for API protection)

---

### Story 4.2: Register Mobile App for Testing

**Title:** Register mobile application to enable token generation for testing

**User Story:**
As a **developer**, I want to register the mobile app in Entra External ID, so that I can generate test tokens to validate the API protection in Story 4.4.

**Acceptance Criteria:**
- [ ] Mobile app registration created in Entra External ID tenant
- [ ] App type configured as "Public client (mobile & desktop)"
- [ ] Redirect URI configured (placeholder for testing, will be updated in Sprint 5)
- [ ] Mobile app granted delegated permissions to access backend API
- [ ] Admin consent granted for API permissions
- [ ] Mobile app client ID documented securely
- [ ] Can use mobile app with "Run user flow" to generate test tokens

**Definition of Done:**
- [ ] Mobile app registration visible in Entra tenant
- [ ] Public client flow enabled (required for mobile apps)
- [ ] API permissions configured and consented
- [ ] Mobile app client ID documented for Story 4.4 testing
- [ ] Redirect URI documented (even if placeholder)

**Technical Notes/Constraints:**

**Why This Story Exists:**
- Enables token generation for testing in Story 4.4
- Prevents creating throwaway infrastructure
- Mobile app registration already exists when Sprint 5 begins
- Clear separation from API registration (different concerns)

**App Registration Configuration:**
- **App name:** "FoodBudget Mobile App"
- **Supported account types:** Accounts in this organizational directory only (external tenant)
- **Platform:** Mobile and desktop applications
- **Public client:** Must enable "Allow public client flows" = Yes
- **Redirect URI (placeholder):** `msauth://com.foodbudget.app/callback` (update in Sprint 5 with actual MSAL config)

**API Permissions to Grant:**
1. Navigate to mobile app → API permissions
2. Add permission → My APIs → Select "FoodBudget API" (from Story 4.1)
3. Select delegated permissions (e.g., `access_as_user` or custom scope)
4. Grant admin consent for the tenant
5. Verify: Permission shows "Granted for [tenant]"

**Why NOT Defer to Sprint 5:**
- ❌ Story 4.4 needs tokens to test API protection
- ❌ Would require creating temporary test app (wasted effort)
- ✅ Sprint 5 can focus on MSAL integration (app registration already exists)
- ✅ Redirect URI can be placeholder now, updated in Sprint 5

**Testing Readiness:**
After this story completes, Story 4.4 can:
1. Create a user flow
2. Assign mobile app to user flow
3. Use "Run user flow" to authenticate
4. Extract access token from redirect
5. Test API with token

**Reference:** [App Registration](./entra-external-id-setup-guide.md) (lines 189-272)

**Configuration Checklist:**
1. Entra admin center → App registrations → New registration
2. Name: "FoodBudget Mobile App"
3. Supported account types: External tenant only
4. Platform: Mobile and desktop
5. Redirect URI: `msauth://com.foodbudget.app/callback` (placeholder)
6. Register → Record client ID
7. Authentication → Enable "Allow public client flows" = Yes
8. API permissions → Add permission → My APIs → FoodBudget API
9. Select delegated permission → Grant admin consent
10. Verify permissions granted

**Estimated Effort:** 30 minutes - 1 hour

**Priority:** 🔴 MUST HAVE (Enables Story 4.4 testing)

---

### Story 4.3: Configure Backend JWT Validation

**Title:** Secure backend API to require and validate JWT tokens

**User Story:**
As a **FoodBudget developer**, I want the backend API to reject unauthenticated requests, so that user data remains private and secure.

**Acceptance Criteria:**
- [ ] Microsoft.Identity.Web package installed and configured
- [ ] Backend API validates JWT access tokens from Entra External ID
- [ ] Unauthenticated requests return HTTP 401 Unauthorized
- [ ] Invalid tokens return HTTP 401 Unauthorized
- [ ] Expired tokens return HTTP 401 Unauthorized
- [ ] Valid tokens allow access to protected endpoints
- [ ] User ID (`sub` claim) extracted from token and available in controllers
- [ ] User email extracted from token (if needed for logging/display)
- [ ] Public endpoints (e.g., health check) remain accessible without `[Authorize]` attribute
- [ ] Can use `[Authorize]` selectively on controllers/actions
- [ ] Local development and testing works without Azure App Service

**Definition of Done:**
- [ ] Microsoft.Identity.Web package installed via NuGet
- [ ] Authority URL set to `https://foodbudget.ciamlogin.com/` in appsettings.json
- [ ] API client ID and tenant ID configured in appsettings.json
- [ ] Authentication and authorization middleware configured in Program.cs
- [ ] At least one protected endpoint exists with `[Authorize]` attribute
- [ ] At least one public endpoint exists without `[Authorize]` (e.g., health check)
- [ ] Code reviewed
- [ ] Unit tests verify token validation configuration

**Technical Notes/Constraints:**

**Why Microsoft.Identity.Web (Not App Service Auth):**
- ✅ **Better security:** Validates tokens at application level (defense in depth)
- ✅ **Well-documented:** Official quickstart for External ID exists
- ✅ **Deployment flexibility:** Works on any platform (Azure, AWS, on-premises)
- ✅ **Easy local testing:** Standard ASP.NET Core, no special mocking needed
- ✅ **Full control:** Selective endpoint protection with `[Authorize]` attributes
- ✅ **Role-based authorization:** Standard ASP.NET Core `[Authorize(Roles = "")]` works
- ⚠️ **App Service Auth:** Can interfere with Microsoft.Identity.Web - keep disabled

**Authority & Token Configuration:**
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Token version:** Must match v2 (configured in Story 4.1, prevents cryptographic errors)
- **Audience:** `api://<api-client-id>` (API identifier URI from Story 4.1)

**Expected Claims in Access Tokens (To Be Verified in Story 4.4):**
- `sub` - User identifier (use for userId - **changed from B2C's `oid`**)
- `email` - User's email address (string - **changed from B2C's `emails` array**)
- `name` - Display name (optional)
- `aud` - Audience (should match API client ID)
- `iss` - Issuer (should match Entra tenant URL)
- `exp` - Token expiration (Unix timestamp)
- `scp` or `scopes` - Delegated permissions (format unknown, verify in Story 4.4)

⚠️ **Access token claims partially documented** - ID token claims are known, but access token structure needs verification in Story 4.4

**Migration Notes (from Azure AD B2C):**
- ❌ OLD: `oid` claim for user ID → ✅ NEW: `sub` claim
- ❌ OLD: `emails` array → ✅ NEW: `email` string
- ❌ OLD: Long claim URIs → ✅ NEW: Short OIDC claims

**Reference:**
- [Official Quickstart](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-web-api-dotnet-protect-app?tabs=aspnet-core)
- [Implementation Guide - Token Claims](./entra-external-id-setup-guide.md#token-claims--partially-documented) (lines 1101-1216)

---

**Implementation Steps:**

**Step 1: Install NuGet Packages**
```bash
dotnet add package Microsoft.Identity.Web
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

**Note:** `Microsoft.AspNetCore.Authentication.JwtBearer` is typically included as a dependency of `Microsoft.Identity.Web`, but it's listed here for completeness. If you encounter build errors, ensure both packages are installed.

**Step 2: Configure appsettings.json**
```json
{
  "AzureAd": {
    "Instance": "https://foodbudget.ciamlogin.com/",
    "TenantId": "<tenant-id-from-story-4.1>",
    "ClientId": "<api-client-id-from-story-4.1>",
    "Audience": "api://<api-client-id-from-story-4.1>",
    "Scopes": {
      "Read": ["access_as_user"],
      "Write": ["access_as_user"]
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**Note on Scopes Configuration:**
- **Scopes** (delegated permissions): Used when user authenticates via mobile app - enables fine-grained permission checking with `RequiredScopeOrAppPermission` attribute
- **AppPermissions** (application permissions): Used for app-only tokens (daemon apps, background services) - not needed for FoodBudget MVP
- **MVP Status**: Optional - `[Authorize]` attribute alone provides sufficient protection
- **Post-MVP**: Can add scope-based authorization for fine-grained access control

**Example with AppPermissions (Post-MVP):**
```json
"AzureAd": {
  "Scopes": {
    "Read": ["access_as_user"],
    "Write": ["access_as_user"]
  },
  "AppPermissions": {
    "Read": ["Recipes.Read.All"],
    "Write": ["Recipes.Write.All"]
  }
}
```

**Step 3: Configure Program.cs**
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// Add authentication with Microsoft.Identity.Web
// AddMicrosoftIdentityWebApi reads from "AzureAd" section by default
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration);

// Add authorization services
builder.Services.AddAuthorization();

// Add controllers
builder.Services.AddControllers();

var app = builder.Build();

// Configure middleware (ORDER MATTERS)
app.UseHttpsRedirection();
app.UseAuthentication();  // Must come before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
```

**Note:** No need to specify `.GetSection("AzureAd")` - Microsoft.Identity.Web reads from "AzureAd" section automatically.

**Step 4: Protect Controllers/Actions**
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;  // For GetObjectId() extension method

namespace FoodBudget.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipesController : ControllerBase
    {
        // Protected endpoint - requires valid JWT
        [Authorize]
        [HttpGet]
        public IActionResult GetMyRecipes()
        {
            // METHOD 1: Using Microsoft.Identity.Web extension method (RECOMMENDED)
            var userId = HttpContext.User.GetObjectId();

            // METHOD 2: Manual claim extraction (alternative)
            // var userId = User.FindFirst("sub")?.Value;
            // var userId = User.FindFirst("oid")?.Value; // Workforce tenants

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            // Extract email (optional, for logging/display)
            var email = User.FindFirst("email")?.Value;

            // Extract display name (optional)
            var displayName = User.FindFirst("name")?.Value;

            // Use userId to filter user-specific data
            var recipes = GetRecipesForUser(userId);

            return Ok(new {
                recipes = recipes,
                user = new { userId, email, displayName }
            });
        }

        // Public endpoint - no authentication required
        [HttpGet("public")]
        public IActionResult GetPublicRecipes()
        {
            var publicRecipes = GetPublicRecipeList();
            return Ok(publicRecipes);
        }
    }

    // Health check endpoint - public
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
}
```

**Note on User ID Extraction:**
- **`GetObjectId()`** extension method (from Microsoft.Identity.Web) automatically handles `sub` and `oid` claims
- Works with both External ID (`sub`) and Workforce tenants (`oid`)
- Recommended approach for maximum compatibility

**Step 5: Test Locally**
```bash
# Run the API
dotnet run

# Should start without errors
# Authentication is configured but not yet tested with tokens (Story 4.4)
```

---

**How Claims Are Accessed:**
- ✅ `HttpContext.User.GetObjectId()` - User identifier (RECOMMENDED - handles `sub` and `oid` automatically)
- ✅ `User.FindFirst("sub")?.Value` - User identifier (manual extraction)
- ✅ `User.FindFirst("email")?.Value` - User email
- ✅ `User.FindFirst("name")?.Value` - Display name
- ✅ `User.Identity.IsAuthenticated` - Check if authenticated
- ✅ Works in any controller action with `[Authorize]` attribute

**Authorization (Role-Based & Scope-Based):**
```csharp
// Role-based authorization (post-MVP)
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public IActionResult DeleteRecipe(int id) { ... }

// Policy-based authorization (post-MVP)
[Authorize(Policy = "CanManageRecipes")]
[HttpPut("{id}")]
public IActionResult UpdateRecipe(int id) { ... }

// Scope-based authorization (post-MVP)
// Requires Scopes configuration in appsettings.json (see Step 2)
[RequiredScopeOrAppPermission(
    RequiredScopesConfigurationKey = "AzureAd:Scopes:Write",
    RequiredAppPermissionsConfigurationKey = "AzureAd:AppPermissions:Write"
)]
[HttpPost]
public IActionResult CreateRecipe() { ... }
```

**Note:** Fine-grained authorization (roles, policies, scopes) is optional for MVP. `[Authorize]` attribute alone provides sufficient protection for Sprint 4.

**Distinguishing App Tokens from User Tokens (Post-MVP):**

If you need to support both user authentication and app-only authentication (daemon apps, background services), use the `idtyp` claim to distinguish token types:

```csharp
private bool IsAppMakingRequest()
{
    // PRIMARY: Check idtyp claim (easiest method)
    if (HttpContext.User.Claims.Any(c => c.Type == "idtyp"))
    {
        return HttpContext.User.Claims.Any(c => c.Type == "idtyp" && c.Value == "app");
    }

    // FALLBACK: If idtyp claim not present
    // App tokens have 'roles' claim, user tokens have 'scp' claim
    return HttpContext.User.Claims.Any(c => c.Type == "roles") &&
           !HttpContext.User.Claims.Any(c => c.Type == "scp");
}

// Usage in controller
[HttpGet]
[RequiredScopeOrAppPermission(
    RequiredScopesConfigurationKey = "AzureAd:Scopes:Read",
    RequiredAppPermissionsConfigurationKey = "AzureAd:AppPermissions:Read"
)]
public async Task<IActionResult> GetRecipes()
{
    var userId = GetUserId();

    // Filter based on token type
    if (IsAppMakingRequest())
    {
        // App token: Return all recipes (admin access)
        return Ok(await _context.Recipes.ToListAsync());
    }
    else
    {
        // User token: Return only user's recipes
        return Ok(await _context.Recipes.Where(r => r.UserId == userId).ToListAsync());
    }
}
```

**FoodBudget MVP:** Only supports user tokens (mobile app authentication). App-only tokens are post-MVP feature.

---

**Testing with Daemon Apps (Post-MVP):**

If you need to test app-only authentication (background services, admin tools, data migration), create a daemon application using client credentials flow:

**1. Register Daemon App in Entra:**
- Create new app registration: "FoodBudget Daemon"
- Platform: None (daemon apps don't have redirect URIs)
- Create client secret (record immediately - can't retrieve later)
- API permissions: Add application permissions (e.g., `Recipes.Read.All`)
- Grant admin consent for tenant

**2. Create Console App for Testing:**
```bash
dotnet new console -o FoodBudgetTestDaemon
cd FoodBudgetTestDaemon
dotnet add package Microsoft.Identity.Client
```

**3. Implement Token Acquisition:**
```csharp
using Microsoft.Identity.Client;
using System.Net.Http.Headers;

var clientId = "<daemon-app-client-id>";
var clientSecret = "<daemon-app-client-secret>";
var tenantId = "<tenant-id>";
var scopes = new[] { "api://<api-client-id>/.default" };

// For External ID tenants
var authority = "https://foodbudget.ciamlogin.com/";

// Build confidential client
var app = ConfidentialClientApplicationBuilder
    .Create(clientId)
    .WithAuthority(authority + tenantId)
    .WithClientSecret(clientSecret)
    .Build();

// Acquire app-only token
var result = await app.AcquireTokenForClient(scopes).ExecuteAsync();
Console.WriteLine($"Access Token: {result.AccessToken}");

// Call protected API
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", result.AccessToken);

var response = await client.GetAsync("https://localhost:5001/api/recipes");
var content = await response.Content.ReadAsStringAsync();

Console.WriteLine($"Response: {response.StatusCode}");
Console.WriteLine(content);
```

**Note on Scopes for Daemon Apps:**
- Use `.default` scope: `api://<api-client-id>/.default`
- Grants all application permissions assigned to the daemon app
- Different from delegated permissions (user scopes)

**Reference:** [Tutorial: Call Protected API from Daemon App](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-call-protected-api)

---

**Local Development:**
- Works normally - no App Service required
- Configure `launchSettings.json` with HTTPS
- Use test tokens from Story 4.4 with Postman/curl

**Deployment:**
- Works on any platform (Azure App Service, AWS, on-premises, containers)
- No special App Service configuration needed
- Just ensure environment variables or appsettings.json are configured

⚠️ **IMPORTANT:** Do NOT enable "App Service Authentication" in Azure Portal - it will interfere with Microsoft.Identity.Web

**Estimated Effort:** 2-4 hours

**Priority:** 🔴 MUST HAVE (Core API security)

---

### Story 4.4: Test API Protection with Manual Tokens

**Title:** Verify JWT validation works with real tokens from Entra

**User Story:**
As a **developer**, I want to test the protected API with real tokens, so that I can verify authentication works before integrating the mobile app.

**Acceptance Criteria:**

**Token Generation & Testing:**
- [ ] Can generate test tokens via Azure Portal "Run user flow"
- [ ] Protected API endpoint tested with valid token (200 OK)
- [ ] Protected API endpoint tested without token (401 Unauthorized)
- [ ] Protected API endpoint tested with invalid token (401 Unauthorized)
- [ ] Protected API endpoint tested with expired token (401 Unauthorized)

**Claims Verification (Critical - Answers Questions from Story 4.3):**
- [ ] `sub` claim exists in access token and userId extraction works
- [ ] `email` claim exists and is string format (not array)
- [ ] `aud` claim verified (matches API client ID)
- [ ] `iss` claim verified (matches Entra tenant URL)
- [ ] `exp` claim verified (Unix timestamp format)
- [ ] `scp` or `scopes` claim format documented (if present)
- [ ] Any additional claims documented (oid, appid, azp, etc.)

**Documentation Deliverable:**
- [ ] Actual access token claims structure documented (for Sprint 5)
- [ ] Comparison with expected claims noted (any differences)
- [ ] Backend code pattern verified (`User.FindFirst("sub")` works)

**Definition of Done:**
- [ ] Test tokens generated and documented
- [ ] Postman collection or curl commands documented for API testing
- [ ] All acceptance criteria tested and passing
- [ ] Token claims structure verified and documented
- [ ] Integration tests written for token validation scenarios

**Technical Notes/Constraints:**

**Sprint 4 Testing Approach:**
This story uses **user tokens** (delegated permissions) generated via Azure Portal's "Run user flow" feature. This is the simplest approach and matches FoodBudget's MVP authentication model (mobile app users).

**Alternative Testing Approach (Post-MVP):**
For testing app-only authentication (daemon apps), see Story 4.3 "Testing with Daemon Apps (Post-MVP)" section. This approach:
- Requires creating a daemon app registration and console application
- Uses client credentials flow (app-only tokens)
- Tests application permissions instead of delegated permissions
- Useful for: background services, admin tools, data migration scripts
- Reference: [Tutorial Part 2](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-call-protected-api)

**Sprint 4 uses the simpler approach** (user flow tokens) because:
- ✅ No code needed - just Azure Portal UI
- ✅ Tests the actual authentication model for FoodBudget MVP
- ✅ Mobile app registration already exists (Story 4.2)
- ✅ Faster to implement and validate

---

**Generating Test Tokens (Sprint 4 Approach):**
1. Azure Portal → Entra External ID → User flows (create temporary test flow if needed)
2. Click "Run user flow"
3. Complete authentication in browser
4. Copy access token from redirect URL or browser developer tools
5. Use token with API: `Authorization: Bearer <token>`

**Inspecting Token Claims (Before Testing API):**
- **jwt.ms:** Paste token to https://jwt.ms for easy claim viewing
- **jwt.io:** Paste token to https://jwt.io for detailed inspection
- **Purpose:** Verify claim structure BEFORE testing API (answers questions from Story 4.3)
- **What to look for:**
  - Is `sub` present? (user identifier)
  - Is `email` present and string format (not array)?
  - What is `aud` value? (should be `api://<api-client-id>`)
  - What is `iss` value? (issuer URL)
  - Are there additional claims? (`scp`, `oid`, `appid`, `azp`, etc.)

**Testing with Postman:**
```
GET https://foodbudget-api.azurewebsites.net/api/recipes
Headers:
  Authorization: Bearer <access-token-here>
```

**Testing with curl:**
```bash
curl -H "Authorization: Bearer <access-token>" \
     https://foodbudget-api.azurewebsites.net/api/recipes
```

**Token Claims to Verify (Answers Critical Questions):**
- `sub` claim exists and has value (confirms user ID extraction works)
- `email` claim exists (verify format: string, not array - different from B2C)
- `aud` matches API client ID (audience validation)
- `iss` matches Entra tenant URL (issuer validation)
- `exp` is future timestamp (expiration)
- `scp` or `scopes` format (delegated permissions - format unknown)
- Any additional claims present? (document all for Sprint 5)

**Prerequisites:**
- Story 4.1 complete (tenant + API registration)
- Story 4.2 complete (mobile app registration)
- Story 4.3 complete (JWT validation configured)
- Temporary user flow created OR Sprint 5 user flow (if available)

**Testing Scenarios:**

| Scenario | Expected Result | Status |
|----------|----------------|--------|
| Valid token | 200 OK + data | [ ] |
| No token | 401 Unauthorized | [ ] |
| Invalid token (malformed) | 401 Unauthorized | [ ] |
| Expired token | 401 Unauthorized | [ ] |
| Token from wrong tenant | 401 Unauthorized | [ ] |
| Extract `sub` claim | userId populated | [ ] |
| Extract `email` claim | email populated | [ ] |

**Documentation Deliverable:**
- Document actual token claims structure (compare with expected)
- Create Postman collection for API testing
- Document any differences from expected claims (for Sprint 5)

**Estimated Effort:** 1-2 hours

**Priority:** 🔴 MUST HAVE (Validates Sprint 4 success)

---

### Story 4.5: Implement Rate Limiting for Sign-Up Endpoints (Optional)

**Title:** Protect sign-up endpoints from bot-driven mass registrations

**User Story:**
As a **FoodBudget developer**, I want to rate-limit authentication endpoints, so that bots cannot abuse the API and increase our costs.

**Acceptance Criteria:**
- [ ] Sign-up endpoints rate-limited to 10 requests per IP per hour
- [ ] Sign-in endpoints rate-limited to 50 requests per IP per hour (more lenient)
- [ ] Password reset rate-limited to 5 requests per IP per hour
- [ ] Rate-limited requests return HTTP 429 Too Many Requests
- [ ] Error response includes retry-after time
- [ ] Rate limiting does not affect legitimate users
- [ ] Configuration is environment-specific (stricter in production)
- [ ] Tests verify rate limiting behavior

**Definition of Done:**
- [ ] Rate limiting middleware configured in backend
- [ ] Manual testing confirms 11th request blocked
- [ ] Unit tests verify rate limit logic
- [ ] Rate limits documented in API documentation
- [ ] Monitoring alerts configured for unusual patterns (optional)

**Technical Notes/Constraints:**
- **Implementation options:**
  - ASP.NET Core built-in rate limiting (.NET 7+) - simpler
  - AspNetCoreRateLimit package - more features
- **Rate by IP address:** Not user ID (users may not be authenticated for some endpoints)
- **Defense in depth:**
  - Email verification (Sprint 5) - Slows bots
  - Backend rate limiting (this story) - Prevents mass creation
  - Social login (60%+ of users) - Google/Facebook handle bots
  - Entra baseline security (automatic) - DDoS protection
- **Cost protection:** Prevents bot-driven MAU costs (Entra charges per active user >50K)
- **X-Forwarded-For header:** Consider if behind proxy/load balancer
- **Reference:** [Rate Limiting Implementation](./entra-external-id-setup-guide.md) (lines 751-905)

**Implementation Example (ASP.NET Core Built-In):**
```csharp
// Program.cs
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    // Fixed window rate limiter for sign-up
    options.AddFixedWindowLimiter("signup", rateLimitOptions =>
    {
        rateLimitOptions.PermitLimit = 10;
        rateLimitOptions.Window = TimeSpan.FromHours(1);
        rateLimitOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        rateLimitOptions.QueueLimit = 0;
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            error = "Too many requests. Please try again later.",
            retryAfter = "1 hour"
        }, cancellationToken);
    };
});

var app = builder.Build();
app.UseRateLimiter();
```

**Testing:**
```bash
# Test rate limiting with curl
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"Test123!"}'
  echo "Request $i completed"
done

# Expected: First 10 succeed, requests 11-15 return 429
```

**Estimated Effort:** 2-4 hours

**Priority:** 🟡 SHOULD HAVE (Important for cost control, but not critical path)

---

## Sprint Success Criteria

### Functional Requirements (Must Have)
- ✅ Entra External ID tenant created and configured
- ✅ Backend API registration created with token v2
- ✅ Mobile app registration created for testing
- ✅ Backend API validates JWT tokens via Microsoft.Identity.Web
- ✅ Unauthenticated requests return 401
- ✅ Valid tokens allow API access
- ✅ User ID extracted from `sub` claim
- ✅ API protection tested with manual tokens

### Non-Functional Requirements
- ✅ Configuration documented and secure (Key Vault or password manager)
- ✅ Token validation tested (valid, invalid, expired, missing)
- ✅ Token claims structure verified and documented for Sprint 5

### Optional (Should Have)
- 🟡 Rate limiting configured for authentication endpoints

---

## Testing Strategy

### Unit Tests
- Token validation configuration
- Rate limiting middleware (if Story 4.4 implemented)
- Claim extraction logic

### Integration Tests
- Protected API with valid token → 200 OK
- Protected API without token → 401 Unauthorized
- Protected API with invalid token → 401 Unauthorized
- Protected API with expired token → 401 Unauthorized
- User ID extraction from token claims

### Manual Testing
- Generate test token via Azure Portal
- Test protected endpoint with Postman/curl
- Test all 401 scenarios
- Verify token claims structure matches expectations
- Test rate limiting (if implemented)

---

## Technical Reference

### Key Configuration Values
- **Tenant Domain:** `foodbudget.ciamlogin.com`
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Token Version:** v2 (set in API manifest)
- **Application ID URI:** `api://<api-client-id>`

### Architecture Decisions
- **Tenant Strategy:** Production tenant (FREE up to 50K MAU)
- **Authentication Approach:** Microsoft.Identity.Web (code-based, deployment-flexible)
- **Token Validation:** JWT validation at application level, no Entra API calls during requests
- **Testing Approach:** Manual tokens via Azure Portal "Run user flow"
- **Mobile App Registration:** Created in Sprint 4 for testing (ready for Sprint 5 MSAL integration)

### Cost Summary
- **Entra External ID:** FREE (0-50,000 MAU)
- **Sprint 4 Cost:** $0

---

## Resources

### FoodBudget Documentation
- **Implementation Guide:** [entra-external-id-setup-guide.md](./entra-external-id-setup-guide.md) - Complete technical reference
- **Operations Guide:** [operations/entra-operations-guide.md](./operations/entra-operations-guide.md) - Post-launch admin procedures
- **Research Archive:** [archive/entra-research-archive.md](./archive/entra-research-archive.md) - Decision history and alternatives evaluated

### Microsoft Official Tutorials
- **Tutorial Part 1 (Sprint 4 Foundation):** [Build and Protect ASP.NET Core Web API](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-build-app) - User authentication with Microsoft.Identity.Web
- **Tutorial Part 2 (Post-MVP):** [Call Protected API from Daemon App](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-call-protected-api) - App-only authentication with client credentials flow
- **Quickstart:** [Protect ASP.NET Core Web API](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-web-api-dotnet-protect-app) - Quick setup guide
- **External ID Overview:** [Microsoft Entra External ID Documentation](https://learn.microsoft.com/en-us/entra/external-id/customers/) - Product documentation
