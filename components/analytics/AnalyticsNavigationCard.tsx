import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {ChevronRight} from 'lucide-react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withSpring} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useHaptics} from '@/hooks/useHaptics';

interface AnalyticsNavigationCardProps {
  item: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    accent: string;
    type: string;
  };
  variant?: 'premium' | 'gradient';
}

// Custom gradient colors for gradient variant
const getCardGradient = (type: string) => {
  const gradients = {
    performance: ['#FF6B6B', '#FF8E53'] as const,
    trends: ['#4ECDC4', '#44A08D'] as const,
    monthly: ['#A8E6CF', '#7FCDCD'] as const,
    categories: ['#FFD93D', '#6BCF7F'] as const,
    accounts: ['#6C5CE7', '#A29BFE'] as const,
    currency: ['#FD79A8', '#FDCB6E'] as const,
    achievements: ['#00CEC9', '#55A3FF'] as const,
  };
  return gradients[type as keyof typeof gradients] || (['#6366F1', '#8B5CF6'] as const);
};

const AnalyticsNavigationCard: React.FC<AnalyticsNavigationCardProps> = ({item, variant = 'gradient'}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const router = useRouter();
  const Icon = item.icon;

  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: 1 - pressed.value * 0.1,
  }));

  const handlePressIn = async () => {
    scale.value = withTiming(0.98, {duration: 100});
    pressed.value = withTiming(1, {duration: 100});
    await impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 15, stiffness: 150});
    pressed.value = withTiming(0, {duration: 100});
  };

  const handlePress = async () => {
    try {
      await impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(item.href as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const styles = getStyles(theme);

  // Get colors based on variant
  const getCardColors = () => {
    if (variant === 'premium') {
      // Premium uses theme colors
      return theme.colors.gradient?.card || ([theme.colors.background.card, theme.colors.background.elevated] as const);
    } else {
      // Gradient uses custom colors
      return getCardGradient(item.type);
    }
  };

  const getTextColors = () => {
    if (variant === 'premium') {
      return {
        title: theme.colors.text.primary,
        description: theme.colors.text.secondary,
        icon: theme.colors.primary,
      };
    } else {
      return {
        title: 'white',
        description: 'rgba(255,255,255,0.9)',
        icon: 'white',
      };
    }
  };

  const cardColors = getCardColors();
  const textColors = getTextColors();

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
        activeOpacity={1}>
        <LinearGradient colors={cardColors} style={styles.cardGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <View style={styles.cardContent}>
            {/* Icon Section */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={
                  variant === 'premium'
                    ? ([`${theme.colors.primary}25`, `${theme.colors.primary}10`] as const)
                    : (['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.10)'] as const)
                }
                style={styles.iconGradient}>
                <Icon size={24} color={textColors.icon} />
              </LinearGradient>
            </View>

            {/* Text Section */}
            <View style={styles.textSection}>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: textColors.title,
                    textShadowColor: variant === 'gradient' ? 'rgba(0,0,0,0.3)' : 'transparent',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text
                style={[
                  styles.cardDescription,
                  {
                    color: textColors.description,
                    textShadowColor: variant === 'gradient' ? 'rgba(0,0,0,0.2)' : 'transparent',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.description}
              </Text>
            </View>

            {/* Action Section */}
            <View style={styles.actionSection}>
              <ChevronRight
                size={20}
                color={variant === 'premium' ? theme.colors.text.tertiary : 'rgba(255,255,255,0.8)'}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    // ✅ FIXED: True full-width card - edge to edge
    card: {
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: theme.spacing.md,
      borderRadius: 0, // Remove border radius for true edge-to-edge
      overflow: 'hidden',
      elevation: 4,
      shadowColor: theme.colors.text.primary,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.12,
      shadowRadius: 10,
      // ❌ REMOVED: All horizontal margins/padding
    },
    touchable: {
      flex: 1,
    },
    cardGradient: {
      flex: 1,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
      minHeight: 90,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    iconGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textSection: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    cardDescription: {
      fontSize: 14,
      lineHeight: 18,
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 1,
    },
    actionSection: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 24,
      height: 24,
    },
  });

export default AnalyticsNavigationCard;
