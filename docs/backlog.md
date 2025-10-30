# Product Backlog - Sprint 5+

## Overview

This document contains features and enhancements planned for future sprints after completing Sprint 4 (User Authentication & Management). Items are prioritized based on production readiness, user value, and technical dependencies.

**Current Status:**
- ✅ Sprint 3 Complete: Recipe Management Demo (110 tests passing)
- 🔄 Sprint 4 In Progress: User Authentication & Management

**2025 Production Score After Sprint 4:** 8.0/10

---

## Sprint 5: Observability & Performance (Priority: HIGH)

**Theme:** Make the production app observable, scalable, and performant
**Timeline:** 2-3 weeks
**Dependencies:** Sprint 4 deployed to production

### Why Sprint 5?
With users in production, you need visibility into errors, performance bottlenecks, and usage patterns. Sprint 5 also completes the production readiness foundation started in Sprint 4 by adding full offline support.

---

### Story 5.1: Offline Support & Mutation Queue
**Priority:** CRITICAL (Deferred from Sprint 4)
**Effort:** Medium (1 week)
**Type:** Reliability & UX Enhancement

**User Story:**
> As a user, I want to create, update, and delete recipes while offline so that I can use the app without an internet connection, with changes syncing automatically when I reconnect.

**Why Critical:**
- Deferred from Sprint 4 to maintain auth focus (see `docs/sprint-4.md` Deferred Features section)
- Committed as **first priority** for Sprint 5
- Required for true production-ready mobile experience
- Gap partially mitigated in Sprint 4 with lightweight connection status indicator

