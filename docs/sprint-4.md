# Sprint 4: User Authentication & Authorization

**Status:** 📋 PLANNING - Research Phase Complete
**Start Date:** TBD
**Target Completion:** TBD

---

## Sprint Goal

Implement Microsoft Entra External ID authentication for the FoodBudget mobile app and backend API, enabling users to sign up and sign in using email/password or social providers (Google, Facebook, Apple), and securing the backend API to accept only authenticated requests.

---

## Context

**Product:** Microsoft Entra External ID in External Tenants (CIAM)
**Replaces:** Azure AD B2C (deprecated May 1, 2025 for new customers)
**Frontend:** React Native + Expo mobile app
**Backend:** ASP.NET Core Web API (.NET 8) on Azure App Service

**Key Decisions:** See [Research Guide - Executive Summary](./entra-external-id-setup-guide.md#1-executive-summary-) for all MVP decisions.

---

## Sprint Overview

### Phase 1: Foundation Setup
**Goal:** Create authentication infrastructure

**Tasks:**

**1. Create Microsoft Entra External ID external tenant**

**Prerequisites:**
- Active Azure subscription (existing)
- Account with "Tenant Creator" role assigned

**Steps:**
1. Navigate to Microsoft Entra admin center (https://entra.microsoft.com)
2. Go to **Entra ID** → **Overview** → **Manage tenants**
3. Click **Create** button
4. Select **External** as tenant type
5. Choose **Use Azure Subscription** (not trial)
6. Configure Basics tab:
   - **Tenant Name:** `FoodBudgetExternal`
   - **Domain Name:** `foodbudget` (becomes `foodbudget.ciamlogin.com`)
   - **Location:** `United States`
7. Configure Subscription tab:
   - **Subscription:** Select existing Azure subscription
   - **Resource Group:** Create new or select existing (developer decision)
   - **Resource Group Location:** `United States`
8. Review and click **Create**
9. Wait for creation (up to 30 minutes)
10. Verify tenant created successfully in Notifications pane
11. Switch to new tenant using tenant switcher
12. Confirm tenant details in **Tenant overview**

**Critical Notes:**
- Domain name cannot be changed after creation
- Location cannot be changed after creation
- Alternative: 30-day free trial (no subscription required) or VS Code extension

**2. Register mobile app and backend API applications**

**Prerequisites:**
- External tenant created (Task 1 above)
- Account with "Application Developer" role

**Overview:**
Register TWO applications:
- Mobile app (public client) - Users authenticate here
- Backend API (protected resource) - Mobile app requests access

**Steps for Mobile App Registration:**

1. Navigate to Microsoft Entra admin center → **Entra ID** → **App registrations** → **New registration**
2. Ensure you're in the external tenant (use tenant switcher if needed)
3. Configure registration:
   - **Name:** `FoodBudget Mobile App`
   - **Supported account types:** "Accounts in this organizational directory only" (external tenant)
   - **Redirect URI:** Skip for now (add after registration)
4. Click **Register**
5. Record from Overview page:
   - Application (client) ID
   - Directory (tenant) ID
   - Object ID

**Steps for Backend API Registration:**

1. Navigate to **App registrations** → **New registration**
2. Configure registration:
   - **Name:** `FoodBudget API`
   - **Supported account types:** "Accounts in this organizational directory only" (external tenant)
   - **Redirect URI:** Leave blank (not needed for APIs)
3. Click **Register**
4. Record Application (client) ID from Overview
5. Configure API identifier:
   - Navigate to **Expose an API** section
   - Click **Add** next to Application ID URI
   - Accept default: `api://<client-id>`
   - Click **Save**

**Post-Registration: Grant Permissions**

1. Go to mobile app registration → **API permissions**
2. Click **Add a permission** → **My APIs** tab
3. Select **FoodBudget API**
4. Select delegated permissions (scopes from API)
5. Click **Add permissions**
6. Click **Grant admin consent** button (required for external tenants)

**Pending Configuration (Future Tasks):**
- ⏸️ Mobile app platform configuration (redirect URIs)
- ⏸️ API scope definition (recommend: `access_as_user` for MVP)
- ⏸️ Public client flow settings

**Critical Notes:**
- Apps are hidden from users by default
- Redirect URI format for React Native/Expo pending research
- Platform-specific configuration details pending research

**Outcome:** Tenant and app registrations ready for configuration

**Estimated Effort:** 1-3 hours

---

### Phase 2: Authentication Configuration
**Goal:** Configure how users will authenticate

**Tasks:**

**⚠️ IMPORTANT: Task 4 must be completed BEFORE Task 3**
(Social providers must be configured before user flow creation)

**4. Add social identity providers** (DO THIS FIRST)

**Prerequisites:**
- Tenant created with Tenant ID recorded (Phase 1, Task 1)
- App registrations created (Phase 1, Task 2)
- Google account (create new account specifically for FoodBudget development)
- Facebook developer account (free)
- Apple Developer account ($99/year)

**Overview:**
Configure federation with Google, Facebook, and Apple so they appear as options during user flow creation.

**Critical Notes:**
- ⚠️ Social providers must be configured here FIRST (before creating user flow)
- They only become available in user flow after federation setup
- Apple Sign In mandatory for iOS App Store if offering any social login
- Test each provider immediately after configuration

**Cost:**
- Google: FREE
- Facebook: FREE
- Apple: $99/year (Apple Developer Program)

---

**4A. Configure Google Sign-In**

**Part 1: Google Cloud Console Setup**

**Step 1: Create Google Project**
1. Access [Google Developers Console](https://console.developers.google.com/)
2. Sign in with Google account (create new account for FoodBudget if needed)
3. Accept terms of service if prompted
4. Select project list (upper-left) → **New Project**
5. Enter project name: **"FoodBudget"**
6. Click **Create**
7. Verify you're in the new project

**Step 2: Configure OAuth Consent Screen**
1. Navigate to **APIs & services** → **OAuth consent screen**
2. Select **External** user type → **Next**
3. Complete app information:
   - **Application name:** "FoodBudget"
   - **User support email:** Your email address
4. Under **Authorized domains**, add:
   - `ciamlogin.com`
   - `microsoftonline.com`
5. **Developer contact emails:** Your email (for Google notifications)
6. Click **Save and Continue**

**Step 3: Create OAuth Client Credentials**
1. Left menu → **Credentials** → **Create credentials** → **OAuth client ID**
2. Choose **Web application**
3. Enter name: **"Microsoft Entra External ID"**
4. **Add these 7 Redirect URIs** (replace `<tenant-ID>` with your actual Tenant ID from Phase 1):

```
https://login.microsoftonline.com
https://login.microsoftonline.com/te/<tenant-ID>/oauth2/authresp
https://login.microsoftonline.com/te/foodbudget.onmicrosoft.com/oauth2/authresp
https://<tenant-ID>.ciamlogin.com/<tenant-ID>/federation/oidc/accounts.google.com
https://<tenant-ID>.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oidc/accounts.google.com
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oauth2
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oauth2
```

5. Click **Create**
6. **COPY AND SAVE SECURELY:**
   - **Client ID**
   - **Client Secret**
7. Click **OK**

**Part 2: Microsoft Entra Configuration**

**Step 1: Add Google as Identity Provider**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Navigate to **Entra ID** → **External Identities** → **All identity providers**
4. On **Built-in** tab, select **Configure** next to Google
5. Enter:
   - **Name:** "Google"
   - **Client ID:** Paste from Google Console
   - **Client secret:** Paste from Google Console
6. Click **Save**

**Step 2: Verify**
1. Navigate to **Entra ID** → **External Identities** → **All identity providers**
2. Verify "Google" appears in list

**Test Google Sign-In (After User Flow Created):**
1. Use "Run user flow" feature (after Task 3 completed)
2. Verify Google appears as sign-in option
3. Test sign-up with Google (new user)
4. Test sign-in with Google (existing user)
5. Verify user created in Entra ID with Google identity

---

**4B. Configure Facebook Login**

**⚠️ BLOCKER:** Requires Privacy Policy, Terms of Service, and User Data Deletion URLs

**Part 1: Facebook Developers Setup**

**Step 1: Register as Facebook Developer**
1. Visit [Facebook for Developers](https://developers.facebook.com/apps)
2. Select **"Get Started"** → Accept policies → Complete registration

**Step 2: Create Facebook App**
1. Select **Create App**
2. Choose **"Authenticate and request data from users with Facebook Login"** → **Next**
3. Select **"No, I'm not building a game"** → **Next**
4. Provide:
   - **App name:** "FoodBudget"
   - **Contact email:** Your email
5. Select **Create app**

**Step 3: Configure Basic Settings**
1. Navigate to **App settings** → **Basic**
2. **COPY AND SAVE:**
   - **App ID**
   - **App Secret** (click "Show")
3. ⚠️ **REQUIRED URLs** (create placeholder pages first):
   - **Privacy Policy URL:** `https://foodbudget.com/privacy`
   - **Terms of Service URL:** `https://foodbudget.com/terms`
   - **User Data Deletion URL:** `https://foodbudget.com/delete-data`
4. **Category:** "Business and pages"
5. **Save changes**

**⚠️ ACTION REQUIRED BEFORE SPRINT 4:**
- Create simple placeholder HTML pages for privacy policy, terms, and data deletion
- Can be updated later with final legal documents
- **Blocker:** Facebook won't save configuration without these URLs

**Step 4: Add Website Platform**
1. **Add platform** → **Website** → **Next**
2. **Site URL:** `https://foodbudget.ciamlogin.com`
3. **Save changes**

**Note:** Using "Website" platform because OAuth happens in browser (even though FoodBudget is mobile)

**Step 5: Configure OAuth Redirect URIs**
1. Navigate to **Use cases** → **Customize** → **Go to settings** (Facebook Login)
2. **Add these 6 Redirect URIs** (replace `<tenant-ID>`):

```
https://login.microsoftonline.com/te/<tenant-ID>/oauth2/authresp
https://login.microsoftonline.com/te/foodbudget.onmicrosoft.com/oauth2/authresp
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oidc/www.facebook.com
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oidc/www.facebook.com
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oauth2
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oauth2
```

3. **Save changes**

**Step 6: Add Email Permissions**
1. **Use cases** → **Customize** → **Add** (under Permissions) → **Go back**

**Step 7: Go Live**
1. Select **Go live** from menu
2. Complete data handling questions
3. ⏸️ **Business verification may be required** (see Story 6.6)
4. Switch to **Live** mode

**Part 2: Microsoft Entra Configuration**

**Step 1: Add Facebook as Identity Provider**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Navigate to **Entra ID** → **External Identities** → **All identity providers**
3. **Built-in** tab → **Configure** (next to Facebook)
4. Enter:
   - **Name:** "Facebook"
   - **Client ID:** Paste App ID
   - **Client secret:** Paste App Secret
5. **Save**

**Step 2: Verify**
1. **All identity providers** → Verify "Facebook" appears

**Test Facebook Sign-In (After User Flow Created):**
1. Use "Run user flow" feature
2. Verify Facebook appears as sign-in option
3. Test sign-up with Facebook (new user)
4. Test sign-in with Facebook (existing user)
5. Verify user created in Entra ID

**Estimated Effort:** 1-2 hours

---

**4C. Configure Apple Sign In**

**⚠️ CRITICAL:** Apple App Store **requires** Apple Sign In if offering other social logins (mandatory, not optional)

**Prerequisites:**
- Purchase Apple Developer Program membership ($99/year)

**Part 1: Apple Developer Portal Setup**

**Step 1: Create App ID**
1. Sign into [Apple Developer Portal](https://developer.apple.com/)
2. **Certificates, IDs, & Profiles** → **(+)**
3. Choose **App IDs** → **Continue** → **App** → **Continue**
4. Register:
   - **Description:** "FoodBudget Mobile App"
   - **Bundle ID:** `com.foodbudget.mobile`
   - ✅ Select **Sign in with Apple**
   - **⚠️ NOTE YOUR TEAM ID** (App ID Prefix) - needed later
   - **Continue** → **Register**

**Step 2: Create Service ID**
1. **Certificates, IDs, & Profiles** → **(+)**
2. Choose **Services IDs** → **Continue**
3. Register:
   - **Description:** "FoodBudget Sign In"
   - **Identifier:** `com.foodbudget.signin` (this becomes Client ID)
   - **Continue** → **Register**

**Step 3: Configure Sign in with Apple**
1. Select Service ID → **Sign In with Apple** → **Configure**
2. Select Primary App ID (`com.foodbudget.mobile`)
3. **Domains and Subdomains** (replace `<tenant-id>`):
   - `foodbudget.ciamlogin.com`
   - `<tenant-id>.ciamlogin.com`
4. **Return URLs** (replace `<tenant-id>`):

```
https://<tenant-id>.ciamlogin.com/<tenant-id>/federation/oauth2
https://<tenant-id>.ciamlogin.com/foodbudget/federation/oauth2
https://foodbudget.ciamlogin.com/<tenant-id>/federation/oauth2
```

**⚠️ VERIFICATION:** Confirm ALL characters are lowercase (Apple requirement)

5. **Next** → **Done** → **Continue** → **Save**

**Step 4: Create Private Key**
1. **Keys** → **(+)**
2. Register:
   - **Key Name:** "FoodBudget Sign In Key"
   - ✅ **Sign in with Apple** → **Configure**
   - Choose `com.foodbudget.mobile` → **Save**
   - **Continue** → **Register**
3. **⚠️ NOTE KEY ID** (save securely)
4. **⚠️ DOWNLOAD .p8 FILE** (CAN ONLY DOWNLOAD ONCE!)
   - **Save to secure password manager immediately**
   - Name: "Apple Sign In Private Key - FoodBudget.p8"
   - Note: Key ID, creation date, renewal date (+6 months)
5. **Done**

**⚠️ MAINTENANCE:** Add calendar reminder NOW for 6-month key renewal

**Part 2: Microsoft Entra Configuration**

**Step 1: Add Apple as Identity Provider**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. **Entra ID** → **External Identities** → **All identity providers**
3. **Built-in** tab → **Apple**
4. Enter:
   - **Client ID:** `com.foodbudget.signin`
   - **Apple developer team ID:** Team ID (from Step 1)
   - **Key ID:** From Step 4
   - **Client secret (.p8) key:** Paste ENTIRE contents of .p8 file
5. **Save**

**Step 2: Verify**
1. **All identity providers** → Verify "Apple" appears

**Test Apple Sign-In (After User Flow Created):**
1. Use "Run user flow" feature
2. Verify Apple appears as sign-in option
3. Test sign-up with Apple (new user)
4. Test sign-in with Apple (existing user)
5. Verify user created in Entra ID

**Cost:** $99/year Apple Developer Program
**Estimated Effort:** 2-3 hours

---

**Outcome:** Google, Facebook, and Apple configured and ready for user flow selection

**Estimated Effort:** 4-7 hours total (Google: 1-2 hours, Facebook: 1-2 hours, Apple: 2-3 hours)

**3. Configure user flow (sign-up/sign-in)** (DO THIS SECOND)

**Prerequisites:**
- Tenant created (Phase 1, Task 1)
- App registrations created (Phase 1, Task 2)
- Social providers configured (Task 4 above)

**Steps:**

1. Navigate to Microsoft Entra admin center → **Entra ID** → **External Identities** → **User flows** → **New user flow**

2. Enter user flow name:
   - **Name:** `SignUpSignIn`

3. Configure identity providers:
   - Under **Identity providers** section:
     - ✅ Check **Email Accounts**
     - Select **Email with password** (not Email OTP)
     - ✅ Check **Google** (configured in Task 4)
     - ✅ Check **Facebook** (configured in Task 4)
     - ✅ Check **Apple** (configured in Task 4)

4. Configure user attributes:
   - Under **User attributes** section:
     - ✅ Check **Email Address**
     - ✅ Check **Display Name**
     - ❌ DO NOT check Given Name, Surname, Job Title, Postal Code
   - Click **OK** to confirm

5. Review and create:
   - Click **Create** button
   - Wait for confirmation

6. Associate application (do immediately for testing purposes):
   - Navigate to **Entra ID** → **External Identities** → **User flows**
   - Select `SignUpSignIn` user flow
   - In left sidebar (under "Use" section), click **Applications**
   - Click **Add application** button
   - Select **FoodBudget Mobile App** from list (or use search)
   - Click **Select** to confirm
   - Verify app appears in Applications list
   - **Result:** Sign-up and sign-in experience is immediately activated

**Critical:** Only add mobile app to user flow
- ✅ Add: **FoodBudget Mobile App** (users sign in through this)
- ❌ Do NOT add: **FoodBudget API** (APIs validate tokens, don't authenticate users)

**Important Constraints:**
- ⚠️ One application can have only ONE user flow (but one flow can serve multiple apps)
- ✅ This is why we use a single "SignUpSignIn" flow for all authentication needs
- ⚠️ Do NOT delete auto-created `b2c-extensions-app` (stores custom user attributes)

**Configuration Decisions:**
- ✅ User flow name: `SignUpSignIn`
- ✅ Authentication: Email + Password (FREE)
- ✅ User attributes: Email + Display Name only
- ✅ Social providers: Google, Facebook, Apple
- ✅ Terms/privacy checkbox: NO for MVP (deferred - no legal docs yet)
- ✅ Given name/surname: NO (using Display Name only for simplicity)

**Deferred:**
- Terms/privacy policy acceptance checkbox (no legal documents created yet)
- Can be added later when legal documents ready

**Testing User Flow (After Social Providers Configured):**

**Prerequisites:**
- User flow created and app associated ✅
- Social providers configured (Task 4) ⏸️
- Redirect URI configured (pending React Native/Expo research) ⏸️
- Wait for short delay after app association before testing

**Test Using "Run User Flow" Feature:**

1. Navigate to **Entra ID** → **External Identities** → **User flows** → Select `SignUpSignIn`
2. Click **"Run user flow"** button
3. Configure test parameters:
   - **Application:** Select **FoodBudget Mobile App**
   - **Reply URL:** Verify redirect URI
   - **Response Type:** Select appropriate token type
   - **PKCE:** Enable "Specify code challenge" (for React Native apps)
4. Click **"Run user flow"** to execute test
5. Sign-in page opens for testing

**Test ALL Authentication Methods:**
1. ✅ **Email + Password Sign-Up:** Register new user with email/password
2. ✅ **Email + Password Sign-In:** Authenticate existing user
3. ✅ **Google Sign-Up:** Register new user via Google
4. ✅ **Google Sign-In:** Authenticate existing user via Google
5. ✅ **Facebook Sign-Up:** Register new user via Facebook
6. ✅ **Facebook Sign-In:** Authenticate existing user via Facebook
7. ✅ **Apple Sign-Up:** Register new user via Apple
8. ✅ **Apple Sign-In:** Authenticate existing user via Apple

**Verify:**
- ✅ All authentication methods work correctly
- ✅ User attributes collected (email, display name)
- ✅ Redirect after authentication completes
- ✅ UI displays properly

**Outcome:** Users can sign up/sign in using email or social providers

**Estimated Effort:** 6-10 hours

---

**5. Enable self-service password reset (SSPR)**

**Prerequisites:**
- User flow created with "Email with password" enabled ✅ (Task 3)

**Overview:**
Enable users to independently reset forgotten passwords without administrator assistance.

**Steps:**

**Step 1: Enable Email OTP Authentication Method**
1. Navigate to Microsoft Entra admin center → **Entra ID** → **Authentication methods**
2. Select **Email OTP** under Policies → Method
3. Enable the feature
4. Select **"All users"** for inclusion
5. Click **Save**

**Important Notes:**
- ✅ **Email OTP is FREE** (email-based, not SMS-based)
- Email OTP is ONLY used for password reset flow
- Does NOT change primary authentication method (still Email + Password)
- Different from SMS OTP (which costs money)

**Step 2: Test Password Reset (After Redirect URI Configured)**

**Prerequisites:**
- Email OTP enabled ✅ (Step 1 above)
- Redirect URI configured (pending React Native/Expo research) ⏸️

**Test Procedure:**
1. Launch application and navigate to sign-in
2. Click **"Forgot password?"** link (if visible)
3. Enter test user email address
4. Check email for one-time passcode
5. Enter OTP code
6. Enter and confirm new password
7. Verify successful password reset
8. Sign in with new password

**Test Scenarios:**
- ✅ Forgotten password recovery
- ✅ Email OTP delivery and validation
- ✅ New password requirements enforcement
- ✅ Successful sign-in after reset

**Configuration Decisions:**
- ✅ Enable SSPR for MVP (reduces support burden, improves UX)
- ✅ Enable Email OTP authentication method (FREE)
- ✅ Show "Forgot password?" link in branding (Phase 5, Task 8)

**Outcome:** Users can independently reset forgotten passwords

**Estimated Effort:** 30-40 minutes

---

### Phase 3: Backend Integration
**Goal:** Secure the backend API

**Tasks:**
6. Protect backend API using Azure App Service Authentication
   - Configure App Service Authentication with External ID
   - Set authority URL: `https://foodbudget.ciamlogin.com/`
   - Configure token validation
   - **Pending:** App Service auth + ASP.NET Core integration details
   - **Pending:** `[Authorize]` attribute usage pattern
   - **Pending:** User claims access in controllers
   - **Pending:** Public vs protected endpoint configuration

**Outcome:** Backend API rejects unauthenticated requests, validates tokens

**Estimated Effort:** TBD (pending research completion)

---

**6B. Implement backend rate limiting for sign-up endpoints**

**Goal:** Protect against bot-driven mass account creation and control costs

**Why This Matters:**
- Prevents bot-driven fake account registrations
- Controls Entra External ID costs (MAU-based pricing)
- Protects database from bloat
- Complements email verification for defense-in-depth

**Scope:**
- Rate limit sign-up/registration endpoints
- Rate limit by IP address (prevent single-source attacks)
- Configure sensible limits for MVP (e.g., 10 sign-ups per IP per hour)
- Return 429 Too Many Requests for rate-limited requests

**Implementation:**

**Option A: ASP.NET Core Built-In Rate Limiting (.NET 7+)**

```csharp
// Program.cs
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    // Fixed window rate limiter for sign-up
    options.AddFixedWindowLimiter("signup", rateLimitOptions =>
    {
        rateLimitOptions.PermitLimit = 10; // 10 requests
        rateLimitOptions.Window = TimeSpan.FromHours(1); // per hour
        rateLimitOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        rateLimitOptions.QueueLimit = 0; // No queuing
    });

    // Configure rejection response
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            error = "Too many sign-up attempts. Please try again later.",
            retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
                ? retryAfter.ToString()
                : "1 hour"
        }, cancellationToken);
    };
});

var app = builder.Build();

// Enable rate limiting middleware
app.UseRateLimiter();

app.Run();
```

**Option B: AspNetCoreRateLimit Package (More Features)**

```csharp
// Install: dotnet add package AspNetCoreRateLimit

// Program.cs
using AspNetCoreRateLimit;

builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*:/api/auth/signup*",
            Period = "1h",
            Limit = 10
        }
    };
});

builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

var app = builder.Build();
app.UseIpRateLimiting();
```

**Rate Limit Configuration:**
- **Sign-up endpoints:** 10 per IP per hour (strict)
- **Sign-in endpoints:** 50 per IP per hour (more lenient)
- **Password reset:** 5 per IP per hour (prevent abuse)
- **General API:** 1000 per IP per hour (generous)

**Testing:**
```bash
# Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"Test123!"}'
  echo "Request $i completed"
done

# Expected: First 10 succeed, requests 11-15 return 429
```

**Important Notes:**
- Rate limiting by IP address (not user ID, since they're not authenticated yet)
- Won't affect legitimate users (10/hour is generous for sign-ups)
- Social login bypasses this (handled by Google/Facebook)
- Email verification provides additional protection
- Consider X-Forwarded-For header if behind proxy/load balancer

**Acceptance Criteria:**
- [ ] Rate limiting configured for sign-up endpoints
- [ ] Returns 429 status code when limit exceeded
- [ ] Clear error message indicates retry time
- [ ] Rate limits don't affect legitimate usage patterns
- [ ] Configuration is environment-specific (stricter in production)
- [ ] Tests verify rate limiting behavior

**Files to Create:**
- Backend: `Middleware/RateLimitingConfiguration.cs` (if using AspNetCoreRateLimit)

**Files to Modify:**
- Backend: `Program.cs` - Add rate limiting configuration
- Backend: `appsettings.json` - Configure rate limit values

**Protection Strategy (Defense in Depth):**
1. ✅ **Email verification** (SSPR, Phase 2, Task 5) - Slows bots
2. ✅ **Backend rate limiting** (This task) - Prevents mass creation
3. ✅ **Social login** (60%+ of users) - Google/Facebook handle bots
4. ✅ **Entra baseline security** (automatic) - DDoS, brute force protection
5. ✅ **Monitoring** (Sprint 5) - Detect unusual patterns

**Cost Protection:**
- Prevents bot-driven MAU costs (Entra charges per active user >50K)
- Protects database from bloat (storage costs)
- Prevents API abuse (compute costs)

**Estimated Effort:** 2-4 hours
- Configuration: 1 hour
- Testing: 1 hour
- Environment setup: 1-2 hours

**Outcome:** Sign-up endpoints protected from bot-driven mass registrations

---

### Phase 4: Mobile Authentication
**Goal:** Enable mobile app to authenticate users and call protected API

**Tasks:**
7. Integrate authentication in mobile app
   - Add MSAL React Native package
   - Configure authentication (authority, client ID, scopes)
   - Implement sign-in UI
   - Implement sign-up flow
   - Implement sign-out
   - Acquire access tokens
   - **Pending:** MSAL React Native package name and configuration
   - **Pending:** Redirect URI format for React Native/Expo
   - **Pending:** Token acquisition code examples

8. Connect mobile app to protected API
   - Configure API scopes in mobile app
   - Implement authenticated API client
   - Add authentication tokens to API requests
   - Handle token refresh
   - Handle authentication errors (401, expired tokens)
   - **Pending:** Token injection pattern with MSAL
   - **Pending:** API client configuration

**Outcome:** Mobile app can authenticate users and successfully call protected backend API

**Estimated Effort:** TBD (pending research completion)

---

### Phase 5: Polish & Verification
**Goal:** Brand the authentication experience and verify security

**Tasks:**
9. Apply custom branding

**Prerequisites:**
- ⚠️ **Temporary branding assets** (no official branding exists yet)
- Privacy Policy and Terms of Service URLs (placeholder pages from Story 6.7)

**Note:** Using temporary branding for Sprint 4 - can be updated with official branding post-MVP

**Customization Process:**

**Step 1: Access Company Branding**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Search for **Company Branding** or navigate via **Entra ID** → **Company Branding**
4. Select **Default sign-in** tab → **Edit**

**Step 2: Configure Basics Tab**
- **Favicon:** Upload browser tab icon (PNG preferred, check size requirements)
- **Background image:** Upload or select solid color (temporary background)
- **Fallback color:** Set color if image fails to load

**Step 3: Configure Layout Tab**
- **Template:** Select full-screen or partial-screen layout
- **Header/Footer:** Toggle visibility as needed
- **Preview:** Review layout appearance

**Step 4: Configure Header Tab**
- **Company logo:** Upload temporary FoodBudget logo (banner logo)
- **Logo specifications:** Review file size requirements (PNG preferred)

**Step 5: Configure Footer Tab**
- **Privacy & Cookies:** Add link to Privacy Policy page
  - URL: From Story 6.7 placeholder page
  - Link text: "Privacy Policy"
- **Terms of Use:** Add link to Terms of Service page
  - URL: From Story 6.7 placeholder page
  - Link text: "Terms of Service"

**Step 6: Configure Sign-in Form Tab**
- **Square logo (light theme):** Optional - upload if available
- **Square logo (dark theme):** Optional - upload if available
- **Banner logo:** Already configured in Header
- **Username hint text:** Leave default or customize (e.g., "Email address")
- **Sign-in page text:** Add custom message if desired (max 1,024 characters, supports Markdown)
- ✅ **Show self-service password reset:** Check this box (enables SSPR link from Phase 2, Task 5)

**Step 7: Configure Text Tab**
- Customize user attribute labels if needed
- Add any additional messaging
- Supports Markdown (hyperlinks, bold, italics, underline)

**Step 8: Review and Save**
- Review all tabs
- Verify all assets uploaded correctly
- **Save** configuration

**Testing Branded Experience:**

1. Use "Run user flow" feature to preview
2. Test sign-in page appearance
3. Verify logo displays correctly
4. Check background/colors render properly
5. Test footer links (Privacy Policy, Terms of Service)
6. Verify "Forgot password?" link appears (SSPR)
7. Test across devices:
   - Desktop browser
   - Mobile browser (iOS Safari, Android Chrome)
   - Different screen sizes
8. Test fallback behavior (if custom branding fails, should show neutral branding)

**Brand Assets Needed (Temporary):**
- Favicon (.png, check size requirements)
- Banner logo (.png preferred, check size requirements)
- Background image or solid color
- Square logos (optional, light and dark themes)
- Brand colors (hex codes)

**Important Notes:**
- PNG preferred for all images, JPG acceptable
- Review file size requirements for each image
- Custom branding has automatic fallback to neutral branding
- Company Branding and User Flows modify same JSON file - most recent change wins
- No custom CSS for MVP (use default layouts)
- English-only for MVP (multi-language deferred to backlog - Story 6.9)

**Outcome:** Temporarily branded sign-in/sign-up experience with SSPR link and legal page links

10. Verify security configuration
   - Confirm baseline security protections active (automatic)
   - Document MFA decision (NO for MVP - deferred to Story 6.10)
   - Test brute force protection
   - Document authentication methods configured
   - Verify all authentication flows work

**Outcome:** Branded authentication experience, security verified and documented

**Estimated Effort:** 5-10 hours

---

## Success Criteria

### Functional Requirements
- ✅ Users can sign up using email + password
- ✅ Users can sign up using Google, Facebook, or Apple
- ✅ Users can sign in using any enabled authentication method
- ✅ Users can sign out
- ✅ Mobile app acquires and uses access tokens
- ✅ Backend API rejects unauthenticated requests
- ✅ Backend API accepts valid authenticated requests
- ✅ Token refresh works automatically
- ✅ Authentication errors are handled gracefully

### Non-Functional Requirements
- ✅ Baseline security protections active (automatic)
- ✅ Branded sign-in/sign-up experience
- ✅ OAuth 2.0 compliant (browser-based authentication with PKCE)
- ✅ All tests passing (TDD approach - tests embedded in each task)

---

## Technical Decisions Made

**Detailed rationale in:** [Research Guide - Executive Summary](./entra-external-id-setup-guide.md#1-executive-summary-)

### Authentication Approach
- ✅ **Tenant Type:** External tenant (consumer-facing)
- ✅ **Authentication Methods:** Email+Password + Google + Facebook + Apple
- ✅ **Auth Flow:** Standard MSAL (browser-based with in-app tabs)
- ❌ **NOT using:** Native authentication (React Native not supported)

### User Data
- ✅ **Attributes:** Email (required) + Display Name (required) only
- ❌ **NOT using:** Custom attributes in Entra (store app data in FoodBudget database)

### Security
- ✅ **Baseline Security:** Automatic (zero configuration required)
- ❌ **MFA:** NO for MVP (reduces friction, baseline security sufficient)

### Branding
- ✅ **Customization:** Portal-based (logo, colors, footer links)
- ❌ **Custom Domain:** NO for MVP (save $50-100/month)
- ❌ **Custom CSS:** NO for MVP (default options sufficient)

### Backend Integration
- ✅ **Primary Approach:** Azure App Service Authentication (EasyAuth)
- ✅ **Authority URL:** `https://foodbudget.ciamlogin.com/`
- ✅ **Package (if needed):** Microsoft.Identity.Web

### Cost
- ✅ **FREE for MVP:** First 50,000 Monthly Active Users
- ✅ **Cost Savings:** No custom domain, no SMS MFA

---

## Deferred Features (Post-MVP)

**NOT implementing in Sprint 4:**

| Feature | Why Deferred | Estimated Effort |
|---------|--------------|------------------|
| Custom URL Domain | Not essential, costs $50-100/month | 7-11 hours |
| Custom Authentication Extensions | Adds complexity, no current use case | 16-32 hours |
| Email OTP MFA (Story 6.10) | Reduces conversions, baseline security sufficient, optional post-MVP | 5-8 hours |
| Custom Attributes in Entra | Easier to manage in FoodBudget database | N/A |

---

## Dependencies & Blockers

### Pending Research (In Progress)
- ⏸️ **MSAL React Native package details** - Package name, configuration, code examples
- ⏸️ **App Service auth + ASP.NET Core integration** - Implementation patterns, user claims access

### Pending User Decisions
- ⏸️ **Brand assets** - Logo, brand colors, favicon, privacy/terms URLs (needed for Phase 5)
- ⏸️ **User attributes** - Include given name/surname? (recommend: NO)
- ⏸️ **Terms checkbox** - Include during sign-up? (recommend: YES)

### No Technical Blockers
- ✅ React Native IS supported (confirmed via standard MSAL)
- ✅ All architectural decisions made
- ✅ Platform capabilities confirmed

---

## Estimated Timeline

### Known Effort
- Phase 1 (Foundation): 1-3 hours
- Phase 2 (Configuration): 6-10 hours
- Phase 5 (Polish): 5-10 hours
- **Subtotal:** 12-23 hours

### Pending Effort (Research In Progress)
- Phase 3 (Backend): TBD
- Phase 4 (Mobile): TBD

### Total Estimate
**TBD** - Will be refined after completing how-to guide research for backend and mobile integration patterns.

---

## Testing Approach

**TDD (Test-Driven Development):** Tests embedded in each task

### Test Coverage Required
- Unit tests for authentication configuration
- Integration tests for token validation
- Integration tests for API protection
- End-to-end tests for complete authentication flows
- Manual testing for branded user experience

### Test Scenarios
- Sign up with email + password
- Sign up with Google, Facebook, Apple
- Sign in with all methods
- Sign out
- Access protected API with valid token
- Access protected API without token (401 expected)
- Token refresh
- Invalid/expired token handling

---

## References

- **Research Guide:** [entra-external-id-setup-guide.md](./entra-external-id-setup-guide.md)
- **Executive Summary:** [Section 1 - All MVP Decisions](./entra-external-id-setup-guide.md#1-executive-summary-)
- **Feature Reference:** [Section 3 - Feature-by-Feature Details](./entra-external-id-setup-guide.md#3-feature-reference-)
- **Implementation Planning:** [Section 4 - Questions & Blockers](./entra-external-id-setup-guide.md#4-implementation-planning)
- **Microsoft Docs:** https://learn.microsoft.com/en-us/entra/external-id/customers/

---

## Notes

- Sprint 4 can begin once:
  1. How-to guide research completes (Phases 3-4 details)
  2. Brand assets are gathered
  3. Minor user decisions are finalized (given name/surname, terms checkbox)

- Phases 1-2 and Phase 5 can begin immediately (100% ready)
- Phases 3-4 details will be added as research completes

---

**Last Updated:** 2025-01-29
**Research Status:** 75% complete (24 of ~28 docs analyzed)
**Ready to Start:** Phases 1, 2, and 5 (after brand assets)
**Pending:** Phases 3-4 implementation details
