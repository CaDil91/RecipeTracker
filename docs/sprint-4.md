# Sprint 4: User Management & Authentication

## Sprint Goal
Transform the recipe demo into a production-ready application with user authentication, secure data isolation, and personalized recipe management.

**Timeline:** 3-4 weeks  
**Focus:** User authentication, database security, and user-scoped data management

---

## Story Ordering & Dependencies

```
Story 1: Database Schema (Foundation)
    ↓
Story 2: Backend User API (Register, Login, Profile)
    ↓
Story 3: JWT Authentication & Security (Tokens, Middleware)
    ↓
Story 4: Frontend Authentication (Screens, Context, Navigation)
    ↓
Story 5: User-Scoped Recipe Data (Data Isolation)
    ↓
Story 6: Password Reset Flow (Requires Stories 1-3)
    ↓
Story 7: Email Verification (Optional - Requires Story 6)
```

---

# Story 1: Database Schema - User Management Foundation

**Priority:** HIGH  
**Type:** Database & Backend Infrastructure  
**Dependencies:** None  
**Estimated Effort:** Medium

## User Story
> As a developer, I need a user management database schema so that recipes can be associated with specific users and properly isolated.

## Acceptance Criteria
- ✅ User table created with proper schema (id, email, password_hash, name, created_at)
- ✅ Recipe table updated with user_id foreign key
- ✅ Database indexes created for performance (user.email, recipe.user_id)
- ✅ Migration script handles existing data (assigns to system user)
- ✅ All existing recipes associated with default system user
- ✅ Database constraints ensure referential integrity

## Technical Notes
**User Table Fields:**
- id (GUID primary key)
- email (unique, indexed)
- password_hash (BCrypt hashed)
- name (optional)
- created_at (timestamp)

**Recipe Table Changes:**
- Add user_id foreign key to users table
- Index on (user_id, created_at) for efficient queries

**Data Migration Strategy:**
- Create system user for existing recipes
- Assign all orphaned recipes to system user
- Prevent data loss during migration

## Files to Create
- Backend: `Entities/User.cs`
- Backend: `Migrations/xxxx_CreateUserTable.cs`
- Backend: `Migrations/xxxx_AddUserIdToRecipes.cs`

## Files to Modify
- Backend: `Entities/Recipe.cs` (add User navigation property)
- Backend: `Data/ApplicationDbContext.cs` (add User DbSet)

---

# Story 2: Backend API - User Management Endpoints

**Priority:** HIGH  
**Type:** Backend API Development  
**Dependencies:** Story 1  
**Estimated Effort:** Medium

## User Story
> As a user, I want to register for an account and log in so that I can access my personal recipe collection.

## Acceptance Criteria
- ✅ POST /api/auth/register endpoint (email, password, name)
- ✅ POST /api/auth/login endpoint (email, password)
- ✅ GET /api/users/profile endpoint (authenticated)
- ✅ PUT /api/users/profile endpoint (update name)
- ✅ Input validation for all endpoints (email format, password strength)
- ✅ Password hashing with BCrypt
- ✅ Proper error handling and HTTP status codes
- ✅ API documentation updated (Swagger)
- ✅ Unit tests for all endpoints

## Technical Notes
**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Error Responses:**
- 400: Validation errors (weak password, invalid email)
- 401: Invalid credentials
- 409: Email already exists
- 500: Server errors

**DTOs:**
- RegisterRequestDto, LoginRequestDto
- AuthResponseDto (includes user info)
- UserDto (profile information)

## Files to Create
- Backend: `Controllers/AuthController.cs`
- Backend: `Controllers/UsersController.cs`
- Backend: `Services/IUserService.cs`
- Backend: `Services/UserService.cs`
- Backend: `Models/DTOs/Requests/RegisterRequestDto.cs`
- Backend: `Models/DTOs/Requests/LoginRequestDto.cs`
- Backend: `Models/DTOs/Responses/AuthResponseDto.cs`
- Backend: `Models/DTOs/Responses/UserDto.cs`

---

# Story 3: JWT Authentication & Security

**Priority:** HIGH  
**Type:** Security & Authentication  
**Dependencies:** Story 2  
**Estimated Effort:** Large

## User Story
> As a system administrator, I need secure JWT token authentication so that user sessions are protected and API access is properly controlled.

