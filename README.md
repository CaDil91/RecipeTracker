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
- **C# ASP.NET Core** - RESTful API with Entity Framework Core
- **SQL Server** - Relational database with migrations
- **Azure App Service** - Cloud hosting with CI/CD
- **Swagger/OpenAPI** - Interactive API documentation
- **Repository Pattern** - Clean architecture principles

### DevOps & Testing
- **GitHub Actions** - Automated build and deployment pipelines
- **GitHub Pages** - Static web hosting
- **Jest** - Unit and integration testing
- **MSW** - Integration test mocking

## 🎯 Current Sprint Goal

**Sprint 3: Complete Vertical Slice - Recipe Management Demo**

Build a complete vertical slice demonstrating full CRUD functionality for recipe management with a unified interface for viewing, editing, and creating recipes. Deploy a working demo for portfolio presentation.

### Key User Stories

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

#### 🔄 Story 7: Enhanced Recipe Data Model (Category + Image)
**User Story:** As a developer, I need the recipe data model to support category and image fields so users can better organize and visualize their recipes.

**Features:** (Not Started)
- Category field with dropdown picker (Breakfast, Lunch, Dinner, Dessert)
- Image URL field (optional string)
- CategoryPicker component
- ImagePicker component (gallery selection, extensible for camera/URL)
- Updated DTOs, schemas, and validation

#### 🔄 Story 8: RecipeDetailScreen - VIEW Mode
**User Story:** As a user, I want to tap a recipe card and see all recipe details in a beautiful, read-only view.

**Features:** (Not Started)
- RecipeDetailScreen structure with mode state
- VIEW mode with Material Design 3 styling
- Navigation from RecipeListScreen
- Display all fields including category and image

#### 🔄 Story 9: RecipeDetailScreen - CREATE Mode
**User Story:** As a user, I want to create new recipes with all fields through an intuitive form.

**Features:** (Not Started)
- CREATE mode with empty form
- All fields editable (including category and image)
- Create mutation with TanStack Query
- Navigate from FAB

#### 🔄 Story 10: RecipeDetailScreen - EDIT Mode & Transitions
**User Story:** As a user, I want to edit existing recipes and have smooth transitions between viewing and editing.

**Features:** (Not Started)
- EDIT mode with pre-populated form
- Edit FAB in VIEW mode
- Update mutation with TanStack Query
- Smooth VIEW ↔ EDIT transitions

#### 🔄 Story 11: Delete Functionality & MD3 Polish
**User Story:** As a user, I want to delete recipes from the detail screen and have a polished, professional-looking interface.

**Features:** (Not Started)
- Delete button in header with confirmation
- Material Design 3 refinement
- Smooth animations
- Remove old AddRecipeScreen

#### 🔄 Story 12: Optimistic Updates
**User Story:** As a user, I want instant feedback when I create, update, or delete recipes so the app feels fast and responsive.

**Features:** (Not Started)
- Instant UI updates before API confirmation
- Automatic rollback on errors
- Background synchronization

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
