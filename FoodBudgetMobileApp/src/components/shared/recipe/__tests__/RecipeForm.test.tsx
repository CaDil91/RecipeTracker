import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeForm } from '../RecipeForm';
import { RecipeResponseDto } from '../../../../lib/shared/types/dto';

describe('RecipeForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    const { getAllByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} />
    );

    expect(getAllByText('Recipe Title').length).toBeGreaterThan(0);
    expect(getAllByText('Servings').length).toBeGreaterThan(0);
    expect(getAllByText('Instructions').length).toBeGreaterThan(0);
  });

  it('populates fields with initial values', () => {
    const initialValues: Partial<RecipeResponseDto> = {
      title: 'Initial Recipe',
      servings: 6,
      instructions: 'Initial instructions',
    };
    
    const { getByDisplayValue } = render(
      <RecipeForm onSubmit={mockOnSubmit} initialValues={initialValues} />
    );
    
    expect(getByDisplayValue('Initial Recipe')).toBeTruthy();
    expect(getByDisplayValue('6')).toBeTruthy();
    expect(getByDisplayValue('Initial instructions')).toBeTruthy();
  });

  it('updates title field on text change', () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );
    
    const titleInput = getByTestId('form-title');
    fireEvent.changeText(titleInput, 'New Recipe Title');
    
    expect(titleInput.props.value).toBe('New Recipe Title');
  });

  it('updates servings field on value change', () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );
    
    const servingsInput = getByTestId('form-servings');
    fireEvent.changeText(servingsInput, '8');
    
    expect(servingsInput.props.value).toBe('8');
  });

  it('validates required title field', async () => {
    const { getByTestId, getByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );

    // Hybrid validation: Submit empty form should show all validation errors
    const submitButton = getByTestId('form-submit');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Title is required')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates title max length', async () => {
    const { getByTestId, getByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );

    const titleInput = getByTestId('form-title');
    const longTitle = 'a'.repeat(201);
    fireEvent.changeText(titleInput, longTitle);

    // Hybrid validation: submit to trigger validation
    fireEvent.press(getByTestId('form-submit'));

    await waitFor(() => {
      expect(getByText('Title cannot exceed 200 characters')).toBeTruthy();
    });
  });

  it('validates servings range', async () => {
    const { getByTestId, getByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );

    const servingsInput = getByTestId('form-servings');
    fireEvent.changeText(servingsInput, '150');

    // Hybrid validation: submit to trigger validation
    fireEvent.press(getByTestId('form-submit'));

    await waitFor(() => {
      expect(getByText('Servings must be between 1 and 100')).toBeTruthy();
    });
  });

  it('validates instructions max length', async () => {
    const { getByTestId, getByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );

    const instructionsInput = getByTestId('form-instructions');
    const longInstructions = 'a'.repeat(5001);
    fireEvent.changeText(instructionsInput, longInstructions);

    // Hybrid validation: submit to trigger validation
    fireEvent.press(getByTestId('form-submit'));

    await waitFor(() => {
      expect(getByText('Instructions cannot exceed 5000 characters')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );
    
    fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
    fireEvent.changeText(getByTestId('form-servings'), '4');
    fireEvent.changeText(getByTestId('form-instructions'), 'Test instructions');
    
    const submitButton = getByTestId('form-submit');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Recipe',
        servings: 4,
        instructions: 'Test instructions',
      });
    });
  });

  it('handles empty instructions as null', async () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );
    
    fireEvent.changeText(getByTestId('form-title'), 'Test Recipe');
    fireEvent.changeText(getByTestId('form-servings'), '2');
    
    const submitButton = getByTestId('form-submit');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Recipe',
        servings: 2,
        instructions: null,
      });
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} testID="form" />
    );
    
    const cancelButton = getByTestId('form-cancel');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('hides cancel button when onCancel is not provided', () => {
    const { queryByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );
    
    expect(queryByTestId('form-cancel')).toBeNull();
  });

  it('disables buttons when loading', () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading testID="form" />
    );

    const submitButton = getByTestId('form-submit');
    const cancelButton = getByTestId('form-cancel');

    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
    expect(cancelButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('shows loading state on submit button', () => {
    const { getByTestId } = render(
      <RecipeForm onSubmit={mockOnSubmit} isLoading testID="form" />
    );

    const submitButton = getByTestId('form-submit');
    expect(submitButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('uses custom submit label', () => {
    const { getByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} submitLabel="Update Recipe" />
    );
    
    expect(getByText('Update Recipe')).toBeTruthy();
  });

  it('implements hybrid validation pattern', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <RecipeForm onSubmit={mockOnSubmit} testID="form" />
    );

    // Phase 1: Before submit attempt, no errors should show even on blur
    const titleInput = getByTestId('form-title');
    fireEvent(titleInput, 'blur');

    // Should not show error yet (no submit attempt made)
    expect(queryByText('Title is required')).toBeNull();

    // Phase 2: Submit attempt triggers validation for all fields
    fireEvent.press(getByTestId('form-submit'));

    await waitFor(() => {
      expect(getByText('Title is required')).toBeTruthy();
    });

    // Phase 3: After submit attempt, progressive validation should work
    fireEvent.changeText(titleInput, 'Valid Title');

    await waitFor(() => {
      expect(queryByText('Title is required')).toBeNull();
    });
  });
});