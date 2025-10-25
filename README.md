## Project Overview

FoodBudget is a full-stack recipe management application showcasing modern web and mobile development practices. Built with a C# ASP.NET Core API backend, Azure SQL database, and a cross-platform React Native frontend that runs on web and mobile devices.

## 🚀 Live Demo

**Try the app now:** [https://cadil91.github.io/RecipeTracker/](https://cadil91.github.io/RecipeTracker/)

The web demo is connected to a live Azure-hosted API with a SQL Server database. Browse recipes, add new ones, edit, and delete - all changes persist to the cloud database in real-time.

## 🛠️ Technology Stack

### Frontend
- **React Native** with **Expo** - Cross-platform mobile and web app
- **TypeScript** - Type-safe development
- **TanStack Query** - Powerful data synchronization and caching
- **React Navigation** - Native navigation patterns
- **Zod** - Runtime schema validation
- **Material Design 3** - Modern UI theming
- **MSW (Mock Service Worker)** - API mocking for offline development

### Backend
- **C# ASP.NET Core 8.0** - RESTful API with Entity Framework Core
- **SQL Server** - Relational database with migrations
- **Azure App Service** - Cloud hosting with CI/CD
- **AspNetCoreRateLimit** - Multi-tier IP-based rate limiting (60/min, 200/15min, 600/hr, 2000/12hr)
- **Swagger/OpenAPI** - Interactive API documentation
- **Repository Pattern** - Clean architecture principles
- **RFC 9457 Problem Details** - Standardized error responses

### DevOps & Testing
- **GitHub Actions** - Automated build and deployment pipelines
- **GitHub Pages** - Static web hosting
- **Jest** - Unit and integration testing
- **MSW** - Integration test mocking

## 🎯 Current Sprint Goal

**Sprint 3: Complete Vertical Slice - Recipe Management Demo**

Build a complete vertical slice demonstrating full CRUD functionality for recipe management with a unified interface for viewing, editing, and creating recipes. Deploy a working demo for portfolio presentation.

📖 **Full Sprint Documentation:** [`docs/Sprint-3.md`](./docs/sprint-3.md) - Complete user stories, technical details, and acceptance criteria

### Key User Stories (Summary)

#### ✅ Story 4: Recipe List Integration
**User Story:** As a user, I want to see my actual recipes from the database when I open the app.

**Features:**
- Real-time data fetching with TanStack Query
- Search and category filtering
- Pull-to-refresh functionality
- Responsive grid layout

#### ✅ Story 5: Create Recipe Integration
**User Story:** As a user, I want my new recipes saved to the database when I create them.

**Features:**
- Form validation with Zod schemas
- API integration with error handling
- Success/failure feedback
- Automatic navigation after creation

#### ✅ Story 6: Delete Recipe Integration
**User Story:** As a user, I want recipes permanently deleted from the database when I delete them.

**Features:**
- Confirmation dialog before deletion
- Optimistic UI updates
- Query invalidation and cache management
- User feedback via snackbar
- Proper async Promise handling

#### ✅ Quality Improvements: Error Handling & Type Safety
**Improvements:** Enhance user experience and code reliability across the application.

**Features:** (Completed October 2025)
- Comprehensive error state UI in RecipeListScreen
  - User-friendly error messages
  - Retry button for failed API requests
  - Consistent error handling patterns
- Enhanced TypeScript type safety
  - Fixed navigation prop types in test utilities
  - Eliminated compiler warnings
- Improved debugging capabilities
  - Console logging for unexpected errors
  - Better developer experience
- Proper Promise handling in TanStack Query mutations
  - Prevents race conditions
  - Ensures cache consistency

#### ✅ Story 7: Enhanced Recipe Data Model (Category + Image)
**User Story:** As a developer, I need the recipe data model to support category and image fields so users can better organize and visualize their recipes.

**Features:** (Completed October 13, 2025)
- Category field with dropdown picker (Breakfast, Lunch, Dinner, Dessert) - 19 tests passing
- Image URL field with gallery selection and preview - 19 tests passing
- CategoryPicker component with extensible architecture for Sprint 4
- ImagePicker component (gallery selection via expo-image-picker)
- Updated DTOs, schemas, and validation (category nullable/optional per backend API)
- RecipeForm integration with both pickers - 31 tests passing
- **Total: 69 tests passing across all components**

#### ✅ Story 8: RecipeDetailScreen - VIEW Mode
**User Story:** As a user, I want to tap a recipe card and see all recipe details in a beautiful, read-only view.

**Features:** (Completed October 15, 2025)
- RecipeDetailScreen structure with mode state (view/edit/create)
- VIEW mode with Material Design 3 styling (read-only display)
- TanStack Query integration for data fetching by ID
- Navigation from RecipeListScreen (tap recipe card)
- Display all fields including category and image
- Loading and error states with accessibility support
- Scrollable content with responsive layout
- Back navigation with IconButton
- **Unit Tests: 26/26 passing**
- **Integration Tests: 13/13 passing**
- **Total: 39 tests passing with comprehensive coverage**

#### ✅ Story 9: RecipeDetailScreen - CREATE Mode
**User Story:** As a user, I want to create new recipes with all fields through an intuitive form.

**Features:**
- CREATE mode with empty form (no recipeId in route params)
- All fields editable (including category picker and image picker)
- Create mutation with TanStack Query
- Navigate from FAB in RecipeListScreen
- Success shows Snackbar and navigates to VIEW mode with new recipe
- Error handling with user feedback
- Form validation with progressive error display
- **Unit Tests: 51/51 passing**
- **Integration Tests: 19/19 passing**
- **Total: 101 tests passing** (70 comprehensive tests with 2025 RTL patterns)

#### ✅ Story 10: RecipeDetailScreen - EDIT Mode & Transitions
**User Story:** As a user, I want to edit existing recipes and have smooth transitions between viewing and editing.

**Features:**
- EDIT mode with pre-populated form from existing recipe data
- Edit FAB in VIEW mode for easy mode transition
- Update mutation with TanStack Query and cache invalidation
- Smooth VIEW ↔ EDIT transitions using local state
- Cancel button with confirmation dialog (only if form has changes)
- Back button mode-aware behavior (returns to VIEW mode in EDIT)
- **2025 Best Practices:** `forwardRef` + `useImperativeHandle` for form state access
- Dirty tracking prevents accidental data loss
- Success returns to VIEW mode with Snackbar feedback
- Error handling keeps form editable with Snackbar
- **All 73 tests passing** with TDD approach (Red → Green → Refactor)

#### ✅ Story 11: Delete Functionality
**User Story:** As a user, I want to delete recipes from the detail screen with a confirmation prompt.

**Features:** (Completed)
- ✅ Delete button in header (VIEW and EDIT modes, excluded from CREATE)
- ✅ Confirmation dialog before deletion ("Delete Recipe? Are you sure...")
- ✅ DELETE mutation with TanStack Query
- ✅ Success: navigate back to list with "Recipe deleted successfully!" snackbar
- ✅ Error: stay on screen with error snackbar
- ✅ Cache invalidation on successful deletion
- ✅ Comprehensive error handling (API 500/404, network failures)
- ✅ Old AddRecipeScreen removed (completed in Story 9)
- **Unit Tests: 85/85 passing** (13 new delete tests)
- **Integration Tests: 25/25 passing** (3 new delete tests)
- **Total: 110 tests passing** with full TDD approach (Red → Green → Refactor)

#### ✅ Story 12a, 12b & 12c: Optimistic Updates (Delete, Update & Create)
**User Story:** As a user, I want instant feedback when I create, update, or delete recipes so the app feels fast and responsive.

**Features:** (Completed - All Three Stories)
- ✅ **Story 12a - Optimistic Delete**: Recipes disappear instantly with automatic rollback on error
  - Instant cache removal from all locations
  - Manual rollback + background refetch on error for consistency
  - Query cancellation to prevent race conditions
  - **Hook Tests: 11/11 passing**
  - **Integration Tests: 12/12 passing**
  - **Total: 23 tests passing**
- ✅ **Story 12b - Optimistic Update**: Recipe edits appear instantly in both list and detail views
  - Multi-cache optimistic updates (list + detail + all categories)
  - Server response replaces optimistic data on success
  - Automatic rollback in all caches on error
  - Manual retry by staying in EDIT mode after error
  - **Hook Tests: 13/13 passing (useUpdateRecipe)**
  - **Unit Tests: 5/5 new Story 12b tests**
  - **Integration Tests: 6/6 new Story 12b tests**
  - **Total: 24 tests passing, Full test suite: 580/580 passing**
- ✅ **Story 12c - Optimistic Create**: New recipes appear instantly with temp UUID while saving
  - Temp UUID generation using expo-crypto (`temp-${uuid}` pattern)
  - Instant optimistic UI updates (recipe appears at top of list <50ms)
  - Navigation blocking until real ID received (prevents broken states)
  - Loading indicator on temp recipe cards (visual feedback)
  - Atomic temp ID → real ID replacement on success
  - Automatic rollback on error with retry support
  - **Scalable Refactoring:** Removed hardcoded categories for custom category support (Sprint 4 ready)
  - **Hook Tests: 11/11 passing (useCreateRecipe)**
  - **Unit Tests: 11/11 passing (CREATE mode integration)**
  - **Integration Tests: 11/11 passing (temp ID lifecycle)**
  - **Total: 33 tests passing, Full test suite: 613/613 passing**
  - **2025 Production Standards:** TanStack Query v5, expo-crypto, cache manipulation, server authority

#### ✅ Story 12.5: Error Boundary & Offline Detection
**User Story:** As a user, I want the app to handle errors gracefully and inform me when I'm offline, so I don't see blank screens or confusing error messages.

**Features:** (Completed - Production-Ready)
- ✅ **TanStack Query OnlineManager** - Modern event-based offline detection (no polling, better battery life)
  - NetInfo integration checks BOTH `isConnected` AND `isInternetReachable` (handles captive portals)
  - Event-based detection (no polling overhead)
  - Automatic query/mutation pause when offline
- ✅ **ErrorBoundary Component** - Catches React component errors (no white screens)
  - getDerivedStateFromError for error state management
  - "Try Again" button to reset and re-render
- ✅ **ErrorFallbackScreen** - User-friendly error UI with reset button
  - Development mode shows detailed error information
  - Production mode shows simple user-friendly message
- ✅ **OfflineBanner** - Visual feedback when user is offline
  - Appears at top of screen when device is offline
  - Handles airplane mode, WiFi without internet, cellular failures
- ✅ **Improved Mutation Resilience**
  - Increased retry count from 1 to 2 (more resilient than TanStack Query defaults)
  - Exponential backoff: `Math.min(1000 * 2 ** attemptIndex, 30000)` (matches TanStack Query defaults exactly)
  - Queries: 2 retries, Mutations: 2 retries
- ✅ **2025 Standards Applied:**
  - OnlineManager with NetInfo (official TanStack Query pattern)
  - Network mode: 'online' (queries/mutations pause when offline)
  - RefetchOnReconnect: 'always' (fresh data after reconnecting)
  - Better than basic examples (checks both network states for edge cases)
- ✅ **ErrorBoundary Tests: 8/8 passing**
- ✅ **OfflineBanner Unit Tests: 4/4 passing**
- ✅ **OfflineBanner Integration Tests: 3/3 passing**
- ✅ **ErrorFallbackScreen Tests: 8/8 passing**
- ✅ **Full Test Suite: 635/635 tests passing**

**Why This is Production-Ready:**
- Follows official TanStack Query 2025 standards (verified via docs)
- Handles edge cases: captive portals, airplane mode, WiFi-but-no-internet
- Event-based detection (no polling, better battery life)
- More resilient mutations than framework defaults (2 vs 0 retries)
- Exponential backoff matches industry standards
- Comprehensive error handling for both network and app errors

#### ✅ Story 12.6: API Rate Limiting (Partial)
**User Story:** As the API owner, I want to protect the demo API from abuse so it remains available for portfolio viewers.

**Features:** (Completed - Rate Limiting Only)
- ✅ **Multi-Tier IP-Based Rate Limiting** - AspNetCoreRateLimit 5.0.0
  - 60 requests per minute (prevents burst attacks)
  - 200 requests per 15 minutes
  - 600 requests per hour
  - 2,000 requests per 12 hours (prevents sustained abuse)
  - Returns 429 Too Many Requests when limits exceeded
- ✅ **Health Endpoint Whitelisted** - `/health` excluded from rate limiting
- ✅ **Automatic Logging** - Rate limit violations logged with IP address
- ✅ **Production-Grade Protection** - Multi-tier strategy better than single-limit approach
- ⚠️ **CORS Not Restricted** - Still uses `AllowAnyOrigin()` (security risk, needs to be addressed)

**Why Multi-Tier is Better:**
- Prevents both burst attacks (60/min) and sustained abuse (2000/12hr)
- More sophisticated than single-tier limiting
- Allows normal users to burst occasionally without hitting limits
- Production-grade protection against various attack patterns

**Security Note:**
- CORS restriction deferred to avoid breaking demo during development
- Must be restricted to `https://cadil91.github.io` + `localhost` before production release

#### 🔄 Story 13: Material Design 3 Polish
**User Story:** As a user, I want a polished, professional-looking interface with smooth animations.

**Features:** (Not Started - Optional for Demo)
- MD3 styling refinements (spacing, elevation, shadows)
- Smooth transitions and animations
- Typography hierarchy improvements

---

## 🚀 Next Sprint: User Management & Authentication

**Sprint 4** will add user authentication and data isolation. See [`docs/sprint-4.md`](./docs/sprint-4.md) for details:
- User registration and login
- JWT authentication with refresh tokens
- User-scoped recipe data
- Password reset flow
- Email verification (optional)

## Architecture

### Application Flow
1. **server.ts**: Entry point - validates environment, configures logger, starts Express
2. **app.ts**: Configures middleware stack, routes, and error handling
3. **config/environment.ts**: Zod-validated environment variables with type safety

### Middleware Stack (Order Critical)
1. **helmet**: Security headers
2. **cors**: Cross-origin handling (before routes)
3. **morgan**: HTTP request logging (logs to Winston)
4. **compression**: Response compression
5. **body-parser**: JSON/URL-encoded parsing (10mb limit)
6. **swagger-ui**: API documentation at `/api-docs`
7. **routes**: Application routes
8. **error handler**: Global error middleware (must be last)

### Routing Structure
- `/health/*` - Health check endpoints (unversioned)
- `/api/v1/*` - Versioned API endpoints
  - `/api/v1/recipe` - Recipe resource endpoints
- API documentation: `/api-docs`

### Required Environment Variables
- `NODE_ENV`: development | production | test
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `LOG_LEVEL`: error | warn | info | debug (default: info)
- `CORS_ORIGIN`: Comma-separated allowed origins (optional)

### Testing Strategy
- **Framework**: Jest with ts-jest
- **Test Files**: `*.test.ts` files co-located with source
- **Coverage**: Excludes node_modules, dist, config files
- **Setup**: `jest.setup.ts` for test environment configuration

### TypeScript Configuration
- **Target**: ES2020 with CommonJS modules
- **Root**: `./` compiles to `./dist`
- **Strict Mode**: Enabled with all checks
- **Features**: Source maps, declarations, JSON imports

## Project Context

This TypeScript API is a learning project that mirrors the functionality of:
- **C# ASP.NET API** (`../FoodBudgetAPI/`): The original implementation with Entity Framework, migrations, repository pattern
- **React Native App** (`../FoodBudgetMobileApp/`): Mobile client that can connect to either API

Both APIs implement the same FoodBudget functionality. This TypeScript version serves as a practical learning environment for TypeScript, Node.js, and Express patterns.
