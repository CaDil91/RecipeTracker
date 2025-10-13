# Sprint 4: Post-Demo Enhancements - User Features & Authentication

## Sprint Goal
Build user-defined features and authentication to transform the demo into a production-ready application with personalized data and secure access.

**Timeline:** Post-Demo (1-2 weeks)
**Focus:** User experience enhancements, authentication, and personalized data management

---

## Technical Stack

- **Frontend:** React Native + React Native Web + Expo
- **State Management:** TanStack Query with optimistic updates
- **Backend:** C# ASP.NET Core API (Azure deployment)
- **Database:** SQL Server with EF Core
- **Authentication:** JWT tokens (15min access, 7day refresh)
- **Storage:** AsyncStorage (local tags cache) + SQL Server (user categories)

---

## Phase 1: User-Defined Categories System

### Story 1: User-Defined Multi-Category System
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** Feature Enhancement
**Estimated Effort:** Large
**Dependencies:** Sprint 3 Story 7 (CategoryPicker foundation)

**User Story:**
As a user, I want to create my own categories and assign multiple categories to each recipe so I can organize recipes my way (e.g., "Quick Meals", "Kid-Friendly", "Italian", "Meal Prep").

**Problem:**
Sprint 3 has 4 hardcoded categories (Breakfast, Lunch, Dinner, Dessert) with single-select. Users need flexibility to:
- Create custom categories
- Assign multiple categories per recipe
- Manage their category list (create, rename, delete)
- Have categories persist across devices

**Solution Architecture:**

#### Backend Changes

**Database Schema:**
```sql
-- New table for user-defined categories
CREATE TABLE user_categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(450) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    is_default BIT DEFAULT 0,  -- true for Breakfast, Lunch, Dinner, Dessert
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_user_categories_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT UQ_user_category_name UNIQUE(user_id, name)
);

-- Migration: Change Recipe.category to Recipe.categories (JSON array)
ALTER TABLE recipes DROP COLUMN category;
ALTER TABLE recipes ADD categories NVARCHAR(MAX);  -- Stores JSON array: ["Breakfast", "Quick"]
```

**API Endpoints:**
```csharp
// Category Management
GET    /api/users/me/categories          // Get user's available categories
POST   /api/users/me/categories          // Create new category
PUT    /api/users/me/categories/:id      // Rename category
DELETE /api/users/me/categories/:id      // Delete category (removes from all recipes)

// Seed default categories on user registration
// Default categories: "Breakfast", "Lunch", "Dinner", "Dessert" (is_default = true)
```

#### Frontend Changes

**DTOs (Updated):**
```typescript
// Before (Sprint 3)
interface RecipeRequestDto {
  category?: string;  // Single value
}

// After (Sprint 4)
interface RecipeRequestDto {
  categories?: string[];  // Array of category names
}

// New DTO
interface UserCategoryDto {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
}
```

**React Query Hooks:**
```typescript
// hooks/useUserCategories.ts
export const useUserCategories = () => {
  return useQuery({
    queryKey: ['userCategories'],
    queryFn: CategoryService.getUserCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CategoryService.createCategory,
    onMutate: async (newCategory) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['userCategories'] });
      const previous = queryClient.getQueryData(['userCategories']);

      queryClient.setQueryData(['userCategories'], (old) => [
        ...old,
        { id: -1, name: newCategory.name, isDefault: false, createdAt: new Date().toISOString() }
      ]);

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['userCategories'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userCategories'] });
    }
  });
};
```

**CategoryPicker Component (Enhanced):**
```typescript
interface CategoryPickerProps {
  selectedCategories: string[];           // Multi-select
  availableCategories: UserCategoryDto[]; // From API
  onCategoriesChange: (categories: string[]) => void;
  onCreateCategory: (name: string) => void;
  multiple?: boolean;        // Default: true (Sprint 4)
  allowCustom?: boolean;     // Default: true (Sprint 4)
}
```

