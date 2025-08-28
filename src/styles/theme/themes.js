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
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.text.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.text.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
  },
});

// DARK_THEME - Traditional green/red with teal accents
export const DARK_THEME = createTheme(
  {
    primary: '#20E3B2',
    primaryDark: '#1BC49A',
    primaryLight: '#4AE8C2',

    gradient: {
      // ✅ Improved: Deep ocean blues with teal progression
      primary: ['#0A0E28', '#1A1F3F', '#2D3A6B'],

      // ✅ Improved: Card backgrounds with better contrast
      card: ['#151A3A', '#1F2449', '#2A3354'],

      // ✅ Improved: Vibrant teal gradient for buttons
      button: ['#20E3B2', '#1BC49A', '#16A085'],

      // ✅ Improved: Smooth background to accent transition
      header: ['#0A0E28', '#1A1F3F', 'rgba(32, 227, 178, 0.25)'],

      // ✅ Improved: Natural green progression
      success: ['#22C55E', '#16A34A', '#15803D'],

      // ✅ Improved: Warm amber gradient
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Coral to deep red
      error: ['#F87171', '#EF4444', '#DC2626'],

      // ✅ Improved: Very subtle dark variations
      subtle: ['#0A0E28', '#0F1435', '#151A3A'],

      // ✅ Improved: Ethereal teal overlay
      accent: ['rgba(32, 227, 178, 0.10)', 'rgba(32, 227, 178, 0.05)', 'rgba(32, 227, 178, 0.02)'],
    },

    meshBackground: ['#20E3B2', '#2D3A6B', '#9333EA', '#F87171'],

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
    asset: '#20E3B2',
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
  },
  'DARK'
);

