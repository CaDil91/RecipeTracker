import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Icon } from 'react-native-paper';
 import { RootStackParamList, BottomTabParamList } from '../types/navigation';

// Import screens
import RecipeListScreen from '../screens/RecipeListScreen';
import AddRecipeScreen from '../screens/AddRecipeScreen';

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Placeholder screens for tabs
import { View, Text, StyleSheet } from 'react-native';

const MealPlanScreen = () => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Meal Plan</Text>
      <Text style={styles.placeholderText}>Coming Soon</Text>
    </View>
  );
};

const ProfileScreen = () => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Profile</Text>
      <Text style={styles.placeholderText}>Coming Soon</Text>
    </View>
  );
};

// Home Stack Navigator (for nested navigation within the Home tab)
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll handle headers inside screens
      }}
    >
      <Stack.Screen
        name="RecipeList"
        component={RecipeListScreen}
      />
      {/* Recipe detail and other home-related screens will go here */}
    </Stack.Navigator>
  );
};

// Add Recipe Stack (for add flow)
const AddStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
      />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator
const BottomTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'home';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Add':
              iconName = 'plus-circle';
              break;
            case 'MealPlan':
              iconName = 'calendar';
              break;
            case 'Profile':
              iconName = 'account';
              break;
          }

          return <Icon source={iconName} size={focused ? 28 : 24} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: false, // Keep nav bar visible
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Recipes',
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddStack}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused }) => (
            <Icon
              source="plus-circle"
              size={32}
              color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{
          tabBarLabel: 'Meal Plan',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AppNavigator;