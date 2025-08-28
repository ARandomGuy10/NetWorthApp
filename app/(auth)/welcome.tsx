// welcomeScreen.tsx
import React, {useEffect, useCallback, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
import {router} from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import MeshBackgroundGlow from '@/components/ui/MeshBackgroundGlow';
import {AnimatedButton, sharedStyles, responsiveSizes} from '@/components/auth/SharedAuthComponents';
import {useHaptics} from '@/hooks/useHaptics';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

interface Feature {
  icon: keyof typeof Ionicons.glyphMap; // ensures only valid icon names
  title: string;
  subtitle: string;
  color: string;
}

// Feature data
const features: Feature[] = [
  {
    icon: 'trending-up',
    title: 'Track Today, Thrive Tomorrow',
    subtitle: 'Monitor your net worth and make progress daily.',
    color: '#22c55e',
  },
  {
    icon: 'wallet',
    title: 'All Finances, Simplified',
    subtitle: 'View assets, liabilities, and balances in one place.',
    color: '#3b82f6',
  },
  {
    icon: 'shield-checkmark',
    title: 'Grow Wealth, Stress-Free',
    subtitle: 'Set reminders and stay consistent without worry.',
    color: '#8b5cf6',
  },
];

// Splash logo with fade/scale animation
const SplashLogo: React.FC<{onComplete: () => void}> = ({onComplete}) => {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1, {duration: 800, easing: Easing.out(Easing.back(1.2))}),
      withTiming(1, {duration: 1000})
    );
    opacity.value = withSequence(
      withTiming(1, {duration: 1800}),
      withTiming(0, {duration: 500, easing: Easing.out(Easing.quad)})
    );

    const timeout = setTimeout(onComplete, 2300);
    return () => clearTimeout(timeout);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={[styles.splashContentContainer, style]}>
        <Animated.Image source={require('@/assets/icon.png')} style={styles.splashLogoImage} />
        <Text style={styles.splashAppName}>NetWorthTrackr</Text>
      </Animated.View>
    </View>
  );
};

// Feature card component with subtle icon scale animation
const FeatureCard: React.FC<{feature: (typeof features)[0]; index: number}> = ({feature, index}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    const delay = 200 + index * 100;
    opacity.value = withDelay(delay, withTiming(1, {duration: 400, easing: Easing.out(Easing.quad)}));
    translateY.value = withDelay(delay, withTiming(0, {duration: 400, easing: Easing.out(Easing.quad)}));
    iconScale.value = withRepeat(withTiming(1.05, {duration: 2000, easing: Easing.inOut(Easing.sin)}), -1, true);
  }, [index]);

  const style = useAnimatedStyle(() => ({opacity: opacity.value, transform: [{translateY: translateY.value}]}));
  const iconStyle = useAnimatedStyle(() => ({transform: [{scale: iconScale.value}]}));

  return (
    <Animated.View style={[styles.featureCard, style]}>
      <View style={[styles.featureIconContainer, {backgroundColor: `${feature.color}20`}]}>
        <Animated.View style={iconStyle} accessibilityRole="image" accessibilityLabel={feature.title}>
          <Ionicons name={feature.icon} size={responsiveSizes.fontSize + 4} color={feature.color} />
        </Animated.View>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
      </View>
    </Animated.View>
  );
};

// Regular app logo
const AppLogo: React.FC = () => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.value = withTiming(1, {duration: 600, easing: Easing.out(Easing.back(1.1))});
    opacity.value = withTiming(1, {duration: 600});
  }, []);
  const style = useAnimatedStyle(() => ({transform: [{scale: scale.value}], opacity: opacity.value}));
  return (
    <Animated.View style={[styles.logoContainer, style]}>
      <Image source={require('@/assets/transparent-icon.png')} style={styles.logoImage} resizeMode="contain" />
    </Animated.View>
  );
};

// Welcome content with CTA buttons
const WelcomeContent: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {impactAsync} = useHaptics();

  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(100, withTiming(1, {duration: 500}));
    subtitleOpacity.value = withDelay(250, withTiming(1, {duration: 500}));
    buttonsOpacity.value = withDelay(700, withTiming(1, {duration: 500}));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({opacity: titleOpacity.value}));
  const subtitleStyle = useAnimatedStyle(() => ({opacity: subtitleOpacity.value}));
  const buttonsStyle = useAnimatedStyle(() => ({opacity: buttonsOpacity.value}));

  const handleStart = () => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/sign-up');
  };
  const handleSignIn = () => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/sign-in');
  };

  return (
    <View style={[styles.contentContainer, {paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20}]}>
      <View style={styles.headerSection}>
        <AppLogo />
        <Animated.View style={titleStyle}>
          <Text style={[sharedStyles.title, {textAlign: 'center'}]}>NetWorthTrackr</Text>
        </Animated.View>
        <Animated.View style={subtitleStyle}>
          <Text style={[sharedStyles.subtitle, {textAlign: 'center', marginBottom: 24}]}>
            Track, grow, and visualize your wealth effortlessly.
          </Text>
        </Animated.View>
      </View>

      <View style={styles.featuresSection}>
        {features.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </View>

      <Animated.View style={[styles.buttonsSection, buttonsStyle]}>
        <AnimatedButton
          style={{...styles.primaryButton, backgroundColor: '#22c55e'}}
          onPress={handleStart}
          hapticType="medium">
          <Text style={sharedStyles.socialButtonText}>Get Started</Text>
        </AnimatedButton>
        <AnimatedButton style={styles.secondaryButton} onPress={handleSignIn} hapticType="light">
          <Text style={sharedStyles.socialButtonText}>Sign In</Text>
        </AnimatedButton>
      </Animated.View>
    </View>
  );
};

// Main screen
const WelcomeScreen: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  console.log('WelcomeScreen rendered');
  return (
    <>
      <StatusBar style="light" translucent />
      <MeshBackgroundGlow
        colors={onboardingTheme.intro.meshBackground}
        glowColors={onboardingTheme.final.meshBackground.map(color => [color, 'transparent']) as [string, string][]}
        glowDurations={[8000, 10000, 12000]}
      />
      {showSplash ? <SplashLogo onComplete={handleSplashComplete} /> : <WelcomeContent />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  splashContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  splashContentContainer: {alignItems: 'center', justifyContent: 'center', gap: 16},
  splashLogoImage: {
    width: responsiveSizes.titleSize * 4,
    height: responsiveSizes.titleSize * 4,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  splashAppName: {
    fontSize: responsiveSizes.titleSize,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: responsiveSizes.verticalSpacing * 2,
    justifyContent: 'space-between',
  },
  headerSection: {alignItems: 'center'},
  logoContainer: {marginBottom: 16},
  logoImage: {
    width: responsiveSizes.titleSize * 2,
    height: responsiveSizes.titleSize * 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  featuresSection: {paddingVertical: 20},
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: responsiveSizes.verticalSpacing,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIconContainer: {
    width: responsiveSizes.fontSize + 20,
    height: responsiveSizes.fontSize + 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {flex: 1},
  featureTitle: {
    fontSize: responsiveSizes.fontSize,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
    marginBottom: 2,
    lineHeight: responsiveSizes.fontSize * 1.2,
  },
  featureSubtitle: {
    fontSize: responsiveSizes.fontSize - 2,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: (responsiveSizes.fontSize - 2) * 1.3,
  },
  buttonsSection: {
    paddingBottom: 20,
    marginTop: 24, // Add margin to push buttons away from features
  },
  primaryButton: {
    backgroundColor: '#1a4e8d',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    borderColor: '#3b82f6',
    borderWidth: 1,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default WelcomeScreen;
