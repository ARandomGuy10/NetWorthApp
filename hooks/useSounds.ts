import { useCallback } from 'react';
import { Audio } from 'expo-av';
import { useProfile } from './useProfile';

// Define sound types for type safety and easy management
export type SoundType = 'success' | 'error' | 'tap_light';

// A map to your sound files. You will need to add these sound files
// to your project, for example in an `assets/sounds/` directory.
const soundFiles: Record<SoundType, any> = {
  success: require('@/assets/sounds/success.mp3'),
  error: require('@/assets/sounds/error.mp3'),
  tap_light: require('@/assets/sounds/tap_light.mp3'),
};

export const useSounds = () => {
  const { data: profile } = useProfile();
  const soundsEnabled = profile?.sounds_enabled ?? false; // Default to false

  const playSound = useCallback(
    async (type: SoundType) => {
      if (soundsEnabled) {
        try {
          const { sound } = await Audio.Sound.createAsync(soundFiles[type]);
          await sound.playAsync();
          // Unload the sound from memory after it's done playing to free up resources.
          sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded && status.didJustFinish) {
              await sound.unloadAsync();
            }
          });
        } catch (error) {
          console.error(`Error playing sound (${type}):`, error);
        }
      }
    },
    [soundsEnabled]
  );

  return { playSound };
};