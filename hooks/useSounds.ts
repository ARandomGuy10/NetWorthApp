import {useCallback, useEffect, useRef} from 'react';
import {createAudioPlayer, setAudioModeAsync, AudioPlayer} from 'expo-audio';
import {useSettingsStore} from '@/stores/settingsStore';
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
  // Store loaded sound objects in a ref to persist them across re-renders
  const soundPlayers = useRef<Partial<Record<SoundType, AudioPlayer>>>({});
  const soundsEnabled = useSettingsStore(state => state.soundsEnabled);

  // Effect to pre-load sounds and clean them up on unmount
  useEffect(() => {
    const loadSounds = async () => {
      // Configure audio mode to play sound even in silent mode on iOS
      await setAudioModeAsync({
        playsInSilentMode: true,
      });

      for (const key in soundFiles) {
        const type = key as SoundType;
        try {
          const player = createAudioPlayer(soundFiles[type]);
          soundPlayers.current[type] = player;
        } catch (error) {
          console.error(`Error loading sound (${type}):`, error);
        }
      }
    };

    loadSounds();

    // Cleanup function to unload all sounds when the hook is no longer in use
    return () => {
      for (const key in soundPlayers.current) {
        const player = soundPlayers.current[key as SoundType];
        player?.release();
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const playSound = useCallback(
    async (type: SoundType) => {
      const player = soundPlayers.current[type];
      if (soundsEnabled && player) {
        try {
          // Replay the sound by seeking to the start and playing
          await player.seekTo(0);
          await player.play();
        } catch (error) {
          console.error(`Error playing sound (${type}):`, error);
        }
      }
    },
    [soundsEnabled] // Dependency on soundsEnabled to respect user settings
  );

  return {playSound};
};
