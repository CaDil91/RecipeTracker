import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextArea } from '../TextArea';

/**
 * Unit tests for the TextArea component
 *
 * Tests a multiline text input wrapper that configures TextInput for multiline use.
 * Uses sociable testing approach with real TextInput dependency.
 */
describe('TextArea', () => {
  describe('Happy Path', () => {
    /**
     * Test: Default configuration
     * Given: No rows specified
     * When: Component renders
     * Then: Creates multiline TextInput with 4 rows
     */
    it('given no rows specified, when rendered, then creates multiline input with 4 rows', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextArea
          label="Description"
          value=""
          onChangeText={jest.fn()}
          testID="textarea-default"
        />
      );

      // Assert
      const textarea = getByTestId('textarea-default');
      expect(textarea.props.multiline).toBe(true);
      expect(textarea.props.numberOfLines).toBe(4);
    });

    /**
     * Test: Custom rows configuration
     * Given: Custom rows prop
     * When: Component renders
     * Then: Uses specified row count
     */
    it('given custom rows, when rendered, then uses specified row count', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextArea
          label="Long Description"
          value=""
          onChangeText={jest.fn()}
          rows={6}
          testID="textarea-custom"
        />
      );

      // Assert
      const textarea = getByTestId('textarea-custom');
      expect(textarea.props.multiline).toBe(true);
      expect(textarea.props.numberOfLines).toBe(6);
    });

    /**
     * Test: User input handling
     * Given: Change handler
     * When: User types text
     * Then: Calls onChangeText with new value
     */
    it('given change handler, when user types, then calls onChangeText', () => {
      // Arrange
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <TextArea
          label="Comments"
          value=""
          onChangeText={onChangeText}
          testID="textarea-input"
        />
      );

      // Act
      fireEvent.changeText(getByTestId('textarea-input'), 'Multi\nline\ntext');

      // Assert
      expect(onChangeText).toHaveBeenCalledWith('Multi\nline\ntext');
    });
  });

  describe('Props Pass-through', () => {
    /**
     * Test: Standard TextInput props
     * Given: Standard TextInput props (label, value, error, helperText)
     * When: Component renders
     * Then: Passes all props to TextInput
     */
    it('given standard TextInput props, when rendered, then passes props correctly', () => {
      // Arrange & Act
      const { getAllByText, getByDisplayValue, getByText } = render(
        <TextArea
          label="Feedback"
          value="Initial text"
          onChangeText={jest.fn()}
          error="Field is required"
          helperText="Please provide detailed feedback"
          placeholder="Enter your feedback..."
        />
      );

      // Assert
      const feedbackLabels = getAllByText('Feedback');
      expect(feedbackLabels.length).toBeGreaterThan(0);
      expect(getByDisplayValue('Initial text')).toBeTruthy();
      expect(getByText('Field is required')).toBeTruthy();
    });

    /**
     * Test: Additional TextInput props
     * Given: Disabled and maxLength props
     * When: Component renders
     * Then: Passes configuration props to TextInput
     */
    it('given disabled and maxLength props, when rendered, then passes configuration correctly', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <TextArea
          label="Limited Text"
          value=""
          onChangeText={jest.fn()}
          disabled
          maxLength={500}
          testID="textarea-config"
        />
      );

      // Assert
      const textarea = getByTestId('textarea-config');
      expect(textarea.props.editable).toBe(false);
      expect(textarea.props.maxLength).toBe(500);
    });
  });
});