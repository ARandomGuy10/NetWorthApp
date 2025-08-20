import { create } from 'zustand';

interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
}

interface SettingsState extends Settings {
  initializeSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true, // Default to true
  soundsEnabled: true, // Default to true
  initializeSettings: (settings) => set(settings),
}));