## Acceptance Criteria
- ✅ JWT middleware implemented for authentication
- ✅ Access tokens (15 minute expiry)
- ✅ Refresh tokens (7 day expiry)
- ✅ Token refresh endpoint (POST /api/auth/refresh)
- ✅ All recipe endpoints protected with [Authorize] attribute
- ✅ Security headers middleware (CORS, CSP)
- ✅ Rate limiting on auth endpoints (max 5 login attempts per IP per minute)
- ✅ Account lockout after 5 failed login attempts (15 minute lockout)
- ✅ Security audit logging (login attempts, password changes)
- ✅ Integration tests for JWT authentication flow

## Technical Notes
**JWT Configuration:**
- Secret key from Azure Key Vault (production)
- Proper issuer and audience claims
- User ID and email in token claims

**Security Enhancements:**
- Rate limiting per IP address
- Account lockout mechanism (5 failed attempts = 15min lockout)
- Audit logging for security events
- HTTPS enforcement in production

**Token Service:**
- Generate access and refresh tokens
- Validate token signatures
- Handle token expiration
- Revoke tokens on logout

## Files to Create
- Backend: `Services/ITokenService.cs`
- Backend: `Services/TokenService.cs`
- Backend: `Middleware/JwtMiddleware.cs`
- Backend: `Models/JwtSettings.cs`

## Files to Modify
- Backend: `Controllers/RecipesController.cs` (add [Authorize])
- Backend: `Services/RecipeService.cs` (filter by authenticated user)
- Backend: `Program.cs` (register auth services)
- Backend: `appsettings.json` (JWT configuration)

---

# Story 4: Frontend Authentication Integration

**Priority:** HIGH  
**Type:** Frontend Authentication  
**Dependencies:** Story 3  
**Estimated Effort:** Large

## User Story
> As a user, I want to log in with my credentials so that I can access my personal recipe collection.

## Acceptance Criteria
- ✅ LoginScreen with email/password form
- ✅ RegisterScreen with validation
- ✅ AuthContext for app-wide authentication state
- ✅ AuthService for API integration (login, register, logout)
- ✅ Secure token storage (AsyncStorage for mobile)
- ✅ Navigation guards for authenticated routes
- ✅ Logout functionality clears tokens and state
- ✅ Loading states during authentication
- ✅ Error handling with user-friendly messages
- ✅ Auto-redirect to login if token expires
- ✅ MSW handlers for auth endpoints
- ✅ Integration tests for auth flows

## Technical Notes
**Authentication Flow:**
- Unauthenticated: Show AuthNavigator (Login/Register screens)
- Authenticated: Show MainNavigator (Recipe app)
- Loading: Show SplashScreen while checking token

**Token Management:**
- Store access and refresh tokens securely
- Auto-refresh tokens before expiry
- Clear tokens on logout
- Handle 401 responses globally

**Form Validation:**
- Zod schemas for email and password
- Real-time validation feedback
- Progressive disclosure of errors

## Files to Create
- Frontend: `screens/auth/LoginScreen.tsx`
- Frontend: `screens/auth/RegisterScreen.tsx`
- Frontend: `screens/auth/SplashScreen.tsx`
- Frontend: `lib/shared/services/AuthService.ts`
- Frontend: `contexts/AuthContext.tsx`
- Frontend: `hooks/useAuth.ts`
- Frontend: `navigation/AuthNavigator.tsx`
- Frontend: `lib/shared/schemas/auth.schema.ts`

## Files to Modify
- Frontend: `navigation/AppNavigator.tsx` (conditional routing)
- Frontend: `lib/shared/services/RecipeService.ts` (add auth headers)
- Frontend: `lib/shared/services/FetchClient.ts` (token interceptors)
- Frontend: `mocks/handlers/auth.ts` (MSW handlers)

---

# Story 5: User-Scoped Recipe Data

**Priority:** MEDIUM  
**Type:** Data Filtering & Security  
**Dependencies:** Story 4  
**Estimated Effort:** Small

## User Story
> As a logged-in user, I want to see only my own recipes so that I have a private, personalized recipe collection.

## Acceptance Criteria
- ✅ Recipe list shows only current user's recipes
- ✅ New recipes automatically assigned to authenticated user
- ✅ Recipe updates only allowed for recipe owner
- ✅ Recipe deletion only allowed for recipe owner
- ✅ Search and filtering work within user's recipe scope
- ✅ Cross-user data access is prevented (backend validation)
- ✅ All existing recipe functionality works without breaking changes
- ✅ No frontend recipe screen changes required
- ✅ Integration tests verify data isolation between users

