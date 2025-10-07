# Sprint 3: Complete Vertical Slice - Recipe Management Demo

## Sprint Goal
Build a complete vertical slice demonstrating full CRUD functionality for recipe management with a unified interface for viewing, editing, and creating recipes. Deploy a working demo for a portfolio presentation.


**Deliverable:** Fully functional Recipe management app with complete API integration, optimistic updates, and polished UX ready for portfolio demonstration.


### ✅ Completed Infrastructure
- ✅ Navigation architecture with bottom tabs
- ✅ Home screen with search, filtering, and grid layout options
- ✅ API service layer with complete CRUD operations
- ✅ Data models matching C# backend (including category & imageUrl)
- ✅ Theme system with Material Design 3
- ✅ Recipe list connected to API with TanStack Query
- ✅ Recipe creation with API integration
- ✅ Recipe deletion with confirmation and API integration
- ✅ MSW mock service for development without a backend
- ✅ Azure API deployed with automated CI/CD
- ✅ GitHub Pages deployment configured

### 🔧 Remaining Work for Demo
- 🔴 **CRITICAL:** Unified RecipeDetail screen (view/edit/create modes)
- 🟡 **HIGH:** Add category & image fields to RecipeForm
- 🟡 **HIGH:** Implement optimistic updates for better UX

---

## Technical Stack

- **Frontend:** React Native + React Native Web + Expo
- **State Management:** TanStack Query (data fetching and optimistic updates)
- **API Client:** Custom FetchClient with type safety
- **Validation:** Zod schemas
- **Backend:** C# ASP.NET Core API (deployed to Azure)
- **Database:** SQL Server with EF Core
- **Deployment:** GitHub Pages (web) + Azure (API)

---

## Phase 1: Core Foundation ✅ COMPLETED

### Story 1: Universal Bottom Navigation Bar ✅
**Status:** ✅ COMPLETED
**Priority:** Critical
**Type:** Navigation Foundation

**Completed:**
- Bottom navigation with 4 tabs (Home, Add, Meal Plan, Profile)
- Nested stack navigators for each tab
- Cross-platform compatibility (web + mobile)
- Material Design 3 theme integration
- Comprehensive test coverage

**Files:**
- `navigation/AppNavigator.tsx`
- `types/navigation.ts`

---

### Story 2: Home Screen (Recipe List with Search & Filtering) ✅
**Status:** ✅ COMPLETED
**Priority:** Critical
**Type:** Core Feature

**Completed:**
- Search bar with real-time filtering
- Category filter chips (All, Breakfast, Lunch, Dinner, Dessert)
- Recipe grid with configurable columns (2/3/4)
- Empty states and loading indicators
- Pull-to-refresh functionality
- FAB for quick recipe addition
- Full API integration with TanStack Query
- Delete functionality with the confirmation dialog

**Files:**
- `screens/RecipeListScreen.tsx` - Full implementation
- `components/SearchBar.tsx`
- `components/FilterChips.tsx`
- `components/shared/recipe/RecipeGrid.tsx`
- `components/shared/recipe/RecipeGridCard.tsx`

---

### Story 3: API Service Layer ✅
**Status:** ✅ COMPLETED
**Priority:** Critical
**Type:** Infrastructure

**Completed:**
- RecipeService with all CRUD operations
- Type-safe FetchClient
- Error handling and retry logic
- Request/Response DTOs matching C# API
- Zod validation schemas

**Files:**
- `lib/shared/services/RecipeService.ts`
- `lib/shared/services/FetchClient.ts`
- `lib/shared/schemas/recipe.schema.ts`
- `lib/shared/types/dto.ts`

---

## Phase 2: API Integration ✅ COMPLETED

### Story 4: Wire Recipe List to API ✅
**Status:** ✅ COMPLETED
**Priority:** CRITICAL
**Type:** API Integration

**User Story:**
As a user, I want to see my actual recipes from the database when I open the app.

**Completed:**
- TanStack Query integration for data fetching
- Automatic refetch and caching
- Loading states and error handling
- Pull-to-refresh connected to API
- Real-time search and filtering on fetched data

**Files:**
- `screens/RecipeListScreen.tsx:32-51` - Query implementation
- `screens/RecipeListScreen.tsx:57-75` - Filtering logic

---

### Story 5: Wire Add Recipe to API ✅
**Status:** ✅ COMPLETED
**Priority:** CRITICAL
**Type:** API Integration

**User Story:**
As a user, I want my new recipes saved to the database when I create them.

