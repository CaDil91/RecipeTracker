import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { RecipeForm } from '../RecipeForm';
import { RecipeResponseDto } from '../../../../lib/shared';

// Helper to wrap component with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

/**
 * Unit tests for the RecipeForm component
 *
 * Tests complex form with validation, state management, and async submission.
 * Uses sociable testing approach with real form input components.
 */
describe('RecipeForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Happy Path Tests
   * Test the primary use cases that deliver business value
   */
  describe('Happy Path', () => {
    it('given valid form data, when submitted, then calls onSubmit with correct data', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('form-servings'), '4');
      fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');

      // Select category
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeTruthy();
      });
      fireEvent.press(getByText('Breakfast'));

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 4,
          instructions: 'Test instructions',
          category: 'Breakfast',
          imageUrl: null,
        });
      });
    });

    it('given initial values, when form renders, then populates fields correctly', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Initial Recipe',
        servings: 6,
        instructions: 'Initial instructions',
      };

      // Act
      const { getByDisplayValue } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} />
      );

      // Assert
      expect(getByDisplayValue('Initial Recipe')).toBeTruthy();
      expect(getByDisplayValue('6')).toBeTruthy();
      expect(getByDisplayValue('Initial instructions')).toBeTruthy();
    });

    it('given form interaction, when user types, then updates field values', () => {
      // Arrange
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      const titleInput = getByTestId('form-title');
      const servingsInput = getByTestId('form-servings');
      fireEvent.changeText(titleInput, 'New Recipe Title');
      fireEvent.changeText(servingsInput, '8');

      // Assert
      expect(titleInput.props.value).toBe('New Recipe Title');
      expect(servingsInput.props.value).toBe('8');
    });

    it('given category and image fields, when form renders, then shows both pickers', () => {
      // Arrange & Act
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Assert
      expect(getByTestId('form-category-picker')).toBeTruthy();
      expect(getByTestId('form-image-picker')).toBeTruthy();
    });

    it('given valid data with category and image, when submitted, then includes both in submission', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Fill in all fields including category and image
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('form-servings'), '4');
      fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');

      // Select category
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeTruthy();
      });
      fireEvent.press(getByText('Breakfast'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Recipe',
            servings: 4,
            instructions: 'Test instructions',
            category: 'Breakfast',
          })
        );
      });
    });

    it('given initial values with category and imageUrl, when form renders, then populates both fields', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Initial Recipe',
        servings: 6,
        instructions: 'Initial instructions',
        category: 'Dinner',
        imageUrl: 'file:///path/to/image.jpg',
      };

      // Act
      const { getByDisplayValue, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} />
      );

      // Assert
      expect(getByDisplayValue('Initial Recipe')).toBeTruthy();
      expect(getByText('Dinner')).toBeTruthy();
      expect(getByText('Image selected')).toBeTruthy();
    });

    it('given onCancel handler, when cancel pressed, then calls onCancel', () => {
      // Arrange
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} testID="form" />
      );

      // Act
      fireEvent.press(getByTestId('form-cancel'));

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('given category picker, when user selects category, then updates form state', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeTruthy();
      });
      fireEvent.press(getByText('Breakfast'));
      await waitFor(() => {});

      // Assert
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeTruthy();
      });
    });

    it('given category selected, when user changes it, then updates to new category', async () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Test Recipe',
        category: 'Breakfast',
      };
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      expect(getByText('Breakfast')).toBeTruthy();

      // Act
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dinner')).toBeTruthy();
      });
      fireEvent.press(getByText('Dinner'));
      await waitFor(() => {});

      // Assert
      await waitFor(() => {
        expect(getByText('Dinner')).toBeTruthy();
      });
    });

    it('given image selected, when user removes it, then clears imageUrl from form', async () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Test Recipe',
        category: 'Lunch',
        imageUrl: 'file:///path/to/image.jpg',
      };
      const { getByText, queryByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      expect(getByText('Image selected')).toBeTruthy();

      // Act
      fireEvent.press(getByText('Remove'));

      // Assert
      await waitFor(() => {
        expect(queryByText('Image selected')).toBeNull();
        expect(getByText('Select Image')).toBeTruthy();
      });
    });

    it('given form component, when rendered, then displays all form fields', () => {
      // Arrange & Act
      const { getAllByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} />
      );

      // Assert
      expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);
      expect(getAllByText('Servings').length).toBeGreaterThan(0);
      expect(getAllByText('Instructions').length).toBeGreaterThan(0);
    });
  });

  /**
   * Null/Empty/Invalid Tests
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given empty title, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('given empty instructions, when submitted, then sends null', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('form-servings'), '2');

      // Select category
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeTruthy();
      });
      fireEvent.press(getByText('Breakfast'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 2,
          instructions: null,
          category: 'Breakfast',
          imageUrl: null,
        });
      });
    });

    it('given empty imageUrl, when form submitted, then sends null', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Lunch')).toBeTruthy();
      });
      fireEvent.press(getByText('Lunch'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Recipe',
            category: 'Lunch',
            imageUrl: null,
          })
        );
      });
    });

    it('given no category selected, when form submitted, then allows submission with empty category', async () => {
      // Arrange
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('form-submit'));

      // Assert - Category is optional, so submission should succeed
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 1,
          instructions: null,
          category: '',
          imageUrl: null,
        });
      });
    });

    it('given empty category, when submitted, then allows submission', async () => {
      // Arrange
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('form-submit'));

      // Assert - Category is optional
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Recipe',
            category: '',
          })
        );
      });
    });

    it('given no onCancel handler, when rendered, then no cancel button shown', () => {
      // Arrange & Act
      const { queryByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Assert
      expect(queryByTestId('form-cancel')).toBeNull();
    });
  });

  /**
   * Boundary Tests
   * Test minimum, maximum, and threshold values
   */
  describe('Boundaries', () => {
    it('given title too long, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );
      const longTitle = 'a'.repeat(201);

      // Act
      fireEvent.changeText(getByTestId('form-title'), longTitle);
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(getByText('Title cannot exceed 200 characters')).toBeTruthy();
      });
    });

    it('given servings out of bounds, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-servings'), '150');
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(getByText('Servings must be between 1 and 100')).toBeTruthy();
      });
    });

    it('given instructions too long, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );
      const longInstructions = 'a'.repeat(5001);

      // Act
      fireEvent.changeText(getByTestId('form-instructions'), longInstructions);
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(getByText('Instructions cannot exceed 5000 characters')).toBeTruthy();
      });
    });

    it('given default servings, when not specified, then uses 1', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      // Select category
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dinner')).toBeTruthy();
      });
      fireEvent.press(getByText('Dinner'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 1,
          instructions: null,
          category: 'Dinner',
          imageUrl: null,
        });
      });
    });
  });

  /**
   * Business Rules Tests
   * Ensure critical business logic and constraints are validated
   */
  describe('Business Rules', () => {
    it('given fields change after submit attempt, when updated, then validates progressively', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Phase 1: Before submitted attempt, no errors on blur
      const titleInput = getByTestId('form-title');
      fireEvent(titleInput, 'blur');
      expect(queryByText('Title is required')).toBeNull();

      // Act - Phase 2: Submit attempt triggers validation
      fireEvent.press(getByTestId('form-submit'));
      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      // Act - Phase 3: Progressive validation clears error
      fireEvent.changeText(titleInput, 'Valid Title');

      // Assert
      await waitFor(() => {
        expect(queryByText('Title is required')).toBeNull();
      });
    });

    it('given valid data, when submitted, then clears all errors', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - First trigger validation errors
      fireEvent.press(getByTestId('form-submit'));
      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      // Act - Then provide valid data
      fireEvent.changeText(getByTestId('form-title'), 'Valid Recipe');

      // Select category
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dessert')).toBeTruthy();
      });
      fireEvent.press(getByText('Dessert'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(queryByText('Title is required')).toBeNull();
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Valid Recipe',
          servings: 1,
          instructions: null,
          category: 'Dessert',
          imageUrl: null,
        });
      });
    });

    it('given empty category initially, when category selected later, then form includes category on next submission', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Phase 1: Select a category first
      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Lunch')).toBeTruthy();
      });
      fireEvent.press(getByText('Lunch'));
      await waitFor(() => {});

      // Act - Phase 2: Submit with the selected category
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('form-submit'));

      // Assert - Form should submit with the selected category
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Recipe',
            category: 'Lunch',
          })
        );
      });
    });

    it('given no image selected, when form submitted, then allows submission', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Fill in required fields (title and category), but no image
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dessert')).toBeTruthy();
      });
      fireEvent.press(getByText('Dessert'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert - imageUrl is optional
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Recipe',
            category: 'Dessert',
            imageUrl: null,
          })
        );
      });
    });

    it('given valid category with no image, when submitted, then succeeds with null imageUrl', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Pizza');
      fireEvent.changeText(getByTestId('form-servings'), '8');

      const categoryTrigger = getByTestId('form-category-picker-trigger');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dinner')).toBeTruthy();
      });
      fireEvent.press(getByText('Dinner'));
      await waitFor(() => {});

      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Pizza',
          servings: 8,
          instructions: null,
          category: 'Dinner',
          imageUrl: null,
        });
      });
    });

    it('given all fields populated including category and image, when submitted, then submits complete data', async () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Complete Recipe',
        servings: 4,
        instructions: 'Mix everything together',
        category: 'Dessert',
        imageUrl: 'file:///path/to/dessert.jpg',
      };
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      // Act
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Complete Recipe',
          servings: 4,
          instructions: 'Mix everything together',
          category: 'Dessert',
          imageUrl: 'file:///path/to/dessert.jpg',
        });
      });
    });

    it('given custom submit label, when rendered, then uses custom label', () => {
      // Arrange & Act
      const { getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} submitLabel="Update Recipe" />
      );

      // Assert
      expect(getByText('Update Recipe')).toBeTruthy();
    });
  });

  /**
   * Error Tests
   * Verify appropriate error responses and cleanup behavior
   */
  describe('Errors', () => {
    it('given form submission in progress, when user tries again, then prevents duplicate submission', async () => {
      // Arrange
      let resolveSubmit: (value: void) => void;
      const slowOnSubmit = jest.fn(() => new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      }));

      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={slowOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('form-submit'));
      fireEvent.press(getByTestId('form-submit')); // Second press

      // Assert
      expect(slowOnSubmit).toHaveBeenCalledTimes(1);

      // Cleanup
      resolveSubmit!();
    });

    it('given isLoading true, when rendered, then disables form and shows loading', () => {
      // Arrange & Act
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading testID="form" />
      );

      // Assert
      const submitButton = getByTestId('form-submit');
      const cancelButton = getByTestId('form-cancel');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
      expect(cancelButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('given internal loading during submission, when rendered, then disables form', () => {
      // Arrange & Act
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} isLoading testID="form" />
      );

      // Assert
      const submitButton = getByTestId('form-submit');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });
  });
});