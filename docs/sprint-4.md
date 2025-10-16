# Sprint 4: User Management Foundation - Authentication & Data Isolation

## Sprint Goal
Transform the recipe demo into a production-ready application with user authentication, secure data isolation, and personalized recipe management.

**Timeline:** Post-Demo (2-3 weeks)  
**Focus:** User authentication, database security, and user-scoped data management

---

## Technical Stack

- **Frontend:** React Native + React Native Web + Expo
- **State Management:** TanStack Query with optimistic updates
- **Backend:** C# ASP.NET Core API (Azure deployment)
- **Database:** SQL Server with EF Core
- **Authentication:** JWT tokens (15min access, 7day refresh)
- **Security:** User-scoped data isolation, secure token storage

---

## Phase 1: Database Foundation

### Story 11: Database Schema - User Management Foundation
**Status:** 🔴 NOT STARTED  
**Priority:** HIGH  
**Type:** Database & Backend Infrastructure  
**Estimated Effort:** Medium

**User Story:**
As a developer, I need to add user management to the database schema so that recipes can be associated with specific users and properly isolated.

**Implementation:**

#### Database Schema Changes
```sql
-- Create User table
CREATE TABLE users (
    id NVARCHAR(450) PRIMARY KEY,              -- GUID
    email NVARCHAR(256) NOT NULL UNIQUE,
    password_hash NVARCHAR(MAX) NOT NULL,
    name NVARCHAR(100),
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_users_email (email)
);

-- Add UserId to Recipe table
ALTER TABLE recipes 
ADD user_id NVARCHAR(450) NOT NULL
    CONSTRAINT FK_recipes_users 
    FOREIGN KEY (user_id) 
    REFERENCES users(id);

-- Add index for efficient user recipe lookups
CREATE INDEX IX_recipes_user_id ON recipes(user_id, created_at DESC);

-- Create default system user for existing recipes
INSERT INTO users (id, email, password_hash, name, created_at)
VALUES ('system-user-guid', 'system@foodbudget.app', 'no-login', 'System User', GETUTCDATE());

-- Assign existing recipes to system user
UPDATE recipes 
SET user_id = 'system-user-guid' 
WHERE user_id IS NULL;
```

#### Tasks
- [ ] Create database migration for User table
- [ ] Create database migration for Recipe.UserId foreign key
- [ ] Create User entity class in backend
- [ ] Update Recipe entity to include User navigation property
- [ ] Create and run data migration for existing recipes
- [ ] Add database indexes for performance
- [ ] Verify referential integrity constraints

**Files to Create:**
- `FoodBudgetAPI/Entities/User.cs`
- Database migration: `xxxx_CreateUserTable.cs`
- Database migration: `xxxx_AddUserIdToRecipes.cs`

**Files to Modify:**
- `FoodBudgetAPI/Entities/Recipe.cs` (add UserId and User navigation)
- `FoodBudgetAPI/Data/ApplicationDbContext.cs` (add User DbSet)

**Acceptance Criteria:**
- ✅ User table created with proper schema
- ✅ Recipe table updated with UserId foreign key
- ✅ Database index created on Recipe.UserId
- ✅ Migration script handles existing data
- ✅ All existing recipes associated with system user
- ✅ Database constraints ensure referential integrity

---

### Story 12: Backend API - User Management Endpoints
**Status:** 🔴 NOT STARTED  
**Priority:** HIGH  
**Type:** Backend API Development  
**Dependencies:** Story 11  
**Estimated Effort:** Medium

**User Story:**
As a frontend developer, I need user management API endpoints so that users can register, login, and manage their accounts.

**API Endpoints:**
```csharp
// Authentication
POST /api/auth/register     // Register new user
POST /api/auth/login        // Login user
POST /api/auth/refresh      // Refresh JWT token
POST /api/auth/logout       // Logout user

// User Profile
GET  /api/users/profile     // Get current user profile
PUT  /api/users/profile     // Update user profile
```

