# Sprint 4: Backend API Authentication

**Sprint Goal:** Secure the FoodBudget backend API to require and validate JWT access tokens from Microsoft Entra External ID.

**Status:** 🚧 IN PROGRESS (Stories 4.1, 4.2 & 4.3 Complete ✅ | 3/4 must-have stories)
**Target Completion:** TBD
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)

---

## Sprint Context

**What This Sprint Delivers:**
- Protected backend API that rejects unauthenticated requests
- JWT token validation from Microsoft Entra External ID
- Web app (SPA) registration for testing and Sprint 5 Phase 1 (web authentication)
- Foundation for Sprint 5 (user authentication on web, then mobile)

**What This Sprint Does NOT Include:**
- User sign-up/sign-in UI (Sprint 5)
- MSAL integration in web/mobile apps (Sprint 5)
- Social provider configuration (Sprint 5)
- User flows (Sprint 5)
- Custom branding (Sprint 5)

**Authentication Platform:** Microsoft Entra External ID (External Tenants)
**Backend:** ASP.NET Core Web API (.NET 8) on Azure App Service

**Key Architectural Decisions:**
- Backend validates JWT tokens (no Entra API calls during request processing)
- Production tenant for all environments (FREE up to 50K MAU)
- Testing with manually generated tokens (via Azure Portal "Run user flow")
- **Web-first strategy:** Story 4.2 creates web app (SPA) registration
  - Enables testing in Story 4.4 (jwt.ms redirect)
  - Enables Sprint 5 Phase 1 (web authentication on GitHub Pages)
  - Mobile app registration deferred to Sprint 5 Phase 2

**Reference Documentation:**
- 📖 [Implementation Guide](./entra-external-id-setup-guide.md) - Complete technical reference
- 📖 [Operations Guide](./operations/entra-operations-guide.md) - Post-launch admin procedures
- 📚 [Research Archive](./archive/entra-research-archive.md) - Decision history

---

## Table of Contents

