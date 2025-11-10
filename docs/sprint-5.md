# Sprint 5: User Authentication (Web)

**Sprint Goal:** Enable users to sign up and sign in via the FoodBudget web app and securely access the protected backend API.

**Status:** INCOMPLETE  
**Prerequisites:** Sprint 4 complete (backend API protected with JWT validation) ✅  
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)

---

## Sprint Context

**What This Sprint Delivers:**

- ✅ Users can sign up and sign in via GitHub Pages web app using **email + password**
- ✅ Web app acquires access tokens from Entra External ID
- ✅ Web app calls protected backend API successfully
- ✅ User-scoped recipe data (users can only access their own recipes)
- ✅ End-to-end web authentication complete

**What This Sprint Builds On (Sprint 4):**
- ✅ Entra External ID tenant created (Story 4.1)
- ✅ Backend API registration created (Story 4.1)
- ✅ Web app (SPA) registration created (Story 4.2)
- ✅ Backend API protected with JWT validation (Story 4.3)
- ✅ Token claims structure verified (Story 4.4)
- ✅ API tested with manual tokens (Story 4.4)

**Prerequisites for Sprint 5:**
- ✅ Web app registration from Sprint 4.2 (Client ID: `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`)
- ✅ Backend API protected with JWT Bearer token validation

**Authentication Platform:** Microsoft Entra External ID (External Tenants)  
**Frontend:** React Native + Expo (web platform)  
**Backend:** ASP.NET Core Web API (.NET 8)

**Key Architectural Decisions:**
- **Client-side authentication:** Web app authenticates with Entra directly, backend validates tokens
- **PKCE automatic:** MSAL library handles PKCE for OAuth 2.1 compliance
- **OAuth flow:** Browser redirect flow (SPA pattern)
- **Token storage:** sessionStorage (session-scoped, cleared on tab close)
- **User isolation:** All recipe operations scoped to authenticated user's ID from JWT

**Reference Documentation:**
- 📖 [Implementation Guide](./entra-external-id-setup-guide.md) - Complete technical reference
- 📖 [Operations Guide](./operations/entra-operations-guide.md) - Post-launch admin procedures
- 📚 [Research Archive](./archive/entra-research-archive.md) - Decision history

---

## Table of Contents

