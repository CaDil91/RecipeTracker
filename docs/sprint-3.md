# Sprint 3: Complete Vertical Slice - Recipe Management Demo

## Sprint Goal
Build a complete vertical slice demonstrating full CRUD functionality for recipe management with a unified interface for viewing, editing, and creating recipes. Deploy a working demo for a portfolio presentation.


**Deliverable:** Fully functional Recipe management app with complete API integration, optimistic updates, and polished UX ready for portfolio demonstration.


### ✅ Completed Infrastructure

**Frontend:**
- ✅ Navigation architecture with bottom tabs
- ✅ Home screen with search, filtering, and grid layout options
- ✅ API service layer with retry logic, timeout protection, and RFC 9457 support
- ✅ Data models matching C# backend (including category, imageUrl, userId)
- ✅ Theme system with Material Design 3
- ✅ Recipe list connected to API with TanStack Query
- ✅ Recipe creation with API integration
- ✅ Recipe deletion with confirmation and API integration
- ✅ Error handling with user-friendly error states and retry functionality
- ✅ TypeScript type safety in test utilities
- ✅ Proper Promise handling in TanStack Query mutations
- ✅ MSW mock service for development without a backend
- ✅ GitHub Pages deployment configured

**Backend (Production-Ready):**
- ✅ Global exception handling with RFC 9457 ProblemDetails
- ✅ API versioning (v1) with URL segment routing
- ✅ Health check endpoints (`/health`, `/readiness`)
- ✅ Request/response logging with TraceId correlation
- ✅ CORS configuration for cross-origin requests
- ✅ HTTPS redirection in production
- ✅ SQL injection protection (EF Core parameterization)
- ✅ Swagger/OpenAPI documentation
- ✅ Azure API deployed with automated CI/CD
- ✅ Recipe.UserId field ready for Sprint 4 authentication

### 🔧 Remaining Work for Demo
- ✅ **CRITICAL:** Unified RecipeDetail screen - 100% complete
  - ✅ Story 8: VIEW mode (COMPLETED - 39 tests passing)
  - ✅ Story 9: CREATE mode (COMPLETED - 101 tests passing total)
  - ✅ Story 10: EDIT mode (COMPLETED - 73 tests passing, TDD with back button enhancement)
  - ✅ Story 11: DELETE functionality (COMPLETED - 110 tests passing, TDD implementation)
- ✅ **HIGH:** Add category & image fields to RecipeForm (COMPLETED)
- ✅ **HIGH:** Implement optimistic updates for better UX (COMPLETED - Story 12a & 12b)
  - ✅ Story 12a: Optimistic Delete (COMPLETED - 23 tests passing)
  - ✅ Story 12b: Optimistic Update (COMPLETED - 24 tests passing, 580/580 full suite)
  - 🔴 Story 12c: Optimistic Create (NOT STARTED - Optional for demo)
- ⏳ **MEDIUM:** MD3 polish and refinements (spacing, animations)

---

## Technical Stack

### Frontend
- **Framework:** React Native + React Native Web + Expo
- **State Management:** TanStack Query v5 (data fetching, caching, optimistic updates)
- **API Client:** Custom FetchClient with retry logic, timeouts, and RFC 9457 ProblemDetails support
- **Validation:** Zod schemas (runtime validation)
- **Testing:** Jest + React Testing Library (110 tests passing)
- **Mocking:** MSW (Mock Service Worker) for development

### Backend (Already Implemented)
- **Framework:** C# ASP.NET Core with .NET 8
- **Database:** SQL Server with Entity Framework Core
- **API Design:** RESTful with API versioning (v1)
- **Error Handling:** Global exception middleware with RFC 9457 ProblemDetails
- **Health Checks:** `/health` and `/readiness` endpoints implemented
- **Logging:** Structured logging with TraceId correlation
- **Security:** CORS configured, HTTPS redirection, SQL injection protection (EF Core parameterization)
- **Documentation:** Swagger/OpenAPI with XML comments
- **Deployment:** Azure App Service with CI/CD

### Infrastructure Features (Production-Ready)
- ✅ **API Versioning** - URL segment versioning (`/api/v1/recipe`)
- ✅ **Global Exception Handling** - RFC 9457 compliant ProblemDetails responses
- ✅ **Health Checks** - Kubernetes-ready health/readiness endpoints
- ✅ **Request/Response Logging** - TraceId correlation for debugging
- ✅ **CORS** - Configured for cross-origin requests
- ✅ **Retry Logic** - Frontend: 3 retries with exponential backoff
- ✅ **Timeout Protection** - 30-second timeout with AbortController
- ✅ **Environment Configuration** - User secrets in dev, Azure config in production

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
- Type-safe FetchClient with advanced features:
  - **Retry logic with exponential backoff** (3 retries, configurable delay)
  - **Timeout support** (30s default with AbortController)
  - **Request/response logging** in development mode
  - **ProblemDetails parsing** (RFC 9457 compliant)
- Request/Response DTOs matching C# API
- Zod validation schemas (runtime type safety)
- Environment-based configuration (EXPO_PUBLIC_API_URL)

**Files:**
- `lib/shared/api/recipe.service.ts` - Recipe CRUD operations
- `lib/shared/api/fetch-client.ts` - Enhanced fetch with retry/timeout
- `lib/shared/api/config.ts` - API configuration and environment variables
- `lib/shared/schemas/recipe.schema.ts` - Zod schemas
- `lib/shared/types/dto.ts` - TypeScript DTOs

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
- Added `userId` field to Recipe entity (optional, ready for Sprint 4)
- Database migration (`20250927044450_CategoryAndImageUrlAddToRecipe.cs`)
- Updated all API endpoints to include new fields
- Updated RecipeResponseDto and RecipeRequestDto
- Updated RecipeService.cs to handle new fields
- Updated all backend unit tests
- Frontend schemas support both fields
- MSW mock data includes categories and images

**Backend Architecture (Already Implemented):**
- **Entry Point:** `Program.cs` - Clean entry point delegates to setup classes
- **Configuration:** `Utility/Setup/ServiceConfiguration.cs` - DI registration, CORS, API versioning
- **Middleware Pipeline:** `Utility/Setup/ApplicationConfiguration.cs` - Ordered middleware setup
- **Global Exception Handler:** `Middleware/ExceptionHandlingMiddleware.cs` - RFC 9457 ProblemDetails
- **Request Logging:** `Middleware/RequestResponseLoggingMiddleware.cs` - HTTP logging with TraceId
- **Health Checks:** `Controllers/HealthController.cs` - Health and readiness endpoints
- **Data Context:** `Data/FoodBudgetDbContext.cs` - EF Core DbContext with Recipe DbSet

**Files:**
- Backend: `FoodBudgetAPI/Entities/Recipe.cs:46` - UserId field already present
- Backend: `FoodBudgetAPI/Data/FoodBudgetDbContext.cs` - DbContext configuration
- Backend: `FoodBudgetAPI/Controllers/HealthController.cs` - Health endpoints
- Backend: `FoodBudgetAPI/Middleware/ExceptionHandlingMiddleware.cs` - Global error handling
- Backend: `FoodBudgetAPI/Utility/Setup/ServiceConfiguration.cs` - Service registration
- Backend: `FoodBudgetAPI/Utility/Setup/ApplicationConfiguration.cs` - Middleware pipeline
- Frontend: `lib/shared/schemas/recipe.schema.ts:26-36`
- Frontend: `lib/shared/types/dto.ts`

---

## Phase 2.1: Error Handling & Type Safety Improvements ✅ COMPLETED

### Technical Improvements (October 2025)
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** Quality & Reliability