**DTOs:**
```csharp
public class RegisterRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
}

public class LoginRequestDto
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class AuthResponseDto
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
    public UserDto User { get; set; }
}

public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Tasks
- [ ] Create AuthController with register/login endpoints
- [ ] Create UsersController with profile endpoints
- [ ] Create UserService with business logic
- [ ] Implement password hashing with BCrypt
- [ ] Create user DTOs (request/response)
- [ ] Add input validation and error handling
- [ ] Add rate limiting to auth endpoints
- [ ] Create unit tests for UserService
- [ ] Create integration tests for auth endpoints
- [ ] Update Swagger documentation

**Files to Create:**
- `FoodBudgetAPI/Controllers/AuthController.cs`
- `FoodBudgetAPI/Controllers/UsersController.cs`
- `FoodBudgetAPI/Services/IUserService.cs`
- `FoodBudgetAPI/Services/UserService.cs`
- `FoodBudgetAPI/Models/DTOs/Requests/RegisterRequestDto.cs`
- `FoodBudgetAPI/Models/DTOs/Requests/LoginRequestDto.cs`
- `FoodBudgetAPI/Models/DTOs/Responses/AuthResponseDto.cs`
- `FoodBudgetAPI/Models/DTOs/Responses/UserDto.cs`

**Acceptance Criteria:**
- ✅ POST /api/auth/register endpoint implemented
- ✅ POST /api/auth/login endpoint implemented
- ✅ GET /api/users/profile endpoint implemented
- ✅ Input validation for all user endpoints
- ✅ Proper error handling and HTTP status codes
- ✅ Password hashing implemented securely
- ✅ API documentation updated (Swagger)
- ✅ Unit tests for all user endpoints

---

## Phase 2: Security & Authentication

### Story 13: JWT Authentication & Security
**Status:** 🔴 NOT STARTED  
**Priority:** HIGH  
**Type:** Security & Authentication  
**Dependencies:** Story 12  
**Estimated Effort:** Medium

**User Story:**
As a system administrator, I need secure JWT token authentication so that user sessions are protected and API access is properly controlled.

**Implementation:**

#### JWT Configuration
```csharp
// appsettings.json
{
  "JwtSettings": {
    "SecretKey": "your-256-bit-secret-key-here",
    "Issuer": "FoodBudgetAPI",
    "Audience": "FoodBudgetApp",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  }
}
```

#### Middleware Setup
```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // JWT configuration
    });

builder.Services.AddAuthorization();

app.UseAuthentication();
app.UseAuthorization();
```

#### Tasks
- [ ] Create JWT authentication middleware
- [ ] Create TokenService for JWT generation/validation
- [ ] Add authentication to all recipe endpoints
- [ ] Implement token refresh mechanism
- [ ] Add proper CORS configuration
- [ ] Add security headers middleware
- [ ] Create authorization policies
- [ ] Update recipe endpoints to require authentication
- [ ] Add user context to recipe operations
- [ ] Create integration tests for JWT auth

**Files to Create:**
- `FoodBudgetAPI/Services/ITokenService.cs`
- `FoodBudgetAPI/Services/TokenService.cs`
- `FoodBudgetAPI/Middleware/JwtMiddleware.cs`
- `FoodBudgetAPI/Models/JwtSettings.cs`

**Files to Modify:**
- `FoodBudgetAPI/Controllers/RecipesController.cs` (add [Authorize] attributes)
- `FoodBudgetAPI/Services/RecipeService.cs` (filter by authenticated user)
- `FoodBudgetAPI/Program.cs` (register auth services)
- `appsettings.json` (JWT configuration)

**Acceptance Criteria:**
- ✅ JWT middleware implemented for authentication
- ✅ All recipe endpoints protected with JWT validation
- ✅ Token generation includes proper user claims
- ✅ Token expiration and refresh logic implemented
- ✅ Secure token signing with proper secrets
- ✅ Authorization middleware filters recipes by authenticated user
- ✅ Security headers and CORS properly configured
- ✅ Authentication integration tests passing

---

## Phase 3: Frontend Authentication

### Story 14: Frontend Authentication Integration
**Status:** 🔴 NOT STARTED  
**Priority:** HIGH  
**Type:** Frontend Authentication  
**Dependencies:** Story 13  
**Estimated Effort:** Large

**User Story:**
As a recipe app user, I want to log in with my credentials so that I can access my personal recipe collection.

**Implementation:**

#### Authentication Service
```typescript
// lib/shared/services/AuthService.ts
export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Implementation
  }
  
  static async login(data: LoginRequest): Promise<AuthResponse> {
    // Implementation
  }
  
  static async logout(): Promise<void> {
    // Clear tokens and state
  }
  
  static async refreshToken(): Promise<AuthResponse> {
    // Token refresh logic
  }
}
```

#### Authentication Context
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}
```

#### Navigation Structure
```typescript
// navigation/AppNavigator.tsx
export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return isAuthenticated ? <AuthenticatedNavigator /> : <AuthNavigator />;
};
```

