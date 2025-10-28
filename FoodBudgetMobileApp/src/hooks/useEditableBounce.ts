import {useEffect} from 'react';
import {useAnimatedStyle, useSharedValue, withSequence, withSpring} from 'react-native-reanimated';

/**
 * useEditableBounce - Reusable bounce animation hook for editable components
 *
 * Provides a subtle bounce animation on the component mount to indicate editability.
 * Uses react-native-reanimated for 60 fps animations on the UI thread.
 *
 * Animation sequence:
 * 1. Scale from 1.0 → 1.05 (expand)
 * 2. Scale from 1.05 → 1.0 (contract back to normal)
 *
 * Spring configuration:
 * - damping: 8-10 (lower = more bounce)
 * - stiffness: 100 (controls animation speed)
 *
 * @returns animatedStyle object to spread into Animated.View style prop
 *
 * @example
 * ```tsx
 * const EditableComponent = () => {
 *   const bounceStyle = useEditableBounce();
 *
 *   return (* <Animated.View style={bounceStyle}>
 *       <Text>Editable content</Text>
 *     </Animated.View> *);
 * };
 * ```
 */
export const useEditableBounce = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Bounce animation: 1.0 → 1.05 → 1.0
    scale.value = withSequence(
      withSpring(1.05, { damping: 8, stiffness: 100 }),
      withSpring(1.0, { damping: 10, stiffness: 100 })
    );
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));
};
