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
With users in production, you need visibility into errors, performance bottlenecks, and usage patterns. These are non-negotiable for production SaaS applications in 2025.

---

### Story 5.1: Application Performance Monitoring (APM)
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

### Story 5.2: API Pagination
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

### Story 5.3: PWA Features (Optional)
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

### Story 5.4: Email Verification (If Deferred from Sprint 4)
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

### Story 6.3: Load Testing & Performance Benchmarks
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