- [Story 5.1: Create Email/Password User Flow](#story-51-create-emailpassword-user-flow--complete) ✅ COMPLETE
- [Story 5.2: Integrate MSAL Authentication in Web App](#story-52-integrate-msal-authentication-in-web-app--complete) ✅ COMPLETE
- [Story 5.3: Connect Web App to Protected API](#story-53-connect-web-app-to-protected-api--complete) ✅ COMPLETE
- [Story 5.4: Enforce User-Scoped Recipe Data](#story-54-enforce-user-scoped-recipe-data--complete) ✅ COMPLETE
- [Story 5.5: Upgrade Recipe Image Upload to User Delegation SAS](#story-55-upgrade-recipe-image-upload-to-user-delegation-sas) 🔴 NOT STARTED

---

## User Stories

### Story 5.1: Create Email/Password User Flow ✅ **COMPLETE**

**Status:** ✅ Completed 2025-11-06

**Title:** Configure user sign-up and sign-in flow with email/password authentication

**User Story:**
As a **FoodBudget user**, I want to sign up for an account using my email and password, so that I can access my personalized food budget data.

**Acceptance Criteria:**
- ✅ User flow `SignUpSignIn` created in Entra External ID
- ✅ Email + Password authentication enabled
- ✅ User attributes: Email (required), Display Name (required)
- ✅ Web app associated with user flow
- ✅ User flow tested via "Run user flow" feature
- ✅ Email + Password sign-up and sign-in verified working

**Definition of Done:**
- ✅ User flow visible in Entra admin center
- ✅ FoodBudget Web App associated with flow
- ✅ Test account created successfully
- ✅ Authentication tested and working
- ✅ Ready for MSAL integration (Story 5.2)

**Technical Notes/Constraints:**

**Configuration:**
- **Flow type:** Sign-up and sign-in combined (B2X_1_SignUpSignIn)
- **Authentication:** Email + Password ONLY
- **User attributes:** Email (required), Display Name (required)
- **Token version:** AccessTokenAcceptedVersion set to 2 (prevents IDX20804 error)
- **Reference:** [User Flow Configuration Guide](./entra-external-id-setup-guide.md#user-flow-configuration)

**Key Decisions:**
- **Minimal attributes:** Only collecting Email and Display Name (no given/surname)
- **No social auth in MVP:** Email/password only for simplicity
- **No terms checkbox:** Deferred post-sprint (no legal documents yet)
- **Email OTP:** Not configured (password reset moved to backlog)

**Platform Constraints (2025):**
- Entra External ID is future-proof (Azure AD B2C new sales ended May 1, 2025)
- SMS NOT available for primary authentication (MFA only, additional cost)
- Session control NOT supported in External ID tenants
- JavaScript customization NOT supported (use built-in branding only)

**Testing Completed:**
- ✅ "Run user flow" test successful
- ✅ Sign-up with new email + password
- ✅ Sign-in with existing credentials
- ✅ Test user verified in Entra Users list
- ✅ Token acquired with correct claims structure

**Completion Summary:**
User flow successfully configured and tested.  
Email/password authentication working for web app.  
Ready for MSAL integration in Story 5.2.

---

### Story 5.2: Integrate MSAL Authentication in Web App ✅ **COMPLETE**

**Status:** ✅ Completed 2025-11-06

**Title:** Enable users to sign in via web app with Microsoft Entra External ID

**User Story:**
As a **FoodBudget user**, I want to sign in through the web app using my email and password, so that I can securely access my food budget data from my browser.

**Acceptance Criteria:**

*Authentication Flow:*
- ✅ User can click "Sign In" and is redirected to Entra External ID sign-in page
- ✅ User can sign up with new email + password (email validation, password requirements enforced)
- ✅ User can sign in with existing email + password credentials
- ✅ After successful authentication, user is redirected back to the web app
- ✅ User can sign out and token is cleared from browser storage

*Security & Token Management:*
- ✅ Access token acquired automatically after successful authentication
- ✅ Access token stored securely in sessionStorage (not localStorage)
- ✅ Refresh token handled automatically by MSAL (no manual intervention)
- ✅ Tokens expire after 1 hour and auto-refresh when needed
- ✅ Closing browser tab clears tokens (session-scoped security)

*Protected Routes:*
- ✅ Unauthenticated users are blocked from recipe list and other protected content
- ✅ Protected routes show sign-in UI when user is not authenticated
- ✅ After sign-in, user is automatically taken to requested protected route
- ✅ Sign-out immediately blocks access to protected routes

*Error Handling:*
- ✅ User cancellation (closing Entra window) doesn't crash app
- ✅ Network errors show user-friendly message with retry option
- ✅ Invalid credentials show error message from Entra
- ✅ MSAL initialization errors show loading state until resolved

**Definition of Done:**
- ✅ User can sign in with email + password on localhost:8081
- ✅ User can sign in with email + password on GitHub Pages deployment
- ✅ Access token visible in browser dev tools (Application → sessionStorage)
- ✅ Sign-out clears token and returns to sign-in screen
- ✅ Protected routes (recipe list) require authentication
- ✅ Code reviewed
- ✅ No hardcoded secrets (credentials in `.env`, not committed to Git)
- ✅ Unit tests pass (17 tests: useMsal.web, useAuth)
- ✅ Integration tests pass (navigation + theme + auth state)

**Prerequisites Verification:**
- ✅ Redirect URIs registered in Entra admin center (localhost:8081, GitHub Pages, jwt.ms)
- ✅ Platform type is "Single-page application" (SPA) - enables CORS + PKCE
- ✅ Token version set to v2 (`requestedAccessTokenVersion: 2` in manifest)

**MSAL Package:** `@azure/msal-react@3.0.21` + `@azure/msal-browser@4.26.0`
- **Why:** Official Microsoft library for React SPAs
- **Pattern:** React hooks and context provider
- **Platform Support:** Web ONLY

**Configuration:**
- **Authority:** `https://foodbudget.ciamlogin.com/<tenant-id>`
- **Redirect URIs:** `${window.location.origin}/RecipeTracker/` (dynamic for localhost/GitHub Pages)
- **Cache:** sessionStorage (session-scoped, cleared on tab close)
- **Scopes:** API scope for protected backend access
- **Reference:** `src/lib/auth/msalConfig.web.ts`

**Key Technical Decisions:**

1. **MSAL Initialization:** MSAL Browser v4.x requires `msalInstance.initialize()` before use (added to App.tsx useEffect)
2. **Redirect Handling:** MSAL React's `MsalProvider` automatically handles redirects (no manual `handleRedirectPromise()`)
3. **Token Storage:** sessionStorage (session-scoped, cleared on tab close, more secure than localStorage)
4. **Platform Abstraction:** `useAuth()` hook abstracts web/mobile differences (components never import `useMsalWeb()` directly)
5. **Login Flow:** `loginRedirect` used (more reliable than `loginPopup` across all browsers)
6. **Token Refresh:** Automatic via `acquireTokenSilent()` (1-hour expiration, auto-refresh)

**Error Handling:**
- User cancellation: Stay on sign-in screen, allow retry
- Network errors: User-friendly messages with retry option
- Invalid credentials: Display Entra error messages
- Token expiration: Automatic refresh via MSAL
- Uninitialized MSAL: Loading screen until `msalInstance.initialize()` completes

**Completion Summary:**  
MSAL authentication fully integrated and tested on web platform.  
Email/password authentication working on localhost and GitHub Pages.  
Protected routes enforcing authentication.  
Token management and refresh working automatically.  
All error scenarios handled gracefully.  
17 unit tests passing.
Ready for Story 5.3 (API integration).

---

### Story 5.3: Connect Web App to Protected API ✅ **COMPLETE**

**Status:** ✅ Completed 2025-11-06

**Title:** Enable authenticated API calls from web app

**User Story:**
As a **FoodBudget user**, I want the web app to securely access my data from the backend, so that I can view and manage my food budget.

**Acceptance Criteria:**
- ✅ Web app includes access token in API requests (`Authorization: Bearer <token>`)
- ✅ FetchClient singleton configured with automatic MSAL token injection
- ✅ Successful API call returns user-specific data (recipes)
- ✅ Expired token triggers automatic refresh via MSAL
- ✅ Refreshed token used for subsequent requests
- ✅ HTTP 401 from API triggers re-authentication flow (via ProblemDetails)
- ✅ Network errors handled gracefully (user-friendly messages)
- ✅ Loading states shown during API calls (React Query)
- ✅ Recipe list fetches authenticated user's recipes

**Definition of Done:**
- ✅ Recipe list API call succeeds with valid token
- ✅ Token refresh tested (automatic via MSAL `acquireTokenSilent()`)
- ✅ 401 error handling tested (backend Audience validation fixed)
- ✅ User sees appropriate error messages for auth failures
- ✅ Authentication works on localhost and GitHub Pages
- ✅ Code reviewed
- ✅ End-to-end flow tested (sign in → call API → get data)

**Technical Notes/Constraints:**

**Dependencies:**
- ✅ Sprint 4 Story 4.3 complete (API validates JWT tokens)
- ✅ Story 5.2 complete (web app can sign in and get tokens)

**Implementation Approach:**
- **Pattern:** Singleton FetchClient with global authentication configuration (not Axios interceptors)
- **Why:** 2025 best practice for React Native - avoids hook dependency issues with interceptors
- **Configuration:** `fetchClient.configure(getAccessToken)` called once in App.tsx via FetchClientConfigurator
- **Token Injection:** Automatic on every request if `getAccessToken` configured
- **Error Handling:** ProblemDetails (RFC 9457) responses for 401/403/500 errors
- **Retry Logic:** Exponential backoff with 3 retries and 30-second timeout
- **Reference:** See backlog story for Axios migration consideration

**Files Modified:**
- `src/lib/shared/api/fetch-client.ts` - Added singleton pattern and auth injection (lines 18-75)
- `App.tsx` - Added FetchClientConfigurator component (lines 116-127)
- `src/lib/shared/api/__tests__/fetch-client.test.ts` - 29 tests (93.42% coverage)
- `FoodBudgetAPI/appsettings.json` - Added Audience property for token validation

**Key Technical Decisions:**

1. **Singleton Pattern:** FetchClient configured once globally (not per-request)
2. **Authentication Injection:** Automatic Bearer token injection when configured
3. **Manual Override:** Preserves manually-provided Authorization headers
4. **Error Continuation:** Continues without token if `getAccessToken()` fails (API returns 401)
5. **Token Refresh:** Handled automatically by MSAL (not FetchClient responsibility)

**Completion Summary:**  
FetchClient singleton successfully integrated with MSAL authentication.  
Automatic Bearer token injection working on all API requests.  
Backend Audience validation fixed.  
End-to-end authentication tested on GitHub Pages with successful recipe API calls.  
29 unit tests passing with 93.42% coverage.

---

### Story 5.4: Enforce User-Scoped Recipe Data ✅ **COMPLETE**

**Status:** ✅ Completed 2025-11-07

**Title:** Implement user ownership and authorization for all recipe operations

**User Story:**
As a **FoodBudget user**, I want my recipes to be private and only accessible to me, so that I can manage my personal recipe collection securely without other users accessing, modifying, or deleting my data.

**Acceptance Criteria:**
- ✅ Creating a recipe automatically sets UserId from JWT token (not from request body)
- ✅ Getting a recipe by ID verifies userId ownership (returns 404 if not owner)
- ✅ Updating a recipe verifies userId ownership (returns 404 if not owner)
- ✅ Deleting a recipe verifies userId ownership (returns 404 if not owner)
- ✅ Getting all recipes filters by userId (already implemented)
- ✅ UserId removed from RecipeRequestDto (security - never trust client)
- ✅ UserId kept in RecipeResponseDto (users can see their own userId)
- ✅ All recipe operations work end-to-end with user isolation

**Definition of Done:**
- ✅ CreateRecipe sets userId from JWT automatically
- ✅ GetRecipeById returns 404 if recipe doesn't exist OR doesn't belong to user
- ✅ UpdateRecipe returns 404 if recipe doesn't belong to user
- ✅ DeleteRecipe returns 404 if recipe doesn't belong to user
- ✅ RecipeRequestDto.UserId property removed
- ✅ RecipeResponseDto.UserId property kept (informational)
- ✅ Unit tests written for all controller methods (15 new tests)
- ✅ All unit tests passing
- ✅ Code reviewed for security vulnerabilities
- ✅ Database migration created and applied

**Technical Notes/Constraints:**

**Implementation Summary:**  
This story addressed a critical security vulnerability where users could access, modify, or delete other users' recipes. The implementation enforces user ownership validation on all recipe operations by:

1. **Database Schema:** Recipe.UserId changed from nullable (`Guid?`) to required (`Guid`) with database index for performance
2. **Authorization Logic:** All CRUD operations verify ownership by comparing recipe.UserId with JWT token userId
3. **Security Response:** Returns 404 (not 403) for unauthorized access to prevent information leakage
4. **Audit Logging:** Unauthorized access attempts logged at WARNING level for security monitoring
5. **DTO Security:** UserId removed from RecipeRequestDto to prevent client manipulation

**Key Technical Decisions:**

- **404 vs 403:** Returns 404 for unauthorized access to prevent attackers from enumerating valid recipe IDs
- **JWT as Source of Truth:** UserId extracted from JWT token claims (oid), never from request body
- **Audit Logging:** All unauthorized access attempts logged with userId, recipeId, and operation
- **Database Index:** Added `IX_Recipes_UserId` for optimized ownership queries

**Testing Completed:**
- ✅ Unit tests for all controller methods (create, read, update, delete)
- ✅ Authorization tests (cross-user access blocked)
- ✅ Audit logging verification
- ✅ Database migration testing (0 orphaned recipes found)
- ✅ RecipeMappingProfile tests (14 tests passing)

**Performance Improvements:**
- Added database index on UserId column for optimized ownership queries
- Expected improvement: 10-100x faster on large datasets (10,000+ recipes)

**Security Enhancements:**
- Prevents horizontal privilege escalation (users cannot access other users' data)
- Audit trail for security monitoring and incident response
- Client cannot manipulate userId (extracted from JWT only)
- Information leakage prevention (404 for both "not found" and "unauthorized")

**Dependencies:**
- ✅ Story 5.3 complete (authentication working)
- ✅ Recipe entity has UserId field
- ✅ JWT token includes userId claim (`oid`)

---

### Story 5.5: Upgrade Recipe Image Upload to User Delegation SAS

**Title:** Enhance image upload security with Microsoft Entra-signed SAS tokens

**Moved from:** Sprint 4 Story 4.6 (Post-MVP enhancement)

**User Story:**
As a **FoodBudget developer**, I want to upgrade from Account Key SAS to User Delegation SAS for recipe image uploads, so that we leverage Microsoft Entra credentials for enhanced security and RBAC integration.

**Acceptance Criteria:**
- [ ] **Prerequisites verified:** App Service Managed Identity status confirmed (see checklist below)
- [ ] BlobServiceClient configured with `DefaultAzureCredential` (not connection string)
- [ ] `GetUserDelegationKeyAsync()` implemented in ImageUploadService
- [ ] SAS tokens signed with user delegation key (not account key)
- [ ] API service identity has "Storage Blob Data Contributor" RBAC role assigned via Azure Portal
- [ ] Local development works with `az login` authentication
- [ ] Production uses Managed Identity for authentication
- [ ] All 21 unit tests updated and passing with new authentication pattern
- [ ] Account keys removed from appsettings.json configuration

**Definition of Done:**
- [ ] Azure.Identity NuGet package installed
- [ ] AzureStorageOptions updated (AccountName instead of ConnectionString)
- [ ] ImageUploadService updated to use `GetUserDelegationKeyAsync()`
- [ ] DI registration updated to use `DefaultAzureCredential`
- [ ] RBAC roles assigned via Azure Portal (App Service Managed Identity + Developer accounts)
- [ ] Tests updated to mock `GetUserDelegationKeyAsync()`
- [ ] Local development authenticated with `az login`
- [ ] Account keys rotated after migration complete
- [ ] Code reviewed and deployed

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Sprint 4 authentication complete (Stories 4.1-4.3)
- ✅ Sprint 5 authentication stable and tested
- ✅ Recipe image upload MVP working with Account Key SAS

**Important Architectural Context:**

**Two Separate Authentication Systems Working Together:**

This story involves TWO distinct Azure AD/Entra tenants that serve different purposes:

1. **External ID Tenant (Customer Authentication):**
   - Purpose: Authenticates end users (your app customers)
   - Domain: `foodbudget.ciamlogin.com`
   - Used by: Frontend app (React Native/Expo)
   - What it validates: WHO the user is (JWT token with user claims)
   - Already configured in Stories 5.1-5.4 ✅

2. **Azure Subscription Tenant (Resource Authentication):**
   - Purpose: Authenticates services to access Azure resources
   - Contains: Storage account, App Service, other Azure resources
   - Used by: Backend API (ASP.NET Core)
   - What it validates: API permission to generate SAS tokens
   - Configured in this story via Managed Identity + RBAC

**How They Work Together:**
```
User → External ID → JWT Token → API validates token
                                    ↓
API → Managed Identity → Azure Subscription Tenant → RBAC check → Generate User Delegation Key
```

**Key Insight:** External ID tenant and Azure subscription tenant are **completely separate**. This is normal and expected for customer-facing applications. Don't confuse user authentication (External ID) with API resource authentication (Managed Identity).

**Why Post-MVP:**
This story is deferred to post-Sprint 5 because:
1. **Dependency:** Requires Microsoft Entra authentication infrastructure to be stable
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

**STEP 0: Prerequisites Checklist (Complete BEFORE Code Changes)**

Before starting implementation, gather the following information:

- [ ] **App Service Name:** `_________________` (e.g., foodbudget-api)
- [ ] **Resource Group Name:** `_________________` (e.g., foodbudget-rg)
- [ ] **Storage Account Name:** `foodbudgetstorage` (confirmed)
- [ ] **Subscription ID:** `_________________` (found in Azure Portal → Subscriptions)
- [ ] **App Service Managed Identity Status:**
  - [ ] Check: Navigate to App Service → Settings → Identity → System assigned
  - [ ] If Status = "Off" → Enable it (turn toggle to "On" and Save)
  - [ ] If Status = "On" → Record **Object (principal) ID**: `_________________`

**STEP 1: Enable App Service Managed Identity (if not already enabled)**

**Via Azure Portal:**
1. Navigate to Azure Portal → App Services → `[your-api-name]`
2. Left menu → **Identity** (under Settings)
3. **System assigned** tab → Toggle Status to **On**
4. Click **Save**
5. After saving, **copy the Object (principal) ID** - you'll need this for RBAC assignment
6. Click **Azure role assignments** button (appears after enabling)

**Why This Matters:**
- Managed Identity = automatic service account for your API
- Azure handles credential rotation (no secrets to manage)
- Required for calling `GetUserDelegationKeyAsync()` in production

**STEP 2: Assign RBAC Role to App Service Managed Identity (Production)**

**Via Azure Portal (Recommended):**
1. Navigate to **Storage Account** → `foodbudgetstorage`
2. Left menu → **Access Control (IAM)**
3. Click **+ Add** → **Add role assignment**
4. **Role** tab:
   - Search for: "Storage Blob Data Contributor"
   - Select it → Click **Next**
5. **Members** tab:
   - Assign access to: **Managed identity**
   - Click **+ Select members**
   - Select subscription → **App Service** → Find your API by name
   - Click **Select**
   - Click **Next**
6. **Review + assign** → Click **Review + assign**

**Verification:**
- Go back to Storage Account → Access Control (IAM) → **Role assignments** tab
- Filter by "Storage Blob Data Contributor"
- You should see your App Service listed

**Why This Role:**
- Grants permission to call `GetUserDelegationKeyAsync()`
- Allows blob read/write/delete operations
- Required for User Delegation SAS token generation

**STEP 3: Assign RBAC Role to Developer Accounts (Local Development)**

**Via Azure Portal (Recommended):**
1. Navigate to **Storage Account** → `foodbudgetstorage`
2. Left menu → **Access Control (IAM)**
3. Click **+ Add** → **Add role assignment**
4. **Role** tab:
   - Search for: "Storage Blob Data Contributor"
   - Select it → Click **Next**
5. **Members** tab:
   - Assign access to: **User, group, or service principal**
   - Click **+ Select members**
   - Search for your Azure account email (e.g., caleb@example.com)
   - Select it → Click **Select**
   - Click **Next**
6. **Review + assign** → Click **Review + assign**

**Repeat for each developer** who needs to run the API locally.

**STEP 4: Local Development Authentication Setup**

**Using Azure CLI (Option A - Recommended):**
1. Install Azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
2. Open terminal and run:
   ```bash
   az login
   az account set --subscription <your-subscription-id>
   az account show  # Verify correct subscription
   ```
3. `DefaultAzureCredential` will automatically use your Azure CLI login

**Using Visual Studio (Option B - Alternative):**
1. Open Visual Studio
2. Top-right → Sign in with your Azure account
3. Tools → Options → Azure Service Authentication → Account Selection
4. Verify correct account is selected
5. `DefaultAzureCredential` will automatically detect Visual Studio auth

**Credential Chain (How DefaultAzureCredential Works):**
```
DefaultAzureCredential attempts in order:
1. Environment variables (for CI/CD)
2. Managed Identity (if running in Azure App Service) ← Production uses this
3. Visual Studio authentication (if signed in)
4. Azure CLI authentication (if `az login` ran) ← Local dev uses this
5. Azure PowerShell (if logged in)
```

**Troubleshooting Local Dev:**
- Error: "No valid credentials" → Run `az login` and try again
- Error: "Insufficient permissions" → Verify RBAC role assigned to your account (Step 3)
- Multiple Azure accounts? → Run `az account show` to verify correct subscription

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
- Sprint 4 complete (Entra tenant, backend JWT validation) ✅
- Sprint 5 authentication complete (Stories 5.1-5.4) ✅
- Recipe Image Upload MVP working with Account Key SAS ✅

---

## Sprint Success Criteria

### Functional Requirements (Must Have)
- ✅ Users can sign up using email + password (web app)
- ✅ Users can sign in using email + password (web app)
- ✅ Web app acquires access tokens from Entra
- ✅ Web app can call protected API endpoints
- ✅ Token refresh works automatically
- ✅ 401 errors trigger re-authentication
- ✅ Sign-out functionality works
- ✅ User-scoped recipe data enforced

### Non-Functional Requirements
- ✅ OAuth 2.0 compliant (browser-based auth with PKCE)
- ✅ Baseline security protections active (automatic from Entra)
- ✅ Secure token storage (sessionStorage, cleared on tab close)
- ✅ Authentication errors handled gracefully
- ✅ Loading states shown during authentication

---

## Story Dependencies

```
Sprint 4 Complete:
  - Tenant + API Registered (Stories 4.1, 4.2)
  - Backend Protected with JWT Validation (Story 4.3)
    ↓
Story 5.1 (Create Email/Password User Flow) ✅
    ↓
Story 5.2 (Integrate MSAL Authentication in Web App) ✅
    ↓
Story 5.3 (Connect Web App to Protected API) ✅
    ↓
Story 5.4 (Enforce User-Scoped Recipe Data) ✅
    ↓
End-to-End Web Authentication Complete
    ↓
Story 5.5 (Upgrade Recipe Image Upload to User Delegation SAS) 🔴
```

---

## Testing Strategy

### Unit Tests
- ✅ Authentication state management (web)
- ✅ Token acquisition logic (MSAL)
- ✅ API client authentication injection
- ✅ Error handling for auth failures
- ✅ 17 tests: useMsal.web, useAuth
- ✅ 29 tests: fetch-client (93.42% coverage)
- ✅ 15 tests: RecipesController authorization

### Integration Tests
- ✅ End-to-end: Sign up with email → Call API → Get data
- ✅ Token refresh: Wait for expiration → Call API → Auto-refresh works
- ✅ 401 handling: Remove token → Call API → Re-authentication triggered
- ✅ Sign out: Sign out → API calls fail appropriately
- ✅ Protected routes: Unauthenticated users blocked from recipe list
- ✅ User-scoped data: Users can only access their own recipes

### Manual Testing Completed
- ✅ Sign up with email + password (new user)
- ✅ Sign in with email + password (existing user)
- ✅ Sign out and verify tokens cleared (sessionStorage)
- ✅ GitHub Pages deployment testing
- ✅ Localhost development testing
- ✅ Offline behavior (graceful error handling)

---

## Deferred to Post-Sprint

**Not implementing in Sprint 5:**

| Feature | Reason Deferred | Reference |
|---------|----------------|-----------|
| Terms/Privacy checkbox | No legal documents finalized | Backlog |
| Custom URL domain | Costs $50-100/month, not essential | Story 6.8 |
| Custom authentication extensions | No use case identified | Story 6.11 |
| Custom attributes in Entra | Store app data in FoodBudget database | N/A |
| Multi-language support | English only for MVP | Story 6.9 |
| MFA (Email OTP for sign-in) | Reduces conversions, baseline security sufficient | Story 6.10 |

---

## Technical Reference

### Key Configuration Values
- **Tenant Domain:** `foodbudget.ciamlogin.com` (from Sprint 4, Story 4.1)
- **Authority URL:** `https://foodbudget.ciamlogin.com/<tenant-id>`
- **Web App Client ID:** `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae` (from Sprint 4, Story 4.2)
- **Backend API Client ID:** From Sprint 4, Story 4.1
- **API Scopes:** `api://<backend-api-id>/access_as_user`
- **User Attributes:** Email (required), Display Name (required)

### Architecture Decisions
- **Authentication Flow:** Client-side (web → Entra direct, SPA pattern)
- **Token Storage:** sessionStorage (session-scoped, cleared on tab close)
- **PKCE:** Auto-enabled by MSAL (OAuth 2.1 standard)
- **Token Refresh:** Automatic via MSAL `acquireTokenSilent()`
- **User Isolation:** All recipe operations scoped by JWT userId claim

### Cost Summary
- **Entra External ID:** FREE (0-50,000 MAU)
- **Azure Blob Storage:** Pay-as-you-go (recipe images)
- **Azure SQL Database:** Development tier
- **Sprint 5 Cost:** $0 (authentication free tier)

---

## Resources

- **Implementation Guide:** [entra-external-id-setup-guide.md](./entra-external-id-setup-guide.md)
- **Operations Guide:** [operations/entra-operations-guide.md](./operations/entra-operations-guide.md)
- **Research Archive:** [archive/entra-research-archive.md](./archive/entra-research-archive.md)
- **Microsoft Docs:** https://learn.microsoft.com/en-us/entra/external-id/customers/
- **MSAL React Docs:** https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react

---

**Technical debt created:**
- None

**Sprint 4 → Sprint 5 Handoff Notes:**
- Web app (SPA) registration created in Sprint 4.2 (Client ID: `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`)
- Backend API protected with JWT validation (Sprint 4.3)
- API tested with manual tokens (Sprint 4.4)
- Web authentication completed in Sprint 5 (Stories 5.1-5.4)

---
