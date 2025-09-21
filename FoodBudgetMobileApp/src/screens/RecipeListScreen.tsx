// src/screens/RecipeListScreen.tsx
import React, { useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';
import { RootStackParamList } from '../types/navigation';
import { Container, RecipeList } from '../components/shared';
import { RecipeResponseDto } from '../lib/shared/types/dto';

type RecipeListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'RecipeList'>;
};

// Placeholder recipe data with proper RecipeResponseDto structure
const placeholderRecipes: RecipeResponseDto[] = [
  { 
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Pasta Carbonara',
    instructions: 'Cook pasta according to package directions. In a bowl, whisk eggs and cheese. Fry bacon until crispy. Mix hot pasta with egg mixture and bacon.',
    servings: 4,
    createdAt: '2024-01-15T10:30:00Z',
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Chicken Curry',
    instructions: 'Sauté onions and garlic. Add curry paste and cook. Add chicken and simmer. Pour in coconut milk and cook until chicken is done.',
    servings: 6,
    createdAt: '2024-01-20T14:45:00Z',
  },
  { 
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Caesar Salad',
    instructions: 'Chop romaine lettuce. Make dressing with lemon, garlic, and anchovies. Toss lettuce with dressing, add croutons and parmesan.',
    servings: 2,
    createdAt: '2024-02-01T09:15:00Z',
  },
];

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<RecipeResponseDto[]>(placeholderRecipes);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRecipePress = (recipe: RecipeResponseDto) => {
    console.log('View recipe:', recipe);
    // TODO: Navigate to recipe detail screen
  };

  const handleRecipeEdit = (recipe: RecipeResponseDto) => {
    console.log('Edit recipe:', recipe);
    // TODO: Navigate to edit screen with recipe data
    navigation.navigate('AddRecipe');
  };

  const handleRecipeDelete = (recipe: RecipeResponseDto) => {
    console.log('Delete recipe:', recipe);
    // TODO: Implement delete confirmation and API call
    setRecipes(prev => prev.filter(r => r.id !== recipe.id));
  };

  const handleAddRecipe = () => {
    navigation.navigate('AddRecipe');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Fetch recipes from API
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="My Recipes" />
      </Appbar.Header>
      
      <Container padded={false} useSafeArea={false}>
        <RecipeList
          recipes={recipes}
          onRecipePress={handleRecipePress}
          onRecipeEdit={handleRecipeEdit}
          onRecipeDelete={handleRecipeDelete}
          onAddRecipe={handleAddRecipe}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          emptyTitle="No recipes yet"
          emptyMessage="Start by adding your first recipe!"
        />
      </Container>
    </>
  );
};

export default RecipeListScreen;