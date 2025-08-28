// src/components/auth/SharedAuthComponents.tsx - UPDATED FOCUS ANIMATION
import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  Dimensions,
  AccessibilityRole,
  GestureResponderEvent,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import GoogleIcon from '@/components/ui/GoogleIcon';
import {useHaptics} from '@/hooks/useHaptics';

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

const sizes = getCompactSizes();

// Proper TypeScript interfaces
export interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  hapticType?: 'light' | 'medium' | 'heavy';
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export interface ErrorMessageProps {
  message?: string;
}

export type OAuthStrategy = 'google' | 'apple';

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const {impactAsync} = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.96, {duration: 100});
      opacity.value = withTiming(0.8, {duration: 100});
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withTiming(1, {duration: 100});
      opacity.value = withTiming(1, {duration: 100});
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && onPress) {
      impactAsync(
        Haptics.ImpactFeedbackStyle[hapticType === 'light' ? 'Light' : hapticType === 'medium' ? 'Medium' : 'Heavy']
      );
      onPress(event);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={style}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        {...props}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🎯 UPDATED: Enhanced input focus animation with lifted effect (no glow)
export const useInputFocusAnimation = (focused: boolean, hasError: boolean = false) => {
  const animation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);
  const {selectionAsync} = useHaptics();

  useEffect(() => {
    animation.value = withTiming(focused ? 1 : 0, {duration: 200});

    if (focused) {
      selectionAsync();
    }
  }, [focused, selectionAsync]);

  useEffect(() => {
    errorAnimation.value = withTiming(hasError ? 1 : 0, {duration: 200});
  }, [hasError]);

  const animatedStyle = useAnimatedStyle(() => {
    // Subtle background change instead of bright glow
    const backgroundColor = interpolateColor(
      animation.value,
      [0, 1],
      ['#112a52', '#1a3355'] // More subtle background change
    );

    // Darker border when focused for "lifted" effect
    const borderColor = interpolateColor(
      errorAnimation.value,
      [0, 1],
      [
        interpolateColor(
          animation.value,
          [0, 1],
          ['rgba(24, 60, 109, 0.8)', '#2a5298'] // Darker blue border when focused
        ),
        onboardingTheme.colors?.border?.error || '#ef4444',
      ]
    );

    return {
      backgroundColor,
      borderColor,
      // Dark shadow for "lifted" effect instead of glow
      shadowColor: '#000000', // Dark shadow instead of blue glow
      shadowOffset: {
        width: 0,
        height: animation.value * 4, // Lift effect
      },
      shadowOpacity: animation.value * 0.15, // Subtle shadow opacity
      shadowRadius: animation.value * 8, // Reduced radius for cleaner look
      elevation: animation.value * 6, // Android elevation for lift effect
      // 🎯 FIXED: Separate transform objects in array
      transform: [
        {scale: 1 + animation.value * 0.02}, // Scale transform
        {translateY: -animation.value * 1}, // Translate transform
      ],
    };
  });

  return animatedStyle;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({message}) => {
  const shakeAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(0);
  const {notificationAsync} = useHaptics();

  useEffect(() => {
    if (message) {
      fadeAnim.value = withTiming(1, {duration: 200});
      shakeAnim.value = withSequence(
        withTiming(-2, {duration: 50}),
        withTiming(2, {duration: 50}),
        withTiming(-2, {duration: 50}),
        withTiming(0, {duration: 50})
      );

      notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      fadeAnim.value = withTiming(0, {duration: 200});
    }
  }, [message, notificationAsync]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shakeAnim.value}],
    opacity: fadeAnim.value,
  }));

  if (!message) return null;

  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.errorText}>{message}</Text>
    </Animated.View>
  );
};

