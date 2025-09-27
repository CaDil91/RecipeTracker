# MSW (Mock Service Worker) Setup

This directory contains Mock Service Worker configuration for development and testing without a real API backend.

## Quick Start

### Development with Mock Data

```bash
# Start with mock API responses
npm run start:mock

# Web development with mocks
npm run web:mock

# Mobile development with mocks
npm run android:mock
npm run ios:mock
```

### First-Time Web Setup

For web development, run once to set up the service worker:

```bash
npm run msw:init
```

## How It Works

- **MSW intercepts network requests** at the browser/Node.js level
- **No code changes needed** - your components still use `RecipeService.getAllRecipes()`
- **Real HTTP behavior** - proper status codes, headers, timing
- **Shared mock data** - uses existing `src/data/mockRecipes.ts`

## File Structure

```
src/mocks/
├── handlers/
│   └── recipes.ts      # API endpoint handlers
├── browser.ts          # Browser/web setup
├── server.ts           # Node.js/testing setup
├── index.ts            # Main exports
└── README.md           # This file
```

## API Endpoints Mocked

- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/recipes/search?title=...` - Search recipes
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## Mock Data

Uses enhanced recipe data from `src/data/mockRecipes.ts` with:
- ✅ Categories (Breakfast, Lunch, Dinner, Dessert)
- ✅ Servings information
- ✅ High-quality food images from Unsplash
- ✅ Realistic recipe instructions

## Development vs Production

- **Development**: Enable with `EXPO_PUBLIC_USE_MSW=true`
- **Production**: MSW automatically disabled
- **Testing**: Our existing unit tests already mock `RecipeService`

## Benefits

1. **No backend required** for frontend development
2. **Realistic API behavior** with proper error responses
3. **Network timing simulation** for realistic UX
4. **Easy data manipulation** for testing edge cases
5. **Works across platforms** (web, iOS, Android)