**UI Components:**
- Multi-select dropdown with checkboxes
- Selected categories shown as chips below picker
- "Create new category" option at bottom with text input
- Optimistic creation (appears immediately, syncs with API)

#### Tasks

**Backend:**
- [ ] Create `user_categories` table migration
- [ ] Add `UserCategory` entity
- [ ] Create `UserCategoryController` with CRUD endpoints
- [ ] Create `CategoryService` with business logic
- [ ] Seed default categories on user registration
- [ ] Update `Recipe` entity: `category` → `categories` (JSON array)
- [ ] Update `RecipeService` to handle category arrays
- [ ] Update all recipe DTOs
- [ ] Add unit tests for CategoryService
- [ ] Add integration tests for category endpoints

**Frontend:**
- [ ] Update DTOs: `category?: string` → `categories?: string[]`
- [ ] Update schemas: validate string array
- [ ] Create `CategoryService.ts` (API client)
- [ ] Create `useUserCategories` hook
- [ ] Create `useCreateCategory` hook with optimistic updates
- [ ] Create `useDeleteCategory` hook with optimistic updates
- [ ] Enhance `CategoryPicker` component:
  - Multi-select with checkboxes
  - Selected categories as chips
  - "Create new" inline input
  - Integration with hooks
- [ ] Update `RecipeForm` to use enhanced CategoryPicker
- [ ] Update MSW handlers for categories endpoints
- [ ] Migrate local data (if any recipes exist with old format)

**Testing:**
- [ ] Unit tests for CategoryService (backend)
- [ ] Integration tests for category API endpoints
- [ ] Unit tests for useUserCategories hook
- [ ] Unit tests for useCreateCategory optimistic updates
- [ ] Unit tests for CategoryPicker multi-select
- [ ] Unit tests for inline category creation
- [ ] Integration tests for RecipeForm with categories
- [ ] Test category deletion (verify removed from recipes)

**Files to Create:**
- Backend: `FoodBudgetAPI/Entities/UserCategory.cs`
- Backend: `FoodBudgetAPI/Controllers/UserCategoryController.cs`
- Backend: `FoodBudgetAPI/Services/CategoryService.cs`
- Backend: `FoodBudgetAPI/Models/DTOs/UserCategoryDto.cs`
- Frontend: `lib/shared/services/CategoryService.ts`
- Frontend: `hooks/useUserCategories.ts`
- Frontend: `hooks/__tests__/useUserCategories.test.tsx`

**Files to Modify:**
- Backend: `FoodBudgetAPI/Entities/Recipe.cs` (category → categories)
- Backend: `FoodBudgetAPI/Services/RecipeService.cs`
- Backend: Database migration
- Frontend: `lib/shared/types/dto.ts` (RecipeRequestDto, RecipeResponseDto)
- Frontend: `lib/shared/schemas/recipe.schema.ts`
- Frontend: `components/shared/forms/CategoryPicker.tsx` (enhance)
- Frontend: `components/shared/recipe/RecipeForm.tsx`
- Frontend: `mocks/handlers/recipes.ts`
- Frontend: `mocks/handlers/categories.ts` (new)

**Acceptance Criteria:**
- ✅ User can create custom categories
- ✅ New categories appear immediately (optimistic update)
- ✅ User can assign multiple categories to a recipe
- ✅ Selected categories show as chips
- ✅ User can delete categories
- ✅ Deleting category removes it from all recipes
- ✅ Default categories (Breakfast, Lunch, Dinner, Dessert) always available
- ✅ Categories sync across devices (backend storage)
- ✅ Optimistic updates rollback on error
- ✅ All tests pass

**Migration Strategy:**
1. Deploy backend with new schema
2. Run data migration: convert `category` string to `categories` array
3. Deploy frontend with updated DTOs
4. Test with existing recipes

---

## Phase 2: Authentication & User Management

### Story 2: User Registration & Login API
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** Backend Authentication
**Estimated Effort:** Medium

**User Story:**
As a user, I want to create an account and log in so my recipes and categories are private and secure.