interface SocialButtonProps {
  strategy: OAuthStrategy;
  onPress: (strategy: OAuthStrategy) => void;
  loading: boolean;
  disabled: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({strategy, onPress, loading, disabled}) => {
  const isGoogle = strategy === 'google';

  const handlePress = (event: GestureResponderEvent) => {
    onPress(strategy);
  };

  return (
    <AnimatedButton
      style={styles.socialButtonDark}
      onPress={handlePress}
      disabled={disabled}
      hapticType="medium"
      accessibilityLabel={`Continue with ${isGoogle ? 'Google' : 'Apple'}`}
      accessibilityHint={`Sign ${isGoogle ? 'in' : 'up'} using your ${isGoogle ? 'Google' : 'Apple'} account`}
      accessibilityRole="button">
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {isGoogle ? (
            <GoogleIcon size={sizes.fontSize + 2} />
          ) : (
            <Ionicons name="logo-apple" size={sizes.fontSize + 2} color="#FFFFFF" />
          )}
          <Text style={styles.socialButtonText}>Continue with {isGoogle ? 'Google' : 'Apple'}</Text>
        </>
      )}
    </AnimatedButton>
  );
};

export const GradientButton: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  success?: boolean;
}> = ({children, onPress, disabled, loading, success}) => {
  const {notificationAsync} = useHaptics();

  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  useEffect(() => {
    if (success) {
      notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [success, notificationAsync]);

  return (
    <AnimatedButton
      style={styles.gradientButtonContainer}
      onPress={handlePress}
      disabled={disabled || loading}
      hapticType="heavy"
      accessibilityRole="button">
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientButton}>
        {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : children}
      </LinearGradient>
    </AnimatedButton>
  );
};

export const PasswordToggle: React.FC<{
  showPassword: boolean;
  onToggle: () => void;
}> = ({showPassword, onToggle}) => {
  const handleToggle = (event: GestureResponderEvent) => {
    onToggle();
  };

  return (
    <AnimatedButton
      onPress={handleToggle}
      hapticType="light"
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      accessibilityHint="Toggle password visibility">
      <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={sizes.fontSize} color="rgba(255,255,255,0.5)" />
    </AnimatedButton>
  );
};

const styles = {
  // 🎯 UPDATED: Input wrapper with cleaner focus effect
  inputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: sizes.verticalSpacing / 2,
    height: sizes.inputHeight,
    borderRadius: 10,
    borderWidth: 1.5, // Slightly thicker border for better lift effect
    borderColor: 'rgba(24, 60, 109, 0.8)',
    backgroundColor: '#112a52',
    paddingHorizontal: 14,
    width: '100%' as const,
    // 🎯 UPDATED: Default subtle shadow
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  inputIcon: {
    marginRight: 10,
    opacity: 0.8,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: sizes.fontSize,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
    includeFontPadding: false,
  },

  socialButtonDark: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: sizes.buttonHeight,
    borderRadius: sizes.buttonHeight / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
    marginBottom: sizes.verticalSpacing,
    width: '100%' as const,
  },
  socialButtonBlue: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: sizes.buttonHeight,
    borderRadius: sizes.buttonHeight / 2,
    backgroundColor: '#1460d8ff',
    borderWidth: 1,
    borderColor: '#2563eb',
    gap: 10,
    marginBottom: sizes.verticalSpacing,
    width: '100%' as const,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: sizes.fontSize,
    fontWeight: '600' as const,
  },

  gradientButtonContainer: {
    width: '100%' as const,
    borderRadius: sizes.buttonHeight / 2,
    marginTop: sizes.verticalSpacing * 2,
    marginBottom: sizes.verticalSpacing,
    overflow: 'hidden' as const,
    shadowColor: '#22c55e',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  gradientButton: {
    height: sizes.buttonHeight,
    borderRadius: sizes.buttonHeight / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },

  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: sizes.fontSize,
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
    fontSize: sizes.fontSize - 1,
    fontWeight: '600' as const,
  },

  errorText: {
    color: '#ef4444',
    fontSize: sizes.fontSize - 3,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
    marginBottom: 4,
    textAlign: 'left' as const,
    paddingLeft: 4,
  },

  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: sizes.verticalSpacing * 1.5,
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
    fontSize: sizes.fontSize - 1,
  },

  socialContainer: {
    flexDirection: 'column' as const,
    gap: 0,
  },
};

export {styles as sharedStyles, sizes as responsiveSizes};
