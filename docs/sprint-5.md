# Sprint 5: User Authentication & Mobile Integration

**Sprint Goal:** Enable users to sign up and sign in via the FoodBudget mobile app, and securely access the protected backend API.

**Status:** 📋 READY FOR IMPLEMENTATION (after Sprint 4 completes)
**Prerequisites:** Sprint 4 complete (backend API protected with JWT validation)
**Target Completion:** TBD
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)

---

## Sprint Context

**What This Sprint Delivers:**
- Users can sign up and sign in via mobile app
- Authentication with email + password or Google
- Mobile app acquires access tokens from Entra
- Mobile app calls protected backend API successfully
- End-to-end authentication working

**What This Sprint Builds On (Sprint 4):**
- ✅ Entra External ID tenant created
- ✅ Backend API registration created
- ✅ Mobile app registration created (Story 4.2)
- ✅ Backend API protected with JWT validation (Microsoft.Identity.Web)
- ✅ Token claims structure verified
- ✅ API tested with manual tokens

**Authentication Platform:** Microsoft Entra External ID (External Tenants)
**Frontend:** React Native + Expo mobile app
**Backend:** ASP.NET Core Web API (.NET 8) - already protected in Sprint 4

**Key Architectural Decision:**
- Client-side authentication (mobile app → Entra directly)
- Mobile app gets tokens, backend validates them
- In-app browser for OAuth (SFSafariViewController on iOS, Chrome Custom Tabs on Android)
- PKCE automatic via MSAL

**Reference Documentation:**
- 📖 [Implementation Guide](./entra-external-id-setup-guide.md) - Complete technical reference
- 📖 [Operations Guide](./operations/entra-operations-guide.md) - Post-launch admin procedures
- 📚 [Research Archive](./archive/entra-research-archive.md) - Decision history

---

## User Stories

### Story 5.1: Configure Google Sign-In

**Title:** Set up Google as social identity provider

**User Story:**
As a **FoodBudget user**, I want to sign up and sign in using my Google account, so that I can quickly access the app without creating a new password.

**Acceptance Criteria:**
- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] OAuth consent screen configured with FoodBudget branding
- [ ] All 7 required redirect URIs configured in Google Console
- [ ] Google added as identity provider in Entra External ID
- [ ] Google provider visible in Entra admin center
- [ ] Google configuration ready for user flow association (Story 5.2)

**Definition of Done:**
- [ ] Google Client ID and Client Secret securely stored
- [ ] Google provider configured in Entra admin center
- [ ] Configuration tested (provider visible and active)

**Technical Notes/Constraints:**

**Prerequisites from Sprint 4:**
- ✅ Entra External ID tenant created (Sprint 4, Story 4.1)
- ✅ Mobile app registration created (Sprint 4, Story 4.2)
- ✅ Backend API registration created (Sprint 4, Story 4.1)

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
- **Must configure BEFORE user flow creation** (Story 5.2 dependency)
- **Reference:** [Google Setup](./entra-external-id-setup-guide.md) (lines 310-380)

**Configuration Checklist:**

1. Google Cloud Console → Create project "FoodBudget"
2. OAuth consent screen → External → Configure
3. Credentials → Create OAuth client ID → Web application
4. Add all 7 redirect URIs
5. Copy Client ID and Client Secret
6. Entra admin center → External Identities → All identity providers
7. Built-in tab → Configure Google
8. Paste Client ID and Client Secret → Save
9. Verify provider appears in identity providers list

**Estimated Effort:** 1-2 hours

**Priority:** 🔴 MUST HAVE (Foundation for user authentication)

---

### Story 5.2: Create User Sign-Up and Sign-In Flow

**Title:** Configure combined sign-up/sign-in user flow

**User Story:**
As a **FoodBudget user**, I want to sign up for an account or sign in to my existing account, so that I can access my personalized food budget data.