**Completed:**
- Connected AddRecipeScreen to RecipeService.createRecipe()
- Proper error handling with user feedback
- Navigation after successful creation
- Loading states during API calls
- Integration tests with MSW
- Alert dialogs for success/failure

**Files:**
- `screens/AddRecipeScreen.tsx` - Full API integration
- `screens/__tests__/AddRecipeScreen.integration.test.tsx` - 5 integration tests

---

### Story 6: Wire Delete Recipe to API ✅
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** API Integration

**User Story:**
As a user, I want recipes permanently deleted from the database when I delete them.

**Completed:**
- Delete mutation with TanStack Query
- Confirmation dialog before deletion
- Query invalidation and refetch after deletion
- Error handling with snackbar feedback
- Success feedback with snackbar

**Files:**
- `screens/RecipeListScreen.tsx:90-125` - Delete mutation and confirmation

---

### Story A: Recipe Images & Categories API Support ✅
**Status:** ✅ COMPLETED
**Priority:** CRITICAL
**Type:** Backend + Database

**User Story:**
As a developer, I need the API to support category and image fields so the frontend can display rich recipe data.

**Completed:**
- Added `imageUrl` field to Recipe entity
- Added `category` field to Recipe entity
- Database migration (`20250927044450_CategoryAndImageUrlAddToRecipe.cs`)
- Updated all API endpoints to include new fields
- Updated RecipeResponseDto and RecipeRequestDto
- Updated RecipeService.cs to handle new fields
- Updated all backend unit tests
- Frontend schemas support both fields
- MSW mock data includes categories and images

**Files:**
- Backend: `FoodBudgetAPI/Entities/Recipe.cs`
- Backend: `FoodBudgetAPI/Services/RecipeService.cs:99-100`
- Backend: `FoodBudgetAPI/Models/DTOs/*`
- Frontend: `lib/shared/schemas/recipe.schema.ts:26-36`
- Frontend: `lib/shared/types/dto.ts`

---

## Phase 3: Unified Recipe Detail Screen (CURRENT FOCUS)

### Story 7: Unified RecipeDetail Screen (View/Edit/Create)
**Status:** 🔴 NOT STARTED
**Priority:** CRITICAL
**Type:** Core Feature
**Dependencies:** Stories 4–6 (completed)

**User Story:**
As a user, I want a unified interface to view, edit, and create recipes with clear mode transitions.

**Requirements:**

**Three Modes:**
1. **CREATE mode** (from FAB/Add tab):
   - Form is shown immediately in the edit state
   - Empty fields ready for input
   - "Save Recipe" button
   - No Edit button needed

2. **VIEW mode** (from tapping recipe card):
   - Read-only display of recipe details
   - Show: title, category, servings, instructions, image
   - Floating Edit FAB or header Edit button
   - Delete button in header menu
   - No form inputs are visible

3. **EDIT mode** (from the Edit button in VIEW mode):
   - Same form as CREATE but pre-populated
   - "Update Recipe" button
   - Cancel button returns to VIEW mode
   - Save triggers API update

**Navigation Routes:**
```
/recipes/new → CREATE mode
/recipes/:id → VIEW mode (read-only)
/recipes/:id?mode=edit → EDIT mode (form enabled)
```

**Implementation Tasks:**
- [ ] Create a RecipeDetailScreen component with a mode state
- [ ] Implement mode detection from route params
- [ ] CREATE mode: Form visible, no recipe data fetch
- [ ] VIEW mode: Fetch a recipe by ID, display read-only
- [ ] EDIT mode: Fetch recipe, populate form, enable editing
- [ ] Add Edit FAB/button in VIEW mode
- [ ] Add the Delete button in the header (VIEW and EDIT modes)
- [ ] Mode transition: VIEW → EDIT → VIEW after save
- [ ] Update mutation with TanStack Query
- [ ] Navigate from RecipeListScreen card tap to VIEW mode
- [ ] Navigate from FAB/Add tab to CREATE mode
- [ ] Update navigation types for new routes
- [ ] **Remove AddRecipeScreen** (replaced by CREATE mode)
- [ ] Update Adds tab to navigate to CREATE mode
- [ ] Add comprehensive tests (unit + integration)