### User Stories
- [Story 4.1: Create Authentication Infrastructure](#story-41-create-authentication-infrastructure--complete) ✅ **COMPLETE**
- [Story 4.2: Register Web App for Testing](#story-42-register-web-app-for-testing--complete) ✅ **COMPLETE**
- [Story 4.3: Configure Backend JWT Validation](#story-43-configure-backend-jwt-validation--complete) ✅ **COMPLETE**
- [Story 4.4: Test API Protection with Manual Tokens](#story-44-test-api-protection-with-manual-tokens) ⏳ **NEXT**
- [Story 4.5: Implement Rate Limiting for Sign-Up Endpoints (Optional)](#story-45-implement-rate-limiting-for-sign-up-endpoints-optional) 🟡 **SHOULD HAVE**
- [Story 4.6: Upgrade Recipe Image Upload to User Delegation SAS (Post-MVP)](#story-46-upgrade-recipe-image-upload-to-user-delegation-sas-post-mvp-enhancement) 🟢 **COULD HAVE**

### Other Sections
- [Sprint Success Criteria](#sprint-success-criteria)
- [Testing Strategy](#testing-strategy)
- [Technical Reference](#technical-reference)
- [Resources](#resources)

---

## User Stories

### Story 4.1: Create Authentication Infrastructure ✅ COMPLETE

**Title:** Set up Microsoft Entra External ID tenant and API registration

**Status:** ✅ **COMPLETE** (Completed: 2025-11-04)

**User Story:**
As a **developer**, I want to create the authentication infrastructure in Azure, so that the FoodBudget API can validate JWT tokens from Entra External ID.

**Acceptance Criteria:**
- [x] External tenant created with domain `foodbudget.ciamlogin.com`
- [x] Tenant is production-tier (not trial) and linked to Azure subscription
- [x] Backend API registration created with Application ID URI set to `api://<client-id>`
- [x] API token version set to v2 in manifest (`"requestedAccessTokenVersion": 2`)
- [x] Application (client) ID and tenant ID documented securely
- [x] Authority URL documented: `https://foodbudget.ciamlogin.com/`

**Definition of Done:**
- [x] Tenant accessible via Microsoft Entra admin center
- [x] API app registration visible in tenant
- [x] Configuration values documented in secure location (e.g., Azure Key Vault, password manager)
- [x] Tenant ID, API client ID, and authority URL ready for backend configuration

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

**Actual Effort:** ~2 hours

**Priority:** 🔴 MUST HAVE (Foundation for API protection)

**Status:** ✅ **COMPLETE**

---

### Story 4.2: Register Web App for Testing ✅ COMPLETE

**Title:** Register web application (SPA) to enable token generation and web demo integration

**Status:** ✅ **COMPLETE** (Completed: 2025-11-04)

**User Story:**
As a **developer**, I want to register the web app in Entra External ID, so that I can generate test tokens to validate the API protection in Story 4.4 AND integrate authentication with the React web demo.

**Acceptance Criteria:**
- [x] **PREREQUISITE:** API scope `access_as_user` created in FoodBudgetAPI registration
- [x] Web app (SPA) registration created in Entra External ID tenant
- [x] App type configured as "Single-page application (SPA)"
- [x] Redirect URIs configured:
  - [x] `https://jwt.ms` for easy token testing (Story 4.4)
  - [x] `https://cadil91.github.io/RecipeTracker/` for GitHub Pages deployment
  - [x] `http://localhost:8081/` for local development (Expo web)
- [x] Web app granted delegated permission to `access_as_user` scope
- [x] Admin consent granted for API permissions
- [x] Web app client ID documented securely
- [x] Public client flows enabled (required for SPAs)
- [x] Native authentication disabled (using standard OAuth flow)
- [ ] Can obtain tokens via jwt.ms redirect for testing (will be tested in Story 4.4)

**Definition of Done:**
- [x] API scope `access_as_user` exists in FoodBudgetAPI → Expose an API
- [x] Web app registration visible in Entra tenant
- [x] Public client flow enabled (required for SPAs)
- [x] Native authentication disabled
- [x] All three redirect URIs configured (jwt.ms + GitHub Pages + localhost)
- [x] API permissions configured and consented to `access_as_user` scope
- [x] Web app client ID documented for Story 4.4 testing
- [ ] Verified token can be obtained by authenticating and redirecting to jwt.ms (Story 4.4)

**Estimated Effort:** 45 minutes - 1.5 hours (includes scope creation)
**Actual Effort:** ~1 hour
**Priority:** 🔴 MUST HAVE (Enables Story 4.4 testing)
**Status:** ✅ **COMPLETE**

**Technical Notes/Constraints:**

**Why This Story Exists:**
- Enables token generation for testing in Story 4.4
- Enables authentication integration with existing React web demo (Expo web on GitHub Pages)
- Prevents creating throwaway infrastructure
- Web app registration serves both testing AND production web demo needs
- Clear separation from API registration (different concerns)

**Mobile App Registration Deferred to Sprint 5:**
- Native mobile app registration will be created in Sprint 5 when React Native mobile integration begins
- Web app registration covers current testing and web demo needs
- This prevents creating mobile infrastructure before it's actually needed

**PREREQUISITE: Create API Scope (Do This First)**

Before registering the web app, the API must expose a scope that the web app can request permission to access.

1. Navigate to **FoodBudgetAPI** app registration (from Story 4.1)
2. Go to **Expose an API**
3. Click **+ Add a scope**
4. Configure the scope:
   - **Scope name:** `access_as_user`
   - **Who can consent:** Admins and users
   - **Admin consent display name:** Access FoodBudget API
   - **Admin consent description:** Allows the app to access the FoodBudget API on behalf of the signed-in user
   - **User consent display name:** Access your FoodBudget data
   - **User consent description:** Allows the app to access your recipes and data in FoodBudget
   - **State:** Enabled
5. Click **Add scope**
6. Verify scope appears as: `api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user`

**App Registration Configuration:**
- **App name:** "FoodBudget Web App"
- **Supported account types:** Accounts in this organizational directory only (external tenant)
- **Platform:** Single-page application (SPA)
- **Redirect URIs:**
  - `https://jwt.ms` - For easy token inspection in Story 4.4 testing
  - `https://cadil91.github.io/RecipeTracker/` - For GitHub Pages deployment (React/Expo web)
  - `http://localhost:8081/` - For local development (Expo web default port)
- **Public client flows:** Must enable "Allow public client flows" = Yes
- **Native authentication:** Must set "Enable native authentication" = No

**API Permissions to Grant:**
1. Navigate to web app → API permissions
2. **(Optional)** Remove default Microsoft Graph User.Read permission (cleanup)
3. Add permission → **My APIs** → Select **"FoodBudgetAPI"**
4. Select delegated permission: **`access_as_user`**
5. Click "Add permissions"
6. Click **"Grant admin consent for [tenant]"**
7. Verify: Permission shows "Granted for FoodBudget-Tenent" with green checkmark

**Why Web App First (Mobile Deferred to Sprint 5):**
- ✅ Story 4.4 needs tokens to test API protection
- ✅ Existing React web demo can integrate authentication immediately
- ✅ No mobile app codebase exists yet to test with
- ✅ Sprint 5 will create separate mobile app registration when React Native mobile work begins
- ✅ Simpler to test web authentication flow first

**Testing Readiness:**
After this story completes, Story 4.4 can:
1. Create a user flow
2. Assign web app to user flow
3. Use "Run user flow" to authenticate
4. Extract access token from redirect (jwt.ms)
5. Test API with token using Postman/curl
6. (Bonus) Integrate authentication into React web demo

**Reference:** [App Registration](./entra-external-id-setup-guide.md) (lines 189-272)

**Configuration Checklist:**

**STEP 0: Create API Scope (PREREQUISITE)**
1. Navigate to **FoodBudgetAPI** app registration
2. **Expose an API** → **+ Add a scope**
3. Scope name: `access_as_user`
4. Who can consent: Admins and users
5. Fill in consent display names and descriptions
6. State: Enabled
7. Save and verify scope: `api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user`

**STEP 1: Create Web App (SPA) Registration**
1. Entra admin center → **App registrations** → **+ New registration**
2. Name: "FoodBudget Web App"
3. Supported account types: **Accounts in this organizational directory only** (FoodBudget-Tenent)
4. Redirect URI: Select **Single-page application (SPA)**, enter `https://cadil91.github.io/RecipeTracker/`
5. Click **Register**
6. **Record the Application (client) ID**

**STEP 2: Configure Additional Redirect URIs & Settings**
1. Navigate to **Authentication** (left menu)
2. Under **Single-page application** section, click **+ Add URI**
3. Add: `https://jwt.ms`
4. Click **+ Add URI** again
5. Add: `http://localhost:8081/`
6. Click **Save** (at the top of the page)
7. Scroll to **Advanced settings**
8. **Allow public client flows:** Set to **Yes**
9. **Enable native authentication:** Set to **No**
10. Click **Save** (at the top of the page)

**STEP 3: Configure API Permissions**
1. Navigate to **API permissions** (left menu)
2. **(Optional)** Remove Microsoft Graph User.Read permission
3. Click **+ Add a permission**
4. Select **My APIs** tab
5. Select **FoodBudgetAPI**
6. Select **Delegated permissions**
7. Check **access_as_user**
8. Click **Add permissions**
9. Click **Grant admin consent for FoodBudget-Tenent**
10. Verify status shows "Granted for FoodBudget-Tenent" with green checkmark

**STEP 4: Verify Configuration**
1. Confirm all three redirect URIs are listed under "Single-page application"
2. Confirm public client flows enabled
3. Confirm native authentication disabled
4. Confirm API permission granted and consented
5. Document web app client ID securely

**Estimated Effort:** 45 minutes - 1.5 hours (includes scope creation)

**Priority:** 🔴 MUST HAVE (Enables Story 4.4 testing)

---

### Story 4.3: Configure Backend JWT Validation ✅ COMPLETE

**Title:** Secure backend API to require and validate JWT tokens

**Status:** ✅ **COMPLETE** (Completed: 2025-11-05)

**User Story:**
As a **FoodBudget developer**, I want the backend API to reject unauthenticated requests, so that user data remains private and secure.

**Acceptance Criteria:**
- [x] Microsoft.Identity.Web package installed and configured
- [x] Backend API validates JWT access tokens from Entra External ID
- [x] Unauthenticated requests return HTTP 401 Unauthorized
- [x] Invalid tokens return HTTP 401 Unauthorized (handled by ExceptionHandlingMiddleware)
- [x] Expired tokens return HTTP 401 Unauthorized (handled by authentication middleware)
- [x] Valid tokens allow access to protected endpoints
- [x] User ID (`oid` claim via `GetObjectId()`) extracted from token and available in controllers
- [x] User email extracted from token (available via standard claims)
- [x] Public endpoints (e.g., health check) remain accessible without `[Authorize]` attribute
- [x] Can use `[Authorize]` selectively on controllers/actions
- [x] Local development and testing works without Azure App Service

**Definition of Done:**
- [x] Microsoft.Identity.Web package installed via NuGet
- [x] Authority URL set to `https://foodbudget.ciamlogin.com/` in User Secrets (development)
- [x] API client ID and tenant ID configured in User Secrets (development)
- [x] Authentication and authorization middleware configured in ApplicationConfiguration.cs
- [x] At least one protected endpoint exists with `[Authorize]` attribute (RecipeController)
- [x] At least one public endpoint exists without `[Authorize]` (HealthController)
- [x] Locally tested - health endpoint returns 200, recipe endpoint returns 401
- [ ] Unit tests verify token validation configuration (deferred to Story 4.4)

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

**Expected Claims in Access Tokens (2025 VERIFIED):**
- **`oid`** - Object ID (tenant-consistent user identifier) - **RECOMMENDED for database keys**
- **`sub`** - Subject (app-specific user identifier) - less reliable across apps
- `email` - User's email address (string - **changed from B2C's `emails` array**)
- `name` - Display name (optional)
- `aud` - Audience (should match API client ID)
- `iss` - Issuer (should match Entra tenant URL)
- `exp` - Token expiration (Unix timestamp)
- `scp` - Delegated permissions (space-separated string, e.g., "access_as_user")

✅ **External ID tokens contain BOTH `oid` and `sub` claims** - Use `oid` for user identification (via `GetObjectId()` method)

**Migration Notes (from Azure AD B2C):**
- ✅ **Both `oid` and `sub` exist** in External ID tokens (use `oid` via `GetObjectId()`)
- ❌ OLD: `emails` array → ✅ NEW: `email` string
- ❌ OLD: Long claim URIs → ✅ NEW: Short OIDC claims

**Reference:**
- [Official Quickstart](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-web-api-dotnet-protect-app?tabs=aspnet-core)
- [Implementation Guide - Token Claims](./entra-external-id-setup-guide.md#token-claims--partially-documented) (lines 1101-1216)

---

**📋 2025 RESEARCH FINDINGS (Completed: 2025-11-04)**

**Documentation Status:**
- ✅ Microsoft Learn tutorials last updated: **April 2025** (latest available)
- ✅ Microsoft.Identity.Web v4.0.1 (October 2025) - Current stable version
- ✅ .NET 8 fully supported
- ✅ No deprecation warnings or breaking changes

**Key Findings for External ID:**

1. **Package Installation (SIMPLIFIED):**
   - ✅ `Microsoft.Identity.Web` is sufficient
   - ❌ `Microsoft.AspNetCore.Authentication.JwtBearer` NOT needed separately (included in Microsoft.Identity.Web)

2. **Configuration Structure (VERIFIED):**
   - ✅ `"Instance"` + `"TenantId"` is correct for 2025
   - ⚠️ `"Audience"` property is OPTIONAL (not shown in Microsoft examples - can omit for simplicity)
   - ✅ `"AzureAd"` section name is standard

3. **Claims in External ID Access Tokens (CONFIRMED):**
   - ✅ **`oid`** claim exists (tenant-consistent user ID) - **RECOMMENDED for database keys**
   - ✅ **`sub`** claim exists (app-specific user ID) - less reliable across apps
   - ✅ **`email`** claim is a string (not array like B2C)
   - ✅ **`scp`** claim contains scopes (space-separated string)
   - ✅ **Both `oid` and `sub` exist** in External ID tokens

4. **User ID Extraction (2025 BEST PRACTICE):**
   - ✅ `HttpContext.User.GetObjectId()` is CORRECT
   - ✅ Returns `oid` claim automatically (tenant-consistent)
   - ✅ Works with both External ID and Workforce tenants

5. **Middleware Setup (VERIFIED):**
   - ✅ Our approach with explicit `UseAuthentication()` and `UseAuthorization()` is **correct and safer**
   - Note: Some 2025 examples omit these (handled automatically), but explicit calls provide better control

6. **MVP Scope Validation:**
   - ✅ `[Authorize]` attribute alone is sufficient for MVP
   - Post-MVP: Add `RequiredScopeOrAppPermission` for fine-grained control

**Changes from Original Plan:**
- Remove `Microsoft.AspNetCore.Authentication.JwtBearer` package (unnecessary)
- Optionally remove `"Audience"` from appsettings.json (simplification)
- Keep explicit middleware calls (safer than Microsoft's simplified examples)
- Confirmed `GetObjectId()` returns `oid` claim (correct for user identification)

**Confidence Level:** ✅ VERY HIGH (95%) - Based on April 2025 Microsoft documentation

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

### Story 4.6: Upgrade Recipe Image Upload to User Delegation SAS (Post-MVP Enhancement)

**Title:** Enhance image upload security with Microsoft Entra-signed SAS tokens

**User Story:**
As a **FoodBudget developer**, I want to upgrade from Account Key SAS to User Delegation SAS for recipe image uploads, so that we leverage Microsoft Entra credentials for enhanced security and RBAC integration.

**Acceptance Criteria:**
- [ ] BlobServiceClient configured with `DefaultAzureCredential` (not connection string)
- [ ] `GetUserDelegationKeyAsync()` implemented in ImageUploadService
- [ ] SAS tokens signed with user delegation key (not account key)
- [ ] API service identity has "Storage Blob Data Contributor" RBAC role
- [ ] Local development works with `az login` or Visual Studio authentication
- [ ] Production uses Managed Identity for authentication
- [ ] All 21 unit tests updated and passing with new authentication pattern
- [ ] Account keys removed from appsettings.json configuration

**Definition of Done:**
- [ ] Azure.Identity NuGet package installed
- [ ] AzureStorageOptions updated (AccountName instead of ConnectionString)
- [ ] ImageUploadService updated to use `GetUserDelegationKeyAsync()`
- [ ] DI registration updated to use `DefaultAzureCredential`
- [ ] RBAC roles assigned to API identity (App Service Managed Identity)
- [ ] Tests updated to mock `GetUserDelegationKeyAsync()`
- [ ] Local development guide updated with authentication setup
- [ ] Account keys rotated after migration complete
- [ ] Code reviewed and deployed

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Sprint 4 authentication complete (Stories 4.1-4.4)
- ✅ Microsoft Entra External ID stable and tested
- ✅ Recipe image upload MVP working with Account Key SAS
- ⚠️ **BLOCKER:** Cannot implement until Sprint 4 authentication is complete

**Why Post-MVP:**
This story is deferred to Sprint 5+ because:
1. **Dependency:** Requires Microsoft Entra authentication infrastructure from Sprint 4
2. **Risk reduction:** Account Key SAS is secure enough for MVP (5-min expiration)
3. **Complexity:** User Delegation adds ~8-13 hours of work including Azure RBAC setup
4. **Testing:** Requires stable authentication before adding another moving part
5. **Value timing:** Security enhancement best done after core features are proven

**Security Comparison:**

| Security Control | Account Key SAS (MVP) | User Delegation SAS (Enhanced) |
|------------------|----------------------|-------------------------------|
| Expiration | ✅ 5 minutes | ✅ 5 minutes |
| Clock skew protection | ✅ -5 min buffer | ✅ -5 min buffer |
| Minimal permissions | ✅ Create+Write only | ✅ Create+Write only |
| GUID filenames | ✅ Prevents guessing | ✅ Prevents guessing |
| User folders | ✅ Isolation | ✅ Isolation |
| Credential type | ⚠️ Account key | ✅ Entra credentials |
| RBAC integration | ❌ No | ✅ Yes |
| Audit logs | ⚠️ Limited | ✅ Comprehensive |
| Key rotation | ⚠️ Manual | ✅ Automatic |

**Implementation Changes Required:**

**1. Install Azure.Identity Package:**
```bash
dotnet add package Azure.Identity
```

**2. Update Configuration (AzureStorageOptions.cs):**
```csharp
public class AzureStorageOptions
{
    public const string SECTION_NAME = "AzureStorage";
    public required string AccountName { get; set; }  // Changed from ConnectionString
    public string ContainerName { get; set; } = "recipe-images";
}
```

**3. Update appsettings.json:**
```json
{
  "AzureStorage": {
    "AccountName": "foodbudgetstorage",
    "ContainerName": "recipe-images"
  }
}
```

**4. Update DI Registration:**
```csharp
// ServiceRegistrationExtensions.cs
services.AddSingleton(sp =>
{
    var options = sp.GetRequiredService<IOptions<AzureStorageOptions>>().Value;
    var endpoint = new Uri($"https://{options.AccountName}.blob.core.windows.net");
    return new BlobServiceClient(endpoint, new DefaultAzureCredential());
});
```

**5. Update ImageUploadService:**
```csharp
public async Task<UploadTokenResponse> GenerateUploadTokenAsync(
    string userId,
    string fileName,
    string contentType,
    long fileSizeBytes)
{
    ValidateParameters(userId, fileName, contentType, fileSizeBytes);

    // Get user delegation key (NOW ASYNC!)
    UserDelegationKey userDelegationKey = await _blobServiceClient
        .GetUserDelegationKeyAsync(
            DateTimeOffset.UtcNow.AddMinutes(-CLOCK_SKEW_MINUTES),
            DateTimeOffset.UtcNow.AddMinutes(_imageUploadOptions.TokenExpirationMinutes));

    // ... rest of validation logic ...

    var sasBuilder = new BlobSasBuilder { ... };
    sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

    // Sign with user delegation key
    BlobUriBuilder blobUriBuilder = new BlobUriBuilder(blobClient.Uri)
    {
        Sas = sasBuilder.ToSasQueryParameters(
            userDelegationKey,
            _blobServiceClient.AccountName)
    };

    return new UploadTokenResponse {
        UploadUrl = blobUriBuilder.ToUri().ToString(),
        PublicUrl = blobClient.Uri.ToString(),
        ExpiresAt = sasBuilder.ExpiresOn
    };
}
```

**6. Update Unit Tests:**
```csharp
// Mock GetUserDelegationKeyAsync
_mockBlobServiceClient
    .Setup(x => x.GetUserDelegationKeyAsync(
        It.IsAny<DateTimeOffset>(),
        It.IsAny<DateTimeOffset>(),
        It.IsAny<CancellationToken>()))
    .ReturnsAsync(new UserDelegationKey { /* mock properties */ });
```

**Azure Infrastructure Setup:**

**1. Assign RBAC Role to API Identity:**
```bash
# Get API App Service identity
az webapp identity show --name foodbudget-api --resource-group foodbudget-rg

# Assign Storage Blob Data Contributor role
az role assignment create \
  --assignee <api-app-object-id> \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/foodbudgetstorage
```

**2. Enable Managed Identity on App Service:**
```bash
az webapp identity assign \
  --name foodbudget-api \
  --resource-group foodbudget-rg
```

**Local Development Setup:**

**Option 1: Azure CLI Authentication**
```bash
az login
az account set --subscription <subscription-id>
```

**Option 2: Visual Studio Authentication**
- Sign in to Visual Studio with Azure account
- `DefaultAzureCredential` automatically detects Visual Studio auth

**Testing Strategy:**
1. Update all 21 unit tests to mock `GetUserDelegationKeyAsync()`
2. Test locally with `az login` authentication
3. Deploy to dev environment with Managed Identity
4. Verify SAS tokens work identically to Account Key SAS
5. Test all error scenarios (expired token, wrong permissions, etc.)

**Rollback Plan:**
If issues arise, revert to Account Key SAS:
1. Revert DI registration to use connection string
2. Revert ImageUploadService to synchronous token generation
3. Restore connection string in appsettings.json
4. All code changes isolated to 3 files (easy rollback)

**Estimated Effort:** 8-13 hours
- Code changes: 2-3 hours
- Azure RBAC setup: 1-2 hours
- Local dev auth setup: 1 hour
- CI/CD updates: 1-2 hours
- Testing: 2-3 hours
- Production migration: 1-2 hours

**Priority:** 🟢 COULD HAVE (Security enhancement, not critical for MVP)

**Depends On:**
- Story 4.1: Microsoft Entra tenant created
- Story 4.3: Backend JWT validation configured
- Story 4.4: Authentication tested and stable
- Recipe Image Upload MVP: Working with Account Key SAS

---

## Sprint Success Criteria

### Functional Requirements (Must Have)
- ✅ Entra External ID tenant created and configured (Story 4.1 ✅)
- ✅ Backend API registration created with token v2 (Story 4.1 ✅)
- ✅ Web app (SPA) registration created for testing and web demo (Story 4.2 ✅)
- [ ] Backend API validates JWT tokens via Microsoft.Identity.Web (Story 4.3)
- [ ] Unauthenticated requests return 401 (Story 4.3)
- [ ] Valid tokens allow API access (Story 4.3)
- [ ] User ID extracted from `sub` claim (Story 4.3)
- [ ] API protection tested with manual tokens (Story 4.4)

### Non-Functional Requirements
- ✅ Configuration documented and secure (Story 4.1 ✅)
- [ ] Token validation tested (valid, invalid, expired, missing) (Story 4.4)
- [ ] Token claims structure verified and documented for Sprint 5 (Story 4.4)

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

---

### ⚠️ ACTUAL CONFIGURATION VALUES (Story 4.1 Complete)

**// TODO: REMOVE THESE VALUES FROM THIS FILE BEFORE COMMITTING!**
**// TODO: Store securely in password manager or Azure Key Vault**
**// TODO: These are documented here temporarily for Stories 4.2-4.4**

#### Tenant Configuration
- **Tenant ID:** `644a9317-ded3-439a-8f0a-9a8491ce35e9`
- **Tenant Name:** `FoodBudget-Tenent`
- **Tenant Domain:** `foodbudget.ciamlogin.com` *(verify this matches actual domain)*
- **Authority URL:** `https://foodbudget.ciamlogin.com/`

#### API Application Registration
- **Application (Client) ID:** `877ea87e-5be9-4102-9959-6763e3fdf243`
- **Application ID URI:** `api://877ea87e-5be9-4102-9959-6763e3fdf243`
- **Display Name:** `FoodBudgetAPI`
- **Token Version:** v2 (`"requestedAccessTokenVersion": 2` in manifest)

#### Configuration for Story 4.3 (Backend API)
```json
"AzureAd": {
  "Instance": "https://foodbudget.ciamlogin.com/",
  "TenantId": "644a9317-ded3-439a-8f0a-9a8491ce35e9",
  "ClientId": "877ea87e-5be9-4102-9959-6763e3fdf243",
  "Audience": "api://877ea87e-5be9-4102-9959-6763e3fdf243"
}
```

#### Web App (SPA) Registration (Story 4.2)
- **Application (Client) ID:** `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`
- **Display Name:** `FoodBudget Web App`
- **Platform:** Single-page application (SPA)
- **Redirect URIs:**
  - `https://cadil91.github.io/RecipeTracker/` - GitHub Pages deployment
  - `https://jwt.ms` - Token testing
  - `http://localhost:8081/` - Local development (Expo web)
- **Public Client Flows:** Enabled
- **API Permissions:** `api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user` (consented)

#### Configuration for Story 4.4 (Web App Testing)
```javascript
// MSAL configuration for React/Expo web app
const msalConfig = {
  auth: {
    clientId: "9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae",
    authority: "https://foodbudget.ciamlogin.com/644a9317-ded3-439a-8f0a-9a8491ce35e9",
    redirectUri: "http://localhost:8081/" // or GitHub Pages URL
  }
};

const loginRequest = {
  scopes: ["api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user"]
};
```

**Story 4.1 Status:** ✅ COMPLETE
**Story 4.2 Status:** ✅ COMPLETE

---

### Architecture Decisions
- **Tenant Strategy:** Production tenant (FREE up to 50K MAU)
- **Authentication Approach:** Microsoft.Identity.Web (code-based, deployment-flexible)
- **Token Validation:** JWT validation at application level, no Entra API calls during requests
- **Testing Approach:** Manual tokens via Azure Portal "Run user flow"
- **Web App Registration:** Created in Sprint 4 for testing and web demo integration
- **Mobile App Registration:** Deferred to Sprint 5 when React Native mobile work begins (separate platform requirements)
- **Image Upload Security (Recipe Images):**
  - **Pattern:** Direct client upload to Azure Blob Storage (avoids API bottleneck, reduces costs)
  - **MVP Implementation:** Account Key SAS tokens (simpler, sufficient security for MVP)
  - **Security Controls:** 5-minute expiration, clock skew protection, Create+Write only permissions, GUID filenames, user-specific folders
  - **Future Enhancement (Sprint 5+):** Upgrade to User Delegation SAS tokens signed with Microsoft Entra credentials for enhanced security and RBAC integration
  - **Rationale:** Account Key SAS provides adequate security for MVP with 5-minute expiration. User Delegation SAS requires Microsoft Entra authentication to be stable first (Sprint 4 dependency)

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