#### Tasks
- [ ] Create AuthService for API integration
- [ ] Create AuthContext for state management
- [ ] Create LoginScreen with form validation
- [ ] Create RegisterScreen with form validation
- [ ] Implement secure token storage (AsyncStorage)
- [ ] Add authentication navigation guards
- [ ] Create logout functionality
- [ ] Add loading states and error handling
- [ ] Update RecipeService to include auth headers
- [ ] Create authentication hooks (useAuth, useLogin, etc.)
- [ ] Add MSW handlers for auth endpoints
- [ ] Create integration tests for auth flows

**Files to Create:**
- `screens/auth/LoginScreen.tsx`
- `screens/auth/RegisterScreen.tsx`
- `screens/auth/SplashScreen.tsx`
- `lib/shared/services/AuthService.ts`
- `contexts/AuthContext.tsx`
- `hooks/useAuth.ts`
- `hooks/useLogin.ts`
- `hooks/useRegister.ts`
- `navigation/AuthNavigator.tsx`
- `navigation/AuthenticatedNavigator.tsx`

**Files to Modify:**
- `navigation/AppNavigator.tsx` (conditional routing)
- `lib/shared/services/RecipeService.ts` (add auth headers)
- `lib/shared/services/FetchClient.ts` (token interceptors)
- `mocks/handlers/auth.ts` (new MSW handlers)

**Acceptance Criteria:**
- ✅ Login screen with email/password form
- ✅ Registration screen with validation
- ✅ AuthService for login/register/logout API calls
- ✅ AuthContext for app-wide authentication state
- ✅ Token storage with AsyncStorage
- ✅ Navigation guards for authenticated routes
- ✅ Logout functionality clears tokens and state
- ✅ Loading states and error handling for auth operations
- ✅ Integration tests for auth flows

---

## Phase 4: User-Scoped Data

### Story 15: User-Scoped Recipe Data
**Status:** 🔴 NOT STARTED  
**Priority:** MEDIUM  
**Type:** Data Filtering & User Experience  
**Dependencies:** Story 14  
**Estimated Effort:** Small

**User Story:**
As a logged-in user, I want to see only my own recipes so that I have a private, personalized recipe collection.

**Implementation:**

#### Backend Changes
- Recipe queries automatically filter by authenticated user
- Recipe mutations associate with authenticated user
- Cross-user data access prevention

#### Frontend Changes
- No changes needed to recipe screens
- All API calls automatically scoped to authenticated user
- MSW mocks support user-scoped data

#### Tasks
- [ ] Update RecipeService to filter by authenticated user
- [ ] Ensure new recipes are assigned to authenticated user
- [ ] Add user context to all recipe operations
- [ ] Update MSW handlers for user-scoped data
- [ ] Test data isolation between different users
- [ ] Verify all existing functionality works with user-scoped data
- [ ] Add integration tests for data isolation

**Files to Modify:**
- Backend: `FoodBudgetAPI/Services/RecipeService.cs` (add user filtering)
- Frontend: No recipe screen changes needed
- Frontend: `mocks/handlers/recipes.ts` (user-scoped mock data)

**Acceptance Criteria:**
- ✅ Recipe list shows only current user's recipes
- ✅ New recipes automatically assigned to authenticated user
- ✅ Search and filtering work within user's recipe scope
- ✅ All existing recipe functionality works with user-scoped data
- ✅ No breaking changes to existing Recipe screens
- ✅ Integration tests verify data isolation between users

---

## BACKLOG: Future Enhancements

### User-Defined Categories System (Future Sprint)
**Status:** 🔴 BACKLOG  
**Priority:** MEDIUM  
**Type:** Feature Enhancement

**User Story:**
As a user, I want to create my own categories and assign multiple categories to each recipe so I can organize recipes my way (e.g., "Quick Meals", "Kid-Friendly", "Italian", "Meal Prep").

**Notes:**
- Depends on user authentication being complete
- Will require category management API and multi-select UI
- Currently using hardcoded categories from Sprint 3

---

## Success Metrics

**Authentication Metrics:**
- [ ] Users can register and login successfully
- [ ] JWT tokens are generated and validated properly
- [ ] User sessions persist across app restarts
- [ ] Logout clears all authentication state

**Data Isolation Metrics:**
- [ ] Users see only their own recipes
- [ ] Cross-user data access is prevented
- [ ] New recipes are automatically user-scoped
- [ ] All existing functionality works without breaking changes

**Technical Metrics:**
- [ ] All unit tests passing (>90% coverage)
- [ ] All integration tests passing
- [ ] No security vulnerabilities in auth flow
- [ ] Performance remains acceptable with user-scoped queries

**User Experience Metrics:**
- [ ] Login flow is intuitive and fast
- [ ] Error messages are helpful and clear
- [ ] Loading states provide good user feedback
- [ ] App feels responsive during authentication operations