**Scope:**
- Full offline detection using `@react-native-community/netinfo`
- Mutation queue for offline changes (create, update, delete)
- Automatic sync when network restored
- Optimistic UI updates
- Conflict resolution for sync failures
- Auth token handling during offline periods
- Comprehensive offline indicator (replacing Sprint 4's lightweight version)

**Implementation:**

**1. Enhanced Network Hook**
```typescript
// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, isInternetReachable, isOffline: !isInternetReachable };
}
```

**2. Mutation Queue with TanStack Query**
```typescript
// hooks/useRecipeMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from './useNetworkStatus';
import { RecipeService } from '@/lib/shared/services/RecipeService';

export function useRecipeMutations() {
  const queryClient = useQueryClient();
  const { isOffline } = useNetworkStatus();

  const createRecipe = useMutation({
    mutationFn: RecipeService.createRecipe,
    onMutate: async (newRecipe) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['recipes'] });
      const previousRecipes = queryClient.getQueryData(['recipes']);

      queryClient.setQueryData(['recipes'], (old: any) => [
        ...old,
        { ...newRecipe, id: `temp-${Date.now()}`, _pendingSync: true },
      ]);

      return { previousRecipes };
    },
    onError: (err, newRecipe, context) => {
      queryClient.setQueryData(['recipes'], context.previousRecipes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    // Retry when back online
    retry: isOffline ? false : 3,
    networkMode: 'offlineFirst', // Queue mutations when offline
  });

  return { createRecipe };
}
```

**3. Offline Indicator Component (Enhanced)**
```typescript
// components/shared/ui/OfflineIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useMutationState } from '@tanstack/react-query';

export function OfflineIndicator() {
  const { isOffline } = useNetworkStatus();
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
  });

  if (!isOffline && pendingMutations.length === 0) return null;

  return (
    <View style={[styles.container, isOffline && styles.offline]}>
      <MaterialIcons
        name={isOffline ? "wifi-off" : "sync"}
        size={16}
        color="#fff"
      />
      <Text style={styles.text}>
        {isOffline
          ? `Offline - ${pendingMutations.length} changes queued`
          : `Syncing ${pendingMutations.length} changes...`
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff9800', // Orange for syncing
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  offline: {
    backgroundColor: '#f44336', // Red for offline
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
```

**4. Entra + Offline Considerations**
- MSAL caches tokens locally (works offline)
- Token refresh requires network (gracefully fails offline)
- Queue mutations until network restored
- Refresh tokens when back online before syncing

**Acceptance Criteria:**
- [ ] App detects offline status accurately
- [ ] Enhanced offline indicator shows pending changes count
- [ ] Mutations queued while offline (not lost)
- [ ] Queued mutations sync automatically when online
- [ ] User sees clear feedback about queued operations
- [ ] Optimistic UI updates work correctly
- [ ] Auth tokens handled correctly during offline periods
- [ ] Tests verify offline behavior and sync logic
- [ ] Conflict resolution handles sync failures gracefully

**Files to Create:**
- `hooks/useNetworkStatus.ts` - Enhanced network detection hook
- `components/shared/ui/OfflineIndicator.tsx` - Full offline banner with sync status
- `lib/shared/services/OfflineSyncService.ts` - Optional: Advanced sync coordination

**Files to Modify:**
- `hooks/useRecipeMutations.ts` - Add offline detection and queue logic
- `navigation/AppNavigator.tsx` - Replace lightweight indicator with full version
- `lib/shared/services/RecipeService.ts` - Handle offline scenarios

**Testing:**
```typescript
// __tests__/hooks/useRecipeMutations.offline.test.tsx
describe('useRecipeMutations - Offline', () => {
  it('queues mutations when offline', async () => {
    mockNetInfo({ isConnected: false });
    const { result } = renderHook(() => useRecipeMutations());

    await act(() => result.current.createRecipe.mutate(newRecipe));

    expect(result.current.createRecipe.isPending).toBe(true);
  });

  it('syncs queued mutations when back online', async () => {
    mockNetInfo({ isConnected: false });
    const { result, rerender } = renderHook(() => useRecipeMutations());

    await act(() => result.current.createRecipe.mutate(newRecipe));

    mockNetInfo({ isConnected: true });
    rerender();

    await waitFor(() => expect(result.current.createRecipe.isSuccess).toBe(true));
  });
});
```

**Migration from Sprint 4:**
- Replace `hooks/useNetworkStatus.ts` with enhanced version
- Replace `OfflineIndicator.tsx` with full version showing sync status
- Update `useRecipeMutations.ts` to add queue logic

**Estimated Timeline:** 1 week
**Risk:** LOW (well-understood pattern with TanStack Query)

---

### Story 5.2: Application Performance Monitoring (APM)
**Priority:** CRITICAL
**Effort:** Medium (1 week)
**Type:** Observability

**User Story:**
> As a developer, I need to monitor application performance and errors in production so I can debug issues and optimize user experience.

**Why Critical for 2025:**
- Cannot debug production issues without observability
- Expected in all SaaS products for incident response
- Required for meeting SLA commitments

**Scope:**
- Integrate Sentry or Application Insights for error tracking
- Set up performance monitoring (API response times, frontend render times)
- Configure error alerting (Slack/email notifications)
- Add custom error context (user ID, recipe ID, action performed)
- Track JavaScript errors with source maps
- Monitor API endpoint performance
- **Sign-up monitoring:** Track daily sign-up counts and alert on unusual spikes (bot protection)

**Implementation:**
- **Frontend:** Sentry SDK integration
- **Backend:** Application Insights SDK or Sentry .NET SDK
- **Configuration:** Error sampling, release tracking, environment tagging

**Acceptance Criteria:**
- [ ] Frontend errors captured with stack traces
- [ ] Backend exceptions logged to APM service
- [ ] Performance metrics visible in dashboard
- [ ] Alert notifications configured (critical errors only)
- [ ] Source maps uploaded for readable stack traces
- [ ] User context attached to error reports
- [ ] API response times tracked per endpoint
- [ ] Sign-up metrics tracked (daily count, hourly spikes)
- [ ] Alert configured for unusual sign-up patterns (>100/day or >20/hour)
- [ ] Dashboard shows sign-up trends over time

**Files to Create:**
- Frontend: `lib/shared/services/monitoring.ts`
- Frontend: `lib/shared/utils/error-reporting.ts`
- Backend: `Services/MonitoringService.cs`
- Backend: `Middleware/PerformanceMonitoringMiddleware.cs`

**Files to Modify:**
- Frontend: `App.tsx` (initialize Sentry)
- Frontend: `components/ErrorBoundary.tsx` (send to Sentry)
- Backend: `Program.cs` (register Application Insights)
- Backend: `Middleware/ExceptionHandlingMiddleware.cs` (log to APM)

**Estimated Cost:**
- Sentry: Free tier (5K errors/month) or $26/month for growth
- Application Insights: ~$2-10/month for low-medium traffic

---

### Story 5.3: API Pagination
**Priority:** HIGH
**Effort:** Medium (1 week)
**Type:** Performance & Scalability

**User Story:**
> As a user with many recipes, I want the app to load quickly even with 100+ recipes in my collection.

**Why Needed for 2025:**
- Fetching all records doesn't scale beyond 100+ items
- Standard REST API pattern expected since 2015
- Mobile users benefit from reduced data transfer

**Scope:**
- Add pagination support to GET /api/Recipe endpoint
- Implement cursor-based or offset-based pagination
- Add `Link` headers for next/prev pages (RFC 5988)
- Frontend infinite scroll or "Load More" button
- Update TanStack Query to support paginated queries

**Implementation:**
```csharp
// Backend: GET /api/Recipe?page=1&pageSize=20
public async Task<ActionResult<PagedResult<RecipeResponseDto>>> GetRecipes(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
{
    var recipes = await _recipeService.GetRecipesPaged(userId, page, pageSize);
    var total = await _recipeService.GetRecipesCount(userId);

    return Ok(new PagedResult<RecipeResponseDto>
    {
        Data = recipes,
        Page = page,
        PageSize = pageSize,
        TotalCount = total,
        TotalPages = (int)Math.Ceiling(total / (double)pageSize)
    });
}
```

```typescript
// Frontend: TanStack Query infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['recipes'],
  queryFn: ({ pageParam = 1 }) => RecipeService.getRecipesPaged(pageParam, 20),
  getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
});
```

**Acceptance Criteria:**
- [ ] API returns paginated results (default 20 per page)
- [ ] Link headers included (next, prev, first, last)
- [ ] Frontend displays first page on load
- [ ] User can load more recipes (infinite scroll or button)
- [ ] Performance improves for users with 100+ recipes
- [ ] Backward compatible (optional pagination parameters)
- [ ] Search and filters work with pagination

**Files to Create:**
- Backend: `Models/DTOs/PagedResult.cs`
- Frontend: `hooks/useInfiniteRecipes.ts`

**Files to Modify:**
- Backend: `Services/IRecipeService.cs` (add paged methods)
- Backend: `Services/RecipeService.cs` (implement paging)
- Backend: `Controllers/RecipeController.cs` (add pagination params)
- Frontend: `screens/RecipeListScreen.tsx` (use infinite query)

---

### Story 5.4: PWA Features (Optional)
**Priority:** MEDIUM
**Effort:** Medium (1 week)
**Type:** User Experience

**User Story:**
> As a web user, I want the app to work offline and feel like a native app so I can access my recipes anytime.

**Why Nice-to-Have for 2025:**
- Modern web apps offer app-like experience
- Improves engagement and retention
- Competitive feature for recipe apps

**Scope:**
- Add service worker for offline caching
- Create web app manifest for installability
- Add "Add to Home Screen" prompt
- Cache recipe images and API responses
- Offline-first data synchronization

**Acceptance Criteria:**
- [ ] Service worker caches static assets
- [ ] App installable on mobile devices
- [ ] Offline mode shows cached recipes
- [ ] Changes sync when back online
- [ ] Install prompt shown to returning users

**Defer to Sprint 5 if:**
- Sprint 4 auth takes longer than expected
- Want to focus on observability first

---

### Story 5.5: Email Verification (If Deferred from Sprint 4)
**Priority:** MEDIUM
**Effort:** Medium (1 week)
**Type:** Security & User Management

**User Story:**
> As a user, I want to verify my email address so that my account is secure and I can receive important notifications.

**Scope:**
- Verification email sent on registration
- Email verification token flow
- Resend verification endpoint
- Optional: Restrict features until verified

**Acceptance Criteria:**
- [ ] Verification email sent on registration
- [ ] User can verify email via link
- [ ] Resend verification available (rate limited)
- [ ] Verification status shown in profile
- [ ] Integration tests pass

**Note:** Only include if deferred from Sprint 4. See `docs/sprint-4.md` Story 7 for full details.

---

## Sprint 6: Infrastructure & Advanced Security

**Theme:** Production infrastructure maturity and enhanced security
**Timeline:** 2-3 weeks
**Dependencies:** Sprint 5 complete, production traffic data available

---

### Story 6.1: Infrastructure as Code (IaC)
**Priority:** MEDIUM
**Effort:** Large (2 weeks)
**Type:** DevOps & Infrastructure

**User Story:**
> As a DevOps engineer, I need infrastructure defined as code so I can reproduce environments consistently and manage resources via version control.

**Why Needed for Scale:**
- Manual Azure setup doesn't scale to multiple environments
- Required for disaster recovery and environment parity
- Version control for infrastructure changes

**Scope:**
- Convert Azure resources to Terraform or Bicep
- Define all resources: App Service, SQL Database, Storage, Key Vault
- Create separate configs for dev/staging/prod
- Automate deployment via GitHub Actions
- Document infrastructure setup process

**Implementation:**
```hcl
# Terraform example
resource "azurerm_app_service" "api" {
  name                = "foodbudget-api-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id

  site_config {
    dotnet_framework_version = "v8.0"
    always_on                = true
  }
}
```

**Acceptance Criteria:**
- [ ] All Azure resources defined as code
- [ ] Dev/staging/prod environments reproducible
- [ ] GitHub Actions workflow for infrastructure deployment
- [ ] State management configured (Terraform Cloud or Azure Storage)
- [ ] Documentation for infrastructure changes
- [ ] Rollback procedure documented

**Files to Create:**
- `infrastructure/terraform/` (or `infrastructure/bicep/`)
- `infrastructure/README.md`
- `.github/workflows/infrastructure.yml`

---

### Story 6.2: Advanced Security Features
**Priority:** MEDIUM
**Effort:** Large (2-3 weeks)
**Type:** Security Enhancement

**User Story:**
> As a security-conscious user, I want additional account protection so I can secure my recipe collection.

**Why Nice-to-Have:**
- JWT + refresh tokens provide solid baseline security
- 2FA is competitive feature in modern apps
- Enhances trust for users storing sensitive data

**Scope:**
- Two-factor authentication (TOTP via authenticator app)
- Suspicious login detection (new device/location alerts)
- Session management UI (view all logged-in devices)
- Security audit log visible to users
- Optional: SMS-based 2FA, biometric authentication

**Implementation:**
- TOTP library (OtpNet for .NET, otplib for TypeScript)
- Device fingerprinting (user agent, IP, geolocation)
- Email alerts for suspicious logins

**Acceptance Criteria:**
- [ ] Users can enable 2FA via QR code
- [ ] TOTP codes validated on login
- [ ] Recovery codes generated for 2FA
- [ ] Session management shows active devices
- [ ] Users can revoke sessions remotely
- [ ] Email alerts for new device logins

**Files to Create:**
- Backend: `Services/TwoFactorService.cs`
- Backend: `Entities/UserDevice.cs`
- Frontend: `screens/settings/SecuritySettingsScreen.tsx`
- Frontend: `screens/auth/TwoFactorSetupScreen.tsx`

---

### Story 6.3: Administrative Access Controls
**Priority:** LOW
**Effort:** Small (2-4 hours)
**Type:** Administrative Feature

**User Story:**
> As an administrator, I want to control user registration so I can transition from open registration to invite-only access when needed.

**Why Nice-to-Have:**
- Useful for beta/private testing phases
- Allows transition from public to invite-only model
- Provides flexibility for managed user onboarding
- Simple API configuration with immediate effect

**Scope:**
- Disable sign-up in user flow (existing users can still sign in)
- Re-enable sign-up when needed
- Microsoft Graph API integration for user flow management

**Implementation:**
- Use Microsoft Graph API to update user flow configuration
- PATCH request to set `isSignUpAllowed` flag
- Documentation: [How-To: Disable Sign-Up in User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-disable-sign-up-user-flow)

**Steps:**
1. Retrieve application ID from Entra ID portal
2. Use Graph API to list user flows for application
3. Execute PATCH request to user flow with `isSignUpAllowed: false`
4. Verify sign-up option removed from authentication flow

**Acceptance Criteria:**
- [ ] Can disable sign-up via Microsoft Graph API
- [ ] Existing users can still sign in when sign-up disabled
- [ ] Can re-enable sign-up by setting flag to `true`
- [ ] Documentation for admins on toggling this setting

**When to Implement:**
- Post-MVP, when transitioning to controlled access
- Before invite-only beta testing
- After Sprint 4 authentication is deployed

---

### Story 6.4: Sign-In Aliases (Username Support)
**Priority:** LOW
**Effort:** Small (3-6 hours)
**Type:** Authentication Enhancement

**User Story:**
> As a user, I want to sign in with a username or other identifier (in addition to email) so I can use a more memorable or business-specific login identifier.

**Why Nice-to-Have:**
- Provides user flexibility (username vs. email preference)
- Supports business-specific identifiers (customer ID, account number, member ID)
- Useful for membership programs or business integrations
- Single account can use multiple sign-in options

**Scope:**
- Enable username as sign-in identifier in policy
- Configure optional username validation rules (regex)
- Assign usernames to user accounts
- Customize sign-in page hint text (e.g., "Email or Member ID")

**Implementation:**
- Enable username in sign-in identifier policy (admin center)
- Add custom regex validation for username format (optional)
- Assign usernames via admin center or Microsoft Graph API
- Update branding to reflect username support
- Documentation: [How-To: Sign-In Aliases](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-sign-in-alias)

**Steps:**
1. Navigate to Sign-in identifiers policy in Entra ID
2. Enable "Username" as allowed identifier
3. (Optional) Configure custom regex validation rules
4. Assign usernames to users (admin center or Graph API)
5. Update sign-in page hint text in branding settings
6. Test sign-in with both email and username

**Acceptance Criteria:**
- [ ] Username enabled in sign-in identifier policy
- [ ] Users can be assigned usernames via admin center
- [ ] Users can sign in with email OR username (+ password)
- [ ] Custom validation rules enforce username format requirements
- [ ] Sign-in page shows appropriate hint text
- [ ] Documentation for assigning/managing usernames

**FoodBudget Decision:**
- ❌ **NOT implementing for MVP**
- **Rationale:**
  - Email-based login is industry standard for consumer apps
  - No clear business need for customer IDs or account numbers
  - Adds complexity without clear benefit
  - Can add post-MVP if user feedback indicates need

**When to Implement:**
- Post-MVP, only if user feedback indicates demand
- Consider for business/enterprise features
- Evaluate against actual use cases before implementing

---

### Story 6.6: Facebook Business Verification Research
**Priority:** HIGH (Sprint 4 blocker if required)
**Effort:** Small (2-4 hours)
**Type:** Research & Documentation

**User Story:**
> As a developer, I need to understand Facebook's business verification requirements so I can complete Facebook Login configuration for Sprint 4.

**Why Important:**
- Facebook may require business verification before app can go live
- Potential Sprint 4 blocker if verification process is lengthy
- Need to understand requirements, timeline, and alternatives
- Impacts ability to test Facebook authentication with real users

**Scope:**
- Research Facebook business verification requirements
- Determine if verification is mandatory for FoodBudget use case
- Document verification process steps and timeline
- Identify alternatives if verification is not feasible for MVP
- Document decision and next steps

**Research Questions:**
1. Is business verification mandatory for FoodBudget's use case?
2. What documents/information are required?
3. How long does the verification process take?
4. Can we use development mode for Sprint 4 testing (app owners only)?
5. What are the consequences of not completing verification?
6. Are there workarounds or alternatives?

**Implementation:**
- Review Facebook Developer documentation on business verification
- Check Facebook app configuration requirements
- Determine verification necessity for OAuth/authentication use case
- Document findings in research guide
- Update sprint-4.md with decision and requirements

**Acceptance Criteria:**
- [ ] Business verification requirements documented
- [ ] Decision made: complete verification OR use alternative approach
- [ ] Timeline documented (if pursuing verification)
- [ ] Sprint 4 impact assessed (blocker vs. optional)
- [ ] Recommendation documented in sprint-4.md

**When to Complete:**
- **BEFORE Sprint 4 starts** (potential blocker)
- During Sprint 3 wrap-up or Sprint 4 planning
- Must complete before Facebook app configuration (Phase 2, Task 4B)

---

### Story 6.7: Create Placeholder Legal Pages
**Priority:** HIGH (Sprint 4 prerequisite)
**Effort:** Small (1-2 hours)
**Type:** Content Creation

**User Story:**
> As a developer, I need placeholder privacy policy, terms of service, and data deletion pages so I can configure Facebook Login for Sprint 4.

**Why Important:**
- **BLOCKER:** Facebook requires these URLs to save app configuration
- Cannot complete Phase 2, Task 4B without these pages
- Required for Sprint 4 authentication implementation

**Scope:**
- Create simple HTML placeholder pages:
  - Privacy Policy (`/privacy`)
  - Terms of Service (`/terms`)
  - User Data Deletion (`/delete-data`)
- Host pages at temporary or permanent URL
- Use basic privacy/terms statements (not final legal documents)
- Can be updated later with attorney-reviewed content

**Content Recommendations:**
- Keep it simple and generic
- State that FoodBudget collects minimal data (email, name)
- Explain data is used for authentication and app functionality
- Include data deletion contact method
- Add disclaimer that legal documents will be updated

**Hosting Options:**
- Option A: GitHub Pages (free, quick)
- Option B: Azure Static Web Apps (free tier)
- Option C: Temporary subdomain on existing infrastructure
- Option D: foodbudget.com domain (if registered)

**Acceptance Criteria:**
- [ ] Privacy Policy page created and accessible
- [ ] Terms of Service page created and accessible
- [ ] User Data Deletion page created and accessible
- [ ] URLs documented in sprint-4.md (Phase 2, Task 4B)
- [ ] Pages contain basic privacy/terms statements
- [ ] Disclaimer added that legal review pending

**When to Complete:**
- **BEFORE Sprint 4, Phase 2, Task 4B** (Facebook configuration)
- Can be done during Sprint 4 if Facebook task is later in sprint
- Recommended: Complete during planning to unblock Sprint 4

---

### Story 6.8: Load Testing & Performance Benchmarks
**Priority:** MEDIUM
**Effort:** Medium (1 week)
**Type:** Performance & Quality

**User Story:**
> As a developer, I need to understand application performance under load so I can identify bottlenecks before they affect users.

**Why Important:**
- Cannot optimize without measuring performance
- Required before scaling to real user traffic
- Establishes baseline for future improvements

**Scope:**
- Set up k6 or JMeter load testing
- Create test scenarios (CRUD operations, authentication)
- Run tests with 10/100/1000 concurrent users
- Identify slow queries and API endpoints
- Document performance baselines

**Implementation:**
```javascript
// k6 load test example
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  let res = http.get('https://api.foodbudget.com/api/Recipe');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

**Acceptance Criteria:**
- [ ] Load test scripts created for key scenarios
- [ ] Baseline performance documented (p50, p95, p99)
- [ ] Slow queries identified and indexed
- [ ] API response time targets defined (<200ms p95)
- [ ] CI integration for performance regression testing

**Files to Create:**
- `tests/load/` directory with k6 scripts
- `docs/performance/benchmarks.md`

---

### Story 6.9: Multi-Language Support
**Priority:** MEDIUM
**Effort:** Small (3-5 hours)
**Type:** User Experience & Internationalization

**User Story:**
> As a non-English speaking user, I want to see authentication pages in my preferred language so I can understand sign-in/sign-up flows in my native language.

**Why Nice-to-Have:**
- Expands potential user base to non-English markets
- Improves accessibility for international users
- Competitive feature for global recipe apps
- Microsoft Entra External ID supports 40+ languages out-of-the-box

**MVP Decision:**
- ✅ **English-only for MVP** (simplifies initial launch)
- ⏸️ **Deferred to backlog** - add based on user demographics and feedback
- 🌍 **Post-MVP:** Evaluate which languages to support based on user data

**Scope:**
- Configure language customization in Company Branding settings
- Add additional language packs (e.g., Spanish, French, German, etc.)
- Customize text for each language (sign-in hints, messages, labels)
- Set browser language detection or user preference
- Test authentication flows in each supported language

**Available Languages:**
Microsoft Entra External ID supports 40+ languages including:
- Spanish (es-ES, es-MX)
- French (fr-FR, fr-CA)
- German (de-DE)
- Portuguese (pt-BR, pt-PT)
- Chinese (zh-CN, zh-TW)
- Japanese (ja-JP)
- Korean (ko-KR)
- Italian (it-IT)
- Dutch (nl-NL)
- Russian (ru-RU)
- And 30+ more

**Implementation:**

**Step 1: Access Language Customization**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Navigate to **Company Branding** → **Languages**
4. Select **Add language** (or edit existing language)

**Step 2: Configure Each Language**
1. Select language from dropdown
2. Configure same branding elements as default (logos, colors, etc.)
3. Customize text strings for selected language:
   - Username hints
   - Sign-in page text
   - Error messages
   - Button labels
   - Footer links (Privacy Policy, Terms of Service)
4. Preview language-specific branding
5. Save configuration

**Step 3: Language Selection Strategy**
- **Option A:** Browser language detection (automatic based on user's browser settings)
- **Option B:** User preference dropdown on sign-in page
- **Option C:** Hybrid (browser detection with manual override)

**Step 4: Testing**
- Change browser language settings and verify correct language displays
- Test all authentication flows (sign-in, sign-up, password reset) in each language
- Verify footer links work for all languages
- Test language fallback behavior (if unsupported language requested)

**Acceptance Criteria:**
- [ ] At least 3 additional languages configured beyond English
- [ ] Language selection works based on browser settings or user preference
- [ ] All text strings translated for supported languages
- [ ] Branding elements (logos, colors) consistent across languages
- [ ] Footer links (Privacy Policy, Terms of Service) available in all languages OR explained in English
- [ ] Unsupported languages fall back to English gracefully
- [ ] Documentation for adding new languages in the future

**Files to Modify:**
- None (configuration-only change in Entra admin center)
- Update `docs/entra-external-id-setup-guide.md` Part 7 with language instructions when implemented

**Decision Criteria for Implementation:**
- User feedback requesting non-English languages
- Analytics showing significant traffic from non-English speaking regions
- Expansion into specific international markets
- Competitive analysis showing language support as differentiator

**Estimated Timeline:** 3-5 hours (configuration + testing for 3-5 languages)

**Cost:** FREE (included in base tier)

**When to Implement:**
- Post-MVP based on user demographics
- After observing user base language preferences via analytics
- Before expanding into specific international markets

---

### Story 6.10: Multi-Factor Authentication (MFA)
**Priority:** MEDIUM
**Effort:** Small-Medium (5-8 hours)
**Type:** Security Enhancement

**User Story:**
> As a security-conscious user, I want to enable multi-factor authentication on my account so I can add an extra layer of protection beyond my password.

**Why Nice-to-Have:**
- Adds optional security layer for users who want it
- Protects against password compromise
- Competitive feature in modern apps
- FoodBudget is recipe app (not financial/health data), so not critical for MVP

**MVP Decision:**
- ❌ **NOT implementing for MVP** (Option B - defer to post-MVP)
- ⏸️ **Deferred to backlog** - implement when security is higher priority
- 📧 **Email OTP only** when implemented (Option A - FREE, simple)
- ⚙️ **Optional user setting** (Option B - users enable in account settings)

**Scope:**
- Enable Email One-Time Passcode (OTP) authentication method
- Create Conditional Access policy for MFA enforcement
- Add MFA settings screen in user account settings
- Allow users to opt-in to MFA (not required by default)
- Email OTP sent after password authentication
- Test MFA flow across sign-in scenarios

**Supported MFA Methods (for FoodBudget):**

**Email One-Time Passcode (Email OTP):**
- User receives 6-digit code via email after password entry
- **Cost:** FREE (no additional charges)
- **Limitation:** Cannot use email OTP for BOTH primary authentication AND MFA
- **FoodBudget Decision:** Use "Email with password" for primary auth, email OTP for MFA
- Works with email/password primary authentication

**NOT Using (Future Consideration):**
- ❌ **SMS-Based Authentication:** Costs ~$0.0075 per SMS, requires active Azure subscription, regional restrictions starting January 2025
- ❌ **TOTP Authenticator App (Story 6.2):** More complex, covered in Advanced Security Features story

**Implementation:**

**Step 1: Enable Email OTP Authentication Method**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Navigate to **Protection** → **Authentication methods** → **Policies**
4. Select **Email OTP**
5. Enable for **All users** or specific groups
6. Configure settings (code expiration, etc.)
7. Save configuration

**Step 2: Create Conditional Access Policy**
1. Navigate to **Protection** → **Conditional Access**
2. Create new policy (e.g., "MFA for Opt-In Users")
3. **Assignments:**
   - Users: Specific group (e.g., "MFA-Enabled-Users")
   - Cloud apps: Select FoodBudget app
4. **Access controls:**
   - Grant access
   - Require multi-factor authentication
5. Enable policy
6. Save

**Step 3: User Opt-In Flow (Frontend)**
1. Add "Security" or "Two-Factor Authentication" section in account settings
2. Toggle switch: "Enable Two-Factor Authentication"
3. When enabled:
   - Frontend calls backend to add user to "MFA-Enabled-Users" group
   - Backend uses Microsoft Graph API to update group membership
   - User notified that MFA is now required
4. When disabled:
   - Remove user from MFA group
   - User no longer prompted for MFA

**Step 4: User Experience**
1. User enables MFA in settings
2. Next sign-in: Enter email and password
3. System sends 6-digit code to email
4. User enters code
5. Access granted

**Backend API Endpoints:**
```csharp
// POST /api/user/mfa/enable
// POST /api/user/mfa/disable
// GET /api/user/mfa/status
```

**Frontend Screens:**
- `screens/settings/SecuritySettingsScreen.tsx` - MFA toggle
- `screens/auth/MfaVerificationScreen.tsx` - Enter OTP code (if needed)

**Acceptance Criteria:**
- [ ] Email OTP authentication method enabled in Entra
- [ ] Conditional Access policy created for MFA enforcement
- [ ] User settings screen shows MFA toggle
- [ ] Users can enable MFA (adds to MFA group)
- [ ] Users prompted for OTP code on next sign-in after enabling
- [ ] Users can disable MFA (removes from MFA group)
- [ ] MFA status visible in user settings
- [ ] Email OTP codes expire after configured time (default 5 minutes)
- [ ] Tests verify MFA opt-in/opt-out flow
- [ ] Documentation for users on enabling MFA

**Files to Create:**
- Backend: `Controllers/UserMfaController.cs` - MFA management endpoints
- Backend: `Services/MfaService.cs` - Graph API integration for group membership
- Frontend: `screens/settings/SecuritySettingsScreen.tsx` - MFA settings UI
- Frontend: `screens/auth/MfaVerificationScreen.tsx` - OTP entry screen (if needed)
- Frontend: `hooks/useMfaStatus.ts` - Query MFA status

**Files to Modify:**
- Backend: `Services/GraphApiService.cs` - Add group membership methods
- Frontend: `navigation/AppNavigator.tsx` - Add MFA verification screen to auth flow

**Important Notes:**
- **CRITICAL:** Cannot use "Email with one-time passcode" for primary sign-in AND MFA
- FoodBudget uses "Email with password" for primary auth, so email OTP available for MFA
- Email OTP is FREE (no per-message charges like SMS)
- Conditional Access policies control when MFA is enforced
- Risk-based MFA (trigger only for suspicious logins) is advanced option for future

**Pending Questions (Answer Before Implementation):**
1. **Compliance Requirements:**
   - Do we have specific security compliance needs (HIPAA, SOC 2, PCI-DSS, etc.)?
   - Are we handling sensitive data that requires MFA?
   - Any regulatory requirements for user data protection?

2. **Competitive Analysis:**
   - Do competing recipe apps offer MFA?
   - Is MFA a differentiator or table stakes in our market?

3. **User Feedback:**
   - Have users requested MFA or expressed security concerns?
   - What percentage of users would likely enable optional MFA?

**Decision Criteria for Implementation:**
- User feedback requesting MFA
- Security incidents or concerns
- Compliance requirements emerge
- Competitive analysis shows MFA as expected feature
- Moving upmarket to users with higher security expectations

**Estimated Timeline:** 5-8 hours (configuration + backend + frontend + testing)

**Cost:** FREE (Email OTP has no additional charges)

**Risk:** LOW (well-documented Entra feature)

**When to Implement:**
- Post-MVP when security is higher priority
- After answering pending compliance questions
- If user feedback indicates demand
- Before handling any sensitive user data beyond recipes

---

### Story 6.11: App Roles for Authorization (RBAC)
**Priority:** LOW (Optional)
**Effort:** Small-Medium (4-8 hours)
**Type:** Authorization & Access Control

**User Story:**
> As an administrator, I want to assign roles to users so I can control access to admin features, premium features, or moderation tools.

**Why Optional:**
- FoodBudget MVP uses user-scoped data (users only access their own recipes)
- No admin panel in MVP
- No premium/free tier differentiation
- No public sharing or moderation features
- Current authorization model sufficient: extract `userId` from JWT, filter all queries by user

**When You Might Need This:**
- **Admin Panel:** Need "Admin" role to access user management, analytics, system settings
- **Premium Features:** Need "Premium" role for paid tier features (AI suggestions, unlimited storage)
- **Content Moderation:** Need "Moderator" role if adding public recipe sharing
- **Beta Access:** Need "Beta" role for early access features
- **Multi-tenant:** Need roles to control cross-organization access

**What App Roles Are:**
- Application-specific authorization mechanism in Entra External ID
- Define roles in app registration (e.g., "Admin", "Premium", "Moderator")
- Assign roles to users via admin center or Microsoft Graph API
- Roles delivered in JWT token's `roles` claim
- Your code checks roles to authorize actions

**App Roles vs. Groups:**
| Feature | App Roles | Groups |
|---------|-----------|--------|
| Scope | Application-specific | Tenant-wide |
| Reusability | Cannot share across apps | Share across multiple apps |
| Token claim | `roles` claim | `groups` claim |
| Best for | FoodBudget-specific permissions | Multi-app scenarios (not applicable) |

**FoodBudget Decision:** Use app roles (not groups) if needed - appropriate for single-app scenario

---

**Scope (When Implemented):**

**Step 1: Define Roles in App Registration**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Navigate to **App registrations** → Select FoodBudget app
3. Select **App roles** → **Create app role**
4. Configure each role:
   - **Display name:** User-friendly name (e.g., "Administrator")
   - **Allowed member types:** Users/Groups (select "Users/Groups")
   - **Value:** Token claim value, no spaces (e.g., "Admin")
   - **Description:** What the role allows (e.g., "Full access to admin panel")
   - **Enable:** Check to activate
5. Create roles as needed:
   - `User` (default) - Standard user access
   - `Admin` - Full admin panel access
   - `Premium` - Premium features access (if monetizing)
   - `Moderator` - Content moderation tools (if public sharing)
   - `Beta` - Early access to beta features

**Step 2: Assign Roles to Users**
1. Navigate to **Enterprise applications** → Select FoodBudget app
2. Under **Manage**, select **Users and groups**
3. Click **Add user/group**
4. Select users from list
5. Choose appropriate role from dropdown
6. Confirm assignment

**Alternative:** Use Microsoft Graph API for programmatic role assignment

**Step 3: Backend Authorization**

Configure ASP.NET Core to read `roles` claim:

```csharp
// Startup.cs or Program.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://foodbudget.ciamlogin.com/";
        options.Audience = "your-app-client-id";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = "roles" // Map roles claim to .NET roles
        };
    });

