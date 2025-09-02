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
// ✅ FIXED: Add colors alias from the theme
const colors = onboardingTheme.colors;

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

// ✅ FIXED: AnimatedButton with proper style handling
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  disabled,
  hapticType = 'light',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...otherProps // ✅ FIXED: Renamed from ...props to avoid shadow spreading
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
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      style={[style, animatedStyle]}
      {...otherProps}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

// ✅ FIXED: Enhanced input focus animation with proper shadow nesting
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

  return useAnimatedStyle(() => {
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
        colors.border.error, // ✅ FIXED: Use colors alias
      ]
    );

    return {
      backgroundColor,
      borderColor,
      // ✅ FIXED: All shadow properties properly nested in style object
      shadowColor: '#000000',
      shadowOpacity: animation.value * 0.15,
      shadowRadius: animation.value * 8,
      elevation: animation.value * 6, // Android shadow
      // ✅ FIXED: Transform array properly structured
      transform: [{scale: 1 + animation.value * 0.02}, {translateY: -animation.value * 1}],
    };
  });
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
    <Animated.View style={[styles.errorMessage, animatedStyle]}>
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

// ✅ FIXED: SocialButton with proper color references
export const SocialButton: React.FC<SocialButtonProps> = ({strategy, onPress, loading, disabled}) => {
  const isGoogle = strategy === 'google';

  const handlePress = (event: GestureResponderEvent) => {
    onPress(strategy);
  };

  return (
    <TouchableOpacity
      style={[styles.socialButton, disabled && styles.socialButtonDisabled]}
      onPress={handlePress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.text.primary} />
      ) : (
        <>
          {isGoogle ? (
            <GoogleIcon size={20} />
          ) : (
            <Ionicons name="logo-apple" size={20} color={colors.social.appleIcon} />
          )}
          <Text style={styles.socialButtonText}>Continue with {isGoogle ? 'Google' : 'Apple'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ✅ FIXED: GradientButton with proper shadow handling
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
    <TouchableOpacity
      // ✅ FIXED: All styles including shadow properly nested in style array
      style={[
        styles.gradientButton,
        // ✅ FIXED: Shadow styles in style object
        {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}>
      <LinearGradient
        colors={[colors.button.gradientStart, colors.button.gradientEnd]} // ✅ FIXED: Use colors alias
        style={styles.gradientButtonInner}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.gradientButtonText}>{children}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ✅ FIXED: PasswordToggle with proper color reference
export const PasswordToggle: React.FC<{
  showPassword: boolean;
  onToggle: () => void;
}> = ({showPassword, onToggle}) => {
  const handleToggle = (event: GestureResponderEvent) => {
    onToggle();
  };

  return (
    <TouchableOpacity style={styles.passwordToggle} onPress={handleToggle}>
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={20}
        color={colors.text.secondary} // ✅ FIXED: Use colors alias instead of sizes.colors
      />
    </TouchableOpacity>
  );
};
