import React, {createContext, useState, useContext, useEffect, useMemo} from 'react';
import {useColorScheme, useWindowDimensions, PixelRatio} from 'react-native';
import {useProfile} from '@/hooks/useProfile';
import {getTheme} from './themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  console.log('ThemeProvider rendered');

  const {data: profile, isLoading: profileLoading} = useProfile();
  const systemColorScheme = useColorScheme();
  const {width, height} = useWindowDimensions();
  const [baseTheme, setBaseTheme] = useState(getTheme('DARK'));

  // Enhanced theme with responsive calculations
  const theme = useMemo(() => {
    // Device size detection
    const getDeviceSize = () => {
      if (width < 375) return 'small';
      if (width < 414) return 'medium';
      return 'large';
    };

    const deviceSize = getDeviceSize();
    const responsive = baseTheme.responsive[deviceSize];

    // Calculate responsive font sizes
    const fontSizes = Object.entries(baseTheme.fontSizes).reduce((acc, [key, baseSize]) => {
      const scaledSize = baseSize * responsive.fontScale;
      acc[key] = Math.round(PixelRatio.roundToNearestPixel(scaledSize));
      return acc;
    }, {});

    // Calculate responsive spacing
    const spacing = Object.entries(baseTheme.spacing).reduce((acc, [key, baseSpacing]) => {
      const scaledSpacing = baseSpacing * responsive.spacingScale;
      acc[key] = Math.round(scaledSpacing);
      return acc;
    }, {});

    // Dynamic chart height
    const chartHeight = Math.max(180, Math.min(250, height * 0.25));

    // Return enhanced theme (backward compatible!)
    return {
      ...baseTheme,
      // ✅ Existing properties remain unchanged
      spacing, // Enhanced but same key names
      // ✅ NEW: Add responsive properties
      fontSizes,
      responsive: {
        deviceSize,
        chartHeight,
        isSmallScreen: deviceSize === 'small',
        isMediumScreen: deviceSize === 'medium',
        isLargeScreen: deviceSize === 'large',
        originalSpacing: baseTheme.spacing, // Fallback if needed
      },
    };
  }, [baseTheme, width, height]);

  useEffect(() => {
    if (profileLoading) return;
    const themeName = profile?.theme || 'DARK';
    setBaseTheme(getTheme(themeName));
  }, [profile, profileLoading, systemColorScheme]);

  const switchTheme = themeName => {
    let themeToSet = themeName;
    if (themeToSet === 'SYSTEM') {
      themeToSet = systemColorScheme === 'dark' ? 'DARK' : 'LIGHT';
    }
    setBaseTheme(getTheme(themeToSet));
  };

  // FIXED: Always return Provider with value
  const value = useMemo(() => ({theme, switchTheme}), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
