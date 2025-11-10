# Product Backlog - Sprint 5+

## Overview

This document contains features and enhancements planned for future sprints. Items are prioritized based on production readiness, user value, and technical dependencies.

**Current Status:**
- ✅ Sprint 3 Complete: Recipe Management Demo (635 tests passing)
- ✅ Sprint 4 Complete: Backend API Authentication (Entra External ID)
- ✅ Sprint 5 Mostly Complete: Web Authentication (Stories 5.1-5.4 complete)
- 🔄 Sprint 5.5 In Progress: User Delegation SAS (optional enhancement)

**Next Priorities:**
1. Complete Sprint 5.5 (User Delegation SAS) - Optional security enhancement
2. Mobile Authentication (Sprint 6)
3. Observability & Performance (Sprint 7)

**Reference Documentation:**
- 📖 [Sprint 3 Archive](./archive/sprint-3.md) - Recipe Management Demo
- 📖 [Sprint 4 Archive](./archive/sprint-4.md) - Backend API Authentication
- 📖 [Sprint 5 Active](./sprint-5.md) - Web Authentication (In Progress)
- 📖 [Future Implementation Strategy](./future-implementation-strategy.md) - Advanced features
- 📖 [Entra Setup Guide](./entra-external-id-setup-guide.md) - Technical reference
- 📖 [Entra Operations Guide](./operations/entra-operations-guide.md) - Admin procedures

---

## Table of Contents

