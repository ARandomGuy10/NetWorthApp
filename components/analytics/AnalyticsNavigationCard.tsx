import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
import {ChevronRight} from 'lucide-react-native';
import {LinearGradient} from 'expo-linear-gradient';

import {useHaptics} from '@/hooks/useHaptics';
import {useTheme} from '@/src/styles/theme/ThemeContext';

interface AnalyticsNavigationCardProps {
  item: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    accent: string;
    type: string;
  };
  variant?: 'gradient' | 'neutral';
}

const getCardGradient = (type: string, theme: any): [string, string] => {
  const gradients: Record<string, [string, string]> = {
    performance: ['#FF6B6B', '#FF8E53'],
    trends: ['#4ECDC4', '#44A08D'],
    monthly: ['#A8E6CF', '#7FCDCD'],
    categories: ['#FFD93D', '#6BCF7F'],
    accounts: ['#6C5CE7', '#A29BFE'],
    currency: ['#FD79A8', '#FDCB6E'],
    achievements: ['#00CEC9', '#55A3FF'],
  };
  return gradients[type] || [theme.colors.primary, theme.colors.background.secondary];
};

const AnalyticsNavigationCard: React.FC<AnalyticsNavigationCardProps> = ({item, variant = 'neutral'}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const router = useRouter();
  const Icon = item.icon;

  const isPressed = useSharedValue(false);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: withSpring(isPressed.value ? 0.97 : 1)}, {translateY: withSpring(isPressed.value ? -1 : 0)}],
    shadowOpacity: withSpring(isPressed.value ? 0.25 : 0.12),
  }));

  const handlePress = async () => {
    try {
      isPressed.value = true;
      await impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => {
        isPressed.value = false;
        router.push(item.href as any);
      }, 80);
    } catch {
      isPressed.value = false;
    }
  };

  const cardGradient = getCardGradient(item.type, theme);
  const styles = getStyles(theme);

  const Title = (
    <View style={styles.titleRow}>
      <Text style={styles.accent}>{item.accent}</Text>
      <Text style={[styles.title, variant === 'neutral' && {color: theme.colors.text.primary}]} numberOfLines={1}>
        {item.title}
      </Text>
    </View>
  );

  const Description = (
    <Text style={[styles.description, variant === 'neutral' && {color: theme.colors.text.secondary}]} numberOfLines={2}>
      {item.description}
    </Text>
  );

  const RightChevron = (
    <View style={styles.chevronContainer}>
      <ChevronRight color={variant === 'neutral' ? theme.colors.text.primary : 'white'} size={20} />
    </View>
  );

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity style={styles.touchable} onPress={handlePress} activeOpacity={0.9}>
        {variant === 'neutral' ? (
          <View
            style={[
              styles.cardGradient,
              {
                backgroundColor: theme.colors.background.card,
                borderWidth: 1,
                borderColor: `${theme.colors.primary}22`,
              },
            ]}>
            <View style={styles.cardInner}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconGradient, {backgroundColor: `${theme.colors.primary}1A`}]}>
                  <Icon color={theme.colors.text.primary} size={20} />
                </View>
              </View>
              <View style={styles.textSection}>
                {Title}
                {Description}
              </View>
              {RightChevron}
            </View>
          </View>
        ) : (
          <LinearGradient colors={cardGradient} style={styles.cardGradient}>
            <View style={styles.cardInner}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.06)']}
                  style={styles.iconGradient}>
                  <Icon color="white" size={20} />
                </LinearGradient>
              </View>
              <View style={styles.textSection}>
                {Title}
                <Text style={styles.description}>{item.description}</Text>
              </View>
              {RightChevron}
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    touchable: {flex: 1},
    cardGradient: {flex: 1, minHeight: 90},
    cardInner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    iconContainer: {marginRight: theme.spacing.lg},
    iconGradient: {
      width: theme.spacing.xxxl + theme.spacing.lg,
      height: theme.spacing.xxxl + theme.spacing.lg,
      borderRadius: (theme.spacing.xxxl + theme.spacing.lg) / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textSection: {flex: 1},
    titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs},
    accent: {fontSize: 16, marginRight: theme.spacing.sm},
    title: {fontSize: 18, fontWeight: 'bold', color: 'white', letterSpacing: -0.3, flex: 1},
    description: {fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20},
    chevronContainer: {marginLeft: theme.spacing.md},
  });

export default AnalyticsNavigationCard;