**Files to Create:**
- `screens/RecipeDetailScreen.tsx` - Main unified screen
- `screens/__tests__/RecipeDetailScreen.test.tsx` - Unit tests
- `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - Integration tests

**Files to Modify:**
- `navigation/AppNavigator.tsx` - Add RecipeDetail route to HomeStack, update Add tab navigation
- `types/navigation.ts` - Add RecipeDetail route params
- `screens/RecipeListScreen.tsx:77-81` - Navigate to VIEW mode on card tap
- `components/shared/recipe/RecipeForm.tsx` - Support mode prop for UI adjustments

**Files to Delete:**
- ❌ `screens/AddRecipeScreen.tsx` - Replaced by RecipeDetailScreen CREATE mode
- ❌ `screens/__tests__/AddRecipeScreen.test.tsx`
- ❌ `screens/__tests__/AddRecipeScreen.integration.test.tsx`

**Acceptance Criteria:**
- [ ] Tapping the recipe card opens VIEW mode (read-only)
- [ ] VIEW mode shows all recipe data clearly
- [ ] Edit button in VIEW mode switches to EDIT mode
- [ ] EDIT mode pre-populates a form with current data
- [ ] Saving in EDIT mode updates recipe and returns to VIEW mode
- [ ] Cancel in EDIT mode returns to VIEW mode without changes
- [ ] FAB/Add tab opens CREATE mode with empty form
- [ ] CREATE mode saves new recipe and navigates back to list
- [ ] Delete works from VIEW and EDIT modes
- [ ] All modes have proper loading states
- [ ] Error handling for API failures
- [ ] Optimistic updates (Story 9) work seamlessly

**Technical Notes:**
- Use single RecipeDetailScreen with `mode` state
- Mode determined by route params on mount
- Reuse RecipeForm component for both CREATE and EDIT
- VIEW mode uses custom read-only layout (not RecipeForm)
- TanStack Query for fetching individual recipe
- Mutation hooks for update operation

---

### Story 5.1: Enhanced Recipe Form (Category & Image Fields)
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** UI Enhancement
**Dependencies:** Story 7

**User Story:**
As a user, I want to add category and image fields when creating/editing recipes so my recipes are complete and organized.

**Implementation Tasks:**
- [ ] Add Category picker to RecipeForm
  - Options: Breakfast, Lunch, Dinner, Dessert, Snack, Beverage, Other
  - Match filter chips on RecipeListScreen
  - Default to "Other" or null
- [ ] Add Image URL input field
  - Text input with URL validation
  - Optional field
  - Placeholder: "https://example.com/image.jpg"
- [ ] Add image preview component
  - Show preview when imageUrl is valid
  - Handle loading states
  - Handle broken images gracefully
- [ ] Update RecipeForm validation
  - Category optional, max 100 chars
  - ImageUrl optional, must be valid URL
- [ ] Update form layout for new fields
- [ ] Update integration tests

**Files to Modify:**
- `components/shared/recipe/RecipeForm.tsx` - Add category and imageUrl fields
- `screens/RecipeDetailScreen.tsx` - Ensure new fields work in all modes
- `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - Test new fields

**Files to Create:**
- `components/shared/forms/CategoryPicker.tsx` - Category selection component
- `components/shared/forms/ImagePreview.tsx` - Image preview component
- `components/shared/forms/__tests__/CategoryPicker.test.tsx`
- `components/shared/forms/__tests__/ImagePreview.test.tsx`

**Technical Notes:**
- Backend already supports these fields (Story A completed)
- Schema validation already exists (recipe.schema.ts:26-36)
- Start with simple text input for imageUrl
- Future: Implement actual file upload to Azure Blob Storage

**Acceptance Criteria:**
- [ ] Category picker displays all options
- [ ] Selected category saves to database
- [ ] Category filter chips work with saved categories
- [ ] Image URL input validates format
- [ ] Valid image URLs display preview
- [ ] Invalid URLs show helpful error message
- [ ] Recipe cards show category badges
- [ ] Recipe cards show images when available

---

### Story 9: Optimistic Updates with TanStack Query
**Status:** 🔴 NOT STARTED
**Priority:** HIGH
**Type:** UX Enhancement
**Dependencies:** Story 7

**User Story:**
As a user, I want instant feedback when I create, update, or delete recipes so the app feels fast and responsive.

**Current Behavior:**
- Create: Submit → Wait → Alert → Navigate → List refetches
- Update: Submit → Wait → Alert → Navigate → List refetches
- Delete: Confirm → Wait → Snackbar → List refetches

**Target Behavior:**
- Create: Submit → **Instantly appears in list** → API saves in background → Success
- Update: Submit → **Instantly updates in list** → API saves in background → Success
- Delete: Confirm → **Instantly disappears** → API deletes in background → Success

**Implementation Tasks:**
- [ ] Implement optimistic create mutation
  - Add temporary recipe to cache with temp ID
  - Replace temp ID with real ID on success
  - Rollback on error
- [ ] Implement optimistic update mutation
  - Update recipe in cache immediately
  - Rollback on error
