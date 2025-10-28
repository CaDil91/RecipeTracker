import React, { createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { RecipeForm, RecipeFormRef } from '../RecipeForm';
import { RecipeResponseDto } from '../../../../lib/shared';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<PaperProvider>{ui}</PaperProvider>);
};

describe('RecipeForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Risk-Based Priority
   * Test high-risk, high-value code first: complex business logic, frequently changing code,
   * previously buggy code, critical workflows
   */
  describe('Risk-Based Priority', () => {
    it('given readOnly true, when rendered, then displays VIEW mode components', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'View Mode Recipe',
        servings: 4,
        instructions: 'View mode instructions',
        category: 'Dinner',
        imageUrl: 'file:///image.jpg',
      };

      // Act
      renderWithProviders(
        <RecipeForm
          onSubmit={mockOnSubmit}
          initialValues={initialValues}
          readOnly={true}
          testID="form"
        />
      );

      // Assert
      expect(screen.getByText('View Mode Recipe')).toBeOnTheScreen();
      expect(screen.getByText('Dinner')).toBeOnTheScreen();
      expect(screen.getByText('4 servings')).toBeOnTheScreen();
      expect(screen.queryByTestId('form-submit')).not.toBeOnTheScreen();
    });

    it('given readOnly false, when rendered, then displays EDIT mode components', () => {
      // Arrange & Act
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} readOnly={false} testID="form" />
      );

      // Assert
      expect(screen.getByTestId('form-title')).toBeOnTheScreen();
      expect(screen.getByTestId('form-category')).toBeOnTheScreen();
      expect(screen.getByTestId('form-servings-increment')).toBeOnTheScreen();
      expect(screen.getByTestId('form-servings-decrement')).toBeOnTheScreen();
      expect(screen.getByTestId('form-submit')).toBeOnTheScreen();
    });

    it('given ref attached, when no changes made, then hasFormChanges returns false', () => {
      // Arrange
      const ref = createRef<RecipeFormRef>();
      renderWithProviders(
        <RecipeForm ref={ref} onSubmit={mockOnSubmit} testID="form" />
      );

      // Act & Assert
      expect(ref.current?.hasFormChanges()).toBe(false);
    });

    it('given ref attached, when form is dirty, then hasFormChanges returns true', () => {
      // Arrange
      const ref = createRef<RecipeFormRef>();
      renderWithProviders(
        <RecipeForm ref={ref} onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('form-title'), 'Modified Title');

      // Assert
      expect(ref.current?.hasFormChanges()).toBe(true);
    });

    it('given onCancel with dirty form, when cancel pressed, then calls onCancel with true', () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} testID="form" />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('form-title'), 'Changed');
      fireEvent.press(screen.getByTestId('form-cancel'));

      // Assert
      expect(mockOnCancel).toHaveBeenCalledWith(true);
    });

    it('given onCancel with pristine form, when cancel pressed, then calls onCancel with false', () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} testID="form" />
      );

      // Act
      fireEvent.press(screen.getByTestId('form-cancel'));

      // Assert
      expect(mockOnCancel).toHaveBeenCalledWith(false);
    });
  });

  /**
   * Happy Path
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

      // Increment servings from 1 to 4 (wait for each state update)
      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('2 servings')).toBeOnTheScreen());

      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('3 servings')).toBeOnTheScreen());

      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('4 servings')).toBeOnTheScreen());

      fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');

      // Select category
      fireEvent.press(getByTestId('form-category'));
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeOnTheScreen();
      });
      fireEvent.press(getByText('Breakfast'));

      // Wait for modal to close
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeOnTheScreen(); // Now displayed in the chip
      });

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
      }, { timeout: 3000 });
    });

    it('given initial values, when form renders, then populates fields correctly', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Initial Recipe',
        servings: 6,
        instructions: 'Initial instructions',
      };

      // Act
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} />
      );

      // Assert
      expect(screen.getByDisplayValue('Initial Recipe')).toBeOnTheScreen();
      expect(screen.getByText('6 servings')).toBeOnTheScreen();
      expect(screen.getByDisplayValue('Initial instructions')).toBeOnTheScreen();
    });

    it('given form interaction, when user types, then updates field values', () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(screen.getByTestId('form-title'), 'New Recipe Title');

      // Assert
      expect(screen.getByTestId('form-title').props.value).toBe('New Recipe Title');
    });

    it('given category and image fields, when form renders, then shows both pickers', () => {
      // Arrange & Act
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Assert
      expect(screen.getByTestId('form-category')).toBeOnTheScreen();
      expect(screen.getByTestId('form-image-add')).toBeOnTheScreen();
    });

    it('given valid data with category and image, when submitted, then includes both in submission', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Fill in all fields including category and image
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      // Increment servings from 1 to 4 (wait for each state update)
      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('2 servings')).toBeOnTheScreen());

      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('3 servings')).toBeOnTheScreen());

      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('4 servings')).toBeOnTheScreen());

      fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');

      // Select category
      fireEvent.press(getByTestId('form-category'));
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeOnTheScreen();
      });
      fireEvent.press(getByText('Breakfast'));

      // Wait for the modal to close and category to be displayed in chip
      await waitFor(() => {
        const breakfastElements = screen.queryAllByText('Breakfast');
        // Should have at least one Breakfast text (in the chip, not in modal)
        expect(breakfastElements.length).toBeGreaterThan(0);
      });

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
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      // Assert
      expect(screen.getByDisplayValue('Initial Recipe')).toBeOnTheScreen();
      expect(screen.getByText('Dinner')).toBeOnTheScreen();
      // Image is displayed with change/delete buttons, not "Image selected" text
      expect(screen.getByTestId('form-image')).toBeOnTheScreen();
      expect(screen.getByTestId('form-image-change')).toBeOnTheScreen();
      expect(screen.getByTestId('form-image-delete')).toBeOnTheScreen();
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
      const categoryTrigger = getByTestId('form-category');
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
      const categoryTrigger = getByTestId('form-category');
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
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      // Verify image is displayed with the delete button
      expect(screen.getByTestId('form-image')).toBeOnTheScreen();
      expect(screen.getByTestId('form-image-delete')).toBeOnTheScreen();

      // Act
      fireEvent.press(screen.getByTestId('form-image-delete'));

      // Assert - Image should be removed, Add Image button should appear
      await waitFor(() => {
        expect(screen.queryByTestId('form-image')).not.toBeOnTheScreen();
        expect(screen.getByTestId('form-image-add')).toBeOnTheScreen();
        expect(screen.getByText('Add Image')).toBeOnTheScreen();
      });
    });

    it('given form component, when rendered, then displays all form fields', () => {
      // Arrange & Act
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Assert - Check for form fields via testIDs and visible elements
      expect(screen.getByTestId('form-title')).toBeOnTheScreen();
      expect(screen.getByTestId('form-servings-increment')).toBeOnTheScreen();
      expect(screen.getByTestId('form-instructions')).toBeOnTheScreen();
      expect(screen.getByText('Instructions')).toBeOnTheScreen(); // Has visible label
      expect(screen.getByTestId('form-category')).toBeOnTheScreen();
      expect(screen.getByTestId('form-image-add')).toBeOnTheScreen();
    });
  });

  /**
   * Null/Empty/Invalid Tests
   * Verify graceful handling of edge cases and malformed data
   */
  describe('Null/Empty/Invalid', () => {
    it('given empty title, when submitted, then prevents submission', async () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.press(screen.getByTestId('form-submit'));

      // Assert - Form validation prevents submission (note: error messages not displayed in UI)
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('given empty instructions, when submitted, then sends null', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      // Increment servings from 1 to 2
      fireEvent.press(getByTestId('form-servings-increment'));
      await waitFor(() => expect(getByText('2 servings')).toBeOnTheScreen());

      // Select category
      fireEvent.press(getByTestId('form-category'));
      await waitFor(() => {
        expect(getByText('Breakfast')).toBeOnTheScreen();
      });
      fireEvent.press(getByText('Breakfast'));

      // Wait for modal to close
      await waitFor(() => {
        const breakfastElements = screen.queryAllByText('Breakfast');
        expect(breakfastElements.length).toBeGreaterThan(0);
      });

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

      const categoryTrigger = getByTestId('form-category');
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
          category: null,
          imageUrl: null,
        });
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
    it('given title too long, when submitted, then prevents submission', async () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );
      const longTitle = 'a'.repeat(201);

      // Act
      fireEvent.changeText(screen.getByTestId('form-title'), longTitle);
      fireEvent.press(screen.getByTestId('form-submit'));

      // Assert - Validation prevents submission (error messages not displayed in UI)
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('given servings at maximum, when increment pressed, then stays at 99', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        servings: 99,
      };
      const { getByTestId } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} testID="form" />
      );

      // Act & Assert - Increment button should be disabled at max
      const incrementButton = getByTestId('form-servings-increment');
      expect(incrementButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('given instructions too long, when submitted, then prevents submission', async () => {
      // Arrange
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );
      const longInstructions = 'a'.repeat(5001);

      // Act
      fireEvent.changeText(screen.getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(screen.getByTestId('form-instructions'), longInstructions);
      fireEvent.press(screen.getByTestId('form-submit'));

      // Assert - Validation prevents submission (error messages not displayed in UI)
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('given default servings, when not specified, then uses 1', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      // Select category
      const categoryTrigger = getByTestId('form-category');
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
      renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Phase 1: Submit with an empty title (should fail validation)
      fireEvent.press(screen.getByTestId('form-submit'));
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }, { timeout: 1000 });

      // Act - Phase 2: Add valid title and submit again (should succeed)
      fireEvent.changeText(screen.getByTestId('form-title'), 'Valid Title');
      fireEvent.press(screen.getByTestId('form-submit'));

      // Assert - Submission now succeeds
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Valid Title',
          servings: 1,
          instructions: null,
          category: null,
          imageUrl: null,
        });
      });
    });

    it('given valid data, when submitted, then clears all errors', async () => {
      // Arrange
      const { getByTestId, getByText } = renderWithProviders(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - First trigger validation errors by submitting with an empty title
      fireEvent.press(getByTestId('form-submit'));
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }, { timeout: 1000 });

      // Act - Then provide valid data
      fireEvent.changeText(getByTestId('form-title'), 'Valid Recipe');

      // Select category
      const categoryTrigger = getByTestId('form-category');
      fireEvent.press(categoryTrigger);
      await waitFor(() => {
        expect(getByText('Dessert')).toBeTruthy();
      });
      fireEvent.press(getByText('Dessert'));
      await waitFor(() => {
        const dessertElements = screen.queryAllByText('Dessert');
        expect(dessertElements.length).toBeGreaterThan(0);
      });

      fireEvent.press(getByTestId('form-submit'));

      // Assert - Form now submits successfully (errors were cleared)
      await waitFor(() => {
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
      const categoryTrigger = getByTestId('form-category');
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

      const categoryTrigger = getByTestId('form-category');
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

      // Act - Fill in valid data first
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');

      // Wait for form validation to complete
      await waitFor(() => {
        expect(getByTestId('form-title')).toHaveProp('value', 'Test Recipe');
      });

      // Submit twice rapidly
      fireEvent.press(getByTestId('form-submit'));
      fireEvent.press(getByTestId('form-submit')); // The second press should be ignored

      // Assert - Should only be called once
      await waitFor(() => {
        expect(slowOnSubmit).toHaveBeenCalledTimes(1);
      });

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
  });
});