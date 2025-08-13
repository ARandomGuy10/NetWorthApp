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
    // Main app background gradient
    primary: ['#0A0E28', '#1A1F3F', '#2D3A6B'],
    
    // Card backgrounds - slightly lighter with teal accent
    card: ['#151A3A', '#1F2449', '#2D3A6B'],
    
    // Button gradients - teal primary colors
    button: ['#20E3B2', '#1BC49A', '#18A085'],
    
    // Header/dashboard sections - ✅ UPDATED: smoother blend
    header: ['#0A0E28', '#1A1F3F', 'rgba(32, 227, 178, 0.3)'],
    
    // Success/positive elements - green gradients
    success: ['#22C55E', '#16A34A', '#15803D'],
    
    // Warning elements - amber gradients
    warning: ['#F59E0B', '#D97706', '#B45309'],
    
    // Error/liability elements - red gradients
    error: ['#F87171', '#EF4444', '#DC2626'],
    
    // Subtle background variations - very dark
    subtle: ['#0A0E28', '#0F1435', '#151A3A'],
    
    // Accent overlays - transparent teal
    accent: ['rgba(32, 227, 178, 0.12)', 'rgba(32, 227, 178, 0.06)', 'rgba(32, 227, 178, 0.0)'],
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
    // Main background - white to very light gray
    primary: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],
    
    // Card backgrounds - pure white to light gray
    card: ['#FFFFFF', '#F8FAFC', '#E2E8F0'],
    
    // Button gradients - sage green variations
    button: ['#059669', '#047857', '#065F46'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#FFFFFF', '#E2E8F0', 'rgba(5, 150, 105, 0.3)'],
    
    // Success - emerald gradients
    success: ['#10B981', '#059669', '#047857'],
    
    // Warning - orange gradients
    warning: ['#F59E0B', '#D97706', '#B45309'],
    
    // Error - red gradients
    error: ['#F87171', '#EF4444', '#DC2626'],
    
    // Subtle - very light variations
    subtle: ['#FFFFFF', '#F8FAFC', '#F1F5F9'],
    
    // Accent - transparent sage green
    accent: ['rgba(5, 150, 105, 0.08)', 'rgba(5, 150, 105, 0.04)', 'rgba(5, 150, 105, 0.0)'],
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

// MODERN_FINANCE_THEME - Purple business theme
export const MODERN_FINANCE_THEME = createTheme({
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  primaryLight: '#8B5CF6',
  
  gradient: {
    // Primary - dark to purple accent
    primary: ['#0F172A', '#1E1B4B', '#7C3AED'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#0F172A', '#312E81', 'rgba(124, 58, 237, 0.3)'],
    
    // Card backgrounds - darker purples
    card: ['#1E1B4B', '#312E81', '#4C1D95'],
    
    // Button gradients - purple variations
    button: ['#7C3AED', '#6D28D9', '#5B21B6'],
    
    // Success - blue gradients (professional)
    success: ['#3B82F6', '#2563EB', '#1D4ED8'],
    
    // Warning - amber
    warning: ['#F59E0B', '#D97706', '#B45309'],
    
    // Error - orange (professional alternative to red)
    error: ['#F97316', '#EA580C', '#C2410C'],
    
    // Subtle - very dark variations
    subtle: ['#0F172A', '#1E1B4B', '#312E81'],
    
    // Accent - transparent purple
    accent: ['rgba(124, 58, 237, 0.15)', 'rgba(124, 58, 237, 0.08)', 'rgba(124, 58, 237, 0.0)'],
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

// WARM_LUXURY_THEME - Luxury gold/brown theme
export const WARM_LUXURY_THEME = createTheme({
  primary: '#EA580C',
  primaryDark: '#C2410C',
  primaryLight: '#FB923C',
  
  gradient: {
    // Warm dark browns to orange
    primary: ['#1C1917', '#44403C', '#78716C'],
    
    // Card backgrounds - warm brown variations
    card: ['#2C2420', '#44403C', '#57534E'],
    
    // Button gradients - orange/amber luxury
    button: ['#EA580C', '#C2410C', '#9A3412'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#1C1917', '#44403C', 'rgba(234, 88, 12, 0.3)'],
    
    // Success - luxury gold
    success: ['#F59E0B', '#D97706', '#B45309'],
    
    // Warning - bright orange
    warning: ['#FB923C', '#EA580C', '#C2410C'],
    
    // Error - deep brown (elegant alternative)
    error: ['#7C2D12', '#92400E', '#B45309'],
    
    // Subtle - rich dark browns
    subtle: ['#1C1917', '#2C2420', '#44403C'],
    
    // Accent - warm orange overlay
    accent: ['rgba(234, 88, 12, 0.12)', 'rgba(234, 88, 12, 0.06)', 'rgba(234, 88, 12, 0.0)'],
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

// NEO_BANKING_THEME - Futuristic cyan tech theme
export const NEO_BANKING_THEME = createTheme({
  primary: '#0EA5E9',
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  
  gradient: {
    // Deep space to cyan
    primary: ['#030712', '#0F172A', '#1E293B'],
    
    // Card backgrounds - slate variations
    card: ['#0F172A', '#1E293B', '#334155'],
    
    // Button gradients - cyan/blue tech
    button: ['#0EA5E9', '#0284C7', '#0369A1'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#030712', '#1E293B', 'rgba(14, 165, 233, 0.3)'],
    
    // Success - bright cyan
    success: ['#06B6D4', '#0891B2', '#0E7490'],
    
    // Warning - amber tech
    warning: ['#F59E0B', '#D97706', '#B45309'],
    
    // Error - tech purple
    error: ['#A855F7', '#9333EA', '#7C3AED'],
    
    // Subtle - deep tech grays
    subtle: ['#030712', '#0F172A', '#1E293B'],
    
    // Accent - cyan glow
    accent: ['rgba(14, 165, 233, 0.15)', 'rgba(14, 165, 233, 0.08)', 'rgba(14, 165, 233, 0.0)'],
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

// DARK_MODE_FOCUSED_THEME - Purple-focused throughout
export const DARK_MODE_FOCUSED_THEME = createTheme({
  primary: '#A855F7',
  primaryDark: '#9333EA',
  primaryLight: '#C084FC',
  
  gradient: {
    // Pure black to purple
    primary: ['#0A0A0A', '#171717', '#262626'],
    
    // Card backgrounds - dark gray to purple hint
    card: ['#171717', '#262626', '#404040'],
    
    // Button gradients - purple variations
    button: ['#A855F7', '#9333EA', '#7C3AED'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#0A0A0A', '#262626', 'rgba(168, 85, 247, 0.3)'],
    
    // Success - purple (consistent with theme)
    success: ['#A855F7', '#9333EA', '#7C3AED'],
    
    // Warning - warm yellow
    warning: ['#FBBF24', '#F59E0B', '#D97706'],
    
    // Error - pink/red
    error: ['#F43F5E', '#E11D48', '#BE123C'],
    
    // Subtle - very dark grays
    subtle: ['#0A0A0A', '#171717', '#262626'],
    
    // Accent - purple glow
    accent: ['rgba(168, 85, 247, 0.12)', 'rgba(168, 85, 247, 0.06)', 'rgba(168, 85, 247, 0.0)'],
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

// EARTHY_CALM_THEME - Natural forest greens
export const EARTHY_CALM_THEME = createTheme({
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#22C55E',
  
  gradient: {
    // Natural earth tones
    primary: ['#1F2937', '#374151', '#4A5568'],
    
    // Card backgrounds - warmer earth tones
    card: ['#2D3748', '#4A5568', '#718096'],
    
    // Button gradients - forest greens
    button: ['#16A34A', '#15803D', '#14532D'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#1F2937', '#4A5568', 'rgba(22, 163, 74, 0.3)'],
    
    // Success - vibrant greens
    success: ['#22C55E', '#16A34A', '#15803D'],
    
    // Warning - earthy orange
    warning: ['#D97706', '#B45309', '#92400E'],
    
    // Error - natural red
    error: ['#DC2626', '#B91C1C', '#991B1B'],
    
    // Subtle - muted earth tones
    subtle: ['#1F2937', '#2D3748', '#374151'],
    
    // Accent - natural green overlay
    accent: ['rgba(22, 163, 74, 0.10)', 'rgba(22, 163, 74, 0.05)', 'rgba(22, 163, 74, 0.0)'],
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

// MINIMAL_MONOCHROME_THEME - Pure black/white/gray
export const MINIMAL_MONOCHROME_THEME = createTheme({
  primary: '#000000',
  primaryDark: '#000000',
  primaryLight: '#404040',
  
  gradient: {
    // White to light gray
    primary: ['#FFFFFF', '#F5F5F5', '#E5E5E5'],
    
    // Card backgrounds - pure whites to gray
    card: ['#FFFFFF', '#FAFAFA', '#F0F0F0'],
    
    // Button gradients - black variations
    button: ['#000000', '#171717', '#404040'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#FFFFFF', '#F0F0F0', 'rgba(0, 0, 0, 0.3)'],
    
    // Success - black (minimal)
    success: ['#000000', '#171717', '#404040'],
    
    // Warning - dark gray
    warning: ['#525252', '#404040', '#262626'],
    
    // Error - medium gray
    error: ['#737373', '#525252', '#404040'],
    
    // Subtle - very light grays
    subtle: ['#FFFFFF', '#FAFAFA', '#F5F5F5'],
    
    // Accent - subtle black overlay
    accent: ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.0)'],
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

// SUNSET_VIBES_THEME - Warm sunset colors
export const SUNSET_VIBES_THEME = createTheme({
  primary: '#F97316',
  primaryDark: '#EA580C',
  primaryLight: '#FB923C',
  
  gradient: {
    // Sunset progression - cream to orange
    primary: ['#FFF7ED', '#FFEDD5', '#FED7AA'],
    
    // Card backgrounds - warm cream tones
    card: ['#FFEDD5', '#FED7AA', '#FDBA74'],
    
    // Button gradients - sunset orange
    button: ['#F97316', '#EA580C', '#C2410C'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#FFF7ED', '#FED7AA', 'rgba(249, 115, 22, 0.3)'],
    
    // Success - warm amber
    success: ['#F59E0B', '#D97706', '#B45309'],
    
    // Warning - bright orange
    warning: ['#FB923C', '#F97316', '#EA580C'],
    
    // Error - sunset pink
    error: ['#EC4899', '#DB2777', '#BE185D'],
    
    // Subtle - very warm lights
    subtle: ['#FFF7ED', '#FFEDD5', '#FED7AA'],
    
    // Accent - warm orange glow
    accent: ['rgba(249, 115, 22, 0.10)', 'rgba(249, 115, 22, 0.05)', 'rgba(249, 115, 22, 0.0)'],
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

// OCEAN_DEPTHS_THEME - Deep ocean blues and teals
export const OCEAN_DEPTHS_THEME = createTheme({
  primary: '#0F766E',
  primaryDark: '#0D9488',
  primaryLight: '#14B8A6',
  
  gradient: {
    // Deep ocean progression
    primary: ['#042F2E', '#134E4A', '#0F766E'],
    
    // Card backgrounds - ocean depths
    card: ['#134E4A', '#0F766E', '#14B8A6'],
    
    // Button gradients - teal variations
    button: ['#0D9488', '#0F766E', '#115E59'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#042F2E', '#0F766E', 'rgba(15, 118, 110, 0.3)'],
    
    // Success - bright aqua
    success: ['#14B8A6', '#0D9488', '#0F766E'],
    
    // Warning - ocean amber
    warning: ['#F59E0B', '#D97706', '#B45309'],
    
    // Error - deep blue (ocean alternative)
    error: ['#1E40AF', '#1D4ED8', '#2563EB'],
    
    // Subtle - very deep ocean tones
    subtle: ['#042F2E', '#134E4A', '#0F766E'],
    
    // Accent - aqua glow
    accent: ['rgba(15, 118, 110, 0.12)', 'rgba(15, 118, 110, 0.06)', 'rgba(15, 118, 110, 0.0)'],
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

// PLATINUM_ELEGANCE_THEME - Luxury black/gold
export const PLATINUM_ELEGANCE_THEME = createTheme({
  primary: '#FFD700',
  primaryDark: '#DAA520',
  primaryLight: '#FFF700',
  
  gradient: {
    // Pure black to gold - ultimate luxury
    primary: ['#000000', '#1C1C1E', '#2C2C2E'],
    
    // Card backgrounds - rich blacks with gold hint
    card: ['#1C1C1E', '#2C2C2E', '#3A3A3C'],
    
    // Button gradients - gold luxury
    button: ['#FFD700', '#DAA520', '#B8860B'],
    
    // Header - ✅ UPDATED: smoother blend
    header: ['#000000', '#2C2C2E', 'rgba(255, 215, 0, 0.3)'],
    
    // Success - pure gold
    success: ['#FFD700', '#DAA520', '#B8860B'],
    
    // Warning - luxury orange
    warning: ['#FF9500', '#FF8C00', '#FF7F00'],
    
    // Error - platinum silver
    error: ['#C7C7CC', '#AEAEB2', '#8E8E93'],
    
    // Subtle - deepest blacks
    subtle: ['#000000', '#1C1C1E', '#2C2C2E'],
    
    // Accent - golden glow
    accent: ['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.08)', 'rgba(255, 215, 0, 0.0)'],
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