- [ ] Implement optimistic delete mutation (enhance existing)
  - Remove from cache immediately
  - Rollback on error
- [ ] Add query cache invalidation strategies
- [ ] Handle race conditions
- [ ] Add error recovery UI
- [ ] Test optimistic update flows

**Files to Modify:**
- `screens/RecipeDetailScreen.tsx` - Create and update mutations
- `screens/RecipeListScreen.tsx:90-110` - Enhance delete mutation
- Create new hook: `hooks/useRecipeMutations.ts` - Centralized mutations

**Files to Create:**
- `hooks/useRecipeMutations.ts` - Custom hook for all recipe mutations
- `hooks/__tests__/useRecipeMutations.test.tsx` - Test optimistic updates

**Technical Implementation:**
```typescript
// Example: Optimistic create
const createMutation = useMutation({
  mutationFn: RecipeService.createRecipe,
  onMutate: async (newRecipe) => {
    await queryClient.cancelQueries({ queryKey: ['recipes'] });
    const previous = queryClient.getQueryData(['recipes']);

    // Optimistically add with temporary ID
    const optimisticRecipe = {
      ...newRecipe,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(['recipes'], (old) =>
      [optimisticRecipe, ...(old || [])]
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(['recipes'], context.previous);
    }
  },
  onSuccess: (data) => {
    // Replace temp ID with real ID
    queryClient.setQueryData(['recipes'], (old) =>
      old.map(r => r.id.startsWith('temp-') ? data : r)
    );
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
  }
});
```

**Acceptance Criteria:**
- [ ] Creating recipe shows instantly in list
- [ ] Updating recipe reflects changes immediately
- [ ] Deleting recipe disappears immediately
- [ ] Failed operations rollback cleanly
- [ ] Error messages shown for failures
- [ ] No duplicate entries after optimistic updates
- [ ] List stays consistent after background sync

---

## Phase 4: Authentication (POST-DEMO)

### Story 10: User Registration & Login API
**Status:** 🔵 POST-DEMO
**Priority:** MEDIUM
**Type:** Backend Authentication

**User Story:**
As a user, I want to create an account and log in so my recipes are private and secure.

**Backend Implementation:**
- [ ] User entity (Id, Email, PasswordHash, CreatedAt)
- [ ] POST /api/auth/register endpoint
- [ ] POST /api/auth/login endpoint
- [ ] Password hashing with BCrypt
- [ ] JWT token generation (15min access, 7day refresh)
- [ ] Email validation and uniqueness check
- [ ] Rate limiting on auth endpoints
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

---

### Story 11: User-Scoped Recipe Security
**Status:** 🔵 POST-DEMO
**Priority:** MEDIUM
**Type:** Backend Security
**Dependencies:** Story 10

**User Story:**
As a user, I want only my recipes visible to me so my data stays private.

**Backend Implementation:**
- [ ] Add UserId field to Recipe entity (already exists in schema)
- [ ] Add JWT authentication middleware
- [ ] Update RecipeController to filter by authenticated user
- [ ] Prevent cross-user recipe access
- [ ] Update all recipe endpoints to require authentication
- [ ] Migration to add UserId foreign key
- [ ] Update tests to include authentication

**Files to Modify:**
- `FoodBudgetAPI/Entities/Recipe.cs` - Add UserId foreign key
- `FoodBudgetAPI/Controllers/RecipeController.cs` - Add [Authorize] attribute
- `FoodBudgetAPI/Services/RecipeService.cs` - Filter by UserId
- Database migration for UserId foreign key

---

### Story 12: Frontend Authentication State
**Status:** 🔵 POST-DEMO
**Priority:** MEDIUM
**Type:** Frontend Authentication
**Dependencies:** Story 10

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

---

### Story 13: Login & Registration Screens
**Status:** 🔵 POST-DEMO
**Priority:** MEDIUM
**Type:** Frontend Authentication
**Dependencies:** Story 12

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

---

### Story 14: Profile Screen
**Status:** 🔵 POST-DEMO
**Priority:** LOW
**Type:** User Management
**Dependencies:** Story 13

**User Story:**
As a user, I want to view my profile and log out when needed.

**Implementation:**
- [ ] Display user email
- [ ] Logout button
- [ ] App version info
- [ ] Settings placeholder
- [ ] Account deletion option (future)

**Files to Modify:**
- `screens/ProfileScreen.tsx` (currently placeholder)

---

## Definition of Done

