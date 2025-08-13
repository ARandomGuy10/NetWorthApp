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

// DARK_THEME - Traditional green/red with teal accents
export const DARK_THEME = createTheme({
  primary: '#20E3B2',
  primaryDark: '#1BC49A',
  primaryLight: '#4AE8C2',
  gradient: {
    colors: ['#0A0E28', '#1A1F3F', '#2D3A6B'],
  },
  background: {
    primary: '#0A0E28',
    secondary: '#0F1435',
    tertiary: '#1A1F3F',
    card: '#151A3A',
    elevated: '#1F2449',
    navBarBackground: '#0A0E28',
  },
  text: {
    primary: '#FDFDFD',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    disabled: '#636366',
    inverse: '#000000',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#FDFDFD',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#F87171',
  info: '#20E3B2',
  asset: '#22C55E',
  liability: '#F87171',
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

// LIGHT_THEME - Clean light theme with sage green
export const LIGHT_THEME = createTheme({
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10B981',
  gradient: {
    colors: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#E2E8F0',
    card: '#FFFFFF',
    elevated: '#F1F5F9',
    navBarBackground: '#FFFFFF',
  },
  text: {
    primary: '#111827',
    secondary: '#475569',
    tertiary: '#64748B',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    // New explicit contrast colors
    onGradient: '#111827',
    onPrimary: '#FFFFFF',
    onCard: '#111827',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  asset: '#059669',
  liability: '#DC2626',
  border: {
    primary: '#E2E8F0',
    secondary: '#CBD5E1',
    focus: '#059669',
  },
  interactive: {
    hover: 'rgba(5, 150, 105, 0.1)',
    pressed: 'rgba(5, 150, 105, 0.15)',
    disabled: 'rgba(0, 0, 0, 0.05)',
  },
}, 'LIGHT');

// MODERN_FINANCE_THEME - Blue success, orange errors (business theme)
export const MODERN_FINANCE_THEME = createTheme({
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#8B5CF6',
  gradient: {
    colors: ['#0F172A', '#1E1B4B', '#7C3AED'],
  },
  background: {
    primary: '#0F172A',
    secondary: '#1E1B4B',
    tertiary: '#312E81',
    card: '#1E1B4B',
    elevated: '#312E81',
    navBarBackground: '#0F172A',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    tertiary: '#94A3B8',
    disabled: '#64748B',
    inverse: '#0F172A',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#F8FAFC',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#3B82F6',
  warning: '#F59E0B',
  error: '#F97316',
  info: '#7C3AED',
  asset: '#3B82F6',
  liability: '#F97316',
  border: {
    primary: '#312E81',
    secondary: '#475569',
    focus: '#7C3AED',
  },
  interactive: {
    hover: 'rgba(124, 58, 237, 0.1)',
    pressed: 'rgba(124, 58, 237, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'MODERN_FINANCE');

// WARM_LUXURY_THEME - Gold success, brown errors (wealth theme)
export const WARM_LUXURY_THEME = createTheme({
  primary: '#EA580C',
  primaryDark: '#C2410C',
  primaryLight: '#FB923C',
  gradient: {
    colors: ['#1C1917', '#44403C', '#EA580C'],
  },
  background: {
    primary: '#1C1917',
    secondary: '#2C2420',
    tertiary: '#44403C',
    card: '#2C2420',
    elevated: '#44403C',
    navBarBackground: '#1C1917',
  },
  text: {
    primary: '#FEF7ED',
    secondary: '#FED7AA',
    tertiary: '#FDBA74',
    disabled: '#78716C',
    inverse: '#1C1917',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#FEF7ED',
    onSuccess: '#1C1917',
    onError: '#FFFFFF',
  },
  success: '#F59E0B',
  warning: '#EA580C',
  error: '#7C2D12',
  info: '#EA580C',
  asset: '#F59E0B',
  liability: '#7C2D12',
  border: {
    primary: '#44403C',
    secondary: '#57534E',
    focus: '#EA580C',
  },
  interactive: {
    hover: 'rgba(234, 88, 12, 0.1)',
    pressed: 'rgba(234, 88, 12, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'WARM_LUXURY');

// NEO_BANKING_THEME - Cyan success, purple errors (tech theme)
export const NEO_BANKING_THEME = createTheme({
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  gradient: {
    colors: ['#030712', '#0F172A', '#0EA5E9'],
  },
  background: {
    primary: '#030712',
    secondary: '#0F172A',
    tertiary: '#1E293B',
    card: '#0F172A',
    elevated: '#1E293B',
    navBarBackground: '#030712',
  },
  text: {
    primary: '#F0F9FF',
    secondary: '#E0F2FE',
    tertiary: '#BAE6FD',
    disabled: '#64748B',
    inverse: '#030712',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#F0F9FF',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#06B6D4',
  warning: '#F59E0B',
  error: '#A855F7',
  info: '#0EA5E9',
  asset: '#06B6D4',
  liability: '#A855F7',
  border: {
    primary: '#1E293B',
    secondary: '#334155',
    focus: '#0EA5E9',
  },
  interactive: {
    hover: 'rgba(14, 165, 233, 0.1)',
    pressed: 'rgba(14, 165, 233, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'NEO_BANKING');

// DARK_MODE_FOCUSED_THEME - Purple-based throughout
export const DARK_MODE_FOCUSED_THEME = createTheme({
  primary: '#A855F7',
  primaryDark: '#9333EA',
  primaryLight: '#C084FC',
  gradient: {
    colors: ['#0A0A0A', '#1A1A1A', '#A855F7'],
  },
  background: {
    primary: '#0A0A0A',
    secondary: '#171717',
    tertiary: '#262626',
    card: '#171717',
    elevated: '#262626',
    navBarBackground: '#0A0A0A',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#F4F4F5',
    tertiary: '#D4D4D8',
    disabled: '#71717A',
    inverse: '#0A0A0A',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#FAFAFA',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#A855F7',
  warning: '#FBBF24',
  error: '#F43F5E',
  info: '#A855F7',
  asset: '#A855F7',
  liability: '#F43F5E',
  border: {
    primary: '#262626',
    secondary: '#404040',
    focus: '#A855F7',
  },
  interactive: {
    hover: 'rgba(168, 85, 247, 0.1)',
    pressed: 'rgba(168, 85, 247, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'DARK_MODE_FOCUSED');

// EARTHY_CALM_THEME - Forest greens with natural tones
export const EARTHY_CALM_THEME = createTheme({
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  gradient: {
    colors: ['#1F2937', '#374151', '#16A34A'],
  },
  background: {
    primary: '#1F2937',
    secondary: '#2D3748',
    tertiary: '#4A5568',
    card: '#2D3748',
    elevated: '#4A5568',
    navBarBackground: '#1F2937',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#F3F4F6',
    tertiary: '#D1D5DB',
    disabled: '#9CA3AF',
    inverse: '#1F2937',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#F9FAFB',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#16A34A',
  warning: '#D97706',
  error: '#B91C1C',
  info: '#0369A1',
  asset: '#16A34A',
  liability: '#B91C1C',
  border: {
    primary: '#4A5568',
    secondary: '#6B7280',
    focus: '#16A34A',
  },
  interactive: {
    hover: 'rgba(22, 163, 74, 0.1)',
    pressed: 'rgba(22, 163, 74, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'EARTHY_CALM');

// MINIMAL_MONOCHROME_THEME - Black/white/gray focused
export const MINIMAL_MONOCHROME_THEME = createTheme({
  primary: '#000000',
  primaryDark: '#000000',
  primaryLight: '#404040',
  gradient: {
    colors: ['#FFFFFF', '#F5F5F5', '#000000'],
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F0F0F0',
    card: '#FAFAFA',
    elevated: '#F0F0F0',
    navBarBackground: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#404040',
    tertiary: '#737373',
    disabled: '#A3A3A3',
    inverse: '#FFFFFF',
    // New explicit contrast colors
    onGradient: '#000000',
    onPrimary: '#FFFFFF',
    onCard: '#000000',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#000000',
  warning: '#525252',
  error: '#737373',
  info: '#000000',
  asset: '#000000',
  liability: '#737373',
  border: {
    primary: '#E5E5E5',
    secondary: '#D4D4D4',
    focus: '#000000',
  },
  interactive: {
    hover: 'rgba(0, 0, 0, 0.05)',
    pressed: 'rgba(0, 0, 0, 0.1)',
    disabled: 'rgba(0, 0, 0, 0.03)',
  },
}, 'MINIMAL_MONOCHROME');

// SUNSET_VIBES_THEME - Warm oranges and pinks
export const SUNSET_VIBES_THEME = createTheme({
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FB923C',
  gradient: {
    colors: ['#FFF7ED', '#FFEDD5', '#F97316'],
  },
  background: {
    primary: '#FFF7ED',
    secondary: '#FFEDD5',
    tertiary: '#FED7AA',
    card: '#FFEDD5',
    elevated: '#FED7AA',
    navBarBackground: '#FFF7ED',
  },
  text: {
    primary: '#9A3412',
    secondary: '#C2410C',
    tertiary: '#EA580C',
    disabled: '#FDBA74',
    inverse: '#FFF7ED',
    // New explicit contrast colors
    onGradient: '#9A3412',
    onPrimary: '#FFF7ED',
    onCard: '#9A3412',
    onSuccess: '#9A3412',
    onError: '#FFF7ED',
  },
  success: '#F59E0B',
  warning: '#F97316',
  error: '#EC4899',
  info: '#F97316',
  asset: '#F59E0B',
  liability: '#EC4899',
  border: {
    primary: '#FED7AA',
    secondary: '#FDBA74',
    focus: '#F97316',
  },
  interactive: {
    hover: 'rgba(249, 115, 22, 0.1)',
    pressed: 'rgba(249, 115, 22, 0.15)',
    disabled: 'rgba(0, 0, 0, 0.03)',
  },
}, 'SUNSET_VIBES');

// OCEAN_DEPTHS_THEME - Deep blues and teals
export const OCEAN_DEPTHS_THEME = createTheme({
  primary: '#0F766E',
  primaryDark: '#0D9488',
  primaryLight: '#14B8A6',
  gradient: {
    colors: ['#042F2E', '#0F766E', '#14B8A6'],
  },
  background: {
    primary: '#042F2E',
    secondary: '#134E4A',
    tertiary: '#0F766E',
    card: '#134E4A',
    elevated: '#0F766E',
    navBarBackground: '#042F2E',
  },
  text: {
    primary: '#F0FDFA',
    secondary: '#CCFBF1',
    tertiary: '#99F6E4',
    disabled: '#5EEAD4',
    inverse: '#042F2E',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onCard: '#F0FDFA',
    onSuccess: '#FFFFFF',
    onError: '#FFFFFF',
  },
  success: '#14B8A6',
  warning: '#F59E0B',
  error: '#1E40AF',
  info: '#0F766E',
  asset: '#14B8A6',
  liability: '#1E40AF',
  border: {
    primary: '#0F766E',
    secondary: '#134E4A',
    focus: '#14B8A6',
  },
  interactive: {
    hover: 'rgba(15, 118, 110, 0.1)',
    pressed: 'rgba(15, 118, 110, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'OCEAN_DEPTHS');

// PLATINUM_ELEGANCE_THEME - Sophisticated black, silver, and gold
export const PLATINUM_ELEGANCE_THEME = createTheme({
  primary: '#FFD700',
  primaryDark: '#DAA520',
  primaryLight: '#FFF700',
  gradient: {
    colors: ['#000000', '#1C1C1E', '#FFD700'],
    locations: [0, 0.8, 1.0]
  },
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    navBarBackground: '#000000',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E5E7',
    tertiary: '#C7C7CC',
    disabled: '#8E8E93',
    inverse: '#000000',
    // New explicit contrast colors
    onGradient: '#FFFFFF',
    onPrimary: '#000000',
    onCard: '#FFFFFF',
    onSuccess: '#000000',
    onError: '#FFFFFF',
  },
  success: '#FFD700',
  warning: '#FF9500',
  error: '#C7C7CC',
  info: '#FFD700',
  asset: '#FFD700',
  liability: '#C7C7CC',
  border: {
    primary: '#2C2C2E',
    secondary: '#3A3A3C',
    focus: '#FFD700',
  },
  interactive: {
    hover: 'rgba(255, 215, 0, 0.1)',
    pressed: 'rgba(255, 215, 0, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.1)',
  },
}, 'PLATINUM_ELEGANCE');

export const themes = {
  DARK_THEME,
  LIGHT_THEME,
  MODERN_FINANCE_THEME,
  WARM_LUXURY_THEME,
  NEO_BANKING_THEME,
  DARK_MODE_FOCUSED_THEME,
  EARTHY_CALM_THEME,
  MINIMAL_MONOCHROME_THEME,
  SUNSET_VIBES_THEME,
  OCEAN_DEPTHS_THEME,
  PLATINUM_ELEGANCE_THEME,
};
