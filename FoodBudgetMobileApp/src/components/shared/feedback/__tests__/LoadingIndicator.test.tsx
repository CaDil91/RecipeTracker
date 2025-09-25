import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingIndicator } from '../LoadingIndicator';

/**
 * Unit tests for LoadingIndicator component
 *
 * Tests the loading state display component.
 * Simple presentation component with minimal logic.
 */
describe('LoadingIndicator', () => {
  describe('Happy Path', () => {
    /**
     * Test: Default rendering
     * Given: No props
     * When: LoadingIndicator renders
     * Then: Shows default spinner (large, inline, no message)
     */
    it('given no props, when LoadingIndicator renders, then shows default spinner', () => {
      // Arrange
      // No setup needed for default props

      // Act
      const { getByRole, queryByText } = render(<LoadingIndicator />);

      // Assert
      const spinner = getByRole('progressbar');
      expect(spinner).toBeTruthy();
      expect(queryByText(/.+/)).toBeNull(); // No message should be shown
    });

    /**
     * Test: Full configuration
     * Given: All props (size, message, fullScreen, style)
     * When: LoadingIndicator renders
     * Then: Shows configured spinner with a message
     */
    it('given all props, when LoadingIndicator renders, then shows configured spinner with message', () => {
      // Arrange
      const props = {
        size: 'small' as const,
        message: 'Loading recipes...',
        fullScreen: true,
        style: { backgroundColor: 'red' }
      };

      // Act
      const { getByRole, getByText } = render(<LoadingIndicator {...props} />);

      // Assert
      const spinner = getByRole('progressbar');
      expect(spinner).toBeTruthy();
      expect(getByText('Loading recipes...')).toBeTruthy();
    });
  });
});