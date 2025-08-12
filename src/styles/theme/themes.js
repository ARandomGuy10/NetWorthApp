const createTheme = (colors, name) => ({
  name,
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
  },
});

// DARK theme with prominent gradient
export const DARK_THEME = createTheme({
  primary: '#20E3B2',
  primaryDark: '#1BC49A',
  primaryLight: '#4AE8C2',
  
  gradient: {
    colors: ['#0B0F2B', '#1A1F3F', '#2D3A6B'],
    locations: [0, 0.5, 1.0]
  },
  
  background: {
    primary: '#0B0F2B',
    secondary: '#0F1435',
    tertiary: '#1A1F3F',
    card: '#151A3A',
    elevated: '#1F2449',
    navBarBackground: '#0B0F2B',
  },
  text: {
    primary: '#FDFDFD',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    disabled: '#636366',
    inverse: '#000000',
  },
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF6F61',
  info: '#747FFD',
  asset: '#20E3B2',
  liability: '#747FFD',
  border: {
    primary: '#1F2449',
    secondary: '#2A3052',
    focus: '#20E3B2',
  },
  interactive: {
    hover: 'rgba(32, 227, 178, 0.1)',
    pressed: 'rgba(32, 227, 178, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'DARK');

// LIGHT theme with subtle light gradient
export const LIGHT_THEME = createTheme({
  primary: '#20E3B2',
  primaryDark: '#1BC49A',
  primaryLight: '#4AE8C2',
  
  gradient: {
    colors: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],
    locations: [0, 0.6, 1.0]
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    navBarBackground: '#FFFFFF',
  },
  text: {
    primary: '#1E293B',
    secondary: '#475569',
    tertiary: '#64748B',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  asset: '#20E3B2',
  liability: '#3B82F6',
  border: {
    primary: '#E2E8F0',
    secondary: '#CBD5E1',
    focus: '#20E3B2',
  },
  interactive: {
    hover: 'rgba(32, 227, 178, 0.1)',
    pressed: 'rgba(32, 227, 178, 0.15)',
    disabled: 'rgba(0, 0, 0, 0.05)',
  },
}, 'LIGHT');

// MODERN_FINANCE theme with professional gradient
export const MODERN_FINANCE_THEME = createTheme({
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  gradient: {
    colors: ['#0F172A', '#334155', '#4F46E5'],
    locations: [0, 0.7, 1.0]
  },
  
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    card: '#1E293B',
    elevated: '#334155',
    navBarBackground: '#0F172A',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
    disabled: '#64748B',
    inverse: '#0F172A',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#F87171',
  info: '#6366F1',
  asset: '#10B981',
  liability: '#F87171',
  border: {
    primary: '#334155',
    secondary: '#475569',
    focus: '#6366F1',
  },
  interactive: {
    hover: 'rgba(99, 102, 241, 0.1)',
    pressed: 'rgba(99, 102, 241, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'MODERN_FINANCE');

// WARM_LUXURY theme with rich gradient
export const WARM_LUXURY_THEME = createTheme({
  primary: '#D97706',
  primaryDark: '#B45309',
  primaryLight: '#F59E0B',
  
  gradient: {
    colors: ['#1C1917', '#44403C', '#D97706'],
    locations: [0, 0.6, 1.0]
  },
  
  background: {
    primary: '#1C1917',
    secondary: '#292524',
    tertiary: '#44403C',
    card: '#292524',
    elevated: '#44403C',
    navBarBackground: '#1C1917',
  },
  text: {
    primary: '#FEF7ED',
    secondary: '#FED7AA',
    tertiary: '#FDBA74',
    disabled: '#78716C',
    inverse: '#1C1917',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#D97706',
  asset: '#22C55E',
  liability: '#DC2626',
  border: {
    primary: '#44403C',
    secondary: '#57534E',
    focus: '#D97706',
  },
  interactive: {
    hover: 'rgba(217, 119, 6, 0.1)',
    pressed: 'rgba(217, 119, 6, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'WARM_LUXURY');

// NEO_BANKING theme with tech-forward gradient
export const NEO_BANKING_THEME = createTheme({
  primary: '#06B6D4',
  primaryDark: '#0891B2',
  primaryLight: '#22D3EE',
  
  gradient: {
    colors: ['#020617', '#1E293B', '#06B6D4'],
    locations: [0, 0.5, 1.0]
  },
  
  background: {
    primary: '#020617',
    secondary: '#0F172A',
    tertiary: '#1E293B',
    card: '#0F172A',
    elevated: '#1E293B',
    navBarBackground: '#020617',
  },
  text: {
    primary: '#F0F9FF',
    secondary: '#E0F2FE',
    tertiary: '#BAE6FD',
    disabled: '#64748B',
    inverse: '#020617',
  },
  success: '#14B8A6',
  warning: '#F59E0B',
  error: '#F43F5E',
  info: '#06B6D4',
  asset: '#14B8A6',
  liability: '#F43F5E',
  border: {
    primary: '#1E293B',
    secondary: '#334155',
    focus: '#06B6D4',
  },
  interactive: {
    hover: 'rgba(6, 182, 212, 0.1)',
    pressed: 'rgba(6, 182, 212, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'NEO_BANKING');

// DARK_MODE_FOCUSED theme with enhanced contrast gradient
export const DARK_MODE_FOCUSED_THEME = createTheme({
  primary: '#A855F7',
  primaryDark: '#9333EA',
  primaryLight: '#C084FC',
  
  gradient: {
    colors: ['#000000', '#1A1A1A', '#A855F7'],
    locations: [0, 0.8, 1.0]
  },
  
  background: {
    primary: '#000000',
    secondary: '#111111',
    tertiary: '#1A1A1A',
    card: '#111111',
    elevated: '#1A1A1A',
    navBarBackground: '#000000',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    tertiary: '#D1D5DB',
    disabled: '#6B7280',
    inverse: '#000000',
  },
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#A855F7',
  asset: '#22C55E',
  liability: '#EF4444',
  border: {
    primary: '#1A1A1A',
    secondary: '#2D2D2D',
    focus: '#A855F7',
  },
  interactive: {
    hover: 'rgba(168, 85, 247, 0.1)',
    pressed: 'rgba(168, 85, 247, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'DARK_MODE_FOCUSED');

// EARTHY_CALM theme with natural gradient
export const EARTHY_CALM_THEME = createTheme({
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10B981',
  
  gradient: {
    colors: ['#1F2937', '#4B5563', '#059669'],
    locations: [0, 0.6, 1.0]
  },
  
  background: {
    primary: '#1F2937',
    secondary: '#374151',
    tertiary: '#4B5563',
    card: '#374151',
    elevated: '#4B5563',
    navBarBackground: '#1F2937',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#F3F4F6',
    tertiary: '#D1D5DB',
    disabled: '#9CA3AF',
    inverse: '#1F2937',
  },
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0369A1',
  asset: '#059669',
  liability: '#DC2626',
  border: {
    primary: '#4B5563',
    secondary: '#6B7280',
    focus: '#059669',
  },
  interactive: {
    hover: 'rgba(5, 150, 105, 0.1)',
    pressed: 'rgba(5, 150, 105, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'EARTHY_CALM');

export const themes = {
  DARK_THEME,
  LIGHT_THEME,
  MODERN_FINANCE_THEME,
  WARM_LUXURY_THEME,
  NEO_BANKING_THEME,
  DARK_MODE_FOCUSED_THEME,
  EARTHY_CALM_THEME,
};
