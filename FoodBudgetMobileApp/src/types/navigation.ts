import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Home: undefined;
    RecipeList: undefined;
    AddRecipe: undefined;
    RecipeDetail: {
        recipeId?: string; // undefined for CREATE mode, present for VIEW mode
    };
};

export type BottomTabParamList = {
    Home: undefined;
    MealPlan: undefined;
    Settings: undefined;
};

// Composite navigation type for screens that need to navigate between tabs
export type RecipeListScreenNavigationProp = CompositeNavigationProp<
    StackNavigationProp<RootStackParamList, 'RecipeList'>,
    BottomTabNavigationProp<BottomTabParamList>
>;

// Navigation and route types for RecipeDetailScreen
export type RecipeDetailScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'RecipeDetail'
>;

export type RecipeDetailScreenRouteProp = RouteProp<
    RootStackParamList,
    'RecipeDetail'
>;