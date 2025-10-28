import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

/**
 * useEditableHaptics - Reusable haptic feedback hooks for editable components
 *
 * Provides standardized haptic feedback patterns for interactive UI elements.
 * Uses expo-haptics for native haptic feedback on iOS and Android.
 *
 * Haptic Patterns:
 * - Light: For focus events, small interactions (taps, selections)
 * - Medium: For value changes, deletions, confirmations
 * - Heavy: For significant actions (not currently used)
 *
 * @returns Object with haptic feedback functions
 *
 * @example
 * ```tsx
 * const EditableComponent = () => {
 *   const { triggerLight, triggerMedium } = useEditableHaptics();
 *
 *   const handleFocus = async () => {
 *     await triggerLight();
 *     // ... focus logic
 *   };
 *
 *   const handleDelete = async () => {
 *     await triggerMedium();
 *     // ... delete logic
 *   };
 *
 *   return <TextInput onFocus={handleFocus} />;
 * };
 * ```
 */
export const useEditableHaptics = () => {
  /**
   * Light haptic feedback for subtle interactions
   * Use for: focus, tap, selection, increment/decrement
   */
  const triggerLight = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  /**
   * Medium haptic feedback for more significant interactions
   * Use for: delete, confirm, value reset
   */
  const triggerMedium = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  /**
   * Heavy haptic feedback for major interactions
   * Use for: errors, warnings, critical actions
   */
  const triggerHeavy = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
  };
};
