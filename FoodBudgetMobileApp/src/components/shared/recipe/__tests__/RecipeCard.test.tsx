import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RecipeCard } from '../RecipeCard';
import { RecipeResponseDto } from '../../../../lib/shared/types/dto';

const mockRecipe: RecipeResponseDto = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Recipe',
  instructions: 'Mix ingredients and cook for 30 minutes',
  servings: 4,
  createdAt: '2024-01-15T10:30:00Z',
};

describe('RecipeCard Component', () => {
  it('renders recipe title correctly', () => {
    const { getByText } = render(<RecipeCard recipe={mockRecipe} />);
    expect(getByText('Test Recipe')).toBeTruthy();
  });

  it('displays formatted creation date', () => {
    const { getByText } = render(<RecipeCard recipe={mockRecipe} />);
    expect(getByText(/Created Jan 15, 2024/)).toBeTruthy();
  });

  it('shows servings count', () => {
    const { getByText } = render(<RecipeCard recipe={mockRecipe} />);
    expect(getByText('4 servings')).toBeTruthy();
  });

  it('shows singular serving when servings is 1', () => {
    const singleServing = { ...mockRecipe, servings: 1 };
    const { getByText } = render(<RecipeCard recipe={singleServing} />);
    expect(getByText('1 serving')).toBeTruthy();
  });

  it('displays truncated instructions', () => {
    const longInstructions = {
      ...mockRecipe,
      instructions: 'This is a very long instruction text that should be truncated. '.repeat(10),
    };
    const { getByText } = render(<RecipeCard recipe={longInstructions} />);
    const instructionElement = getByText(/This is a very long instruction/);
    expect(instructionElement.props.numberOfLines).toBe(3);
  });

  it('handles missing instructions gracefully', () => {
    const noInstructions = { ...mockRecipe, instructions: null };
    const { queryByText } = render(<RecipeCard recipe={noInstructions} />);
    expect(queryByText(/Mix ingredients/)).toBeNull();
  });

  it('calls onPress when card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <RecipeCard recipe={mockRecipe} onPress={onPressMock} testID="recipe-card" />
    );
    
    fireEvent.press(getByTestId('recipe-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is pressed', () => {
    const onEditMock = jest.fn();
    const { getByTestId } = render(
      <RecipeCard recipe={mockRecipe} onEdit={onEditMock} testID="recipe-card" />
    );
    
    fireEvent.press(getByTestId('recipe-card-edit'));
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDeleteMock = jest.fn();
    const { getByTestId } = render(
      <RecipeCard recipe={mockRecipe} onDelete={onDeleteMock} testID="recipe-card" />
    );
    
    fireEvent.press(getByTestId('recipe-card-delete'));
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('shows View Details button when onPress is provided', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <RecipeCard recipe={mockRecipe} onPress={onPressMock} />
    );
    expect(getByText('View Details')).toBeTruthy();
  });

  it('hides View Details button when onPress is not provided', () => {
    const { queryByText } = render(<RecipeCard recipe={mockRecipe} />);
    expect(queryByText('View Details')).toBeNull();
  });

  it('hides edit button when onEdit is not provided', () => {
    const { queryByTestId } = render(
      <RecipeCard recipe={mockRecipe} testID="recipe-card" />
    );
    expect(queryByTestId('recipe-card-edit')).toBeNull();
  });

  it('hides delete button when onDelete is not provided', () => {
    const { queryByTestId } = render(
      <RecipeCard recipe={mockRecipe} testID="recipe-card" />
    );
    expect(queryByTestId('recipe-card-delete')).toBeNull();
  });

  it('calls View Details button onPress handler', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <RecipeCard recipe={mockRecipe} onPress={onPressMock} testID="recipe-card" />
    );
    
    fireEvent.press(getByTestId('recipe-card-view'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});