import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

/**
 * Unit tests for EmptyState component
 *
 * Tests the empty state display component that shows when no data is available.
 * Uses sociable unit testing approach with real child components.
 */
describe('EmptyState', () => {
  describe('Happy Path', () => {

    /**
     * Test: Basic rendering with required props
     * Given: A title prop
     * When: EmptyState renders
     * Then: Displays the title text
     */
    it('given a title prop, when EmptyState renders, then displays the title text', () => {
      // Arrange
      const title = 'No items found';

      // Act
      const { getByText } = render(<EmptyState title={title} />);

      // Assert
      expect(getByText(title)).toBeTruthy();
    });

    /**
     * Test: Full feature rendering
     * Given: All props (title, message, icon, action button)
     * When: EmptyState renders
     * Then: Displays all provided elements
     */
    it('given all props, when EmptyState renders, then displays all provided elements', () => {
      // Arrange
      const props = {
        title: 'No recipes',
        message: 'Start by adding your first recipe',
        icon: 'book-open-variant',
        actionLabel: 'Add Recipe',
        onAction: jest.fn(),
      };

      // Act
      const { getByText } = render(<EmptyState {...props} />);

      // Assert
      expect(getByText(props.title)).toBeTruthy();
      expect(getByText(props.message)).toBeTruthy();
      expect(getByText(props.actionLabel)).toBeTruthy();
      // Note: Icon testing would require checking for the Icon component with the correct prop,
      // but react-native-paper Icon doesn't have testID by default
    });

    /**
     * Test: User interaction with action button
     * Given: An action button with callback
     * When: User clicks the button
     * Then: onAction callback is invoked
     */
    it('given an action button with callback, when user clicks the button, then onAction callback is invoked', () => {
      // Arrange
      const onAction = jest.fn();
      const { getByText } = render(
        <EmptyState
          title="No data"
          actionLabel="Retry"
          onAction={onAction}
        />
      );

      // Act
      fireEvent.press(getByText('Retry'));

      // Assert
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });
});