**Acceptance Criteria:**
- [ ] User flow named `SignUpSignIn` created
- [ ] Email + Password authentication enabled
- [ ] Google social provider enabled (Story 5.1 dependency)
- [ ] User attributes configured: Email (required), Display Name (required)
- [ ] Given name, surname, and other optional fields NOT collected
- [ ] Mobile app associated with user flow
- [ ] Backend API NOT associated with user flow (APIs validate tokens, don't authenticate)
- [ ] User flow tested with "Run user flow" feature
- [ ] Email + Password sign-up works
- [ ] Email + Password sign-in works
- [ ] Google sign-up works
- [ ] Google sign-in works

**Definition of Done:**
- [ ] User flow visible in Entra admin center
- [ ] FoodBudget Mobile App appears in flow's Applications list
- [ ] Test accounts created via email and Google
- [ ] All authentication methods work in test environment
- [ ] User flow ready for mobile app integration (Story 5.3)

**Technical Notes/Constraints:**
- **Prerequisites:**
  - Sprint 4 complete (tenant, API, and mobile app registered)
  - Story 5.1 complete (Google configured)
- **Flow type:** Sign-up and sign-in combined (single flow for both actions)
- **One app = one user flow:** Cannot assign mobile app to multiple flows
- **Do NOT delete** `b2c-extensions-app` (auto-created for custom attributes)
- **No terms/privacy checkbox:** Deferred post-sprint (no legal documents yet)
- **Authentication methods:**
  - Email + Password (FREE)
  - Google (FREE)
- **User attributes collected:**
  - Email (required) - for authentication
  - Display Name (required) - for personalization
  - NO given name, surname, job title, address fields
- **Reference:** [User Flow Configuration](./entra-external-id-setup-guide.md) (lines 570-672)

**Configuration Steps:**
1. Entra admin center → External Identities → User flows → New user flow
2. Name: `SignUpSignIn`
3. Identity providers:
   - ✅ Email with password
   - ✅ Google
4. User attributes:
   - ✅ Email Address
   - ✅ Display Name
   - ❌ Given name, Surname (not collecting)
5. Create user flow
6. Associate application:
   - User flows → SignUpSignIn → Applications → Add application
   - Select "FoodBudget Mobile App"
   - Save
7. Test with "Run user flow" button

**Testing User Flow:**
1. Navigate to user flow → "Run user flow"
2. Test email + password sign-up (create new test user)
3. Test email + password sign-in (existing user)
4. Test Google sign-up (new user with Google account)
5. Test Google sign-in (existing Google user)
6. Verify users created in Entra ID → Users list

**Estimated Effort:** 2-3 hours

**Priority:** 🔴 MUST HAVE (Core authentication flow)

---

### Story 5.3: Integrate MSAL Authentication in Mobile App

**Title:** Enable users to sign in via React Native mobile app

**User Story:**
As a **FoodBudget user**, I want to sign in through the mobile app, so that I can access my food budget from my phone.

**Acceptance Criteria:**
- [ ] MSAL React Native package installed and configured
- [ ] Authority URL configured: `https://foodbudget.ciamlogin.com/`
- [ ] Mobile app client ID configured (from Sprint 4, Story 4.2)
- [ ] API scopes configured (e.g., `api://<backend-api-id>/access_as_user`)
- [ ] Redirect URI matches app registration (Sprint 4, Story 4.2)
- [ ] Sign-in button triggers authentication flow
- [ ] User sees branded sign-in page in in-app browser
- [ ] Email + Password authentication works
- [ ] Google authentication works
- [ ] Access token acquired after successful authentication
- [ ] Access token stored securely (MSAL handles token storage)
- [ ] Refresh token acquired and stored
- [ ] Sign-out functionality works
- [ ] App handles authentication errors gracefully

**Definition of Done:**
- [ ] User can sign in with email + password
- [ ] User can sign in with Google
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

### Story 5.4: Connect Mobile App to Protected API

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
  - Story 5.3 complete (mobile app can sign in and get tokens)
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

### Story 5.5: Enable Self-Service Password Reset (Optional)

**Title:** Allow users to reset forgotten passwords

**User Story:**
As a **FoodBudget user**, I want to reset my password if I forget it, so that I can regain access to my account without contacting support.

**Acceptance Criteria:**
- [ ] Email OTP authentication method enabled in Entra
- [ ] "Forgot password?" link visible on sign-in page
- [ ] User can request password reset from mobile app
- [ ] One-time passcode delivered via email
- [ ] User can enter OTP and set new password
- [ ] New password meets security requirements (displayed to user)
- [ ] User can sign in with new password
- [ ] Password reset tested end-to-end

**Definition of Done:**
- [ ] Email OTP enabled for all users in Entra admin center
- [ ] "Show self-service password reset" enabled in Company Branding (if Story 5.6 implemented)
- [ ] Test user successfully resets password
- [ ] Email delivery confirmed (check spam folder during testing)
- [ ] Password reset flow works from mobile app

**Technical Notes/Constraints:**
- **Prerequisites:** Story 5.2 complete (user flow configured)
- **Email OTP:** FREE (email-based, not SMS)
- **Configuration location:** Entra admin center → Authentication methods → Email OTP
- **Enable for:** "All users"
- **Branding dependency:** "Forgot password?" link appears if:
  - Email OTP enabled, AND
  - "Show self-service password reset" enabled in Company Branding (Story 5.6)
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

### Story 5.6: Apply Custom Branding (Optional)

**Title:** Brand authentication experience with FoodBudget identity

**User Story:**
As a **FoodBudget user**, I want to see FoodBudget branding during sign-in, so that I trust the authentication process and have a consistent experience.

**Acceptance Criteria:**
- [ ] FoodBudget logo appears on sign-in page
- [ ] Background color or image matches brand (temporary branding acceptable)
- [ ] Favicon shows in browser tab
- [ ] Footer links include Privacy Policy and Terms of Service (placeholder pages)
- [ ] "Forgot password?" link visible (if Story 5.5 implemented)
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
- ✅ Show self-service password reset (if Story 5.5 implemented)

**Testing:**
1. Run user flow → Preview branding
2. Test on mobile browser (iOS Safari, Android Chrome)
3. Test on desktop browser
4. Verify footer links work
5. Verify "Forgot password?" link (if enabled)

**Estimated Effort:** 2-4 hours (assuming temporary assets available)

**Priority:** 🟢 COULD HAVE (Nice-to-have, not critical for MVP)

---

### Story 5.7: Add Facebook and Apple Authentication (Optional)

**Title:** Enable additional social identity providers

**User Story:**
As a **FoodBudget user**, I want to sign up and sign in using my Facebook or Apple account, so that I have more authentication options.

**Acceptance Criteria:**

**Facebook:**
- [ ] Facebook App created in Meta for Developers
- [ ] Facebook Login configured with redirect URIs
- [ ] Privacy Policy, Terms of Service, User Data Deletion URLs provided (placeholder pages)
- [ ] Facebook added as identity provider in Entra
- [ ] Facebook enabled in user flow (Story 5.2)
- [ ] Test user can sign up and sign in with Facebook

**Apple:**
- [ ] Apple Developer Program membership active ($99/year)
- [ ] App ID created with Sign in with Apple capability
- [ ] Services ID created and configured
- [ ] Private key (.p8) generated and securely stored
- [ ] Apple added as identity provider in Entra
- [ ] Apple enabled in user flow (Story 5.2)
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
-

---

**Last Updated:** 2025-01-29
**Research Status:** Ready for implementation (after Sprint 4)
**Prerequisites:** Sprint 4 must be complete (mobile app registration done in Sprint 4, Story 4.2)
**Critical Path Stories:** 5.1, 5.2, 5.3, 5.4
**Estimated Critical Path Effort:** 10-18 hours
**Optional Story Effort:** +5-11 hours (Stories 5.5, 5.6, 5.7)
