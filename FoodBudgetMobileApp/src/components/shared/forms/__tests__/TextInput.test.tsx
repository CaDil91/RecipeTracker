import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';

describe('TextInput Component', () => {
  it('renders correctly with label', () => {
    const { getAllByText } = render(
      <TextInput label="Name" value="" onChangeText={() => {}} />
    );
    const labelElements = getAllByText('Name');
    expect(labelElements.length).toBeGreaterThan(0);
  });

  it('displays the value correctly', () => {
    const { getByDisplayValue } = render(
      <TextInput label="Email" value="test@example.com" onChangeText={() => {}} />
    );
    expect(getByDisplayValue('test@example.com')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByTestId } = render(
      <TextInput 
        label="Input" 
        value="" 
        onChangeText={onChangeTextMock}
        testID="test-input"
      />
    );
    
    fireEvent.changeText(getByTestId('test-input'), 'new text');
    expect(onChangeTextMock).toHaveBeenCalledWith('new text');
  });

  it('displays error message when error is provided', () => {
    const { getByText } = render(
      <TextInput 
        label="Field" 
        value="" 
        onChangeText={() => {}}
        error="This field is required"
      />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('displays error from FieldError object', () => {
    const fieldError = { message: 'Invalid email format', type: 'pattern' };
    const { getByText } = render(
      <TextInput 
        label="Email" 
        value="" 
        onChangeText={() => {}}
        error={fieldError as any}
      />
    );
    expect(getByText('Invalid email format')).toBeTruthy();
  });

  it('displays helper text when provided', () => {
    const { getByText } = render(
      <TextInput 
        label="Password" 
        value="" 
        onChangeText={() => {}}
        helperText="Must be at least 8 characters"
      />
    );
    expect(getByText('Must be at least 8 characters')).toBeTruthy();
  });

  it('renders as multiline when specified', () => {
    const { getByTestId } = render(
      <TextInput 
        label="Description" 
        value="" 
        onChangeText={() => {}}
        multiline
        numberOfLines={4}
        testID="multiline-input"
      />
    );
    const input = getByTestId('multiline-input');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it('disables input when disabled prop is true', () => {
    const { getByTestId } = render(
      <TextInput 
        label="Disabled" 
        value="" 
        onChangeText={() => {}}
        disabled
        testID="disabled-input"
      />
    );
    const input = getByTestId('disabled-input');
    expect(input.props.editable).toBe(false);
  });

  it('renders with secure text entry for passwords', () => {
    const { getByTestId } = render(
      <TextInput 
        label="Password" 
        value="" 
        onChangeText={() => {}}
        secureTextEntry
        testID="password-input"
      />
    );
    const input = getByTestId('password-input');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('sets correct keyboard type', () => {
    const { getByTestId } = render(
      <TextInput 
        label="Phone" 
        value="" 
        onChangeText={() => {}}
        keyboardType="phone-pad"
        testID="phone-input"
      />
    );
    const input = getByTestId('phone-input');
    expect(input.props.keyboardType).toBe('phone-pad');
  });

  it('calls onBlur and onFocus handlers', () => {
    const onBlurMock = jest.fn();
    const onFocusMock = jest.fn();
    const { getByTestId } = render(
      <TextInput 
        label="Input" 
        value="" 
        onChangeText={() => {}}
        onBlur={onBlurMock}
        onFocus={onFocusMock}
        testID="focus-input"
      />
    );
    
    const input = getByTestId('focus-input');
    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();
    
    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });

  it('respects maxLength property', () => {
    const { getByTestId } = render(
      <TextInput 
        label="Limited" 
        value="" 
        onChangeText={() => {}}
        maxLength={10}
        testID="limited-input"
      />
    );
    const input = getByTestId('limited-input');
    expect(input.props.maxLength).toBe(10);
  });
});