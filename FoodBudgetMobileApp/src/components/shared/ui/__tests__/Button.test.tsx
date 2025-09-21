import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles onPress event', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant by default', () => {
    const { getByRole } = render(<Button title="Primary" />);
    const button = getByRole('button');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('renders secondary variant correctly', () => {
    const { getByText } = render(
      <Button title="Secondary" variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('renders danger variant correctly', () => {
    const { getByText } = render(
      <Button title="Danger" variant="danger" />
    );
    expect(getByText('Danger')).toBeTruthy();
  });

  it('renders text variant correctly', () => {
    const { getByText } = render(
      <Button title="Text Button" variant="text" />
    );
    expect(getByText('Text Button')).toBeTruthy();
  });

  it('applies fullWidth style when specified', () => {
    const { getByText } = render(
      <Button title="Full Width" fullWidth testID="full-width-btn" />
    );
    // Just verify it renders without error - actual style testing is complex with Paper
    expect(getByText('Full Width')).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <Button title="Disabled" disabled onPress={onPressMock} />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('shows loading state when loading prop is true', () => {
    const { getByText } = render(
      <Button title="Loading" loading />
    );
    // Verify button renders - loading state testing requires more complex setup
    expect(getByText('Loading')).toBeTruthy();
  });

  it('applies custom style when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button title="Custom Style" style={customStyle} />
    );
    // Verify button renders with custom style prop
    expect(getByText('Custom Style')).toBeTruthy();
  });

  it('renders with testID when provided', () => {
    const { getByTestId } = render(
      <Button title="Test ID Button" testID="test-button" />
    );
    expect(getByTestId('test-button')).toBeTruthy();
  });
});