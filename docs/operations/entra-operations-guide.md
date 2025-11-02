# Microsoft Entra External ID Operations Guide

**🔧 POST-LAUNCH OPERATIONAL PROCEDURES**

**Purpose:** This document contains operational procedures for managing Microsoft Entra External ID after Sprint 4 launch. Use this for admin account management, customer account management, and monitoring.

**For Sprint 4 Implementation:** See [Implementation Guide](../entra-external-id-setup-guide.md)
**For Research History:** See [Research Archive](../archive/entra-research-archive.md)

**Last Updated:** 2025-01-29 (Created during documentation cleanup)

**When to Use This Guide:**
- After completing Sprint 4 implementation
- When managing admin accounts post-launch
- For customer account troubleshooting and management
- Setting up monitoring and observability (Sprint 5)

---

## Table of Contents

1. [Managing Admin Accounts](#managing-admin-accounts)
2. [Managing Customer Accounts](#managing-customer-accounts)
3. [Monitoring & Observability](#monitoring--observability)

---

### Part 13: Managing Admin Accounts (Operational)

**Status:** ✅ OPERATIONAL REFERENCE - Configure once during tenant setup

**Source:** [How-To: Manage Admin Accounts](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-manage-admin-accounts)

**What Admin Accounts Are:**
- Administrators who manage the Entra External ID tenant (NOT customer/end-users)
- Users with assigned admin roles to configure tenant settings, apps, user flows, branding, etc.
- Different from regular customer accounts (which have default user permissions only)

**Who Needs Admin Accounts:**
- **You** - To configure and manage the external tenant
- Minimum requirement: At least one admin (Global Administrator)
- When you create the tenant, you automatically become Global Administrator

**Common Admin Roles:**
- **Global Administrator:** Full access to all tenant features (highest privilege)
- **User Administrator:** Manage users, assign non-admin roles
- **Application Administrator:** Manage app registrations
- **Security Administrator:** Manage security features, policies
- **Organizational Branding Administrator:** Manage company branding
- **Authentication Extensibility Administrator:** Manage custom auth extensions
- **Privileged Role Administrator:** Assign admin roles to users

---

#### FoodBudget Admin Setup

**MVP Configuration:**
- ✅ **Single admin** (you) - Sufficient for MVP
- ✅ **Global Administrator role** (automatic when creating tenant)
- ✅ **MFA enabled** on admin account (security best practice)
- ❌ **NO break-glass account** for MVP (can add post-MVP)
- ❌ **NO additional admins** for MVP (just you)

**Admin Account Security:**
- ✅ **Enable MFA** (Sprint 4, Phase 1, Task 0)
- ✅ Personal Azure account likely already has MFA enabled
- ✅ Protects against account compromise
- ✅ Industry best practice for all Azure administrators

**When You'll Use Admin Access:**
- Creating external tenant
- Registering applications
- Configuring user flows
- Adding identity providers (Google, Facebook, Apple)
- Configuring branding
- Managing security settings
- Monitoring users and sign-ups

---

#### Creating Additional Admin Accounts (Post-MVP)

**Method 1: Direct Creation (Internal Admin)**
1. Sign in to [Entra admin center](https://entra.microsoft.com)
2. Navigate to **Users** → **Create new user**
3. Enter identity information (user principal name, display name, password)
4. Assign roles via **Assignments** tab
5. Can assign up to 20 roles per user

**Method 2: Invitation (External Admin)**
1. Select **Invite external user (Preview)**
2. Provide external email address and optional message
3. Assign roles before sending invitation
4. External user accepts invite to gain admin access

**Managing Admin Roles:**
- Add/change/remove roles anytime via user's "Assigned roles" section
- Deleted users recoverable for 30 days
- Review all role assignments via "Roles & admins" section (audit)

---

#### Security Best Practices

**Recommended for Production (Post-MVP):**
- ✅ Protect all admin accounts with MFA
- ✅ Maintain two cloud-only "break-glass" emergency access accounts
- ✅ Break-glass accounts have Global Administrator role
- ✅ Store break-glass credentials securely (disaster recovery)
- ✅ Review role assignments regularly (audit)

**Break-Glass Account:**
- Emergency access account for disaster scenarios
- Cloud-only (not synced from on-premises)
- Stored securely offline (password safe, physical vault)
- Only used if primary admin account locked out/compromised
- Should be tested periodically to ensure it works

**FoodBudget MVP Decision:**
- ❌ **NOT implementing break-glass account for MVP**
- Rationale: Solo developer, MVP stage, low complexity
- Can add break-glass account post-MVP if team expands

---

#### Admin Account vs. Customer Account

**Key Differences:**

| Feature | Admin Account | Customer Account |
|---------|--------------|------------------|
| Purpose | Manage tenant configuration | Use FoodBudget app |
| Created | Via Entra admin center | Via app sign-up flow |
| Roles | Global Admin, User Admin, etc. | Default user permissions |
| MFA | Required (best practice) | Optional (Story 6.10) |
| Access | Entra admin center | FoodBudget mobile app |
| Count | 1 (you) for MVP | Thousands (end-users) |

**Important:**
- Admin accounts manage the authentication system
- Customer accounts use the authentication system
- You are admin (manage tenant), NOT customer (use app)
- Don't mix admin and customer accounts

---

#### FoodBudget Implementation

**Sprint 4, Phase 1, Task 0:**
1. Verify admin access to Microsoft Entra admin center
2. Enable MFA on admin account (if not already enabled)
3. Document admin email address
4. Verify Tenant Creator permissions
5. Proceed with tenant creation (Task 1)

**Post-Tenant Creation:**
- You automatically become Global Administrator
- Full access to configure all tenant features
- No additional admin setup needed for MVP

**Post-MVP Considerations:**
- Add break-glass account if moving to production
- Add team members as admins if expanding team
- Regular audit of admin role assignments
- Enable Privileged Identity Management (PIM) for admin access governance

---

#### Important Notes

**MVP Simplicity:**
- Just you as admin (no additional admins)
- MFA on your personal Azure account
- No break-glass account (can add later)
- Sufficient for MVP development and testing

**Production Considerations (Post-MVP):**
- Add break-glass account (emergency access)
- Consider second admin for redundancy
- Enable PIM for time-limited admin access
- Regular security audits of admin accounts
- Separate admin accounts from daily-use accounts

**Cost:** FREE (admin accounts have no additional cost)

**When to Expand:**
- Adding team members (developers, support staff)
- Moving to production (break-glass account)
- Compliance requirements (SOC 2, audit trail)
- Organizational growth (multiple administrators)

---


---

### Part 14: Managing Customer Accounts (Operational)

**Status:** ✅ OPERATIONAL REFERENCE - View and manage end-users during development

**Source:** [How-To: Manage Customer Accounts](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-manage-customer-accounts)

**What Customer Accounts Are:**
- End-users (consumers) who use FoodBudget mobile app
- Created automatically when users sign up through your app (self-registration)
- Different from admin accounts (no admin roles, default user permissions only)
- Represent actual FoodBudget users who create recipes, sign in, etc.

**How Customers Are Created:**
- **Primary method:** Self-registration through app sign-up flow (most common)
- Users click "Sign Up" in app → Enter email/password or use social login → Account created automatically
- **Secondary method:** Manual creation via admin center (for testing, support)

**Admin vs. Customer Accounts:**

| Feature | Admin Account | Customer Account |
|---------|--------------|------------------|
| Purpose | Manage tenant configuration | Use FoodBudget app |
| Created | Via Entra admin center | Via app sign-up flow |
| Roles | Global Admin, User Admin, etc. | Default user permissions |
| Count | 1 (you) for MVP | Thousands (end-users) |
| Management | Part 13 | Part 14 (this section) |

---

#### Viewing Customer Accounts

**Access User List:**
1. Sign in to [Entra admin center](https://entra.microsoft.com)
2. Switch to external tenant
3. Navigate to **Entra ID** → **Users**
4. See all customer accounts (self-registered and manually created)

**User Properties Visible:**
- Email address (sign-in method)
- Display name
- Creation date
- Last sign-in date
- Object ID
- User type (Member)

**Use Cases:**
- Monitor user growth (how many users signed up?)
- Verify test user creation during development
- Search for specific user (support troubleshooting)
- View user sign-in activity
- Check which authentication method used (email, Google, Facebook, Apple)

---

#### Creating Test Accounts Manually (Development)

**When to Use:**
- Creating test accounts during development
- Support scenarios (create account for user who can't register)
- Testing different user scenarios

**Steps:**
1. Sign in to [Entra admin center](https://entra.microsoft.com)
2. Navigate to **Entra ID** → **Users**
3. Select **New user** → **Create new external user**
4. Enter:
   - **Email:** Test email address (e.g., `test1@example.com`)
   - **Display name:** Test user name (e.g., "Test User 1")
5. Copy autogenerated password
6. Provide password to user (or store securely for testing)
7. User changes password at first sign-in

**Important Notes:**
- Requires **User Administrator** permissions or higher
- Password valid indefinitely until user changes it
- User must change password on first sign-in
- This creates local account (email + password)
- Cannot manually create social login accounts (Google, Facebook, Apple)

**FoodBudget Development:**
- Create 2-3 test accounts for development testing
- Test sign-up flow for real users (self-registration)
- Use test accounts to verify authentication, recipe creation, etc.

---

#### Managing Customer Accounts

**Password Reset (Support Scenario):**
1. Navigate to **Users** → Select user
2. Select **Reset password**
3. Temporary password generated automatically
4. Provide temporary password to user
5. User creates permanent password at next sign-in

**Use Cases:**
- User forgot password and SSPR doesn't work
- User locked out of account
- Support troubleshooting

**Deleting Customer Accounts:**
1. Navigate to **Users** → Select user
2. Click **Delete**
3. User soft-deleted (recoverable for 30 days)
4. After 30 days: Automatically permanently deleted
5. Manual permanent delete: **Deleted users** → Select user → **Delete permanently**

**Use Cases:**
- Clean up test accounts during development
- GDPR data deletion requests (Story 7.4 - backlog)
- Remove spam/bot accounts
- User requested account deletion

**Recovery:**
- Soft-deleted users recoverable for 30 days
- Navigate to **Deleted users** → Select user → **Restore**
- After permanent deletion: NO recovery

---

#### FoodBudget Customer Account Strategy

**MVP Approach:**
- ✅ **Self-registration only** - Users sign up through app
- ✅ **Manual test accounts** - Create 2-3 for development testing
- ✅ **View users** - Monitor sign-ups in admin center
- ✅ **Delete test accounts** - Clean up after testing
- ❌ **NO bulk operations** - Not needed for MVP
- ❌ **NO custom properties** - Use default fields only
- ❌ **NO account management UI** - Just authentication for MVP

**Account Creation Flow (Production):**
1. User opens FoodBudget app
2. User clicks "Sign Up"
3. User chooses:
   - Email + password (local account)
   - Google (social login)
   - Facebook (social login)
   - Apple (social login)
4. Entra creates customer account automatically
5. User redirected to app
6. User can now use FoodBudget

**Admin Center Usage (Development & Production):**
- **Development:** View test users, delete test accounts
- **Production:** Monitor user growth, troubleshoot issues, GDPR deletion

---

#### Customer Account Management Features

**Implemented in Sprint 4:**
- ✅ **Sign-up flow** - Users create accounts via app
- ✅ **Sign-in flow** - Users authenticate with email or social login
- ✅ **Sign-out** - Users end session
- ✅ **Password reset (SSPR)** - Self-service password reset (Phase 2, Task 5)

**NOT in MVP (Deferred):**
- ❌ **Profile editing** - Change display name, email (defer to post-MVP)
- ❌ **Account deletion** - User-initiated deletion (Story 7.4 - GDPR)
- ❌ **Change password** - While logged in (Story 7.3 - backlog)
- ❌ **Email verification** - Optional (can add if needed)
- ❌ **Account linking** - Link social accounts (advanced feature)

**Why MVP is Simple:**
- Focus on authentication working correctly
- Users can sign up, sign in, use app
- Advanced account management deferred to post-MVP
- Reduces Sprint 4 complexity

---

#### Limitations & Notes

**Not Covered in Microsoft Docs:**
- Search/filter functionality not explicitly documented (likely exists in admin center)
- Bulk operations not covered (import/export users)
- User property customization not detailed
- Lifecycle management features not mentioned

**FoodBudget Context:**
- Small user base for MVP (< 100 users expected)
- Manual management via admin center sufficient
- No bulk operations needed
- Can add advanced features post-MVP if needed

**Important:**
- Customer accounts created automatically by sign-up flow
- Admin center used for viewing and troubleshooting only
- No additional implementation needed for customer account creation
- Users manage their own accounts via SSPR and app

---

#### Troubleshooting Customer Accounts

**Common Scenarios:**

**User can't sign in:**
- Verify account exists: **Users** → Search by email
- Check account status (not deleted, not blocked)
- Reset password via admin center
- Verify user using correct authentication method (email vs. social)

**Test account not appearing:**
- Check correct tenant selected (external tenant)
- Refresh user list
- Verify sign-up completed successfully (check app logs)
- Check if user soft-deleted accidentally

**Need to delete test accounts:**
- Navigate to **Users** → Select multiple test users
- Click **Delete** → Confirm
- Users soft-deleted (recoverable for 30 days)

**User forgot which method they signed up with:**
- Check user properties in admin center
- Look at authentication method (email, Google, Facebook, Apple)
- User can try each method to find correct one

---

#### Cost Considerations

**MAU (Monthly Active Users):**
- Customer accounts count toward MAU if they sign in at least once per month
- **0-50,000 MAU:** FREE
- **50,001+ MAU:** Paid tiers
- Deleted accounts don't count as MAU
- Inactive accounts (no sign-in) don't count as MAU

**Storage:**
- Customer accounts stored in Entra database (FREE)
- Minimal storage per user (email, display name, metadata)
- No additional cost for storing thousands of user accounts

**FoodBudget Impact:**
- Expect < 100 users for MVP (well under 50K free tier)
- No cost concerns for customer accounts
- Can scale to 50,000 MAU before any charges

---


---

### Part 16: Monitoring & Observability (Brief Overview)

**Status:** 📊 REFERENCE - Available for monitoring, defer detailed setup to Sprint 5

**Purpose:** Overview of monitoring capabilities available in Entra External ID. Detailed implementation covered in Sprint 5, Story 5.2 (Application Performance Monitoring).

---

#### User Insights (Built-In Analytics)

**Source:** [How-To: User Insights](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-user-insights)

**What It Provides:**
- Built-in analytics dashboard in Microsoft Entra admin center
- Daily/monthly active users (DAU/MAU)
- Authentication patterns and geographic breakdowns
- OS distributions and per-app comparisons
- MFA usage metrics

**Access:**
- Navigate to **Entra ID** → **Monitoring & health** → **Usage & insights** → **Application user activity**
- Requires **Reports Reader** role (minimum)
- Automatically available (zero setup)

**FoodBudget Usage:**
- Monitor user growth post-launch
- Track authentication patterns
- Geographic distribution of users
- OS breakdown (iOS vs. Android)

**Cost:** FREE (automatically available)

**When to Use:** Post-launch monitoring, growth tracking

---

#### Sign-Ups Monitoring

**Source:** [Concept: Sign-Ups](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ups)

**What It Provides:**
- Logs all sign-up events (successful and failed)
- Conversion rate analysis
- Drop-off point identification
- Social vs. local account comparison
- Accessed via Microsoft Graph API

**FoodBudget Usage:**
- Optimize sign-up conversion rates
- Identify friction points in registration flow
- Compare social login vs. email sign-up rates
- Improve user onboarding experience

**Cost:** FREE (automatic logging)

**When to Use:** Sprint 5+ for sign-up optimization

---

#### Azure Monitor Integration (Advanced)

**Source:** [How-To: Azure Monitor](https://learn.microsoft.com/en-us/entra/external-id/customers/how-to-azure-monitor)

**What It Provides:**
- Send diagnostic logs to Azure Monitor / Log Analytics
- Centralized logging and alerting
- Audit logs (admin actions, config changes)
- Sign-in logs (authentication activity)
- Custom queries with Kusto Query Language (KQL)

**Setup Complexity:**
- Requires Azure Lighthouse configuration
- Workforce tenant + external tenant setup
- Resource groups and Log Analytics workspace
- Diagnostic settings configuration

**Cost:**
- Log Analytics ingestion charges
- 30-day retention default (FREE)
- Extended retention (up to 2 years) costs extra

**FoodBudget Decision:**
- ⏸️ **Defer to Sprint 5** (Story 5.2 - Application Performance Monitoring)
- Complex setup not needed for MVP
- Will configure proper observability in Sprint 5 alongside Sentry/Application Insights

**When to Implement:**
- Sprint 5 as part of comprehensive observability
- Production deployment requires monitoring
- Part of Story 5.2 (APM)

---

#### Monitoring Strategy Summary

**MVP (Sprint 4):**
- ✅ Use built-in User Insights dashboard (automatic, FREE)
- ✅ Sign-up monitoring for basic metrics (automatic)
- ❌ Skip Azure Monitor setup (defer to Sprint 5)

**Sprint 5 (Observability Story):**
- ✅ Configure Azure Monitor with Log Analytics
- ✅ Set up Application Insights or Sentry
- ✅ Custom alerts for critical events
- ✅ Sign-up monitoring integration
- ✅ Performance tracking and error reporting

**Cost:**
- Sprint 4: $0 (use built-in features)
- Sprint 5: ~$2-30/month (Application Insights + retention)

---