### [Current Sprint](#current-sprint-sprint-55)
- [User Delegation SAS for Image Upload](#story-55-upgrade-recipe-image-upload-to-user-delegation-sas)

### [Next Sprint: Mobile Authentication](#mobile-authentication-sprint-6)
- [Register Mobile App](#register-mobile-app-react-native)
- [Integrate MSAL in Mobile](#integrate-msal-authentication-in-mobile-app)
- [Connect Mobile to API](#connect-mobile-app-to-protected-api)
- [Self-Service Password Reset](#enable-self-service-password-reset)
- [Custom Branding](#apply-custom-branding)
- [Social Identity Providers](#add-facebook-and-apple-authentication)

### [Future Sprints](#future-sprints)
- [Sprint 7: Observability & Performance](#sprint-7-observability--performance)
- [Sprint 8: Infrastructure & Security](#sprint-8-infrastructure--advanced-security)
- [Sprint 9+: User-Facing Features](#sprint-9-user-facing-features)

### [Technical Debt & Quality](#technical-debt--code-quality-ongoing)
### [Decided Not to Implement](#decided-not-to-implement)

---

## Current Sprint: Sprint 5.5

### Story 5.5: Upgrade Recipe Image Upload to User Delegation SAS

**Title:** Enhance image upload security with Microsoft Entra-signed SAS tokens

**Status:** 🔄 IN PROGRESS (Deferred from Sprint 4 as optional enhancement)

**User Story:**
> As a **FoodBudget developer**, I want to upgrade from Account Key SAS to User Delegation SAS for recipe image uploads, so that we leverage Microsoft Entra credentials for enhanced security and RBAC integration.

**Acceptance Criteria:**
- [ ] BlobServiceClient configured with `DefaultAzureCredential` (not connection string)
- [ ] `GetUserDelegationKeyAsync()` implemented in ImageUploadService
- [ ] SAS tokens signed with user delegation key (not account key)
- [ ] API service identity has "Storage Blob Data Contributor" RBAC role
- [ ] Local development works with `az login` authentication
- [ ] Production uses App Service Managed Identity
- [ ] All 21 unit tests updated and passing
- [ ] Account keys removed from configuration

**Definition of Done:**
- [ ] Azure.Identity NuGet package installed
- [ ] ImageUploadService migrated to async token generation
- [ ] RBAC roles assigned via Azure Portal
- [ ] Tests updated to mock `GetUserDelegationKeyAsync()`
- [ ] Local development tested with `az login`
- [ ] Production deployed with Managed Identity
- [ ] Account keys rotated after migration
- [ ] Code reviewed and deployed

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Sprint 4 complete (Entra External ID tenant exists)
- ✅ Sprint 5 Stories 5.1-5.4 complete (Web authentication stable)
- ✅ Recipe image upload MVP working with Account Key SAS

**Critical Architectural Context:**
This story involves TWO separate Azure AD/Entra tenants:

1. **External ID Tenant (Customer Authentication):**
   - Purpose: Authenticates end users
   - Domain: `foodbudget.ciamlogin.com`
   - Used by: Frontend app
   - Already configured in Sprint 5 ✅

2. **Azure Subscription Tenant (Resource Authentication):**
   - Purpose: Authenticates API to access Azure resources
   - Used by: Backend API via Managed Identity
   - Configured in this story via RBAC

**Why Post-MVP:**
- Account Key SAS is secure enough for MVP (5-min expiration, minimal permissions)
- User Delegation adds 8-13 hours of work including Azure RBAC setup
- Better done after authentication infrastructure is stable
- Security enhancement, not critical functionality

**Security Comparison:**

| Feature | Account Key SAS (MVP) | User Delegation SAS |
|---------|----------------------|---------------------|
| Expiration | ✅ 5 minutes | ✅ 5 minutes |
| Minimal permissions | ✅ Create+Write only | ✅ Create+Write only |
| Credential type | ⚠️ Account key | ✅ Entra credentials |
| RBAC integration | ❌ No | ✅ Yes |
| Audit logs | ⚠️ Limited | ✅ Comprehensive |
| Key rotation | ⚠️ Manual | ✅ Automatic |

**Implementation Changes Required:**
1. Install Azure.Identity package
2. Update configuration to use AccountName (not ConnectionString)
3. Configure BlobServiceClient with DefaultAzureCredential
4. Implement GetUserDelegationKeyAsync() in ImageUploadService
5. Assign RBAC roles via Azure Portal
6. Update all 21 unit tests

**Azure Infrastructure Requirements:**
- App Service Managed Identity enabled
- "Storage Blob Data Contributor" role assigned to:
  - App Service Managed Identity (production)
  - Developer accounts (local development)
- Azure CLI authentication for local dev: `az login`

**Testing Strategy:**
1. Update unit tests to mock GetUserDelegationKeyAsync()
2. Test locally with `az login` authentication
3. Deploy to dev environment with Managed Identity
4. Verify SAS tokens work identically to Account Key SAS
5. Test error scenarios

**Rollback Plan:**
If issues arise, revert to Account Key SAS:
1. Revert DI registration to use connection string
2. Revert ImageUploadService to synchronous token generation
3. Restore connection string in configuration
4. All code changes isolated to 3 files (easy rollback)

**Estimated Effort:** 8-13 hours
- Code changes: 2-3 hours
- Azure RBAC setup: 1-2 hours
- Local dev auth setup: 1 hour
- Testing: 2-3 hours
- Production migration: 1-2 hours

**Priority:** 🟢 COULD HAVE (Security enhancement, not critical for MVP)

**Reference:** See [sprint-5.md Story 5.5](./sprint-5.md#story-55-upgrade-recipe-image-upload-to-user-delegation-sas) for detailed implementation guide

---

## Mobile Authentication (Sprint 6)

**Theme:** Enable mobile app (iOS/Android) authentication using React Native MSAL
**Prerequisites:** Sprint 5 complete (web authentication working)
**Timeline:** 1-2 weeks
**Reference:** Follow Sprint 5 pattern adapted for React Native MSAL

---

### Register Mobile App (React Native)

**Title:** Create mobile app registration for React Native with Expo

**User Story:**
> As a **developer**, I want to register the React Native mobile app in Entra External ID, so that the mobile app can authenticate users and access the protected API.

**Acceptance Criteria:**
- [ ] Mobile app registration created (separate from web app)
- [ ] App type configured as "Public client (mobile & desktop)"
- [ ] Redirect URI configured: `msauth://com.foodbudget.app/callback`
- [ ] Delegated permission to `access_as_user` scope granted
- [ ] Admin consent granted
- [ ] Public client flows enabled (required for mobile apps)

**Definition of Done:**
- [ ] Mobile app registration visible in Entra tenant
- [ ] Redirect URI configured (MSAL custom scheme)
- [ ] API permissions configured and consented
- [ ] Mobile app client ID documented
- [ ] Separate from web app registration (different platform requirements)

**Technical Notes/Constraints:**

**Why Separate Registration from Web App:**
- Web app uses browser redirect flow (`https://` redirect URIs)
- Mobile app uses system browser with deep linking (`msauth://` custom scheme)
- Different MSAL libraries (`@azure/msal-react` vs `react-native-msal`)
- Cleaner separation and easier troubleshooting
- Microsoft best practice: one registration per platform

**Configuration:**
- Platform: "Mobile and desktop applications"
- Redirect URI: `msauth://com.foodbudget.app/callback`
- Public client flows: Yes (required for mobile)
- Native authentication: No (using standard OAuth flow)

**Estimated Effort:** 1 hour

**Priority:** 🔴 MUST HAVE (Foundation for mobile authentication)

**Reference:** [Entra Setup Guide - Mobile Registration](./entra-external-id-setup-guide.md)

---

### Integrate MSAL Authentication in Mobile App

**Title:** Enable users to sign in via React Native mobile app

**User Story:**
> As a **FoodBudget user**, I want to sign in through the mobile app using my email and password, so that I can access my food budget from my phone.

**Acceptance Criteria:**
- [ ] MSAL React Native package installed and configured
- [ ] Authority URL configured: `https://foodbudget.ciamlogin.com/`
- [ ] Sign-in button triggers authentication flow
- [ ] Email + Password authentication works
- [ ] Access token acquired after successful authentication
- [ ] Refresh token acquired and stored (MSAL handles storage)
- [ ] Sign-out functionality works
- [ ] Error handling for user cancellation, network errors, invalid credentials

**Definition of Done:**
- [ ] User can sign in with email + password
- [ ] Access token visible in app state/debug logs
- [ ] Sign-out clears token and returns to sign-in screen
- [ ] Unit tests for authentication state management
- [ ] No hardcoded secrets (client ID from config file)

**Technical Notes/Constraints:**

**MSAL Package:** React Native MSAL library (research exact package during implementation)

**Browser Experience:**
- iOS: SFSafariViewController (seamless, not app switching)
- Android: Chrome Custom Tabs (seamless)

**Security:**
- PKCE: Auto-enabled by MSAL (OAuth 2.1 standard)
- Token storage: MSAL handles automatically
  - iOS: Keychain
  - Android: KeyStore
- Token lifetime: Access token 1 hour, Refresh token 90 days

**Estimated Effort:** 4-8 hours (depends on MSAL React Native documentation)

**Priority:** 🔴 MUST HAVE (Users can't authenticate without this)

---

### Connect Mobile App to Protected API

**Title:** Enable authenticated API calls from mobile app

**User Story:**
> As a **FoodBudget user**, I want the mobile app to securely access my data from the backend, so that I can view and manage my food budget.

**Acceptance Criteria:**
- [ ] Mobile app includes access token in API requests
- [ ] FetchClient configured with authentication
- [ ] Successful API call returns user data
- [ ] Expired token triggers automatic refresh via MSAL
- [ ] HTTP 401 from API triggers re-authentication flow
- [ ] Network errors handled gracefully
- [ ] Loading states shown during API calls

**Definition of Done:**
- [ ] At least one protected API endpoint called successfully
- [ ] Token refresh tested (automatic via MSAL)
- [ ] 401 error handling tested
- [ ] User sees appropriate error messages
- [ ] Integration test verifies end-to-end flow

**Technical Notes/Constraints:**

**Pattern:** Follow web app pattern from Sprint 5 Story 5.3
- FetchClient singleton with authentication injection
- Automatic Bearer token injection on all requests
- MSAL `acquireTokenSilent()` for automatic refresh
- ProblemDetails (RFC 9457) error handling

**Testing Scenarios:**
- API call with valid token → Success
- API call with expired token → Auto-refresh → Success
- API call when offline → Network error message
- 401 from API → Re-authentication triggered
- User signs out → API calls stop

**Estimated Effort:** 3-5 hours

**Priority:** 🔴 MUST HAVE (Completes end-to-end mobile authentication)

---

### Enable Self-Service Password Reset

**Title:** Allow users to reset forgotten passwords

**User Story:**
> As a **FoodBudget user**, I want to reset my password if I forget it, so that I can regain access to my account without contacting support.

**Acceptance Criteria:**
- [ ] Email OTP authentication method enabled in Entra
- [ ] "Forgot password?" link visible on sign-in page
- [ ] User can request password reset
- [ ] One-time passcode delivered via email
- [ ] User can enter OTP and set new password
- [ ] New password meets security requirements
- [ ] Password reset tested end-to-end

**Definition of Done:**
- [ ] Email OTP enabled for all users
- [ ] "Show self-service password reset" enabled in Company Branding
- [ ] Test user successfully resets password
- [ ] Email delivery confirmed
- [ ] Works from both web and mobile apps

**Technical Notes/Constraints:**
- Email OTP: FREE (email-based, not SMS)
- Requires "Show self-service password reset" in Company Branding
- Password requirements displayed on reset page (Entra defaults)

**Estimated Effort:** 30 minutes - 1 hour

**Priority:** 🟡 SHOULD HAVE (Low effort, high user value)

---

### Apply Custom Branding

**Title:** Brand authentication experience with FoodBudget identity

**User Story:**
> As a **FoodBudget user**, I want to see FoodBudget branding during sign-in, so that I trust the authentication process.

**Acceptance Criteria:**
- [ ] FoodBudget logo appears on sign-in page
- [ ] Background color matches brand
- [ ] Favicon shows in browser tab
- [ ] Footer links include Privacy Policy and Terms of Service
- [ ] "Forgot password?" link visible
- [ ] Branding tested across desktop and mobile browsers

**Definition of Done:**
- [ ] Company Branding configured in Entra admin center
- [ ] Brand assets uploaded (logo, favicon, background)
- [ ] Tested with "Run user flow" feature
- [ ] Mobile and desktop rendering verified

**Technical Notes/Constraints:**
- Temporary branding acceptable for MVP (can update later)
- No custom CSS for MVP (portal-based customization only)
- English only for MVP
- Requires Privacy Policy and Terms of Service placeholder pages

**Estimated Effort:** 2-4 hours

**Priority:** 🟢 COULD HAVE (Nice-to-have, not critical)

---

### Add Facebook and Apple Authentication

**Title:** Enable additional social identity providers

**User Story:**
> As a **FoodBudget user**, I want to sign up with Facebook or Apple, so that I have more authentication options.

**Acceptance Criteria:**

**Facebook:**
- [ ] Facebook App created in Meta for Developers
- [ ] Privacy Policy, Terms, Data Deletion URLs provided
- [ ] Facebook enabled in user flow
- [ ] Test user can sign in with Facebook

**Apple:**
- [ ] Apple Developer Program membership active ($99/year)
- [ ] App ID created with Sign in with Apple capability
- [ ] Private key (.p8) generated and securely stored
- [ ] Apple enabled in user flow
- [ ] Test user can sign in with Apple

**Definition of Done:**
- [ ] Facebook credentials securely stored
- [ ] Apple credentials securely stored
- [ ] Both providers tested
- [ ] 6-month calendar reminder set for Apple key renewal

**Technical Notes/Constraints:**

**Facebook:**
- Requires Privacy Policy, Terms, and Data Deletion URLs
- 6 redirect URIs required
- Cost: FREE
- May require business verification for production

**Apple:**
- Cost: $99/year (Apple Developer Program)
- App Store requirement: Mandatory if offering other social logins on iOS
- Key renewal: Private key expires every 6 months

**Why Defer to End of Sprint:**
- Google covers majority of users
- Requires additional setup (legal pages for Facebook)
- Apple costs $99/year (can defer until iOS App Store submission)

**Estimated Effort:** 3-5 hours total

**Priority:** 🟢 COULD HAVE (End of sprint or post-sprint)

---

## Sprint 7: Observability & Performance

**Theme:** Make the production app observable, scalable, and performant
**Timeline:** 2-3 weeks
**Dependencies:** Sprint 6 deployed to production

---

### Offline Support & Mutation Queue

**Title:** Enable offline recipe management with automatic sync

**Priority:** CRITICAL (Deferred from Sprint 5)

**User Story:**
> As a **user**, I want to create, update, and delete recipes while offline, so that I can use the app without an internet connection.

**Acceptance Criteria:**
- [ ] App detects offline status accurately
- [ ] Mutations queued while offline (not lost)
- [ ] Queued mutations sync automatically when online
- [ ] User sees clear feedback about queued operations
- [ ] Optimistic UI updates work correctly
- [ ] Auth tokens handled correctly during offline periods
- [ ] Conflict resolution handles sync failures gracefully

**Definition of Done:**
- [ ] Enhanced offline indicator shows pending changes count
- [ ] TanStack Query configured with `networkMode: 'offlineFirst'`
- [ ] Tests verify offline behavior and sync logic
- [ ] Works with MSAL token refresh when reconnecting

**Technical Notes/Constraints:**
- Use `@react-native-community/netinfo` for network detection
- TanStack Query v5 built-in mutation queue
- MSAL caches tokens locally (works offline)
- Token refresh requires network (gracefully fails offline)

**Estimated Effort:** 1 week

**Priority:** 🔴 CRITICAL (Required for production mobile app)

**Reference:** Lightweight version exists from Sprint 5, needs enhancement

---

### User-Based Rate Limiting

**Title:** Rate limit authenticated users by user ID

**Priority:** MEDIUM

**User Story:**
> As a **developer**, I want to rate limit users by their user ID, so that each user has fair API quota.

**Acceptance Criteria:**
- [ ] User-based rate limiting middleware created
- [ ] Middleware extracts user ID from JWT claims
- [ ] Per-user request quotas enforced
- [ ] Rate limit exceeded returns 429 with user-specific message
- [ ] Configuration supports different tiers (standard, premium)
- [ ] Tests verify per-user rate limiting logic

**Technical Notes/Constraints:**
- Extract user ID from JWT `oid` claim
- Apply rate limiting AFTER authentication middleware
- IP-based rate limiting still protects unauthenticated endpoints
- Enables tiered pricing (premium users get higher limits)

**Estimated Effort:** 3-5 hours

**Priority:** 🟡 MEDIUM (Enhances existing IP-based rate limiting)

---

### Application Performance Monitoring (APM)

**Title:** Monitor application performance and errors in production

**Priority:** CRITICAL

**User Story:**
> As a **developer**, I need to monitor performance and errors in production, so I can debug issues and optimize user experience.

**Acceptance Criteria:**
- [ ] Frontend errors captured with stack traces
- [ ] Backend exceptions logged to APM service
- [ ] Performance metrics visible in dashboard
- [ ] Alert notifications configured (critical errors only)
- [ ] Source maps uploaded for readable stack traces
- [ ] User context attached to error reports
- [ ] API response times tracked per endpoint
- [ ] Sign-up metrics tracked (daily count, hourly spikes)

**Definition of Done:**
- [ ] Sentry or Application Insights integrated
- [ ] Frontend error boundary sends to APM
- [ ] Backend exception middleware logs to APM
- [ ] CI/CD uploads source maps
- [ ] Alert rules configured

**Technical Notes/Constraints:**
- **Frontend:** Sentry SDK
- **Backend:** Application Insights or Sentry .NET SDK
- **Cost:** Sentry free tier (5K errors/month) or $26/month

**Estimated Effort:** 1 week

**Priority:** 🔴 CRITICAL (Cannot debug production without this)

---

### API Pagination

**Title:** Paginate recipe list for performance

**Priority:** HIGH

**User Story:**
> As a **user with many recipes**, I want the app to load quickly even with 100+ recipes.

**Acceptance Criteria:**
- [ ] API returns paginated results (default 20 per page)
- [ ] Link headers included (next, prev, first, last)
- [ ] Frontend displays first page on load
- [ ] User can load more recipes (infinite scroll or button)
- [ ] Performance improves for users with 100+ recipes
- [ ] Search and filters work with pagination

**Definition of Done:**
- [ ] Backend: PagedResult DTO created
- [ ] Backend: RecipeService implements paging
- [ ] Frontend: useInfiniteQuery hook created
- [ ] Tests verify pagination logic

**Technical Notes/Constraints:**
- Use cursor-based or offset-based pagination
- Add RFC 5988 Link headers
- Frontend: TanStack Query infinite scroll

**Estimated Effort:** 1 week

**Priority:** 🔴 HIGH (Required for scale beyond 100+ recipes)

---

### PWA Features

**Title:** Progressive Web App capabilities for web users

**Priority:** MEDIUM

**User Story:**
> As a **web user**, I want the app to work offline and feel like a native app.

**Acceptance Criteria:**
- [ ] Service worker caches static assets
- [ ] App installable on mobile devices
- [ ] Offline mode shows cached recipes
- [ ] Changes sync when back online
- [ ] Install prompt shown to returning users

**Estimated Effort:** 1 week

**Priority:** 🟡 MEDIUM (Nice-to-have for web users)

---

### Email Verification

**Title:** Verify user email addresses

**Priority:** MEDIUM

**User Story:**
> As a **user**, I want to verify my email address, so my account is secure.

**Acceptance Criteria:**
- [ ] Verification email sent on registration
- [ ] User can verify email via link
- [ ] Resend verification available (rate limited)
- [ ] Verification status shown in profile

**Estimated Effort:** 1 week

**Priority:** 🟡 MEDIUM (Security enhancement)

**Note:** Only implement if deferred from Sprint 5

---

## Sprint 8: Infrastructure & Advanced Security

**Theme:** Production infrastructure maturity and enhanced security
**Timeline:** 2-3 weeks
**Dependencies:** Sprint 7 complete, production traffic data available

---

### Infrastructure as Code (IaC)

**Title:** Define Azure resources as code

**Priority:** MEDIUM

**User Story:**
> As a **DevOps engineer**, I need infrastructure defined as code, so I can reproduce environments consistently.

**Acceptance Criteria:**
- [ ] All Azure resources defined in Terraform or Bicep
- [ ] Dev/staging/prod environments reproducible
- [ ] GitHub Actions workflow for infrastructure deployment
- [ ] State management configured
- [ ] Documentation for infrastructure changes
- [ ] Rollback procedure documented

**Technical Notes/Constraints:**
- Tool: Terraform or Azure Bicep
- Resources: App Service, SQL Database, Storage, Key Vault
- State: Terraform Cloud or Azure Storage

**Estimated Effort:** 2 weeks

**Priority:** 🟡 MEDIUM (Required for scale and disaster recovery)

---

### Token Revocation Endpoint

**Title:** Allow users to revoke access tokens immediately

**Priority:** MEDIUM

**User Story:**
> As a **security-conscious user**, I want to revoke my tokens immediately if my device is compromised.

**Acceptance Criteria:**
- [ ] Backend integrates with Microsoft Graph API
- [ ] User can trigger "Logout All Sessions" from settings
- [ ] All refresh tokens revoked on user request
- [ ] User redirected to sign-in after revocation
- [ ] Audit logging for security monitoring

**Definition of Done:**
- [ ] TokenRevocationService created
- [ ] UserSecurityController exposes endpoint
- [ ] Frontend UI in SecuritySettingsScreen
- [ ] Tests verify revocation flow

**Technical Notes/Constraints:**
- Uses Microsoft Graph API: `POST /users/{userId}/revokeSignInSessions`
- Only revokes refresh tokens (access tokens valid until expiration)
- Requires "User.RevokeSessions.All" permission

**Why Post-MVP:**
- Current 1-hour token expiration provides reasonable security baseline
- Adds complexity to token management
- Enhancement, not critical for recipe app

**Estimated Effort:** 1 week

**Priority:** 🟡 MEDIUM (Security enhancement)

---

### Advanced Security Features

**Title:** Two-factor authentication and session management

**Priority:** MEDIUM

**User Story:**
> As a **security-conscious user**, I want additional account protection.

**Scope:**
- Two-factor authentication (TOTP via authenticator app)
- Session management UI (view all logged-in devices)
- Security audit log visible to users
- Email alerts for suspicious logins

**Estimated Effort:** 2-3 weeks

**Priority:** 🟡 MEDIUM (Enhances trust)

---

### Administrative Access Controls

**Title:** Control user registration via API

**Priority:** LOW

**User Story:**
> As an **administrator**, I want to control user registration, so I can transition to invite-only when needed.

**Acceptance Criteria:**
- [ ] Can disable sign-up via Microsoft Graph API
- [ ] Existing users can still sign in
- [ ] Can re-enable sign-up by setting flag

**Technical Notes/Constraints:**
- Use Microsoft Graph API to update user flow
- PATCH request to set `isSignUpAllowed` flag

**Estimated Effort:** 2-4 hours

**Priority:** 🟢 LOW (Nice-to-have for controlled access)

---

### Legal Pages & Facebook Verification

**Title:** Create placeholder legal pages and research Facebook requirements

**Priority:** HIGH (Prerequisite for Facebook auth)

**Scope:**
1. Create placeholder legal pages (Privacy Policy, Terms, Data Deletion)
2. Research Facebook business verification requirements
3. Document process and timeline

**Estimated Effort:** 2-4 hours

**Priority:** 🔴 HIGH (Blocker for Facebook authentication)

---

### Load Testing & Performance Benchmarks

**Title:** Understand application performance under load

**Priority:** MEDIUM

**Acceptance Criteria:**
- [ ] Load test scripts created (k6 or JMeter)
- [ ] Baseline performance documented
- [ ] Slow queries identified and indexed
- [ ] API response time targets defined

**Estimated Effort:** 1 week

**Priority:** 🟡 MEDIUM (Required before scaling)

---

### Multi-Language Support

**Title:** Support additional languages in authentication UI

**Priority:** MEDIUM

**User Story:**
> As a **non-English speaking user**, I want to see authentication pages in my preferred language.

**Acceptance Criteria:**
- [ ] At least 3 additional languages configured
- [ ] Language selection based on browser settings
- [ ] All text strings translated
- [ ] Unsupported languages fall back to English

**Technical Notes/Constraints:**
- Microsoft Entra External ID supports 40+ languages
- Configuration-only change in admin center
- Free (no additional cost)

**Decision:** English-only for MVP, add based on user demographics

**Estimated Effort:** 3-5 hours (config + testing for 3-5 languages)

**Priority:** 🟡 MEDIUM (Deferred until user data shows demand)

---

### Multi-Factor Authentication (MFA)

**Title:** Enable optional MFA for user accounts

**Priority:** MEDIUM

**User Story:**
> As a **security-conscious user**, I want to enable MFA on my account.

**Acceptance Criteria:**
- [ ] Email OTP authentication method enabled
- [ ] Conditional Access policy created
- [ ] User settings screen shows MFA toggle
- [ ] Users can enable/disable MFA
- [ ] Email OTP codes expire after 5 minutes

**Technical Notes/Constraints:**
- Use Email OTP (FREE)
- Cannot use email for BOTH primary auth AND MFA
- FoodBudget uses "Email with password" for primary → email OTP available for MFA
- Optional user setting (not required by default)

**Decision:** Not implementing for MVP
- FoodBudget is recipe app (not financial/health data)
- Baseline security sufficient
- Implement when security is higher priority

**Estimated Effort:** 5-8 hours

**Priority:** 🟡 MEDIUM (Security enhancement)

---

### App Roles for Authorization (RBAC)

**Title:** Role-based access control for admin features

**Priority:** LOW

**User Story:**
> As an **administrator**, I want to assign roles to users, so I can control access to admin features.

**Acceptance Criteria:**
- [ ] Roles defined in app registration (Admin, Premium, etc.)
- [ ] Roles assigned to users via admin center
- [ ] Backend reads `roles` claim from JWT
- [ ] Backend enforces role-based authorization
- [ ] Protected endpoints return 403 if role missing

**Technical Notes/Constraints:**
- Application-specific roles in Entra
- Roles delivered in JWT `roles` claim
- Backend uses `[Authorize(Roles = "...")]` attributes

**When Needed:**
- Admin panel (need "Admin" role)
- Premium features (need "Premium" role)
- Content moderation (need "Moderator" role)

**Decision:** Not needed for MVP (user-scoped data sufficient)

**Estimated Effort:** 4-8 hours

**Priority:** 🟢 LOW (Optional, only if admin/premium features added)

---

## Sprint 9+: User-Facing Features

**Theme:** Enhanced user experience and social features
**Timeline:** Ongoing
**Dependencies:** Core functionality stable in production

---

### Multi-Category System with User-Defined Categories

**Priority:** MEDIUM | **Effort:** Medium (1 week)

**User Story:**
> As a **user**, I want to create my own categories and assign multiple categories to recipes.

**Scope:**
- User-defined category creation/management
- Multi-select categories per recipe
- Migration from `category: string` to `categories: string[]`

---

### User Profile Enhancements

**Priority:** LOW | **Effort:** Small

**Features:**
- Profile avatar upload (Azure Blob Storage)
- Bio/description field
- Public profile URL (optional)
- Recipe count statistics

---

### Change Password (While Logged In)

**Priority:** MEDIUM | **Effort:** Small

**Scope:**
- Change password screen in settings
- Requires current password verification
- Revoke all refresh tokens on password change
- Email confirmation sent

---

### Delete Account (GDPR Compliance)

**Priority:** MEDIUM | **Effort:** Medium

**Scope:**
- Account deletion endpoint
- Delete user data and associated recipes
- Export user data before deletion
- Confirmation dialog with password verification
- 30-day grace period

**Why Important:**
- GDPR requirement for European users
- Builds trust with privacy-conscious users

---

### Recipe Sharing & Collaboration

**Priority:** LOW | **Effort:** Large

**Scope:**
- Share recipe via public link
- Collaborate on recipes (shared editing)
- Recipe collections (curated lists)
- Social features (likes, comments)

---

### Advanced Recipe Features

**Priority:** LOW | **Effort:** Large

**Features:**
- Recipe scaling (adjust servings)
- Cooking timers
- Step-by-step mode
- Recipe import from URL
- Multi-image support
- Nutritional information tracking

---

## Technical Debt & Code Quality (Ongoing)

### Story: End-to-End (E2E) Testing Suite

**Priority:** HIGH (Post-Sprint 6) | **Effort:** Large (2-3 weeks)

**User Story:**
> As a **developer**, I need automated E2E tests, so I can verify critical user flows work correctly.

**Why Important:**
- Unit tests don't catch integration issues
- Authentication flows are complex and error-prone
- Manual testing is time-consuming
- Required for CI/CD pipeline maturity

**Scope:**

**1. Authentication Flow Testing (CRITICAL):**
- Full authentication flow (sign-in → authenticated state → sign-out)
- Token acquisition on page load
- Protected route access
- Token refresh on expiration
- Page refresh maintains authentication

**2. Recipe CRUD Operations:**
- Create, view, edit, delete recipes
- Recipe list filtering and search

**3. Error Scenarios:**
- Network errors (offline mode, timeout)
- 401/403/500 errors
- Validation errors

**4. Offline Behavior:**
- Offline indicator appears
- Mutations queued
- Automatic sync when back online

**Tool Selection:**
- **Option A:** Detox (excellent React Native support)
- **Option B:** Maestro (simpler YAML syntax)
- **Recommendation:** Maestro for speed

**Challenges:**
- MSAL external authentication (cannot mock Microsoft sign-in page)
  - Solution: Use real test user in Entra External ID
- Token acquisition timing (need to wait for isTokenReady)
- Async operations (TanStack Query, network requests)

**Estimated Effort:** 2-3 weeks
- Setup: 3-5 days
- Authentication tests: 1 week
- CRUD tests: 3-5 days
- Error tests: 2-3 days
- CI integration: 2-3 days

**Priority:** 🔴 HIGH (Implement after Sprint 6)

**Reference:** See [future-implementation-strategy.md - E2E Testing](./future-implementation-strategy.md#e2e-testing-with-detox) for detailed plan

---

### Story: Migrate FetchClient to Axios with Interceptors

**Status:** 🟡 OPTIONAL - Not Blocking
**Priority:** LOW
**Estimated Effort:** 6-8 hours

**Context:**
Web authentication implemented a singleton FetchClient pattern with manual authentication injection. This works well for React Native but differs from industry-standard HTTP client patterns.

**Current Implementation (FetchClient Singleton):**
- ✅ Singleton pattern with global `configure(getAccessToken)` call
- ✅ Automatic Bearer token injection
- ✅ Retry logic with exponential backoff
- ✅ ProblemDetails (RFC 9457) error handling
- ✅ 29 unit tests passing (93.42% coverage)
- ✅ Works on web and mobile

**Pros of Axios Migration:**
- Industry standard pattern (more Stack Overflow answers)
- Built-in features (cancel tokens, progress events)
- Familiar API for most React developers
- Mature mocking libraries

**Cons of Axios Migration:**
- Cannot call `useAuth()` in interceptors (not React components)
- Must use same global/singleton pattern as current FetchClient
- Adds 13KB to bundle (current FetchClient <1KB)
- Migration effort: 6-8 hours with risk
- Current implementation has 93.42% test coverage

**Decision:** **DEFER**
- Current FetchClient working well
- Axios provides minimal benefit (still need singleton for auth)
- Adds bundle size
- Risk with no immediate user benefit

**When to Reconsider:**
- Need Axios-specific features (cancel tokens, progress events)
- Multiple developers struggle with custom FetchClient
- Backend provides Axios client generation
- After mobile authentication complete (verify pattern works for both platforms)

**Reference:** Create ADR document if decision changes

---

## Decided Not to Implement

Features rejected after research and analysis.

---

### Session Timeout Warning

**Feature:** Warn user 5 minutes before access token expiration

**Decision:** ❌ **Will Not Implement**

**Date Decided:** January 2025

**Reasoning:**
1. **MSAL Handles Automatically:** MSAL v4.26.0 automatically refreshes tokens via `acquireTokenSilent()`
2. **Wrong UX Pattern:** Session warnings appropriate for enterprise apps (banking, HR), not consumer recipe apps
3. **Current Implementation Correct for 2025:**
   - 1-hour access token expiration (industry standard)
   - 90-day refresh token lifetime
   - Automatic silent token refresh
   - No interruptions during normal usage
4. **No Security Benefit:** Short-lived tokens already provide security
5. **Implementation Cost:** 17-25 hours with no user benefit

**Alternative:** Trust MSAL's built-in token refresh (already working correctly)

---

## Prioritization Framework

**Critical (Next Sprint):**
- Mobile authentication (Sprint 6)
- Observability (cannot debug production without it)

**Important (Future Sprints):**
- Performance (pagination for scale)
- Infrastructure as Code (environment reproducibility)

**Nice-to-Have (Backlog):**
- Social features
- Advanced security (2FA, token revocation)
- Enhanced user experience

**Technical Debt:**
- Ongoing maintenance and improvements
- Invest 20% of sprint capacity on debt reduction

---

## Notes

- This backlog is prioritized for a production SaaS application
- Adjust priorities based on user feedback and analytics
- Items can be moved between sprints based on capacity
- Security and observability take precedence over features
- Revisit priorities after each sprint retrospective

---

**Document Version:** 2.0 (Cleaned and restructured)
**Last Updated:** 2025-01-10
**Previous Version:** [backlog.md.bak](./backlog.md.bak)