**Backend Implementation:**
- [ ] User entity (Id, Email, PasswordHash, CreatedAt)
- [ ] POST /api/auth/register endpoint
- [ ] POST /api/auth/login endpoint
- [ ] Password hashing with BCrypt
- [ ] JWT token generation (15min access, 7day refresh)
- [ ] Email validation and uniqueness check
- [ ] Rate limiting on auth endpoints
- [ ] Seed default categories on registration
- [ ] Unit and integration tests

**Files to Create:**
- `FoodBudgetAPI/Entities/User.cs`
- `FoodBudgetAPI/Controllers/AuthController.cs`
- `FoodBudgetAPI/Services/IAuthService.cs`
- `FoodBudgetAPI/Services/AuthService.cs`
- `FoodBudgetAPI/Services/TokenService.cs`
- `FoodBudgetAPI/Models/DTOs/Requests/RegisterRequestDto.cs`
- `FoodBudgetAPI/Models/DTOs/Requests/LoginRequestDto.cs`
- `FoodBudgetAPI/Models/DTOs/Responses/AuthResponseDto.cs`
- Database migration for User table

**Acceptance Criteria:**
- ✅ User can register with email/password
- ✅ Password hashed securely (BCrypt)
- ✅ JWT tokens returned on login
- ✅ Email uniqueness enforced
- ✅ Default categories seeded on registration
- ✅ All tests pass

---

### Story 3: User-Scoped Recipe Security
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** Backend Security
**Dependencies:** Story 2
**Estimated Effort:** Small

**User Story:**
As a user, I want only my recipes visible to me so my data stays private.

**Backend Implementation:**
- [ ] Add UserId field to Recipe entity (already exists in schema)
- [ ] Add JWT authentication middleware
- [ ] Update RecipeController to filter by authenticated user
- [ ] Prevent cross-user recipe access
- [ ] Update all recipe endpoints to require authentication
- [ ] Update CategoryController to filter by user
- [ ] Migration to add UserId foreign key
- [ ] Update tests to include authentication

**Files to Modify:**
- `FoodBudgetAPI/Entities/Recipe.cs` - Add UserId foreign key
- `FoodBudgetAPI/Controllers/RecipeController.cs` - Add [Authorize] attribute
- `FoodBudgetAPI/Controllers/UserCategoryController.cs` - Add [Authorize] attribute
- `FoodBudgetAPI/Services/RecipeService.cs` - Filter by UserId
- `FoodBudgetAPI/Services/CategoryService.cs` - Filter by UserId
- Database migration for UserId foreign key

**Acceptance Criteria:**
- ✅ All recipe endpoints require authentication
- ✅ Users can only see their own recipes
- ✅ Users can only see their own categories
- ✅ Unauthorized access returns 401
- ✅ Cross-user access attempts return 403
- ✅ All tests pass with authentication

---

### Story 4: Frontend Authentication State
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** Frontend Authentication
**Dependencies:** Story 2
**Estimated Effort:** Medium

**User Story:**
As a user, I want to stay logged in across sessions so I don't have to log in repeatedly.

**Frontend Implementation:**
- [ ] Create AuthContext with JWT handling
- [ ] Secure token storage (SecureStore for mobile, secure cookies for web)
- [ ] Auto token refresh logic
- [ ] API interceptors for auth headers
- [ ] Protected route wrapper component
- [ ] Login/logout actions
- [ ] Auth state persistence

**Files to Create:**
- `contexts/AuthContext.tsx`
- `hooks/useAuth.ts`
- `lib/shared/services/AuthService.ts`
- `lib/shared/services/TokenStorage.ts`

**Acceptance Criteria:**
- ✅ Auth state persists across app restarts
- ✅ JWT tokens automatically attached to API requests
- ✅ Token refresh works automatically
- ✅ Logout clears all auth state
- ✅ All tests pass

---

### Story 5: Login & Registration Screens
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** Frontend Authentication
**Dependencies:** Story 4
**Estimated Effort:** Medium

**User Story:**
As a new user, I want to register for an account and log in easily.

