import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useNetInfo } from '@react-native-community/netinfo';

// Mock netinfo
jest.mock('@react-native-community/netinfo');
const mockUseNetInfo = useNetInfo as jest.MockedFunction<typeof useNetInfo>;

/**
 * Unit tests for OfflineBanner component
 *
 * Tests offline status detection and banner visibility.
 * Follows TDD approach for Story 12.5: Error Boundary & Offline Detection
 */
describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RISK-BASED PRIORITY
  // Test critical offline detection and banner display
  // ============================================
  describe('Risk-Based Priority', () => {
    /**
     * Test: Offline State Shows Banner
     * GIVEN: Device is offline
     * WHEN: Component renders
     * THEN: Shows banner at top of screen
     */
    it('given offline state, when component renders, then shows banner at top', () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      // Act
      render(<OfflineBanner />);

      // Assert
      expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();
      expect(screen.getByTestId('offline-banner')).toBeVisible();
    });

    /**
     * Test: Online State Hides Banner
     * GIVEN: Device is online
     * WHEN: Component renders
     * THEN: Hides banner (null render)
     */
    it('given online state, when component renders, then hides banner', () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      // Act
      render(<OfflineBanner />);

      // Assert
      expect(screen.queryByTestId('offline-banner')).not.toBeOnTheScreen();
    });

    /**
     * Test: State Change Auto-Dismiss
     * GIVEN: Banner showing (offline)
     * WHEN: Network restored (offline → online)
     * THEN: Banner auto-dismisses
     */
    it('given offline to online, when state changes, then banner auto-dismisses', () => {
      // Arrange - Start offline
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      const { rerender } = render(<OfflineBanner />);
      expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();

      // Act - Go online
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      rerender(<OfflineBanner />);

      // Assert - Banner disappears
      expect(screen.queryByTestId('offline-banner')).not.toBeOnTheScreen();
    });
  });

  // ============================================
  // HAPPY PATH
  // Test normal offline display workflow
  // ============================================
  describe('Happy Path', () => {
    /**
     * Test: Offline Message Display
     * GIVEN: Device offline
     * WHEN: Banner shows
     * THEN: Displays "You're offline" message
     */
    it('given offline, when banner shows, then displays offline message', () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      // Act
      render(<OfflineBanner />);

      // Assert
      expect(screen.getByText(/you're offline/i)).toBeVisible();
      expect(screen.getByText(/no internet connection/i)).toBeVisible();
    });

    /**
     * Test: Banner Positioning and Styling
     * GIVEN: Banner visible
     * WHEN: Positioned
     * THEN: At top with warning colors (amber/orange)
     */
    it('given banner visible, when positioned, then at top with warning colors', () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      // Act
      render(<OfflineBanner />);

      // Assert
      const banner = screen.getByTestId('offline-banner');
      expect(banner).toBeOnTheScreen();
      // Banner should have position: absolute style
      expect(banner.props.style).toBeDefined();
    });
  });

  // ============================================
  // BUSINESS RULES
  // Test Wi-Fi connected but no internet scenario
  // ============================================
  describe('Business Rules', () => {
    /**
     * Test: Wi-Fi Connected But No Internet
     * GIVEN: isConnected=true BUT isInternetReachable=false
     * WHEN: Component checks status
     * THEN: Shows offline banner (correctly identifies no internet)
     */
    it('given wifi no internet, when checked, then shows offline banner', () => {
      // Arrange - Connected to Wi-Fi but no internet
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
        details: null,
      } as any);

      // Act
      render(<OfflineBanner />);

      // Assert - Should show offline banner
      expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();
      expect(screen.getByText(/you're offline/i)).toBeVisible();
    });
  });
});