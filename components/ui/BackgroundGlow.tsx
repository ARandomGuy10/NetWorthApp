// components/ui/BackgroundGlow.tsx (refined for darker theme)
import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Glow = ({
  style,
  duration,
  delay = 0,
  colors,
}: {
  style: any;
  duration: number;
  delay?: number;
  colors: readonly [string, string];
}) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const easing = Easing.inOut(Easing.sin);

    // More subtle animations for darker theme
    scale.value = withRepeat(withTiming(1.3, {duration, easing}), -1, true);
    translateX.value = withRepeat(withTiming(30, {duration: duration * 1.2, easing}), -1, true);
    translateY.value = withRepeat(withTiming(-30, {duration: duration * 1.3, easing}), -1, true);
    opacity.value = withRepeat(withTiming(0.8, {duration: duration * 0.8, easing}), -1, true);
  }, [duration, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}, {translateY: translateY.value}, {scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <AnimatedLinearGradient
      colors={colors}
      style={[styles.glow, style, animatedStyle]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    />
  );
};

const BackgroundGlow = () => {
  const {width, height} = Dimensions.get('window');

  // Darker, more subtle glow positions
  const glow1Style = useMemo(
    () => ({
      width: 350,
      height: 350,
      left: -100,
      top: height * 0.1,
    }),
    [width, height]
  );

  const glow2Style = useMemo(
    () => ({
      width: 400,
      height: 400,
      right: -120,
      bottom: height * 0.2,
    }),
    [width, height]
  );

  const glow3Style = useMemo(
    () => ({
      width: 300,
      height: 300,
      left: width * 0.3,
      top: height * 0.6,
    }),
    [width, height]
  );

  return (
    <>
      {/* Primary dark blue glow */}
      <Glow
        style={glow1Style}
        duration={8000}
        delay={0}
        colors={['rgba(59, 130, 246, 0.15)', 'transparent']} // Blue
      />

      {/* Secondary dark green glow */}
      <Glow
        style={glow2Style}
        duration={10000}
        delay={2000}
        colors={['rgba(34, 197, 94, 0.12)', 'transparent']} // Green
      />

      {/* Tertiary purple glow */}
      <Glow
        style={glow3Style}
        duration={12000}
        delay={4000}
        colors={['rgba(168, 85, 247, 0.1)', 'transparent']} // Purple
      />
    </>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    borderRadius: 200,
  },
});

export default BackgroundGlow;
