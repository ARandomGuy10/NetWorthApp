// src/components/auth/SharedAuthComponents.tsx
import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import GoogleIcon from '@/components/ui/GoogleIcon';
import {AnimatedButtonProps, ErrorMessageProps, OAuthStrategy} from '@/src/types/auth';

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({children, onPress, style, disabled, ...props}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

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

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        {...props}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// NEW: Custom hook for input focus animation
export const useInputFocusAnimation = (focused: boolean) => {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withTiming(focused ? 1 : 0, {duration: 300});
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animation.value,
      [0, 1],
      ['#112a52', '#1a4e8d'] // Your blue colors
    );

    const borderColor = interpolateColor(animation.value, [0, 1], ['rgba(24, 60, 109, 0.8)', '#1a4e8d']);

    return {
      backgroundColor,
      borderColor,
      shadowColor: '#1a4e8d',
      shadowOpacity: animation.value * 0.6,
      shadowRadius: animation.value * 12,
      elevation: animation.value * 8,
      transform: [{scale: 1 + animation.value * 0.01}],
    };
  });

  return animatedStyle;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({message}) => {
  const shakeAnim = useSharedValue(0);

  useEffect(() => {
    if (message) {
      shakeAnim.value = withSequence(
        withTiming(-3, {duration: 50}),
        withTiming(3, {duration: 50}),
        withTiming(-3, {duration: 50}),
        withTiming(0, {duration: 50})
      );
    }
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shakeAnim.value}],
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

  return (
    <AnimatedButton style={styles.socialButtonDark} onPress={() => onPress(strategy)} disabled={disabled}>
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {isGoogle ? <GoogleIcon size={20} /> : <Ionicons name="logo-apple" size={20} color="#FFFFFF" />}
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
}> = ({children, onPress, disabled, loading}) => {
  return (
    <AnimatedButton style={styles.gradientButtonContainer} onPress={onPress} disabled={disabled || loading}>
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

const styles = {
  // FIXED: Input wrapper with proper dark background and animations
  inputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(24, 60, 109, 0.8)', // Default border
    backgroundColor: '#112a52', // DARK BACKGROUND by default
    paddingHorizontal: 16,
    width: '100%' as const,
    // Default shadow
    shadowColor: '#1a4e8d',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },

  // Social buttons
  socialButtonDark: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: 52,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 12,
    marginBottom: 12,
    width: '100%' as const,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600' as const,
  },

  // Gradient button
  gradientButtonContainer: {
    width: '100%' as const,
    borderRadius: 25,
    marginTop: 24,
    marginBottom: 16,
    overflow: 'hidden' as const,
    shadowColor: '#22c55e',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  gradientButton: {
    height: 52,
    borderRadius: 25,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },

  // Header buttons
  headerButtonDark: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#112a52',
    borderWidth: 1,
    borderColor: 'rgba(24, 60, 109, 0.8)',
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600' as const,
  },

  // Error text
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    marginBottom: 4,
    textAlign: 'left' as const,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.5,
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'column' as const,
    gap: 0,
  },
};

export {styles as sharedStyles};
