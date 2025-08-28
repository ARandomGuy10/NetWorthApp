// src/components/auth/SharedAuthComponents.tsx - UPDATED FOCUS ANIMATION
import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
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
import GoogleIcon from '@/components/ui/GoogleIcon';
import {useHaptics} from '@/hooks/useHaptics';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

// Centralize and export styles and sizes directly from the theme.
export const {sharedStyles, responsiveSizes} = onboardingTheme;
// Create local aliases for use within this file.
const styles = sharedStyles;
const sizes = responsiveSizes;

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
        onboardingTheme.colors.border.error,
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
  disabled?: boolean;
  highlight?: boolean;
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
  style?: TouchableOpacityProps['style'];
}> = ({children, onPress, disabled, loading, success, style}) => {
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
      style={[styles.gradientButtonContainer, style]}
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
