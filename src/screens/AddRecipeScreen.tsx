// src/screens/AddRecipeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type AddRecipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AddRecipe'>;
};

const AddRecipeScreen: React.FC<AddRecipeScreenProps> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Recipe</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Recipe Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter recipe name"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter recipe description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ingredients</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter ingredients, one per line"
          multiline
          numberOfLines={6}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Instructions</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Enter cooking instructions"
          multiline
          numberOfLines={8}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // This is just a placeholder, it will just navigate back for now
            navigation.goBack();
          }}
        >
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
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