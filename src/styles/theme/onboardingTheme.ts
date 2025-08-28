import {Dimensions} from 'react-native';

// Get screen dimensions for responsive sizing
const {height: screenHeight} = Dimensions.get('window');

// Responsive sizing for 4-8 inch devices
const getCompactSizes = () => {
  if (screenHeight <= 667) {
    return {
      titleSize: 26,
      subtitleSize: 14,
      inputHeight: 42,
      buttonHeight: 44,
      verticalSpacing: 8,
      fontSize: 14,
    };
  } else if (screenHeight <= 812) {
    return {
      titleSize: 28,
      subtitleSize: 15,
      inputHeight: 44,
      buttonHeight: 46,
      verticalSpacing: 10,
      fontSize: 15,
    };
  } else {
    return {
      titleSize: 30,
      subtitleSize: 16,
      inputHeight: 46,
      buttonHeight: 48,
      verticalSpacing: 12,
      fontSize: 16,
    };
  }
};

const responsiveSizes = getCompactSizes();

const sharedStyles = {
  title: {
    fontSize: responsiveSizes.titleSize,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: responsiveSizes.verticalSpacing,
    textAlign: 'left' as const,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: responsiveSizes.subtitleSize,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: responsiveSizes.verticalSpacing * 2,
    textAlign: 'left' as const,
    lineHeight: responsiveSizes.subtitleSize * 1.4,
  },
  inputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: responsiveSizes.verticalSpacing / 2,
    height: responsiveSizes.inputHeight,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(24, 60, 109, 0.8)',
    backgroundColor: '#112a52',
    paddingHorizontal: 14,
    width: '100%' as const,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {marginRight: 10, opacity: 0.8},
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: responsiveSizes.fontSize,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  socialButtonDark: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: responsiveSizes.buttonHeight,
    borderRadius: responsiveSizes.buttonHeight / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
    marginBottom: responsiveSizes.verticalSpacing,
    width: '100%' as const,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: responsiveSizes.fontSize,
    fontWeight: '600' as const,
  },
  gradientButtonContainer: {
    width: '100%' as const,
    borderRadius: responsiveSizes.buttonHeight / 2,
    marginTop: responsiveSizes.verticalSpacing * 2,
    marginBottom: responsiveSizes.verticalSpacing,
    overflow: 'hidden' as const,
    shadowColor: '#22c55e',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientButton: {
    height: responsiveSizes.buttonHeight,
    borderRadius: responsiveSizes.buttonHeight / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveSizes.fontSize,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerButtonDark: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#112a52',
    borderWidth: 1,
    borderColor: 'rgba(24, 60, 109, 0.8)',
    minHeight: 40,
    minWidth: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: responsiveSizes.fontSize - 1,
    fontWeight: '600' as const,
  },
  errorText: {
    color: '#ef4444',
    fontSize: responsiveSizes.fontSize - 3,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
    marginBottom: 4,
    textAlign: 'left' as const,
    paddingLeft: 4,
  },
  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: responsiveSizes.verticalSpacing * 1.5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter_500Medium',
    fontSize: responsiveSizes.fontSize - 1,
  },
  socialContainer: {
    flexDirection: 'column' as const,
    gap: 0,
  },
};

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

  // Centralized responsive sizes and shared styles
  responsiveSizes,
  sharedStyles,

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
