import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';
import { PaperProvider } from 'react-native-paper';

// Mock expo icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: function MockIcon({ name }: { name: string }) {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    placeholder: 'Search...',
  };

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<PaperProvider>{component}</PaperProvider>);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = renderWithTheme(
      <SearchBar {...defaultProps} />
    );

    expect(getByTestId('search-bar')).toBeTruthy();
    expect(getByTestId('search-bar-container')).toBeTruthy();
    expect(getByTestId('icon-magnify')).toBeTruthy();
  });

  it('displays placeholder text', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <SearchBar {...defaultProps} placeholder="Search recipes..." />
    );

    expect(getByPlaceholderText('Search recipes...')).toBeTruthy();
  });

  it('calls onChangeText when text is entered', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SearchBar {...defaultProps} onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByTestId('search-bar'), 'pasta');
    expect(onChangeText).toHaveBeenCalledWith('pasta');
  });

  it('displays clear button when value is present', () => {
    const { getByTestId, queryByTestId, rerender } = renderWithTheme(
      <SearchBar {...defaultProps} value="" />
    );

    // No clear button when empty
    expect(queryByTestId('search-bar-clear')).toBeNull();

    // Clear button appears when value is present
    rerender(
      <PaperProvider>
        <SearchBar {...defaultProps} value="test" />
      </PaperProvider>
    );
    expect(getByTestId('search-bar-clear')).toBeTruthy();
  });

  it('clears text when clear button is pressed', () => {
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SearchBar
        {...defaultProps}
        value="test"
        onChangeText={onChangeText}
        onClear={onClear}
      />
    );

    fireEvent.press(getByTestId('search-bar-clear'));
    expect(onChangeText).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('handles focus and blur events', () => {
    const { getByTestId } = renderWithTheme(
      <SearchBar {...defaultProps} />
    );

    const input = getByTestId('search-bar');

    // Test focus
    fireEvent(input, 'focus');
    // Component should handle focus state internally

    // Test blur
    fireEvent(input, 'blur');
    // Component should handle blur state internally
  });

  it('uses custom testID when provided', () => {
    const { getByTestId } = renderWithTheme(
      <SearchBar {...defaultProps} testID="custom-search" />
    );

    expect(getByTestId('custom-search')).toBeTruthy();
    expect(getByTestId('custom-search-container')).toBeTruthy();
  });

  it('updates value when prop changes', () => {
    const { getByTestId, rerender } = renderWithTheme(
      <SearchBar {...defaultProps} value="initial" />
    );

    const input = getByTestId('search-bar');
    expect(input.props.value).toBe('initial');

    rerender(
      <PaperProvider>
        <SearchBar {...defaultProps} value="updated" />
      </PaperProvider>
    );

    expect(input.props.value).toBe('updated');
  });

  it('does not call onClear if not provided', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SearchBar
        value="test"
        onChangeText={onChangeText}
        placeholder="Search..."
      />
    );

    fireEvent.press(getByTestId('search-bar-clear'));
    expect(onChangeText).toHaveBeenCalledWith('');
    // Should not throw error even if onClear is not provided
  });

  it('sets correct keyboard properties', () => {
    const { getByTestId } = renderWithTheme(
      <SearchBar {...defaultProps} />
    );

    const input = getByTestId('search-bar');
    expect(input.props.returnKeyType).toBe('search');
    expect(input.props.autoCorrect).toBe(false);
    expect(input.props.autoCapitalize).toBe('none');
  });
});