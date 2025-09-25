import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';

/**
 * Unit tests for the TextInput component
 *
 * Tests text input wrapper with error handling and helper text display.
 * Uses sociable testing approach with real React Native Paper components.
 */
describe('TextInput', () => {
  describe('Happy Path', () => {
    /**
     * Test: Basic rendering
     * Given: Required props (label, value, onChangeText)
     * When: Component renders
     * Then: Displays input with label
     */
    it('given required props, when rendered, then displays input with label', () => {
      // Arrange & Act
      const { getAllByText } = render(
        <TextInput label="Name" value="" onChangeText={jest.fn()} />
      );

      // Assert
      const labelElements = getAllByText('Name');
      expect(labelElements.length).toBeGreaterThan(0);
    });

    /**
     * Test: User input handling
     * Given: Value and change handler
     * When: User types text
     * Then: Calls onChangeText with new value
     */
    it('given change handler, when user types, then calls onChangeText', () => {
      // Arrange
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <TextInput
          label="Input"
          value=""
          onChangeText={onChangeText}
          testID="test-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('test-input'), 'new text');

      // Assert
      expect(onChangeText).toHaveBeenCalledWith('new text');
    });

    /**
     * Test: Multiline configuration
     * Given: Multiline props
     * When: Component renders
     * Then: Renders multiline input
     */
    it('given multiline props, when rendered, then creates multiline input', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextInput
          label="Description"
          value=""
          onChangeText={jest.fn()}
          multiline
          numberOfLines={4}
          testID="multiline-input"
        />
      );

      // Assert
      const input = getByTestId('multiline-input');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  describe('Error Handling', () => {
    /**
     * Test: String error display
     * Given: String error message
     * When: Component renders
     * Then: Shows an error message
     */
    it('given string error, when rendered, then shows error message', () => {
      // Arrange & Act
      const { getByText } = render(
        <TextInput
          label="Field"
          value=""
          onChangeText={jest.fn()}
          error="This field is required"
        />
      );

      // Assert
      expect(getByText('This field is required')).toBeTruthy();
    });

    /**
     * Test: FieldError object handling
     * Given: FieldError object with message
     * When: Component renders
     * Then: Shows error.message
     */
    it('given FieldError object, when rendered, then shows error message', () => {
      // Arrange
      const fieldError = { message: 'Invalid email format', type: 'pattern' };

      // Act
      const { getByText } = render(
        <TextInput
          label="Email"
          value=""
          onChangeText={jest.fn()}
          error={fieldError as any}
        />
      );

      // Assert
      expect(getByText('Invalid email format')).toBeTruthy();
    });

    /**
     * Test: Error state styling
     * Given: Any error (string or object)
     * When: Component renders
     * Then: Input shows error state (verified by error message display)
     */
    it('given error present, when rendered, then shows error state', () => {
      // Arrange & Act
      const { getByText } = render(
        <TextInput
          label="Field"
          value=""
          onChangeText={jest.fn()}
          error="Error message"
          testID="error-input"
        />
      );

      // Assert - Error state is indicated by an error message being displayed
      expect(getByText('Error message')).toBeTruthy();
    });
  });

  describe('Helper Text', () => {
    /**
     * Test: Helper text display
     * Given: Helper text without error
     * When: Component renders
     * Then: Shows info helper text
     */
    it('given helper text only, when rendered, then shows info helper', () => {
      // Arrange & Act
      const { getByText } = render(
        <TextInput
          label="Password"
          value=""
          onChangeText={jest.fn()}
          helperText="Must be at least 8 characters"
        />
      );

      // Assert
      expect(getByText('Must be at least 8 characters')).toBeTruthy();
    });

    /**
     * Test: Error precedence over helper text
     * Given: Both error and helper text
     * When: Component renders
     * Then: Error message takes precedence
     */
    it('given both error and helper text, when rendered, then error takes precedence', () => {
      // Arrange & Act
      const { getByText, queryByText } = render(
        <TextInput
          label="Field"
          value=""
          onChangeText={jest.fn()}
          error="Error occurred"
          helperText="This is helper text"
        />
      );

      // Assert
      expect(getByText('Error occurred')).toBeTruthy();
      expect(queryByText('This is helper text')).toBeNull();
    });
  });

  describe('Event Handlers', () => {
    /**
     * Test: Focus event handling
     * Given: onFocus handler
     * When: Input gains focus
     * Then: Calls onFocus callback
     */
    it('given onFocus handler, when input gains focus, then calls handler', () => {
      // Arrange
      const onFocus = jest.fn();
      const { getByTestId } = render(
        <TextInput
          label="Input"
          value=""
          onChangeText={jest.fn()}
          onFocus={onFocus}
          testID="focus-input"
        />
      );

      // Act
      fireEvent(getByTestId('focus-input'), 'focus');

      // Assert
      expect(onFocus).toHaveBeenCalled();
    });

    /**
     * Test: Blur event handling
     * Given: onBlur handler
     * When: Input loses focus
     * Then: Calls onBlur callback
     */
    it('given onBlur handler, when input loses focus, then calls handler', () => {
      // Arrange
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <TextInput
          label="Input"
          value=""
          onChangeText={jest.fn()}
          onBlur={onBlur}
          testID="blur-input"
        />
      );

      // Act
      fireEvent(getByTestId('blur-input'), 'blur');

      // Assert
      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Disabled state
     * Given: disabled prop
     * When: Component renders
     * Then: Input is disabled
     */
    it('given disabled prop, when rendered, then input is disabled', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextInput
          label="Disabled"
          value=""
          onChangeText={jest.fn()}
          disabled
          testID="disabled-input"
        />
      );

      // Assert
      const input = getByTestId('disabled-input');
      expect(input.props.editable).toBe(false);
    });

    /**
     * Test: Secure text entry
     * Given: secureTextEntry prop
     * When: Component renders
     * Then: Obscures text input
     */
    it('given secureTextEntry, when rendered, then obscures text', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextInput
          label="Password"
          value=""
          onChangeText={jest.fn()}
          secureTextEntry
          testID="password-input"
        />
      );

      // Assert
      const input = getByTestId('password-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    /**
     * Test: Max length constraint
     * Given: maxLength prop
     * When: Component renders
     * Then: Limits character input
     */
    it('given maxLength prop, when rendered, then limits characters', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextInput
          label="Limited"
          value=""
          onChangeText={jest.fn()}
          maxLength={10}
          testID="limited-input"
        />
      );

      // Assert
      const input = getByTestId('limited-input');
      expect(input.props.maxLength).toBe(10);
    });

    /**
     * Test: Keyboard type configuration
     * Given: keyboardType prop
     * When: Component renders
     * Then: Uses specified keyboard
     */
    it('given keyboardType prop, when rendered, then uses correct keyboard', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextInput
          label="Phone"
          value=""
          onChangeText={jest.fn()}
          keyboardType="phone-pad"
          testID="phone-input"
        />
      );

      // Assert
      const input = getByTestId('phone-input');
      expect(input.props.keyboardType).toBe('phone-pad');
    });
  });
});