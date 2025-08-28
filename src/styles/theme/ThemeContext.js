import React, {createContext, useState, useContext, useEffect} from 'react';

import {useColorScheme} from 'react-native';

import {useProfile} from '@/hooks/useProfile';

import {getTheme} from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  console.log('ThemeProvider rendered');
  // This is safe to call here because ThemeProvider is now only used inside
  // the (tabs) layout, which is only rendered for authenticated users.
  const {data: profile, isLoading: profileLoading} = useProfile();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(getTheme('DARK')); // Default theme while loading

  useEffect(() => {
    if (profileLoading) return;

    // Use the theme from the user's profile, or fall back to DARK.
    const themeName = profile?.theme || 'DARK';
    setTheme(getTheme(themeName));
  }, [profile, profileLoading, systemColorScheme]);

  // Prevent rendering children until the correct theme is loaded to avoid a
  // "flash of wrong theme" when the app starts.
  if (profileLoading) {
    return null;
  }

  const switchTheme = themeName => {
    let themeToSet = themeName;
    if (themeToSet === 'SYSTEM') {
      themeToSet = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT'; // This logic can be enhanced later
    }
    setTheme(getTheme(themeToSet));
  };

  return <ThemeContext.Provider value={{theme, switchTheme}}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
