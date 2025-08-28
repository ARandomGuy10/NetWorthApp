export const onboardingTheme = {
  colors: {
    primary: '#1a4e8d', // App brand blue
    primaryLight: '#3b82f6', // Bright blue for highlights
    primaryDark: '#0a1120', // Deepest background blue

    background: {
      primary: '#0a1120', // Darkest blue background
      secondary: '#112a52', // Mid-tone blue (inputs/cards)
      gradientStart: '#0a1120', // For gradient top-left
      gradientEnd: '#1a4e8d', // For gradient bottom-right
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#A0B0D0', // Softer muted blue
      inverse: '#000000',
    },

    border: {
      primary: 'rgba(24, 60, 109, 0.8)',
      focused: '#1a4e8d',
      error: '#FF3B30',
    },

    glow: {
      primary: '#1a4e8d',
      button: '#22c55e', // Green for buttons
    },

    button: {
      gradientStart: '#22c55e',
      gradientEnd: '#86efac',
    },

    social: {
      appleIcon: '#FFFFFF',
      googleIcon: '#DB4437',
    },
  },

  shadows: {
    button: {
      shadowColor: '#22c55e',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 12,
    },
    input: {
      shadowColor: '#1a4e8d',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Mesh backgrounds for onboarding sections
  intro: {
    background: '#0a1120',
    text: '#FFFFFF',
    meshBackground: [
      '#0a1120', // deep blue
      '#112a52', // mid-tone
      '#1a4e8d', // lighter blue
      '#3b82f6', // bright accent for highlights
    ],
  },
  clarity: {
    background: '#0a1120',
    text: '#FFFFFF',
    meshBackground: [
      '#0a1120',
      '#112a52',
      '#1a4e8d',
      '#7C3AED', // subtle purple accent
    ],
  },
  growth: {
    background: '#0a1120',
    text: '#FFFFFF',
    meshBackground: [
      '#0a1120',
      '#112a52',
      '#1a4e8d',
      '#22C55E', // green accent for growth
    ],
  },
  final: {
    background: '#0a1120',
    text: '#FFFFFF',
    meshBackground: [
      '#0a1120',
      '#112a52',
      '#1a4e8d',
      '#FBBF24', // golden accent for achievement
    ],
  },
} as const;
