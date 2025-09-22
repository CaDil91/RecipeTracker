import { RecipeResponseDto } from '../lib/shared';
import { FilterType } from '../components/FilterChips';

// Extended recipe interface with category
export interface RecipeWithCategory extends RecipeResponseDto {
  category?: FilterType;
}

// Placeholder recipe data with proper RecipeResponseDto structure and categories
export const placeholderRecipes: RecipeWithCategory[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Pasta Carbonara',
    instructions: 'Cook pasta according to package directions. In a bowl, whisk eggs and cheese. Fry bacon until crispy. Mix hot pasta with egg mixture and bacon.',
    servings: 4,
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Dinner',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Chicken Curry',
    instructions: 'Sauté onions and garlic. Add curry paste and cook. Add chicken and simmer. Pour in coconut milk and cook until chicken is done.',
    servings: 6,
    createdAt: '2024-01-20T14:45:00Z',
    category: 'Dinner',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Caesar Salad',
    instructions: 'Chop romaine lettuce. Make dressing with lemon, garlic, and anchovies. Toss lettuce with dressing, add croutons and parmesan.',
    servings: 2,
    createdAt: '2024-02-01T09:15:00Z',
    category: 'Lunch',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Pancakes',
    instructions: 'Mix flour, milk, eggs, and baking powder. Cook on griddle until bubbles form. Flip and cook until golden.',
    servings: 4,
    createdAt: '2024-02-05T08:00:00Z',
    category: 'Breakfast',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Chocolate Cake',
    instructions: 'Mix dry ingredients. Combine wet ingredients. Fold together. Bake at 350°F for 30 minutes.',
    servings: 8,
    createdAt: '2024-02-10T15:00:00Z',
    category: 'Dessert',
  },
];