// components/ui/MeshBackgroundGlow.tsx
import React, {useEffect, useMemo} from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';
import GradientBackground from './GradientBackgroundDark';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type GlowProps = {
  style: any;
  duration: number;
  delay?: number;
  colors: readonly [string, string];
};

const Glow = ({style, duration, delay = 0, colors}: GlowProps) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    const easing = Easing.inOut(Easing.sin);
    scale.value = withRepeat(withTiming(1.3, {duration, easing}), -1, true);
    translateX.value = withRepeat(withTiming(30, {duration: duration * 1.2, easing}), -1, true);
    translateY.value = withRepeat(withTiming(-30, {duration: duration * 1.3, easing}), -1, true);
    opacity.value = withRepeat(withTiming(0.8, {duration: duration * 0.8, easing}), -1, true);
  }, [duration]);

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

type MeshBackgroundGlowProps = {
  colors?: readonly string[];
  glowColors?: [string, string][];
  glowDurations?: number[];
};

const MeshBackgroundGlow = ({
  colors = ['rgba(59,130,246,0.2)', 'rgba(34,197,94,0.15)', 'rgba(168,85,247,0.12)', 'rgba(249,115,22,0.1)'],
  glowColors = [
    ['rgba(59,130,246,0.15)', 'transparent'],
    ['rgba(34,197,94,0.12)', 'transparent'],
    ['rgba(168,85,247,0.1)', 'transparent'],
  ],
  glowDurations = [8000, 10000, 12000],
}: MeshBackgroundGlowProps) => {
  const {width, height} = Dimensions.get('window');

  // Glow positions
  const glow1Style = useMemo(() => ({width: 350, height: 350, left: -100, top: height * 0.1}), [width, height]);
  const glow2Style = useMemo(() => ({width: 400, height: 400, right: -120, bottom: height * 0.2}), [width, height]);
  const glow3Style = useMemo(() => ({width: 300, height: 300, left: width * 0.3, top: height * 0.6}), [width, height]);

  // Mesh motion shared values
  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  const animScale = useSharedValue(0);

  useEffect(() => {
    const loop = (val: typeof animX, duration: number, range: number) => {
      val.value = withRepeat(withTiming(range, {duration, easing: Easing.inOut(Easing.sin)}), -1, true);
    };
    loop(animX, 12000, 15);
    loop(animY, 14000, -20);
    loop(animScale, 16000, 10);
  }, []);

  const animatedMeshStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: interpolate(animX.value, [-20, 20], [-10, 10])},
      {translateY: interpolate(animY.value, [-20, 20], [-10, 10])},
      {scale: interpolate(animScale.value, [-10, 10], [0.97, 1.03])},
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dark base layer to preserve richness */}
      <AnimatedLinearGradient colors={['#0a1120', '#0a1120']} style={StyleSheet.absoluteFill} />

      {/* Enhanced radial gradients with motion */}
      <GradientBackground colors={colors} />

      {/* Mesh background motion */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedMeshStyle]}>
        <Svg height="100%" width="100%">
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
          {colors.map((_, idx) => (
            <Rect key={`rect-${idx}`} width="100%" height="100%" fill={`url(#grad${idx})`} />
          ))}
        </Svg>
      </Animated.View>

      {/* Glow circles */}
      <Glow style={glow1Style} duration={glowDurations[0]} colors={glowColors[0]} />
      <Glow style={glow2Style} duration={glowDurations[1]} delay={2000} colors={glowColors[1]} />
      <Glow style={glow3Style} duration={glowDurations[2]} delay={4000} colors={glowColors[2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    borderRadius: 200,
  },
});

export default MeshBackgroundGlow;
