import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NumberInput } from '../NumberInput';

/**
 * Unit tests for NumberInput component
 *
 * Tests numeric input handling with parsing, validation, and formatting.
 * Uses sociable testing approach with real TextInput dependency.
 */
describe('NumberInput', () => {
  describe('Happy Path', () => {
    /**
     * Test: Valid number input
     * Given: A valid number string
     * When: User types the number
     * Then: Calls onChangeValue with parsed number
     */
    it('given valid number string, when user types, then calls onChangeValue with parsed number', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Amount"
          value=""
          onChangeValue={onChangeValue}
          testID="number-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('number-input'), '42');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(42);
    });

    /**
     * Test: Float mode decimal handling
     * Given: Float mode (integer=false)
     * When: User types decimal number
     * Then: Returns float value
     */
    it('given float mode, when user types decimal, then returns float value', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Price"
          value={0}
          onChangeValue={onChangeValue}
          integer={false}
          testID="float-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('float-input'), '3.14');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(3.14);
    });

    /**
     * Test: Integer mode decimal handling
     * Given: Integer mode (integer=true)
     * When: User types decimal number
     * Then: Returns integer value (truncated)
     */
    it('given integer mode, when user types decimal, then returns integer value', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Count"
          value={0}
          onChangeValue={onChangeValue}
          integer={true}
          testID="integer-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('integer-input'), '3.14');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(3);
    });
  });

  describe('Null/Empty/Invalid Input', () => {
    /**
     * Test: Empty input handling
     * Given: Existing value
     * When: User clears input
     * Then: Calls onChangeValue with undefined
     */
    it('given existing value, when input cleared, then calls onChangeValue with undefined', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Amount"
          value={10}
          onChangeValue={onChangeValue}
          testID="number-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('number-input'), '');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(undefined);
    });

    /**
     * Test: Invalid character filtering
     * Given: Input with letters
     * When: User types mixed alphanumeric
     * Then: Filters out letters, keeps numbers
     */
    it('given letters in input, when typed, then filters them out', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Number"
          value={0}
          onChangeValue={onChangeValue}
          testID="filter-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('filter-input'), 'abc123def');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(123);
    });

    /**
     * Test: Negative number handling
     * Given: Negative number input
     * When: User types negative number
     * Then: Accepts and parses negative value
     */
    it('given negative number, when typed, then handles correctly', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Temperature"
          value={0}
          onChangeValue={onChangeValue}
          testID="negative-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('negative-input'), '-25');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(-25);
    });

    /**
     * Test: Multiple decimal points
     * Given: Input with multiple decimals
     * When: User types number with multiple dots
     * Then: Parses up to first decimal
     */
    it('given multiple decimals, when typed, then handles gracefully', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Amount"
          value={0}
          onChangeValue={onChangeValue}
          testID="decimal-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('decimal-input'), '3.14.159');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(3.14);
    });
  });

  describe('Boundary Validation', () => {
    /**
     * Test: Minimum boundary validation
     * Given: Value below minimum
     * When: Component renders
     * Then: Shows an error message
     */
    it('given value below min, when rendered, then shows error message', () => {
      // Arrange & Act
      const { getByText } = render(
        <NumberInput
          label="Age"
          value={0}
          onChangeValue={jest.fn()}
          min={1}
        />
      );

      // Assert
      expect(getByText('Value must be at least 1')).toBeTruthy();
    });

    /**
     * Test: Maximum boundary validation
     * Given: Value above maximum
     * When: Component renders
     * Then: Shows an error message
     */
    it('given value above max, when rendered, then shows error message', () => {
      // Arrange & Act
      const { getByText } = render(
        <NumberInput
          label="Servings"
          value={150}
          onChangeValue={jest.fn()}
          max={100}
        />
      );

      // Assert
      expect(getByText('Value must be at most 100')).toBeTruthy();
    });

    /**
     * Test: Valid boundary values
     * Given: Value at exact min boundary
     * When: Component renders
     * Then: No error shown
     */
    it('given value at exact min, when rendered, then no error', () => {
      // Arrange & Act
      const { queryByText } = render(
        <NumberInput
          label="Count"
          value={1}
          onChangeValue={jest.fn()}
          min={1}
        />
      );

      // Assert
      expect(queryByText(/Value must be/)).toBeNull();
    });

    /**
     * Test: Valid boundary values
     * Given: Value at exact max boundary
     * When: Component renders
     * Then: No error shown
     */
    it('given value at exact max, when rendered, then no error', () => {
      // Arrange & Act
      const { queryByText } = render(
        <NumberInput
          label="Count"
          value={100}
          onChangeValue={jest.fn()}
          max={100}
        />
      );

      // Assert
      expect(queryByText(/Value must be/)).toBeNull();
    });
  });

  describe('Business Rules', () => {
    /**
     * Test: Custom error preservation
     * Given: Custom error prop
     * When: Validation would pass
     * Then: Preserves custom error over validation
     */
    it('given custom error prop, when validation passes, then preserves custom error', () => {
      // Arrange & Act
      const { getByText } = render(
        <NumberInput
          label="Amount"
          value={50}
          onChangeValue={jest.fn()}
          min={0}
          max={100}
          error="Custom error message"
        />
      );

      // Assert
      expect(getByText('Custom error message')).toBeTruthy();
    });

    /**
     * Test: Numeric keyboard enforcement
     * Given: Any NumberInput
     * When: Component renders
     * Then: Always uses numeric keyboard
     */
    it('given any configuration, when rendered, then uses numeric keyboard', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <NumberInput
          label="Number"
          value={0}
          onChangeValue={jest.fn()}
          testID="keyboard-input"
        />
      );

      // Assert
      const input = getByTestId('keyboard-input');
      expect(input.props.keyboardType).toBe('numeric');
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Dash only input
     * Given: Just a dash character
     * When: User types only "-"
     * Then: Does not call onChangeValue (not a valid number yet)
     */
    it('given dash only, when typed, then handles gracefully', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Number"
          value={0}
          onChangeValue={onChangeValue}
          testID="dash-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('dash-input'), '-');

      // Assert
      expect(onChangeValue).not.toHaveBeenCalled();
    });

    /**
     * Test: Dot only input
     * Given: Just a dot character
     * When: User types only "."
     * Then: Does not call onChangeValue (not a valid number yet)
     */
    it('given dot only, when typed, then handles gracefully', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Number"
          value={0}
          onChangeValue={onChangeValue}
          testID="dot-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('dot-input'), '.');

      // Assert
      expect(onChangeValue).not.toHaveBeenCalled();
    });

    /**
     * Test: Leading zeros handling
     * Given: Number with leading zeros
     * When: User types "007"
     * Then: Parses as 7
     */
    it('given leading zeros, when typed, then parses correctly', () => {
      // Arrange
      const onChangeValue = jest.fn();
      const { getByTestId } = render(
        <NumberInput
          label="Number"
          value={0}
          onChangeValue={onChangeValue}
          testID="zero-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('zero-input'), '007');

      // Assert
      expect(onChangeValue).toHaveBeenCalledWith(7);
    });
  });
});