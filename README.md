## Project Overview

FoodBudget is a full-stack recipe management application showcasing modern web and mobile development practices. Built with a C# ASP.NET Core API backend, Azure SQL database, and a cross-platform React Native frontend that runs on web and mobile devices.

## 🚀 Live Demo

**Repo Demo:** [https://cadil91.github.io/RecipeTracker/](https://cadil91.github.io/RecipeTracker/)

The web demo is connected to a live Azure-hosted API with a SQL Server database. Browse recipes, add new ones, edit, and delete - all changes persist to the cloud database in real-time.

**Active Development:** Active development continues in a private repository. View the latest version at [https://cadil91.github.io/FoodBudgetAI/](https://cadil91.github.io/FoodBudgetAI/)

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

**Sprint 6: TBD** *(Planning Phase)*

Future enhancements and features to be planned based on Sprint 5 learnings and user feedback.

---

## ✅ Sprint 5: User Authentication - Web & Mobile Integration *(COMPLETED)*

**Goal:** Enable users to sign up, sign in, and securely access the protected backend API with user-scoped data isolation and mobile image upload capabilities.

**Status:** ✅ All stories completed (November 2025)

**What Was Delivered:**
- ✅ Story 5.1: Email/password user flow configured in Microsoft Entra External ID
- ✅ Story 5.2: MSAL authentication integrated in web app with protected routes
- ✅ Story 5.3: Web app connected to protected API with automatic token injection
- ✅ Story 5.4: User-scoped recipe data enforcement (database + authorization)
- ✅ Story 5.5: User Delegation SAS tokens for enhanced image upload security
- ✅ Story 5.6: Mobile recipe image upload with optimistic UI updates (131/131 tests passing)

**Key Features:**
- Email + password authentication via Microsoft Entra External ID
- Browser-based OAuth 2.0 flow with PKCE (automatic via MSAL)
- Session-scoped token storage (cleared on tab close)
- Automatic token refresh and 401 re-authentication
- User-specific recipe isolation with ownership validation
- Azure Blob Storage integration with User Delegation SAS
- Mobile image upload with automatic compression (1920x1920 max, 0.8 quality)
- Sequential upload-then-save flow with optimistic UI updates
- Comprehensive error handling with retry capability

📖 **Full Sprint Documentation:** [`docs/sprint-5.md`](./docs/sprint-5.md) - Complete user stories, technical details, and acceptance criteria

---

## ✅ Sprint 4: Backend API Authentication *(COMPLETED)*

**Goal:** Secure the FoodBudget backend API to require and validate JWT access tokens from Microsoft Entra External ID. This sprint establishes the authentication infrastructure needed for user-specific data isolation in Sprint 5.

**Status:** ✅ All must-have stories completed (November 2025)

**What Was Delivered:**
- ✅ Story 4.1: Microsoft Entra External ID tenant created and configured
- ✅ Story 4.2: Web app (SPA) registration for testing and web demo integration
- ✅ Story 4.3: Backend JWT validation with Microsoft.Identity.Web v4.0.1
  - Protected RecipeController with `[Authorize]` attribute
  - JWT token validation configured (audience, issuer, scopes)
  - User ID extraction from `oid` claim via ClaimsPrincipalExtensions
  - 401 Unauthorized responses for unauthenticated requests
  - Integration tests for authentication middleware
- ⏭️ Story 4.4: API protection testing **DEFERRED TO SPRINT 5** (will occur during MSAL integration)

📖 **Full Sprint Documentation:** [`docs/sprint-4.md`](./docs/sprint-4.md) - Complete user stories, technical details, and acceptance criteria

---

## ✅ Sprint 3: Complete Vertical Slice - Recipe Management Demo *(COMPLETED)*

**Goal:** Build a complete vertical slice demonstrating full CRUD functionality for recipe management with a unified interface for viewing, editing, and creating recipes. Deploy a working demo for portfolio presentation.

**Status:** ✅ All stories completed (October 2025)

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
**User Story:** As a user, I want clear error messages and the ability to retry when something goes wrong.

**Features:**
- User-friendly error messages with retry buttons
- Consistent error handling across the app
- TypeScript type safety improvements

#### ✅ Story 7: Enhanced Recipe Data Model
**User Story:** As a user, I want to add categories and images to my recipes for better organization.

**Features:**
- Category dropdown picker (Breakfast, Lunch, Dinner, etc.)
- Image selection from photo gallery
- Image preview and management

#### ✅ Story 8: Recipe Detail - VIEW Mode
**User Story:** As a user, I want to tap a recipe card and see all recipe details in a beautiful, read-only view.

**Features:**
- Full recipe display with all fields
- Material Design 3 styling
- Loading and error states
- Back navigation

#### ✅ Story 9: Recipe Detail - CREATE Mode
**User Story:** As a user, I want to create new recipes with all fields through an intuitive form.

**Features:**
- Empty form with all fields editable
- Form validation
- Success feedback and navigation
- Error handling

#### ✅ Story 10: Recipe Detail - EDIT Mode
**User Story:** As a user, I want to edit existing recipes and have smooth transitions between viewing and editing.

**Features:**
- Pre-populated form with existing data
- Smooth VIEW ↔ EDIT mode transitions
- Cancel with unsaved changes confirmation
- Success and error feedback

#### ✅ Story 11: Delete Functionality
**User Story:** As a user, I want to delete recipes from the detail screen with a confirmation prompt.

**Features:**
- Delete button in header
- Confirmation dialog before deletion
- Success feedback and navigation
- Error handling

#### ✅ Story 12: Optimistic Updates
**User Story:** As a user, I want instant feedback when I create, update, or delete recipes so the app feels fast and responsive.

**Features:**
- Instant UI updates for create, update, and delete operations
- Automatic rollback on errors
- Smooth UX with no loading delays
- Server reconciliation on success

#### ✅ Story 12.5: Error Boundary & Offline Detection
**User Story:** As a user, I want the app to handle errors gracefully and inform me when I'm offline.

**Features:**
- Error boundary catches app crashes
- Offline banner shows network status
- Automatic retry with exponential backoff
- User-friendly error messages

#### ✅ Story 12.6: API Rate Limiting
**User Story:** As the API owner, I want to protect the demo API from abuse.

**Features:**
- Multi-tier IP-based rate limiting
- Prevents burst and sustained attacks
- Health endpoint whitelisted
- Automatic logging of violations

#### ✅ Story 13: Material Design 3 Polish
**User Story:** As a user, I want a polished, professional-looking interface with smooth animations.

**Features:**
- Co-located component architecture
- Bounce animations for EDIT mode
- Comprehensive accessibility support (WCAG)
- Full dark mode support
- Custom hooks for reusable patterns

---

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
