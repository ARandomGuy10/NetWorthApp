/**
 * Dynamic Color System for PocketRackr
 * Centralized color management for easy theme changes
 */

export const colors = {
  // Primary Brand Colors
  primary: '#4ECDC4',
  primaryDark: '#3BA99F',
  primaryLight: '#6FD9D1',
  
  // Background Colors
  background: {
    primary: '#0A0A0A',
    secondary: '#121212',
    tertiary: '#1C1C1E',
    card: '#1E1E20',
    elevated: '#252527',
  },
  
  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A9A9A9',
    tertiary: '#8E8E93',
    disabled: '#636366',
    inverse: '#000000',
  },
  
  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Asset/Liability Colors
  asset: '#4ECDC4',
  liability: '#FF6B6B',
  
  // Border Colors
  border: {
    primary: '#2C2C2E',
    secondary: '#38383A',
    focus: '#4ECDC4',
  },
  
  // Interactive States
  interactive: {
    hover: 'rgba(78, 205, 196, 0.1)',
    pressed: 'rgba(78, 205, 196, 0.2)',
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