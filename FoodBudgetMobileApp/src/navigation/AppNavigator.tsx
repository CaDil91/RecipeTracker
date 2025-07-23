import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Recipe Tracker' }}
        />
        <Stack.Screen 
          name="RecipeList" 
          component={RecipeListScreen} 
          options={{ title: 'My Recipes' }}
        />
        <Stack.Screen 
          name="AddRecipe" 
          component={AddRecipeScreen} 
          options={{ title: 'Add New Recipe' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;