services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("PremiumOrAdmin", policy =>
        policy.RequireRole("Premium", "Admin"));
});
```

Protect endpoints with role requirements:

```csharp
// Controllers/AdminController.cs
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        // Only users with "Admin" role can access
        return Ok(await _userService.GetAllUsers());
    }
}

// Controllers/PremiumController.cs
[Authorize(Policy = "PremiumOrAdmin")]
public class PremiumController : ControllerBase
{
    [HttpGet("ai-suggestions")]
    public async Task<IActionResult> GetAiSuggestions()
    {
        // Only Premium or Admin users can access
        return Ok(await _aiService.GetSuggestions());
    }
}
```

**Step 4: Frontend Authorization (Optional UX Enhancement)**

Read roles from JWT token:

```typescript
// utils/auth.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  roles?: string[];
  sub: string;
  email: string;
}

export function getUserRoles(accessToken: string): string[] {
  try {
    const decoded = jwtDecode<DecodedToken>(accessToken);
    return decoded.roles || [];
  } catch {
    return [];
  }
}

export function hasRole(accessToken: string, role: string): boolean {
  const roles = getUserRoles(accessToken);
  return roles.includes(role);
}

export function isAdmin(accessToken: string): boolean {
  return hasRole(accessToken, 'Admin');
}
```

Conditionally render UI:

```typescript
// screens/SettingsScreen.tsx
import { isAdmin } from '@/utils/auth';
import { useAuth } from '@/hooks/useAuth';

