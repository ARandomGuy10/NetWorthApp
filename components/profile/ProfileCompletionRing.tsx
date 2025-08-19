import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProfileCompletionRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  children: React.ReactNode;
}

const ProfileCompletionRing: React.FC<ProfileCompletionRingProps> = ({
  size,
  strokeWidth,
  progress,
  children,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 800 });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - animatedProgress.value),
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          stroke={theme.colors.background.tertiary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <AnimatedCircle
          stroke={theme.colors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.childContainer}>{children}</View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  childContainer: {
    position: 'absolute',
  },
});

export default ProfileCompletionRing;