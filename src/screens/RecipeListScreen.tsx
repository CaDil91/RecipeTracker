// src/screens/RecipeListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type RecipeListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'RecipeList'>;
};

// Placeholder recipe data
const placeholderRecipes = [
  { id: '1', title: 'Pasta Carbonara' },
  { id: '2', title: 'Chicken Curry' },
  { id: '3', title: 'Caesar Salad' },
];

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>
      
      {placeholderRecipes.length > 0 ? (
        <FlatList
          data={placeholderRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No recipes found. Add your first recipe!</Text>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddRecipe')}
      >
        <Text style={styles.addButtonText}>+ Add Recipe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  recipeItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipeListScreen;