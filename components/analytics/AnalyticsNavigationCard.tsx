import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useRouter} from 'expo-router';
import {ChevronRight} from 'lucide-react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';
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
}

// Fixed: Return exactly two colors for LinearGradient
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
  return gradients[type] || [theme.colors.primary, theme.colors.primaryDark];
};

const AnalyticsNavigationCard: React.FC<AnalyticsNavigationCardProps> = ({item}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const router = useRouter();
  const Icon = item.icon;

  const isPressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: withSpring(isPressed.value ? 0.95 : 1)}, {translateY: withSpring(isPressed.value ? -2 : 0)}],
    shadowOpacity: withSpring(isPressed.value ? 0.25 : 0.15),
  }));

  // Fixed: Proper navigation handling without Link conflicts
  const handlePress = async () => {
    try {
      isPressed.value = true;
      await impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Small delay to show animation
      setTimeout(() => {
        isPressed.value = false;
        router.push(item.href as any);
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      isPressed.value = false;
    }
  };

  const cardGradient = getCardGradient(item.type, theme);
  const styles = getStyles(theme);

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.touchable}>
        <LinearGradient colors={cardGradient} style={styles.cardGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <View style={styles.cardInner}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} style={styles.iconGradient}>
                <Icon size={theme.spacing.xl} color={cardGradient[0]} />
              </LinearGradient>
            </View>

            <View style={styles.textSection}>
              <View style={styles.titleRow}>
                <Text style={styles.accent}>{item.accent}</Text>
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </View>

            <View style={styles.chevronContainer}>
              <ChevronRight size={theme.spacing.lg + 4} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Fixed: Responsive styles using theme spacing
const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    touchable: {
      flex: 1,
    },
    cardGradient: {
      flex: 1,
      minHeight: 90, // Responsive minimum height
    },
    cardInner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
    },
    iconContainer: {
      marginRight: theme.spacing.lg,
    },
    iconGradient: {
      width: theme.spacing.xxxl + theme.spacing.lg, // Dynamic: 48px
      height: theme.spacing.xxxl + theme.spacing.lg, // Dynamic: 48px
      borderRadius: (theme.spacing.xxxl + theme.spacing.lg) / 2, // Dynamic: 24px radius
      justifyContent: 'center',
      alignItems: 'center',
    },
    textSection: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    accent: {
      fontSize: 16,
      marginRight: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      letterSpacing: -0.3,
      flex: 1,
    },
    description: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 20,
    },
    chevronContainer: {
      marginLeft: theme.spacing.md,
    },
  });

export default AnalyticsNavigationCard;