export function SettingsScreen() {
  const { accessToken } = useAuth();

  return (
    <View>
      <Text>Settings</Text>

      {isAdmin(accessToken) && (
        <Button title="Admin Panel" onPress={navigateToAdmin} />
      )}

      {/* Other settings */}
    </View>
  );
}
```

**Important:** Frontend checks are UX only - **backend MUST enforce all authorization**

---

**Acceptance Criteria:**
- [ ] Roles defined in app registration (Admin, Premium, etc.)
- [ ] Roles can be assigned to users via admin center
- [ ] Backend reads `roles` claim from JWT token
- [ ] Backend enforces role-based authorization with `[Authorize(Roles = "...")]`
- [ ] Protected endpoints return 403 Forbidden if role missing
- [ ] Frontend conditionally shows/hides features based on roles (UX only)
- [ ] Tests verify role-based authorization logic
- [ ] Documentation for admins on assigning roles

**Files to Create:**
- Backend: `Policies/AuthorizationPolicies.cs` - Define authorization policies
- Frontend: `utils/auth.ts` - Role checking utilities
- Frontend: `hooks/useUserRoles.ts` - React hook for role checks

**Files to Modify:**
- Backend: `Program.cs` - Configure role claim mapping and policies
- Backend: Controllers - Add `[Authorize(Roles = "...")]` attributes
- Frontend: Various screens - Conditional rendering based on roles

---

**Implementation Notes:**

**Current FoodBudget Authorization (Sufficient for MVP):**
- Extract `userId` from JWT token `sub` claim
- Filter all queries by `userId` (e.g., `WHERE UserId = @userId`)
- Users can only access their own recipes
- No cross-user access = sufficient for MVP

**When App Roles Add Value:**
- Admin needs access to ALL users' data (not just their own)
- Premium users get different feature set than free users
- Moderators need access to flagged/reported content
- Different permission levels within the app

**Cost:** FREE (no additional charges)

**Risk:** LOW (standard OAuth/JWT pattern)

**Estimated Timeline:** 4-8 hours
- Entra configuration (role definition): 1 hour
- Backend authorization setup: 2-3 hours
- Frontend role utilities: 1-2 hours
- Testing: 1-2 hours

---

**When to Implement:**
- When building admin panel (need "Admin" role)
- When adding premium features (need "Premium" role)
- When enabling public recipe sharing (need "Moderator" role)
- When implementing beta program (need "Beta" role)
- NOT needed for MVP (user-scoped data sufficient)

**Decision Criteria:**
- Need to differentiate user permissions
- Need admin access to system features
- Need premium/free tier distinction
- Need content moderation capabilities

---

## Sprint 7+: User-Facing Features

**Theme:** Enhanced user experience and social features
**Timeline:** Ongoing
**Dependencies:** Core functionality stable in production

---

### Story 7.1: Multi-Category System with User-Defined Categories
**Priority:** MEDIUM
**Effort:** Medium (1 week)
**Type:** Feature Enhancement

**User Story:**
> As a user, I want to create my own categories and assign multiple categories to recipes so I can organize my collection my way.

**Scope:**
- User-defined category creation/management
- Multi-select categories per recipe
- Migration from `category: string` to `categories: string[]`
- Backend `user_categories` table
- Frontend category management UI

**Acceptance Criteria:**
- [ ] Users can create custom categories
- [ ] Recipes support multiple categories
- [ ] Category filter shows user's categories
- [ ] Migration preserves existing single-category data

**Files to Create:**
- Backend: `Entities/UserCategory.cs`
- Backend: `Controllers/CategoriesController.cs`
- Frontend: `screens/settings/ManageCategoriesScreen.tsx`

---

### Story 7.2: User Profile Enhancements
**Priority:** LOW
**Effort:** Small
**Type:** User Experience

**Features:**
- Profile avatar upload (Azure Blob Storage)
- Bio/description field
- Public profile URL (optional)
- Recipe count statistics

---

### Story 7.3: Change Password (While Logged In)
**Priority:** MEDIUM
**Effort:** Small
**Type:** Security

**Scope:**
- Change password screen in settings
- Requires current password verification
- Revoke all refresh tokens on password change
- Email confirmation sent

---

### Story 7.4: Delete Account (GDPR Compliance)
**Priority:** MEDIUM
**Effort:** Medium
**Type:** Compliance

**Scope:**
- Account deletion endpoint
- Delete user data and associated recipes
- Export user data before deletion (GDPR right to data portability)
- Confirmation dialog with password verification
- 30-day grace period (mark as deleted, purge after 30 days)

**Why Important:**
- GDPR requirement for European users
- Builds trust with privacy-conscious users

---

### Story 7.5: Social Authentication (Google, GitHub)
**Priority:** LOW
**Effort:** Medium
**Type:** User Experience

**Scope:**
- OAuth 2.0 integration with Google and GitHub
- Link social accounts to existing users
- Simplified registration flow

---

### Story 7.6: Recipe Sharing & Collaboration
**Priority:** LOW
**Effort:** Large
**Type:** Social Feature

**Scope:**
- Share recipe via public link
- Collaborate on recipes (shared editing)
- Recipe collections (curated lists)
- Social features (likes, comments)

---

### Story 7.7: Advanced Recipe Features
**Priority:** LOW
**Effort:** Large
**Type:** Feature Enhancement

**Features:**
- Ingredients as separate entity with quantities
- Recipe scaling (adjust servings)
- Cooking timers
- Step-by-step mode
- Recipe import from URL
- Multi-image support per recipe
- Video/GIF support for cooking steps
- Nutritional information tracking
- Recipe rating and reviews

---

## Technical Debt & Code Quality (Ongoing)

### Testing
- [ ] E2E tests with Detox or Maestro
- [ ] Contract tests between frontend and backend
- [ ] Visual regression testing (Chromatic or Percy)
- [ ] Accessibility audit and automated testing

### DevOps
- [ ] Blue-green deployment strategy
- [ ] Automated rollback on deployment failures
- [ ] Staging environment with production parity
- [ ] Database migration rollback procedures
- [ ] Performance benchmarks in CI

### Code Quality
- [ ] Improve test coverage to 90%+
- [ ] Code quality metrics (SonarQube)
- [ ] Dependency vulnerability scanning
- [ ] Automated code review (CodeRabbit, Codacy)

---

## Archive: Completed Sprints

### Sprint 3: Recipe Management Demo ✅
- Complete CRUD functionality
- 110 tests passing
- Error boundary and offline detection
- Demo API protection (optional)

### Sprint 4: User Authentication & Management ✅
- Database schema with User table
- JWT authentication with refresh tokens
- Token revocation and security headers
- Frontend authentication (TokenService, auth interceptor)
- User-scoped recipe data
- Password reset flow
- Email verification (optional)

---

## Prioritization Framework

**Critical (Sprint 5):**
- Observability (cannot debug production without it)
- Performance (pagination for scale)

**Important (Sprint 6):**
- Infrastructure as Code (environment reproducibility)
- Load testing (understand bottlenecks)

**Nice-to-Have (Sprint 7+):**
- Social features
- Advanced security (2FA)
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
