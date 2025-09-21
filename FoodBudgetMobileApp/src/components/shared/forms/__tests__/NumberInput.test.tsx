import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NumberInput } from '../NumberInput';

describe('NumberInput Component', () => {
  it('renders correctly with label', () => {
    const { getByTestId } = render(
      <NumberInput label="Quantity" value={0} onChangeValue={() => {}} testID="qty-input" />
    );
    expect(getByTestId('qty-input')).toBeTruthy();
  });

  it('displays numeric value correctly', () => {
    const { getByDisplayValue } = render(
      <NumberInput label="Price" value={99.99} onChangeValue={() => {}} />
    );
    expect(getByDisplayValue('99.99')).toBeTruthy();
  });

  it('converts string input to number', () => {
    const onChangeValueMock = jest.fn();
    const { getByTestId } = render(
      <NumberInput 
        label="Amount" 
        value="" 
        onChangeValue={onChangeValueMock}
        testID="number-input"
      />
    );
    
    fireEvent.changeText(getByTestId('number-input'), '42');
    expect(onChangeValueMock).toHaveBeenCalledWith(42);
  });

  it('handles empty input by calling onChangeValue with undefined', () => {
    const onChangeValueMock = jest.fn();
    const { getByTestId } = render(
      <NumberInput 
        label="Amount" 
        value={10} 
        onChangeValue={onChangeValueMock}
        testID="number-input"
      />
    );
    
    fireEvent.changeText(getByTestId('number-input'), '');
    expect(onChangeValueMock).toHaveBeenCalledWith(undefined);
  });

  it('shows validation error for minimum value', () => {
    const { getByTestId, getByText } = render(
      <NumberInput
        label="Servings"
        value={0} // Set to invalid value to show validation error
        onChangeValue={jest.fn()}
        min={1}
        testID="min-input"
      />
    );

    // Validation error should be visible with invalid value
    expect(getByText('Value must be at least 1')).toBeTruthy();
  });

  it('shows validation error for maximum value', () => {
    const { getByTestId, getByText } = render(
      <NumberInput
        label="Servings"
        value={150} // Set to invalid value to show validation error
        onChangeValue={jest.fn()}
        max={100}
        testID="max-input"
      />
    );

    // Validation error should be visible with invalid value
    expect(getByText('Value must be at most 100')).toBeTruthy();
  });

  it('handles integer-only mode', () => {
    const onChangeValueMock = jest.fn();
    const { getByTestId } = render(
      <NumberInput 
        label="Count" 
        value={0} 
        onChangeValue={onChangeValueMock}
        integer
        testID="integer-input"
      />
    );
    
    fireEvent.changeText(getByTestId('integer-input'), '3.14');
    expect(onChangeValueMock).toHaveBeenCalledWith(3);
  });

  it('handles float values when integer is false', () => {
    const onChangeValueMock = jest.fn();
    const { getByTestId } = render(
      <NumberInput 
        label="Price" 
        value={0} 
        onChangeValue={onChangeValueMock}
        integer={false}
        testID="float-input"
      />
    );
    
    fireEvent.changeText(getByTestId('float-input'), '3.14');
    expect(onChangeValueMock).toHaveBeenCalledWith(3.14);
  });

  it('filters out non-numeric characters', () => {
    const onChangeValueMock = jest.fn();
    const { getByTestId } = render(
      <NumberInput 
        label="Number" 
        value={0} 
        onChangeValue={onChangeValueMock}
        testID="filter-input"
      />
    );
    
    fireEvent.changeText(getByTestId('filter-input'), 'abc123def');
    expect(onChangeValueMock).toHaveBeenCalledWith(123);
  });

  it('displays validation error for values below minimum', () => {
    const { getByText } = render(
      <NumberInput 
        label="Age" 
        value={0} 
        onChangeValue={() => {}}
        min={1}
      />
    );
    expect(getByText('Value must be at least 1')).toBeTruthy();
  });

  it('displays validation error for values above maximum', () => {
    const { getByText } = render(
      <NumberInput 
        label="Servings" 
        value={200} 
        onChangeValue={() => {}}
        max={100}
      />
    );
    expect(getByText('Value must be at most 100')).toBeTruthy();
  });

  it('passes through other props to TextInput', () => {
    const { getByTestId } = render(
      <NumberInput 
        label="Disabled Number" 
        value={42} 
        onChangeValue={() => {}}
        disabled
        testID="disabled-number"
      />
    );
    const input = getByTestId('disabled-number');
    expect(input.props.editable).toBe(false);
  });

  it('always uses numeric keyboard', () => {
    const { getByTestId } = render(
      <NumberInput 
        label="Number" 
        value={0} 
        onChangeValue={() => {}}
        testID="keyboard-input"
      />
    );
    const input = getByTestId('keyboard-input');
    expect(input.props.keyboardType).toBe('numeric');
  });
});