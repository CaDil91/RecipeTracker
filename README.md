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

**Sprint 4: User Management & Authentication** *(CURRENT)*

Add user authentication and data isolation to enable personal recipe collections. Users will be able to register accounts, log in securely, and manage their own private recipe collections.

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
