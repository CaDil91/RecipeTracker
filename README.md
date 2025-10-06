## Project Overview

FoodBudget is a recipe tracking application with a C# ASP.NET API backend and a React Native mobile app. This project includes both a production C# API and a TypeScript Node.js API learning implementation.

## 🚀 Live Demo

**Try the app now:** [https://cadil91.github.io/RecipeTracker/](https://cadil91.github.io/RecipeTracker/)

The web demo runs with mock data - no backend required. Browse recipes, add new ones, and explore the full functionality directly in your browser.

## Development Commands

### Setup & Run
```bash
npm install          # Install dependencies
npm run dev         # Start development server with hot reload (nodemon + ts-node)
npm run build       # Compile TypeScript to JavaScript
npm start           # Run compiled production server
```

### Testing
```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run test:verbose   # Run tests with detailed output
```

### Code Quality
```bash
npm run lint        # Check ESLint issues
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format code with Prettier
npm run format:check  # Check Prettier formatting
npm run typecheck   # Type-check without compiling
npm run code:check  # Run all checks (typecheck + lint + format:check)
npm run code:fix    # Fix all auto-fixable issues
```

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
