import { RecipeResponseDto } from '../lib/shared';
import { FilterType } from '../components/FilterChips';

// Extended recipe interface with category and image
export interface RecipeWithCategory extends RecipeResponseDto {
  category?: FilterType;
  imageUrl?: string;
}

// Placeholder recipe data with proper RecipeResponseDto structure, categories, and images
export const placeholderRecipes: RecipeWithCategory[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Pasta Carbonara',
    instructions: 'Cook pasta according to package directions. In a bowl, whisk eggs and cheese. Fry bacon until crispy. Mix hot pasta with egg mixture and bacon.',
    servings: 4,
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=500&fit=crop',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Chicken Curry',
    instructions: 'Sauté onions and garlic. Add curry paste and cook. Add chicken and simmer. Pour in coconut milk and cook until chicken is done.',
    servings: 6,
    createdAt: '2024-01-20T14:45:00Z',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=500&fit=crop',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Caesar Salad',
    instructions: 'Chop romaine lettuce. Make dressing with lemon, garlic, and anchovies. Toss lettuce with dressing, add croutons and parmesan.',
    servings: 2,
    createdAt: '2024-02-01T09:15:00Z',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=500&fit=crop',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Pancakes',
    instructions: 'Mix flour, milk, eggs, and baking powder. Cook on griddle until bubbles form. Flip and cook until golden.',
    servings: 4,
    createdAt: '2024-02-05T08:00:00Z',
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=500&fit=crop',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Chocolate Cake',
    instructions: 'Mix dry ingredients. Combine wet ingredients. Fold together. Bake at 350°F for 30 minutes.',
    servings: 8,
    createdAt: '2024-02-10T15:00:00Z',
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=500&fit=crop',
  },
];