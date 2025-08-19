import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useProfile } from '@/hooks/useProfile';
import { getTheme } from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  console.log('ThemeProvider rendered');
  const { isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState(getTheme('DARK')); // Start with a default

  useEffect(() => {
    if (profileLoading) return;
    let themeName = profile?.theme || 'SYSTEM';
    if (themeName === 'SYSTEM') {
      themeName = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT';
    }
    setTheme(getTheme(themeName));
  }, [profile, isSignedIn, systemColorScheme, profileLoading]);

  // Do not render the app until the profile is loaded for signed-in users
  if (isSignedIn && profileLoading) {
    return null; // Or a global loading screen
  }

  const switchTheme = (themeName) => {
    let themeToSet = themeName;
    if (themeToSet === 'SYSTEM') {
      themeToSet = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT';
    }
    setTheme(getTheme(themeToSet));
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