**Completed:**
- Added comprehensive error handling to RecipeListScreen
  - Error state UI with user-friendly messages
  - Retry button for failed API requests
  - Follows same pattern as RecipeDetailScreen
- Fixed TypeScript type safety in test utilities
  - Added explicit generic type parameters to `createMockNavigation<T>()`
  - Resolved type compatibility issues in RecipeDetailScreen tests
- Improved debugging capabilities
  - Added console.error logging in AddRecipeScreen catch blocks
  - Better error visibility for developers
- Fixed Promise handling in TanStack Query
  - Properly awaited `queryClient.invalidateQueries()` in delete mutation
  - Prevents race conditions and ensures cache consistency

**Benefits:**
- Better user experience during network failures
- Clear error messages with recovery options
- Improved type safety across test suite
- Better debugging information for developers
- Eliminated linter warnings and TypeScript errors

**Files Modified:**
- `screens/RecipeListScreen.tsx:88-109, 175-197` - Error state UI and async cache invalidation
- `screens/AddRecipeScreen.tsx:52-58` - Error logging
- `screens/__tests__/RecipeDetailScreen.unit.test.tsx:16,27-28` - Type safety
- `screens/__tests__/RecipeDetailScreen.integration.test.tsx:20,34` - Type safety

**Testing:**
- All existing tests passing
- Error state properly tested with testID attributes
- Type safety verified by TypeScript compiler

---

## Phase 3: Unified Recipe Detail Screen (CURRENT FOCUS)

### Navigation Architecture (RecipeDetailScreen)

**Decision:** Implemented using **2025 React Navigation Best Practices** (minimal params + local state)

#### Route Parameter Design
```typescript
RecipeDetail: {
    recipeId?: string;  // Only pass the ID (undefined for CREATE mode)
}
```

#### Mode Management Pattern
- **Mode stored in local component state** (not navigation params)
- Uses React `useState` for mode transitions
- Follows React Navigation 2025 guidance: "Pass minimal data in params"

#### Navigation Flow

**VIEW Mode (Story 8):**
- **Entry:** User taps recipe card from RecipeListScreen
- **Params:** `{ recipeId: '123' }`
- **Initial Mode:** `'view'` (read-only)
- **Actions:**
  - Back button → RecipeListScreen
  - Edit FAB → Internal state change to `'edit'` (no navigation)

**CREATE Mode (Story 9):**
- **Entry:** User taps FAB from RecipeListScreen
- **Params:** `{}` or `{ recipeId: undefined }`
- **Initial Mode:** `'create'`
- **Actions:**
  - Save → Navigate back to RecipeListScreen
  - Cancel → Navigate back to RecipeListScreen

**EDIT Mode (Story 10):**
- **Entry:** User taps Edit FAB while in VIEW mode
- **Transition:** Internal state change (`setCurrentMode('edit')`) - **NO navigation**
- **Actions:**
  - Save → Internal state change back to `'view'` + API update
  - Cancel → Internal state change back to `'view'` (no changes)

#### Implementation Example

```typescript
// Inside RecipeDetailScreen.tsx
const { recipeId } = route.params || {};

// Local state for mode (2025 best practice)
const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'create'>(() =>
    recipeId ? 'view' : 'create'
);

// Fetch data using TanStack Query
const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => RecipeService.getRecipeById(recipeId!),
    enabled: !!recipeId,  // Only fetch if ID exists (not CREATE mode)
});
```

#### Navigation Calls

```typescript
// VIEW mode - from recipe card
navigation.navigate('RecipeDetail', { recipeId: recipe.id });

// CREATE mode - from FAB
navigation.navigate('RecipeDetail', {});

// EDIT mode - internal state change (no navigation)
setCurrentMode('edit');
```

#### Rationale (2025 Best Practices)

✅ **Minimal params** - Only pass IDs, not full objects or UI state
✅ **Local state for UI modes** - useState for view/edit/create transitions
✅ **Data fetching in component** - TanStack Query fetches by ID
✅ **Deep linking ready** - URL pattern: `/recipe/:id` (no mode param)
✅ **Better testability** - No navigation mock complexity for mode changes
✅ **Cache-friendly** - Simple query keys: `['recipe', id]`

**Sources:**
- React Navigation Docs (2025): "Passing parameters to routes"
- TanStack Query v5 Patterns: "Optimistic updates with cache manipulation"

#### Route Changes
- ❌ **REMOVED:** `AddRecipe` route (replaced by CREATE mode)
- ✅ **ADDED:** `RecipeDetail` route with optional `recipeId`

---

### Story 7: Enhanced Recipe Data Model (Category + Image)
**Status:** ✅ COMPLETED

**User Story:**
As a developer, I need the recipe data model to support category and image fields so users can better organize and visualize their recipes.

**Scope:**
- Add `category` field (single string, NOT array - kept simple for demo)
- Add `imageUrl` field (optional string)
- Update DTOs, schemas, and validation
- Create CategoryPicker component (single-select dropdown, **extensible architecture for Sprint 4**)
- Create ImagePicker component (gallery selection + extensible UI for future camera/URL)

**Important Design Notes:**
- **Data Model:** Keep `category?: string` (single value, not array) for Sprint 3 demo
- **Backend API Alignment:** Category is nullable/optional to match backend API specification
- **CategoryPicker:** Single-select only, but designed with extensible props for Sprint 4 expansion
- **Future-Ready:** Components architected to support user-defined categories in Sprint 4 without breaking changes
- **Demo Focus:** 4 hardcoded categories (Breakfast, Lunch, Dinner, Dessert) sufficient for portfolio demo

**Tasks:**
- [x] Update `RecipeRequestDto` and `RecipeResponseDto` with category and imageUrl (✅ Already done)
- [x] Update `RecipeRequestSchema` and `RecipeResponseSchema` validation (✅ nullable/optional per backend)
- [x] Create `CategoryPicker` component with 4 hardcoded options (single-select)
- [x] Create `ImagePicker` component (select from gallery via expo-image-picker)
- [x] Update `RecipeForm` to include new fields
- [x] Add image preview in form
- [x] Update MSW handlers to support new fields (✅ Already done)

**Testing** (included in this story):
- [x] Unit tests for CategoryPicker (19 tests passing)
- [x] Unit tests for ImagePicker (19 tests passing)
- [x] RecipeForm tests with new fields (31 tests passing)
- [ ] Schema validation tests for category and imageUrl (optional - not blocking)

**Files Created:**
- ✅ `components/shared/forms/CategoryPicker.tsx` - Single-select dropdown component
- ✅ `components/shared/forms/ImagePicker.tsx` - Gallery image picker with preview
- ✅ `components/shared/forms/__tests__/CategoryPicker.test.tsx` - 19 unit tests
- ✅ `components/shared/forms/__tests__/ImagePicker.test.tsx` - 19 unit tests

**Files Modified:**
- ✅ `lib/shared/types/dto/recipe.dto.ts` (Already done)
- ✅ `lib/shared/schemas/recipe.schema.ts` (category nullable/optional per backend API)
- ✅ `components/shared/recipe/RecipeForm.tsx` - Added CategoryPicker and ImagePicker
- ✅ `components/shared/recipe/__tests__/RecipeForm.unit.test.tsx` - 31 tests passing

**Test Results:**
- ✅ CategoryPicker: 19/19 tests passing
- ✅ ImagePicker: 19/19 tests passing
- ✅ RecipeForm: 31/31 tests passing
- ✅ **Total: 69 tests passing**