## Technical Notes
**Backend Changes:**
- RecipeService filters all queries by authenticated user ID
- Recipe creation assigns user_id from JWT claims
- Recipe update/delete validates ownership
- Return 403 Forbidden for cross-user access attempts

**Frontend Changes:**
- No changes to recipe screens needed
- All API calls automatically scoped to authenticated user
- MSW handlers support user-scoped mock data

**Testing:**
- Create two test users
- Verify User A cannot see User B's recipes
- Verify User A cannot edit/delete User B's recipes

## Files to Modify
- Backend: `Services/RecipeService.cs` (add user filtering and validation)
- Frontend: `mocks/handlers/recipes.ts` (user-scoped mock data)

---

# Story 6: Password Reset Flow

**Priority:** CRITICAL  
**Type:** Authentication Enhancement  
**Dependencies:** Stories 1, 2, 3  
**Estimated Effort:** Large

## User Story
> As a user, I want to reset my password if I forget it so that I can regain access to my account without contacting support.

## Acceptance Criteria
- ✅ "Forgot Password?" link on login screen
- ✅ POST /api/auth/forgot-password endpoint (sends reset email)
- ✅ POST /api/auth/reset-password endpoint (resets with token)
- ✅ GET /api/auth/verify-reset-token endpoint (validates token)
- ✅ ForgotPasswordScreen with email input
- ✅ ResetPasswordScreen with new password form
- ✅ Email service integration (SendGrid or AWS SES)
- ✅ Password reset email template
- ✅ Password changed confirmation email
- ✅ Tokens expire after 1 hour
- ✅ Tokens are single-use (marked as used after reset)
- ✅ Rate limiting (3 requests per email per hour)
- ✅ No user enumeration (generic success messages)
- ✅ Password strength validation enforced
- ✅ MSW handlers for password reset flow
- ✅ Integration tests for full reset flow

## Technical Notes
**Security Requirements:**
- Tokens stored as SHA256 hashes (not plaintext)
- 1 hour expiry from creation
- Single-use enforcement (mark as used)
- Rate limiting prevents abuse
- IP address tracking for audit
- Generic messages prevent user enumeration

**Email Provider Options:**
- SendGrid (recommended - free tier available)
- AWS SES (Azure-friendly, cheap)
- Mailgun (alternative)

**Reset Flow:**
1. User enters email → Token generated → Email sent
2. User clicks link → Token validated → Reset form shown
3. User submits new password → Token marked used → Password updated
4. Optional: Revoke all refresh tokens (force re-login)

## Files to Create
- Backend: `Entities/PasswordResetToken.cs`
- Backend: `Services/IPasswordResetService.cs`
- Backend: `Services/PasswordResetService.cs`
- Backend: `Services/IEmailService.cs`
- Backend: `Services/SendGridEmailService.cs`
- Backend: `Repositories/IPasswordResetTokenRepository.cs`
- Backend: `Repositories/PasswordResetTokenRepository.cs`
- Backend: `Migrations/xxxx_CreatePasswordResetTokensTable.cs`
- Frontend: `screens/auth/ForgotPasswordScreen.tsx`
- Frontend: `screens/auth/ResetPasswordScreen.tsx`
- Frontend: `lib/shared/services/PasswordResetService.ts`
- Frontend: `lib/shared/schemas/passwordReset.schema.ts`
- Frontend: `components/auth/PasswordStrengthIndicator.tsx`

## Files to Modify
- Backend: `Controllers/AuthController.cs` (add reset endpoints)
- Backend: `appsettings.json` (email service config)
- Frontend: `screens/auth/LoginScreen.tsx` (add forgot password link)
- Frontend: `types/navigation.ts` (add reset password routes)
- Frontend: `navigation/AuthNavigator.tsx` (add new screens)

---

# Story 7: Email Verification Flow (Optional)

**Priority:** MEDIUM  
**Type:** User Management Enhancement  
**Dependencies:** Story 6  
**Estimated Effort:** Medium

## User Story
> As a user, I want to verify my email address so that my account is secure and I can receive important notifications.

