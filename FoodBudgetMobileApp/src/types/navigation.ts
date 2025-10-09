import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
    Home: undefined;
    RecipeList: undefined;
    AddRecipe: undefined;
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