**Acceptance Criteria:**
- ✅ Category can be selected from dropdown (4 hardcoded options: Breakfast, Lunch, Dinner, Dessert)
- ✅ Image can be picked from gallery via expo-image-picker
- ✅ Image preview shows in form with change/remove buttons
- ✅ Category validation matches backend API (nullable/optional)
- ✅ CategoryPicker component architecture supports future expansion (props ready for Sprint 4)
- ✅ ImagePicker supports future camera/URL input (extensible design)
- ✅ All tests pass (69 passing)
- ✅ Progressive validation on form (errors only after submit attempt)
- ✅ PaperProvider context properly configured in tests

**Sprint 4 Expansion (Out of Scope for Demo):**
See Sprint 4 Story: "User-Defined Multi-Category System" for:
- Multi-select categories
- User-defined category creation/management
- Backend user_categories table + API
- Migration from `category` to `categories: string[]`

---

### Story 8: RecipeDetailScreen - VIEW Mode
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** Core Feature
**Dependencies:** Story 7
**Estimated Effort:** Medium

**User Story:**
As a user, I want to tap a recipe card and see all recipe details in a beautiful, read-only view.

**Scope:**
- Create RecipeDetailScreen structure
- Implement VIEW mode (read-only display)
- Add navigation from RecipeListScreen
- Material Design 3 styling
- Show all fields including category and image

**Tasks:**
- [x] Create `RecipeDetailScreen.tsx` with mode state
- [x] Implement VIEW mode layout (read-only)
- [x] Add TanStack Query hook for fetching recipe by ID
- [x] Display all recipe fields beautifully (MD3 styling)
- [x] Show recipe image (if present)
- [x] Add loading state
- [x] Add error handling
- [x] Update navigation types for RecipeDetail route
- [x] Add RecipeDetail to AppNavigator HomeStack
- [x] Update RecipeListScreen to navigate to VIEW mode

**Testing** (included in this story):
- [x] Unit tests for RecipeDetailScreen VIEW mode (26 tests passing)
- [x] Integration tests for VIEW mode with API (13 tests passing)
- [x] Navigation tests (card tap → VIEW mode)
- [x] Loading state tests
- [x] Error state tests

**Files Created:**
- ✅ `screens/RecipeDetailScreen.tsx` - Unified screen with VIEW mode implemented
- ✅ `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - 26 comprehensive unit tests
- ✅ `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - 13 integration tests with MSW

**Files Modified:**
- ✅ `navigation/AppNavigator.tsx` - RecipeDetail route added to HomeStack
- ✅ `types/navigation.ts` - Navigation types for RecipeDetail with optional recipeId
- ✅ `screens/RecipeListScreen.tsx` - handleRecipePress navigates to VIEW mode

**Test Results:**
- ✅ **Unit Tests:** 26/26 passing
  - Risk-based priority tests (mode initialization, data fetching, field display)
  - Happy path tests (render flow, back navigation)
  - Null/empty/invalid tests (missing fields, malformed data, 404 errors)
  - Boundaries tests (long text, special characters)
  - Business rules tests (read-only enforcement, required vs optional fields)
  - Error handling tests (API errors, network failures)
  - Edge cases (zero/negative servings, empty IDs)
  - Accessibility tests (screen reader support, ARIA labels)
  - React Query integration (loading, caching)
- ✅ **Integration Tests:** 13/13 passing
  - Critical workflow (navigation → query → display)
  - API contract validation (RecipeResponseDto schema)
  - Error propagation (500/404/503 errors)
  - Data integrity through full stack
  - Backwards compatibility with API evolution

**Acceptance Criteria:**
- ✅ Tapping recipe card opens VIEW mode
- ✅ All recipe data displayed (title, category, servings, instructions, image)
- ✅ Material Design 3 styling applied
- ✅ Loading state shown while fetching
- ✅ Error handling for failed fetches
- ✅ Back navigation works
- ✅ All tests pass (39/39)

---

### Story 9: RecipeDetailScreen - CREATE Mode
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** Core Feature
**Dependencies:** Story 8
**Estimated Effort:** Medium

**User Story:**
As a user, I want to create new recipes with all fields through an intuitive form.

**Scope:**
- Implement CREATE mode in RecipeDetailScreen
- Empty form with all fields (including category and image)
- Save functionality with TanStack Query mutation
- Navigate from FAB to CREATE mode

**Tasks:**
- [x] Add CREATE mode to RecipeDetailScreen
- [x] Detect CREATE mode from route params (no ID)
- [x] Show RecipeForm with empty fields
- [x] Implement create mutation with TanStack Query
- [x] Handle success (navigate to VIEW mode with new recipe)
- [x] Handle errors (show snackbar)
- [x] Update FAB in RecipeListScreen to navigate to CREATE
- [x] Update navigation params
- [x] Add success Snackbar display
- [x] Implement cache invalidation for recipe list

**Testing** (included in this story):
- [x] Unit tests for CREATE mode (25 comprehensive tests)
- [x] Integration tests for creating recipes with API (6 tests)
- [x] Form validation tests
- [x] Success navigation tests
- [x] Error handling tests
- [x] Test all fields including category and image
- [x] FAB navigation test in RecipeListScreen (1 test)
- [x] Test modernization to 2025 RTL patterns

**Files Modified:**
- ✅ `screens/RecipeDetailScreen.tsx:289-332` - CREATE mode implementation
- ✅ `screens/RecipeListScreen.tsx:126-129` - FAB navigation update
- ✅ `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - 51 unit tests (all passing)
- ✅ `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - 19 integration tests (all passing)
- ✅ `screens/__tests__/RecipeListScreen.unit.test.tsx:417-438` - FAB test added
- ✅ `test/test-utils.tsx:34-70` - Enhanced with userEvent support

**Documentation Updated:**
- ✅ `docs/testing/unit_testing_guide.md` - Added 2025 syntax patterns section
- ✅ `docs/testing/integration_testing_guide.md` - Added 2025 syntax patterns section

**Test Results:**
- ✅ **RecipeDetailScreen Unit Tests:** 51/51 passing
  - Risk-based priority (9 tests): Mode detection, API integration, form rendering, mutation execution
  - Happy path (6 tests): Header, cancel button, complete data submission, Snackbar display
  - Null/invalid (2 tests): Invalid form handling, optional fields
  - Boundaries (3 tests): Long title/instructions, special characters
  - Business rules (3 tests): Empty initialValues, DTO contract, form defaults
  - Error handling (6 tests): API 500/400, network timeout, navigation prevention, data preservation, retry
  - Accessibility (3 tests): Cancel button, loading state, Snackbar accessibility
- ✅ **RecipeDetailScreen Integration Tests:** 19/19 passing
  - 89.5% Narrow Integration (17 tests)
  - 10.5% Broad Integration (2 tests)
  - CREATE mode coverage: 6 integration tests
- ✅ **RecipeListScreen Unit Tests:** 31/31 passing
  - Includes new FAB navigation test
- ✅ **Total: 101 tests passing**

**Test Modernization (2025 RTL Patterns):**
- ✅ Updated all tests to use `screen` instead of destructuring
- ✅ Applied semantic assertions (`.toBeVisible()`, `.toBeOnTheScreen()`)
- ✅ Added `fireEvent` import for interaction testing
- ✅ Enhanced test-utils with userEvent support
- ✅ Fixed Snackbar assertions to use `.toBeOnTheScreen()`
- ✅ Updated testing guides with 2025 syntax sections

**Acceptance Criteria:**
- ✅ FAB opens CREATE mode with empty form
- ✅ All fields editable (including category picker and image picker)
- ✅ Form validation works
- ✅ Save creates recipe via API
- ✅ Success shows Snackbar message
- ✅ Success navigates to VIEW mode with new recipe ID
- ✅ New recipe appears in list (cache invalidation)
- ✅ Errors shown to user via Snackbar
- ✅ All tests pass (101/101)
- ✅ Loading state shown during mutation
- ✅ Form stays editable on error
- ✅ User can retry after error
- ✅ All accessibility labels present

