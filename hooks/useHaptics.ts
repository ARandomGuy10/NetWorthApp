import { useCallback } from 'react';

import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../stores/settingsStore';

export const useHaptics = () => {
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);

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