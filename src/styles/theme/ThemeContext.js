import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/stores/settingsStore';
import { getTheme } from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { theme: userTheme, isSignedIn, updateTheme } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(getTheme('DARK'));

  useEffect(() => {
    let activeTheme = isSignedIn ? userTheme : 'DARK';
    
    if (activeTheme === 'SYSTEM') {
      activeTheme = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT';
    }

    setTheme(getTheme(activeTheme));
  }, [userTheme, isSignedIn, systemColorScheme]);

  const switchTheme = useCallback((newTheme) => {
    updateTheme(newTheme); // Update store
    
    let activeTheme = newTheme;
    if (activeTheme === 'SYSTEM') {
      activeTheme = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT';
    }
    setTheme(getTheme(activeTheme));
  }, [updateTheme, systemColorScheme]);

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
