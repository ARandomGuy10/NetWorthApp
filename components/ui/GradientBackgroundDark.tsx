
import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Animated, Easing} from 'react-native';
import Svg, {Defs, RadialGradient, Stop, Rect} from 'react-native-svg';

type GradientBackgroundProps = {
  colors: readonly string[]; // 1–4 colors from theme
};

export default function GradientBackgroundDark({colors}: GradientBackgroundProps) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (animatedVal: Animated.Value, reverse = false) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedVal, {
            toValue: reverse ? -80 : 80,
            duration: 12000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animatedVal, {
            toValue: reverse ? 20 : -20,
            duration: 12000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    loop(anim1);
    loop(anim2, true);
  }, []);

  const translate1 = anim1.interpolate({
    inputRange: [-80, 80],
    outputRange: ['-10%', '10%'],
  });

  const translate2 = anim2.interpolate({
    inputRange: [-80, 80],
    outputRange: ['10%', '-10%'],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
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
              {/* Fade to black instead of transparent */}
              <Stop offset="100%" stopColor="#000000" stopOpacity={1} />
            </RadialGradient>
          ))}
        </Defs>

        {/* Animated gradients for liquid motion */}
        <Animated.View style={{transform: [{translateX: translate1}]}}>
          <Rect width="100%" height="100%" fill="url(#grad0)" />
        </Animated.View>

        {colors[1] && (
          <Animated.View style={{transform: [{translateY: translate2}]}}>
            <Rect width="100%" height="100%" fill="url(#grad1)" />
          </Animated.View>
        )}

        {/* Remaining gradients static */}
        {colors[2] && <Rect width="100%" height="100%" fill="url(#grad2)" />}
        {colors[3] && <Rect width="100%" height="100%" fill="url(#grad3)" />}
      </Svg>
    </View>
  );
}
