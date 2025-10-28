import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface WebContainerProps {
  children: ReactNode;
}

/**
 * WebContainer - Constrains the app to a phone-like aspect ratio on the desktop web
 * while maintaining full-screen on mobile devices and native platforms.
 *
 * Modern approach for demo/portfolio pages showing mobile apps on the web.
 */
export default function WebContainer({ children }: WebContainerProps) {
  const { width} = useWindowDimensions();

  // Only apply constraints on web platform for desktop sizes
  const isDesktopWeb = Platform.OS === 'web' && width >= 768;

  if (!isDesktopWeb) {
    // Mobile or native: use full screen
    return <View style={styles.fullScreen}>{children}</View>;
  }

  // Desktop web: constrain to phone-like dimensions
  return (
    <View style={styles.desktopContainer}>
      <View style={styles.phoneFrame}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  desktopContainer: {
    flex: 1,
    backgroundColor: '#2B2832',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 428, // iPhone 14 Pro Max width
    height: '100%',
    maxHeight: 926, // iPhone 14 Pro Max height
    backgroundColor: '#ffffff',
    borderRadius: 20,
    // Note: overflow removed to allow Portal dialogs to render above the frame
    // Modern shadow for depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12, // Android shadow
  },
});
