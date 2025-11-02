# Microsoft Entra External ID Research & Setup Guide

**📚 IMPLEMENTATION-READY REFERENCE**

**Status:** ✅ RESTRUCTURED & READY FOR USE
**Last Updated:** 2025-01-29 (Streamlined for Sprint 4 implementation)
**Purpose:** MVP decisions and step-by-step implementation guide for Microsoft Entra External ID

**Quick Start:** See [Executive Summary](#1-executive-summary-) for all MVP decisions

**Related Documents:**
- 📖 [Operations Guide](operations/entra-operations-guide.md) - Post-launch admin/customer account management, monitoring
- 📚 [Research Archive](archive/entra-research-archive.md) - Complete research history and decision rationale

---

## Table of Contents

1. [Executive Summary](#1-executive-summary-) 🎯 **START HERE - All MVP decisions**
2. [Architecture & Key Concepts](#2-architecture--key-concepts-)
3. [Implementation Parts](#implementation-parts) 📋 **STEP-BY-STEP SETUP GUIDE**
4. [Troubleshooting & Known Issues](#troubleshooting--known-issues-) ⚠️ **CRITICAL**
5. [Resources & Documentation](#resources--documentation)

**Related Documents:**
- 📖 [Operations Guide](operations/entra-operations-guide.md) - Post-launch procedures (admin/customer management, monitoring)
- 📚 [Research Archive](archive/entra-research-archive.md) - Complete research history and decision-making process

---

## 1. Executive Summary 🎯 **START HERE**

> **Quick Reference:** All key decisions, MVP scope, and critical information for Sprint 4 implementation.

### Platform Decision

**✅ CONFIRMED: Microsoft Entra External ID in External Tenants**

- **Category:** CIAM (Customer Identity and Access Management)
- **Status:** Microsoft's current platform for consumer-facing apps (2025)
- **Replaces:** Azure AD B2C (deprecated May 1, 2025 for new customers)
- **Architecture:** Completely new platform (NOT a rebrand of B2C)
- **Configuration:** Simplified portal-based setup (no custom policies needed)

---

### MVP Decisions Summary

#### ✅ Core Authentication Decisions

**Tenant Type:**
- ✅ **External Tenant** (consumer-facing apps)
- ✅ **Tenant Name:** `foodbudget` → Authority: `https://foodbudget.ciamlogin.com/`

**Authentication Methods:**
- ✅ **Email + Password** (primary local account method)
- ✅ **Social Providers:** Google, Facebook, Apple (all three enabled from Day 1)
- ✅ **Authentication Approach:** Standard MSAL (browser-based with in-app tabs)
- ❌ **NOT using:** Native authentication (React Native not supported, plus violates OAuth 2.0 standards)

**Rationale:**
- Browser-based is OAuth 2.0 standard (RFC 8252)
- 95%+ of production apps use this approach
- Social login increases conversions 20-40%
- In-app browser tabs (SFSafariViewController/Chrome Custom Tabs) provide seamless UX

#### ✅ User Data Collection

**Built-in Attributes:**
- ✅ **Email** (required for authentication)
- ✅ **Display Name** (user's name)
- ❌ **NOT collecting:** Given name, surname, address, job title, etc.

**Custom Attributes:**
- ❌ **NOT using Entra custom attributes**
- ✅ **Store app data in FoodBudget database** (dietary preferences, allergies, etc.)

**Rationale:**
- Minimize sign-up friction (faster conversions)
- Keep auth simple, store app data in app database
- Easier to query and manage in FoodBudget backend

#### ✅ Security Configuration

**Baseline Security (Automatic - Zero Config):**
- ✅ Brute force protection
- ✅ Network layer protection
- ✅ Account protection
- ✅ Access control

**MFA (Multifactor Authentication):**
- ❌ **NO MFA for MVP**
- ✅ **Rely on baseline security** (sufficient for MVP)
- ✅ **Email OTP available FREE** (can add post-MVP if needed)
- ❌ **SMS OTP costs money** (not recommended)

**Rationale:**
- Baseline security is enterprise-grade and automatic
- MFA adds friction (reduces conversions)
- Social providers handle their own MFA
- Can add Optional MFA post-MVP if needed

#### ✅ Branding & UX

**Visual Branding:**
- ✅ **Default:** Neutral branding (no Microsoft logos)
- ✅ **Customize:** FoodBudget logo, brand colors, favicon
- ✅ **Footer Links:** Privacy policy, terms of service
- ✅ **Configuration Method:** Portal-based (point-and-click)
- ❌ **NOT using:** Custom CSS (default options sufficient)

**Custom URL Domain:**
- ❌ **SKIP FOR MVP**
- ✅ **Use default:** `foodbudget.ciamlogin.com`
- ⚠️ **Cost savings:** ~$50-100/month (Azure Front Door)

**Rationale:**
- Default domain is acceptable (common OAuth 2.0 pattern)
- Can add custom domain post-MVP if branding critical
- Focus MVP budget on features, not infrastructure

#### ✅ Backend Integration

**Approach:**
- ✅ **Azure App Service Authentication (EasyAuth)** - PRIMARY
- ✅ **Platform-level auth** (no code in API needed)
- ✅ **Zero-config token validation**
- ✅ **User claims in HTTP headers** (`X-MS-CLIENT-PRINCIPAL`)

**API Framework:**
- ✅ **ASP.NET Core Web API**
- ✅ **Microsoft.Identity.Web** (if needed for advanced scenarios)
- ✅ **Authority URL:** `https://foodbudget.ciamlogin.com/`

#### ✅ Mobile Implementation

**Framework:**
- ✅ **React Native + Expo**
- ✅ **MSAL React Native package** (standard browser-based auth)
- ⏸️ **Package name TBD** (pending React Native docs research)

**Authentication Flow:**
- ✅ **Authorization Code + PKCE** (OAuth 2.0 standard)
- ✅ **Browser-based redirect** (in-app browser tabs)
- ✅ **Supports all auth methods** (email, social providers)

---

### Deferred Features (Post-MVP)

**❌ NOT implementing for MVP:**

| Feature | Why Deferred | When to Add | Effort |
|---------|--------------|-------------|--------|
| **Custom URL Domain** | Not essential, costs $50-100/month | Before major marketing | 7-11 hours |
| **Custom Authentication Extensions** | Adds complexity, requires REST APIs | When need promo code validation | 16-32 hours |
| **MFA (Email OTP)** | Reduces conversions, baseline security sufficient | If users request or security audit | 4-8 hours |
| **Native Authentication** | React Native not supported, violates OAuth 2.0 | N/A (not recommended) | N/A |
| **Custom Attributes in Entra** | Easier to store in FoodBudget DB | N/A (keep in app DB) | N/A |

---

### Cost Summary

**Microsoft Entra External ID:**
- ✅ **FREE for first 50,000 MAU** (Monthly Active Users)
- ✅ **$0 cost for MVP development and launch**
- ✅ **$0 cost until 50K active users/month**
- ⚠️ **Add-ons cost extra:** SMS MFA, custom domains (NO free tier)

**Cost Avoidance (MVP):**
- ✅ **No custom URL domain:** Save ~$50-100/month
- ✅ **No SMS MFA:** Save per-message costs
- ✅ **Use email OTP if MFA needed:** FREE

**Estimated Runway:**
- 50,000 MAU likely = **12-24+ months** of growth runway
- Costs scale with success (only pay when user base grows)

---

### Critical Information

**URLs & Endpoints:**
- **Admin Center:** https://entra.microsoft.com
- **Authority URL:** `https://foodbudget.ciamlogin.com/`
- **Domain Format:** `<tenant-name>.ciamlogin.com` (replaces `b2clogin.com`)

**Key Terminology:**
- ✅ "External tenant" (NOT "B2C tenant")
- ✅ "Self-service sign-up flows" (NOT "user flows")
- ✅ `.ciamlogin.com` domain (NOT `.b2clogin.com`)
- ✅ CIAM = Customer Identity and Access Management

**Documentation:**
- Primary docs: https://learn.microsoft.com/en-us/entra/external-id/customers/
- Analyzed **24 documentation pages** (see Resources section)

---

### Implementation Readiness

**✅ Fully Ready:**
- Tenant setup process completely documented
- Social provider setup (Google, Facebook, Apple) fully documented
- Custom branding configuration documented (needs brand assets)
- Security configuration documented (baseline automatic, MFA decision: NO)

**⏸️ Mostly Ready:**
- App registration (portal navigation clear, specifics from how-to guides)
- User flow configuration (2 decisions needed: name fields, terms checkbox)
- Backend API protection (App Service auth approach documented, integration details pending)

**⏸️ Needs Research:**
- Mobile authentication (approach confirmed, package name pending)

**Current Blockers:**
- ⚠️ **React Native MSAL package name** (pending React Native docs research)
- ⚠️ **App Service auth + ASP.NET Core details** (pending how-to guides)

---

### Next Steps

**Before Implementation:**
1. ✅ Research phase complete (24 docs analyzed)
2. ⏸️ **Continue to how-to guides** (implementation details)
3. ⏸️ Find React Native MSAL package specifics
4. ⏸️ Find App Service auth + ASP.NET Core integration details

**For Sprint 4 Kickoff:**
1. Gather brand assets (logo, colors, privacy/terms URLs)
2. Decide: Include given name/surname in sign-up? (recommend: NO)
3. Decide: Include terms/privacy checkbox in sign-up? (recommend: YES)

---

## 2. Architecture & Key Concepts ✅ COMPLETE

### What We Know

**Product:** Microsoft Entra External ID in External Tenants
**Category:** CIAM (Customer Identity and Access Management)
**Status:** Microsoft's current platform for consumer-facing apps (2025)

### Azure AD B2C is Deprecated

> **As of May 1, 2025**, Azure AD B2C is **no longer available for new customer purchases**. External ID in an external tenant serves as the modern replacement for consumer identity scenarios.

**Source:** [Microsoft Entra External ID Overview](https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview)

**Impact:**
- ❌ Do NOT use Azure AD B2C for new projects
- ✅ Use External ID in external tenants instead
- ✅ Existing B2C tenants continue to work (legacy support)

---

### External Tenants vs Workforce Tenants

Microsoft Entra External ID has TWO distinct configurations:

| Aspect | **External Tenant** (Us) | **Workforce Tenant** (Not Us) |
|--------|-------------------------|-------------------------------|
| **Purpose** | Consumer/customer-facing apps | Employee + B2B partner collaboration |
| **Users** | Customers, consumers | Employees + external guests |
| **Directory** | Separate from organization | Same directory as employees |
| **SSO Scope** | Only apps registered in external tenant | All Microsoft Entra connected apps (M365, etc.) |
| **Branding** | Neutral default, fully customizable per app | Default Microsoft branding |
| **Use Case** | Mobile app sign-up for consumers | Partner accessing company SharePoint |
| **Our Project** | ✅ **THIS IS US** | ❌ Not our use case |

**Decision:** We need an **external tenant** for FoodBudget (consumer mobile app).

---

### Confirmed Features

Based on Microsoft documentation, external tenants provide:

✅ **Self-service sign-up flows** - Define sign-up steps and authentication methods
✅ **Custom branding** - Backgrounds, logos, colors for sign-in experiences
✅ **Multiple authentication methods**:
- Email + password
- Email + one-time passcode (OTP)
- SMS-based MFA
- Social identity providers (Google, Facebook, Apple)

✅ **User management** - Separate from employee directories
✅ **User analytics** - Activity and engagement tracking
✅ **Conditional Access** - Enhanced security policies
✅ **Microsoft Graph API** - Automation and integration
✅ **Multitenant support** - If needed for SaaS scenarios

---

### External Tenant Isolation & Separation

**Key Facts:**
- External tenant is **distinct and separate** from workforce tenants
- Completely independent from any existing Microsoft 365/Entra ID setup
- Different directory, different users, different management
- Purpose-built specifically for CIAM scenarios

**Benefits for FoodBudget:**
- ✅ No risk of mixing customer accounts with business accounts
- ✅ Independent configuration and security policies
- ✅ Clean separation of concerns
- ✅ No conflicts with existing Azure/Microsoft 365 subscriptions

**Source:** [Tenant Configurations](https://learn.microsoft.com/en-us/entra/external-id/tenant-configurations)

---

### Default User Permissions (Security Architecture)

**Customer users in external tenants have restricted permissions by default:**

✅ **What Users CAN Do:**
- Read and update their own profile (through app profile management)
- Change their own password
- Sign in with local or social accounts
- Access applications and revoke consent
- Update profile fields: displayName, email, city, country, jobTitle, phone, etc.

❌ **What Users CANNOT Do:**
- ❌ **Access information about other users** (enforced by platform)
- ❌ Access information about groups or devices
- ❌ View other customers' data
- ❌ Perform administrative operations

**Source:** [User Permissions Reference](https://learn.microsoft.com/en-us/entra/external-id/customers/reference-user-permissions)

---

### ✅ FoodBudget Architecture Validation

**This confirms our user-scoped data model is correct:**

**FoodBudget Approach:**
- Extract `userId` from JWT access token
- Filter all database queries by `userId`
- Each user accesses only their own recipes, grocery lists, meal plans

**Entra Default Security:**
- Users automatically restricted from accessing other users' information
- No cross-user visibility at identity platform level
- Built-in isolation enforced by Microsoft Entra

**Result:**
✅ **Double-layer security** - Both identity platform AND application layer enforce user isolation
✅ **No additional permission logic needed** - Default restrictions align with app requirements
✅ **Profile management supported** - Users can self-service update their display name, email

**Key Takeaway:** Your architecture follows security best practices and aligns perfectly with Entra External ID's default permission model.

---

### Service Limits & Quotas

**Critical capacity and rate limits for external tenants:**

#### Request Rate Limits ⚠️

| Tenant Type | Requests/Second | Notes |
|-------------|-----------------|-------|
| **Trial Tenant** | 20 req/sec | ⚠️ Very restrictive |
| **Production Tenant** | 200 req/sec | 10x higher than trial |
| **Per IP Address** | 20 req/sec | Applies across all tenants |

**Token Issuance Consumption:**
- Sign-up: 6 requests per user
- Sign-in: 4 requests per user
- Password reset: 4 requests per user

**Throughput Calculation:**
```
Trial Tenant: 20 req/sec ÷ 4 = ~5 sign-ins/second
Production Tenant: 200 req/sec ÷ 4 = ~50 sign-ins/second
```

#### Capacity Limits

| Limit Type | Trial | Production |
|------------|-------|------------|
| **User/Object Limit** | 10,000 (hard) | 300,000 (soft, extendable) |
| **Tenants per Subscription** | 20 | 20 |

#### Configuration Limits (All Generous for MVP)

| Resource | Limit |
|----------|-------|
| Custom attributes per user | 100 |
| Redirect URLs per app | 100 |
| Scopes per application | 1,000 |
| Authentication extensions | 100 |
| Custom extension timeout | 2,000 ms |

**Source:** [Service Limits Reference](https://learn.microsoft.com/en-us/entra/external-id/customers/reference-service-limits)

---

#### Pricing & Cost Analysis

**Production Tenant: FREE for FoodBudget MVP** ✅

| Tier | Monthly Active Users (MAU) | Cost |
|------|---------------------------|------|
| **Free Tier** | First 50,000 MAU | **$0.00** |
| **Paid Tier** | 50,001+ MAU | $0.03/MAU (discounted to $0.01625/MAU until May 2025) |

**Requirements:**
- Must link external tenant to Azure subscription (for billing beyond 50K MAU)
- Billing based on unique users who authenticate per calendar month

**Source:** [External ID Pricing](https://learn.microsoft.com/en-us/entra/external-id/external-identities-pricing)

**Implication for FoodBudget:**
✅ **No cost penalty** for using production tenant during development, staging, or initial launch
✅ Can support up to 50,000 real users for free before any charges apply
✅ 10x higher rate limits (200 req/sec) with zero additional cost vs trial tenant

---

#### ✅ FoodBudget Decisions & Recommendations

**1. Tenant Strategy: Use Production Tenant** ✅ **DECISION MADE**

| Use Case | Tenant Type | Rationale |
|----------|-------------|-----------|
| Local development | Trial | Sufficient for unit testing (10K users, 20 req/sec) |
| Integration testing | **Production** | FREE, realistic limits (200 req/sec) |
| Staging environment | **Production** | FREE, matches production environment |
| Load testing | **Production** | FREE, can test up to 50 sign-ins/second |
| Production launch | **Production** | FREE for first 50K MAU |

**Benefits:**
- ✅ Same tenant from dev → staging → production (no migration needed)
- ✅ 10x higher rate limits (200 req/sec vs 20 req/sec)
- ✅ Zero cost until 50K monthly active users
- ✅ Can realistically load test authentication flow

---

**2. Per-IP Rate Limit: NOT a Blocker** ✅ **CONFIRMED**

**Why This Is Not a Problem:**

**Standard MSAL Architecture:**
- ✅ **React Native app → Entra External ID** (direct, client-side auth)
- ✅ Each user's mobile device has unique IP address
- ✅ 20 req/sec **per user device** is more than sufficient
- ✅ Backend only validates JWT tokens (no Entra API calls)

**Per-IP limit applies per user, not across all users** ✅

**Contrast with problematic architecture (NOT using):**
- ❌ Backend proxies all auth requests on behalf of users
- ❌ All requests from single App Service outbound IP
- ❌ Would hit 20 req/sec bottleneck for entire application

**Action Required:**
- 📋 **VERIFY** React Native MSAL uses standard client-to-Entra flow (when we review MSAL docs)
- 📋 **DOCUMENT** ASP.NET Core backend validates JWT, does not call Entra APIs

---

**3. Rate Limiting & Retry Logic: Best Practice** ✅ **IMPLEMENT**

**Recommended Implementation:**

**React Native App:**
- ✅ Implement exponential backoff for HTTP 429 responses (standard MSAL feature)
- ✅ Cache OpenID Connect metadata documents
- ✅ Token lifetime optimization (reduce total request count)

**ASP.NET Core Backend:**
- ✅ JWT validation only (no Entra API calls during request processing)
- ✅ Standard retry logic for any Graph API calls (user management, admin operations)

**Token & Session Optimization:**
- ✅ Increase access/refresh token lifetimes (recommended: 1 hour access, 90 days refresh)
- ✅ Enable "Keep Me Signed In" (KMSI) for web scenarios
- ✅ Result: Fewer sign-in flows = fewer Entra requests

---

**4. User Capacity Planning**

| Tenant Type | User Limit | Cost | Use Case |
|-------------|------------|------|----------|
| Trial | 10,000 (hard) | FREE | Local dev, unit tests |
| Production | 300,000 (soft) | FREE (first 50K MAU) | All other environments |

**Capacity Headroom:**
- ✅ 50,000 MAU free tier = **substantial runway** for MVP growth
- ✅ Can request limit increase via Microsoft Support if needed
- ✅ Cost scaling is predictable ($0.03/MAU beyond 50K)

---

### Key Terminology Changes

| B2C Term (OLD) | External ID Term (NEW) |
|----------------|------------------------|
| "User flows" | **"Self-service sign-up flows"** |
| B2C_1_signupsignin | ❓ TBD (different naming) |
| b2clogin.com | **ciamlogin.com** |
| "AzureAdB2C" config | **"AzureAd" config** |
| Azure AD B2C tenant | **External tenant** |

---

## 2. Critical Research Questions

### 🔴 Blocking Implementation

#### Question 1: React Native Support
**Status:** ✅ CONFIRMED BY USER - Package/docs research pending

**User Confirmation:** "React Native is supported. We are still going to the docs, we will get there."

**Questions:**
- ~~Is React Native officially supported for external tenants?~~ ✅ YES (confirmed)
- Which MSAL package? `@azure/msal-react-native`? `react-native-msal`?
- Where are the official code samples/documentation?
- Configuration details (authority URL, redirect URIs, etc.)
- Any known limitations or differences?

**Why Critical:** Cannot proceed with mobile authentication implementation without package name and configuration details.

**What We Know:**
✅ **React Native IS supported** (user confirmed)
✅ Mobile apps supported with Authorization Code + PKCE flow
✅ Authority URL format: `https://<tenant-name>.ciamlogin.com/`
✅ JavaScript/React (SPA) samples exist in Microsoft docs
❓ React Native specific documentation location TBD
❓ MSAL React Native package name and version TBD

**"Native Authentication" Clarification:**
✅ **"Native Authentication" = Custom in-app UI approach** (alternative, advanced)
✅ **FoodBudget will use Standard MSAL** (browser-based, recommended)
✅ "Native authentication" NOT supported for React Native (doesn't matter - we're using standard MSAL)
✅ Standard MSAL React Native package exists for browser-based authentication

**Next Steps:**
- Continue through Microsoft documentation guides (will encounter React Native docs)
- Find MSAL React Native package name and npm location
- Document configuration examples
- Find redirect URI format for React Native/Expo

**Research Strategy:** Following Microsoft guides in order, will reach React Native documentation

---

#### Question 2: Backend Configuration Format
**Status:** ⏳ PARTIAL - Token claim names still need verification

**Questions:**
- ~~What's the exact `appsettings.json` structure for external tenants?~~ ✅ ANSWERED
- ~~What's the Instance URL format?~~ ✅ ANSWERED
- ~~What's the Authority URL format?~~ ✅ ANSWERED
- Are token claim names the same? (oid, emails, name)

**What We Know:**
✅ Config section name: `"AzureAd"` (NOT `"AzureAdB2C"`)
✅ SDK: `Microsoft.Identity.Web`
✅ **Authority URL format:** `https://<tenant-name>.ciamlogin.com/`
✅ **Example for FoodBudget:** `https://foodbudget.ciamlogin.com/`
✅ Scope configuration structure:
```json
"Scopes": {
  "Read": ["Recipe.Read", "Recipe.ReadWrite"],
  "Write": ["Recipe.ReadWrite"]
},
"AppPermissions": {
  "Read": ["Recipe.Read.All", "Recipe.ReadWrite.All"],
  "Write": ["Recipe.ReadWrite.All"]
}
```

✅ Basic `appsettings.json` structure:
```json
{
  "AzureAd": {
    "Instance": "https://<tenant-name>.ciamlogin.com/",
    "TenantId": "[Tenant GUID from admin center]",
    "ClientId": "[Application ID from app registration]",
    "Audience": "[API identifier URI]"
  }
}
```

**What We Still Need:**
- ❓ Token claim names verification (oid, emails, name)
- ❓ TenantId GUID format/location in portal
- ❓ ClientId registration process

**Source:** [ASP.NET Core Web API Tutorial](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-build-app) + [Supported Features](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-supported-features-customers)

---

#### Question 3: Self-Service Sign-Up Flows
**Status:** ⏸️ PARTIALLY ANSWERED - Guided setup documented, manual creation TBD

**Questions:**
- ~~How are "self-service sign-up flows" configured?~~ ⏸️ PARTIAL (automated via guided setup)
- Is it similar to B2C "user flows" or completely different?
- How many flows do we need? (sign-in, password reset, email verification)
- What's the naming convention? (B2C used `B2C_1_*` prefix)
- How do we reference flows in backend config?

**What We Know:**
✅ Called "self-service sign-up flows" (official terminology)
✅ **Guided setup creates flows automatically** (documented in Section 6)
✅ **Authentication method options:** Email + Password OR Email + OTP
✅ **Branding customization:** Logo, colors, layout configurable
✅ **Custom attributes:** Can collect during sign-up
✅ **Tenant limit:** Up to 10 user flows per tenant
✅ **Token claims:** Configurable per flow

**What We Still Need:**
- ❓ Manual flow creation process (beyond guided setup)
- ❓ Naming conventions for flows
- ❓ How backend config references specific flows
- ❓ How to create separate flows for password reset, email verification
- ❓ Difference between combined sign-up/sign-in vs separate flows

**Next Steps:**
- Find user flow manual creation documentation
- Understand flow naming and referencing
- Document password reset and email verification flow setup

**Source:** [Quickstart: Get Started Guide](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-get-started-guide)

---

### 🟡 High Priority

#### Question 4: Pricing Model
**Status:** ✅ ANSWERED - Excellent news for FoodBudget!

**Key Findings:**

✅ **Free Tier:** First **50,000 MAU (Monthly Active Users)** are **FREE**
- This is extremely generous for MVP and early growth
- FoodBudget can operate at zero cost until reaching 50K active users per month

✅ **Billing Model:** Monthly Active Users (MAU)
- Counts unique external users who authenticate within a calendar month
- For external tenants: ALL users count (consumers, guests, admins)
- Only charged for users who actually authenticate that month

✅ **Paid Tier:** Available for apps exceeding 50,000 MAU
- Specific per-MAU pricing: See [External ID Pricing](https://aka.ms/ExternalIDPricing)
- Scalable pricing model as user base grows

**Impact on FoodBudget:**
- 🎉 **Zero authentication costs for MVP and early growth**
- 🎉 **No urgency to implement alternative auth solutions**
- 🎉 **Can focus on features rather than auth infrastructure costs**
- 📊 **50,000 MAU threshold provides substantial runway before any costs**

**Questions Answered:**
- ✅ Is there a free tier? **YES - 50,000 MAU free**
- ✅ MAU pricing structure? **Yes, unique authenticating users per month**
- ✅ Hidden costs? **None identified in core offering**
- ⏳ Exact B2C cost comparison? **Need to check pricing link for specifics**

**Source:** [External ID Pricing Documentation](https://learn.microsoft.com/en-us/entra/external-id/external-identities-pricing)

**Why Important:** This confirms Entra External ID is cost-effective for FoodBudget's MVP and growth phases

---

#### Question 5: Token Claims
**Status:** ⏳ PARTIAL - Need verification

**Questions:**
- User ID claim: Still `oid` (Object ID)?
- Email claim: Still `emails` (plural, array format)?
- Display name claim: Still `name`?
- Any new claims specific to external tenants?
- Do we still need fallback claim names?

**What We Know (from B2C, needs verification):**
```csharp
// User ID extraction (B2C pattern)
var entraUserId = User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
    ?? User.FindFirst("oid")?.Value
    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

// Email (B2C uses "emails" plural)
var email = claims.FirstOrDefault(c => c.Type == "emails")?.Value;

// Display name
var displayName = claims.FirstOrDefault(c => c.Type == "name")?.Value;
```

**Need to verify:** Are these claim names the same in external tenants?

---

#### Question 6: Tenant Creation Process
**Status:** ✅ ANSWERED - Complete documentation in Section 6

**What We Know:**
✅ Portal URL: https://entra.microsoft.com
✅ Must use Entra admin center (not Azure Portal)
✅ **Complete 5-step process documented** (see Section 6)
✅ **Prerequisites:** Azure subscription + Tenant Creator role
✅ **Navigation:** Entra ID → Overview → Manage tenants → Create
✅ **Configuration requirements:**
  - Tenant Name (changeable)
  - Domain Name (PERMANENT - becomes `<name>.ciamlogin.com`)
  - Location (PERMANENT - geographic data storage)
  - Subscription and Resource Group
✅ **Creation time:** Up to 30 minutes
✅ **Post-creation:** Optional guided setup wizard available
✅ **What gets created:** Tenant ID (GUID), domain, admin account, empty user directory

**Remaining Questions:**
- ❓ How to register mobile app after tenant creation (will research in app registration docs)
- ❓ Redirect URI format (will research in mobile app docs)

**Status:** Question 6 marked as ANSWERED - tenant creation process fully documented

**Source:** [Quickstart: Tenant Setup](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup)

---

#### Question 7: Feature Availability in External Tenants
**Status:** ✅ MOSTLY ANSWERED - React Native specific support TBD
**Priority:** ✅ MAJOR PROGRESS (was 🟡 HIGH)

**What We Confirmed:**
✅ **Mobile apps supported** - "Public client (mobile & desktop)" applications explicitly supported
✅ **Authorization code + PKCE** - Standard secure mobile auth flow available
✅ **Social providers** - Apple, Facebook, Google ALL supported
✅ **Email/password + OTP** - Sign-up, sign-in, password reset, MFA all supported
✅ **ASP.NET Core backend** - Full OpenID Connect and OAuth 2.0 support
✅ **Custom attributes** - Can collect custom user data during sign-up
✅ **Custom branding** - Logos, colors, custom domains fully supported
✅ **Microsoft.Identity.Web** - Backend SDK explicitly supported
✅ **Authority URL format** - `https://<tenant-name>.ciamlogin.com/` confirmed

**What We Still Need to Verify:**
❓ **MSAL React Native package** - Compatibility with external tenants unknown
❓ **"Native authentication"** - What does this term mean? Is it MSAL RN?

**Features NOT Available (Good to Know):**
❌ Resource Owner Password Credentials flow (not needed - insecure anyway)
❌ ID Protection (advanced risk detection - not needed for MVP)
❌ Native auth doesn't support SSO (not a problem for single app like FoodBudget)
❌ Premium features during preview phase (unclear what's "preview")

**Source:** [Supported Features](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-supported-features-customers)

**Impact on FoodBudget:**
- ✅ **ALL planned features ARE supported**
- ✅ Social sign-in (Apple, Google) confirmed - App Store requirement met
- ✅ Backend integration fully supported
- ✅ Email verification, password reset, MFA all available
- ❓ **CRITICAL BLOCKER:** Need to verify React Native SDK specifically

**New Questions Raised:**
- ❓ What is "native authentication for mobile applications"?
- ❓ Is MSAL React Native included in "native authentication"?
- ❓ Should we search for "native authentication" documentation?
- ❓ What features require "premium" license and are those blocked?

---

## 2.5. Microsoft's Official Planning Framework 🗺️

**Source:** [Planning Your External ID Solution](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-planning-your-solution)

**Purpose:** Microsoft's strategic planning framework for implementing Entra External ID CIAM solutions. This provides the recommended implementation sequence and key decision points.

---

### Four Implementation Phases

Microsoft recommends a sequential 4-phase approach for implementing External ID:

#### **Phase 1: Create External Tenant** 🏗️

**What:**
- Establish dedicated customer identity infrastructure
- Separate directory from workforce tenant
- Geographic location selection
- Domain name selection

**Key Decisions:**
- ⚠️ **Geographic location** (PERMANENT - cannot be changed)
- ⚠️ **Domain name** (PERMANENT - becomes `<name>.ciamlogin.com`)
- Azure subscription to link
- Resource group configuration

**FoodBudget Mapping:**
- ✅ **Tenant Setup**
- **Status:** ✅ Fully documented in Section 6
- **Decisions Made:**
  - Tenant Name: "FoodBudget Customers"
  - Domain: "foodbudget" → `foodbudget.ciamlogin.com`
  - Location: Based on primary user geography

---

#### **Phase 2: Register Your Application** 📝

**What:**
- Establish trust relationship between app and Entra ID
- Configure application (client) IDs
- Platform-specific configurations
- Obtain client secrets

**Key Decisions:**
- How many app registrations? (Mobile app + API?)
- Redirect URIs for mobile app
- Scopes and permissions
- API identifier URI

**FoodBudget Mapping:**
- ⏸️ **App Registration**
- **Status:** ⏸️ Needs research
- **Decisions Needed:**
  - Register mobile app (React Native)
  - Register API (or use App Service auth auto-registration)
  - Configure redirect URIs
  - Define API scopes

**What We Need to Research:**
- [ ] Step-by-step app registration for mobile app
- [ ] Platform configuration (iOS/Android)
- [ ] Redirect URI format for React Native
- [ ] Whether App Service auth auto-registers API app

---

#### **Phase 3: Integrate Sign-In Flow** 🔐

**What:**
- Create user flows (up to 10 per tenant)
- Define custom attributes to collect
- Configure token claims
- Connect apps to user flows

**Key Decisions:**
- How many user flows needed?
- Built-in vs custom attributes?
- Which attributes to collect during sign-up?
- Token claim requirements?

**FoodBudget Mapping:**
- ⏸️ **User Flow Configuration**
- **Status:** ⏸️ Partially documented (via guided setup)
- **Likely Decisions:**
  - **One user flow:** Combined sign-up/sign-in
  - **Built-in attributes:** Email, display name
  - **Custom attributes (maybe):** Dietary preferences, allergies
  - **Token claims:** User ID (oid), email, name

**What We Need to Research:**
- [ ] Detailed user flow creation process
- [ ] Custom attribute definition
- [ ] Email verification configuration
- [ ] Password reset flow setup

---

#### **Phase 4: Customize and Secure Sign-In** 🎨🔒

**What:**
- Add company branding
- Configure identity providers
- Enable MFA
- Add custom authentication extensions

**Key Decisions:**
- Which identity providers to enable?
- MFA requirements?
- Custom authentication extensions needed?
- Custom domains?

**FoodBudget Mapping:**

**Social Provider Setup**
- **Status:** ⏸️ Needs research
- **Decisions:**
  - ✅ Enable Google (Android users)
  - ✅ Enable Facebook (broad user base)
  - ✅ Enable Apple (iOS requirement)

**Custom Branding**
- **Status:** ⏸️ Partially documented (via guided setup)
- **Decisions:**
  - Upload FoodBudget logo
  - Apply brand colors
  - Customize sign-in layout

**Security Configuration**
- **Status:** ⏸️ Needs research
- **Decisions:**
  - ❓ MFA required or optional? (Optional for MVP?)
  - ❓ Custom authentication extensions? (Not for MVP)
  - ❓ Conditional Access policies? (Not for MVP)

---

### Additional Implementation Considerations

**Not Explicitly in Microsoft's 4 Phases:**

**Phase 2.5: Backend API Protection** 🛡️
- **Backend API Protection**
- **Status:** ⏸️ Partially documented (App Service auth)
- **FoodBudget Specific:** Use App Service Authentication (EasyAuth)
- **Critical Questions:** Need to answer 6 questions about implementation

**Phase 2.5: Mobile Authentication** 📱
- **Mobile Authentication**
- **Status:** 🚨 BLOCKED - React Native MSAL compatibility unknown
- **FoodBudget Specific:** React Native + Expo mobile app
- **Critical Blocker:** MSAL React Native package compatibility

**Phase 5: User Management** 👥
- **User Management**
- **Status:** ⏸️ Needs research
- **Considerations:** Admin roles, account blocking, user data access

**Phase 6: Testing & Validation** ✅
- **Testing & Validation**
- **Status:** ⏸️ Needs research
- **Considerations:** End-to-end testing, token validation, social provider testing

---

### Planning Framework Summary

| Microsoft Phase | FoodBudget Implementation | Status | Completion |
|-----------------|--------------------------|---------|------------|
| **Phase 1:** Create Tenant | Tenant Setup | ✅ Documented | 100% |
| **Phase 2:** Register App | App Registration | ⏸️ Needs Research | 20% |
| **Phase 3:** Sign-In Flow | User Flows | ⏸️ Partial | 40% |
| **Phase 4:** Customize & Secure | Social Providers<br>Branding<br>Security | ⏸️ Partial<br>⏸️ Partial<br>⏸️ Needs Research | 10%<br>40%<br>10% |
| **(Additional)** Backend | API Protection | ⏸️ Partial (6 questions) | 75% |
| **(Additional)** Mobile | Mobile Auth | 🚨 BLOCKED | 40% |
| **(Additional)** Management | User Management | ⏸️ Needs Research | 5% |
| **(Additional)** Testing | Testing | ⏸️ Needs Research | 5% |

---

### Key Decision Points for FoodBudget

Based on Microsoft's planning framework, we need to make these decisions:

#### **Architecture Decisions** ✅ COMPLETE
- ✅ External tenant (not workforce)
- ✅ Geographic location (based on users)
- ✅ Domain: `foodbudget.ciamlogin.com`

#### **Authentication Decisions** ⏸️ IN PROGRESS
- ❓ Number of user flows: **1** (combined sign-up/sign-in) - likely
- ❓ Custom attributes: Dietary preferences? Allergies? - needs discussion
- ❓ MFA: Required or optional? - **Optional for MVP** - likely

#### **Identity Provider Decisions** ✅ PLANNED
- ✅ Google (Android users)
- ✅ Facebook (broad appeal)
- ✅ Apple (iOS App Store requirement)

#### **Branding Decisions** ⏸️ IN PROGRESS
- ✅ FoodBudget logo and colors
- ❓ Custom domain (login.foodbudget.com)? - **Not for MVP** - likely
- ❓ Language customization? - **English only for MVP** - likely

#### **Security Decisions** ⏸️ NEEDS RESEARCH
- ❓ MFA configuration (email OTP)
- ❓ Custom authentication extensions - **Not for MVP** - likely
- ❓ Conditional Access policies - **Not for MVP** - likely

#### **Backend Decisions** ⏸️ PARTIALLY DECIDED
- ✅ App Service Authentication (EasyAuth) - **PRIMARY approach**
- ❓ Microsoft.Identity.Web - **Backup if needed**
- ❓ Need answers to 6 critical questions

#### **Mobile Decisions** 🚨 BLOCKED
- 🚨 React Native MSAL compatibility - **CRITICAL BLOCKER**
- ❓ Alternative: .NET MAUI if React Native unsupported
- ❓ Custom bridge to native MSAL if needed

---

### How This Framework Guides Our Research

**Microsoft's Planning Framework Helps Us:**

1. ✅ **Validates our story structure** - We're following the recommended sequence
2. ✅ **Identifies decision points** - Know what choices to make
3. ✅ **Prioritizes research** - Phase 1 complete, working on Phase 2-4
4. ✅ **Highlights gaps** - Shows what we still need to research

**What the Framework Doesn't Cover:**

Our research needs to go deeper because Microsoft's planning framework:
- ❌ Doesn't answer **React Native MSAL** compatibility (our critical blocker)
- ❌ Doesn't detail **App Service auth** implementation (our backend approach)
- ❌ Doesn't provide **tactical implementation steps** (strategic only)
- ❌ Doesn't include **code examples** or SDK details

**Next Steps Based on Framework:**

**Immediate Priority (Phase 2):**
1. ❗ **URGENT:** Verify React Native MSAL compatibility (mobile auth blocker)
2. ❗ Research app registration for mobile apps
3. ❗ Answer 6 critical questions about App Service auth

**Near-Term Priority (Phase 3):**
4. Research detailed user flow creation
5. Research custom attribute definition

**Later Priority (Phase 4):**
6. Research social provider setup
7. Research MFA configuration

---

### Alignment Check: FoodBudget vs Microsoft Planning

**✅ We're Following Best Practices:**

| Best Practice | FoodBudget Status |
|---------------|-------------------|
| Create tenant first | ✅ Planned first |
| Register apps before flows | ✅ Correct sequence |
| Define attributes early | ⏸️ Need to decide |
| Configure branding before flows | ⏸️ Can do in any order |
| Enable MFA for security | ⏸️ Planned for security config |
| Test with all identity providers | ✅ Planned for testing |

**⚠️ FoodBudget-Specific Additions:**

We've added implementation areas beyond Microsoft's framework because:
- **Backend API:** We have an ASP.NET Core API to protect
- **Mobile Auth:** We have React Native mobile app to integrate
- **User Management:** We need admin tooling
- **Testing:** We need comprehensive validation

---

### Summary: Strategic Framework for Implementation

**Microsoft's 4-Phase Framework:**
1. ✅ Create Tenant (Complete)
2. ⏸️ Register App (Needs research)
3. ⏸️ Integrate Sign-In (Partial)
4. ⏸️ Customize & Secure (Partial)

**FoodBudget-Specific Additions:**
5. ⏸️ Backend API Protection (Partial - 6 questions)
6. 🚨 Mobile Authentication (BLOCKED - React Native)
7. ⏸️ User Management (Needs research)
8. ⏸️ Testing & Validation (Needs research)

**This planning framework provides the strategic roadmap for our research and implementation.**

---


---

## 4. API/Backend Configuration ⏸️ IN PROGRESS

### Configuration Structure ✅ PARTIALLY CONFIRMED

Based on research findings, the structure for external tenants is:

```json
{
  "AzureAd": {
    "Instance": "https://<tenant-name>.ciamlogin.com/",
    "TenantId": "[GUID from Entra admin center]",
    "ClientId": "[Application ID from app registration]",

    // Scope configuration (confirmed)
    "Scopes": {
      "Read": ["Recipe.Read", "Recipe.ReadWrite"],
      "Write": ["Recipe.ReadWrite"]
    },

    // Application permissions (confirmed)
    "AppPermissions": {
      "Read": ["Recipe.Read.All", "Recipe.ReadWrite.All"],
      "Write": ["Recipe.ReadWrite.All"]
    }
  }
}
```

### Token Claims ⏸️ PARTIALLY DOCUMENTED

**Source:** [OIDC Claims Mapping Reference](https://learn.microsoft.com/en-us/entra/external-id/customers/reference-oidc-claims-mapping-customers)

**Status:** ⏸️ ID token claims documented, access token claims pending research

---

#### ✅ ID Token Claims (Confirmed)

Standard OpenID Connect claims available in **ID tokens**:

| Claim | Maps to Attribute | Description | FoodBudget Uses |
|-------|-------------------|-------------|-----------------|
| **`sub`** | N/A | **User identifier** - Primary end-user identifier | ✅ **Extract userId** |
| **`email`** | Email | Preferred email address (required) | ✅ Display email |
| **`name`** | Display Name | Full name in displayable form | ✅ Display name |
| `given_name` | First Name | Given name or first name(s) | ❌ Not collecting |
| `family_name` | Last Name | Surname or family name | ❌ Not collecting |
| `email_verified` | N/A | Boolean - email verification status | ✅ Validation |
| `phone_number` | Phone | User's phone number | ❌ Not collecting |
| `phone_number_verified` | N/A | Boolean - phone verification status | ❌ Not collecting |
| `street_address` | Street Address | Full mailing address | ❌ Not collecting |
| `locality` | City | City or locality | ❌ Not collecting |
| `region` | State/Province | State, province, or region | ❌ Not collecting |
| `postal_code` | ZIP/Postal Code | Zip code | ❌ Not collecting |
| `country` | Country/Region | Country name | ❌ Not collecting |

**Critical Notes:**
- ✅ **Email verification mandatory:** "If the email is missing or unverified, an error message appears"
- ✅ **Standard OIDC format:** Uses `email` (singular string), NOT `emails` (array) like Azure AD B2C
- ✅ **User identifier:** Use `sub` claim (subject), NOT `oid` (Object ID) from B2C

---

#### ❓ Access Token Claims (PENDING RESEARCH)

**What We Know:**
- Backend API validates **access tokens** (not ID tokens)
- Mobile app sends access token in `Authorization: Bearer` header
- Access token claims may differ from ID token claims

**What We Need to Find:**

**Question 1: Access Token Claim Structure**
- ❓ What claims are in access tokens (vs ID tokens)?
- ❓ Does access token include `sub` claim?
- ❓ Are there additional claims (`aud`, `scp`, `roles`, `oid`)?
- ❓ Is claim structure identical to ID tokens?

**Question 2: User Identifier in Access Tokens**
- ❓ Is `sub` present in access tokens?
- ❓ Is `oid` (Object ID) also present?
- ❓ Which claim should backend extract for `userId`?
- ❓ Are fallback claims needed (like B2C pattern)?

**Question 3: Email Claim Format**
- ❓ Is it `email` (single string) in access tokens?
- ❓ Any edge cases where it's an array?
- ❓ Different from B2C `emails` array format?

**Question 4: Standard JWT Claims for Validation**
- ❓ `aud` (audience) - expected value for FoodBudget API?
- ❓ `iss` (issuer) - expected value (e.g., `https://foodbudget.ciamlogin.com/`)?
- ❓ `exp` (expiration) - default token lifetime?
- ❓ `scp` (scopes) - delegated permissions format?
- ❓ `appid` or `azp` - client application identifier?

**Question 5: Custom Claims**
- ❓ Can we add custom claims to tokens later if needed?
- ❓ How would custom claims appear (claim name format)?
- ❓ Any limitations on custom claim names?

---

#### Suspected Backend Code Pattern (Needs Verification)

**Based on ID token claims and standard OAuth 2.0:**

```csharp
// User ID extraction - VERIFY THIS WORKS
var userId = User.FindFirst("sub")?.Value;  // Changed from "oid" (B2C) to "sub" (External ID)

// Email extraction - VERIFY FORMAT
var email = User.FindFirst("email")?.Value;  // Changed from "emails" (B2C array) to "email" (External ID string)

// Display Name
var displayName = User.FindFirst("name")?.Value;

// ⚠️ CRITICAL: Verify with actual access tokens during Sprint 4 implementation
```

**Differences from Azure AD B2C:**
- ❌ **OLD (B2C):** `oid` for user ID → ✅ **NEW (External ID):** `sub` for user ID
- ❌ **OLD (B2C):** `emails` (array) → ✅ **NEW (External ID):** `email` (string)
- ❌ **OLD (B2C):** Long claim URIs (`http://schemas.microsoft.com/...`) → ✅ **NEW (External ID):** Short OIDC claims (`sub`, `email`, `name`)

---

#### Next Steps

**Before Backend Implementation (Sprint 4):**
1. ❗ Find access token claims documentation (critical for API)
2. ❗ Verify `sub` claim is present in access tokens
3. ❗ Verify `email` claim format in access tokens (string, not array)
4. ❗ Document standard JWT claims for token validation (`aud`, `iss`, `exp`, `scp`)
5. ❗ Test with actual tokens to confirm claim structure

**Testing Plan:**
- Create test user via "Run user flow"
- Authenticate with mobile app (once MSAL configured)
- Decode access token using jwt.ms or jwt.io
- Verify claim names and structure match expectations
- Update backend code based on actual token structure

**⚠️ BLOCKER:** Cannot finalize backend claim extraction code until access token structure is verified

---

### Backend Authentication Approaches 🎯 CRITICAL FOR STORY 5

**Context:** FoodBudget API is deployed to **Azure App Service**

This fundamentally changes our backend authentication approach. Two options exist:

---

### ✅ PRIMARY APPROACH: App Service Authentication (EasyAuth)

**Source:** [Azure App Service Authentication with Entra External ID](https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service?toc=%2Fentra%2Fexternal-id%2Ftoc.json&bc=%2Fentra%2Fexternal-id%2Fbreadcrumb%2Ftoc.json&tabs=external-configuration)

**Status:** ⚠️ **PRIMARY for FoodBudget** (since API is on Azure App Service)

**What It Is:**
Azure App Service's built-in authentication feature ("EasyAuth") that handles authentication **at the platform level** with **no code required**. HTTP requests are intercepted and authenticated **before** reaching your application code.

---

#### How It Works

```
Mobile App                         Azure App Service
    │                                     │
    │ 1. User authenticates (MSAL)       │
    │ 2. Gets access token                │
    │                                     │
    │ 3. API request with token          │
    ├────────────────────────────────────>│
    │    Authorization: Bearer <token>    │
    │                                     │
    │                         ┌───────────┴──────────┐
    │                         │  App Service Auth    │
    │                         │  • Validates token   │
    │                         │  • No code needed    │
    │                         └───────────┬──────────┘
    │                                     │ Valid? ✓
    │                                     ↓
    │                         ┌───────────────────────┐
    │                         │  ASP.NET Core API     │
    │                         │  • Request arrives    │
    │                         │  • Already auth'd     │
    │                         └───────────────────────┘
    │                                     │
    │ 4. Response                         │
    │<────────────────────────────────────┤
```

---

#### Configuration Steps (Portal-Based)

**Step 1: Enable Authentication**
1. Azure Portal → Your App Service
2. Settings → Authentication
3. Click "Add identity provider"

**Step 2: Configure Identity Provider**
1. Select **Microsoft** as identity provider
2. Choose **External** tenant configuration
3. Select your external tenant (or create new)
4. Configure app registration (or create new)

**Step 3: Authentication Settings**
1. **Require authentication:** Yes
2. **Unauthenticated requests:** HTTP 302 Found redirect
3. **Token store:** Enable (recommended)
4. **Allowed token audiences:** Configure for your tenant

**Step 4: Save and Test**
- Configuration takes effect immediately
- No code deployment needed
- Test with authenticated requests

---

#### Benefits

✅ **Zero Code Required**
- No Microsoft.Identity.Web package needed
- No authentication code in Program.cs
- No `[Authorize]` attributes needed (maybe - see questions)

✅ **Platform-Managed**
- Azure handles token validation
- Microsoft manages security updates
- Built-in token store
- Battle-tested at scale

✅ **Simple Maintenance**
- No auth code to maintain
- Configuration via portal
- Less code = less bugs

✅ **External ID Support**
- Confirmed to work with external tenants
- Supports OAuth 2.0 bearer tokens
- Standard OIDC flows

---

#### Limitations

⚠️ **Azure App Service Only**
- Can't deploy elsewhere (AWS, on-premises)
- Locked into Azure hosting
- Platform dependency

⚠️ **Less Flexibility**
- Can't customize token validation logic
- Limited control over auth flow
- Platform dictates behavior

⚠️ **Configuration Over Code**
- Changes require portal access
- No version control for auth config
- Harder to test locally (requires App Service)

---

#### 🚨 CRITICAL QUESTIONS - NEED RESEARCH

**Question 1: Do you need `[Authorize]` attributes?**
- ❓ If App Service protects everything, are `[Authorize]` attributes needed?
- ❓ Or does "Require authentication" make them redundant?
- ❓ What happens to endpoints without `[Authorize]`?

**Question 2: Can you have public endpoints?**
- ❓ If "Require authentication" is ON, are ALL endpoints protected?
- ❓ Can you have anonymous endpoints (like health checks)?
- ❓ Is it all-or-nothing at the app level?
- ❓ Or can you selectively protect endpoints?

**Question 3: How do you access user identity?**
- ❓ How do you get user claims in your code?
- ❓ Does `User.Identity` still work?
- ❓ Does `User.FindFirst("oid")` work?
- ❓ Is there a different API for accessing auth info?
- ❓ Are claims automatically populated?

**Question 4: What about authorization (not just authentication)?**
- ❓ Can you use `[Authorize(Roles = "Admin")]`?
- ❓ How do you implement role-based access control?
- ❓ Does App Service auth only do authentication?
- ❓ Is authorization still your responsibility?

**Question 5: Local development?**
- ❓ How do you test locally without App Service?
- ❓ Do you need Microsoft.Identity.Web for local dev?
- ❓ Can you mock/bypass auth during development?

**Question 6: Mixed endpoint scenarios?**
```csharp
public class RecipesController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult GetPublicRecipes() // ❓ Can this be public?
    {
        return Ok(publicRecipes);
    }

    [HttpGet("my-recipes")]
    public IActionResult GetMyRecipes() // ❓ Automatically protected?
    {
        var userId = User.FindFirst("oid")?.Value; // ❓ This work?
        return Ok(myRecipes);
    }
}
```

---

#### Likely Scenarios (Need Confirmation)

**Scenario A: All-or-Nothing Protection**
- App Service auth protects ALL endpoints
- No `[Authorize]` attributes needed
- Can't have public endpoints
- User identity available via `User` object

**Scenario B: Authentication + Manual Authorization**
- App Service validates tokens (authentication)
- Your code checks claims/roles (authorization)
- `User` object populated automatically
- `[Authorize]` attributes may still work for routing

**Scenario C: Hybrid Approach**
- App Service auth can be bypassed for specific paths
- Mix of protected and public endpoints
- Need to configure in portal

---

#### What We Need to Research

**Priority 1: Code Access to User Identity**
- [ ] How to access user claims with App Service auth
- [ ] Verify `User.FindFirst()` works
- [ ] Find claim names for external tenant users
- [ ] Example code snippet

**Priority 2: Endpoint-Level Control**
- [ ] Can you use `[Authorize]` with App Service auth?
- [ ] How to have public + protected endpoints
- [ ] Configuration options in portal

**Priority 3: Local Development**
- [ ] How to develop/test locally
- [ ] Mock auth for development
- [ ] Integration testing approaches

**Priority 4: Authorization (not just authentication)**
- [ ] Role-based access control implementation
- [ ] Custom authorization policies
- [ ] Claims-based authorization

---

#### Impact on Backend API Protection

**What We Know:**
✅ App Service auth is the PRIMARY approach for FoodBudget
✅ No authentication code needed in API
✅ Configuration is portal-based
✅ Works with external tenants

**What We DON'T Know:**
❓ Whether `[Authorize]` attributes are needed/work
❓ How to access user identity in code
❓ How to implement authorization (roles/permissions)
❓ How to test locally

**Implementation Status:**
⏸️ **PARTIALLY DOCUMENTED** - Need answers to critical questions above before implementation

---

### Alternative: Microsoft.Identity.Web (In-App Authentication)

**Use Case:** If you move off Azure App Service OR need custom auth logic

**Configuration:**
```json
{
  "AzureAd": {
    "Instance": "https://foodbudget.ciamlogin.com/",
    "TenantId": "[Tenant GUID]",
    "ClientId": "[API App Registration ID]",
    "Audience": "[API identifier URI]"
  }
}
```

**Code (Program.cs):**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization();

app.UseAuthentication();
app.UseAuthorization();
```

**Controller:**
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMyRecipes()
    {
        var userId = User.FindFirst("oid")?.Value;
        return Ok(recipes);
    }
}
```

**Benefits:**
- ✅ Full control over auth logic
- ✅ Deploy anywhere (Azure, AWS, on-premises)
- ✅ Easy local development/testing
- ✅ Well-documented approach

**Trade-offs:**
- ❌ More code to write and maintain
- ❌ Manual token validation
- ❌ Security is your responsibility

**When to Use:**
- Moving off Azure App Service
- Need custom token validation
- Complex authorization requirements
- Want deployment flexibility

---

### Comparison: App Service Auth vs Microsoft.Identity.Web

| Aspect | App Service Auth | Microsoft.Identity.Web |
|--------|------------------|------------------------|
| **Code Required** | ❌ None | ✅ Yes (Program.cs, attributes) |
| **Deployment** | ⚠️ Azure App Service only | ✅ Anywhere |
| **Token Validation** | ✅ Automatic (platform) | ✅ Manual (your code) |
| **Local Development** | ⚠️ Harder (need App Service or mock) | ✅ Easy (standard ASP.NET Core) |
| **[Authorize] Attributes** | ❓ Unknown (need research) | ✅ Yes, standard ASP.NET Core |
| **User Claims Access** | ❓ Unknown (need research) | ✅ Yes, `User.FindFirst()` |
| **Configuration** | ✅ Portal-based | ✅ Code + appsettings.json |
| **Flexibility** | ⚠️ Limited | ✅ Full control |
| **Maintenance** | ✅ Platform managed | ⚠️ Your responsibility |
| **For FoodBudget** | ✅ **PRIMARY** (on App Service) | ⚠️ Alternative (if needed) |

---

### Recommendation for FoodBudget Backend API

**PRIMARY: App Service Authentication**

Since FoodBudget API is deployed to Azure App Service:
1. ✅ Use App Service auth (simpler, no code)
2. ✅ Configure via Azure Portal
3. ❓ **Research critical questions** (user claims, `[Authorize]`, etc.)
4. ✅ Implement after research completes

**Keep Microsoft.Identity.Web as backup:**
- If App Service auth doesn't support needed features
- If you want more control
- If you plan to move off Azure App Service

**Next Steps:**
1. ❗ Research answers to critical questions above
2. ❗ Find code examples of App Service auth + ASP.NET Core
3. ❗ Verify user claims access approach
4. ❗ Document findings before implementing backend API protection

---

## 5. Frontend/Mobile Configuration ⏸️ IN PROGRESS

### Mobile App Support Status: ✅ CONFIRMED

**Critical Update from Supported Features Research:**

✅ **Mobile applications ARE supported** in external tenants
✅ **Public client (mobile & desktop) applications** explicitly listed
✅ **Authorization Code flow with PKCE** available
✅ **"Native authentication for mobile applications"** mentioned as available

**Authority URL for Mobile Apps:**
```typescript
const authority = "https://<tenant-name>.ciamlogin.com/";
// Example for FoodBudget:
const authority = "https://foodbudget.ciamlogin.com/";
```

### React Native Support Status: ❓ PARTIALLY ANSWERED

**What We Confirmed:**
- ✅ Mobile apps in general ARE supported
- ✅ Authorization Code + PKCE flow is available
- ✅ Authority URL format confirmed

**What We Still Need:**
1. ❓ Does MSAL React Native package work with external tenants?
2. ❓ What is "Native authentication" - is this MSAL RN or something else?
3. ❓ MSAL package name, version, and configuration example
4. ❓ React Native-specific tutorial or sample code

**Likely Scenario: React Native Supported** ✅ (85% confidence)
- Mobile apps are explicitly supported
- Authorization Code + PKCE is the standard mobile auth flow
- MSAL packages exist for React Native
- Just need to confirm MSAL RN works with `ciamlogin.com` authority

**Unlikely Scenario: React Native Not Supported** ❌ (15% chance)
- Would be surprising given general mobile support
- If true, might need native Android/iOS implementation
- Or use web-based auth flow as fallback

**Next Research Steps:**
1. Search for "React Native" in Entra External ID docs
2. Search for "MSAL React Native" compatibility documentation
3. Find definition of "Native authentication" feature
4. Look for JavaScript/TypeScript mobile samples

---

## 6. Tenant Setup Process ✅ COMPLETE

**Status:** Complete portal-based creation guide documented

**Sources:**
- [Quickstart: Tenant Setup](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup)
- [How-To: Create External Tenant via Portal](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-create-external-tenant-portal)

**Key Information:**

### Part 1: Tenant Creation

**🚨 CRITICAL: Correct Portal Location**

**WRONG Portal:** ❌
- Azure Portal (portal.azure.com)
- External tenants CANNOT be created here
- Will not see "Create external tenant" option

**CORRECT Portal:** ✅
- **Microsoft Entra admin center**
- **URL:** https://entra.microsoft.com
- **Home page:** https://entra.microsoft.com/#home
- This is the ONLY place to create external tenants
- Different URL and interface from Azure Portal

**Source:** [Tenant Configurations](https://learn.microsoft.com/en-us/entra/external-id/tenant-configurations) - "External tenants can't be created via the Azure portal."

---

**What We Now Know:**
- ✅ Portal URL: https://entra.microsoft.com
- ✅ Home page: https://entra.microsoft.com/#home
- ✅ Complete step-by-step tenant creation process documented below

**Current Status:** ✅ COMPLETE - Full tenant creation guide documented

---

### Step-by-Step Tenant Creation Process ✅

**Source:** [Quickstart: Tenant Setup](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup)

#### Prerequisites

**Required:**
1. ✅ Active **Azure subscription**
2. ✅ Account with **"Tenant Creator" role** scoped to the subscription

**Verification:**
- Check Azure Portal → Subscriptions → Access Control (IAM) to verify role assignment
- If missing role, contact Azure subscription admin to assign it

---

#### Step 1: Navigate to Tenant Management

**Path:** Microsoft Entra admin center → **Entra ID** → **Overview** → **Manage tenants**

**URL:** https://entra.microsoft.com

**Details:**
- Log in with account that has Tenant Creator role
- Navigate to the "Manage tenants" section
- You'll see list of existing tenants (if any)

---

#### Step 2: Initiate Tenant Creation

**Action:** Click **"Create"** button

**Selection:** Choose **"External"** as the tenant type

**Important:**
- ✅ Select "External" NOT "Workforce"
- This determines tenant configuration (cannot be changed later)
- External = CIAM for customer-facing apps

**Trial vs. Subscription Options:**
- **30-Day Free Trial:** No Azure subscription required, quick evaluation
- **Use Azure Subscription:** Production setup, links to existing subscription (recommended for FoodBudget)

**Alternative Creation Method:**
- **Visual Studio Code Extension:** Microsoft Entra External ID extension can create trial or paid tenants directly from IDE
- **FoodBudget Approach:** Portal-based creation (this guide)

---

#### Step 3: Configure Basics Tab

**Required Information:**

1. **Tenant Name**
   - Display name for the tenant
   - Example: "FoodBudget Customers"
   - Used in admin portals and management
   - Can be changed later if needed

2. **Domain Name** ⚠️ CRITICAL
   - Subdomain for authentication
   - Example: "foodbudget"
   - Becomes: `foodbudget.ciamlogin.com`
   - **MUST be globally unique**
   - **Cannot be changed after creation**
   - Format: Lowercase letters, numbers, hyphens only
   - No spaces or special characters

3. **Location** ⚠️ PERMANENT
   - Geographic region for tenant data storage
   - Example: "United States", "Europe", "Asia"
   - **CRITICAL:** Cannot be changed after creation
   - Choose region closest to primary user base
   - Affects data residency and compliance

**Available Geo-Locations:**
   - Australia (⚠️ may not be available for external tenants)
   - Asia/Pacific
   - Europe, Middle East, and Africa (EMEA)
   - Japan (⚠️ may not be available for external tenants)
   - North America
   - Worldwide

**Data Residency Details:**
   - **Storage Architecture:** Data stored in scale units across 2+ Azure regions within selected geo-location
   - **Replication:** Replicated across physical datacenters for resilience
   - **Primary Data:** Stored in selected geo-location (authentication, IAM, device registration, provisioning)
   - **Exceptions:** MFA data may be stored in North America OR in geo-location
   - **Permanence:** Location cannot be changed after tenant creation (no migration option)

**Why This Matters:**
   - ✅ **Compliance:** Determines where customer data is physically stored
   - ✅ **Performance:** Data closer to users = lower latency
   - ✅ **Privacy Policy:** Must disclose data storage location to users
   - ✅ **GDPR/Regulations:** Important for data sovereignty requirements

**FoodBudget Context:**
   - **Target Users:** Primarily United States
   - **Data Type:** Recipe data (not financial, health, or government data)
   - **Compliance Needs:** No special data residency requirements
   - **GDPR:** US storage acceptable for recipe app (disclose in privacy policy)
   - **Privacy Policy:** Should state "User data stored in United States (North America)"

**Source:** [Data Residency Documentation](https://learn.microsoft.com/en-us/entra/fundamentals/data-residency)

**FoodBudget Decisions:**
- ✅ **Tenant Name:** "FoodBudgetExternal"
- ✅ **Domain Name:** "foodbudget" → `foodbudget.ciamlogin.com`
- ✅ **Location:** United States (North America geo-location)

---

#### Step 4: Configure Subscription Tab

**Required Information:**

1. **Azure Subscription**
   - Select the subscription to link tenant to
   - Used for billing (if you exceed 50,000 MAU)
   - Tenant must be linked to subscription

2. **Resource Group**
   - Choose existing or create new
   - Example: "FoodBudget-Auth" or "FoodBudget-Resources"
   - Logical grouping for Azure resources

3. **Resource Group Location**
   - If creating new resource group, select location
   - Can be different from tenant location
   - Best practice: Match tenant location

**FoodBudget Decisions:**
- ✅ **Subscription:** Use existing Azure subscription
- ⏸️ **Resource Group:** TBD (developer decision during implementation)
- ✅ **Location:** United States (match tenant location)

---

#### Step 5: Review and Create

**Action:** Review all configurations and click **"Create"**

**Process:**
- ⏱️ **Creation time:** Up to **30 minutes**
- Progress visible in **Notifications pane**
- Notification appears when complete
- Don't close browser during creation

**What Gets Created:**
- ✅ External tenant with unique Tenant ID (GUID)
- ✅ Domain: `<your-domain>.ciamlogin.com`
- ✅ Initial admin account (your account)
- ✅ Empty user directory ready for customers

---

#### Post-Creation: Access Your Tenant

**Access Methods:**

1. **Microsoft Entra admin center**
   - URL: https://entra.microsoft.com
   - Switch tenant: Click tenant switcher (top-right)
   - Select your new external tenant from list

2. **Azure Portal**
   - URL: https://portal.azure.com
   - Can also access tenant here
   - Same tenant switcher functionality

**Verify Tenant:**
- Check tenant name in top-right corner
- Verify domain name in Overview section
- Confirm tenant type is "External"

---

#### Post-Creation: Optional Guided Setup ✅ DETAILED

**Feature:** Built-in guided setup wizard ("Get Started Guide")

**Sources:**
- [Quickstart: Get Started Guide](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-get-started-guide) - Step-by-step walkthrough
- [Concept: Guide Explained](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-guide-explained) - Conceptual overview of what gets configured

**Access:** **Home** → **Tenant overview** → **"Start the guide"** on Get Started tab

**Time Estimate:** "Just a few minutes" - Complete functional setup

**What This Guide Does:** Automatically configures 7 core features:
1. **Tenant Setup** - Creates/configures external tenant
2. **App Registration** - Creates trusted app relationship with redirect URIs
3. **User Flow** - Defines authentication methods and sign-up/sign-in experience
4. **Branding** - Customizes sign-in pages with logos, colors, and layouts
5. **Sign-in Preview** - Tests authentication and creates test user accounts
6. **Authentication Methods** - Configures email+password or email+OTP with social providers
7. **App Samples** - Downloads pre-configured sample applications for testing

---

**Phase 1: Access the Guide**
- Switch to external tenant using Settings icon
- Navigate to Home → Tenant overview
- Select "Start the guide" button

**Phase 2: Choose Authentication Method** 🔑

Choose one:
- **Email + Password** - Traditional authentication
- **Email + One-Time Passcode** - Passwordless authentication

**Recommendation for FoodBudget:**
- Start with **Email + Password** (more familiar to users)
- Can enable OTP later for passwordless option

---

**Phase 3: Customize Branding** 🎨

Configure your customer-facing brand:
- **Upload company logo** - FoodBudget logo
- **Adjust background color** - Brand colors
- **Modify sign-in layout** - Customize appearance

**What Gets Configured:**
- ✅ Default branding for all auth pages
- ✅ Sign-up and sign-in page appearance
- ✅ Multi-language support (can customize later)

**Recommendation:**
- Use FoodBudget logo and brand colors
- Keep layout clean and simple
- Can refine branding later in full customization

---

**Phase 4: Create Test User** 👤

Test the authentication flow:
1. Click **"Run it now"** button
2. You're redirected to sign-up page
3. Click **"No account? Create one"**
4. Enter unique email address ⚠️ **NOT your admin email**
5. Complete sign-up flow (verify email if required)
6. Sign in with new account
7. View issued token on JWT.ms

**What This Tests:**
- ✅ Sign-up flow works correctly
- ✅ Email verification (if enabled)
- ✅ Authentication completes successfully
- ✅ Tokens are issued correctly

**Important Warning:**
- ⚠️ Don't use the same email you used to create the tenant
- Use a test email address for customer testing
- Admin account may require additional authentication factors

---

**Phase 5: Sample App Setup** 💻

Download and run a sample application:

**Step 1: Choose Application Type**
- Single Page Application (SPA)
- Web Application
- Desktop Application
- Mobile Application

**Step 2: Select Programming Language**

**Single Page Applications:**
- JavaScript
- React (for SPAs)
- Angular

**Web Applications:**
- Node.js (Express)
- ASP.NET Core ✅ **Relevant for FoodBudget backend**

**Desktop/Mobile:**
- .NET MAUI (cross-platform)

**Step 3: Download and Run**
- Download sample code
- Follow setup instructions
- Run application locally
- Test sign-in with test user

---

**⚠️ CRITICAL FINDING - React Native NOT Supported in Samples**

**What's Available:**
- ✅ React for **Single Page Applications** (web)
- ✅ .NET MAUI for **Desktop/Mobile** (cross-platform)
- ❌ **React Native NOT listed**

**This is the THIRD documentation source with no React Native mention:**
1. CIAM Overview - Only iOS/Android MSAL
2. Supported Features - Only "mobile apps" generically
3. Get Started Guide - Only React SPA and .NET MAUI

**Growing Concern:**
- 🚨 React Native may not have official Microsoft sample apps
- 🚨 React Native MSAL package may not be officially supported for External ID
- 🚨 May need to use .NET MAUI instead of React Native + Expo
- 🤔 Or React Native package exists but not documented in quickstarts

**Action Required:**
- ❗ **URGENT:** Search specifically for "React Native" + "MSAL" + "External ID"
- ❗ Check MSAL npm packages for React Native variants
- ❗ Determine if React Native is supported but undocumented, or truly unsupported

---

**What Gets Created by Guided Setup:**

1. **User Flow:**
   - Sign-up and sign-in flow automatically configured
   - Authentication method enabled (email+password or OTP)
   - Default settings applied

2. **Branding:**
   - Company logo uploaded
   - Background color set
   - Sign-in layout configured

3. **Test User:**
   - Sample customer account created
   - Working authentication verified
   - Token issuance confirmed

4. **Sample Application:**
   - Pre-configured app registration
   - Sample code downloaded (optional)
   - Working reference implementation

5. **JWT.ms Integration:**
   - Token validation endpoint configured
   - Ability to inspect tokens during testing

---

**Post-Completion Activities:**

**What You Can Do:**
- ✅ Access admin center for additional configuration
- ✅ Restart guide with different selections
- ✅ Configure external identity providers (Google, Facebook, Apple)
- ✅ Add custom attributes to user flows
- ✅ Further customize branding
- ✅ Migrate existing users (if any)

**Resource Cleanup:**
- Sample app registration can be deleted
- Test user can be deleted
- Keep branding if you like it
- User flows remain for production use

---

**Recommendation for FoodBudget:**

✅ **Do Run the Guided Setup:**
- Quick verification tenant works
- Familiarizes team with auth flows
- Creates working example
- Tests end-to-end flow
- Takes only a few minutes

✅ **Configuration Choices:**
- Authentication: Email + Password
- Branding: FoodBudget logo and colors
- Sample App: ASP.NET Core (to test backend)
- Test User: Create one to verify flows

⏭️ **After Guided Setup:**
- Delete sample app registration (or keep for reference)
- Keep test user for ongoing testing
- Proceed to create production app registrations
- Configure additional identity providers (Google, Facebook, Apple)

---

#### Alternative: VS Code Extension ⚠️ VS CODE ONLY

**Tool:** "Microsoft Entra External ID extension for Visual Studio Code"

**Source:** [VS Code Extension Documentation](https://learn.microsoft.com/en-us/entra/external-id/customers/visual-studio-code-extension)

**Status:** ⚠️ **NOT APPLICABLE TO FOODBUDGET** (We use WebStorm/JetBrains, not VS Code)

---

**What It Does:**

Optional VS Code extension that automates External ID setup **directly within the editor**:

1. **Automated Tenant Creation**
   - Create external tenants from VS Code
   - No need to navigate to Entra admin center
   - Same functionality as portal-based creation

2. **Auto-Configuration**
   - Automatically populates ClientId into config files
   - Automatically populates Authority URL
   - Eliminates manual copy-paste from portal

3. **Branding Customization**
   - Upload logos from VS Code
   - Configure colors and layouts
   - Apply branding without portal

4. **Sample App Setup**
   - Generate sample applications with pre-configured auth
   - Supported frameworks:
     - JavaScript, React (SPA), Angular
     - Node.js (Express)
     - ASP.NET Core ✅ (relevant for backend)
     - Python (Django, Flask)
     - Java (Servlet)
   - ❌ **React Native NOT mentioned** (consistent with other docs)

5. **Sign-In Preview**
   - Test authentication flow from IDE
   - JWT.ms integration for token inspection
   - Verify setup without deploying

6. **Direct Admin Center Access**
   - Jump to Entra admin center from extension
   - Manage resources via portal when needed

---

**Prerequisites:**
- Visual Studio Code installed
- Azure account OR free trial (no subscription required)
- Personal account, Microsoft account, or GitHub credentials

**Benefits:**
- ✅ Eliminates manual portal navigation
- ✅ Auto-populates configuration files
- ✅ Centralizes all tasks in code editor
- ✅ Faster prototyping and testing
- ✅ Reduces configuration errors

**Limitations:**
- ⚠️ VS Code only (no JetBrains/WebStorm equivalent)
- ⚠️ Tenant location still permanent decision
- ⚠️ Same framework support as portal (no React Native samples)
- ⚠️ Trial tenants have unspecified restrictions

---

**❌ JetBrains/WebStorm Equivalent:**

**DOES NOT EXIST:**
- ❌ No Microsoft Entra External ID extension for JetBrains IDEs
- ❌ No WebStorm-specific tooling for External ID development
- ❌ JetBrains "IDE Services" is **DIFFERENT** (enterprise auth to JetBrains platform, not for building apps)

**What This Means for FoodBudget:**

Since FoodBudget uses **WebStorm**, we **CANNOT** use the VS Code extension.

**Our Approach:**
1. ✅ Use **Entra admin center portal** (https://entra.microsoft.com) for all tenant setup
2. ✅ Manually configure authentication settings (we're documenting this)
3. ✅ Manual copy-paste of ClientId, Authority URL to config files
4. ✅ Continue using WebStorm for all development work
5. ✅ All functionality available via portal (extension is just convenience)

**Recommendation:**
- ✅ **Follow manual portal-based setup** (what we're documenting in this guide)
- ✅ VS Code extension is **optional** - not required for External ID
- ✅ Portal approach is fully supported and documented
- ✅ No WebStorm integration needed - works with any IDE/editor

---

**Why Document This?**

Even though we're not using VS Code:
- Shows what's possible with IDE tooling
- Confirms manual portal approach is standard
- Documents supported frameworks (still no React Native)
- Validates our research approach is comprehensive

---

#### Important Considerations

**Permanent Decisions:**
- ⚠️ **Domain Name** - Cannot be changed after creation
- ⚠️ **Tenant Location** - Cannot be changed after creation
- ⚠️ **Tenant Type (External)** - Cannot be changed to Workforce

**Can Be Changed Later:**
- ✅ Tenant display name
- ✅ Resource group (can move)
- ✅ Subscription (tenant can be transferred)
- ✅ All other configurations (user flows, branding, etc.)

**Best Practices:**
1. Choose domain name carefully (permanent)
2. Select location closest to users (permanent)
3. Run guided setup to verify tenant works
4. Document tenant ID and domain for team
5. Assign additional admin accounts if needed

---

**Summary for User Story Creation:**

For **Tenant Setup**, we now know:
- ✅ Exact navigation path in Entra admin center
- ✅ All required information (tenant name, domain, location)
- ✅ Prerequisites (Azure subscription, Tenant Creator role)
- ✅ Time estimate (up to 30 minutes)
- ✅ Post-creation verification steps
- ✅ Optional guided setup available
- ✅ What decisions are permanent vs changeable

**Current Status:** ⏳ IN PROGRESS - Tenant creation process fully documented

### Part 2: App Registration
- [ ] How to register mobile app
- [ ] Platform configuration (iOS/Android)
- [ ] Redirect URI format
- [ ] Permissions configuration

### Part 3: Self-Service Sign-Up Flows
- [ ] How to create sign-up/sign-in flow
- [ ] How to configure password reset flow
- [ ] How to configure email verification
- [ ] Flow naming conventions
- [ ] How backend references flows

### Part 4: Branding
- [ ] Logo upload
- [ ] Color customization
- [ ] Email template customization

### Part 5: Security Policies
- [ ] Password strength requirements
- [ ] Account lockout configuration
- [ ] Token lifetime settings
- [ ] MFA configuration

---

### [2025-01-29] FAQ - Frequently Asked Questions ✅ KEY CLARIFICATIONS

**Source:** https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers

**Purpose:** Official FAQ addressing common questions and clarifications about External ID

---

#### 🎯 Critical Clarifications

**Q: Is External ID just a rebrand of Azure AD B2C?**

**A: NO - External ID is a completely new CIAM platform**
- ✅ Built from the ground up as next-generation CIAM
- ✅ Different architecture and capabilities
- ✅ Simplified configuration (no custom policies needed)
- ⚠️ Not a simple rebrand or upgrade of B2C
- ✅ Migration paths will be provided for existing B2C implementations

**Impact for FoodBudget:**
- ✅ We're building on a modern platform (not legacy)
- ✅ Simpler configuration than B2C (good for MVP)
- ✅ Future-proof technology choice

---

#### 💰 Pricing & Billing

**Q: What's the pricing model?**

**A: Monthly Active Users (MAU) with generous free tier**
- ✅ **First 50,000 MAU completely FREE** (confirmed again)
- ✅ Only pay for users who actually authenticate each month
- ✅ Inactive users don't count toward limit
- ⚠️ **Add-ons have NO free tier** (SMS MFA, custom domains, etc.)
- ✅ Existing B2C subscriptions remain valid (no forced migration)

**Impact for FoodBudget:**
- ✅ Zero cost for MVP and early growth (confirmed)
- ⚠️ Custom URL domains add cost (~$50-100/month for Azure Front Door)
- ⚠️ SMS MFA adds per-message costs (use email OTP instead)

---

#### 🔐 Authentication & Features

**Q: What authentication methods are supported?**

**A: Comprehensive authentication options**
- ✅ Email + Password (local accounts)
- ✅ Email + One-Time Passcode (passwordless)
- ✅ Phone authentication via SMS (now available)
- ✅ Social providers: Facebook, Google, Apple
- ✅ Custom OIDC providers
- ✅ SAML/WS-Fed federation (enterprise)
- ✅ Microsoft Entra accounts (via invite)

**Cross-Reference:**
- ✅ Matches our authentication methods research (section on Authentication Methods)
- ✅ Confirms social providers we planned (Google, Facebook, Apple)
- ✅ Phone/SMS available but costs money (use email instead)

---

#### 📱 Mobile Development & MSAL

**Q: Does MSAL work for both workforce and customer scenarios?**

**A: YES - Unified MSAL library across scenarios**
- ✅ **Same MSAL code works for both workforce and external tenants**
- ✅ Simplifies cross-platform development
- ✅ Single authentication library for all Microsoft Identity scenarios
- ✅ No separate SDKs needed

**Q: What about "Native Authentication"?**

**A: Native authentication gives complete control over mobile UI**
- ✅ Enables **"complete control over the design of sign-in experience"**
- ✅ Create pixel-perfect custom screens in your app
- ✅ No browser redirects for authentication
- ⚠️ **BUT: React Native NOT supported** (confirmed in native auth docs)

**Impact for FoodBudget:**
- ✅ **Use Standard MSAL (browser-based)** - We already decided this
- ✅ MSAL React Native package exists for standard browser-based auth
- ❌ Native auth not an option (React Native not supported)
- ✅ Browser-based is industry standard anyway (95%+ of apps)

**Cross-Reference:**
- ✅ Confirms our decision to use Standard MSAL (browser-based)
- ✅ Confirms native auth limitations for React Native
- ✅ Aligns with industry standards research

---

#### 🔌 Backend Integration & Extensions

**Q: Can I integrate with external systems during authentication?**

**A: YES - Via custom authentication extensions**
- ✅ **Server-side integrations with external systems** supported
- ✅ Real-time API invocations during authentication flows
- ✅ Enables complex backend requirements
- ⚠️ Requires building and maintaining REST API endpoints

**Cross-Reference:**
- ✅ Matches our custom authentication extensions research
- ✅ Confirmed as advanced feature (skip for MVP)
- ✅ Available when needed post-MVP

---

#### ⚙️ Configuration & Setup

**Q: Do I need custom policies like in B2C?**

**A: NO - Custom policies are no longer needed**
- ✅ **Simplified configuration** in next-generation platform
- ✅ Portal-based configuration sufficient for most scenarios
- ✅ Custom policies eliminated for easier management
- ✅ Migration paths will be provided for existing B2C custom policies

**Impact for FoodBudget:**
- ✅ Simpler setup than legacy B2C (good for MVP)
- ✅ Portal-based configuration is enough
- ✅ No need to learn custom policy XML

---

#### 🌍 Availability & Regions

**Q: Is External ID available in government clouds?**

**A: Currently public clouds only**
- ✅ Available in public Azure clouds
- ❌ **NOT available in US Government Cloud** (yet)
- ❌ NOT available in other sovereign clouds (yet)

**Impact for FoodBudget:**
- ✅ No issue - We're using public Azure
- ✅ FoodBudget is consumer app (not government)

---

#### 🔄 Tenant Configuration Differences

**Q: What's the difference between workforce and external tenant configurations?**

**A: Different default behaviors despite shared foundation**
- ✅ Both built on Microsoft Entra foundation
- ✅ External tenants optimized for consumer apps (CIAM)
- ✅ Workforce tenants optimized for employees + B2B
- ✅ Different feature sets and default configurations
- ✅ Cannot convert between types (must create correct type from start)

**Cross-Reference:**
- ✅ Confirms our tenant type decision (external tenant)
- ✅ Emphasizes importance of choosing correct type upfront

---

#### ✅ Key Takeaways from FAQ

**Confirmed Decisions:**
1. ✅ **External ID is the right platform** - Modern, not legacy rebrand
2. ✅ **50,000 MAU free tier** - Confirmed multiple times
3. ✅ **MSAL unified library** - Same code for workforce and external
4. ✅ **Standard MSAL for FoodBudget** - Browser-based authentication
5. ✅ **No custom policies needed** - Simpler than B2C
6. ✅ **External tenant type** - Consumer-facing apps

**Clarifications:**
- ✅ External ID is **NOT** just rebranded B2C (completely new platform)
- ✅ Native auth gives UI control but React Native not supported
- ✅ Add-ons (SMS MFA, custom domains) cost extra (no free tier)
- ✅ Public clouds only (no government cloud support yet)

**Nothing Changed:**
- ✅ All our previous decisions remain valid
- ✅ All our previous research confirmed
- ✅ No new blockers or concerns identified

**Cross-References:**
- ✅ FAQ confirms authentication methods (section: Authentication Methods)
- ✅ FAQ confirms MSAL approach (section: Native Authentication vs Standard MSAL)
- ✅ FAQ confirms custom extensions (section: Custom Authentication Extensions)
- ✅ FAQ confirms pricing model (section: Pricing Model Analysis)
- ✅ FAQ confirms tenant types (section: External Tenants vs Workforce Tenants)

---

### Part 2: App Registration ✅ PARTIALLY COMPLETE

**Status:** Basic process documented, mobile-specific details pending

**Sources:**
- [Quickstart: Register an Application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

**What App Registration Does:**
- Establishes trust relationship between your application and Microsoft identity platform
- Enables Identity and Access Management (IAM) for your application
- Generates Application (client) ID used for token validation
- Configures authentication settings and permissions

---

#### Prerequisites

**Required:**
1. ✅ Active Azure subscription (existing)
2. ✅ Account with **"Application Developer"** role (minimum)
3. ✅ External tenant created (Part 1 above)

---

#### FoodBudget App Registrations Needed

We need to register **TWO applications**:

1. **Mobile App Registration**
   - **Purpose:** FoodBudget mobile app (React Native + Expo)
   - **Type:** Public client (mobile/desktop)
   - **Authentication:** Users sign in through this app

2. **Backend API Registration**
   - **Purpose:** FoodBudget backend API (ASP.NET Core)
   - **Type:** Protected resource (API)
   - **Authentication:** Mobile app requests access to this API

---

#### Step-by-Step: Register Mobile App

**Step 1: Navigate to App Registrations**
- Path: Microsoft Entra admin center → **Entra ID** → **App registrations** → **New registration**
- Ensure you're in the external tenant (switch if needed)

**Step 2: Configure Mobile App Registration**

**Required Fields:**

1. **Name**
   - **FoodBudget Value:** `FoodBudget Mobile App`
   - Display name shown in admin center
   - Can be changed later

2. **Supported Account Types**
   - **FoodBudget Value:** Accounts in this organizational directory only (external tenant)
   - ✅ External tenant users (customer-facing)
   - Matches our CIAM scenario

3. **Redirect URI (optional at registration)**
   - **Status:** ⏸️ PENDING - React Native/Expo redirect URI format
   - Can be added after registration
   - **Questions:**
     - ❓ What is the redirect URI format for React Native/Expo apps?
     - ❓ Platform type: Mobile/Desktop or Public client?
     - ❓ Does React Native use custom URI schemes (e.g., `foodbudget://auth/callback`)?

**Step 3: Complete Registration**
- Click **Register** button
- Wait for confirmation

**Step 4: Record Mobile App Details**

**After registration, record:**
- ✅ **Application (client) ID** - UUID generated by Microsoft
- ✅ **Directory (tenant) ID** - External tenant ID
- ✅ **Object ID** - Internal identifier

**Where to find:** App registration **Overview** page

---

#### Step-by-Step: Register Backend API

**Step 1: Create New Registration**
- Path: **App registrations** → **New registration**

**Step 2: Configure API Registration**

**Required Fields:**

1. **Name**
   - **FoodBudget Value:** `FoodBudget API`
   - Display name for API registration

2. **Supported Account Types**
   - **FoodBudget Value:** Accounts in this organizational directory only (external tenant)
   - Same as mobile app

3. **Redirect URI**
   - **Not needed** for API (APIs don't redirect)
   - Leave blank

**Step 3: Complete Registration**
- Click **Register**

**Step 4: Configure API Identifier URI**

After registration:
- Navigate to **Expose an API** section
- Click **Add** next to Application ID URI
- **FoodBudget Value:** Use default `api://<client-id>` format
- Click **Save**

**Result:** API identifier is `api://<client-id>`

**Step 5: Define API Scopes**

**Status:** ⏸️ PENDING - Scope naming decisions

**Questions:**
- ❓ What scopes should we expose? (e.g., `access_as_user`, `read`, `write`)
- ❓ Use default scope naming or customize?
- ❓ Single scope or multiple scopes for MVP?

**Recommendation:** Start with single scope `access_as_user` for MVP

---

#### Post-Registration: Configure Platform

**For Mobile App Only:**

**Status:** ⏸️ PENDING - Mobile platform configuration details

**What's Needed:**
- Navigate to **Authentication** section
- Click **Add a platform**
- Select platform type (Mobile/Desktop or Public client?)
- Configure redirect URIs
- Enable public client flows (if needed)

**Questions:**
- ❓ Exact redirect URI format for React Native/Expo
- ❓ Does Expo require special redirect URI scheme?
- ❓ Public client flows: Enable or disable?

---

#### Post-Registration: Grant API Permissions

**For Mobile App:**

**Step 1: Navigate to API Permissions**
- Mobile app registration → **API permissions**

**Step 2: Add FoodBudget API Permission**
- Click **Add a permission**
- Choose **My APIs** tab
- Select **FoodBudget API**
- Select delegated permissions (scopes defined above)
- Click **Add permissions**

**Step 3: Grant Admin Consent (External Tenants)**
- For external tenants: Must grant admin consent for **User.Read** permission
- Click **Grant admin consent** button
- Confirm

**Result:** Mobile app can request access to FoodBudget API

---

#### FoodBudget Decisions Summary

**✅ Decided:**
- Mobile app name: `FoodBudget Mobile App`
- API name: `FoodBudget API`
- Account types: External tenant users only
- API identifier: `api://<client-id>` (default format)

**⏸️ Pending Research:**
- React Native/Expo redirect URI format
- Mobile platform configuration specifics
- Public client flow settings
- API scope naming (recommend: `access_as_user` for MVP)

**Next Steps:**
- Continue to mobile-specific how-to guides
- Document redirect URI format when found
- Complete platform configuration details

---

### Part 3: User Flow Configuration ✅ COMPLETE

**Status:** Complete user flow creation guide documented

**Sources:**
- [How-To: Create Sign-Up and Sign-In User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-sign-up-sign-in-customers)

**What User Flow Does:**
- Defines the series of sign-up steps customers follow
- Configures sign-in methods available to users
- Determines which user attributes to collect during registration
- Associates identity providers (email, social logins)

**Key Constraint:**
- ⚠️ **One user flow per application** (but one flow can serve multiple apps)
- Can create multiple flows if needed for different app scenarios

---

#### Prerequisites

**Required:**
1. ✅ External tenant created (Part 1)
2. ✅ App registrations created (Part 2)

**Optional (Configure First if Needed):**
3. ⏸️ Email OTP enabled (tenant-level setting) - **NOT needed** (we're using Email + Password)
4. ⏸️ Custom attributes defined - **NOT needed** (using built-in attributes only)
5. ⏸️ **Social identity providers configured** - **NEEDED before user flow creation**

**Important:** Social providers (Google, Facebook, Apple) must be configured BEFORE creating user flow, as they "become available only after you set up federation with them"

**Implementation Order:**
1. ✅ Create tenant (Part 1)
2. ✅ Register apps (Part 2)
3. ⏸️ **Configure social providers (Part 4) - DO THIS FIRST**
4. ⏸️ Create user flow (Part 3 - this section)

---

#### Step-by-Step: Create User Flow

**Step 1: Navigate to User Flows**
- Path: Microsoft Entra admin center → **Entra ID** → **External Identities** → **User flows** → **New user flow**
- Ensure you're in the external tenant

**Step 2: Enter User Flow Name**
- **FoodBudget Value:** `SignUpSignIn`
- Display name for administrative purposes
- Can have multiple flows if needed

**Step 3: Select Identity Providers**

Under **Identity providers** section:

**Email Accounts (Local Authentication):**
- ✅ Check **Email Accounts** checkbox
- Select authentication method:
  - **FoodBudget Choice:** ✅ **Email with password**
  - Alternative: Email one-time passcode (passwordless)

**Rationale for Email + Password:**
- ✅ FREE (no additional costs)
- ✅ Traditional authentication (familiar to users)
- ✅ Supports self-service password reset
- ✅ Supports MFA (email OTP or SMS as second factor)
- ✅ Our previous research decision

**Social Identity Providers:**
- ✅ Check **Google** (if configured in Part 4)
- ✅ Check **Facebook** (if configured in Part 4)
- ✅ Check **Apple** (if configured in Part 4)

**Note:** Social providers only appear after federation is set up (Part 4)

**Step 4: Select User Attributes**

Under **User attributes** section:

**FoodBudget Attributes to Collect:**
- ✅ **Email Address** (required, automatic)
- ✅ **Display Name** (user's full name)

**Available but NOT Collecting:**
- ❌ Given Name (first name)
- ❌ Surname (last name)
- ❌ Job Title
- ❌ Postal Code
- ❌ Custom attributes

**How to Configure:**
1. In **User attributes** section, check:
   - ✅ Email Address
   - ✅ Display Name
2. Click **Show more** to see extended options (not needed)
3. Click **OK** to confirm selections

**Rationale:**
- Minimize sign-up friction (only 2 fields: email + name)
- Can collect additional data in-app after authentication
- Aligns with our research decision (simplicity for MVP)

**Step 5: Create User Flow**
- Review all configurations
- Click **Create** button
- Wait for confirmation

**Result:**
- User flow created and ready to use
- Can now be associated with applications

---

#### Post-Creation: Associate Applications

**Source:** [How-To: Add Application to User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-add-application)

**When to Do This:**
- ✅ **Immediately after creating user flow** (Option A - chosen for testing purposes)
- Allows incremental testing during Phase 2 configuration
- Authentication activates immediately upon association
- Branding can be added and tested separately afterward

**After user flow is created:**

**Step 1: Navigate to Applications**
- Path: Microsoft Entra admin center → **Entra ID** → **External Identities** → **User flows**
- Select your user flow (e.g., `SignUpSignIn`)
- In left sidebar, under "Use" section, click **Applications**

**Step 2: Add Application to User Flow**
- Click **Add application** button
- Select **FoodBudget Mobile App** from list (or use search)
- Click **Select** to confirm

**Step 3: Verify Association**
- **FoodBudget Mobile App** should appear in the Applications list
- Mobile app will now use this user flow for authentication
- **Result:** Sign-up and sign-in experience is immediately activated for users visiting the application

**Critical Architecture Note:**

**✅ Add to User Flow:**
- **FoodBudget Mobile App** - Users authenticate through mobile app

**❌ Do NOT Add to User Flow:**
- **FoodBudget API** - APIs validate tokens, don't authenticate users
- API is the "protected resource" not the "client"
- Mobile app acquires access tokens, API validates them

**Important Constraints:**
- ⚠️ **One application can have only ONE user flow** (each app can only use one flow)
- ✅ **One user flow for multiple applications** (one flow can serve many apps)
- ✅ This is why FoodBudget uses a single "SignUpSignIn" flow for all authentication needs

**Auto-Created App:**
- ⚠️ Do NOT delete `b2c-extensions-app` (handles custom user attributes)

**OAuth 2.0 Flow:**
1. User signs in via mobile app (using user flow)
2. Mobile app receives tokens (ID token + access token)
3. Mobile app calls API with access token
4. API validates access token
5. API serves data if token valid

This is the industry-standard OAuth 2.0 Authorization Code + PKCE pattern.

---

#### Testing the User Flow

**Status:** ✅ COMPLETE - Testing procedure documented

**Source:** [How-To: Test User Flows](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-test-user-flows)

**When to Test:**
- ⏸️ **After social providers are configured** (to test all authentication methods)
- ⏸️ **After redirect URI is configured** (pending React Native/Expo research)
- Test incrementally during Phase 2 configuration

**Prerequisites for Portal Testing:**
1. ✅ External tenant created
2. ✅ User flow created and configured
3. ✅ Application registered
4. ⏸️ **Redirect URI configured** (pending React Native/Expo redirect URI format research)
5. ✅ Application associated with user flow
6. ⚠️ **Short delay** after app association before testing becomes available

**Testing Method: "Run User Flow" Feature**

**Step 1: Navigate to User Flow**
- Path: Microsoft Entra admin center → **Entra ID** → **External Identities** → **User flows**
- Select your user flow (e.g., `SignUpSignIn`)

**Step 2: Launch Testing**
- Click **"Run user flow"** button
- System pre-populates fields from application registration

**Step 3: Configure Test Parameters**
- **Application:** Select **FoodBudget Mobile App** from dropdown
- **Reply URL/Redirect URI:** Verify the configured redirect endpoint
- **Response Type:** Select token type (id_token or code based on app configuration)
- **Localization:** (Optional) Specify UI language to test different locales
- **PKCE:** For React Native (single-page/mobile apps), enable "Specify code challenge"

**Step 4: Execute Test**
- Click **"Run user flow"** button (or copy endpoint URL)
- Sign-in page opens for testing

**What to Verify During Testing:**
- ✅ Sign-up flow functions correctly
- ✅ Sign-in process works as expected
- ✅ User interface displays properly
- ✅ All authentication methods work (email + password, Google, Facebook, Apple)
- ✅ User attributes are collected correctly (email, display name)
- ✅ Redirect after authentication completes successfully

**Test Scenarios (ALL methods):**
1. **Email + Password Sign-Up:** New user registration with email and password
2. **Email + Password Sign-In:** Existing user authentication
3. **Google Sign-Up:** New user registration via Google
4. **Google Sign-In:** Existing user authentication via Google
5. **Facebook Sign-Up:** New user registration via Facebook
6. **Facebook Sign-In:** Existing user authentication via Facebook
7. **Apple Sign-Up:** New user registration via Apple
8. **Apple Sign-In:** Existing user authentication via Apple

**Limitations:**
- Doesn't support SAML apps (not relevant for FoodBudget)
- Short delay after adding app before testing becomes available

**Expected End-to-End Flow:**
1. User opens sign-in page (via "Run user flow" or mobile app)
2. For Sign-Up:
   - Choose authentication method (email or social provider)
   - Enter email + display name (if email method)
   - Set password (if email method)
   - Complete email verification (if enabled)
3. For Sign-In:
   - Enter email + password (or select social provider)
   - Authenticate
4. Redirect back to application (authenticated with tokens)

---

#### FoodBudget Decisions Summary

**✅ Decided:**
- User flow name: `SignUpSignIn`
- Authentication method: Email + Password (FREE)
- User attributes: Email + Display Name only
- Social providers: Google, Facebook, Apple (configure in Part 4 first)
- Terms/privacy checkbox: ❌ NO for MVP (deferred)

**⏸️ Deferred Decisions:**
- **Terms/Privacy Policy Checkbox:** Not implementing for MVP
  - **Reason:** No terms/conditions created yet
  - **Future:** May add when legal documents ready
  - **Implementation:** Likely requires custom attribute or separate configuration

**✅ Implementation Order Confirmed:**
1. Create tenant ✅
2. Register apps ✅
3. **Configure social providers (Part 4) ✅ COMPLETE - Google documented**
4. Create user flow (Part 3)
5. Associate app with user flow (Part 3)
6. **Enable SSPR** (Part 5 - enable Email OTP)
7. **Test user flow** (after social providers configured and redirect URI set)
8. Configure branding (including SSPR link visibility)
9. Test branded experience and password reset

---

#### Important Notes

**User Flow Constraints:**
- One user flow per application
- Can create multiple flows for different apps if needed
- Social providers must be configured before flow creation

**Attribute Collection:**
- Built-in attributes available immediately
- Custom attributes must be defined before flow creation
- Attributes can be reordered/customized after creation

**Testing:**
- Use "Run user flow" feature in admin center (see Testing section above)
- Test ALL authentication paths (email, Google, Facebook, Apple)
- Test both sign-up and sign-in for each method (8 test scenarios total)
- Verify attribute collection works correctly (email, display name)
- Verify redirect after authentication completes
- Test after social providers are configured and redirect URI is set

---

### Part 4: Social Identity Providers ✅ MVP

**Status:** ✅ COMPLETE - Social provider configuration documented for MVP inclusion

**Sources:**
- [How-To: Google Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-google-federation-customers)
- [How-To: Facebook Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-facebook-federation-customers)
- [How-To: Apple Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-apple-federation-customers)

**What Social Identity Providers Do:**
- Allow users to sign up and sign in using existing social accounts
- Reduces friction (no need to create new password)
- Increases conversion rates (20-40% improvement)
- Industry standard for consumer applications

**FoodBudget Providers:**
- ✅ Google (most popular, nearly universal)
- ✅ Facebook (wide adoption)
- ✅ Apple (required for iOS App Store if offering social login)

**Important:**
- ⚠️ **MUST configure social providers BEFORE creating user flow**
- Social providers only become available in user flow after federation setup
- Apple Sign In is mandatory for iOS apps if offering any social login (App Store requirement)

---

#### Google Sign-In Configuration

**Prerequisites:**
- Google account (free) - create new account specifically for FoodBudget development
- External tenant created ✅

**Cost:** FREE

---

##### Part A: Google Cloud Console Setup

**Step 1: Create Google Project**

1. Access [Google Developers Console](https://console.developers.google.com/)
2. Sign in with Google account (or create new account for FoodBudget)
3. Accept terms of service if prompted
4. Select project list (upper-left corner) → **New Project**
5. Enter project name: **"FoodBudget"**
6. Click **Create**
7. Verify you're in the new project (check project selector)

**Step 2: Configure OAuth Consent Screen**

1. Navigate to **APIs & services** → **OAuth consent screen**
2. Select **External** as user type → **Next**
3. Complete app information:
   - **Application name:** "FoodBudget"
   - **User support email:** Your email address
4. Under **Authorized domains**, add:
   - `ciamlogin.com`
   - `microsoftonline.com`
5. **Developer contact emails:** Enter email addresses (comma-separated) for Google notifications
6. Click **Save and Continue**

**Step 3: Create OAuth Client Credentials**

1. From left menu, select **Credentials**
2. Click **Create credentials** → **OAuth client ID**
3. Choose **Web application** as application type
4. Enter name: **"Microsoft Entra External ID"** (or "FoodBudget Auth")
5. **Add Redirect URIs** (7 URIs - replace values with FoodBudget details):

**FoodBudget Redirect URIs for Google:**
```
https://login.microsoftonline.com
https://login.microsoftonline.com/te/<tenant-ID>/oauth2/authresp
https://login.microsoftonline.com/te/foodbudget.onmicrosoft.com/oauth2/authresp
https://<tenant-ID>.ciamlogin.com/<tenant-ID>/federation/oidc/accounts.google.com
https://<tenant-ID>.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oidc/accounts.google.com
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oauth2
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oauth2
```

**Where to get values:**
- `<tenant-ID>`: Available after tenant creation (Phase 1, Task 1) - appears in tenant overview as "Tenant ID" (GUID format)
- `foodbudget`: Our chosen tenant subdomain (decided in Part 1)

6. Click **Create**
7. **IMPORTANT:** Copy and securely store:
   - **Client ID** (will add to Entra ID)
   - **Client Secret** (will add to Entra ID)
8. Click **OK**

**Important Notes:**
- Google app might require verification if updating logo or requesting additional scopes
- Consult Google's verification documentation if prompted
- Keep Client ID and Client Secret secure (treat like passwords)

---

##### Part B: Microsoft Entra Configuration

**Step 1: Add Google as Identity Provider**

1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant (if needed)
3. Navigate to **Entra ID** → **External Identities** → **All identity providers**
4. On **Built-in** tab, select **Configure** next to Google
5. Enter configuration:
   - **Name:** "Google" (or "Google Sign-In")
   - **Client ID:** Paste Client ID from Google Cloud Console
   - **Client secret:** Paste Client Secret from Google Cloud Console
6. Click **Save**

**Alternative: PowerShell Method**
```powershell
Import-Module Microsoft.Graph.Identity.SignIns
Connect-MgGraph -Scopes "IdentityProvider.ReadWrite.All"

$params = @{
  "@odata.type" = "microsoft.graph.socialIdentityProvider"
  displayName = "Google"
  identityProviderType = "Google"
  clientId = "[YOUR_CLIENT_ID]"
  clientSecret = "[YOUR_CLIENT_SECRET]"
}

New-MgIdentityProvider -BodyParameter $params
```

**Step 2: Verify Configuration**

1. Navigate to **Entra ID** → **External Identities** → **All identity providers**
2. Verify "Google" appears in the list
3. Note: Google will now be available for selection when creating user flows

---

##### Testing Google Sign-In

**When to Test:** Immediately after configuration (before creating user flow)

**Test Method:** Use test application or "Run user flow" after user flow creation

**Test Procedure:**
1. After user flow is created and Google is added to it
2. Use "Run user flow" feature
3. Sign-in page should show Google as an option
4. Click Google sign-in button
5. Redirected to Google authentication
6. Sign in with Google account
7. Grant permissions to FoodBudget
8. Redirected back to application (authenticated)

**Verify:**
- ✅ Google appears as sign-in option
- ✅ Redirect to Google works correctly
- ✅ Google authentication succeeds
- ✅ Return redirect to app succeeds
- ✅ User created in Entra ID with Google identity
- ✅ User attributes collected correctly

**Test Scenarios:**
- ✅ First-time sign-up with Google (new user)
- ✅ Returning user sign-in with Google (existing user)

---

#### Facebook Login Configuration

**Prerequisites:**
- Facebook developer account (free)
- External tenant created ✅
- ⚠️ **BLOCKER:** Privacy Policy, Terms of Service, and User Data Deletion URLs required

**Cost:** FREE

---

##### Part A: Facebook Developers Setup

**Step 1: Register as Facebook Developer**

1. Visit [Facebook for Developers](https://developers.facebook.com/apps)
2. Select **"Get Started"** in upper-right corner
3. Accept Facebook's policies and complete registration

**Step 2: Create Facebook App**

1. Select **Create App**
2. Accept Facebook platform policies and complete security checks
3. Choose **"Authenticate and request data from users with Facebook Login"** → **Next**
4. Select **"No, I'm not building a game"** → **Next**
5. Provide app information:
   - **App name:** "FoodBudget"
   - **Valid contact email:** Your email address
6. Select **Create app**

**Step 3: Configure Basic Settings**

1. Navigate to **App settings** → **Basic**
2. **COPY AND SAVE SECURELY:**
   - **App ID** (will add to Entra ID as Client ID)
   - **App Secret** (select "Show" to reveal - will add to Entra ID as Client secret)
3. ⚠️ **REQUIRED URLs** (must create placeholder pages):
   - **Privacy Policy URL:** `https://foodbudget.com/privacy` (or placeholder)
   - **Terms of Service URL:** `https://foodbudget.com/terms` (or placeholder)
   - **User Data Deletion URL:** `https://foodbudget.com/delete-data` (or placeholder)
4. Select **Category:** "Business and pages"
5. Select **Save changes**

**⚠️ CRITICAL REQUIREMENT:**
- **Facebook requires valid URLs** for Privacy Policy, Terms of Service, and User Data Deletion
- **Action Required:** Create placeholder pages before Facebook app configuration
- **Recommendation:** Simple HTML pages with basic privacy/terms statements
- **Can be updated later** with final legal documents

**Step 4: Add Website Platform**

1. Select **Add platform** at bottom of page
2. Choose **Website** → **Next**
3. Enter **Site URL:** `https://foodbudget.ciamlogin.com` (our Entra tenant authority URL)
   - **Note:** Using "Website" platform because OAuth authentication happens in browser (even though FoodBudget is a mobile app)
   - **Alternative to research:** Whether iOS/Android platform selection is more appropriate
4. Select **Save changes**

**Step 5: Configure OAuth Redirect URIs**

1. Navigate to **Use cases** → **Customize** (Authentication and account creation)
2. Select **Go to settings** under Facebook Login
3. In **"Valid OAuth Redirect URIs"**, add all 6 URIs:

**FoodBudget Redirect URIs for Facebook:**
```
https://login.microsoftonline.com/te/<tenant-ID>/oauth2/authresp
https://login.microsoftonline.com/te/foodbudget.onmicrosoft.com/oauth2/authresp
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oidc/www.facebook.com
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oidc/www.facebook.com
https://foodbudget.ciamlogin.com/<tenant-ID>/federation/oauth2
https://foodbudget.ciamlogin.com/foodbudget.onmicrosoft.com/federation/oauth2
```

**Where to get values:**
- `<tenant-ID>`: Available after tenant creation (Phase 1, Task 1)
- `foodbudget`: Our chosen tenant subdomain

4. Select **Save changes**

**Step 6: Add Email Permissions**

1. Select **Use cases** → **Customize** (Authentication)
2. Choose **Add** under Permissions
3. Select **Go back**

**Step 7: Go Live (Production)**

1. From menu, select **Go live**
2. Complete all requirements:
   - Answer data handling questions
   - **Business verification may be required** (research needed - see backlog)
3. Switch app to **Live** mode
4. **Important:** Only app owners can test until app is live

**FoodBudget Decision:**
- ✅ Go live immediately during Sprint 4 (allows all users to test)
- ⏸️ Business verification requirements pending research (Story 6.6)

**Important Notes:**
- App Secret is a security credential - keep secure (treat like password)
- Redirect URIs require exact formatting
- Business verification may be required for production deployment
- During development mode, only app owners/developers can sign in

---

##### Part B: Microsoft Entra Configuration

**Step 1: Add Facebook as Identity Provider**

1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant (if needed)
3. Navigate to **Entra ID** → **External Identities** → **All identity providers**
4. On **Built-in** tab, select **Configure** next to Facebook
5. Enter configuration:
   - **Name:** "Facebook"
   - **Client ID:** Paste App ID from Facebook
   - **Client secret:** Paste App Secret from Facebook
6. Click **Save**

**Alternative: PowerShell Method**
```powershell
Import-Module Microsoft.Graph.Identity.SignIns
Connect-MgGraph -Scopes "IdentityProvider.ReadWrite.All"

$params = @{
  "@odata.type" = "microsoft.graph.socialIdentityProvider"
  displayName = "Facebook"
  identityProviderType = "Facebook"
  clientId = "[Facebook App ID]"
  clientSecret = "[Facebook App Secret]"
}

New-MgIdentityProvider -BodyParameter $params
```

**Step 2: Verify Configuration**

1. Navigate to **Entra ID** → **External Identities** → **All identity providers**
2. Verify "Facebook" appears in the list
3. Note: Facebook will now be available for selection when creating user flows

---

##### Testing Facebook Sign-In

**When to Test:** Immediately after configuration (after app goes live)

**Test Procedure:**
1. After user flow is created and Facebook is added to it
2. Use "Run user flow" feature
3. Sign-in page should show Facebook as an option
4. Click Facebook sign-in button
5. Redirected to Facebook authentication
6. Sign in with Facebook account
7. Grant permissions to FoodBudget
8. Redirected back to application (authenticated)

**Verify:**
- ✅ Facebook appears as sign-in option
- ✅ Redirect to Facebook works correctly
- ✅ Facebook authentication succeeds
- ✅ Return redirect to app succeeds
- ✅ User created in Entra ID with Facebook identity
- ✅ User attributes collected correctly

**Test Scenarios:**
- ✅ First-time sign-up with Facebook (new user)
- ✅ Returning user sign-in with Facebook (existing user)

---

#### Apple Sign In Configuration

**Prerequisites:**
- Apple Developer account ($99/year - must purchase Apple Developer Program membership)
- External tenant created ✅

**Cost:** $99/year (Apple Developer Program membership - mandatory)

**⚠️ CRITICAL:** Apple App Store **requires** Apple Sign In if you offer ANY other social login option (Google, Facebook). This is **mandatory**, not optional.

---

##### Part A: Apple Developer Portal Setup

**Step 1: Create an App ID**

1. Sign into [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, IDs, & Profiles**
3. Click **(+)** to add new
4. Choose **App IDs** → **Continue**
5. Select type **App** → **Continue**
6. Register your App ID:
   - **Description:** "FoodBudget Mobile App"
   - **Bundle ID:** `com.foodbudget.mobile`
   - ✅ Select **Sign in with Apple** capability
   - **⚠️ NOTE YOUR TEAM ID** (shown as "App ID Prefix") - you'll need this later
   - Select **Continue** → **Register**

**Step 2: Create a Service ID**

1. Navigate to **Certificates, IDs, & Profiles** → **(+)**
2. Choose **Services IDs** → **Continue**
3. Register a Services ID:
   - **Description:** "FoodBudget Sign In"
   - **Identifier:** `com.foodbudget.signin`
   - **⚠️ IMPORTANT:** This identifier becomes your **Client ID** for Entra ID
   - Select **Continue** → **Register**

**Step 3: Configure Sign in with Apple**

1. From Identifiers list, select your Service ID (`com.foodbudget.signin`)
2. Choose **Sign In with Apple** → **Configure**
3. Select your Primary App ID (`com.foodbudget.mobile`)
4. In **Domains and Subdomains**, add (replace `<tenant-id>` with your actual Tenant ID):
   - `foodbudget.ciamlogin.com`
   - `<tenant-id>.ciamlogin.com`
5. In **Return URLs**, add all 3 variants:

**FoodBudget Return URLs for Apple:**
```
https://<tenant-id>.ciamlogin.com/<tenant-id>/federation/oauth2
https://<tenant-id>.ciamlogin.com/foodbudget/federation/oauth2
https://foodbudget.ciamlogin.com/<tenant-id>/federation/oauth2
```

**⚠️ VERIFICATION STEP:**
- Verify ALL characters are lowercase (Apple requirement)
- Replace `<tenant-id>` with your actual Tenant ID from Phase 1

6. Select **Next** → **Done** → **Continue** → **Save**

**Step 4: Create Client Secret (Private Key)**

1. From menu, select **Keys** → **(+)**
2. Register a New Key:
   - **Key Name:** "FoodBudget Sign In Key"
   - ✅ Select **Sign in with Apple** → **Configure**
   - Choose your Primary App ID (`com.foodbudget.mobile`) → **Save**
   - Select **Continue** → **Register**
3. **⚠️ CRITICAL:** Note your **Key ID** (save securely)
4. **⚠️ CRITICAL:** Select **Download** to get the `.p8` file
   - **THIS CAN ONLY BE DOWNLOADED ONCE!**
   - **SAVE TO SECURE PASSWORD MANAGER IMMEDIATELY**
   - File contains private key needed for Entra ID configuration
   - If lost, must create new key and reconfigure everything
5. Select **Done**

**⚠️ CRITICAL MAINTENANCE REQUIREMENT:**
- **Apple requires renewing client secret every 6 months**
- **ACTION:** Add calendar reminder NOW for 6 months from key creation date
- **Process:** Create new key in Apple Developer Portal, update Entra ID configuration
- Failure to renew will break Apple Sign In for all users

**Secure Storage for .p8 File:**
- ✅ **Store in secure password manager** (1Password, LastPass, etc.)
- Save as: "Apple Sign In Private Key - FoodBudget.p8"
- Include in notes: Key ID, creation date, renewal date (6 months)
- Azure Key Vault NOT needed (API doesn't access this file)

---

##### Part B: Microsoft Entra Configuration

**Step 1: Add Apple as Identity Provider**

1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant (if needed)
3. Navigate to **Entra ID** → **External Identities** → **All identity providers**
4. Under **Built-in** tab, select **Apple**
5. Complete these fields:
   - **Client ID:** `com.foodbudget.signin` (your Apple Service ID from Step 2)
   - **Apple developer team ID:** Your Team ID (from Step 1)
   - **Key ID:** From Step 4
   - **Client secret (.p8) key:** Open `.p8` file in text editor, paste ENTIRE contents
6. Select **Save**

**Step 2: Verify Configuration**

1. Navigate to **Entra ID** → **External Identities** → **All identity providers**
2. Verify "Apple" appears in the list
3. Note: Apple will now be available for selection when creating user flows

---

##### Testing Apple Sign In

**When to Test:** Immediately after configuration

**Test Procedure:**
1. After user flow is created and Apple is added to it
2. Use "Run user flow" feature
3. Sign-in page should show Apple as an option
4. Click Apple sign-in button
5. Redirected to Apple authentication
6. Sign in with Apple ID
7. Grant permissions to FoodBudget
8. Redirected back to application (authenticated)

**Verify:**
- ✅ Apple appears as sign-in option
- ✅ Redirect to Apple works correctly
- ✅ Apple authentication succeeds
- ✅ Return redirect to app succeeds
- ✅ User created in Entra ID with Apple identity
- ✅ User attributes collected correctly

**Test Scenarios:**
- ✅ First-time sign-up with Apple (new user)
- ✅ Returning user sign-in with Apple (existing user)

**Important Notes:**
- All domain/tenant characters must be lowercase (Apple requirement)
- Private key (.p8) can only be downloaded once from Apple
- Client secret must be renewed every 6 months (calendar reminder critical)
- Apple Sign In is **mandatory** for iOS App Store if offering other social logins

---

#### FoodBudget Decisions Summary

**✅ Decided:**
- Enable Google, Facebook, and Apple for MVP
- Google account: Create new account specifically for FoodBudget development
- App names: "FoodBudget" (all providers)
- Test each provider immediately after configuration
- Configure all social providers BEFORE creating user flow
- Facebook: Go live immediately during Sprint 4 (Option A)
- Facebook: Create placeholder privacy/terms/data deletion pages (Option A)

**⏸️ Pending/Blockers:**
- **Facebook URLs:** Privacy Policy, Terms of Service, User Data Deletion pages required
  - **Action:** Create placeholder pages (Story 6.7 - HIGH priority)
  - **Blocker:** Cannot complete Facebook configuration without these
- **Facebook Business Verification:** Research requirements (Story 6.6 - HIGH priority)
  - **Action:** Determine if verification is mandatory and timeline
  - **Potential blocker** if verification process is lengthy

**Apple-Specific Decisions:**
- Bundle ID: `com.foodbudget.mobile`
- Service ID (Client ID): `com.foodbudget.signin`
- Key renewal: Add calendar reminder for 6-month renewal
- .p8 file storage: Secure password manager only (Azure Key Vault not needed)
- Verification: Confirm all URLs are lowercase before submission

**Implementation Order:**
1. ⏸️ **PREREQUISITE:** Purchase Apple Developer Program membership ($99/year)
2. ⏸️ **PREREQUISITE:** Create placeholder legal pages (Story 6.7 - for Facebook)
3. ⏸️ **PREREQUISITE:** Research Facebook business verification (Story 6.6)
4. Configure Google (Part 4A) ✅ COMPLETE
5. Test Google sign-in
6. Configure Apple (Part 4C) ✅ COMPLETE (documentation ready)
7. Test Apple sign-in
8. Configure Facebook (Part 4B) ⏸️ (blocked by prerequisites)
9. Test Facebook sign-in
10. Create user flow with all providers selected (Part 3)

**Cost Total:**
- Google: FREE
- Facebook: FREE
- Apple: $99/year
- **Total:** $99/year

---

### Part 5: Self-Service Password Reset (SSPR) ✅ MVP

**Status:** ✅ COMPLETE - SSPR configuration documented for MVP inclusion

**Source:** [How-To: Enable Password Reset](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-enable-password-reset-customers)

**What SSPR Does:**
- Allows users to independently reset forgotten passwords
- No administrator or help desk involvement needed
- Prevents account lockout frustration
- Standard user expectation for modern applications

**Configuration Status:**
- ⚠️ **NOT automatic** - requires deliberate configuration
- Must enable across 3 configuration areas
- ✅ **FoodBudget Decision:** Enable for MVP (reduces support burden, improves UX)

---

#### Implementation Process

**Phase 1: User Flow Configuration (Already Complete)**
- **Requirement:** "Email with password" must be enabled in user flow
- ✅ **FoodBudget Status:** Already enabled (Part 3 configuration)
- No additional action needed

**Phase 2: Enable Email One-Time Passcode (REQUIRED)**

**Step 1: Navigate to Authentication Methods**
- Path: Microsoft Entra admin center → **Entra ID** → **Authentication methods**

**Step 2: Enable Email OTP**
- Select **Email OTP** under Policies → Method
- Enable the feature
- Select **"All users"** for inclusion
- Click **Save**

**Important Notes:**
- ✅ **Email OTP is FREE** (email-based, not SMS-based)
- Email OTP is ONLY used for password reset flow
- Does NOT change primary authentication method (still Email + Password)
- Different from SMS OTP (which would cost money)

**Phase 3: Display Password Reset Link (Branding Configuration)**

**Step 1: Navigate to Company Branding**
- Search for **Company Branding** in admin center
- Edit **Default sign-in** settings

**Step 2: Enable Password Reset Link**
- Access **Sign-in form** tab
- Enable **"Show self-service password reset"**
- Click **Save**

**Result:**
- "Forgot password?" link displays prominently on sign-in page
- Better user experience (users can easily find reset option)

---

#### How Users Access Password Reset

**User Flow:**
1. User navigates to sign-in page
2. Clicks **"Forgot password?"** link
3. Enters email address
4. Receives one-time passcode via email
5. Enters OTP code on verification page
6. Sets new password
7. Confirms new password
8. Signs in with new password

**No administrator intervention required**

---

#### Testing Password Reset

**Test Procedure:**
1. Launch application and navigate to sign-in
2. Click **"Forgot password?"** link
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

---

#### FoodBudget Decisions Summary

**✅ Decided:**
- Enable SSPR for MVP (Option A)
- Enable Email OTP authentication method (FREE, used only for password reset)
- Show "Forgot password?" link prominently in branding (better UX)
- Include in Phase 2 (Authentication Configuration) - straightforward implementation

**Implementation Placement:**
- **Phase 2:** Enable Email OTP authentication method
- **Phase 5:** Show password reset link in branding configuration

**Cost:**
- ✅ **$0** - Email OTP is FREE (included in base tier)
- Only SMS-based methods cost money (not using)

**Effort:**
- Enable Email OTP: 15-30 minutes (navigate → enable → save)
- Show reset link in branding: 5-10 minutes (checkbox setting)
- Total: ~30-40 minutes

---

### Part 6: Optional Post-Launch Features

**Status:** Reference for future implementation

#### Disable Sign-Up in User Flow

**What:** Administrative feature to disable new user registrations while keeping existing user sign-ins active

**Use Cases:**
- Transition from open registration to invite-only access
- Beta/private testing phases
- Temporary closure of new registrations
- Managed user onboarding programs

**Implementation:**
- API-only configuration (Microsoft Graph API)
- PATCH request to user flow: set `isSignUpAllowed` to `false`
- Reversible: set to `true` to re-enable sign-up

**Documentation:**
- [How-To: Disable Sign-Up in User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-disable-sign-up-user-flow)

**Backlog:**
- Story 6.3: Administrative Access Controls (Sprint 6)
- Priority: LOW
- Effort: 2-4 hours

**When to Implement:**
- Post-MVP, after Sprint 4 authentication deployed
- Only if transitioning to controlled access model

---

#### Sign-In Aliases (Username Support)

**What:** Allow users to sign in with usernames or other alternate identifiers (customer ID, account number, member ID) in addition to email addresses

**Use Cases:**
- Customer ID as login identifier
- Account numbers for business systems
- Member IDs for membership programs
- Other business-specific identifiers

**How It Works:**
- Users can have both email AND username assigned
- Can sign in with either email or username (+ password)
- Single account with multiple sign-in options

**Implementation:**
1. Enable username in sign-in identifier policy
2. (Optional) Add custom regex validation for username format
3. Assign usernames to users (admin center or Graph API)
4. Customize sign-in page hint text (e.g., "Email or Member ID")

**Important Notes:**
- ⚠️ NOT automatic - requires manual policy enablement
- ⚠️ Critical: If username assigned to user but NOT enabled in policy, authentication fails
- Usernames cannot match email address format
- Can assign to existing users or during user creation

**Documentation:**
- [How-To: Sign-In Aliases](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-sign-in-alias)

**Backlog:**
- Story 6.4: Sign-In Aliases (Username Support) (Sprint 6)
- Priority: LOW
- Effort: 3-6 hours

**FoodBudget Decision:**
- ❌ **NOT implementing for MVP**
- **Rationale:**
  - Email-based login is industry standard for consumer apps
  - No clear business need for customer IDs or account numbers
  - Adds complexity (user management, validation, support)
  - Can add post-MVP if user feedback indicates need

**When to Implement:**
- Post-MVP, only if user feedback indicates demand
- Consider for business/enterprise features
- Evaluate against actual use cases

---

### Part 7: Branding Customization ✅ MVP

**Status:** ✅ COMPLETE - Branding customization documented for MVP inclusion

**Source:** [How-To: Customize Branding](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-customize-branding-customers)

**What Branding Customization Does:**
- Personalizes sign-in, sign-up, and sign-out pages
- Replaces neutral Microsoft branding with FoodBudget identity
- Improves user trust and brand consistency
- Professional appearance throughout authentication flow

**Cost:** FREE (included in base tier)

---

#### Customizable Elements

**Visual Elements:**
- **Background:** Custom images or solid colors
- **Favicon:** Browser tab icon
- **Logos:** Banner logo, square logos (light/dark themes)
- **Layout:** Full-screen or partial-screen templates
- **Header/Footer:** Show/hide toggles

**Text and Links:**
- **Form text:** Username hints, custom messaging (max 1,024 chars, supports Markdown)
- **Footer links:** Privacy Policy, Terms of Service
- **Self-service password reset:** Custom link text and visibility
- **Tenant name:** Replace default Microsoft identification

**Not Using for MVP:**
- ❌ Custom CSS (use default layouts)
- ❌ Advanced styling (keep it simple)

---

#### Step-by-Step Customization Process

**Initial Setup:**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com) as Organizational Branding Administrator
2. Switch to external tenant (Settings icon → Directories + subscriptions)
3. Navigate to **Company Branding** (search or via Entra ID → Company Branding)
4. Select **Default sign-in** tab → **Edit**

**Customization Workflow (8 Sequential Tabs):**

**1. Basics Tab:**
- Favicon (browser tab icon)
- Background image or solid color
- Fallback color (if image fails to load)

**2. Layout Tab:**
- Template style (full-screen or partial)
- Structural element visibility (header/footer)

**3. Header Tab:**
- Company banner logo upload

**4. Footer Tab:**
- Privacy Policy link and text
- Terms of Service link and text

**5. Sign-in Form Tab:**
- Square logos (light and dark themes) - optional
- Username hint text customization
- Custom sign-in page messaging
- ✅ **Show self-service password reset** checkbox (CRITICAL for SSPR)

**6. Text Tab:**
- User attribute label customization
- Additional messaging
- Markdown formatting support

**7. Review Tab:**
- Verify all changes
- Preview before saving

**8. Save:**
- Apply configuration

---

#### Where Branding Appears

- ✅ Sign-in pages
- ✅ Sign-up pages
- ✅ Sign-out pages (auto-matches sign-in)
- ✅ User access panels (banner logo)
- ✅ Verification emails (tenant name)

---

#### Asset Requirements

**Image Specifications:**
- **Preferred format:** PNG (JPG acceptable)
- **Important:** Review file size requirements for each image (varies by image type)
- **Recommendation:** Use photo editor to create correctly-sized images

**Text Specifications:**
- Sign-in page text: Maximum 1,024 characters
- Markdown syntax supported: hyperlinks, bold, italics, underline
- Cannot include sensitive information

**FoodBudget Assets (Temporary for MVP):**
- Favicon (.png)
- Banner logo (.png preferred)
- Background image or solid color
- Square logos (optional, light/dark themes)
- Brand colors (hex codes)
- Privacy Policy URL (from Story 6.7)
- Terms of Service URL (from Story 6.7)

---

#### Important Notes

**Fallback Behavior:**
- If custom branding fails to load, automatically switches to neutral branding
- Ensures users always see a functional authentication experience

**JSON File Conflict:**
- Company Branding and User Flows modify the same JSON file
- **Most recent change overrides previous changes** (from either source)
- Be aware when making changes via both interfaces

**Testing:**
- Use "Run user flow" feature to preview
- Test across devices (desktop, mobile iOS/Android)
- Test different browsers
- Verify fallback behavior

---

#### FoodBudget Decisions Summary

**✅ Decided:**
- Enable branding customization in Sprint 4 (Phase 5, Task 9)
- Use temporary branding assets (no official branding exists yet)
- Include SSPR link (enable "Show self-service password reset")
- Include footer links to Privacy Policy and Terms of Service (from Story 6.7)
- English-only for MVP (no language customization)
- No custom CSS (use default layouts)
- No custom URL domain (defer to post-MVP)

**⏸️ Deferred:**
- **Custom URL Domain:** Replace ciamlogin.com with custom domain (costs $50-100/month, 7-11 hours effort)
- **Multi-language Support:** 40+ languages available (Story 6.9 - backlog)
- **Custom CSS Styling:** Advanced page customization (detailed below)

**Cost:** FREE (branding customization included in base tier)

**Effort:** 5-10 hours (creating temporary assets + configuration + testing)

---

#### Custom CSS Styling (Deferred - Post-MVP)

**Status:** ⏸️ DEFERRED - Documented for future implementation when official branding is finalized

**Source:** [CSS Template Reference](https://learn.microsoft.com/en-us/entra/fundamentals/reference-company-branding-css-template)

**What Custom CSS Enables:**

Beyond the portal-based branding options (logos, colors, layouts), custom CSS provides pixel-perfect control over authentication page styling:

- ✅ Full control over colors, fonts, spacing, borders, shadows
- ✅ Customize interactive states (hover, focus, active, error)
- ✅ Match React Native app branding exactly
- ✅ Override default Microsoft styles completely
- ✅ Consistent brand experience across all auth pages

**Available CSS Customization:**

**Page-Level Selectors:**
- `body` - Overall page styling
- `a`, `a:hover`, `a:focus`, `a:active` - Link states
- `.ext-background-image` - Background image container
- `.ext-middle` - Main content container
- `.ext-sign-in-box` - Authentication form box

**Sign-In Box Components:**
- `.ext-title` - Page title
- `.ext-subtitle` - Page subtitle
- `.ext-error` - Error message styling
- `.ext-input.ext-text-box` - Input fields (with `:hover`, `:focus`, `:active`, `.has-error` states)
- `.ext-primary` - Primary button (with `:hover`, `:focus`, `:active` states)
- `.ext-secondary` - Secondary button (with interactive states)

**Footer Elements:**
- `.ext-footer` - Footer container
- `.ext-footer-links` - Footer links container
- `.ext-footer-item` - Individual footer items

**Implementation Steps (For Future Sprint):**

1. **Download CSS Template:**
   - Access Microsoft's official CSS template from documentation
   - Template includes all available selectors with default styles

2. **Customize Styles:**
   - Modify selectors and properties within template framework
   - Test locally before uploading
   - Apply to both default and layout-specific templates

3. **Upload to Entra:**
   - Navigate to Company Branding → Custom CSS section
   - Upload modified CSS file
   - Test across different browsers and devices

4. **Test Interactive States:**
   - Verify hover, focus, active states work correctly
   - Test error message styling
   - Ensure accessibility (focus indicators visible)

**When to Implement:**

- ✅ After FoodBudget's official branding is finalized (logo, colors, fonts)
- ✅ When React Native app design system is established
- ✅ If portal-based branding options are insufficient for brand consistency

**Estimated Effort:** 2-3 hours (assuming branding assets exist)

**Cost:** FREE (included in base tier)

**Why Deferred for MVP:**

- ✅ Portal-based branding (logo, colors) is sufficient for MVP validation
- ✅ No official FoodBudget branding exists yet (using temporary assets)
- ✅ React Native app design system not finalized
- ✅ Custom CSS requires maintenance when Microsoft updates templates
- ✅ Keep MVP simple and focused on core functionality

**Future Implementation Trigger:**

Implement custom CSS when:
1. Official branding guidelines are created
2. Design system is finalized for React Native app
3. Brand consistency becomes critical for user trust/conversion
4. Portal-based options prove insufficient

---

### Part 8: Operational & Administrative Tasks

**Status:** Reference for operational needs

---

#### Delete External Tenant

**What:** Process to permanently delete an external tenant (for cleanup, testing, or correcting mistakes)

**Source:** [How-To: Delete External Tenant](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-delete-external-tenant-portal)

**Use Cases:**
- Delete test/development tenants during experimentation
- Remove incorrectly configured tenants
- Clean up after testing or POC
- Disaster recovery planning (understanding deletion process)

**Prerequisites (MUST complete BEFORE deletion):**
1. ✅ Remove ALL users except one Global Administrator (the one deleting the tenant)
2. ✅ Delete ALL applications (including auto-created `b2c-extensions-app`)
   - Navigate to **App registrations** → **All applications** → Delete all
3. ✅ Delete ALL user flows
4. ✅ Remove associated subscriptions

**Deletion Process:**

1. Access [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant:
   - Click **Settings** icon (top-right)
   - Select **Directories + subscriptions**
   - Switch to target external tenant
3. Navigate to **Entra ID** → **Overview** → **Manage tenants**
4. Select the target tenant
5. Click **Delete**
6. Complete any required remedial actions if prompted
7. Confirm deletion

**What Gets Deleted:**
- The tenant and ALL associated information
- All user data
- All application registrations
- All configuration (user flows, identity providers, branding)
- All associations with Azure subscriptions

**⚠️ CRITICAL WARNINGS:**

**Irreversible:**
- **NO RECOVERY** documented - deletion appears to be permanent
- **NO SOFT DELETE** or restore option
- **NO UNDO** - once confirmed, tenant is gone

**Impact:**
- "Deleting an external tenant negatively affects user access"
- Prevents access to Azure resources linked to subscription
- All users lose access immediately
- All applications stop working immediately

**Common Blockers to Deletion:**
- Existing users (beyond the deleting administrator)
- Active applications or app registrations
- Remaining user flows
- Subscriptions still attached
- System enforces prerequisite checks as safeguards

**FoodBudget Context:**
- **NOT part of Sprint 4 implementation**
- Operational knowledge for development/testing
- Useful during tenant experimentation phase
- Important for disaster recovery planning

**Best Practices:**
- Only delete test/development tenants
- Triple-check you're deleting the correct tenant
- Export/backup any important configuration before deletion
- Verify prerequisites are met to avoid partial cleanup issues
- Consider deactivating instead of deleting if unsure

**When to Use:**
- Cleaning up after failed tenant creation
- Removing test tenants after experimentation
- Starting fresh after major configuration errors
- Development/testing cleanup

**When NOT to Use:**
- Production tenants (obviously!)
- Tenants with active users
- Before ensuring proper backup/export
- Without verifying you're in the correct tenant

---

### Part 9: Multi-Factor Authentication (MFA) ❌ NOT MVP

**Status:** ❌ DEFERRED - Not implementing for MVP (Story 6.10 in backlog)

**Source:** [How-To: Multifactor Authentication](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-multifactor-authentication-customers)

**What MFA Does:**
- Adds second layer of security beyond password
- Requires users to verify identity with additional method
- Protects against password compromise and account takeover
- Industry-standard security feature

**FoodBudget MVP Decision:**
- ❌ **NOT implementing for MVP**
- ✅ **Relying on baseline security** (automatic, enterprise-grade)
- ⏸️ **Deferred to backlog** (Story 6.10)
- 🔐 **Optional user setting** when implemented (not required)

**Rationale:**
- FoodBudget is recipe app (not financial/health data)
- Baseline security sufficient for MVP
- MFA adds friction (reduces conversions)
- Social providers (Google, Facebook, Apple) handle their own MFA
- Can add post-MVP based on user feedback or compliance needs

---

#### Supported MFA Methods

**Email One-Time Passcode (Email OTP):**
- User receives 6-digit code via email after password entry
- **Cost:** FREE (no additional charges)
- **Limitation:** Cannot use email OTP for BOTH primary authentication AND MFA
- **FoodBudget Context:** Compatible (using "Email with password" for primary auth)
- Codes expire after configurable time (default: 5 minutes)

**SMS-Based Authentication:**
- User receives code via text message
- **Cost:** ~$0.0075 per SMS (requires active Azure subscription)
- **Regional Restrictions:** Starting January 2025, some regions require opt-in
- **Fraud Protection:** Automatic fraud checks + CAPTCHA if suspicious activity
- **FoodBudget Decision:** ❌ NOT using (costs money, regional complexity)

**NOT Supported (Use Advanced Security Features Instead):**
- ❌ **TOTP Authenticator Apps:** Covered in Story 6.2 (Advanced Security Features)
- ❌ **Hardware Tokens:** Not supported in External ID
- ❌ **Biometric (Face ID/Touch ID):** Device-level, not Entra feature

---

#### Implementation Overview (When Implemented)

**Step 1: Enable Email OTP Authentication Method**
1. Sign in to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Navigate to **Protection** → **Authentication methods** → **Policies**
4. Select **Email OTP**
5. Enable for **All users** or specific groups
6. Configure settings:
   - Code expiration time (default 5 minutes)
   - Code length (6 digits)
7. Save configuration

**Step 2: Create Conditional Access Policy**
1. Navigate to **Protection** → **Conditional Access**
2. Create new policy (e.g., "MFA for Opt-In Users")
3. **Assignments:**
   - **Users:** Specific group (e.g., "MFA-Enabled-Users")
   - **Cloud apps:** Select FoodBudget application
4. **Access controls:**
   - Grant access
   - Require multi-factor authentication
5. Enable policy and save

**Step 3: User Opt-In Flow**
- User enables MFA in account settings (toggle switch)
- Backend adds user to "MFA-Enabled-Users" group (Microsoft Graph API)
- Conditional Access policy enforces MFA for that user
- User can disable MFA anytime (removes from group)

**Step 4: User Experience**
1. User signs in with email and password (primary auth)
2. If MFA enabled: System sends 6-digit code to email
3. User enters code on verification screen
4. Access granted

---

#### Prerequisites

**Entra Configuration:**
- ✅ External tenant created
- ✅ Sign-up/sign-in user flow configured
- ✅ App registered and associated with user flow

**Azure Access:**
- Security Administrator role (minimum)
- Global Administrator for Conditional Access policies

**FoodBudget Backend (When Implemented):**
- Microsoft Graph API integration
- Endpoints to manage group membership:
  - `POST /api/user/mfa/enable` (add to MFA group)
  - `POST /api/user/mfa/disable` (remove from MFA group)
  - `GET /api/user/mfa/status` (check MFA status)

**FoodBudget Frontend (When Implemented):**
- Security settings screen with MFA toggle
- MFA verification screen (OTP entry)

---

#### Important Notes

**Critical Limitations:**
- ⚠️ **Cannot use email OTP for BOTH primary authentication AND MFA**
- If using "Email with one-time passcode" for primary sign-in, email OTP unavailable for MFA
- FoodBudget uses "Email with password" → Email OTP available for MFA ✅

**Cost Considerations:**
- Email OTP: FREE (no per-message charges)
- SMS: ~$0.0075 per message + Azure subscription required
- **FoodBudget Decision:** Email OTP only (FREE)

**Regional Restrictions (SMS only):**
- Starting January 2025, some country codes require opt-in
- "Telecom for opt-in regions" must be activated
- Email OTP has no regional restrictions ✅

**Fraud Protection:**
- SMS includes automatic fraud detection
- CAPTCHA triggered if suspicious activity detected
- Email OTP has standard spam/abuse protections

**User Experience Impact:**
- Adds extra step to sign-in flow (reduces conversion)
- Social login users (Google/Facebook/Apple) handle MFA via their providers
- Optional MFA balances security and UX

---

#### FoodBudget Implementation Plan (Story 6.10)

**When to Implement:**
- Post-MVP when security is higher priority
- If user feedback requests MFA
- If compliance requirements emerge (HIPAA, SOC 2, PCI-DSS)
- If moving upmarket to enterprise/business users
- Before handling sensitive user data beyond recipes

**Pending Questions (Answer Before Implementation):**
1. **Compliance Requirements:**
   - Do we have security compliance needs (HIPAA, SOC 2, PCI-DSS)?
   - Are we handling sensitive data requiring MFA?
   - Any regulatory requirements for data protection?

2. **Competitive Analysis:**
   - Do competing recipe apps offer MFA?
   - Is MFA a differentiator or table stakes in our market?

3. **User Feedback:**
   - Have users requested MFA or expressed security concerns?
   - What percentage would likely enable optional MFA?

**Implementation Approach:**
- **Method:** Email OTP only (FREE, simple)
- **Enforcement:** Optional user setting (not required by default)
- **Rollout:** Gradual rollout to test conversion impact
- **Education:** Clear messaging about MFA benefits

**Estimated Effort:** 5-8 hours
- Entra configuration: 1-2 hours
- Backend API (Graph integration): 2-3 hours
- Frontend UI (settings + verification): 2-3 hours
- Testing: 1 hour

**Cost:** FREE (Email OTP)

**Risk:** LOW (well-documented Entra feature)

---

### Part 10: App Roles (RBAC) ❌ NOT MVP

**Status:** ❌ DEFERRED - Not needed for MVP (Story 6.11 in backlog)

**Source:** [How-To: Use App Roles](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-use-app-roles-customers)

**What App Roles Are:**
- Application-specific authorization mechanism for role-based access control (RBAC)
- Define roles in app registration (e.g., "Admin", "Premium", "Moderator")
- Assign roles to users via admin center or Microsoft Graph API
- Roles delivered in JWT token's `roles` claim
- Your code checks roles to enforce permissions

**How They Work:**
1. **Define roles** in app registration with display name, value, and description
2. **Assign roles** to users (admin center or Microsoft Graph API)
3. **Roles in token** - `roles` claim included in JWT
4. **Your code enforces** - Backend checks `roles` claim, protects endpoints

**Example Use Cases:**
- Admin panel access (role: "Admin")
- Premium features (role: "Premium")
- Content moderation (role: "Moderator")
- Beta access (role: "Beta")

**App Roles vs. Groups:**
| Feature | App Roles | Groups |
|---------|-----------|--------|
| Scope | Application-specific | Tenant-wide |
| Reusability | Cannot share across apps | Share across multiple apps |
| Token claim | `roles` claim | `groups` claim |
| Best for | Single-app permissions | Multi-app scenarios |

**FoodBudget MVP Decision:**
- ❌ **NOT implementing for MVP**
- ✅ **Current authorization sufficient:** User-scoped data (extract `userId` from JWT, filter by user)
- ⏸️ **Deferred to backlog** (Story 6.11)
- 📋 **Optional:** Only implement if specific need emerges

**Rationale:**
- FoodBudget uses user-scoped data (users only access their own recipes)
- No admin panel in MVP
- No premium/free tier differentiation
- No public sharing or moderation features
- Current model sufficient: `WHERE UserId = @userId` in all queries

---

#### When App Roles Add Value

**Post-MVP Scenarios:**
1. **Admin Panel:**
   - Need "Admin" role to access user management, analytics, system settings
   - Admin needs to view ALL users' data (not just their own)

2. **Premium Features:**
   - Need "Premium" role for paid tier features (AI suggestions, unlimited storage)
   - Different feature sets for free vs. paid users

3. **Content Moderation:**
   - Need "Moderator" role if adding public recipe sharing
   - Moderators access flagged/reported content

4. **Beta Program:**
   - Need "Beta" role for early access features
   - Control rollout to specific users

**Current Authorization (Sufficient):**
```csharp
// Extract userId from JWT token
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

// Filter all queries by userId
var recipes = await _context.Recipes
    .Where(r => r.UserId == userId)
    .ToListAsync();
```

Users can only access their own data = no role-based authorization needed

---

#### Implementation Overview (When Needed)

**Step 1: Define Roles in App Registration**
1. Navigate to **App registrations** → **App roles** → **Create app role**
2. Configure:
   - **Display name:** "Administrator"
   - **Value:** "Admin" (no spaces, used in token)
   - **Allowed member types:** Users/Groups
   - **Description:** "Full access to admin panel"
   - **Enable:** Checked
3. Repeat for other roles (Premium, Moderator, Beta, etc.)

**Step 2: Assign Roles to Users**
- Via admin center: **Enterprise applications** → **Users and groups** → Assign role
- Via Microsoft Graph API: Programmatic assignment

**Step 3: Backend Authorization**
```csharp
// Program.cs - Configure role claim mapping
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = "roles" // Map JWT roles claim to .NET roles
        };
    });

// Protect endpoints with role requirements
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        // Only admins can access
        return Ok(await _userService.GetAllUsers());
    }
}
```

**Step 4: Frontend Authorization (UX Only)**
```typescript
// utils/auth.ts
import { jwtDecode } from 'jwt-decode';

export function hasRole(accessToken: string, role: string): boolean {
  const decoded = jwtDecode<{roles?: string[]}>(accessToken);
  return decoded.roles?.includes(role) || false;
}

// Conditionally render admin UI
{hasRole(accessToken, 'Admin') && <AdminPanelButton />}
```

**CRITICAL:** Frontend checks are UX only - backend MUST enforce all authorization

---

#### Important Notes

**Cost:** FREE (no additional charges)

**Limitations:**
- Must assign roles to groups programmatically (not via admin center)
- External tenants have phased feature support
- No code examples in Microsoft docs (pattern shown above is standard OAuth/JWT)

**Best Practice:**
- Use app roles (not groups) for FoodBudget - single-app scenario
- Backend enforces all permissions (frontend just hides UI)
- Define clear role names (Admin, Premium, Moderator)
- Test role-based access with different user accounts

**FoodBudget Implementation Plan (Story 6.11):**

**When to Implement:**
- When building admin panel (need "Admin" role)
- When adding premium features (need "Premium" role)
- When enabling public recipe sharing (need "Moderator" role)
- NOT needed for MVP (user-scoped data sufficient)

**Estimated Effort:** 4-8 hours
- Entra configuration: 1 hour
- Backend authorization: 2-3 hours
- Frontend utilities: 1-2 hours
- Testing: 1-2 hours

**Risk:** LOW (standard OAuth/JWT pattern)

---

### Part 11: Web Application Firewall (WAF) ❌ NOT APPLICABLE

**Status:** ❌ NOT APPLICABLE - Not cost-effective for FoodBudget's use case

**Source:** [Tutorial: Configure WAF with External ID](https://learn.microsoft.com/en-us/entra/external-id/customers/tutorial-configure-external-id-web-app-firewall)

**What WAF Is:**
- Azure Web Application Firewall protects authentication endpoints from web exploits
- Guards against SQL injection, XSS, DDoS attacks, malicious bots
- Managed rule sets with automatic updates from Microsoft Threat Intelligence
- Bot classification and anomaly detection

**How It Works:**
- Deploy Azure Front Door Premium with custom domain
- Create WAF policy (Premium SKU required)
- Start in Detection mode (logs threats)
- Tune rules based on traffic patterns
- Switch to Prevention mode (blocks threats)

**Security Benefits:**
- Protection against common web exploits (SQL injection, XSS)
- Layer 7 DDoS mitigation via rate limiting
- Bot classification (good/bad/unknown)
- Microsoft Threat Intelligence integration
- Anomaly scoring system

**Prerequisites:**
- Azure Front Door Premium tier
- Azure WAF Premium SKU
- **Custom domain configured** (cannot use default `ciamlogin.com` domain)
- Azure subscription

**Cost:**
- Azure Front Door Premium: ~$330/month base + usage
- Azure WAF Premium: ~$325/month + per-rule charges
- **Total: ~$650-700/month minimum ($7,800-8,400/year)**

---

#### FoodBudget Decision: NOT APPLICABLE

**Why We're Not Using WAF:**

1. **Cost Prohibitive:**
   - $650-700/month ($7,800-8,400/year)
   - Not cost-effective for recipe app
   - Better ROI: Invest in features, marketing, infrastructure

2. **Dependency:**
   - Requires custom domain (already deferred for MVP)
   - Cannot use with default `foodbudget.ciamlogin.com`

3. **Overkill for Use Case:**
   - FoodBudget handles recipe data (not financial, health, or sensitive PII)
   - Not a high-value attack target
   - No compliance requirements mandating WAF

4. **Entra Baseline Security Sufficient:**
   - Brute force protection (automatic)
   - Network layer DDoS protection (automatic)
   - Account protection (automatic)
   - Access control (automatic)
   - Built-in security sufficient for recipe app

5. **Operational Complexity:**
   - Requires rule tuning to avoid false positives
   - Detection mode → Prevention mode migration
   - Ongoing monitoring and maintenance

---

#### When WAF Might Be Relevant

**Scenarios Where WAF Makes Sense:**
- High-value targets (major brands with millions of users)
- Handling sensitive data (payment info, health data, financial records)
- Compliance requirements (PCI-DSS, HIPAA, SOC 2 Type II)
- Experiencing active attacks or bot abuse
- Enterprise customers requiring advanced security
- Annual revenue exceeds $500K (WAF becomes <2% of revenue)

**FoodBudget Context:**
- Recipe app with standard user data (email, name, recipes)
- MVP stage with limited budget
- Entra's baseline security provides adequate protection
- Can reconsider post-MVP if needs change

---

#### Alternative: Entra's Built-In Security

**What FoodBudget Already Has (FREE):**
- ✅ Brute force protection (automatic)
- ✅ Network layer protection (automatic)
- ✅ Account protection (automatic)
- ✅ Access control (automatic)
- ✅ Social provider security (Google, Facebook, Apple handle their own)

**These protections are:**
- Enterprise-grade
- Automatically managed by Microsoft
- No configuration required
- Sufficient for most consumer apps

---

#### Decision Summary

**FoodBudget Decision:** ❌ NOT implementing WAF

**Rationale:**
- Cost ($7,800-8,400/year) not justified for recipe app
- Entra baseline security sufficient for MVP and post-MVP
- No compliance requirements mandating WAF
- Better use of budget: features, marketing, infrastructure

**Recommendation:**
- Rely on Entra's built-in security (FREE, enterprise-grade)
- Monitor for actual security issues post-launch
- Reconsider only if specific threats emerge or revenue supports cost

**When to Reconsider:**
- Never (unless FoodBudget pivots to handling sensitive data or becomes high-value target)

---

### Part 12: Fraud Protection (Arkose Labs / HUMAN Security) ❌ NOT NEEDED

**Status:** ❌ NOT NEEDED - Alternative protections sufficient and more cost-effective

**Source:** [How-To: Integrate Fraud Protection](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-integrate-fraud-protection?pivots=arkose)

**What It Is:**
- Third-party fraud detection services that protect against bot-driven fake account registrations
- Integrates with Entra External ID using custom authentication extensions
- Presents CAPTCHA challenges (Arkose Labs) or blocks suspicious sign-ups (HUMAN Security)

**Supported Providers:**
1. **Arkose Labs:** Evaluates sign-up requests, presents CAPTCHA for suspicious activity
2. **HUMAN Security:** Real-time analysis and blocking of fraudulent registrations

**What It Protects Against:**
- Automated bot registrations
- Fake account creation
- Mass bot-driven sign-up attacks
- Abuse of sign-up endpoints

**Prerequisites:**
- Custom authentication extension configured (16-32 hours implementation)
- Third-party account with Arkose Labs or HUMAN Security
- API credentials (public/private keys, tokens)
- Authentication Extensibility Administrator role

**Cost:**
- Not specified in docs
- Enterprise fraud detection typically $500-2000+/month depending on volume
- Plus custom authentication extension implementation (16-32 hours)

**Status:**
- Preview feature (still in development)
- Optional security enhancement

---

#### FoodBudget Decision: NOT NEEDED

**Why We're Not Using Enterprise Fraud Protection:**

**1. Low Attack Value:**
- Recipe apps not typical bot targets
- No financial incentive for attackers (not gaming, ecommerce, financial)
- No valuable data to exploit (recipes, not payment info or credentials)
- No inventory hoarding, currency farming, or influence campaigns

**2. Cost Not Justified:**
- Enterprise fraud detection: $500-2000+/month
- Implementation: 16-32 hours (custom auth extensions)
- Recipe app budget doesn't support this expense
- Better ROI: Invest in features, marketing, infrastructure

**3. Existing Protection Sufficient:**
- ✅ **Entra baseline security** (built-in bot protection, rate limiting)
- ✅ **Email verification** (Sprint 4, Phase 2, Task 5) - Slows bots significantly
- ✅ **Backend rate limiting** (Sprint 4, Phase 3, Task 6B) - Prevents mass creation
- ✅ **Social login** (60%+ of users) - Google, Facebook, Apple handle bot detection
- ✅ **Sign-up monitoring** (Sprint 5, Story 5.2) - Detect unusual patterns

**4. UX Impact:**
- CAPTCHA challenges reduce sign-up conversions
- Legitimate users face friction
- Social login users bypass CAPTCHA anyway (majority of users)

**5. Preview Status:**
- Feature still in development (risk of bugs, changes)
- Better to wait for GA (general availability) if needed

---

#### FoodBudget's Protection Strategy (Defense in Depth)

**Multi-Layered Protection (All FREE or Low Cost):**

**Layer 1: Email Verification (Sprint 4)**
- Email OTP required for password-based sign-ups
- Slows bots significantly (need valid, accessible emails)
- FREE (no additional cost)
- Already planned: Phase 2, Task 5 (SSPR)

**Layer 2: Backend Rate Limiting (Sprint 4)**
- 10 sign-ups per IP per hour
- Prevents single-source bot attacks
- FREE (built-in ASP.NET Core feature)
- Already planned: Phase 3, Task 6B

**Layer 3: Social Login Protection (Sprint 4)**
- Google, Facebook, Apple handle their own bot detection
- 60%+ of users will use social login
- Bots can't easily create thousands of Google/Facebook accounts
- FREE (included in social provider)

**Layer 4: Entra Baseline Security (Automatic)**
- Built-in bot protection
- Rate limiting on authentication endpoints
- Network layer DDoS protection
- Brute force protection
- FREE (automatic, zero configuration)

**Layer 5: Sign-Up Monitoring (Sprint 5)**
- Track daily/hourly sign-up counts
- Alert if >100 sign-ups/day or >20 sign-ups/hour
- Manual investigation of suspicious patterns
- Can delete fake accounts if detected
- FREE (Application Insights includes metrics)

---

#### Cost Protection (Entra External ID MAU Pricing)

**Understanding MAU Costs:**
- Entra charges based on Monthly Active Users (MAU)
- **MAU = Users who authenticate at least once in a calendar month**
- **0-50,000 MAU:** FREE
- **50,001+ MAU:** Paid tiers

**Bot Account Scenarios:**

**Scenario 1: Bot creates accounts but never signs in**
- Cost: $0 (not active users, don't count as MAU)
- Problem: Database bloat only

**Scenario 2: Bot creates accounts AND signs in monthly**
- Cost: Could push toward 50K MAU limit or into paid tier
- Problem: Real cost impact!
- **Protection:** Rate limiting + monitoring prevent this

**Our Protection:**
- Email verification slows bot creation
- Rate limiting prevents mass creation (10/hour per IP)
- Monitoring detects unusual patterns early
- Can manually delete fake accounts before they become MAU

---

#### When Fraud Protection Would Be Relevant

**Scenarios Where Enterprise Fraud Detection Makes Sense:**
- Experiencing actual bot attack (thousands of fake sign-ups per day)
- High-value target (gaming, financial, ecommerce)
- Financial incentive for attackers (in-game currency, inventory, vouchers)
- Regulatory requirements for fraud prevention
- Bot abuse impacting legitimate users or system performance
- Annual revenue exceeds $500K (can afford $12K-24K/year for fraud protection)

**FoodBudget Context:**
- Recipe app with no financial incentive for bots
- MVP stage with limited budget
- Multi-layered FREE protection sufficient
- Can add enterprise fraud detection if actual abuse emerges

---

#### Alternative: Monitor First, React If Needed

**Launch MVP with FREE protections:**
1. Email verification ✅
2. Backend rate limiting ✅
3. Social login protection ✅
4. Entra baseline security ✅
5. Sign-up monitoring ✅

**Monitor sign-up patterns:**
- Track daily sign-up counts
- Alert on spikes (>100/day or >20/hour)
- Investigate suspicious patterns

**Only implement enterprise fraud detection if:**
- Experiencing actual bot attack (detected via monitoring)
- FREE protections prove insufficient
- Bot abuse causing real harm (cost, performance, user experience)
- Revenue supports $500-2000+/month expense

**This approach:**
- Saves $12K-24K/year for MVP
- Provides adequate protection for recipe app
- Allows data-driven decision (actual abuse, not theoretical)
- Can add enterprise solution quickly if needed

---

#### Decision Summary

**FoodBudget Decision:** ❌ NOT implementing enterprise fraud protection

**Rationale:**
- Recipe app not typical bot target (low attack value)
- Multi-layered FREE protection sufficient (5 layers of defense)
- Cost ($12K-24K/year) not justified for MVP
- Better use of budget: features, marketing, infrastructure
- Can monitor for abuse and add if needed (data-driven decision)

**Protection Strategy:**
- ✅ Email verification (Sprint 4)
- ✅ Backend rate limiting (Sprint 4)
- ✅ Social login protection (Sprint 4)
- ✅ Entra baseline security (automatic)
- ✅ Sign-up monitoring (Sprint 5)

**Cost:** $0 (all FREE protections)

**When to Reconsider:**
- Experiencing actual bot attack with thousands of fake sign-ups
- FREE protections prove insufficient
- Revenue supports enterprise fraud detection expense

---


---

### Part 15: Troubleshooting & Known Issues ⚠️ CRITICAL

**Status:** ⚠️ CRITICAL - Prevent common implementation issues

**Source:** [Troubleshooting & Known Issues](https://learn.microsoft.com/en-us/entra/external-id/customers/troubleshooting-known-issues)

**Purpose:** Document known problems and their solutions to avoid issues during Sprint 4 implementation.

---

#### Known Issue 1: Admin Account Email Conflict ⚠️

**Problem:**
Using the same email address for both admin account and customer account causes privilege loss.

**Symptom:**
- Admin loses administrative access to tenant
- Cannot access Microsoft Entra admin center with admin privileges
- "The least-privileged account takes precedence"

**Root Cause:**
- Entra prioritizes customer account (lower privilege) over admin account (higher privilege)
- When same email used for both, admin capabilities removed

**Solution:**
✅ **Use different email addresses for admin and customer accounts**

**FoodBudget Implementation:**
- ✅ **Admin email:** Your personal Azure account email
- ❌ **DO NOT create customer account** with same email as admin
- ✅ **Test accounts:** Use different emails (test1@example.com, test2@example.com)
- ✅ **Your user account:** Use different email if you want to test as customer

**Workaround (If Already Occurred):**
- Access global admin portal: `https://entra.microsoft.com`
- Instead of tenant-specific URL
- May restore admin access temporarily

**Prevention (Sprint 4):**
- Document admin email in Phase 1, Task 0
- Never sign up as customer using admin email
- Use test emails for customer testing

---

#### Known Issue 2: Web API Token Version Configuration ⚠️ CRITICAL

**Problem:**
Backend API cannot validate access tokens - authentication fails with cryptographic error.

**Error Message:**
```
IDX20804: Unable to retrieve document from:
https://<tenant>.ciamlogin.com/common/discovery/keys
```

**Symptom:**
- Mobile app gets access token successfully
- API rejects token with validation error
- Cannot call protected endpoints
- 401 Unauthorized responses

**Root Cause:**
- API app registration manifest has `accessTokenAcceptedVersion: null`
- Defaults to v1 tokens
- Mobile app sends v2 tokens
- Version mismatch causes validation failure

**Solution:**
✅ **Set `accessTokenAcceptedVersion` to `2` in API app registration manifest**

**FoodBudget Implementation (Sprint 4, Phase 1, Task 2):**

**Step 1: Open API App Registration**
1. Navigate to Microsoft Entra admin center
2. Go to **App registrations** → **FoodBudget API**
3. Select **Manifest** from left menu

**Step 2: Modify Manifest**
1. Find `accessTokenAcceptedVersion` property (near top of file)
2. Change from:
   ```json
   "accessTokenAcceptedVersion": null,
   ```
3. To:
   ```json
   "accessTokenAcceptedVersion": 2,
   ```
4. Click **Save**

**Step 3: Verify**
1. Manifest saved successfully
2. Value shows as `2` (not null)
3. Ready for token validation

**Why This Matters:**
- **V1 tokens:** Legacy format, limited claims
- **V2 tokens:** Modern format, full claims, better security
- External ID issues v2 tokens by default
- API must accept v2 tokens to work

**When to Apply:**
- ⚠️ **CRITICAL:** Apply during Sprint 4, Phase 1, Task 2 (app registration)
- Before testing authentication with mobile app
- Prevents hours of debugging token validation issues

**Testing:**
- After fix: Mobile app can call protected API endpoints
- Token validation succeeds
- User claims accessible in controllers

---

#### Additional Known Issues (Not Yet Encountered)

**None documented in Microsoft guide.**

Other potential issues may exist but are not officially documented yet. Check Microsoft's troubleshooting page for updates:
https://learn.microsoft.com/en-us/entra/external-id/customers/troubleshooting-known-issues

---

#### General Troubleshooting Tips

**Sign-Up Not Working:**
- Verify user flow created and configured
- Check app associated with user flow
- Test with "Run user flow" feature
- Check authentication methods enabled (email, social)

**Social Login Not Appearing:**
- Verify identity provider added (Google, Facebook, Apple)
- Check identity provider associated with user flow
- Verify client ID/secret configured correctly
- Check redirect URIs match exactly

**Password Reset Not Working:**
- Verify Email OTP authentication method enabled
- Check "Show self-service password reset" enabled in branding
- Verify user has email address (not social-only)
- Test SSPR link visibility on sign-in page

**API Authentication Failing:**
- ⚠️ Check `accessTokenAcceptedVersion: 2` in API manifest (Issue 2)
- Verify API permissions granted with admin consent
- Check authority URL matches tenant (`https://foodbudget.ciamlogin.com`)
- Verify API scope configured correctly (`api://<client-id>/access_as_user`)

**Mobile App Not Authenticating:**
- Verify redirect URI configured for platform
- Check client ID matches app registration
- Verify tenant URL correct (`foodbudget.ciamlogin.com`)
- Check MSAL configuration (authority, scopes)

---


---

## 8. Resources & Documentation

### Official Microsoft Documentation

**Read & Analyzed:**
- ✅ [External ID Overview](https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview)
- ✅ [Tenant Configurations](https://learn.microsoft.com/en-us/entra/external-id/tenant-configurations)
- ✅ [Supported Features in External Tenants](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-supported-features-customers) ⭐ MAJOR FINDING
- ✅ [External ID Pricing](https://learn.microsoft.com/en-us/entra/external-id/external-identities-pricing) 🎉 EXCELLENT NEWS
- ✅ [CIAM Overview for Customers](https://learn.microsoft.com/en-us/entra/external-id/customers/overview-customers-ciam) 🎯 IMPLEMENTATION GUIDE
- ✅ [Security Features in External Tenants](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-security-customers) 🛡️ **SECURITY BASELINE**
- ✅ [Multifactor Authentication (MFA)](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-multifactor-authentication-customers) 🔐 **MFA DEEP DIVE**
- ✅ [Native Authentication Concepts](https://learn.microsoft.com/en-us/entra/identity-platform/concept-native-authentication) 🔍 **CLARIFICATION** (Alternative approach)
- ✅ [User Profile Attributes](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-user-attributes) 📝 **USER DATA COLLECTION**
- ✅ [Authentication Methods](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-authentication-methods-customers) 🔐 **SIGN-IN OPTIONS**
- ✅ [Quickstart: Tenant Setup](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-tenant-setup) 📋 TENANT CREATION
- ✅ [How-To: Create External Tenant via Portal](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-create-external-tenant-portal) 📋 **TENANT CREATION GUIDE**
- ✅ [Quickstart: Register an Application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app) 📝 **APP REGISTRATION**
- ✅ [How-To: Create Sign-Up and Sign-In User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-sign-up-sign-in-customers) 🔐 **USER FLOW CREATION**
- ✅ [How-To: Disable Sign-Up in User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-disable-sign-up-user-flow) 🔒 **OPTIONAL POST-LAUNCH**
- ✅ [How-To: Add Application to User Flow](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-flow-add-application) 🔗 **APP ASSOCIATION**
- ✅ [How-To: Test User Flows](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-test-user-flows) 🧪 **TESTING GUIDE**
- ✅ [How-To: Enable Password Reset](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-enable-password-reset-customers) 🔑 **SSPR (MVP)**
- ✅ [How-To: Sign-In Aliases (Username Support)](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-sign-in-alias) 🔤 **OPTIONAL POST-LAUNCH**
- ✅ [How-To: Google Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-google-federation-customers) 🔵 **GOOGLE SIGN-IN (MVP)**
- ✅ [How-To: Facebook Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-facebook-federation-customers) 🔵 **FACEBOOK LOGIN (MVP)**
- ✅ [How-To: Apple Federation](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-apple-federation-customers) 🍎 **APPLE SIGN IN (MVP)**
- ✅ [How-To: Multifactor Authentication](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-multifactor-authentication-customers) 🔐 **MFA (DEFERRED - Story 6.10)**
- ✅ [How-To: Use App Roles](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-use-app-roles-customers) 🛡️ **APP ROLES/RBAC (DEFERRED - Story 6.11)**
- ✅ [Tutorial: Configure WAF with External ID](https://learn.microsoft.com/en-us/entra/external-id/customers/tutorial-configure-external-id-web-app-firewall) 🚫 **WAF (NOT APPLICABLE - Too expensive)**
- ✅ [How-To: Integrate Fraud Protection](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-integrate-fraud-protection) 🚫 **FRAUD PROTECTION (NOT NEEDED - Using FREE alternatives)**
- ✅ [How-To: Manage Admin Accounts](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-manage-admin-accounts) 👤 **ADMIN MANAGEMENT (OPERATIONAL)**
- ✅ [How-To: Manage Customer Accounts](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-manage-customer-accounts) 👥 **CUSTOMER MANAGEMENT (OPERATIONAL)**
- ✅ [Troubleshooting & Known Issues](https://learn.microsoft.com/en-us/entra/external-id/customers/troubleshooting-known-issues) ⚠️ **CRITICAL - Known issues and fixes**
- ✅ [How-To: User Insights](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-insights) 📊 **MONITORING (Built-in analytics)**
- ✅ [Concept: Sign-Ups Monitoring](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ups) 📊 **MONITORING (Sign-up logs)**
- ✅ [How-To: Azure Monitor](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-azure-monitor) 📊 **MONITORING (Advanced - Sprint 5)**
- ✅ [How-To: Delete External Tenant](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-delete-external-tenant-portal) 🗑️ **OPERATIONAL REFERENCE**
- ✅ [Quickstart: Get Started Guide](https://learn.microsoft.com/en-us/entra/external-id/customers/quickstart-get-started-guide) 🔧 GUIDED SETUP
- ✅ [Concept: Guide Explained](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-guide-explained) 📖 GET STARTED REFERENCE
- ✅ [Branding Customization](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-branding-customers) 🎨 **BRANDING OPTIONS**
- ✅ [Custom URL Domains](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-custom-url-domain) 🌐 OPTIONAL DOMAIN BRANDING
- ✅ [Custom Authentication Extensions](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-custom-extensions) 🔌 **ADVANCED WEBHOOKS**
- ✅ [FAQ - Frequently Asked Questions](https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers) ❓ **KEY CLARIFICATIONS**
- ✅ [VS Code Extension](https://learn.microsoft.com/en-us/entra/external-id/customers/visual-studio-code-extension) ⚠️ VS CODE ONLY
- ✅ [App Service Authentication with External ID](https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service?toc=%2Fentra%2Fexternal-id%2Ftoc.json&bc=%2Fentra%2Fexternal-id%2Fbreadcrumb%2Ftoc.json&tabs=external-configuration) 🎯 **PRIMARY for Backend**
- ✅ [Planning Your External ID Solution](https://learn.microsoft.com/en-us/entra/external-id/customers/concept-planning-your-solution) 🗺️ **STRATEGIC FRAMEWORK**
- ✅ [What's New in External ID](https://learn.microsoft.com/en-us/entra/external-id/whats-new-docs?tabs=external-tenants) - Recent updates reviewed
- ✅ [ASP.NET Core Web API Tutorial](https://learn.microsoft.com/en-us/entra/identity-platform/tutorial-web-api-dotnet-core-build-app) (Partial)

**Checked but Not Relevant:**
- ❌ [JetBrains IDE Services: Microsoft Entra ID](https://www.jetbrains.com/help/ide-services/microsoft-entra-id.html) - Enterprise auth TO JetBrains platform, not for building apps
- ❌ [Woodgrove Groceries Demo](https://learn.microsoft.com/en-us/entra/external-id/customers/overview-solutions-customers) - Demo showcase, no implementation value
- ❌ [Direct Federation Overview](https://learn.microsoft.com/en-us/entra/external-id/direct-federation-overview) - B2B enterprise federation (SAML/WS-Fed), not for consumer apps

**Checked but Limited Relevance:**
- ⚪ What's New page: Recent updates focus on enterprise features (SAML SSO, MFA telephony). No React Native, MSAL, or mobile-specific updates mentioned.

**Need to Find:**
- ✅ Microsoft Entra admin center URL (https://entra.microsoft.com) ✅ FOUND
- ✅ Supported features comparison ✅ FOUND & ANALYZED
- 🔍 **App Service Auth + ASP.NET Core integration** (CRITICAL for backend API protection)
  - 🔍 Do you need `[Authorize]` attributes?
  - 🔍 How to access user claims in code?
  - 🔍 Can you have public + protected endpoints?
  - 🔍 How to implement authorization (roles/permissions)?
  - 🔍 Local development/testing approach?
- 🔍 Self-service sign-up flow configuration guide
- 🔍 **React Native MSAL integration** (CRITICAL - or confirmation it's not supported)
- 🔍 "Native authentication" definition and implementation guide
- 🔍 MSAL React Native package compatibility with external tenants
- 🔍 Token reference (claim names for external tenants)

### Community Resources
- 🔍 [GitHub: damienbod/EntraExternalIdCiam](https://github.com/damienbod/EntraExternalIdCiam) - Needs analysis

### Sample Applications
- 🔍 Need to find official Microsoft samples for external tenants
- 🔍 JavaScript/React samples (as reference for mobile)

---

## Next Steps

### Immediate Research Priorities

**Priority 1: React Native Support (CRITICAL)**
- [ ] Search Microsoft Learn for React Native samples
- [ ] Check MSAL React Native package documentation
- [ ] Determine if supported or need alternative approach

**Priority 2: Backend Configuration (HIGH)**
- [ ] Find complete appsettings.json example
- [ ] Document Instance and Authority URL formats
- [ ] Verify token claim names
- [ ] Document scope registration process

**Priority 3: Tenant Setup (HIGH)**
- [ ] Find external tenant creation guide
- [ ] Document step-by-step setup process
- [ ] Screenshot configuration UI
- [ ] Document flow creation process

**Priority 4: Pricing** ✅ COMPLETE
- [x] Find pricing documentation
- [x] Document free tier limits (50,000 MAU)
- [x] Understand billing model (MAU-based)
- [ ] Optional: Compare detailed paid tier pricing to B2C costs

---

## 8. Appendix

### 8.1 Condensed Change Log

**2025-01-29 - Research Phase Complete**

**Documents Analyzed:** 24 Microsoft documentation pages

**Key Milestones:**
- ✅ Platform decision confirmed (External ID, not B2C)
- ✅ Tenant type decided (External tenant)
- ✅ Authentication methods decided (Email+Password + Google/Facebook/Apple)
- ✅ Security approach decided (Baseline security, no MFA for MVP)
- ✅ User attributes decided (Email + Display Name only)
- ✅ Branding decided (Essential customization, portal-based)
- ✅ Custom domain deferred (Cost savings: $50-100/month)
- ✅ Custom extensions deferred (Complexity reduction)
- ✅ Native authentication rejected (React Native not supported, violates OAuth 2.0)
- ✅ Industry standards validated (Browser-based authentication = 95%+ adoption)

**Decisions Made:** 8 core MVP decisions
**Features Deferred:** 3 post-MVP enhancements
**Cost Analysis:** $0 for MVP (50K MAU free tier)
**Story Readiness:** 5 of 8 stories 100% ready, 3 pending final research

**Remaining Research:**
- React Native MSAL package name and configuration
- App Service auth + ASP.NET Core integration details

---