---

### Story 10: RecipeDetailScreen - EDIT Mode & Transitions
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** Core Feature
**Dependencies:** Story 9
**Estimated Effort:** Medium

**User Story:**
As a user, I want to edit existing recipes and have smooth transitions between viewing and editing.

**Scope:**
- Implement EDIT mode in RecipeDetailScreen
- Add Edit FAB/button in VIEW mode
- Pre-populate form with existing data
- Update functionality with TanStack Query mutation
- Cancel returns to VIEW mode with confirmation dialog
- Back button behavior is mode-aware (returns to VIEW mode in EDIT)

**Tasks:**
- [x] Add EDIT mode to RecipeDetailScreen
- [x] Add Edit FAB in VIEW mode
- [x] Mode transition: VIEW → EDIT
- [x] Pre-populate RecipeForm with recipe data
- [x] Implement update mutation with TanStack Query
- [x] Handle success (return to VIEW mode)
- [x] Handle cancel with confirmation dialog (only if changes)
- [x] Handle errors (show snackbar)
- [x] Implement back button mode-aware behavior using useImperativeHandle
- [x] Add forwardRef to RecipeForm to expose hasFormChanges

**Testing** (included in this story):
- [x] Unit tests for EDIT mode (73 tests passing)
- [x] Integration tests for updating recipes
- [x] Mode transition tests (VIEW ↔ EDIT)
- [x] Pre-population tests
- [x] Cancel behavior tests (with and without changes)
- [x] Confirmation dialog tests
- [x] Back button tests (EDIT mode with/without changes)
- [x] Success/error handling tests

**Files Modified:**
- ✅ `screens/RecipeDetailScreen.tsx:378-472` - EDIT mode implementation
  - Added Edit FAB in VIEW mode
  - Mode transition logic (VIEW → EDIT)
  - Update mutation with cache invalidation
  - Cancel handler with dirty checking
  - Confirmation dialog for unsaved changes
  - Back button handler with mode awareness
  - RecipeForm ref integration
- ✅ `components/shared/recipe/RecipeForm.tsx:1-283` - Ref support
  - Converted to forwardRef component
  - Added RecipeFormRef interface with hasFormChanges method
  - Used useImperativeHandle to expose hasFormChanges
  - Maintained clean separation of concerns
- ✅ `components/shared/index.ts:19` - Export RecipeFormRef type
- ✅ `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - 73 tests passing
  - EDIT mode tests (initialization, form rendering, pre-population)
  - Update mutation tests (success/error handling)
  - Cancel behavior tests (with/without changes)
  - Confirmation dialog tests
  - Back button behavior tests (EDIT mode with/without changes)
  - Snackbar tests (success/error messages)

**2025 Best Practices Applied:**
- ✅ `forwardRef` and `useImperativeHandle` for parent-child communication
- ✅ Minimal state lifting (form state stays in RecipeForm)
- ✅ Mode-aware handlers with clean separation
- ✅ Confirmation dialog only when form has unsaved changes
- ✅ Back button behavior matches Cancel button in EDIT mode
- ✅ TDD approach (Red → Green → Refactor)

**Test Results:**
- ✅ **All 73 tests passing**
  - Risk-Based Priority: EDIT mode initialization, mutations, form rendering
  - Happy Path: Edit FAB, save flow, cancel flow
  - Business Rules: Form pre-population, confirmation dialog
  - Error Handling: API failures, network errors
  - Edge Cases: Back button behavior in EDIT mode

**Acceptance Criteria:**
- ✅ Edit FAB visible in VIEW mode
- ✅ Tapping Edit FAB enters EDIT mode
- ✅ Form pre-populated with current data
- ✅ All fields editable (including category and image)
- ✅ Save updates recipe via API
- ✅ Success returns to VIEW mode with updated data
- ✅ Cancel shows confirmation dialog if changes exist
- ✅ Cancel returns to VIEW mode immediately if no changes
- ✅ Back button in EDIT mode behaves like Cancel button
- ✅ Confirmation dialog for unsaved changes
- ✅ All tests pass (73/73)

---

### Story 11: Delete Functionality
**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Type:** Enhancement
**Dependencies:** Story 10
**Estimated Effort:** Small

**User Story:**
As a user, I want to delete recipes from the detail screen with a confirmation prompt.

**Scope:**
- Add Delete functionality in header menu
- Confirmation dialog before deletion
- Navigate back to list after successful delete
- Proper error handling

**Tasks:**
- [x] Add Delete button in header (VIEW and EDIT modes)
- [x] Implement delete mutation with TanStack Query
- [x] Confirmation dialog before delete
- [x] Navigate back to list after delete
- [x] Delete old AddRecipeScreen files (already removed in Story 9)

**Testing** (included in this story):
- [x] Unit tests for Delete functionality (13 tests)
- [x] Integration tests for delete with API (3 tests)
- [x] Confirmation dialog tests
- [x] Navigation after delete tests
- [x] Error handling tests (API failures, network errors)
- [x] Cache invalidation tests
- [x] Update affected tests (remove AddRecipeScreen references)

**Files Modified:**
- ✅ `screens/RecipeDetailScreen.tsx:1-567` - Delete mutation, dialog, UI elements
- ✅ `test/test-utils.tsx:35-72` - Enhanced to return queryClient for cache testing
- ✅ `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - 85 tests passing (13 new delete tests)
- ✅ `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - 25 tests passing (3 new delete tests)

**Files Already Deleted (Story 9):**
- ✅ `screens/AddRecipeScreen.tsx` (removed in Story 9)
- ✅ `screens/__tests__/AddRecipeScreen.test.tsx` (removed in Story 9)
- ✅ `screens/__tests__/AddRecipeScreen.integration.test.tsx` (removed in Story 9)

**Test Results:**
- ✅ **RecipeDetailScreen Unit Tests:** 85/85 passing
  - Risk-Based Priority: Delete button visibility, confirmation dialog, API integration, cache invalidation
  - Null/Empty/Invalid: Cancel confirmation dialog behavior
  - Boundaries: Delete button excluded from CREATE mode
  - Business Rules: Delete only in VIEW/EDIT modes
  - Error Handling: API 500/404 errors, network failures, stays on screen on error
- ✅ **RecipeDetailScreen Integration Tests:** 25/25 passing
  - Section 1 (Risk-Based Priority): DELETE success flow with navigation (1 test)
  - Section 4 (Error Propagation): DELETE API errors 500/404 (2 tests)
- ✅ **Total: 110 tests passing** (85 unit + 25 integration)

**Implementation Details:**
- Delete button appears in VIEW and EDIT mode headers (IconButton with "delete" icon)
- Confirmation dialog: "Delete Recipe? Are you sure you want to delete this recipe? This action cannot be undone."
- DELETE mutation with TanStack Query
- Success: navigate back to list with "Recipe deleted successfully!" snackbar
- Error: stay on screen with error snackbar
- Cache invalidation on successful deletion
- testIDs: recipe-detail-delete-button, recipe-detail-delete-dialog-confirm, recipe-detail-delete-dialog-cancel

**Acceptance Criteria:**
- ✅ Delete button in header (VIEW and EDIT modes)
- ✅ Delete button excluded from CREATE mode
- ✅ Confirmation dialog shown before delete
- ✅ Delete removes recipe via API (DELETE /api/Recipe/:id)
- ✅ Navigates back to list after successful delete
- ✅ Error handling prevents navigation on failure
- ✅ Snackbar feedback for success/error
- ✅ Recipe list cache invalidated on success
- ✅ Old AddRecipeScreen removed (completed in Story 9)
- ✅ All tests pass (110/110)
- ✅ No references to AddRecipeScreen remain (verified)

---

### Story 12: Optimistic Updates with TanStack Query (SPLIT INTO 12a, 12b, 12c)

**⚠️ This story has been split into three phased implementations for better risk management and incremental delivery. See Stories 12a, 12b, and 12c below.**

---

### Story 12a: Optimistic Delete with Rollback
**Status:** ✅ COMPLETED
**Priority:** HIGH
**Type:** UX Enhancement
**Dependencies:** Story 11
**Estimated Effort:** Small (5-6 hours)
**Actual Effort:** ~5 hours (TDD implementation)

**2025 Standards Applied:**
✅ Cache Manipulation (multi-location updates)
✅ Manual Rollback + Refetch (fast + consistent)
✅ Retry Actions (user-friendly errors)
✅ Query Cancellation (concurrent handling)

**User Story:**
As a user, I want deleted recipes to disappear instantly so the app feels responsive, with automatic rollback if the deletion fails.

**Why Start Here?**
- ✅ Simplest optimistic update (no temp IDs, no navigation concerns)
- ✅ Delete mutation already exists in RecipeListScreen
- ✅ Validates the optimistic pattern before tackling complex scenarios
- ✅ Immediate UX improvement with low risk

**Current Behavior:**
Delete: Confirm → Wait → Snackbar → List refetches

**Target Behavior:**
Delete: Confirm → **Instantly disappears** → API deletes in background → Success/Rollback

**Implementation Tasks:**
- [x] Create `FoodBudgetMobileApp/src/hooks/` directory
- [x] Create `hooks/useRecipeMutations.ts` with optimistic delete
- [x] Migrate delete mutation from RecipeListScreen to hook
- [x] Add onMutate to remove from cache immediately
- [x] Add onError with rollback + refetch for consistency
- [x] Add onSuccess with refetch for consistency
- [x] Add retry action to error snackbar
- [x] Write tests in `hooks/__tests__/useRecipeMutations.test.tsx` (11 tests)
- [x] Add RecipeListScreen unit tests (5 tests)
- [x] Add RecipeListScreen integration tests (7 tests)

**Files to Create:**
- `FoodBudgetMobileApp/src/hooks/useRecipeMutations.ts`
- `FoodBudgetMobileApp/src/hooks/__tests__/useRecipeMutations.test.tsx`

**Files to Modify:**
- `screens/RecipeListScreen.tsx:90-110` - Use new hook instead of inline mutation

**Technical Implementation:**
```typescript
// hooks/useRecipeMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RecipeService } from '../lib/shared/api/recipe.service';
import type { RecipeResponseDto } from '../lib/shared/types/dto';

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RecipeService.deleteRecipe,
    onMutate: async (recipeId: string) => {
      // Cancel outgoing refetches (handles concurrency)
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      // Snapshot current state for rollback
      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);

      // Optimistically remove from cache
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.filter(r => r.id !== recipeId) || []
      );

      return { previousRecipes, recipeId };
    },
    onError: (err, recipeId, context) => {
      // Manual rollback (instant)
      if (context?.previousRecipes) {
        queryClient.setQueryData(['recipes'], context.previousRecipes);
      }

      // Refetch for consistency (background)
      queryClient.invalidateQueries({ queryKey: ['recipes'] });

      // Error snackbar with retry handled by UI
    },
    onSuccess: () => {
      // Success snackbar handled by UI
      // NO invalidate - trust optimistic update
    },
  });
};
```

**Usage in RecipeListScreen:**
```typescript
const deleteMutation = useDeleteRecipe();

