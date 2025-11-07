# Sprint 5: User Authentication (Web + Mobile)

**Sprint Goal:** Enable users to sign up and sign in via the FoodBudget web app (Phase 1) and mobile app (Phase 2), and securely access the protected backend API.

**Status:** ⏳ IN PROGRESS (Story 5.1 Complete ✅ | 1/3 Phase 1 stories)
**Prerequisites:** Sprint 4 complete (backend API protected with JWT validation) ✅
**Target Completion:** TBD
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)
**Implementation Approach:** Web-first, then mobile (shared UI components, platform-specific MSAL integration)

---

## Sprint Context

**What This Sprint Delivers:**

**Phase 1: Web Authentication with Email/Password** (Priority 1 - ~15 hours)
- ✅ Users can sign up and sign in via GitHub Pages web app using **email + password**
- ✅ Web app acquires access tokens from Entra
- ✅ Web app calls protected backend API successfully
- ✅ End-to-end authentication working on web
- 🎯 **MVP authentication complete** - Google Sign-In deferred to Phase 3

**Phase 2: Mobile Authentication with Email/Password** (Priority 2 - ~11 hours)
- 📱 Users can sign up and sign in via React Native mobile app using **email + password**
- 📱 Mobile app uses system browser for OAuth
- 📱 Mobile app acquires access tokens from Entra
- 📱 Mobile app calls protected backend API successfully
- 📱 End-to-end authentication working on iOS and Android

**Phase 3: Post-Sprint Enhancements** (Optional - as needed)
- 🔐 Rate limiting for authentication endpoints
- 🖼️ User delegation SAS for recipe images
- 🌐 Google Sign-In as social identity provider
- 🔑 Self-service password reset
- 🎨 Custom branding for sign-in pages

**What This Sprint Builds On (Sprint 4):**
- ✅ Entra External ID tenant created (Story 4.1)
- ✅ Backend API registration created (Story 4.1)
- ✅ **Web app (SPA) registration created (Story 4.2) - ready for Phase 1**
- ✅ Backend API protected with JWT validation (Story 4.3)
- ✅ Token claims structure verified (Story 4.4)
- ✅ API tested with manual tokens (Story 4.4)

**Prerequisites for Sprint 5:**
- ✅ Web app registration EXISTS from Sprint 4.2 (Client ID: `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`)
- ⚠️ Mobile app registration NOT created yet (will be created in Phase 2, Story 5.0B)
- 🌐 Web and mobile use SEPARATE registrations (different platforms, different redirect URIs)

**Authentication Platform:** Microsoft Entra External ID (External Tenants)
**Frontend:** React Native + Expo (runs on web AND mobile with shared code)
**Backend:** ASP.NET Core Web API (.NET 8) - already protected in Sprint 4

**Key Architectural Decisions:**
- **Web-first approach:** Implement web authentication first (faster iteration, easier testing)
- **Platform abstraction:** Shared UI components, platform-specific MSAL implementations
- **Separate app registrations:** Web (SPA) and Mobile (native) use different registrations
- **Client-side authentication:** Apps authenticate with Entra directly, backend validates tokens
- **PKCE automatic:** Both web and mobile use MSAL libraries that handle PKCE
- **OAuth flows:**
  - Web: Browser redirect flow (SPA pattern)
  - Mobile: System browser with deep linking (SFAuthenticationSession / Chrome Custom Tabs)

**Reference Documentation:**
- 📖 [Implementation Guide](./entra-external-id-setup-guide.md) - Complete technical reference
- 📖 [Operations Guide](./operations/entra-operations-guide.md) - Post-launch admin procedures
- 📚 [Research Archive](./archive/entra-research-archive.md) - Decision history

---

## Table of Contents

