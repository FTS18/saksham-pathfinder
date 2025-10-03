import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification';

interface HapticOptions {
  enabled?: boolean;
  fallback?: boolean;
}

export const useHaptic = (options: HapticOptions = {}) => {
  const { enabled = true, fallback = true } = options;

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (!enabled) return;

    // Check if device supports haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [5],
        impact: [15],
        notification: [10, 50, 10]
      };

      navigator.vibrate(patterns[type]);
    } else if (fallback) {
      // Fallback for devices without haptic support
      console.log(`Haptic feedback: ${type}`);
    }
  }, [enabled, fallback]);

  const success = useCallback(() => triggerHaptic('notification'), [triggerHaptic]);
  const error = useCallback(() => triggerHaptic('heavy'), [triggerHaptic]);
  const warning = useCallback(() => triggerHaptic('medium'), [triggerHaptic]);
  const selection = useCallback(() => triggerHaptic('selection'), [triggerHaptic]);
  const impact = useCallback(() => triggerHaptic('impact'), [triggerHaptic]);

  return {
    triggerHaptic,
    success,
    error,
    warning,
    selection,
    impact
  };
};