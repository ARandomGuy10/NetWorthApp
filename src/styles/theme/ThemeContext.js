import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from '@/hooks/useProfile';
import { themes } from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  console.log('ThemeProvider rendered');
  const { isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState(themes.DARK_THEME); // Start with a default

  useEffect(() => {
    let currentTheme;
    const userThemePref = profile?.theme;

    if (isSignedIn && userThemePref) {
      if (userThemePref === 'SYSTEM') {
        currentTheme = systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME;
      } else {
        const themeKey = `${userThemePref}_THEME`;
        currentTheme = themes[themeKey] || (systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME);
      }
    } else {
      currentTheme = systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME;
    }
    setTheme(currentTheme);
  }, [profile, isSignedIn, systemColorScheme, profileLoading]);

  // Do not render the app until the profile is loaded for signed-in users
  if (isSignedIn && profileLoading) {
    return null; // Or a global loading screen
  }

  const switchTheme = (themeName) => {
    const themeKey = `${themeName}_THEME`;
    if (themeName === 'SYSTEM') {
      setTheme(systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME);
    } else if (themes[themeKey]) {
      setTheme(themes[themeKey]);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
