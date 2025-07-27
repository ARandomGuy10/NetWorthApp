/**
 * Dynamic Color System for PocketRackr
 * Centralized color management for easy theme changes
 */

export const colors = {
  // Primary Brand Colors
  primary: '#20E3B2',
  primaryDark: '#1BC49A',
  primaryLight: '#4AE8C2',
  
  // Background Colors
  background: {
    primary: '#0B0F2B',
    secondary: '#0F1435',
    tertiary: '#1A1F3F',
    card: '#151A3A',
    elevated: '#1F2449',
    navBarBackground: '#0B0F2B',
  },
  
  // Text Colors
  text: {
    primary: '#FDFDFD',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    disabled: '#636366',
    inverse: '#000000',
  },
  
  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF6F61',
  info: '#747FFD',
  
  // Asset/Liability Colors
  asset: '#20E3B2',
  liability: '#747FFD',
  
  // Border Colors
  border: {
    primary: '#1F2449',
    secondary: '#2A3052',
    focus: '#20E3B2',
  },
  
  // Interactive States
  interactive: {
    hover: 'rgba(32, 227, 178, 0.1)',
    pressed: 'rgba(32, 227, 178, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
};