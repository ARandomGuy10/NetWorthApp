import React, { JSX, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Theme } from '@/lib/supabase';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  activeColor?: string;
  inactiveColor?: string;
}

export default function Switch({ 
  value, 
  onValueChange, 
  disabled = false,
  size = 'medium',
  activeColor = '#10B981',
  inactiveColor = '#F87171'
}: SwitchProps): JSX.Element {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();
  const { impactAsync } = useHaptics();
  const styles = getStyles(theme);

  const sizes = {
    small: { width: 36, height: 20, thumbSize: 16 },
    medium: { width: 44, height: 24, thumbSize: 20 },
    large: { width: 52, height: 28, thumbSize: 24 },
  };

  const currentSize = sizes[size];

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,  // Changed to true for consistency
      tension: 100,
      friction: 8,
    }).start();
  }, [value, animatedValue]);

  const handlePress = (): void => {
    if (disabled) return;

    // Haptic feedback
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Use a different animation approach that works well with native driver
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        delay: 100,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    onValueChange(!value);
  };

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, currentSize.width - currentSize.thumbSize - 2],
  });

  const thumbScale = Animated.multiply(
    animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.1, 1],
    }),
    scaleAnim
  );

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: currentSize.width,
          height: currentSize.height,
        },
        disabled && styles.disabled
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackColor,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: currentSize.thumbSize,
              height: currentSize.thumbSize,
              borderRadius: currentSize.thumbSize / 2,
              transform: [
                { translateX: thumbTranslateX },
                { scale: thumbScale }
              ],
            }
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    flex: 1,
    borderRadius: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    backgroundColor: theme.colors.background.card,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});