Each story is complete when:
- [ ] Code implemented and working
- [ ] API integration tested (where applicable)
- [ ] Error handling implemented
- [ ] Loading states shown to user
- [ ] Works on web platform (mobile optional for demo)
- [ ] Unit tests passing
- [ ] Integration tests passing (for API-connected features)
- [ ] No console errors or warnings
- [ ] Merged to main branch
- [ ] Deployed (for demo-critical features)

---

## Success Metrics for Demo

### Minimum Viable Demo (Sprint 3 Goal)
- [x] View list of recipes from API
- [x] Add new recipes that persist
- [x] Delete recipes with confirmation
- [ ] View individual recipe details (Story 7)
- [ ] Edit existing recipes (Story 7)
- [ ] Category and image support (Story 5.1)
- [ ] Optimistic updates for snappy UX (Story 9)
- [x] API deployed and accessible
- [x] Web app deployed and accessible

### Post-Demo Enhancements
- [ ] User authentication (Stories 10-13)
- [ ] Personal recipe collections (Story 11)
- [ ] Profile management (Story 14)
- [ ] Meal planning features (Future)
- [ ] Shopping list integration (Future)

---

## Priority Order for Sprint 3 Completion

### 🔥 **Critical Path (Must Complete for Demo)**
1. **Story 7:** Unified RecipeDetail Screen (view/edit/create modes) - 🔴 NOT STARTED
2. **Story 5.1:** Enhanced Recipe Form (category & image fields) - 🔴 NOT STARTED
3. **Story 9:** Optimistic Updates with TanStack Query - 🔴 NOT STARTED

### 📋 **Post-Demo (Next Sprint)**
1. **Story 10:** User Registration & Login API
2. **Story 11:** User-Scoped Recipe Security
3. **Story 12:** Frontend Authentication State
4. **Story 13:** Login & Registration Screens
5. **Story 14:** Profile Screen

### 🔮 **Future Enhancements**
- Meal Planning features (MealPlanScreen implementation)
- Shopping list generation from recipes
- Nutritional information tracking
- Recipe sharing and social features
- Recipe import from URLs
- Multi-image support per recipe
- Video/GIF support for cooking steps
- Rating and reviews system

---

## Next Actions

### Immediate (This Week)
1. **Story 7:** Build unified RecipeDetailScreen
   - Start with VIEW mode (read-only display)
   - Add EDIT mode (form with pre-populated data)
   - Ensure CREATE mode works (replace AddRecipeScreen)
   - Wire up navigation from a list and Add tab
   - Add update mutation

2. **Story 5.1:** Enhance RecipeForm
   - Add a category picker component
   - Add imageUrl input with preview
   - Test with real data

3. **Story 9:** Add optimistic updates
   - Extract mutations to custom hook
   - Implement optimistic create/update/delete
   - Test error recovery

### Next Week (Polish & Demo Prep)
- End-to-end testing of full CRUD flow
- Fix any UI/UX issues
- Performance optimization
- Demo script preparation
- Portfolio documentation

### Following Sprint (Authentication)
- Stories 10–14: Complete authentication flow
- User-scoped data
- Profile management

---

## Development Infrastructure

### MSW (Mock Service Worker) ✅
**Status:** ✅ COMPLETED

**Features:**
- Complete MSW setup for development without backend dependency
- Rich mock data with categories, images, and servings
- Full CRUD operations (Create, Read, Update, Delete)
- Realistic API behavior with proper error responses
- Cross-platform environment variable setup

**Usage:**
```bash
npm run start:mock      # Development with mock data
npm run web:mock        # Web with mock data
npm run android:mock    # Android with mock data
npm run ios:mock        # iOS with mock data
```

**Benefits:**
- Frontend development independent of backend API status
- Rich visual demo data with food images and categories
- Realistic user experience for testing and demos

---

## Technical Debt & Future Work

### Code Quality
- [ ] Add E2E tests with Detox or Maestro
- [ ] Improve test coverage (target 80%+)
- [ ] Add performance monitoring
- [ ] Add error tracking (Sentry)

### Features
- [ ] Implement actual image upload (Azure Blob Storage)
- [ ] Add a rich text editor for instructions
- [ ] Add ingredients as separate entity with quantities
- [ ] Add cooking timers
- [ ] Add recipe search with Elasticsearch
- [ ] Add recipe recommendations
- [ ] Add offline support with a local database

### DevOps
- [ ] Add staging environment
- [ ] Add automated E2E test runs
- [ ] Add performance benchmarks in CI
- [ ] Add automated accessibility testing

---

*Sprint Duration: 1 week for remaining demo work*
*Last Updated: 2025-10-07*
*Next Review: After Story 7 completion*