**Frontend Implementation:**
- [ ] LoginScreen with email/password
- [ ] RegistrationScreen with validation
- [ ] Form validation with Zod
- [ ] Error handling for auth failures
- [ ] Auto-login after registration
- [ ] "Forgot password" placeholder
- [ ] Loading states during auth
- [ ] Navigation to protected routes after login

**Files to Create:**
- `screens/LoginScreen.tsx`
- `screens/RegistrationScreen.tsx`
- `screens/__tests__/LoginScreen.test.tsx`
- `screens/__tests__/RegistrationScreen.test.tsx`

**Files to Modify:**
- `navigation/AppNavigator.tsx` - Add auth navigation flow

**Acceptance Criteria:**
- ✅ User can register with email/password
- ✅ Form validation works (email format, password strength)
- ✅ User can log in
- ✅ Error messages shown for failures
- ✅ Auto-login after registration
- ✅ Navigation to app after successful auth
- ✅ All tests pass

---

### Story 6: Profile Screen & Settings
**Status:** 🔴 NOT STARTED
**Priority:** MEDIUM
**Type:** User Management
**Dependencies:** Story 5
**Estimated Effort:** Small

**User Story:**
As a user, I want to view my profile, manage settings, and log out when needed.

**Implementation:**
- [ ] Display user email
- [ ] Logout button
- [ ] Category management section (view all, delete)
- [ ] App version info
- [ ] Theme settings (future)
- [ ] Account deletion option (future)

**Files to Modify:**
- `screens/ProfileScreen.tsx` (currently placeholder)

**Acceptance Criteria:**
- ✅ User email displayed
- ✅ Logout works correctly
- ✅ Category management accessible
- ✅ App version shown
- ✅ All tests pass

---

## Priority Order for Sprint 4

### 🔥 **Critical Path**
1. **Story 1:** User-Defined Multi-Category System
2. **Story 2:** User Registration & Login API
3. **Story 3:** User-Scoped Recipe Security
4. **Story 4:** Frontend Authentication State
5. **Story 5:** Login & Registration Screens
6. **Story 6:** Profile Screen & Settings

---

## Success Metrics

### Sprint 4 Goals
- [ ] Users can create unlimited custom categories
- [ ] Users can assign multiple categories per recipe
- [ ] Categories sync across devices
- [ ] User authentication working (register + login)
- [ ] User data properly scoped (can't see other users' data)
- [ ] Persistent login sessions
- [ ] Profile management functional

### Post-Sprint 4 (Future Enhancements)
- [ ] Social features (recipe sharing)
- [ ] Recipe import from URLs
- [ ] Meal planning integration
- [ ] Shopping list generation
- [ ] Nutritional information
- [ ] Recipe recommendations

---

## Technical Considerations

### Data Migration
When deploying Story 1, existing recipes need migration:
```sql
-- Example migration script
UPDATE recipes
SET categories = CONCAT('["', category, '"]')
WHERE category IS NOT NULL;

UPDATE recipes
SET categories = '[]'
WHERE category IS NULL;
```

### Performance
- Category fetching: Single query on app load, cached by TanStack Query
- Optimistic updates: Instant UI feedback, background API sync
- Recipe filtering: Client-side filtering by selected categories

### Error Handling
- Network failures: Rollback optimistic updates, show error toast
- Duplicate categories: API returns 409, show user-friendly message
- Category deletion: Confirm dialog with recipe count

---

## Definition of Done

Each story is complete when:
- [ ] Code implemented and working
- [ ] API integration tested
- [ ] Error handling implemented
- [ ] Loading states shown to user
- [ ] Works on web + mobile
- [ ] Unit tests passing (80%+ coverage)
- [ ] Integration tests passing
- [ ] No console errors or warnings
- [ ] Optimistic updates working (where applicable)
- [ ] Merged to main branch
- [ ] Deployed to production

---

*Sprint Duration: 1-2 weeks*
*Last Updated: 2025-10-13*
*Next Review: After Story 1 completion*