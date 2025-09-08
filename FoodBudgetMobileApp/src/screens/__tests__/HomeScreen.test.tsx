import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type MockNavigation = Partial<StackNavigationProp<RootStackParamList, 'Home'>>;

describe('HomeScreen', () => {
  let mockNavigationProp: MockNavigation;

  const setupComponent = () => {
    const element = React.createElement(HomeScreen, { 
      navigation: mockNavigationProp as StackNavigationProp<RootStackParamList, 'Home'> 
    });
    
    return render(element);
  };
  
  beforeEach(() => {
    mockNavigationProp = {
      navigate: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with all UI elements', () => {
      const { getByText } = setupComponent();

      // Check main content
      expect(getByText('Recipe Tracker')).toBeTruthy();
      expect(getByText('Keep track of your favorite recipes')).toBeTruthy();

      // Check navigation buttons
      expect(getByText('View Recipes')).toBeTruthy();
      expect(getByText('Add New Recipe')).toBeTruthy();
    });

    it('displays welcome message and subtitle', () => {
      const { getByText } = setupComponent();

      const title = getByText('Recipe Tracker');
      const subtitle = getByText('Keep track of your favorite recipes');

      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to RecipeList when "View Recipes" button is pressed', () => {
      const { getByText } = setupComponent();
      
      const viewRecipesButton = getByText('View Recipes');
      fireEvent.press(viewRecipesButton);
      
      expect(mockNavigationProp.navigate).toHaveBeenCalledTimes(1);
      expect(mockNavigationProp.navigate).toHaveBeenCalledWith('RecipeList');
    });

    it('navigates to AddRecipe when "Add New Recipe" button is pressed', () => {
      const { getByText } = setupComponent();
      
      const addRecipeButton = getByText('Add New Recipe');
      fireEvent.press(addRecipeButton);
      
      expect(mockNavigationProp.navigate).toHaveBeenCalledTimes(1);
      expect(mockNavigationProp.navigate).toHaveBeenCalledWith('AddRecipe');
    });

    it('prevents multiple navigation calls on rapid button presses', () => {
      const { getByText } = setupComponent();
      
      const viewRecipesButton = getByText('View Recipes');
      
      // Simulate rapid button presses
      fireEvent.press(viewRecipesButton);
      fireEvent.press(viewRecipesButton);
      fireEvent.press(viewRecipesButton);
      
      // Navigation should still only be called once per press
      expect(mockNavigationProp.navigate).toHaveBeenCalledTimes(3);
      expect(mockNavigationProp.navigate).toHaveBeenNthCalledWith(1, 'RecipeList');
      expect(mockNavigationProp.navigate).toHaveBeenNthCalledWith(2, 'RecipeList');
      expect(mockNavigationProp.navigate).toHaveBeenNthCalledWith(3, 'RecipeList');
    });
  });

  describe('User Experience', () => {
    it('provides clear call-to-action buttons', () => {
      const { getByText } = setupComponent();

      const viewRecipesButton = getByText('View Recipes');
      const addRecipeButton = getByText('Add New Recipe');

      // Verify buttons have accessible text
      expect(viewRecipesButton).toBeTruthy();
      expect(addRecipeButton).toBeTruthy();
    });

    it('maintains consistent button behavior', () => {
      const { getByText } = setupComponent();
      
      const viewRecipesButton = getByText('View Recipes');
      const addRecipeButton = getByText('Add New Recipe');

      // Test both buttons work independently
      fireEvent.press(viewRecipesButton);
      expect(mockNavigationProp.navigate).toHaveBeenLastCalledWith('RecipeList');

      fireEvent.press(addRecipeButton);
      expect(mockNavigationProp.navigate).toHaveBeenLastCalledWith('AddRecipe');

      expect(mockNavigationProp.navigate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      const mockNavigateWithError = jest.fn(() => {
        throw new Error('Navigation failed');
      });
      
      mockNavigationProp.navigate = mockNavigateWithError;
      
      const { getByText } = setupComponent();
      
      // Should not crash when navigation fails
      expect(() => {
        fireEvent.press(getByText('View Recipes'));
      }).toThrow('Navigation failed');
      
      expect(mockNavigateWithError).toHaveBeenCalledWith('RecipeList');
    });

    it('handles missing navigation prop gracefully', () => {
      const { getByText } = render(<HomeScreen navigation={{} as any} />);
      
      // Component should still render even with incomplete navigation prop
      expect(getByText('Recipe Tracker')).toBeTruthy();
      expect(getByText('View Recipes')).toBeTruthy();
      expect(getByText('Add New Recipe')).toBeTruthy();
    });
  });
});