import { create } from 'zustand';

interface Settings {
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  theme: string; // Add theme here
  isSignedIn: boolean; // Track sign-in state
}

interface SettingsState extends Settings {
  initializeSettings: (settings: Partial<Settings>) => void;
  updateTheme: (theme: string) => void;
  setSignedIn: (signedIn: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  soundsEnabled: true,
  theme: 'DARK', // Default theme
  isSignedIn: false,
  
  initializeSettings: (settings) => set((state) => ({ ...state, ...settings })),
  updateTheme: (theme) => set({ theme }),
  setSignedIn: (isSignedIn) => set({ isSignedIn }),
}));