const handleDelete = async (recipeId: string) => {
  try {
    await deleteMutation.mutateAsync(recipeId);
    showSnackbar({ message: 'Recipe deleted', type: 'success' });
  } catch (error) {
    showSnackbar({
      message: 'Failed to delete recipe',
      type: 'error',
      action: {
        label: 'Retry',
        onPress: () => handleDelete(recipeId)
      }
    });
  }
};
```

**Acceptance Criteria:**
- [x] Deleted recipe disappears instantly from list
- [x] Failed delete operations rollback cleanly (recipe reappears)
- [x] Background refetch ensures consistency after error
- [x] Success snackbar shown after successful delete
- [x] Error snackbar shown with retry action after failed delete
- [x] No duplicate recipes after rollback
- [x] Tests verify optimistic update and rollback behavior (23 tests)
- [x] Query cancellation prevents race conditions

**Test Results:**
- ✅ 11/11 hook unit tests passing
- ✅ 5/5 RecipeListScreen unit tests passing
- ✅ 7/7 RecipeListScreen integration tests passing
- **Total: 23/23 tests passing (100%)**

---

### Story 12b: Optimistic Update with Consistency
**Status:** ✅ COMPLETED
**Commit:** [d2f490c](../../commit/d2f490c)
**Priority:** HIGH
**Type:** UX Enhancement
**Dependencies:** Story 12a
**Estimated Effort:** Medium (7-8 hours)
**Actual Effort:** ~6 hours (TDD implementation with full test suite restoration)

**2025 Standards Applied:**
✅ Cache Manipulation (multi-location updates)
✅ Manual Rollback + Refetch (fast + consistent)
✅ Retry Actions (user-friendly errors)
✅ Query Cancellation (concurrent handling)

**User Story:**
As a user, I want recipe updates to show instantly in both the detail screen and list so I see my changes immediately.

**Why Second?**
- ✅ Builds on delete pattern from 12a
- ✅ No temp ID complexity (recipe already has real ID)
- ✅ Validates cache consistency between detail and list views
- ✅ Sets up foundation for create (most complex)

**Current Behavior:**
Update: Submit → Wait → Alert → Navigate → List refetches

**Target Behavior:**
Update: Submit → **Instantly updates in list** → API saves in background → Success/Rollback → Navigate

**Implementation Tasks:**
- [x] Add `useUpdateRecipe` to `hooks/useRecipeMutations.ts`
- [x] Update both ['recipes'] and ['recipe', id] query keys optimistically
- [x] Update category-specific caches (['recipes', 'All'], ['recipes', 'Breakfast'], etc.)
- [x] Add rollback for both caches on error + refetch
- [x] Manual retry enabled by staying in EDIT mode on error
- [x] Navigation blocked until API confirms (no navigation in handleEditSubmit until success)
- [x] Add tests for update optimistic flow (13 hook tests + 5 unit tests + 6 integration tests)
- [x] Fix all existing test suite failures (restored to 580/580 passing)

**Files Modified:**
- `hooks/useRecipeMutations.ts` - Added useUpdateRecipe with multi-cache optimistic updates
- `screens/RecipeDetailScreen.tsx` - Integrated useUpdateRecipe hook for EDIT mode
- `hooks/__tests__/useRecipeMutations.test.tsx` - Added 13 comprehensive update tests
- `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - 5 new Story 12b tests
- `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - 6 new Story 12b tests
- `mocks/handlers/recipes.ts` - Fixed MSW URL pattern (/api/Recipe/search)

**Technical Implementation:**
```typescript
// hooks/useRecipeMutations.ts
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecipeUpdateDto }) =>
      RecipeService.updateRecipe(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['recipes'] });
      await queryClient.cancelQueries({ queryKey: ['recipe', id] });

      const previousRecipes = queryClient.getQueryData<RecipeResponseDto[]>(['recipes']);
      const previousRecipe = queryClient.getQueryData<RecipeResponseDto>(['recipe', id]);

      // Optimistically update in list
      queryClient.setQueryData<RecipeResponseDto[]>(['recipes'], (old) =>
        old?.map(r => r.id === id ? { ...r, ...data } : r) || []
      );

      // Optimistically update in detail
      queryClient.setQueryData<RecipeResponseDto>(['recipe', id], (old) =>
        old ? { ...old, ...data } : old
      );

      return { previousRecipes, previousRecipe, id };
    },
    onError: (err, { id }, context) => {
      // Rollback both caches
      if (context?.previousRecipes) {
        queryClient.setQueryData(['recipes'], context.previousRecipes);
      }
      if (context?.previousRecipe) {
        queryClient.setQueryData(['recipe', id], context.previousRecipe);
      }

      // Refetch for consistency
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    },
    onSuccess: (updatedRecipe, { id }) => {
      // Replace optimistic data with server response
      queryClient.setQueryData(['recipes'], (old: RecipeResponseDto[] | undefined) =>
        old?.map(r => r.id === id ? updatedRecipe : r) || []
      );
      queryClient.setQueryData(['recipe', id], updatedRecipe);
    },
  });
};
```

**Test Results:**
- ✅ **Hook Tests:** 13/13 passing (useUpdateRecipe)
  - Risk-Based Priority: Multi-cache optimistic updates (list + detail + categories)
  - Happy Path: Successful update with server response replacement
  - Error Handling: Rollback both caches on failure + background refetch
  - Null/Empty/Invalid: Partial updates, recipe not in list, category cache updates
  - Boundaries: First/last recipe in list updates correctly
- ✅ **Unit Tests:** 5/5 new Story 12b tests passing
  - Optimistic cache update (instant UI)
  - Success flow (snackbar + return to VIEW mode)
  - Error handling (rollback + error snackbar + stay in EDIT mode for retry)
  - Loading indicator during save
- ✅ **Integration Tests:** 6/6 new Story 12b tests passing
  - Multi-cache sync (list + detail)
  - Server data transformation (optimistic → server response)
  - Network timeout with rollback
  - Legacy API compatibility
  - Error propagation through full stack
- ✅ **Full Test Suite:** 580/580 tests passing (restored from broken state)

**Acceptance Criteria:**
- [x] Updated recipe reflects changes immediately in list
- [x] Updated recipe reflects changes immediately in detail screen
- [x] Updated recipe reflects changes in all category caches
- [x] Failed updates rollback cleanly in all cache locations
- [x] Background refetch ensures consistency after error
- [x] Navigation blocked until API confirms update (stays in EDIT on error)
- [x] Loading indicator shown during background save (isPending state)
- [x] Error snackbar shown for failures with manual retry (user stays in EDIT mode)
- [x] List and detail stay consistent through optimistic updates
- [x] Server response replaces optimistic data on success
- [x] Tests verify multi-cache update and rollback (24 tests total: 13 hook + 5 unit + 6 integration)

---

### Story 12c: Optimistic Create with UUID Temp IDs
**Status:** ✅ COMPLETED
**Commit:** [a069fe3](../../commit/a069fe3)
**Priority:** HIGH
**Type:** UX Enhancement
**Dependencies:** Story 12b
**Estimated Effort:** Large (9-10 hours)
**Actual Effort:** ~8 hours (TDD implementation + scalable refactoring)

**2025 Standards Applied:**
✅ Cache Manipulation (multi-location updates)
✅ Manual Rollback + Refetch (fast + consistent)
✅ Retry Actions (user-friendly errors)
✅ UUID Temp IDs (expo-crypto for uniqueness)
✅ Query Cancellation (concurrent handling)

**User Story:**
As a user, I want newly created recipes to appear instantly in the list so I see my recipe immediately while it saves.

**Why Last?**
- ⚠️ Most complex (temp ID → real ID replacement)
- ⚠️ Navigation concerns (can't navigate to detail with temp ID)
- ⚠️ Requires lessons learned from 12a and 12b
- ✅ Completes the optimistic update story

**Current Behavior:**
Create: Submit → Wait → Alert → Navigate → List refetches

**Target Behavior:**
Create: Submit → **Instantly appears in list** → Navigate to detail → API saves in background → Replace temp ID

**Implementation Tasks:**
- [x] Add `useCreateRecipe` to `hooks/useRecipeMutations.ts`
- [x] Generate temp ID using `expo-crypto`: `temp-${Crypto.randomUUID()}`
- [x] Add recipe to cache with temp ID and timestamp
- [x] Sort list by createdAt (new recipe appears at top)
- [x] Block navigation until real ID received (using `mutateAsync`)
- [x] Replace temp ID with real ID on success + refetch
- [x] Remove temp recipe on error (rollback with refetch)
- [x] Add retry action to error snackbar (manual retry in CREATE mode)
- [x] Show inline loading indicator on temp recipe card (RecipeGridCard)
- [x] Add tests for create optimistic flow with temp ID (33 tests written in RED phase)
- [x] REFACTOR: Remove hardcoded categories for scalable custom category support
- [x] REFACTOR: Use invalidation pattern instead of manual category cache updates

**Files Modified:**
- ✅ `hooks/useRecipeMutations.ts` - Added useCreateRecipe + scalable refactoring
- ✅ `screens/RecipeDetailScreen.tsx` - Integrated useCreateRecipe for CREATE mode
- ✅ `components/shared/recipe/RecipeGridCard.tsx` - Added loading indicator for temp IDs
- ✅ `hooks/__tests__/useRecipeMutations.test.tsx` - Added 11 create tests + fixed timing
- ✅ `screens/__tests__/RecipeDetailScreen.unit.test.tsx` - Added 11 CREATE tests + fixes
- ✅ `screens/__tests__/RecipeDetailScreen.integration.test.tsx` - Added 11 integration tests + fixes
- ✅ `components/shared/recipe/__tests__/RecipeGridCard.test.tsx` - Added temp ID loading tests
- ✅ `package.json` - Added expo-crypto dependency

**Test Results:**
- ✅ **Hook Tests:** 11/11 passing (useCreateRecipe)
  - Temp UUID generation with expo-crypto
  - Optimistic add to top of list
  - Temp ID → real ID replacement on success
  - Rollback on error (removes temp recipe)
  - Multi-cache cleanup
- ✅ **Unit Tests:** 11/11 new Story 12c tests passing
  - CREATE mode integration with useCreateRecipe hook
  - Navigation blocking until real ID received (mutateAsync)
  - Temp recipe appears in list instantly
  - Error handling with retry support
- ✅ **Integration Tests:** 11/11 new Story 12c tests passing
  - Full temp ID lifecycle (creation → replacement)
  - MSW handlers with delayed responses
  - Error rollback with temp ID cleanup
- ✅ **Component Tests:** Temp ID loading indicator tests (RecipeGridCard)
- ✅ **Full Test Suite:** 613/613 tests passing

**REFACTOR Phase Improvements:**
- ✅ Removed hardcoded `RECIPE_CATEGORIES` constant
- ✅ Simplified cache updates to use invalidation pattern
- ✅ Scalable for custom user categories (Sprint 4 ready)
- ✅ Main cache gets optimistic updates (instant UI)
- ✅ Category caches updated via refetch (works with any categories)

**Acceptance Criteria:**
- [x] New recipe appears instantly at top of list with temp UUID
- [x] Temp recipe shows loading indicator (RecipeGridCard with activity indicator)
- [x] Navigation blocked until real ID received (using mutateAsync)
- [x] Temp ID replaced with real ID after success
- [x] Failed creates remove temp recipe from list with refetch
- [x] Error snackbar with manual retry shown for failures (user stays in CREATE mode)
- [x] No duplicate entries after temp ID replacement
- [x] Tests verify temp UUID lifecycle (33 tests: 11 hook + 11 unit + 11 integration)
- [x] Scalable refactoring for custom categories completed
- [x] All 613 tests passing (including Story 12c)

---

### Story 12.5: Error Boundary & Offline Detection
**Status:** ✅ COMPLETED
**Commits:**
- [4d7efdb](../../commit/4d7efdb) - Production-ready error handling and offline detection
- [18b7342](../../commit/18b7342) - Platform-specific offline detection for web and native
**Priority:** CRITICAL
**Type:** Reliability & UX
**Dependencies:** Story 11
**Estimated Effort:** Small (4-5 hours)
**Actual Effort:** ~6 hours (includes 2025 standards research and optimization)

**2025 Standards Applied:**
✅ TanStack Query OnlineManager (event-based offline detection)
✅ NetInfo integration (checks both `isConnected` AND `isInternetReachable`)
✅ Network mode: 'online' (pauses queries/mutations when offline)
✅ Exponential backoff retry strategy (industry standard)
✅ React Error Boundaries (standard since React 16)

**User Story:**
As a user, I want the app to handle errors gracefully and inform me when I'm offline, so I don't see blank screens or confusing error messages.

**Implementation Summary:**
- ✅ **TanStack Query OnlineManager** - Modern event-based offline detection (no polling)
- ✅ **ErrorBoundary Component** - Catches React component errors
- ✅ **ErrorFallbackScreen** - User-friendly error UI with reset
- ✅ **OfflineBanner** - Visual feedback when user is offline
- ✅ **Improved Mutation Resilience** - Increased retry count and exponential backoff

**Key Architecture Decisions:**

**1. Offline Detection Strategy (2025 Standard):**
- **Rejected:** Manual health check endpoints (false negatives, server load)
- **Rejected:** `navigator.onLine` only (unreliable for captive portals)
- **Implemented:** TanStack Query OnlineManager + NetInfo
  - Checks BOTH `isConnected` AND `isInternetReachable`
  - Handles WiFi-but-no-internet scenarios (captive portals)
  - Event-based (no polling, better performance)

**2. Query/Mutation Behavior:**
- `networkMode: 'online'` - Queries/mutations pause when offline
- Automatic resume on reconnect
- `refetchOnReconnect: 'always'` - Fresh data after reconnecting

**3. Retry Strategy:**
- Queries: 2 retries (default is 3)
- Mutations: 2 retries (default is 0 - we're more resilient)
- Retry delay: `Math.min(1000 * 2 ** attemptIndex, 30000)` - Exponential backoff
  - 1st retry: 1s, 2nd retry: 2s, cap at 30s

**Implementation Tasks:**
- [x] Create ErrorBoundary component with getDerivedStateFromError
- [x] Create ErrorFallbackScreen with "Try Again" button
- [x] Create OfflineBanner component with NetInfo integration
- [x] Wrap App root with ErrorBoundary
- [x] Configure TanStack Query OnlineManager with NetInfo
- [x] Set networkMode: 'online' for queries and mutations
- [x] Increase mutation retry count from 1 to 2
- [x] Add exponential backoff for mutations
- [x] Fix ErrorFallbackScreen TouchableRipple issue
- [x] Unit tests for ErrorBoundary (8 tests)
- [x] Unit tests for OfflineBanner (4 tests)
- [x] Integration tests for OfflineBanner (3 tests)
- [x] Integration tests for ErrorBoundary (removed placeholder tests)
- [x] All 635 tests passing after implementation

**Files Created:**
- ✅ `src/components/ErrorBoundary.tsx` - React error boundary
- ✅ `src/screens/ErrorFallbackScreen.tsx` - Error UI with reset button
- ✅ `src/components/OfflineBanner.tsx` - Offline visual indicator
- ✅ `src/components/__tests__/ErrorBoundary.test.tsx` - 8 comprehensive tests
- ✅ `src/components/__tests__/OfflineBanner.test.tsx` - 4 unit tests
- ✅ `src/components/__tests__/OfflineBanner.integration.test.tsx` - 3 integration tests

**Files Modified:**
- ✅ `App.tsx:22-52` - OnlineManager setup + QueryClient configuration
  - OnlineManager with NetInfo listener
  - Network mode: 'online' for queries/mutations
  - Mutation retry: 2 with exponential backoff
  - Wrapped app with ErrorBoundary
  - Added OfflineBanner at app root
- ✅ `src/screens/ErrorFallbackScreen.tsx` - Fixed Card.Title onPress with TouchableRipple

**Files NOT Modified (Simpler Approach):**
- ❌ `fetch-client.ts` - NO manual connectivity checks (TanStack Query handles it)
- ❌ No health check endpoints needed
- ❌ No navigator.onLine checks (NetInfo is more reliable)

**Files Deleted (Cleanup):**
- ✅ Removed placeholder test files that didn't follow naming conventions
- ✅ All obsolete mocks and test helpers

**Test Results:**
- ✅ **ErrorBoundary Tests:** 8/8 passing
  - Risk-Based Priority: Error catching, state updates, error logging
  - Happy Path: Normal rendering without errors
  - Errors: Multiple sequential errors, error in fallback
- ✅ **OfflineBanner Unit Tests:** 4/4 passing
  - Online state (hidden), Offline state (visible)
  - Airplane mode, WiFi but no internet
- ✅ **OfflineBanner Integration Tests:** 3/3 passing
  - Real-time network status updates
  - Banner persists across navigation
  - WiFi to cellular transitions
- ✅ **ErrorFallbackScreen Tests:** 8/8 passing
  - User-friendly error messages, Try again button
  - Development mode error details
- ✅ **Full Test Suite:** 635/635 tests passing

**Acceptance Criteria:**
- [x] ErrorBoundary wraps app root in App.tsx
- [x] Component errors caught by ErrorBoundary (no white screen)
- [x] ErrorFallbackScreen shows with user-friendly message
- [x] "Try Again" button resets error state and re-renders app
- [x] TanStack Query OnlineManager integrated with NetInfo
- [x] Queries/mutations pause when offline (networkMode: 'online')
- [x] OfflineBanner shows when device is offline
- [x] OfflineBanner handles captive portals (WiFi-but-no-internet)
- [x] Automatic refetch on reconnect
- [x] Mutations retry 2 times with exponential backoff
- [x] All 635 tests passing
- [x] Implementation follows 2025 standards (verified via TanStack Query docs)

**Why This Implementation is Production-Ready:**
- ✅ Follows official TanStack Query 2025 standards
- ✅ Handles edge cases (captive portals, airplane mode)
- ✅ Better than basic examples (checks both network states)
- ✅ Event-based detection (no polling, better battery life)
- ✅ Exponential backoff matches TanStack Query defaults exactly
- ✅ More resilient mutations than framework defaults
- ✅ Comprehensive error handling for both network and app errors

---

### Story 12.6: Demo API Protection (Optional)
**Status:** 🔴 NOT STARTED
**Priority:** MEDIUM
**Type:** Security & Infrastructure
**Dependencies:** Story 12.5
**Estimated Effort:** Small (2-3 hours)

**User Story:**
As the API owner, I want to protect the demo API from abuse so it remains available for portfolio viewers and doesn't incur unexpected Azure costs.

**Why Needed for 2025 Production:**
- **Rate Limiting:** Public APIs without rate limiting are targets for abuse
- **CORS Restriction:** `AllowAnyOrigin()` is a security vulnerability flagged by scanners
- **Cost Control:** Prevents demo API from being overwhelmed and incurring Azure overages
- **Professional Standard:** Shows understanding of production API protection

**Current Gaps:**
- No rate limiting middleware in backend
- CORS set to `AllowAnyOrigin()` (accepts requests from any domain)
- Public demo URL is unprotected

**Implementation Tasks:**
- [ ] Add AspNetCoreRateLimit NuGet package
- [ ] Configure in-memory rate limiting (100 req/min per IP)
- [ ] Add rate limiting middleware to pipeline
- [ ] Update appsettings.json with AllowedOrigins
- [ ] Restrict CORS to demo origin + localhost
- [ ] Add logging for rate limit violations
- [ ] Test rate limiting with rapid requests

**Files to Create:**
- None (uses AspNetCoreRateLimit library)

**Files to Modify:**
- `FoodBudgetAPI/FoodBudgetAPI.csproj` - Add AspNetCoreRateLimit package
- `FoodBudgetAPI/Utility/Setup/ServiceConfiguration.cs` - Register rate limiting services
- `FoodBudgetAPI/Utility/Setup/ApplicationConfiguration.cs:22` - Add middleware after logging
- `FoodBudgetAPI/appsettings.json` - Add AllowedOrigins configuration
- `FoodBudgetAPI/Utility/Setup/ServiceConfiguration.cs:86-89` - Restrict CORS origins

**Technical Notes:**
```csharp
// ServiceConfiguration.cs - Add rate limiting registration
services.AddInMemoryRateLimiting();
services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "*", Period = "1m", Limit = 100 }
    };
});

