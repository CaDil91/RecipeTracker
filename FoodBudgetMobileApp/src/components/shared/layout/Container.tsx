import React from 'react';
import { View, ScrollView, ViewStyle, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Surface, useTheme } from 'react-native-paper';

export interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  useSafeArea?: boolean;
  surface?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  scrollable = false,
  padded = true,
  useSafeArea = true,
  surface = false,
  style,
  testID,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(useSafeArea && {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }),
    ...(padded && { padding: 16 }),
    ...style,
  };

  const Wrapper = surface ? Surface : View;
  
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.scrollContent, containerStyle]}
        testID={testID}
        showsVerticalScrollIndicator={false}
      >
        {surface ? (
          <Surface style={styles.flex}>
            {children}
          </Surface>
        ) : (
          children
        )}
      </ScrollView>
    );
  }

  return (
    <Wrapper style={containerStyle} testID={testID}>
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
});