// LIGHT_THEME - Clean light theme with sage green
export const LIGHT_THEME = createTheme(
  {
    primary: '#059669',
    primaryDark: '#047857',
    primaryLight: '#10B981',
    meshBackground: ['#059669', '#10B981', '#2563EB', '#F59E0B'],
    gradient: {
      // ✅ Improved: Clean white to soft gray progression
      primary: ['#FFFFFF', '#F8FAFC', '#E2E8F0'],

      // ✅ Improved: Elevated card feeling
      card: ['#FFFFFF', '#F1F5F9', '#E2E8F0'],

      // ✅ Improved: Rich emerald button gradient
      button: ['#10B981', '#059669', '#047857'],

      // ✅ Improved: Light to sage accent
      header: ['#FFFFFF', '#E2E8F0', 'rgba(5, 150, 105, 0.20)'],

      // ✅ Improved: Vibrant success gradient
      success: ['#10B981', '#059669', '#047857'],

      // ✅ Improved: Warm orange progression
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Clean error gradient
      error: ['#F87171', '#EF4444', '#DC2626'],

      // ✅ Improved: Barely-there light variations
      subtle: ['#FFFFFF', '#F8FAFC', '#F1F5F9'],

      // ✅ Improved: Whisper-light sage overlay
      accent: ['rgba(5, 150, 105, 0.06)', 'rgba(5, 150, 105, 0.03)', 'rgba(5, 150, 105, 0.01)'],
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
  },
  'LIGHT'
);

// MODERN_FINANCE_THEME - Purple business theme
export const MODERN_FINANCE_THEME = createTheme(
  {
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#8B5CF6',
    meshBackground: ['#7C3AED', '#3B82F6', '#9333EA', '#F59E0B'],
    gradient: {
      // ✅ Improved: Professional dark slate progression
      primary: ['#0F172A', '#1E1B4B', '#312E81'],

      // ✅ Improved: Business card depth
      card: ['#1E1B4B', '#312E81', '#4C1D95'],

      // ✅ Improved: Sophisticated purple gradient
      button: ['#8B5CF6', '#7C3AED', '#6D28D9'],

      // ✅ Improved: Executive header gradient
      header: ['#0F172A', '#312E81', 'rgba(124, 58, 237, 0.25)'],

      // ✅ Improved: Professional blue success
      success: ['#3B82F6', '#2563EB', '#1D4ED8'],

      // ✅ Improved: Business warning amber
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Professional orange (not harsh red)
      error: ['#F97316', '#EA580C', '#C2410C'],

      // ✅ Improved: Corporate subtle grays
      subtle: ['#0F172A', '#1E1B4B', '#312E81'],

      // ✅ Improved: Executive purple accent
      accent: ['rgba(124, 58, 237, 0.12)', 'rgba(124, 58, 237, 0.06)', 'rgba(124, 58, 237, 0.02)'],
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
  },
  'MODERN_FINANCE'
);

// WARM_LUXURY_THEME - Luxury gold/brown theme
export const WARM_LUXURY_THEME = createTheme(
  {
    primary: '#EA580C',
    primaryDark: '#C2410C',
    primaryLight: '#FB923C',
    meshBackground: ['#EA580C', '#FB923C', '#F59E0B', '#6B5B4C'],
    gradient: {
      // ✅ Improved: Rich chocolate to caramel progression
      primary: ['#1C1917', '#44403C', '#78716C'],

      // ✅ Improved: Luxurious warm card background
      card: ['#2C2420', '#44403C', '#6B5B4C'],

      // ✅ Improved: Premium amber button gradient
      button: ['#FB923C', '#EA580C', '#C2410C'],

      // ✅ Improved: Sophisticated warm header
      header: ['#1C1917', '#44403C', 'rgba(234, 88, 12, 0.30)'],

      // ✅ Improved: Luxury gold success
      success: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Vibrant luxury orange
      warning: ['#FB923C', '#EA580C', '#C2410C'],

      // ✅ Improved: Deep brown elegance
      error: ['#92400E', '#7C2D12', '#451A03'],

      // ✅ Improved: Rich earth tones
      subtle: ['#1C1917', '#2C2420', '#44403C'],

      // ✅ Improved: Warm luxury glow
      accent: ['rgba(234, 88, 12, 0.15)', 'rgba(234, 88, 12, 0.08)', 'rgba(234, 88, 12, 0.03)'],
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
  },
  'WARM_LUXURY'
);

// NEO_BANKING_THEME - Futuristic cyan tech theme
export const NEO_BANKING_THEME = createTheme(
  {
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    primaryLight: '#38BDF8',
    meshBackground: ['#0EA5E9', '#38BDF8', '#06B6D4', '#9333EA'],
    gradient: {
      // ✅ Improved: Deep space progression
      primary: ['#030712', '#0F172A', '#1E293B'],

      // ✅ Improved: Tech card with better contrast
      card: ['#0F172A', '#1E293B', '#334155'],

      // ✅ Improved: Futuristic cyan button
      button: ['#38BDF8', '#0EA5E9', '#0284C7'],

      // ✅ Improved: Tech header with glow
      header: ['#030712', '#1E293B', 'rgba(14, 165, 233, 0.30)'],

      // ✅ Improved: Bright tech cyan success
      success: ['#06B6D4', '#0891B2', '#0E7490'],

      // ✅ Improved: Tech amber warning
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Electric purple error
      error: ['#A855F7', '#9333EA', '#7C3AED'],

      // ✅ Improved: Deep tech subtle grays
      subtle: ['#030712', '#0F172A', '#1E293B'],

      // ✅ Improved: Cyan tech glow
      accent: ['rgba(14, 165, 233, 0.18)', 'rgba(14, 165, 233, 0.10)', 'rgba(14, 165, 233, 0.03)'],
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
  },
  'NEO_BANKING'
);

// DARK_MODE_FOCUSED_THEME - Purple-focused throughout
export const DARK_MODE_FOCUSED_THEME = createTheme(
  {
    primary: '#A855F7',
    primaryDark: '#9333EA',
    primaryLight: '#C084FC',
    meshBackground: ['#A855F7', '#9333EA', '#F43F5E', '#FBBF24'],
    gradient: {
      // ✅ Improved: Pure black to deep gray progression
      primary: ['#0A0A0A', '#171717', '#262626'],

      // ✅ Improved: Dark card with purple hint
      card: ['#171717', '#262626', '#404040'],

      // ✅ Improved: Vibrant purple button
      button: ['#C084FC', '#A855F7', '#9333EA'],

      // ✅ Improved: Dark header with purple glow
      header: ['#0A0A0A', '#262626', 'rgba(168, 85, 247, 0.25)'],

      // ✅ Improved: Consistent purple success
      success: ['#A855F7', '#9333EA', '#7C3AED'],

      // ✅ Improved: Bright yellow warning
      warning: ['#FBBF24', '#F59E0B', '#D97706'],

      // ✅ Improved: Pink error gradient
      error: ['#F43F5E', '#E11D48', '#BE123C'],

      // ✅ Improved: Very dark subtle grays
      subtle: ['#0A0A0A', '#171717', '#262626'],

      // ✅ Improved: Purple glow accent
      accent: ['rgba(168, 85, 247, 0.15)', 'rgba(168, 85, 247, 0.08)', 'rgba(168, 85, 247, 0.03)'],
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
  },
  'DARK_MODE_FOCUSED'
);

// EARTHY_CALM_THEME - Natural forest greens
export const EARTHY_CALM_THEME = createTheme(
  {
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryLight: '#22C55E',
    meshBackground: ['#22C55E', '#15803D', '#F59E0B', '#DC2626'],
    gradient: {
      // ✅ Improved: Natural earth progression
      primary: ['#1F2937', '#374151', '#4A5568'],

      // ✅ Improved: Warmer earth card tones
      card: ['#2D3748', '#4A5568', '#6B7280'],

      // ✅ Improved: Forest green button
      button: ['#22C55E', '#16A34A', '#15803D'],

      // ✅ Improved: Natural header with green accent
      header: ['#1F2937', '#4A5568', 'rgba(22, 163, 74, 0.25)'],

      // ✅ Improved: Vibrant forest success
      success: ['#22C55E', '#16A34A', '#15803D'],

      // ✅ Improved: Earthy orange warning
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Natural red error
      error: ['#DC2626', '#B91C1C', '#991B1B'],

      // ✅ Improved: Muted earth subtle tones
      subtle: ['#1F2937', '#2D3748', '#374151'],

      // ✅ Improved: Natural green overlay
      accent: ['rgba(22, 163, 74, 0.12)', 'rgba(22, 163, 74, 0.06)', 'rgba(22, 163, 74, 0.02)'],
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
  },
  'EARTHY_CALM'
);

// MINIMAL_MONOCHROME_THEME - Pure black/white/gray
export const MINIMAL_MONOCHROME_THEME = createTheme(
  {
    primary: '#000000',
    primaryDark: '#000000',
    primaryLight: '#404040',
    meshBackground: ['#000000', '#404040', '#737373', '#E5E5E5'],
    gradient: {
      // ✅ Improved: Clean white to gray progression
      primary: ['#FFFFFF', '#F5F5F5', '#E5E5E5'],

      // ✅ Improved: Pure minimalist card
      card: ['#FFFFFF', '#FAFAFA', '#F0F0F0'],

      // ✅ Improved: Bold black button
      button: ['#000000', '#171717', '#404040'],

      // ✅ Improved: Minimalist header with subtle accent
      header: ['#FFFFFF', '#F0F0F0', 'rgba(0, 0, 0, 0.15)'],

      // ✅ Improved: Monochrome success
      success: ['#404040', '#262626', '#000000'],

      // ✅ Improved: Dark gray warning
      warning: ['#737373', '#525252', '#404040'],

      // ✅ Improved: Medium gray error
      error: ['#737373', '#525252', '#404040'],

      // ✅ Improved: Very light minimal grays
      subtle: ['#FFFFFF', '#FAFAFA', '#F5F5F5'],

      // ✅ Improved: Barely-there black overlay
      accent: ['rgba(0, 0, 0, 0.04)', 'rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.01)'],
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
  },
  'MINIMAL_MONOCHROME'
);

// SUNSET_VIBES_THEME - Warm sunset colors
export const SUNSET_VIBES_THEME = createTheme(
  {
    primary: '#F97316',
    primaryDark: '#EA580C',
    primaryLight: '#FB923C',
    meshBackground: ['#FB923C', '#F97316', '#EA580C', '#EC4899'],
    gradient: {
      // ✅ Improved: Sunset cream progression
      primary: ['#FFF7ED', '#FFEDD5', '#FED7AA'],

      // ✅ Improved: Warm sunset card tones
      card: ['#FFEDD5', '#FED7AA', '#FDBA74'],

      // ✅ Improved: Vibrant sunset button
      button: ['#FB923C', '#F97316', '#EA580C'],

      // ✅ Improved: Warm sunset header
      header: ['#FFF7ED', '#FED7AA', 'rgba(249, 115, 22, 0.30)'],

      // ✅ Improved: Golden sunset success
      success: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Bright sunset warning
      warning: ['#FB923C', '#F97316', '#EA580C'],

      // ✅ Improved: Sunset pink error
      error: ['#EC4899', '#DB2777', '#BE185D'],

      // ✅ Improved: Very warm light subtles
      subtle: ['#FFF7ED', '#FFEDD5', '#FED7AA'],

      // ✅ Improved: Warm sunset glow
      accent: ['rgba(249, 115, 22, 0.12)', 'rgba(249, 115, 22, 0.06)', 'rgba(249, 115, 22, 0.03)'],
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
  },
  'SUNSET_VIBES'
);

// OCEAN_DEPTHS_THEME - Deep ocean blues and teals
export const OCEAN_DEPTHS_THEME = createTheme(
  {
    primary: '#0F766E',
    primaryDark: '#0D9488',
    primaryLight: '#14B8A6',
    meshBackground: ['#14B8A6', '#0D9488', '#2563EB', '#1E40AF'],
    gradient: {
      // ✅ Improved: Deep ocean progression
      primary: ['#042F2E', '#134E4A', '#0F766E'],

      // ✅ Improved: Ocean depth cards
      card: ['#134E4A', '#0F766E', '#14B8A6'],

      // ✅ Improved: Bright teal button
      button: ['#14B8A6', '#0D9488', '#0F766E'],

      // ✅ Improved: Ocean header with aqua glow
      header: ['#042F2E', '#0F766E', 'rgba(15, 118, 110, 0.30)'],

      // ✅ Improved: Bright aqua success
      success: ['#14B8A6', '#0D9488', '#0F766E'],

      // ✅ Improved: Ocean amber warning
      warning: ['#F59E0B', '#D97706', '#B45309'],

      // ✅ Improved: Deep blue ocean error
      error: ['#2563EB', '#1E40AF', '#1D4ED8'],

      // ✅ Improved: Very deep ocean subtles
      subtle: ['#042F2E', '#134E4A', '#0F766E'],

      // ✅ Improved: Aqua ocean glow
      accent: ['rgba(15, 118, 110, 0.15)', 'rgba(15, 118, 110, 0.08)', 'rgba(15, 118, 110, 0.03)'],
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
  },
  'OCEAN_DEPTHS'
);

// 🏆 PLATINUM_ELEGANCE_THEME - TRUE Luxury black/platinum/gold
export const PLATINUM_ELEGANCE_THEME = createTheme(
  {
    // ✅ FIXED: True refined gold, not bright yellow
    primary: '#D4AF37', // Classic gold
    primaryDark: '#B8860B', // Dark gold
    primaryLight: '#DAA520', // Light gold
    meshBackground: ['#D4AF37', '#B8860B', '#C7C7CC', '#000000'],
    gradient: {
      // ✅ FIXED: True luxury black to platinum progression
      primary: ['#000000', '#1C1C1E', '#2C2C2E'],

      // ✅ FIXED: Platinum card backgrounds with cool gray tones
      card: ['#1C1C1E', '#2C2C2E', '#E5E4E2'],

      // ✅ FIXED: Refined gold button gradient (not yellow)
      button: ['#DAA520', '#D4AF37', '#B8860B'],

      // ✅ FIXED: Black to platinum to subtle gold accent
      header: ['#000000', '#2C2C2E', 'rgba(212, 175, 55, 0.20)'],

      // ✅ FIXED: Elegant gold success (luxury feel)
      success: ['#D4AF37', '#B8860B', '#9A7B0A'],

      // ✅ FIXED: Refined warm gold warning
      warning: ['#DAA520', '#D4AF37', '#B8860B'],

      // ✅ FIXED: Cool platinum silver error (elegant alternative)
      error: ['#C7C7CC', '#AEAEB2', '#8E8E93'],

      // ✅ FIXED: Deep luxury blacks and platinums
      subtle: ['#000000', '#1C1C1E', '#2C2C2E'],

      // ✅ FIXED: Refined golden glow (not yellow)
      accent: ['rgba(212, 175, 55, 0.12)', 'rgba(212, 175, 55, 0.06)', 'rgba(212, 175, 55, 0.02)'],
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
    // ✅ FIXED: True luxury colors
    success: '#D4AF37', // Classic gold instead of bright yellow
    warning: '#DAA520', // Refined gold
    error: '#C7C7CC', // Cool platinum silver
    info: '#D4AF37', // Classic gold
    asset: '#D4AF37', // Classic gold
    liability: '#C7C7CC', // Cool platinum silver
    border: {
      primary: '#2C2C2E',
      secondary: '#3A3A3C',
      focus: '#D4AF37',
    },
    interactive: {
      hover: 'rgba(212, 175, 55, 0.1)',
      pressed: 'rgba(212, 175, 55, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.1)',
    },
  },
  'PLATINUM_ELEGANCE'
);

// --- New Additions for Component Compatibility ---

// A map of simple names to the full theme objects, used by the theme picker.
const allThemes = {
  DARK: DARK_THEME,
  LIGHT: LIGHT_THEME,
  MODERN_FINANCE: MODERN_FINANCE_THEME,
  WARM_LUXURY: WARM_LUXURY_THEME,
  NEO_BANKING: NEO_BANKING_THEME,
  DARK_MODE_FOCUSED: DARK_MODE_FOCUSED_THEME,
  EARTHY_CALM: EARTHY_CALM_THEME,
  MINIMAL_MONOCHROME: MINIMAL_MONOCHROME_THEME,
  SUNSET_VIBES: SUNSET_VIBES_THEME,
  OCEAN_DEPTHS: OCEAN_DEPTHS_THEME,
  PLATINUM_ELEGANCE: PLATINUM_ELEGANCE_THEME,
};

// An array of the simple theme names, for iterating in the picker.
export const THEMES = Object.keys(allThemes);

// A helper function to get a theme by its simple name.
export const getTheme = themeName => {
  return allThemes[themeName] || DARK_THEME;
};
