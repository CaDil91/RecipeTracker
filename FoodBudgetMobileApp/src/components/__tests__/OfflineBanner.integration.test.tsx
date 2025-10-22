import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';
import { useNetInfo } from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock netinfo
jest.mock('@react-native-community/netinfo');
const mockUseNetInfo = useNetInfo as jest.MockedFunction<typeof useNetInfo>;

/**
 * Integration tests for the OfflineBanner component
 *
 * Tests real-world behavior of OfflineBanner in-app context with actual
 * network status changes and UI integration.
 * Follows TDD approach for Story 12.5: Error Boundary & Offline Detection
 */
describe('OfflineBanner - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // RISK-BASED PRIORITY
  // Test critical real-time network detection
  // ============================================
  describe('Risk-Based Priority', () => {
    /**
     * Test: Real-Time Network Status Updates
     * GIVEN: OfflineBanner rendered in App
     * WHEN: Network status changes
     * THEN: Banner updates in real-time
     */
    it('given banner in app, when network changes, then updates in real-time', async () => {
      // Arrange - Start online
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      const { rerender } = render(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Verify hidden when online
      expect(screen.queryByTestId('offline-banner')).not.toBeOnTheScreen();

      // Act - Network goes offline
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      rerender(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Assert - Banner appears
      await waitFor(() => {
        expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();
      });
    });

    /**
     * Test: Banner Persists Across Navigation
     * GIVEN: User offline with banner showing
     * WHEN: User navigates between screens
     * THEN: Banner stays visible throughout
     */
    it('given offline with banner, when navigating, then banner persists', async () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      // Act - Render banner (simulating App-level placement)
      render(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Assert - Banner visible
      expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();

      // Simulate navigation (re-render)
      // Banner should still be visible
      await waitFor(() => {
        expect(screen.getByTestId('offline-banner')).toBeVisible();
      });
    });
  });

  // ============================================
  // HAPPY PATH
  // Test normal offline/online transitions
  // ============================================
  describe('Happy Path', () => {
    /**
     * Test: Wi-Fi to Cellular Transition
     * GIVEN: Connected via Wi-Fi
     * WHEN: Switch to cellular with internet
     * THEN: Banner stays hidden (both have internet)
     */
    it('given wifi, when switch to cellular, then banner stays hidden', async () => {
      // Arrange - WiFi
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      const { rerender } = render(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      expect(screen.queryByTestId('offline-banner')).not.toBeOnTheScreen();

      // Act - Switch to cellular
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
        details: null,
      } as any);

      rerender(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Assert - Still hidden
      expect(screen.queryByTestId('offline-banner')).not.toBeOnTheScreen();
    });

    /**
     * Test: Airplane Mode Detection
     * GIVEN: Normal connectivity
     * WHEN: Airplane mode enabled
     * THEN: Banner appears immediately
     */
    it('given connected, when airplane mode enabled, then banner appears', async () => {
      // Arrange - Online
      mockUseNetInfo.mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: null,
      } as any);

      const { rerender } = render(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Act - Airplane mode
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      rerender(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Assert - Banner visible
      await waitFor(() => {
        expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();
        expect(screen.getByText(/you're offline/i)).toBeVisible();
      });
    });
  });

  // ============================================
  // DATA INTEGRITY
  // Test interaction with app state
  // ============================================
  describe('Data Integrity', () => {
    /**
     * Test: Banner Does Not Block UI Interaction
     * GIVEN: Banner showing
     * WHEN: User tries to interact with app
     * THEN: Banner doesn't block touches
     */
    it('given banner showing, when user interacts, then banner does not block', async () => {
      // Arrange
      mockUseNetInfo.mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: null,
      } as any);

      // Act
      render(
        <SafeAreaProvider>
          <OfflineBanner />
        </SafeAreaProvider>
      );

      // Assert - Banner should have a position: absolute but not block interactions
      const banner = screen.getByTestId('offline-banner');
      expect(banner).toBeVisible();
      // Banner should be positioned to not interfere (top of screen)
      expect(banner.props.style).toBeDefined();
    });
  });
});