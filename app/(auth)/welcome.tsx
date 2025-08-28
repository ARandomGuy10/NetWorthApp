// welcome.tsx - PROPERLY SIZED SOCIAL BUTTONS
import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions, Image} from 'react-native';
import {router} from 'expo-router';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import BackgroundGlow from '@/components/ui/BackgroundGlow';
import {AnimatedButton, sharedStyles} from '@/components/auth/SharedAuthComponents';
import {useHaptics} from '@/hooks/useHaptics';

// Get screen dimensions
const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Proper responsive sizing
const getResponsiveSizes = () => {
  const isSmallDevice = screenHeight < 700;

  if (isSmallDevice) {
    return {
      logoSize: 50,
      titleSize: 24,
      subtitleSize: 14,
      iconSize: 20,
      featureTitleSize: 14,
      featureSubtitleSize: 12,
      verticalSpacing: 12,
      containerPadding: 20,
      featurePadding: 12,
    };
  } else {
    return {
      logoSize: 60,
      titleSize: 28,
      subtitleSize: 16,
      iconSize: 24,
      featureTitleSize: 16,
      featureSubtitleSize: 14,
      verticalSpacing: 16,
      containerPadding: 24,
      featurePadding: 16,
    };
  }
};

const sizes = getResponsiveSizes();

// Feature interface
interface Feature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
}

// Features data
const features: Feature[] = [
  {
    icon: 'trending-up',
    title: 'Track Today, Thrive Tomorrow',
    subtitle: 'Your net worth journey starts here.',
    color: '#22c55e',
  },
  {
    icon: 'wallet',
    title: 'All Your Finances, Simplified',
    subtitle: 'Assets, liabilities, and balances — all in one clean view.',
    color: '#3b82f6',
  },
  {
    icon: 'shield-checkmark',
    title: 'Grow Wealth, Not Worries',
    subtitle: 'Set reminders and stay consistent without the stress.',
    color: '#8b5cf6',
  },
];

// Feature Card Component
const FeatureCard: React.FC<{
  feature: Feature;
  index: number;
}> = ({feature, index}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = 200 + index * 100;

    opacity.value = withDelay(delay, withTiming(1, {duration: 400, easing: Easing.out(Easing.quad)}));
    translateY.value = withDelay(delay, withTiming(0, {duration: 400, easing: Easing.out(Easing.quad)}));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.featureCard, animatedStyle]}>
      <View style={[styles.featureIconContainer, {backgroundColor: `${feature.color}20`}]}>
        <Ionicons name={feature.icon} size={sizes.iconSize} color={feature.color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
      </View>
    </Animated.View>
  );
};

// Logo Component using @/assets/icon.png
const AppLogo: React.FC = () => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, {duration: 600, easing: Easing.out(Easing.back(1.1))});
    opacity.value = withTiming(1, {duration: 600});
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.logoContainer, animatedStyle]}>
      <Image source={require('@/assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
    </Animated.View>
  );
};

const WelcomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {impactAsync} = useHaptics();

  // Animated values
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(100, withTiming(1, {duration: 500}));
    subtitleOpacity.value = withDelay(250, withTiming(1, {duration: 500}));
    buttonsOpacity.value = withDelay(700, withTiming(1, {duration: 500}));
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleCreateAccount = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(auth)/sign-up');
  }, [impactAsync]);

  const handleSignIn = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/sign-in');
  }, [impactAsync]);

  return (
    <>
      <StatusBar style="light" translucent />
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <BackgroundGlow />

        <View style={[styles.contentContainer, {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40}]}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <AppLogo />

            <Animated.View style={titleAnimatedStyle}>
              <Text style={styles.appName} allowFontScaling={false}>
                NetWorthTrackr
              </Text>
            </Animated.View>

            <Animated.View style={subtitleAnimatedStyle}>
              <Text style={styles.tagline} allowFontScaling={false}>
                The smart, simple way to track your wealth and visualize your financial growth.
              </Text>
            </Animated.View>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </View>

          {/* 🎯 FIXED: Buttons using exact same styling as social buttons */}
          <Animated.View style={[styles.buttonsSection, buttonsAnimatedStyle]}>
            {/* Primary Blue Social Button - EXACT same size as social buttons */}
            <AnimatedButton style={sharedStyles.socialButtonBlue} onPress={handleCreateAccount} hapticType="medium">
              <Text style={sharedStyles.socialButtonText} allowFontScaling={false}>
                Create Account
              </Text>
            </AnimatedButton>

            {/* Secondary Dark Social Button - uses sharedStyles directly */}
            <AnimatedButton style={sharedStyles.socialButtonDark} onPress={handleSignIn} hapticType="light">
              <Text style={sharedStyles.socialButtonText} allowFontScaling={false}>
                I have an account
              </Text>
            </AnimatedButton>
          </Animated.View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: sizes.containerPadding,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoImage: {
    width: sizes.logoSize,
    height: sizes.logoSize,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: sizes.titleSize,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: sizes.subtitleSize,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: sizes.subtitleSize * 1.4,
    marginBottom: 24,
  },
  featuresSection: {
    paddingVertical: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: sizes.featurePadding,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIconContainer: {
    width: sizes.iconSize + 12,
    height: sizes.iconSize + 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: sizes.featureTitleSize,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
    lineHeight: sizes.featureTitleSize * 1.2,
  },
  featureSubtitle: {
    fontSize: sizes.featureSubtitleSize,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: sizes.featureSubtitleSize * 1.3,
  },
  buttonsSection: {
    paddingBottom: 20,
  },
});

export default WelcomeScreen;