### Phase 1: Web Authentication (Email/Password) - ~18-19 hours
- [Story 5.1: Create Email/Password User Flow](#story-51-create-emailpassword-user-flow) 🟢 COMPLETE
- [Story 5.2: Integrate MSAL Authentication in Web App](#story-52-integrate-msal-authentication-in-web-app) 🟢 COMPLETE
- [Story 5.3: Connect Web App to Protected API](#story-53-connect-web-app-to-protected-api) 🟢 COMPLETE
- [Story 5.4: Enforce User-Scoped Recipe Data](#story-54-enforce-user-scoped-recipe-data) 🟢 COMPLETE

### Phase 2: Mobile Authentication (Email/Password) - ~10 hours
- [Story 5.5: Register Mobile App (React Native)](#story-55-register-mobile-app-react-native) 🔴 NOT STARTED
- [Story 5.6: Integrate MSAL Authentication in Mobile App](#story-56-integrate-msal-authentication-in-mobile-app) 🔴 NOT STARTED
- [Story 5.7: Connect Mobile App to Protected API](#story-57-connect-mobile-app-to-protected-api) 🔴 NOT STARTED

### Phase 3: Post-Sprint Enhancements (Optional) - as needed
- [Story 5.7: Implement Rate Limiting for Sign-Up Endpoints](#story-57-implement-rate-limiting-for-sign-up-endpoints) 🔴 NOT STARTED
- [Story 5.8: Upgrade Recipe Image Upload to User Delegation SAS](#story-58-upgrade-recipe-image-upload-to-user-delegation-sas) 🔴 NOT STARTED
- [Story 5.9: Add Google Sign-In (Social Identity Provider)](#story-59-add-google-sign-in-social-identity-provider) 🔴 NOT STARTED
- [Story 5.10: Enable Self-Service Password Reset](#story-510-enable-self-service-password-reset-optional) 🔴 NOT STARTED
- [Story 5.11: Apply Custom Branding](#story-511-apply-custom-branding-optional) 🔴 NOT STARTED
- [Story 5.12: Add Facebook and Apple Authentication](#story-512-add-facebook-and-apple-authentication-optional) 🔴 NOT STARTED

---

## User Stories

### **PHASE 1: WEB AUTHENTICATION** (Do First - ~15 hours)

Stories 5.1, 5.2, and 5.3 implement email/password authentication for the web app (GitHub Pages). These stories use the web app registration created in Sprint 4.2.

**MVP Approach:** Email/password authentication ONLY. Google Sign-In deferred to Phase 3 (Story 5.9) to reduce complexity and external dependencies.

---

### Story 5.1: Create Email/Password User Flow ✅ **COMPLETE**

**Status:** ✅ Completed 2025-11-06

**Title:** Configure user sign-up and sign-in flow with email/password authentication

**User Story:**
As a **FoodBudget user**, I want to sign up for an account using my email and password, so that I can access my personalized food budget data.

**Acceptance Criteria:**
- ✅ User flow `SignUpSignIn` created in Entra External ID
- ✅ Email + Password authentication enabled
- ✅ Google social provider NOT configured (deferred to Phase 3, Story 5.9)
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
- **Authentication:** Email + Password ONLY (Google deferred to Phase 3)
- **User attributes:** Email (required), Display Name (required)
- **Token version:** AccessTokenAcceptedVersion set to 2 (prevents IDX20804 error)
- **Reference:** [User Flow Configuration Guide](./entra-external-id-setup-guide.md#user-flow-configuration)

**Key Decisions:**
- **Minimal attributes:** Only collecting Email and Display Name (no given/surname)
- **No social auth in MVP:** Email/password only for Phase 1 simplicity
- **No terms checkbox:** Deferred post-sprint (no legal documents yet)
- **Email OTP:** Not configured (password reset deferred to Story 5.10)

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
User flow successfully configured and tested. Email/password authentication working for web app. Ready for MSAL integration in Story 5.2.

**Estimated Effort:** 1-2 hours (Actual: ~1.5 hours)

**Priority:** 🔴 MUST HAVE (Foundation for authentication)

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

**Technical Notes/Constraints:**

**Prerequisites Verification:**
- ✅ Redirect URIs registered in Entra admin center (localhost:8081, GitHub Pages, jwt.ms)
- ✅ Platform type is "Single-page application" (SPA) - enables CORS + PKCE
- ✅ Token version set to v2 (`requestedAccessTokenVersion: 2` in manifest)

**MSAL Package:** `@azure/msal-react@3.0.21` + `@azure/msal-browser@4.26.0`
- **Why:** Official Microsoft library for React SPAs
- **Pattern:** React hooks and context provider
- **Platform Support:** Web ONLY (React Native mobile uses different library in Story 5.5)

**Environment Variables:**
```bash
# .env (DO NOT commit to git)
EXPO_PUBLIC_MSAL_CLIENT_ID=9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae
EXPO_PUBLIC_MSAL_TENANT_ID=644a9317-ded3-439a-8f0a-9a8491ce35e9
EXPO_PUBLIC_MSAL_API_SCOPE=api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user
```

**Configuration:**
- **Authority:** `https://foodbudget.ciamlogin.com/<tenant-id>`
- **Redirect URIs:** `${window.location.origin}/RecipeTracker/` (dynamic for localhost/GitHub Pages)
- **Cache:** sessionStorage (session-scoped, cleared on tab close)
- **Scopes:** API scope for protected backend access
- **Reference:** `src/lib/auth/msalConfig.web.ts`

**Files Created:**
- `src/lib/auth/msalConfig.web.ts` - MSAL configuration
- `src/lib/auth/authTypes.ts` - Shared TypeScript interfaces (AuthUser, UseAuthResult, MsalErrorCode)
- `src/hooks/useMsal.web.ts` - Web-specific MSAL hook (signIn, signOut, getAccessToken)
- `src/hooks/useAuth.ts` - Platform abstraction layer (web/mobile)
- `src/hooks/__tests__/useMsal.web.test.ts` - 17 unit tests
- `src/hooks/__tests__/useAuth.test.ts` - Platform abstraction tests

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

**Testing Completed:**
- ✅ Environment setup verified (.env, MSAL packages, redirect URIs)
- ✅ Localhost testing (sign-up, sign-in, token storage, protected routes, sign-out)
- ✅ GitHub Pages testing (authentication, token management, protected routes)
- ✅ Email/password authentication (validation, password requirements, credentials)
- ✅ Token management (sessionStorage, expiration, refresh, protected route access)
- ✅ Error handling (cancellation, network errors, invalid credentials, uninitialized state)
- ✅ Browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Performance (initialization, redirect timing, async token acquisition)

**Completion Summary:**
MSAL authentication fully integrated and tested on web platform. Email/password authentication working on localhost and GitHub Pages. Protected routes enforcing authentication. Token management and refresh working automatically. All error scenarios handled gracefully. 17 unit tests passing. Ready for Story 5.3 (API integration).

**Estimated Effort:** 5-7 hours (Actual: ~6 hours)

**Priority:** 🔴 MUST HAVE (Users can't authenticate without this)

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

**Testing Completed:**
- ✅ API calls with valid token return 200 OK + data
- ✅ API calls without token return 401 Unauthorized
- ✅ Token refresh automatic via MSAL (tested with 1-hour expiration)
- ✅ Backend Audience validation fixed (appsettings.json binding)
- ✅ Network error handling with user-friendly messages
- ✅ Empty state component shown for empty recipe lists
- ✅ All 29 fetch-client unit tests passing
- ✅ Integration testing on GitHub Pages

**Completion Summary:**
FetchClient singleton successfully integrated with MSAL authentication. Automatic Bearer token injection working on all API requests. Backend Audience validation fixed. End-to-end authentication tested on GitHub Pages with successful recipe API calls. 29 unit tests passing with 93.42% coverage.

**Estimated Effort:** 4-5 hours (Actual: ~5 hours including backend fixes)

**Priority:** 🔴 MUST HAVE (API integration required for functionality)

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

**Files Modified:**
- `FoodBudgetAPI/Entities/Recipe.cs` - UserId made required (not nullable)
- `FoodBudgetAPI/Data/Configurations/RecipeConfiguration.cs` - Added required constraint and index
- `FoodBudgetAPI/Models/DTOs/Requests/RecipeRequestDto.cs` - UserId property removed
- `FoodBudgetAPI/Controllers/RecipeController.cs` - Ownership validation added to all methods
- `FoodBudgetAPI/Mapping/RecipeMappingProfile.cs` - Updated mappings
- `FoodBudgetAPI/Data/Migrations/20241105223851_MakeRecipeUserIdRequired.cs` - Database migration
- `FoodBudgetAPITests/Controllers/RecipeControllerTests.cs` - 15 new unit tests added

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

**Estimated Effort:** 4-5 hours

**Priority:** 🔴 CRITICAL (Security vulnerability - users could access each other's data)

**Dependencies:**
- ✅ Story 5.3 complete (authentication working)
- ✅ Recipe entity has UserId field
- ✅ JWT token includes userId claim (`oid`)

---

### **PHASE 2: MOBILE AUTHENTICATION** (Do Later - ~10 hours)

Stories 5.5, 5.6, and 5.7 implement email/password authentication for the mobile app (iOS/Android). These stories create a separate mobile app registration and use React Native MSAL.

**MVP Approach:** Email/password authentication ONLY. Google Sign-In deferred to Phase 3 (Story 5.9).

---

### Story 5.5: Register Mobile App (React Native)

**Title:** Create mobile app registration for React Native with Expo

**User Story:**
As a **developer**, I want to register the React Native mobile app in Entra External ID, so that the mobile app can authenticate users and access the protected API.

**Acceptance Criteria:**
- [ ] Mobile app registration created in Entra External ID tenant
- [ ] App type configured as "Public client (mobile & desktop)"
- [ ] Redirect URI configured for MSAL: `msauth://com.foodbudget.app/callback`
- [ ] Mobile app granted delegated permission to `access_as_user` scope
- [ ] Admin consent granted for API permissions
- [ ] Mobile app client ID documented securely
- [ ] Public client flows enabled (required for mobile apps)
- [ ] Native authentication disabled (using standard OAuth flow)

**Definition of Done:**
- [ ] Mobile app registration visible in Entra tenant
- [ ] Public client flow enabled
- [ ] Native authentication disabled
- [ ] Redirect URI configured (MSAL custom scheme)
- [ ] API permissions configured and consented to `access_as_user` scope
- [ ] Mobile app client ID documented for Story 5.3B MSAL integration
- [ ] Separate from web app registration (different platform requirements)

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Web authentication working (Phase 1 complete)
- ✅ User flow exists (Story 5.2)

**Why Separate from Web App Registration (Story 4.2):**
- Web app (SPA) uses browser redirect flow (`https://` redirect URIs)
- Mobile app uses system browser with deep linking (`msauth://` custom scheme)
- Different MSAL libraries (`@azure/msal-react` vs `react-native-msal`)
- Cleaner separation of concerns and easier troubleshooting
- Follows Microsoft best practice: one registration per platform

**Configuration Checklist:**

**STEP 1: Create Mobile App Registration**
1. Entra admin center → **App registrations** → **+ New registration**
2. Name: "FoodBudget Mobile App"
3. Supported account types: **Accounts in this organizational directory only** (FoodBudget-Tenent)
4. **Skip redirect URI** (add after registration)
5. Click **Register**
6. **Record the Application (client) ID**

**STEP 2: Configure Authentication & Redirect URI**
1. Navigate to **Authentication** (left menu)
2. Click **+ Add a platform**
3. Select **Mobile and desktop applications**
4. Add custom redirect URI: `msauth://com.foodbudget.app/callback`
5. Click **Configure**
6. Scroll to **Advanced settings**
7. **Allow public client flows:** Set to **Yes**
8. **Enable native authentication:** Set to **No**
9. Click **Save**

**STEP 3: Configure API Permissions**
1. Navigate to **API permissions** (left menu)
2. **(Optional)** Remove Microsoft Graph User.Read permission
3. Click **+ Add a permission**
4. Select **APIs my organization uses** tab
5. Select **FoodBudgetAPI**
6. Select **Delegated permissions**
7. Check **access_as_user**
8. Click **Add permissions**
9. Click **Grant admin consent for FoodBudget-Tenent**
10. Verify status shows "Granted for FoodBudget-Tenent" with green checkmark

**STEP 4: Verify Configuration**
1. Confirm redirect URI is listed under "Mobile and desktop applications"
2. Confirm public client flows enabled
3. Confirm native authentication disabled
4. Confirm API permission granted and consented
5. Document mobile app client ID securely
6. Add mobile app to user flow (User flows → SignUpSignIn → Applications → Add application)

**Estimated Effort:** 1 hour

**Priority:** 🔴 MUST HAVE (Foundation for mobile authentication)

---

### Story 5.5: Integrate MSAL Authentication in Mobile App

**Title:** Enable users to sign in via React Native mobile app with email/password

**User Story:**
As a **FoodBudget user**, I want to sign in through the mobile app using my email and password, so that I can access my food budget from my phone.

**Acceptance Criteria:**
- [ ] MSAL React Native package installed and configured
- [ ] Authority URL configured: `https://foodbudget.ciamlogin.com/`
- [ ] Mobile app client ID configured (from Story 5.4)
- [ ] API scopes configured (e.g., `api://<backend-api-id>/access_as_user`)
- [ ] Redirect URI matches app registration (from Story 5.4)
- [ ] Sign-in button triggers authentication flow
- [ ] User sees branded sign-in page in in-app browser
- [ ] **Email + Password authentication works** (MVP - Google deferred to Phase 3)
- [ ] Access token acquired after successful authentication
- [ ] Access token stored securely (MSAL handles token storage)
- [ ] Refresh token acquired and stored
- [ ] Sign-out functionality works
- [ ] App handles authentication errors gracefully

**Definition of Done:**
- [ ] User can sign in with email + password
- [ ] Access token visible in app state/debug logs
- [ ] Sign-out clears token and returns to sign-in screen
- [ ] Code reviewed
- [ ] No hardcoded secrets (client ID from config file)
- [ ] Unit tests for authentication state management

**Technical Notes/Constraints:**
- **MSAL package:** React Native MSAL library (exact package TBD - research during implementation)
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Client ID:** From Sprint 4, Story 4.2 (mobile app registration already complete)
- **Scopes:** Request access to backend API
  - Format: `api://<backend-api-client-id>/access_as_user`
  - Or custom scope names defined in API registration
- **Browser experience:** Uses in-app browser tabs
  - iOS: SFSafariViewController (seamless, not app switching)
  - Android: Chrome Custom Tabs (seamless)
- **PKCE required:** Auto-enabled by MSAL for mobile apps (OAuth 2.1 standard)
- **Redirect URI format:** TBD based on React Native/Expo MSAL documentation
  - Likely: `msauth://<bundle-id>/auth` or custom scheme
  - Must match app registration from Sprint 4, Story 4.2 (update placeholder if needed)
- **Token lifetime:**
  - Access token: Default 1 hour
  - Refresh token: Default 90 days
- **MSAL handles automatically:**
  - Token caching (secure storage)
  - Token refresh (before expiration)
  - PKCE code challenge/verifier
  - Secure storage (iOS Keychain, Android KeyStore)
- **Reference:** MSAL React Native documentation (pending research)

**Implementation Pattern (Pseudocode):**
```javascript
// Install: npm install @azure/msal-react-native

// MSALConfig.js
const msalConfig = {
  auth: {
    clientId: '<mobile-app-client-id>',
    authority: 'https://foodbudget.ciamlogin.com/',
    redirectUri: '<redirect-uri-from-app-registration>',
  },
};

const scopes = ['api://<backend-api-id>/access_as_user'];

// AuthContext.js
const signIn = async () => {
  try {
    const result = await pca.acquireTokenInteractive({
      scopes: scopes,
    });

    // result.accessToken - use for API calls
    // result.account - user info
    setUser(result.account);
    setAccessToken(result.accessToken);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};

const signOut = async () => {
  await pca.signOut();
  setUser(null);
  setAccessToken(null);
};

// Get token silently (for API calls)
const getAccessToken = async () => {
  try {
    const result = await pca.acquireTokenSilent({
      scopes: scopes,
      account: currentAccount,
    });
    return result.accessToken;
  } catch (error) {
    // Silent token acquisition failed, trigger interactive
    return await signIn();
  }
};
```

**Error Handling:**
- User cancels authentication → Show message, stay on sign-in screen
- Network error → Show "Check internet connection" message
- Invalid credentials → Display error from Entra (e.g., "Incorrect password")
- Token acquisition fails → Re-trigger interactive sign-in

**Estimated Effort:** 4-8 hours (depends on MSAL React Native documentation clarity)

**Priority:** 🔴 MUST HAVE (Users can't authenticate without this)

---

### Story 5.6: Connect Mobile App to Protected API

**Title:** Enable authenticated API calls from mobile app

**User Story:**
As a **FoodBudget user**, I want the mobile app to securely access my data from the backend, so that I can view and manage my food budget.

**Acceptance Criteria:**
- [ ] Mobile app includes access token in API requests (`Authorization: Bearer <token>`)
- [ ] API client configured with authentication interceptor
- [ ] Successful API call returns user data (e.g., recipes, grocery lists)
- [ ] Expired token triggers automatic refresh via MSAL
- [ ] Refreshed token used for subsequent requests
- [ ] HTTP 401 from API triggers re-authentication flow
- [ ] Network errors handled gracefully (user-friendly messages)
- [ ] API calls fail gracefully when offline
- [ ] Loading states shown during API calls

**Definition of Done:**
- [ ] At least one protected API endpoint called successfully from mobile app
- [ ] Token refresh tested (wait for expiration or force expiration)
- [ ] 401 error handling tested (simulate expired token or remove token)
- [ ] User sees appropriate error messages for auth failures
- [ ] Code reviewed
- [ ] Integration test verifies end-to-end flow (sign in → call API → get data)

**Technical Notes/Constraints:**
- **Dependencies:**
  - Sprint 4 complete (API protected with JWT validation)
  - Story 5.5 complete (mobile app can sign in and get tokens)
- **Authorization header format:** `Authorization: Bearer <access_token>`
- **Token acquisition:** Use MSAL's `acquireTokenSilent()` before each API call
  - Returns cached token if valid
  - Auto-refreshes if expired
  - Falls back to interactive if refresh fails
- **API base URL:** From configuration (e.g., `https://foodbudget-api.azurewebsites.net`)
- **Retry logic:** Implement exponential backoff for HTTP 429 (rate limiting)
- **Error handling:**
  - 401 Unauthorized → Re-authenticate user (call `acquireTokenInteractive`)
  - 403 Forbidden → Show "Access Denied" (shouldn't happen in MVP)
  - 429 Too Many Requests → Retry with backoff
  - 500 Internal Server Error → Show "Server Error, please try again"
  - Network error → Show "Check your internet connection"

**Implementation Pattern:**
```javascript
// api/apiClient.js
import axios from 'axios';
import { getAccessToken } from '../auth/MSALConfig';

const apiClient = axios.create({
  baseURL: 'https://foodbudget-api.azurewebsites.net',
});

// Add authentication interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Get token before each request (MSAL handles caching/refresh)
    const token = await getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired, trigger re-authentication
      await handleReAuthentication();
    } else if (error.response?.status === 429) {
      // Rate limited, retry with backoff
      return retryWithBackoff(error.config);
    }
    return Promise.reject(error);
  }
);

// Example API call
export const getRecipes = async () => {
  try {
    const response = await apiClient.get('/api/recipes');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    throw error;
  }
};
```

**Testing Scenarios:**

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| API call with valid token | 200 OK + data returned | [ ] |
| API call with expired token | Auto-refresh → retry → success | [ ] |
| API call when offline | Network error message shown | [ ] |
| 401 from API | Re-authentication triggered | [ ] |
| 429 rate limit | Retry with exponential backoff | [ ] |
| User signs out | API calls stop (no token) | [ ] |

**Estimated Effort:** 3-5 hours

**Priority:** 🔴 MUST HAVE (Completes end-to-end authentication)

---

### Story 5.10: Enable Self-Service Password Reset (Optional)

**Title:** Allow users to reset forgotten passwords

**User Story:**
As a **FoodBudget user**, I want to reset my password if I forget it, so that I can regain access to my account without contacting support.

**Acceptance Criteria:**
- [ ] Email OTP authentication method enabled in Entra
- [ ] "Forgot password?" link visible on sign-in page
- [ ] User can request password reset from web and mobile apps
- [ ] One-time passcode delivered via email
- [ ] User can enter OTP and set new password
- [ ] New password meets security requirements (displayed to user)
- [ ] User can sign in with new password
- [ ] Password reset tested end-to-end

**Definition of Done:**
- [ ] Email OTP enabled for all users in Entra admin center
- [ ] "Show self-service password reset" enabled in Company Branding (if Story 5.11 implemented)
- [ ] Test user successfully resets password
- [ ] Email delivery confirmed (check spam folder during testing)
- [ ] Password reset flow works from both web and mobile apps

**Technical Notes/Constraints:**
- **Prerequisites:** Phase 1 & 2 complete (email/password auth working)
- **Email OTP:** FREE (email-based, not SMS)
- **Configuration location:** Entra admin center → Authentication methods → Email OTP
- **Enable for:** "All users"
- **Branding dependency:** "Forgot password?" link appears if:
  - Email OTP enabled, AND
  - "Show self-service password reset" enabled in Company Branding (Story 5.11)
- **Password requirements:** Displayed on reset page (Entra defaults)
- **Testing:** Use test user account, verify email delivery
- **Reference:** [SSPR Configuration](./entra-external-id-setup-guide.md) (lines 676-729)

**Configuration Steps:**
1. Entra admin center → Authentication methods
2. Select "Email OTP"
3. Enable: "All users"
4. Save configuration
5. Test with "Run user flow" → Click "Forgot password?"
6. Verify email OTP sent and works

**Estimated Effort:** 30 minutes - 1 hour

**Priority:** 🟡 SHOULD HAVE (Low effort, high user value - implement if simple)

---

### Story 5.11: Apply Custom Branding (Optional)

**Title:** Brand authentication experience with FoodBudget identity

**User Story:**
As a **FoodBudget user**, I want to see FoodBudget branding during sign-in, so that I trust the authentication process and have a consistent experience.

**Acceptance Criteria:**
- [ ] FoodBudget logo appears on sign-in page
- [ ] Background color or image matches brand (temporary branding acceptable)
- [ ] Favicon shows in browser tab
- [ ] Footer links include Privacy Policy and Terms of Service (placeholder pages)
- [ ] "Forgot password?" link visible (if Story 5.10 implemented)
- [ ] Branding tested across desktop and mobile browsers
- [ ] Fallback to neutral branding works if custom assets fail to load

**Definition of Done:**
- [ ] Company Branding configured in Entra admin center
- [ ] All brand assets uploaded (logo, favicon, background)
- [ ] Tested with "Run user flow" feature
- [ ] Mobile and desktop rendering verified
- [ ] Footer links functional (placeholder pages)

**Technical Notes/Constraints:**
- **Prerequisites:** Privacy Policy and Terms of Service placeholder pages (create simple HTML)
- **Brand assets needed:**
  - Favicon (PNG preferred, check size requirements)
  - Banner logo (PNG preferred, check size requirements)
  - Background color or image (temporary acceptable)
  - Brand colors (hex codes)
- **Temporary branding:** Acceptable for Sprint 5 (can update with official branding post-MVP)
- **No custom CSS for MVP:** Use portal-based customization only
- **English only:** Multi-language deferred to backlog
- **Portal-based:** Point-and-click configuration (no code)
- **Reference:** [Branding Customization](./entra-external-id-setup-guide.md) (lines 943-1028)

**Configuration Tabs:**

**1. Basics Tab:**
- Favicon
- Background image or solid color
- Fallback color

**2. Layout Tab:**
- Template selection (full-screen or partial-screen)
- Header/footer visibility

**3. Header Tab:**
- Company logo (banner)

**4. Footer Tab:**
- Privacy & Cookies link
- Terms of Use link

**5. Sign-in Form Tab:**
- Username hint text
- Sign-in page text (optional)
- ✅ Show self-service password reset (if Story 5.10 implemented)

**Testing:**
1. Run user flow → Preview branding
2. Test on mobile browser (iOS Safari, Android Chrome)
3. Test on desktop browser
4. Verify footer links work
5. Verify "Forgot password?" link (if enabled)

**Estimated Effort:** 2-4 hours (assuming temporary assets available)

**Priority:** 🟢 COULD HAVE (Nice-to-have, not critical for MVP)

---

### Story 5.12: Add Facebook and Apple Authentication (Optional)

**Title:** Enable additional social identity providers

**User Story:**
As a **FoodBudget user**, I want to sign up and sign in using my Facebook or Apple account, so that I have more authentication options beyond email/password and Google.

**Acceptance Criteria:**

**Facebook:**
- [ ] Facebook App created in Meta for Developers
- [ ] Facebook Login configured with redirect URIs
- [ ] Privacy Policy, Terms of Service, User Data Deletion URLs provided (placeholder pages)
- [ ] Facebook added as identity provider in Entra
- [ ] Facebook enabled in user flow (Story 5.1)
- [ ] Test user can sign up and sign in with Facebook

**Apple:**
- [ ] Apple Developer Program membership active ($99/year)
- [ ] App ID created with Sign in with Apple capability
- [ ] Services ID created and configured
- [ ] Private key (.p8) generated and securely stored
- [ ] Apple added as identity provider in Entra
- [ ] Apple enabled in user flow (Story 5.1)
- [ ] Test user can sign up and sign in with Apple

**Definition of Done:**
- [ ] Facebook credentials securely stored (App ID, App Secret)
- [ ] Apple credentials securely stored (Services ID, Team ID, Key ID, .p8 file)
- [ ] Both providers tested with "Run user flow"
- [ ] Test users created via Facebook and Apple sign-in
- [ ] 6-month calendar reminder set for Apple key renewal

**Technical Notes/Constraints:**

**Facebook Setup:**
- **Blocker:** Requires Privacy Policy, Terms, and Data Deletion URLs (create placeholder HTML pages)
- **Platform:** "Website" (OAuth happens in browser even for mobile apps)
- **6 redirect URIs required** - see implementation guide
- **Cost:** FREE
- **Business verification:** May be required by Meta for production use
- **Reference:** [Facebook Setup](./entra-external-id-setup-guide.md) (lines 383-472)

**Apple Setup:**
- **Cost:** $99/year (Apple Developer Program)
- **App Store requirement:** Mandatory if offering other social logins on iOS
- **Bundle ID:** `com.foodbudget.mobile`
- **Services ID:** `com.foodbudget.signin` (becomes Client ID)
- **Key renewal:** Private key expires every 6 months (set reminder NOW)
- **Domain requirements:** All characters lowercase in return URLs
- **Reference:** [Apple Setup](./entra-external-id-setup-guide.md) (lines 476-562)

**Why Defer to End of Sprint:**
- Google covers majority of users (Android + Gmail users)
- Facebook/Apple are incremental (not required for MVP)
- Requires additional setup (placeholder legal pages for Facebook)
- Apple costs $99/year (can defer until iOS App Store submission)

**Estimated Effort:** 3-5 hours (Facebook: 1-2h, Apple: 2-3h)

**Priority:** 🟢 COULD HAVE (End of sprint or post-sprint)

---

## Sprint Success Criteria

### Functional Requirements (Must Have)
- ✅ Users can sign up using email + password
- ✅ Users can sign up using Google
- ✅ Users can sign in using email + password or Google
- ✅ Mobile app acquires access tokens from Entra
- ✅ Mobile app can call protected API endpoints
- ✅ Token refresh works automatically
- ✅ 401 errors trigger re-authentication
- ✅ Sign-out functionality works

### Non-Functional Requirements
- ✅ OAuth 2.0 compliant (browser-based auth with PKCE)
- ✅ Baseline security protections active (automatic from Entra)
- ✅ Secure token storage (MSAL handles via iOS Keychain/Android KeyStore)
- ✅ Authentication errors handled gracefully
- ✅ Loading states shown during authentication

### Optional (Should/Could Have)
- 🟡 Self-service password reset
- 🟢 Custom branding
- 🟢 Facebook authentication
- 🟢 Apple authentication

---

## Story Dependencies

```
Sprint 4 Complete:
  - Tenant + API + Mobile App Registered (Stories 4.1, 4.2)
  - Backend Protected with JWT Validation (Story 4.3)
    ↓
Story 5.1 (Configure Google)
    ↓
Story 5.2 (Create User Flow)
    ↓
    ┌───────────────────┴───────────────────┐
    ↓                                       ↓
Story 5.3 (MSAL Integration)    Story 5.4 (Connect to API)
                                            ↓
                              End-to-End Authentication Working

Optional Stories (parallel):
- Story 5.5 (Password Reset) - depends on 5.2
- Story 5.6 (Branding) - depends on 5.2
- Story 5.7 (Facebook/Apple) - depends on 5.1, modifies 5.2
```

---

## Testing Strategy

### Unit Tests
- Authentication state management (mobile)
- Token acquisition logic
- API client interceptor
- Error handling for auth failures

### Integration Tests
- End-to-end: Sign up with email → Call API → Get data
- End-to-end: Sign in with Google → Call API → Get data
- Token refresh: Wait for expiration → Call API → Auto-refresh works
- 401 handling: Remove token → Call API → Re-authentication triggered
- Sign out: Sign out → API calls fail appropriately

### Manual Testing
- Sign up with email + password (new user)
- Sign in with email + password (existing user)
- Sign up with Google (new user)
- Sign in with Google (existing user)
- Forgotten password flow (if Story 5.5 implemented)
- Sign out and verify tokens cleared
- Branded experience (if Story 5.6 implemented)
- Cross-device testing (iOS and Android)
- Offline behavior (graceful error handling)

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
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Mobile App Client ID:** From Sprint 4, Story 4.2
- **Backend API Client ID:** From Sprint 4, Story 4.1
- **API Scopes:** `api://<backend-api-id>/access_as_user`
- **User Attributes:** Email (required), Display Name (required)

### Architecture Decisions
- **Authentication Flow:** Client-side (mobile → Entra direct)
- **Token Storage:** MSAL automatic (iOS Keychain, Android KeyStore)
- **Browser:** In-app tabs (SFSafariViewController, Chrome Custom Tabs)
- **PKCE:** Auto-enabled by MSAL (OAuth 2.1 standard)
- **Token Refresh:** Automatic via MSAL `acquireTokenSilent()`

### Cost Summary
- **Entra External ID:** FREE (0-50,000 MAU)
- **Google Sign-In:** FREE
- **Facebook Login:** FREE
- **Apple Sign In:** $99/year (if Story 5.7 implemented)
- **Sprint 5 Cost:** $0-$99

---

## Resources

- **Implementation Guide:** [entra-external-id-setup-guide.md](./entra-external-id-setup-guide.md)
- **Operations Guide:** [operations/entra-operations-guide.md](./operations/entra-operations-guide.md)
- **Research Archive:** [archive/entra-research-archive.md](./archive/entra-research-archive.md)
- **Microsoft Docs:** https://learn.microsoft.com/en-us/entra/external-id/customers/
- **MSAL React Native Docs:** (research during Story 5.3)

---

## Sprint Retrospective Template

**What went well:**
-

**What could be improved:**
-

**Action items:**
-

**Blockers encountered:**
-

**Technical debt created:**
-

**Sprint 4 → Sprint 5 Handoff Notes:**
- Web app (SPA) registration created in Sprint 4.2 (Client ID: `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`)
- Backend API protected with JWT validation (Sprint 4.3)
- API tested with manual tokens (Sprint 4.4)
- Mobile app registration NOT created - deferred to Sprint 5 Phase 2

---

## **PHASE 3: POST-SPRINT ENHANCEMENTS** (Optional - Do After Full Authentication Complete)

Stories 5.7-5.12 are optional enhancements that can be implemented after both web and mobile authentication are working. Story 5.9 (Google Sign-In) adds social authentication as an alternative to email/password.

---

### Story 5.9: Add Google Sign-In (Social Identity Provider)

**Title:** Enable Google authentication as alternative to email/password

**User Story:**
As a **FoodBudget user**, I want to sign up and sign in using my Google account, so that I can quickly access the app without creating a new password.

**Acceptance Criteria:**
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] OAuth consent screen configured with FoodBudget branding
- [ ] All 7 required redirect URIs configured in Google Console
- [ ] Google added as identity provider in Entra External ID
- [ ] Google provider visible in Entra admin center
- [ ] Google enabled in existing `SignUpSignIn` user flow (from Story 5.1)
- [ ] **Both web and mobile apps** can authenticate with Google
- [ ] Google sign-up works
- [ ] Google sign-in works
- [ ] User can switch between email/password and Google authentication

**Definition of Done:**
- [ ] Google Client ID and Client Secret securely stored
- [ ] Google provider configured in Entra admin center
- [ ] Google added to user flow identity providers
- [ ] Test accounts created via Google
- [ ] Google authentication works on web (localhost and GitHub Pages)
- [ ] Google authentication works on mobile (iOS and Android)
- [ ] Code reviewed
- [ ] `GoogleSignInButton.tsx` component created (web/mobile compatible)

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Phase 1 & 2 complete (email/password auth working on web and mobile)
- ✅ User flow exists (Story 5.1)
- ✅ Web and mobile apps integrated with MSAL (Stories 5.2, 5.5)

**Google Sign-In Configuration:**
- **Google account required:** Create dedicated account for FoodBudget development
- **Authorized domains:** `ciamlogin.com`, `microsoftonline.com`
- **7 redirect URIs required** (replace `<tenant-ID>` with actual tenant ID):
  ```
  https://login.microsoftonline.com
  https://login.microsoftonline.com/te/<tenant-ID>/oauth2/authresp
  https://login.microsoftonline.com/te/foodbudget.onmicrosoft.com/oauth2/authresp
  https://<tenant-ID>.ciamlogin.com/<tenant-ID>/federation/oidc/accounts.google.com
  https://<tenant-ID>.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oidc/accounts.google.com
  https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oauth2
  https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oauth2
  ```
- **Cost:** FREE
- **Reference:** [Google Setup](./entra-external-id-setup-guide.md) (lines 310-380)

**Configuration Steps:**

1. **Google Cloud Console Setup:**
   - Create project "FoodBudget"
   - OAuth consent screen → External → Configure
   - Credentials → Create OAuth client ID → Web application
   - Add all 7 redirect URIs
   - Copy Client ID and Client Secret

2. **Entra External ID Configuration:**
   - Entra admin center → External Identities → All identity providers
   - Built-in tab → Configure Google
   - Paste Client ID and Client Secret → Save
   - Verify provider appears in identity providers list

3. **Update User Flow:**
   - User flows → SignUpSignIn → Identity providers
   - Add Google to available providers
   - Save changes

4. **Update App Code:**
   - Create `GoogleSignInButton.tsx` component
   - Add Google button to sign-in screens (web and mobile)
   - Test authentication flow

**Testing Checklist:**
- [ ] Google sign-up works on web (localhost:8081)
- [ ] Google sign-up works on web (GitHub Pages)
- [ ] Google sign-up works on mobile (iOS)
- [ ] Google sign-up works on mobile (Android)
- [ ] Google sign-in works (all platforms)
- [ ] Users can switch between email/password and Google
- [ ] Access token acquired after Google authentication
- [ ] Protected API calls work with Google-authenticated users

**Estimated Effort:** 3-5 hours

**Priority:** 🟢 COULD HAVE (Nice-to-have social auth option, not critical for MVP)

---

### Story 5.7: Implement Rate Limiting for Sign-Up Endpoints

**Title:** Protect sign-up endpoints from bot-driven mass registrations

**Moved from:** Sprint 4 Story 4.5 (depends on user flows from Story 5.2)

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
- **Note:** Story 5.1B (User-Based Rate Limiting) already exists in backlog.md for authenticated endpoints

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

**Prerequisites:**
- Sprint 5 Phase 1 & 2 complete (user flows exist)
- Authentication endpoints in use

---

### Story 5.8: Upgrade Recipe Image Upload to User Delegation SAS

**Title:** Enhance image upload security with Microsoft Entra-signed SAS tokens

**Moved from:** Sprint 4 Story 4.6 (Post-MVP enhancement)

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
- ✅ Sprint 4 authentication complete (Stories 4.1-4.3)
- ✅ Sprint 5 authentication stable and tested
- ✅ Recipe image upload MVP working with Account Key SAS

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
- Sprint 4 complete (Entra tenant, backend JWT validation)
- Sprint 5 Phase 1 & 2 complete (authentication stable)
- Recipe Image Upload MVP working with Account Key SAS

---

## Sprint 5 Effort Summary

### Phase 1: Web Authentication (Priority 1)
| Story | Description | Hours |
|-------|-------------|-------|
| 5.1 | Configure Google Sign-In | 2h |
| 5.2 | Create User Flow (web app) | 3h |
| 5.3A | MSAL Integration (Web) | 7h |
| 5.4A | Connect Web to Protected API | 4.5h |
| 5.5 | Password Reset (optional) | 1h |
| 5.6 | Custom Branding (optional) | 3h |
| **Phase 1 Total** | **Web authentication complete** | **~20.5h** |

### Phase 2: Mobile Authentication (Priority 2 - Do After Phase 1)
| Story | Description | Hours |
|-------|-------------|-------|
| 5.0B | Register Mobile App | 1h |
| 5.3B | MSAL Integration (Mobile) | 8h |
| 5.4B | Connect Mobile to Protected API | 4h |
| **Phase 2 Total** | **Mobile authentication complete** | **~13h** |

### Total Sprint 5 Effort
- **Must-Have (Phase 1 + Phase 2):** ~33.5 hours
- **Optional (5.5, 5.6):** +4 hours
- **Total with Optional:** ~37.5 hours

---

**Last Updated:** 2025-11-04
**Research Status:** Ready for implementation (after Sprint 4 complete)
**Implementation Approach:** Web-first (Phase 1), then mobile (Phase 2)
**Prerequisites:** Sprint 4 must be complete (web app registration exists, backend API protected)
**Phase 1 Critical Stories:** 5.1, 5.2, 5.3A, 5.4A (~16.5h without optional)
**Phase 2 Critical Stories:** 5.0B, 5.3B, 5.4B (~13h)
**Web Authentication Ready After:** Phase 1 complete (~20.5h)
**Full Authentication (Web + Mobile) After:** Phase 1 + Phase 2 complete (~33.5h)
