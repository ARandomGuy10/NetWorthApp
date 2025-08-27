export const onboardingTheme = {
  colors: {
    primary: '#1a4e8d', // Your logo's lighter blue
    primaryLight: '#3b82f6',
    primaryDark: '#0a1120', // Your logo's darkest blue

    background: {
      primary: '#0a1120', // Darkest blue background
      secondary: '#112a52', // Mid-tone blue for inputs
      gradientStart: '#0a1120',
      gradientEnd: '#112a52',
    },

    text: {
      primary: '#FFFFFF',
      secondary: '#8799b7', // Muted blue for subtitles
      inverse: '#000000',
    },

    border: {
      primary: 'rgba(24, 60, 109, 0.8)', // Subtle blue border
      focused: '#1a4e8d', // Your lighter blue for focus
      error: '#FF3B30',
    },

    glow: {
      primary: '#1a4e8d', // Blue glow for focused inputs
      button: '#22c55e', // Green for button gradients
    },

    button: {
      gradientStart: '#22c55e', // Green gradient start
      gradientEnd: '#86efac', // Green gradient end (lighter)
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
} as const;
