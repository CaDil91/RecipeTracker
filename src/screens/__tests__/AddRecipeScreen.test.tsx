import React from 'react';
import { render, fireEvent, RenderAPI } from '@testing-library/react-native';
import AddRecipeScreen from '../AddRecipeScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

// Define the type for your mock navigation object
type MockNavigation = Partial<StackNavigationProp<RootStackParamList, 'AddRecipe'>>;

// Define test data to use across multiple tests
const testRecipeData = {
  name: 'Pasta Carbonara',
  description: 'A classic Italian pasta dish',
  ingredients: 'Pasta\nEggs\nBacon\nCheese',
  instructions: '1. Cook pasta\n2. Mix eggs and cheese\n3. Combine all ingredients'
};

describe('AddRecipeScreen', () => {
  // Set up test utilities
  let mockNavigationProp: MockNavigation;
  let screen: RenderAPI;
  
  // Helper function to render the component before each test
  const setupComponent = () => {
    const element = React.createElement(AddRecipeScreen, { 
      navigation: mockNavigationProp as StackNavigationProp<RootStackParamList, 'AddRecipe'> 
    });
    
    screen = render(element);
    return screen;
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    mockNavigationProp = {
      navigate: jest.fn(),
      goBack: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('renders correctly with all form elements', () => {
    const { getByText, getByPlaceholderText } = setupComponent();

    // Check for the screen title
    expect(getByText('Add New Recipe')).toBeTruthy();

    // Check for form labels
    expect(getByText('Recipe Name')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
    expect(getByText('Ingredients')).toBeTruthy();
    expect(getByText('Instructions')).toBeTruthy();

    // Check for input fields
    expect(getByPlaceholderText('Enter recipe name')).toBeTruthy();
    expect(getByPlaceholderText('Enter recipe description')).toBeTruthy();
    expect(getByPlaceholderText('Enter ingredients, one per line')).toBeTruthy();
    expect(getByPlaceholderText('Enter cooking instructions')).toBeTruthy();

    // Check for buttons
    expect(getByText('Save Recipe')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('navigates back when Cancel button is pressed', () => {
    const { getByTestId } = setupComponent();
    
    // Press the Cancel button
    fireEvent.press(getByTestId('cancel-button'));
    
    // Check that navigation.goBack was called
    expect(mockNavigationProp.goBack).toHaveBeenCalledTimes(1);
  });

  it('navigates back when Save Recipe button is pressed', () => {
    const { getByTestId } = setupComponent();
    
    // Press the Save Recipe button
    fireEvent.press(getByTestId('save-recipe-button'));
    
    // Check that navigation.goBack was called
    expect(mockNavigationProp.goBack).toHaveBeenCalledTimes(1);
  });

  it('updates state when entering text in input fields', () => {
    const { getByTestId } = setupComponent();
    
    // Get input fields by testID
    const nameInput = getByTestId('recipe-name-input');
    const descriptionInput = getByTestId('recipe-description-input');
    const ingredientsInput = getByTestId('recipe-ingredients-input');
    const instructionsInput = getByTestId('recipe-instructions-input');
    
    // Type text in the input fields
    fireEvent.changeText(nameInput, testRecipeData.name);
    fireEvent.changeText(descriptionInput, testRecipeData.description);
    fireEvent.changeText(ingredientsInput, testRecipeData.ingredients);
    fireEvent.changeText(instructionsInput, testRecipeData.instructions);
    
    // Verify the text was entered
    expect(nameInput.props.value).toBe(testRecipeData.name);
    expect(descriptionInput.props.value).toBe(testRecipeData.description);
    expect(ingredientsInput.props.value).toBe(testRecipeData.ingredients);
    expect(instructionsInput.props.value).toBe(testRecipeData.instructions);
  });
  
  it('handles the full recipe submission flow', () => {
    const { getByTestId } = setupComponent();
    
    // Get all input fields
    const nameInput = getByTestId('recipe-name-input');
    const descriptionInput = getByTestId('recipe-description-input');
    const ingredientsInput = getByTestId('recipe-ingredients-input');
    const instructionsInput = getByTestId('recipe-instructions-input');
    
    // Fill out the form
    fireEvent.changeText(nameInput, testRecipeData.name);
    fireEvent.changeText(descriptionInput, testRecipeData.description);
    fireEvent.changeText(ingredientsInput, testRecipeData.ingredients);
    fireEvent.changeText(instructionsInput, testRecipeData.instructions);
    
    // Submit the form
    fireEvent.press(getByTestId('save-recipe-button'));
    
    // Verify navigation occurs
    expect(mockNavigationProp.goBack).toHaveBeenCalledTimes(1);
    
    // In a real app, you might also verify that data was saved to your state management system
  });
});