// ApplicationConfiguration.cs - Add middleware (after logging, line 22)
app.UseIpRateLimiting();

// appsettings.json - Add allowed origins
"AllowedOrigins": "https://cadil91.github.io,http://localhost:8081"

// ServiceConfiguration.cs - Restrict CORS (replace AllowAnyOrigin)
var allowedOrigins = builder.Configuration.GetValue<string>("AllowedOrigins")
    ?.Split(',') ?? Array.Empty<string>();

policy.WithOrigins(allowedOrigins)
    .AllowAnyMethod()
    .AllowAnyHeader();
```

**Acceptance Criteria:**
- [ ] Rate limiting enabled (100 requests/minute per IP)
- [ ] 429 Too Many Requests returned when limit exceeded
- [ ] Rate limit violations logged with IP address
- [ ] CORS restricted to GitHub Pages demo URL + localhost
- [ ] CORS preflight requests work correctly
- [ ] Demo app still functions with restricted CORS
- [ ] Rate limiting doesn't affect normal demo usage

**Why This is Optional for Sprint 3:**
- Not a demo blocker (nice-to-have)
- Quick security win before public launch
- Can be added after initial demo if time is tight

---

### Story 13: Material Design 3 Polish & Refinements
**Status:** 🔴 NOT STARTED
**Priority:** MEDIUM
**Type:** UI/UX Enhancement
**Dependencies:** Story 11
**Estimated Effort:** Small

**User Story:**
As a user, I want a polished, professional-looking interface with smooth animations and consistent Material Design 3 styling.

**Scope:**
- Refine MD3 styling throughout the app
- Add smooth transitions and animations
- Improve typography hierarchy
- Ensure consistent use of Surface/Card components
- Polish spacing, elevation, and shadows

**Tasks:**
- [ ] Refine MD3 styling (spacing, elevation, shadows)
- [ ] Add smooth transitions/animations between states
- [ ] Refine typography hierarchy (consistent heading/body text)
- [ ] Ensure consistent Surface/Card usage across screens
- [ ] Polish RecipeDetailScreen layout and spacing
- [ ] Polish RecipeListScreen cards and grid
- [ ] Add subtle animations for mode transitions (VIEW ↔ EDIT)
- [ ] Review and apply MD3 elevation system
- [ ] Ensure consistent color theming

**Areas to Polish:**
- RecipeDetailScreen (VIEW/EDIT/CREATE modes)
- RecipeListScreen (cards, grid, filters)
- RecipeForm (input fields, pickers)
- Navigation transitions
- Dialog animations
- Snackbar styling

**Acceptance Criteria:**
- [ ] Consistent MD3 styling across all screens
- [ ] Smooth animations between mode transitions
- [ ] Proper elevation and shadows applied
- [ ] Typography hierarchy is clear and consistent
- [ ] Spacing follows MD3 guidelines (8px grid)
- [ ] All Surface/Card components used correctly
- [ ] No visual regressions
- [ ] App feels polished and professional

---

## Sprint 4: User Management & Authentication (POST-DEMO)

Sprint 3 focuses on the recipe management demo. For complete authentication and user management implementation details, see:

**📄 [Sprint 4 Documentation](./sprint-4.md)**

Sprint 4 will include:
- Database schema for user management
- User registration and login API
- JWT authentication and security
- Frontend authentication integration
- User-scoped recipe data
- Password reset flow
- Email verification (optional)

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
- [x] View individual recipe details (Story 8) - COMPLETED ✅
- [ ] Edit existing recipes (Story 10)
- [x] Category and image support (Story 7) - COMPLETED
- [ ] Optimistic updates for snappy UX (Story 12)
- [x] API deployed and accessible
- [x] Web app deployed and accessible

### Post-Demo Enhancements (Sprint 4+)
- [ ] User authentication and management (See [Sprint 4](./sprint-4.md))
- [ ] Personal recipe collections with user isolation
- [ ] Profile management
- [ ] Meal planning features (Future)
- [ ] Shopping list integration (Future)

---

## Priority Order for Sprint 3 Completion

### 🔥 **Critical Path (Must Complete for Demo)**
1. **Story 8-11:** Unified RecipeDetail Screen (view/edit/create/delete modes) - ✅ COMPLETED (100% complete)
   - ✅ Story 8: VIEW mode - COMPLETED (39 tests passing)
   - ✅ Story 9: CREATE mode - COMPLETED (101 tests passing total)
   - ✅ Story 10: EDIT mode - COMPLETED (73 tests passing with TDD)
   - ✅ Story 11: Delete functionality - COMPLETED (110 tests passing with TDD)
   - ⏳ Story 11: MD3 Polish - PENDING
2. **Story 7:** Enhanced Recipe Form (category & image fields) - ✅ COMPLETED
3. **Story 12:** Optimistic Updates with TanStack Query - ✅ COMPLETED (12a & 12b)
   - ✅ Story 12a: Optimistic Delete - COMPLETED (23 tests passing)
   - ✅ Story 12b: Optimistic Update - COMPLETED (24 tests passing, full suite 580/580)
   - 🔴 Story 12c: Optimistic Create - NOT STARTED (Optional for demo)

### 📋 **Post-Demo (Sprint 4)**
See **[Sprint 4: User Management & Authentication](./sprint-4.md)** for complete implementation plan including:
1. Database schema for users
2. Backend authentication API
3. JWT security and tokens
4. Frontend authentication screens
5. User-scoped recipe data
6. Password reset flow

### 🔮 **Future Enhancements**

For post-Sprint 4 features and enhancements, see **[Product Backlog](./backlog.md)** which includes:
- **Sprint 5:** Observability & Performance (APM, pagination, PWA)
- **Sprint 6:** Infrastructure & Security (IaC, 2FA, load testing)
- **Sprint 7+:** User-facing features (categories, sharing, advanced recipes)

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

All technical debt and future feature work has been consolidated into **[Product Backlog](./backlog.md)**.

Sprint 3 technical debt items have been prioritized and categorized:
- **Critical for Demo:** Story 12.5 (Error Boundary & Offline Detection) - added to Sprint 3
- **Demo Protection:** Story 12.6 (Rate Limiting & CORS Restriction) - optional for Sprint 3
- **Future Sprints:** Observability, infrastructure, and advanced features documented in backlog.md

See backlog.md for complete roadmap of post-Sprint 4 enhancements including testing, DevOps, and feature work.