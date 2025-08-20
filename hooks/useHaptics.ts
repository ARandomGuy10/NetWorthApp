import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useProfile } from './useProfile';

export const useHaptics = () => {
  const { data: profile } = useProfile();

  const hapticsEnabled = profile?.haptic_feedback_enabled ?? true; // Default to true if profile not loaded or for guests

  const impactAsync = useCallback(
    (style: Haptics.ImpactFeedbackStyle) => {
      if (hapticsEnabled) {
        Haptics.impactAsync(style);
      }
    },
    [hapticsEnabled]
  );

  const notificationAsync = useCallback(
    (type: Haptics.NotificationFeedbackType) => {
      if (hapticsEnabled) {
        Haptics.notificationAsync(type);
      }
    },
    [hapticsEnabled]
  );

  const selectionAsync = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.selectionAsync();
    }
  }, [hapticsEnabled]);

  return { impactAsync, notificationAsync, selectionAsync };
};