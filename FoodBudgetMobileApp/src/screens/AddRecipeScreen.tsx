import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AddRecipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AddRecipe'>;
};

const AddRecipeScreen: React.FC<AddRecipeScreenProps> = ({ navigation }) => {
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSave = () => {
    // Now you can access all the form values from state
    const newRecipe = {
      name: recipeName,
      description,
      ingredients,
      instructions,
    };
    
    // You could save this to a database, Redux store, etc.
    console.log('Saving recipe:', newRecipe);
    
    // Then navigate back or to another screen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} testID="add-recipe-screen">
      <Text style={styles.title} testID="screen-title">Add New Recipe</Text>
      
      <View style={styles.formGroup} testID="recipe-name-container">
        <Text style={styles.label} testID="recipe-name-label">Recipe Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter recipe name"
          value={recipeName}
          onChangeText={setRecipeName}
          testID="recipe-name-input"
        />
      </View>
      
      <View style={styles.formGroup} testID="recipe-description-container">
        <Text style={styles.label} testID="recipe-description-label">Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter recipe description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          testID="recipe-description-input"
        />
      </View>
      
      <View style={styles.formGroup} testID="recipe-ingredients-container">
        <Text style={styles.label} testID="recipe-ingredients-label">Ingredients</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter ingredients, one per line"
          value={ingredients}
          onChangeText={setIngredients}
          multiline
          numberOfLines={6}
          testID="recipe-ingredients-input"
        />
      </View>
      
      <View style={styles.formGroup} testID="recipe-instructions-container">
        <Text style={styles.label} testID="recipe-instructions-label">Instructions</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter cooking instructions"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={8}
          testID="recipe-instructions-input"
        />
      </View>
      
      <View style={styles.buttonContainer} testID="button-container">
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          testID="save-recipe-button"
        >
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddRecipeScreen;