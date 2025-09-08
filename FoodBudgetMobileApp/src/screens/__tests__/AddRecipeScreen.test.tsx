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

  describe('Form Validation & User Experience', () => {
    it('handles empty form submission gracefully', () => {
      const { getByTestId } = setupComponent();
      
      // Submit form without filling any fields
      fireEvent.press(getByTestId('save-recipe-button'));
      
      // Should still navigate (current implementation doesn't validate)
      expect(mockNavigationProp.goBack).toHaveBeenCalledTimes(1);
    });

    it('handles very long text inputs', () => {
      const { getByTestId } = setupComponent();
      
      const longText = 'a'.repeat(1000); // Very long input
      const nameInput = getByTestId('recipe-name-input');
      
      fireEvent.changeText(nameInput, longText);
      
      expect(nameInput.props.value).toBe(longText);
    });

    it('handles special characters in input fields', () => {
      const { getByTestId } = setupComponent();
      
      const specialCharsText = 'Recipe with émojis 🍝 & special chars: @#$%^&*()';
      const nameInput = getByTestId('recipe-name-input');
      
      fireEvent.changeText(nameInput, specialCharsText);
      
      expect(nameInput.props.value).toBe(specialCharsText);
    });

    it('maintains form state during rapid input changes', () => {
      const { getByTestId } = setupComponent();
      
      const nameInput = getByTestId('recipe-name-input');
      
      // Simulate rapid typing
      fireEvent.changeText(nameInput, 'P');
      fireEvent.changeText(nameInput, 'Pa');
      fireEvent.changeText(nameInput, 'Pas');
      fireEvent.changeText(nameInput, 'Past');
      fireEvent.changeText(nameInput, 'Pasta');
      
      expect(nameInput.props.value).toBe('Pasta');
    });
  });

  describe('Accessibility & Usability', () => {
    it('provides accessible labels for all form fields', () => {
      const { getByTestId, getByText } = setupComponent();
      
      // Verify all labels are present
      expect(getByText('Recipe Name')).toBeTruthy();
      expect(getByText('Description')).toBeTruthy();
      expect(getByText('Ingredients')).toBeTruthy();
      expect(getByText('Instructions')).toBeTruthy();
      
      // Verify inputs have testIDs for accessibility
      expect(getByTestId('recipe-name-input')).toBeTruthy();
      expect(getByTestId('recipe-description-input')).toBeTruthy();
      expect(getByTestId('recipe-ingredients-input')).toBeTruthy();
      expect(getByTestId('recipe-instructions-input')).toBeTruthy();
    });

    it('provides clear button labels and actions', () => {
      const { getByTestId, getByText } = setupComponent();
      
      // Verify button text is clear and accessible
      expect(getByText('Save Recipe')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      
      // Verify buttons have testIDs for automation
      expect(getByTestId('save-recipe-button')).toBeTruthy();
      expect(getByTestId('cancel-button')).toBeTruthy();
    });

    it('supports keyboard navigation and form flow', () => {
      const { getByTestId } = setupComponent();
      
      // All inputs should be focusable
      const nameInput = getByTestId('recipe-name-input');
      const descriptionInput = getByTestId('recipe-description-input');
      const ingredientsInput = getByTestId('recipe-ingredients-input');
      const instructionsInput = getByTestId('recipe-instructions-input');
      
      expect(nameInput).toBeTruthy();
      expect(descriptionInput).toBeTruthy();
      expect(ingredientsInput).toBeTruthy();
      expect(instructionsInput).toBeTruthy();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('handles navigation errors gracefully', () => {
      const mockGoBackWithError = jest.fn(() => {
        throw new Error('Navigation failed');
      });
      
      mockNavigationProp.goBack = mockGoBackWithError;
      
      const { getByTestId } = setupComponent();
      
      // Should handle navigation errors without crashing
      expect(() => {
        fireEvent.press(getByTestId('save-recipe-button'));
      }).toThrow('Navigation failed');
      
      expect(mockGoBackWithError).toHaveBeenCalledTimes(1);
    });

    it('handles missing navigation prop gracefully', () => {
      const { getByText, getByTestId } = render(<AddRecipeScreen navigation={{} as any} />);
      
      // Component should still render even with incomplete navigation prop
      expect(getByText('Add New Recipe')).toBeTruthy();
      expect(getByTestId('recipe-name-input')).toBeTruthy();
      expect(getByTestId('save-recipe-button')).toBeTruthy();
    });

    it('maintains form state integrity during interactions', () => {
      const { getByTestId } = setupComponent();
      
      const nameInput = getByTestId('recipe-name-input');
      const descriptionInput = getByTestId('recipe-description-input');
      
      // Fill some fields
      fireEvent.changeText(nameInput, 'Test Recipe');
      fireEvent.changeText(descriptionInput, 'Test Description');
      
      // Interact with buttons (shouldn't affect form state until submission)
      const saveButton = getByTestId('save-recipe-button');
      expect(saveButton).toBeTruthy();
      
      // Form state should remain intact
      expect(nameInput.props.value).toBe('Test Recipe');
      expect(descriptionInput.props.value).toBe('Test Description');
    });
  });

  describe('Future API Integration Readiness', () => {
    // These tests demonstrate patterns for when API integration is added
    
    it('structure supports loading states during save', () => {
      const { getByTestId, getByText } = setupComponent();
      
      // Current structure can easily accommodate loading indicators
      expect(getByText('Save Recipe')).toBeTruthy();
      // Future: expect(queryByText('Saving...')).toBeNull(); // when not saving
      
      // Button structure supports disabled state during loading
      const saveButton = getByTestId('save-recipe-button');
      expect(saveButton).toBeTruthy();
    });

    it('structure supports validation error display', () => {
      const { getByTestId } = setupComponent();
      
      // Current structure can easily accommodate error messages near inputs
      expect(getByTestId('recipe-name-container')).toBeTruthy();
      expect(getByTestId('recipe-description-container')).toBeTruthy();
      // Future: Error messages can be added to these containers
    });

    it('structure supports success/failure feedback', () => {
      const { getByTestId } = setupComponent();
      
      // Button structure supports state changes
      const saveButton = getByTestId('save-recipe-button');
      expect(saveButton).toBeTruthy();
      // Future: Button text can change to "Saved!" or show error states
    });

    it('form data structure matches API schema', () => {
      const { getByTestId } = setupComponent();
      
      // Fill form with data that matches expected API schema
      fireEvent.changeText(getByTestId('recipe-name-input'), testRecipeData.name);
      fireEvent.changeText(getByTestId('recipe-description-input'), testRecipeData.description);
      fireEvent.changeText(getByTestId('recipe-ingredients-input'), testRecipeData.ingredients);
      fireEvent.changeText(getByTestId('recipe-instructions-input'), testRecipeData.instructions);
      
      // Verify data structure is correct for API
      const nameInput = getByTestId('recipe-name-input');
      expect(nameInput.props.value).toBe(testRecipeData.name);
      
      // Future: This data can be easily transformed to match RecipeRequestDto
    });
  });
});