import React, {useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';

type GradientBackgroundProps = {
  colors: readonly string[]; // 1–4 colors
};

export default function GradientBackground({colors}: GradientBackgroundProps) {
  const {width, height} = Dimensions.get('window');

  // Shared values for subtle liquid motion
  const animX1 = useSharedValue(0);
  const animY1 = useSharedValue(0);
  const animScale1 = useSharedValue(0);

  const animX2 = useSharedValue(0);
  const animY2 = useSharedValue(0);
  const animScale2 = useSharedValue(0);

  useEffect(() => {
    const loop = (val: typeof animX1, duration: number, range: number) => {
      val.value = withRepeat(withTiming(range, {duration, easing: Easing.inOut(Easing.sin)}), -1, true);
    };

    loop(animX1, 12000, 10);
    loop(animY1, 14000, -8);
    loop(animScale1, 16000, 4);

    loop(animX2, 14000, -12);
    loop(animY2, 12000, 10);
    loop(animScale2, 18000, 6);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      {translateX: interpolate(animX1.value, [-10, 10], [-5, 5])},
      {translateY: interpolate(animY1.value, [-10, 10], [-5, 5])},
      {scale: interpolate(animScale1.value, [-4, 4], [0.98, 1.02])},
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      {translateX: interpolate(animX2.value, [-12, 12], [-6, 6])},
      {translateY: interpolate(animY2.value, [-10, 10], [-5, 5])},
      {scale: interpolate(animScale2.value, [-6, 6], [0.97, 1.03])},
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height={height} width={width}>
        <Defs>
          {colors.map((color, idx) => (
            <RadialGradient
              key={`grad-${idx}`}
              id={`grad${idx}`}
              cx={idx % 2 === 0 ? '30%' : '70%'}
              cy={idx < 2 ? '30%' : '70%'}
              r="70%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          ))}
        </Defs>

        {/* Animated mesh layers */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle1]}>
          <Rect width="100%" height="100%" fill={`url(#grad0)`} />
        </Animated.View>

        {colors[1] && (
          <Animated.View style={[StyleSheet.absoluteFill, animatedStyle2]}>
            <Rect width="100%" height="100%" fill={`url(#grad1)`} />
          </Animated.View>
        )}

        {colors[2] && <Rect width="100%" height="100%" fill={`url(#grad2)`} />}
        {colors[3] && <Rect width="100%" height="100%" fill={`url(#grad3)`} />}
      </Svg>
    </View>
  );
}
