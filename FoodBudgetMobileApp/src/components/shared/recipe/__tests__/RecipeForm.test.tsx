import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeForm } from '../RecipeForm';
import { RecipeResponseDto } from '../../../../lib/shared';

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

  describe('Happy Path', () => {
    /**
     * Test: Valid form submission
     * Given: Valid form data
     * When: Form submitted
     * Then: Calls onSubmit with correct data
     */
    it('given valid form data, when submitted, then calls onSubmit with correct data', async () => {
      // Arrange
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('form-servings'), '4');
      fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 4,
          instructions: 'Test instructions',
        });
      });
    });

    /**
     * Test: Initial values population
     * Given: Initial values provided
     * When: Form renders
     * Then: Populates fields correctly
     */
    it('given initial values, when form renders, then populates fields correctly', () => {
      // Arrange
      const initialValues: Partial<RecipeResponseDto> = {
        title: 'Initial Recipe',
        servings: 6,
        instructions: 'Initial instructions',
      };

      // Act
      const { getByDisplayValue } = render(
        <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} />
      );

      // Assert
      expect(getByDisplayValue('Initial Recipe')).toBeTruthy();
      expect(getByDisplayValue('6')).toBeTruthy();
      expect(getByDisplayValue('Initial instructions')).toBeTruthy();
    });

    /**
     * Test: Form field interaction
     * Given: Form rendered
     * When: User types in fields
     * Then: Updates field values correctly
     */
    it('given form interaction, when user types, then updates field values', () => {
      // Arrange
      const { getByTestId } = render(
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
  });

  describe('Form Validation', () => {
    /**
     * Test: Empty title validation
     * Given: Empty title field
     * When: Form submitted
     * Then: Shows validation error and prevents submission
     */
    it('given empty title, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = render(
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

    /**
     * Test: Title length validation
     * Given: Title exceeding max length
     * When: Form submitted
     * Then: Shows validation error
     */
    it('given title too long, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = render(
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

    /**
     * Test: Servings bounds validation
     * Given: Servings out of valid range
     * When: Form submitted
     * Then: Shows validation error
     */
    it('given servings out of bounds, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = render(
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

    /**
     * Test: Instructions length validation
     * Given: Instructions exceeding max length
     * When: Form submitted
     * Then: Shows validation error
     */
    it('given instructions too long, when submitted, then shows validation error', async () => {
      // Arrange
      const { getByTestId, getByText } = render(
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

    /**
     * Test: Progressive validation behavior
     * Given: Form with validation errors
     * When: Fields change after submitted attempt
     * Then: Validates progressively and clears errors
     */
    it('given fields change after submit attempt, when updated, then validates progressively', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - Phase 1: Before a submitted attempt, no errors on blur
      const titleInput = getByTestId('form-title');
      fireEvent(titleInput, 'blur');
      expect(queryByText('Title is required')).toBeNull();

      // Act - Phase 2: A submitted attempt triggers validation
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

    /**
     * Test: Valid data clears errors
     * Given: Form with previous validation errors
     * When: Valid data submitted
     * Then: Clears all errors
     */
    it('given valid data, when submitted, then clears all errors', async () => {
      // Arrange
      const { getByTestId, getByText, queryByText } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act - First trigger validation errors
      fireEvent.press(getByTestId('form-submit'));
      await waitFor(() => {
        expect(getByText('Title is required')).toBeTruthy();
      });

      // Act - Then provide valid data
      fireEvent.changeText(getByTestId('form-title'), 'Valid Recipe');
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(queryByText('Title is required')).toBeNull();
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Valid Recipe',
          servings: 1,
          instructions: null,
        });
      });
    });
  });

  describe('User Interactions', () => {
    /**
     * Test: Cancel button interaction
     * Given: onCancel handler provided
     * When: Cancel button pressed
     * Then: Calls onCancel callback
     */
    it('given onCancel handler, when cancel pressed, then calls onCancel', () => {
      // Arrange
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} testID="form" />
      );

      // Act
      fireEvent.press(getByTestId('form-cancel'));

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Cancel button conditional rendering
     * Given: No onCancel handler
     * When: Form renders
     * Then: No cancel button shown
     */
    it('given no onCancel handler, when rendered, then no cancel button shown', () => {
      // Arrange & Act
      const { queryByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Assert
      expect(queryByTestId('form-cancel')).toBeNull();
    });

    /**
     * Test: Duplicate submission prevention
     * Given: Form submission in progress
     * When: User tries to submit again
     * Then: Prevents duplicate submission
     */
    it('given form submission in progress, when user tries again, then prevents duplicate submission', async () => {
      // Arrange
      let resolveSubmit: (value: void) => void;
      const slowOnSubmit = jest.fn(() => new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      }));

      const { getByTestId } = render(
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
  });

  describe('Loading States', () => {
    /**
     * Test: External loading state
     * Given: isLoading=true
     * When: Form renders
     * Then: Disables form and shows loading
     */
    it('given isLoading true, when rendered, then disables form and shows loading', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading testID="form" />
      );

      // Assert
      const submitButton = getByTestId('form-submit');
      const cancelButton = getByTestId('form-cancel');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
      expect(cancelButton.props.accessibilityState?.disabled).toBe(true);
    });

    /**
     * Test: Internal loading during submission
     * Given: Async submission in progress
     * When: Form is submitting
     * Then: Shows loading state
     */
    it('given internal loading during submission, when rendered, then disables form', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} isLoading testID="form" />
      );

      // Assert
      const submitButton = getByTestId('form-submit');
      expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    });

    /**
     * Test: Custom submit label
     * Given: Custom submitLabel prop
     * When: Form renders
     * Then: Uses custom label
     */
    it('given custom submit label, when rendered, then uses custom label', () => {
      // Arrange & Act
      const { getByText } = render(
        <RecipeForm onSubmit={mockOnSubmit} submitLabel="Update Recipe" />
      );

      // Assert
      expect(getByText('Update Recipe')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Empty instructions handling
     * Given: Empty instructions field
     * When: Form submitted
     * Then: Sends null for instructions
     */
    it('given empty instructions, when submitted, then sends null', async () => {
      // Arrange
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.changeText(getByTestId('form-servings'), '2');
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 2,
          instructions: null,
        });
      });
    });

    /**
     * Test: Default servings value
     * Given: No servings specified
     * When: Form submitted
     * Then: Uses default value of 1
     */
    it('given default servings, when not specified, then uses 1', async () => {
      // Arrange
      const { getByTestId } = render(
        <RecipeForm onSubmit={mockOnSubmit} testID="form" />
      );

      // Act
      fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
      fireEvent.press(getByTestId('form-submit'));

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Recipe',
          servings: 1,
          instructions: null,
        });
      });
    });

    /**
     * Test: All form fields rendering
     * Given: Form component
     * When: Rendered
     * Then: Displays all required form fields
     */
    it('given form component, when rendered, then displays all form fields', () => {
      // Arrange & Act
      const { getAllByText } = render(
        <RecipeForm onSubmit={mockOnSubmit} />
      );

      // Assert
      expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);
      expect(getAllByText('Servings').length).toBeGreaterThan(0);
      expect(getAllByText('Instructions').length).toBeGreaterThan(0);
    });
  });
});