## Acceptance Criteria
- ✅ Verification email sent on registration
- ✅ GET /api/auth/verify-email/:token endpoint
- ✅ POST /api/auth/resend-verification endpoint
- ✅ EmailVerificationPromptScreen after registration
- ✅ EmailVerificationBanner for unverified users
- ✅ Verification status shown in profile
- ✅ Tokens expire after 7 days
- ✅ Resend rate limiting (3 per hour)
- ✅ Email verification template
- ✅ Integration tests for verification flow

## Technical Notes
**Verification Strategy (Choose One):**
- **Soft:** User can access app, banner prompts verification
- **Hard:** Must verify before creating recipes
- **Strict:** Must verify before any login

**Recommendation:** Start with Soft approach, upgrade if abuse occurs

**Database Options:**
- Inline on User table (simple)
- Separate verification_tokens table (scalable, recommended)

**Integration with Password Reset:**
- Option: Only send reset emails to verified addresses
- Or: Allow reset for unverified users (less secure)

## Implementation Decision
**Status:** DEFERRED to Sprint 4 or Sprint 5 depending on:
- Story 6 (Password Reset) completion timeline
- Email service reliability after Story 6
- Sprint 4 bandwidth after completing Stories 1-6

**Include in Sprint 4 if:**
- Story 6 completes smoothly
- Email infrastructure is working well
- Time permits (~1 week additional)

**Defer to Sprint 5 if:**
- Sprint 4 is already at capacity
- Want to stabilize password reset first
- User verification not critical for initial launch

---

# Sprint 4 Success Metrics

## Authentication Metrics
- ✅ Users can register and login successfully
- ✅ JWT tokens are generated and validated properly
- ✅ User sessions persist across app restarts
- ✅ Logout clears all authentication state

## Data Isolation Metrics
- ✅ Users see only their own recipes
- ✅ Cross-user data access is prevented
- ✅ New recipes are automatically user-scoped
- ✅ All existing functionality works without breaking changes

## Security Metrics
- ✅ Passwords are hashed securely (BCrypt)
- ✅ Account lockout prevents brute force attacks
- ✅ Rate limiting protects auth endpoints
- ✅ Security audit logging captures important events

## User Experience Metrics
- ✅ Login flow is intuitive and fast (<3 seconds)
- ✅ Error messages are helpful and clear
- ✅ Loading states provide good user feedback
- ✅ Password reset flow works end-to-end (<2 minutes)

## Technical Metrics
- ✅ All unit tests passing (>90% coverage)
- ✅ All integration tests passing
- ✅ No security vulnerabilities in auth flow
- ✅ Performance remains acceptable with user-scoped queries

---

# Definition of Done (Sprint 4)

## For Each Story
- ✅ Code implemented and working
- ✅ API integration tested (where applicable)
- ✅ Error handling implemented
- ✅ Loading states shown to user
- ✅ Works on web platform (mobile optional)
- ✅ Unit tests passing
- ✅ Integration tests passing (for API-connected features)
- ✅ No console errors or warnings
- ✅ Code reviewed and merged to main branch
- ✅ Deployed to staging and tested

## For Sprint 4 Overall
- ✅ All Stories 1-6 complete (Story 7 optional)
- ✅ Users can register, login, and manage recipes
- ✅ Password reset functionality working
- ✅ Data isolation verified between users
- ✅ Security audit completed
- ✅ User acceptance testing completed
- ✅ Deployed to production
- ✅ Documentation updated

---

# Deployment Checklist

## Before Deployment
- [ ] Database migrations tested on staging
- [ ] Email service configured and tested
- [ ] Environment variables set in Azure
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] JWT secrets securely stored (Azure Key Vault)
- [ ] Backup strategy in place

## After Deployment
- [ ] Test user registration end-to-end
- [ ] Test login and logout flows
- [ ] Test password reset flow
- [ ] Verify data isolation between users
- [ ] Monitor error logs for 48 hours
- [ ] Verify email delivery metrics
- [ ] Check security audit logs

---

# Backlog (Future Sprints)

## Sprint 5 Candidates
- Multi-category system with user-defined categories
- Email verification (if deferred from Sprint 4)
- User profile enhancements (avatar, bio)
- Change password (while logged in)
- Delete account (GDPR compliance)

## Sprint 6+ Ideas
- Social authentication (Google, GitHub)
- Two-factor authentication (2FA)
- Session management UI (view all devices)
- API pagination for large recipe collections
- Advanced security features (suspicious login alerts)
- Biometric authentication (Face ID, Touch ID)