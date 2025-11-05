# Sprint 5: User Authentication (Web + Mobile)

**Sprint Goal:** Enable users to sign up and sign in via the FoodBudget web app (Phase 1) and mobile app (Phase 2), and securely access the protected backend API.

**Status:** 📋 READY FOR IMPLEMENTATION (after Sprint 4 completes)
**Prerequisites:** Sprint 4 complete (backend API protected with JWT validation)
**Target Completion:** TBD
**Priority Model:** MoSCoW (Must have, Should have, Could have, Won't have)
**Implementation Approach:** Web-first, then mobile (shared UI components, platform-specific MSAL integration)

---

## Sprint Context

**What This Sprint Delivers:**

**Phase 1: Web Authentication** (Priority 1 - ~20 hours)
- ✅ Users can sign up and sign in via GitHub Pages web app
- ✅ Authentication with email + password or Google
- ✅ Web app acquires access tokens from Entra
- ✅ Web app calls protected backend API successfully
- ✅ End-to-end authentication working on web

**Phase 2: Mobile Authentication** (Priority 2 - ~11 hours)
- 📱 Users can sign up and sign in via React Native mobile app
- 📱 Mobile app uses system browser for OAuth
- 📱 Mobile app acquires access tokens from Entra
- 📱 Mobile app calls protected backend API successfully
- 📱 End-to-end authentication working on iOS and Android

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

## User Stories

### **PHASE 1: WEB AUTHENTICATION** (Do First - ~20 hours)

Stories 5.1, 5.2, 5.3A, and 5.4A implement authentication for the web app (GitHub Pages). These stories use the web app registration created in Sprint 4.2.

---

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

**Prerequisites:**
- ✅ Entra External ID tenant created (Sprint 4, Story 4.1)
- ✅ Web app (SPA) registration created (Sprint 4, Story 4.2)
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
- [ ] **Web app associated with user flow** (Phase 1 - uses registration from Sprint 4.2)
- [ ] Backend API NOT associated with user flow (APIs validate tokens, don't authenticate)
- [ ] User flow tested with "Run user flow" feature
- [ ] Email + Password sign-up works
- [ ] Email + Password sign-in works
- [ ] Google sign-up works
- [ ] Google sign-in works

**Definition of Done:**
- [ ] User flow visible in Entra admin center
- [ ] **FoodBudget Web App** appears in flow's Applications list
- [ ] Test accounts created via email and Google
- [ ] All authentication methods work in test environment
- [ ] User flow ready for web app integration (Story 5.3A)

**Technical Notes/Constraints:**
- **Prerequisites:**
  - Sprint 4 complete (tenant, API, and web app registered)
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
   - Select **"FoodBudget Web App"** (created in Sprint 4.2)
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

### Story 5.3A: Integrate MSAL Authentication in Web App

**Title:** Enable users to sign in via web app (GitHub Pages)

**User Story:**
As a **FoodBudget user**, I want to sign in through the web app, so that I can access my food budget from my browser.

**Acceptance Criteria:**
- [ ] `@azure/msal-react` package installed and configured
- [ ] Authority URL configured: `https://foodbudget.ciamlogin.com/644a9317-ded3-439a-8f0a-9a8491ce35e9`
- [ ] Web app client ID configured (from Sprint 4.2): `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`
- [ ] API scopes configured: `api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user`
- [ ] Redirect URIs match app registration (GitHub Pages, localhost, jwt.ms)
- [ ] Sign-in/sign-up screens created with shared React Native components
- [ ] Email + Password authentication works on web
- [ ] Google authentication works on web
- [ ] Access token acquired after successful authentication
- [ ] Access token stored securely (sessionStorage)
- [ ] Refresh token handled automatically by MSAL
- [ ] Sign-out functionality works
- [ ] App handles authentication errors gracefully
- [ ] Protected routes redirect to sign-in if unauthenticated

**Definition of Done:**
- [ ] User can sign in with email + password on localhost:8081
- [ ] User can sign in with Google on localhost:8081
- [ ] User can sign in on GitHub Pages deployment
- [ ] Access token visible in browser dev tools / app state
- [ ] Sign-out clears token and returns to sign-in screen
- [ ] Protected routes (recipe list) require authentication
- [ ] Code reviewed
- [ ] No hardcoded secrets (client ID from environment variable)

**Technical Notes/Constraints:**

**MSAL Package:** `@azure/msal-react` + `@azure/msal-browser`
- **Why:** Official Microsoft library for React SPAs
- **Version:** Latest v3.x
- **Pattern:** React hooks and context provider

**Configuration:**
```javascript
// lib/auth/msalConfig.web.ts
import { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: '9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae',
    authority: 'https://foodbudget.ciamlogin.com/644a9317-ded3-439a-8f0a-9a8491ce35e9',
    redirectUri: window.location.origin + '/RecipeTracker/',
    postLogoutRedirectUri: window.location.origin + '/RecipeTracker/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user'],
};
```

**Files to Create:**
```
FoodBudgetMobileApp/
├── src/
│   ├── screens/auth/
│   │   ├── SignInScreen.tsx (web-compatible)
│   │   ├── SignUpScreen.tsx (web-compatible)
│   │   └── AuthCallbackScreen.tsx (handle OAuth redirects)
│   ├── components/auth/
│   │   ├── AuthProvider.tsx (MSAL context wrapper)
│   │   ├── SignInButton.tsx
│   │   └── GoogleSignInButton.tsx
│   ├── hooks/
│   │   ├── useAuth.ts (platform abstraction)
│   │   └── useMsal.web.ts (web-specific)
│   └── lib/auth/
│       ├── msalConfig.web.ts
│       ├── authService.web.ts
│       └── authTypes.ts (shared)
```

**Implementation Pattern:**
```tsx
// App.tsx (wrap with MSAL provider)
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './lib/auth/msalConfig.web';

const msalInstance = new PublicClientApplication(msalConfig);

export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppNavigator />
    </MsalProvider>
  );
}

// hooks/useMsal.web.ts
import { useMsal as useMsalReact } from '@azure/msal-react';
import { loginRequest } from '../lib/auth/msalConfig.web';

export const useMsalWeb = () => {
  const { instance, accounts } = useMsalReact();

  const signIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    await instance.logoutRedirect();
  };

  const getAccessToken = async () => {
    if (accounts.length === 0) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      // Silent acquisition failed, trigger interactive
      await instance.acquireTokenRedirect(loginRequest);
      return null;
    }
  };

  return {
    isAuthenticated: accounts.length > 0,
    user: accounts[0] || null,
    signIn,
    signOut,
    getAccessToken,
  };
};

// hooks/useAuth.ts (platform abstraction)
import { Platform } from 'react-native';
import { useMsalWeb } from './useMsal.web';
// import { useMsalNative } from './useMsal.native'; // Phase 2

export const useAuth = () => {
  if (Platform.OS === 'web') {
    return useMsalWeb();
  }
  // Phase 2: return useMsalNative();
  throw new Error('Mobile authentication not yet implemented (Sprint 5 Phase 2)');
};
```

**Error Handling:**
- User cancels authentication → Stay on sign-in screen
- Network error → Show "Check internet connection" message
- Invalid credentials → Display error from Entra
- Token acquisition fails → Re-trigger interactive sign-in

**Testing Checklist:**
- [ ] Sign in works on `localhost:8081`
- [ ] Sign in works on GitHub Pages
- [ ] Sign in with email/password
- [ ] Sign in with Google
- [ ] Sign out clears session
- [ ] Protected routes redirect to sign-in
- [ ] Token refresh works (wait for expiration or force)
- [ ] Error messages display correctly

**Estimated Effort:** 6-8 hours

**Priority:** 🔴 MUST HAVE (Users can't authenticate without this)

---

### Story 5.4A: Connect Web App to Protected API

**Title:** Enable authenticated API calls from web app

**User Story:**
As a **FoodBudget user**, I want the web app to securely access my data from the backend, so that I can view and manage my food budget.

**Acceptance Criteria:**
- [ ] Web app includes access token in API requests (`Authorization: Bearer <token>`)
- [ ] Axios interceptor configured with MSAL token injection
- [ ] Successful API call returns user-specific data (recipes)
- [ ] Expired token triggers automatic refresh via MSAL
- [ ] Refreshed token used for subsequent requests
- [ ] HTTP 401 from API triggers re-authentication flow
- [ ] Network errors handled gracefully (user-friendly messages)
- [ ] Loading states shown during API calls
- [ ] Recipe list fetches user's recipes (not all recipes)

**Definition of Done:**
- [ ] Recipe list API call succeeds with valid token
- [ ] Token refresh tested (wait for expiration or force expiration)
- [ ] 401 error handling tested (remove token manually)
- [ ] User sees appropriate error messages for auth failures
- [ ] Recipes displayed are user-specific (verified by sub claim)
- [ ] Code reviewed
- [ ] Integration test verifies end-to-end flow (sign in → call API → get data)

**Technical Notes/Constraints:**

**Dependencies:**
- Sprint 4 Story 4.3 complete (API validates JWT tokens)
- Story 5.3A complete (web app can sign in and get tokens)

**Implementation Pattern:**
```typescript
// lib/shared/api/fetch-client.ts (MODIFIED for web auth)
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Add authentication interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Platform-specific token acquisition
    const { getAccessToken } = useAuth();
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
      const { signIn } = useAuth();
      await signIn();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Environment Variables:**
```bash
# .env
EXPO_PUBLIC_API_URL=https://foodbudget-api.azurewebsites.net
```

**Testing Scenarios:**

| Scenario | Expected Behavior | Status |
|----------|-------------------|--------|
| API call with valid token | 200 OK + user recipes returned | [ ] |
| API call without token | 401 Unauthorized → redirect to sign-in | [ ] |
| API call with expired token | MSAL auto-refreshes → 200 OK | [ ] |
| API call with invalid token | 401 Unauthorized → redirect to sign-in | [ ] |
| Network error | User-friendly error message | [ ] |
| API returns empty recipes | Empty state component shown | [ ] |

**Success Criteria:**
- User signs in on web
- Recipe list loads user-specific recipes
- Token refresh happens automatically
- 401 errors trigger re-authentication

**Estimated Effort:** 4-5 hours

**Priority:** 🔴 MUST HAVE (API integration required for functionality)

---

### **PHASE 2: MOBILE AUTHENTICATION** (Do Later - ~11 hours)

Stories 5.0B, 5.3B, and 5.4B implement authentication for the mobile app (iOS/Android). These stories create a separate mobile app registration and use React Native MSAL.

---

### Story 5.0B: Register Mobile App (React Native)

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

### Story 5.3B: Integrate MSAL Authentication in Mobile App

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
- Web app (SPA) registration created in Sprint 4.2 (Client ID: `9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae`)
- Backend API protected with JWT validation (Sprint 4.3)
- API tested with manual tokens (Sprint 4.4)
- Mobile app registration NOT created - deferred to Sprint 5 Phase 2

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
