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

### Phase 1: Web Authentication (Email/Password) - ~15 hours
- [Story 5.1: Create Email/Password User Flow](#story-51-create-emailpassword-user-flow) (1-2h) 🔴 MUST HAVE
- [Story 5.2: Integrate MSAL Authentication in Web App](#story-52-integrate-msal-authentication-in-web-app) (5-7h) 🔴 MUST HAVE
- [Story 5.3: Connect Web App to Protected API](#story-53-connect-web-app-to-protected-api) (4-5h) 🔴 MUST HAVE

### Phase 2: Mobile Authentication (Email/Password) - ~10 hours
- [Story 5.4: Register Mobile App (React Native)](#story-54-register-mobile-app-react-native) (1h) 🔴 MUST HAVE
- [Story 5.5: Integrate MSAL Authentication in Mobile App](#story-55-integrate-msal-authentication-in-mobile-app) (4-8h) 🔴 MUST HAVE
- [Story 5.6: Connect Mobile App to Protected API](#story-56-connect-mobile-app-to-protected-api) (2-3h) 🔴 MUST HAVE

### Phase 3: Post-Sprint Enhancements (Optional) - as needed
- [Story 5.7: Implement Rate Limiting for Sign-Up Endpoints](#story-57-implement-rate-limiting-for-sign-up-endpoints) (2-4h) 🟡 SHOULD HAVE
- [Story 5.8: Upgrade Recipe Image Upload to User Delegation SAS](#story-58-upgrade-recipe-image-upload-to-user-delegation-sas) (8-13h) 🟢 COULD HAVE
- [Story 5.9: Add Google Sign-In (Social Identity Provider)](#story-59-add-google-sign-in-social-identity-provider) (3-5h) 🟢 COULD HAVE
- [Story 5.10: Enable Self-Service Password Reset](#story-510-enable-self-service-password-reset-optional) (0.5-1h) 🟡 SHOULD HAVE
- [Story 5.11: Apply Custom Branding](#story-511-apply-custom-branding-optional) (2-4h) 🟢 COULD HAVE
- [Story 5.12: Add Facebook and Apple Authentication](#story-512-add-facebook-and-apple-authentication-optional) (6-10h) 🟢 COULD HAVE

---

## User Stories

### **PHASE 1: WEB AUTHENTICATION** (Do First - ~15 hours)

Stories 5.1, 5.2, and 5.3 implement email/password authentication for the web app (GitHub Pages). These stories use the web app registration created in Sprint 4.2.

**MVP Approach:** Email/password authentication ONLY. Google Sign-In deferred to Phase 3 (Story 5.9) to reduce complexity and external dependencies.

---

### Story 5.1: Create Email/Password User Flow

**Title:** Configure user sign-up and sign-in flow with email/password authentication

**User Story:**
As a **FoodBudget user**, I want to sign up for an account using my email and password, so that I can access my personalized food budget data.

**Acceptance Criteria:**
- [x] User flow named `SignUpSignIn` created in Entra External ID
- [x] Email + Password authentication enabled
- [x] **Google social provider NOT configured** (deferred to Phase 3, Story 5.9)
- [x] User attributes configured: Email (required), Display Name (required)
- [x] Given name, surname, and other optional fields NOT collected
- [x] **Web app associated with user flow** (uses registration from Sprint 4.2)
- [x] Backend API NOT associated with user flow (APIs validate tokens, don't authenticate)
- [x] User flow tested with "Run user flow" feature
- [x] Email + Password sign-up works
- [x] Email + Password sign-in works

**Definition of Done:**
- [x] User flow visible in Entra admin center
- [x] **FoodBudget Web App** appears in flow's Applications list
- [x] Test account created via email/password
- [x] Email/password authentication works in test environment
- [x] User flow ready for web app integration (Story 5.2)

**Technical Notes/Constraints:**

**Prerequisites:**
- ✅ Sprint 4 complete (tenant, API, and web app registered)
- ✅ Entra External ID tenant created (Sprint 4, Story 4.1)
- ✅ Web app (SPA) registration created (Sprint 4, Story 4.2)
- ✅ Backend API registration created (Sprint 4, Story 4.1)

**Configuration Details:**
- **Flow type:** Sign-up and sign-in combined (single flow for both actions)
- **One app = one user flow:** Cannot assign an app to multiple flows
- **Do NOT delete** `b2c-extensions-app` (auto-created for custom attributes)
- **No terms/privacy checkbox:** Deferred post-sprint (no legal documents yet)
- **Authentication method:** Email + Password ONLY (FREE)
- **User attributes collected:**
  - Email (required) - for authentication
  - Display Name (required) - for personalization
  - NO given name, surname, job title, address fields
- **Reference:** [User Flow Configuration](./entra-external-id-setup-guide.md) (lines 570-672)

**2025 Platform Context:**
- **Entra External ID is future-proof**: Azure AD B2C new sales ended May 1, 2025 (Entra External ID is successor)
- **SMS limitation**: NOT available for primary authentication (MFA second-factor only, additional cost)
- **Built-in attribute labels**: Cannot be customized (e.g., "Display Name" label is fixed)
- **Session control**: NOT supported in External ID tenants (standard Entra ID only)
- **JavaScript customization**: NOT supported (use built-in branding options only - Story 5.11)

**Configuration Steps:**
1. Sign in to Microsoft Entra admin center as User Administrator (minimum role)
2. Navigate: Entra ID → External Identities → User flows → **New user flow**
3. Name: `SignUpSignIn` (auto-prefixed with `B2X_1_`)
4. Identity providers:
   - ✅ **Email with password** (default option - enables password auth + optional MFA)
   - ❌ Google (deferred to Phase 3)
5. User attributes (click "Show more" for full list):
   - ✅ Email Address (required)
   - ✅ Display Name (required)
   - ❌ Given name, Surname (not collecting)
6. Click **Create**
7. Associate application:
   - Navigate: User flows → SignUpSignIn → **Applications** (under "Use" section)
   - Click **Add application**
   - Select **"FoodBudget Web App"** (created in Sprint 4.2)
   - Click **Select**
   - Verify app appears in Applications list

**Pre-Testing Verification:**
1. **Verify web app token version**: App registrations → FoodBudget Web App → Manifest
   - Confirm `"accessTokenAcceptedVersion": 2` (not null)
   - **Why**: Prevents "IDX20804" token validation error
2. **Prepare test account**: Use email DIFFERENT from admin account (e.g., `testuser@example.com`)
   - **Why**: Using admin email creates duplicate user and can lock out admin access

**Testing User Flow:**
1. Navigate: User flows → SignUpSignIn → **"Run user flow"** button
2. **Test panel configuration**:
   - Application: Select "FoodBudget Web App"
   - Response type: id_token (default for SPA)
   - PKCE: Enable "Specify code challenge" if testing SPA flow
3. Click **"Run user flow"** → Sign-in page opens in new browser tab
4. **Test sign-up flow**:
   - Click "Sign up now" link
   - Enter test email (e.g., `testuser@example.com`)
   - Create password (requirements shown on page)
   - Enter Display Name
   - Complete sign-up → Verify redirect back to app
5. **Test sign-in flow**:
   - Return to test panel, click "Run user flow" again
   - Enter existing test user credentials
   - Verify successful sign-in → Verify redirect
6. **Verify user created**:
   - Navigate: Entra ID → Users
   - Search for test user email
   - Confirm user exists with Display Name populated
   - Verify authentication method: "Email with password"

**Common Testing Issues:**
- **"Run user flow" button not appearing**: Confirm using External ID tenant (not standard Entra ID)
- **Admin lockout after testing**: Used admin email for test account → Sign in via `entra.microsoft.com`
- **Token validation error (IDX20804)**: Web app manifest has `accessTokenAcceptedVersion: null` → Set to `2`

**Estimated Effort:** 1-2 hours

**Priority:** 🔴 MUST HAVE (Foundation for MVP authentication)

---

### Story 5.2: Integrate MSAL Authentication in Web App

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
- [ ] **Email + Password authentication works on web** (MVP - Google deferred to Phase 3)
- [ ] Access token acquired after successful authentication
- [ ] Access token stored securely (sessionStorage)
- [ ] Refresh token handled automatically by MSAL
- [ ] Sign-out functionality works
- [ ] App handles authentication errors gracefully
- [ ] Protected routes redirect to sign-in if unauthenticated

**Definition of Done:**
- [ ] User can sign in with email + password on localhost:8081
- [ ] User can sign in with email + password on GitHub Pages deployment
- [ ] Access token visible in browser dev tools / app state
- [ ] Sign-out clears token and returns to sign-in screen
- [ ] Protected routes (recipe list) require authentication
- [ ] Code reviewed
- [ ] No hardcoded secrets (client ID from environment variable)

---

## Package Installation

```bash
# Install MSAL packages (TypeScript types included)
npm install @azure/msal-react@^3.0.21 @azure/msal-browser@^4.26.0
```

**Versions (Verified January 2025):**
- `@azure/msal-react`: v3.0.21 (latest stable, October 2025)
  - Supports React 19 (current project version)
  - Authorization Code Flow with PKCE
- `@azure/msal-browser`: v4.26.0 (peer dependency)
  - TypeScript types included
  - No additional @types packages needed

**Compatibility:**
- ✅ React 19.0.0 (project version)
- ✅ Expo SDK 52
- ✅ TypeScript 5.x
- ✅ React Native Web

---

**Technical Notes/Constraints:**

**Prerequisites Verification:**
Before implementation, verify the following in Sprint 4.2's web app registration:
- [ ] Redirect URIs registered in Entra admin center:
  - `http://localhost:8081/RecipeTracker/`
  - `https://cadil91.github.io/RecipeTracker/`
  - `https://jwt.ms`
- [ ] Platform type is "Single-page application" (SPA) - enables CORS + PKCE
- [ ] Token version set to v2 (`requestedAccessTokenVersion: 2` in manifest)

**MSAL Package:** `@azure/msal-react` + `@azure/msal-browser`
- **Why:** Official Microsoft library for React SPAs
- **Version:** v3.x (see Package Installation above)
- **Pattern:** React hooks and context provider
- **Platform Support:** Web ONLY (React Native mobile uses different library in Story 5.5)

**Environment Variables:**

Before configuration, add MSAL credentials to `.env`:

```bash
# .env (DO NOT commit to git)
EXPO_PUBLIC_MSAL_CLIENT_ID=9eb59a1f-ffe8-49d7-844f-ff2ca7cf02ae
EXPO_PUBLIC_MSAL_TENANT_ID=644a9317-ded3-439a-8f0a-9a8491ce35e9
EXPO_PUBLIC_MSAL_API_SCOPE=api://877ea87e-5be9-4102-9959-6763e3fdf243/access_as_user
```

**Note:** `.env` is already in `.gitignore` (verified in project). These values are safe for development but should use different credentials for production deployments.

**Configuration:**
```typescript
// src/lib/shared/auth/msalConfig.web.ts
import { Configuration } from '@azure/msal-browser';
import { Platform } from 'react-native';

// Type guard to ensure we're on web platform
if (Platform.OS !== 'web') {
  throw new Error('msalConfig.web.ts should only be imported on web platform');
}

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.EXPO_PUBLIC_MSAL_CLIENT_ID!,
    authority: `https://foodbudget.ciamlogin.com/${process.env.EXPO_PUBLIC_MSAL_TENANT_ID}`,
    redirectUri: Platform.OS === 'web'
      ? `${window.location.origin}/RecipeTracker/`
      : undefined,
    postLogoutRedirectUri: Platform.OS === 'web'
      ? `${window.location.origin}/RecipeTracker/`
      : undefined,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [process.env.EXPO_PUBLIC_MSAL_API_SCOPE!],
};
```

**Expected Redirect URIs (by environment):**
- Localhost: `http://localhost:8081/RecipeTracker/`
- GitHub Pages: `https://cadil91.github.io/RecipeTracker/`
- Testing: `https://jwt.ms` (manual token inspection)

**Files to Create:**
```
FoodBudgetMobileApp/
├── src/
│   ├── screens/auth/
│   │   ├── SignInScreen.tsx (web-compatible, email/password)
│   │   ├── SignUpScreen.tsx (web-compatible, email/password)
│   │   └── AuthCallbackScreen.tsx (handle OAuth redirects)
│   ├── components/auth/
│   │   ├── AuthProvider.tsx (MSAL context wrapper)
│   │   └── SignInButton.tsx (email/password button)
│   ├── hooks/
│   │   ├── useAuth.ts (platform abstraction)
│   │   └── useMsal.web.ts (web-specific)
│   └── lib/auth/
│       ├── msalConfig.web.ts
│       ├── authService.web.ts
│       └── authTypes.ts (shared)
```

**Note:** `GoogleSignInButton.tsx` will be added in Phase 3 (Story 5.9) when Google Sign-In is implemented.

**TypeScript Interfaces:**
```typescript
// src/lib/auth/authTypes.ts (shared across web and mobile)

/**
 * User account information from authentication provider
 */
export interface AuthUser {
  id: string;                    // User ID (oid claim from Entra)
  email: string;                 // User email address
  name?: string;                 // Display name (optional)
  username?: string;             // Username (if applicable)
}

/**
 * Authentication hook return type
 * Used by both web (MSAL React) and mobile (react-native-msal)
 */
export interface UseAuthResult {
  isAuthenticated: boolean;      // True if user is signed in
  user: AuthUser | null;         // Current user or null
  isLoading?: boolean;           // Optional: true during initialization
  signIn: () => Promise<void>;   // Trigger sign-in flow
  signOut: () => Promise<void>;  // Trigger sign-out flow
  getAccessToken: () => Promise<string | null>; // Get access token for API calls
}

/**
 * MSAL-specific error types (web only)
 */
export type MsalErrorCode =
  | 'user_cancelled'
  | 'network_error'
  | 'invalid_grant'
  | 'interaction_required'
  | 'no_account_error'
  | 'uninitialized_public_client_application';
```

**Implementation Pattern:**
```tsx
// App.tsx (wrap with MSAL provider)
import { useState, useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './lib/auth/msalConfig.web';

const msalInstance = new PublicClientApplication(msalConfig);

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // CRITICAL: MSAL Browser v4.x requires initialization before use
    // Without this, app will crash with BrowserAuthError: uninitialized_public_client_application
    msalInstance.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>; // Or your LoadingScreen component
  }

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

// src/navigation/ProtectedRoute.tsx (or similar - adapt to your navigation)
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional custom loading screen
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return fallback || (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to sign-in if not authenticated
  // Note: Actual redirect implementation depends on your navigation library
  // (React Navigation, Expo Router, etc.)
  if (!isAuthenticated) {
    // For React Navigation:
    // navigation.navigate('SignIn');

    // For Expo Router:
    // router.replace('/sign-in');

    // Placeholder:
    console.log('User not authenticated - should redirect to sign-in');
    return null;
  }

  // User is authenticated - render protected content
  return <>{children}</>;
};

// Usage example:
// <ProtectedRoute>
//   <RecipeListScreen />
// </ProtectedRoute>
```

**Technical Notes:**

1. **MSAL React Auto-Handles Redirects**: MSAL React's `MsalProvider` automatically calls `handleRedirectPromise()` on mount. You do NOT need to manually call this in App.tsx or any component. This is a key difference from vanilla MSAL Browser.

2. **Token Storage**: Tokens are stored in `sessionStorage` (not `localStorage`):
   - Tokens persist only for the browser tab session
   - Closing the tab clears tokens (user must re-authenticate)
   - More secure than `localStorage` (reduces XSS risk)
   - `storeAuthStateInCookie: false` disables fallback to cookies (SameSite issues)

3. **Platform Abstraction**: The `useAuth()` hook abstracts platform differences:
   - Web: Uses `@azure/msal-react` (this story)
   - Mobile: Will use `react-native-msal` (Story 5.5)
   - Components should ONLY import `useAuth()`, never `useMsalWeb()` directly

4. **Login Flow**: `loginRedirect` vs `loginPopup`:
   - This story uses `loginRedirect` (user leaves app, returns after auth)
   - `loginPopup` is NOT recommended for React Native Web (popup blockers)
   - Redirect flow is more reliable across all browsers

5. **Token Expiration**: MSAL automatically refreshes tokens:
   - Access tokens expire after 1 hour (Entra default)
   - `acquireTokenSilent()` uses refresh token automatically
   - If refresh fails, `acquireTokenRedirect()` triggers interactive sign-in

**Error Handling:**

| Error Type | Error Code/Name | User-Facing Message | Action |
|------------|----------------|---------------------|---------|
| User cancels sign-in | `user_cancelled` | None (stay on sign-in screen) | Allow retry |
| Network error | `network_error` | "Unable to connect. Check your internet connection." | Show retry button |
| Invalid credentials | `invalid_grant` | "Email or password is incorrect." | Display Entra error message |
| Uninitialized MSAL | `BrowserAuthError: uninitialized_public_client_application` | "Authentication system loading..." | Show loading screen (prevent rendering) |
| Token acquisition fails (silent) | `interaction_required` | (Automatic) | Redirect to interactive sign-in |
| Token acquisition fails (interactive) | `interaction_required` | "Please sign in again." | Trigger `loginRedirect()` |
| Account not found | `no_account_error` | "No account found. Please sign in." | Redirect to sign-in |
| Multiple accounts | N/A | (Use first account) | Log warning, use `accounts[0]` |

**Implementation Example:**
```typescript
try {
  await instance.loginRedirect(loginRequest);
} catch (error: any) {
  if (error.errorCode === 'user_cancelled') {
    // User closed the sign-in window - do nothing
    return;
  }

  if (error.errorCode === 'network_error') {
    setError('Unable to connect. Check your internet connection.');
    return;
  }

  // Generic error
  setError(error.message || 'Sign-in failed. Please try again.');
  console.error('Sign-in error:', error);
}
```

**Testing Checklist:**

**Environment Setup:**
1. [ ] Verify `.env` file exists with correct values (client ID, tenant ID, API scope)
2. [ ] Verify MSAL packages installed (`npm list @azure/msal-react @azure/msal-browser`)
3. [ ] Verify redirect URIs registered in Entra admin center

**Localhost Testing (`localhost:8081`):**
1. [ ] Run `npm start` and navigate to `http://localhost:8081/RecipeTracker/`
2. [ ] Click sign-in button → Redirects to Entra sign-in page
3. [ ] Sign up with new email + password → Redirects back to app
4. [ ] Verify access token in browser dev tools (Application → sessionStorage)
5. [ ] Navigate to protected route (e.g., recipe list) → Content loads
6. [ ] Sign out → Token cleared from sessionStorage, redirected to sign-in

**GitHub Pages Testing (Production):**
1. [ ] Deploy to GitHub Pages (`npm run deploy`)
2. [ ] Navigate to `https://cadil91.github.io/RecipeTracker/`
3. [ ] Sign in with email/password → Verify redirect works correctly
4. [ ] Verify access token in sessionStorage
5. [ ] Test protected routes and sign-out

**Email/Password Authentication:**
1. [ ] Sign up with new email → Email format validation works
2. [ ] Sign up with weak password → Password requirements shown
3. [ ] Sign up with valid credentials → Account created, redirected
4. [ ] Sign in with correct credentials → Access granted
5. [ ] Sign in with wrong password → Error message displayed

**Token Management:**
1. [ ] Sign in → Verify `accessToken` in sessionStorage
2. [ ] Close browser tab → Reopen app → Must sign in again (sessionStorage cleared)
3. [ ] Keep tab open → Wait 60+ minutes → Token auto-refreshes on API call
4. [ ] Manually delete token from sessionStorage → Navigate to protected route → Redirected to sign-in

**Protected Routes:**
1. [ ] Unauthenticated user navigates to `/recipes` → Redirected to sign-in
2. [ ] After sign-in → Redirected back to originally requested route
3. [ ] Authenticated user navigates to `/recipes` → Content loads immediately
4. [ ] Sign out → Protected routes no longer accessible

**Error Handling:**
1. [ ] Cancel sign-in (close Entra window) → Stays on sign-in screen, no crash
2. [ ] Disconnect internet → Click sign-in → "Network error" message shown
3. [ ] Invalid credentials → "Email or password is incorrect" message shown
4. [ ] Clear sessionStorage → Refresh app → Must re-authenticate (no crash)

**Browser Compatibility:**
1. [ ] Test on Chrome (latest)
2. [ ] Test on Firefox (latest)
3. [ ] Test on Safari (latest)
4. [ ] Test on Edge (latest)

**Performance:**
1. [ ] Initial app load shows loading screen (MSAL initialization)
2. [ ] After initialization, app renders without delay
3. [ ] Sign-in redirect completes within 2-3 seconds
4. [ ] Token acquisition doesn't block UI (async operations)

**Story 5.3 Compatibility Note:**
Story 5.3 (Connect Web App to Protected API) currently references Axios interceptors for API authentication. However, this project uses **FetchClient** (not Axios) for API calls. During Story 5.3 implementation:
- Update `lib/shared/api/fetch-client.ts` (not an Axios instance)
- Use native Fetch API with request/response interceptor pattern
- Or implement a custom wrapper around fetch that injects the access token from `useAuth().getAccessToken()`
- The pattern is similar but the implementation details will differ from the Axios example shown in Story 5.3

**Estimated Effort:** 5-7 hours (reduced from 6-8 - Google Sign-In deferred)

**Priority:** 🔴 MUST HAVE (Users can't authenticate without this)

---

### Story 5.3: Connect Web App to Protected API

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
- [ ] Recipes displayed are user-specific (verified by oid claim)
- [ ] Code reviewed
- [ ] Integration test verifies end-to-end flow (sign in → call API → get data)

**Technical Notes/Constraints:**

**Dependencies:**
- Sprint 4 Story 4.3 complete (API validates JWT tokens)
- Story 5.2 complete (web app can sign in and get tokens)

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

### **PHASE 2: MOBILE AUTHENTICATION** (Do Later - ~10 hours)

Stories 5.4, 5.5, and 5.6 implement email/password authentication for the mobile app (iOS/Android). These stories create a separate mobile app registration and use React Native MSAL.

**MVP Approach:** Email/password authentication ONLY. Google Sign-In deferred to Phase 3 (Story 5.9).

---

### Story 5.4: Register Mobile App (React Native)

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
