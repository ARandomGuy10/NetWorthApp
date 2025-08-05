import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from '@/hooks/useProfile';
import { themes, DARK_THEME } from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  console.log('ThemeProvider rendered');
  const { isSignedIn } = useAuth();
  const { data: profile } = useProfile();
  const systemColorScheme = useColorScheme();
  console.log('systemColorScheme', systemColorScheme);

  const getInitialTheme = () => {
    const userTheme = profile?.theme;
    if (isSignedIn && userTheme) {
      const themeKey = `${userTheme}_THEME`; // Construct the correct key
      if (userTheme === 'SYSTEM') {
        return systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME;
      } else if (themes[themeKey]) {
        return themes[themeKey];
      }
    }
    // Default for signed-out users or if no theme is set
    return systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    setTheme(getInitialTheme());
  }, [profile, isSignedIn, systemColorScheme]);

  const switchTheme = (themeName) => {
    let newTheme;
    const themeKey = `${themeName}_THEME`; // Construct the correct key
    if (themeName === 'SYSTEM') {
      newTheme = systemColorScheme === 'dark' ? themes.DARK_THEME : themes.LIGHT_THEME;
    } else if (themes[themeKey]) {
      newTheme = themes[themeKey];
    }

    if (newTheme) {
      setTheme(newTheme);
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
