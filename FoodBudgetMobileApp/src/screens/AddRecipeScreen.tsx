import React, { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';
import { RootStackParamList } from '../types/navigation';
import { Container, RecipeForm } from '../components/shared';
import { RecipeRequestDto } from '../lib/shared/types/dto';
import { RecipeService } from '../lib/shared';

type AddRecipeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AddRecipe'>;
};

const AddRecipeScreen: React.FC<AddRecipeScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSave = async (recipeData: RecipeRequestDto) => {
    setIsLoading(true);

    try {
      // Call API to save a recipe
      const response = await RecipeService.createRecipe(recipeData);

      if (!response.success) {
        // Handle API error response
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error.detail || response.error.title || 'Failed to save recipe. Please try again.';

        Alert.alert('Error', errorMessage);
        return;
      }

      // Show a success message
      Alert.alert(
        'Success',
        'Recipe saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      // Handle unexpected errors
      Alert.alert(
        'Error',
        'Failed to save recipe. Please try again.',
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Recipe" />
      </Appbar.Header>
      
      <Container scrollable useSafeArea={false}>
        <RecipeForm
          onSubmit={handleSave}
          onCancel={handleCancel}
          submitLabel="Save Recipe"
          isLoading={isLoading}
          testID="add-recipe-form"
        />
      </Container>
    </>
  );
};

export default AddRecipeScreen;