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
}

const AnalyticsNavigationCard: React.FC<AnalyticsNavigationCardProps> = ({item}) => {
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

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.touchable}
        activeOpacity={1}>
        <LinearGradient
          colors={[theme.colors.background.card, theme.colors.background.elevated]}
          style={styles.cardGradient}>
          <View style={styles.cardContent}>
            {/* Single Icon Section */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[`${theme.colors.primary}20`, `${theme.colors.primary}10`]}
                style={styles.iconGradient}>
                <Icon size={22} color={theme.colors.primary} />
              </LinearGradient>
            </View>

            {/* Text Section - Single Line Enforcement */}
            <View style={styles.textSection}>
              <Text
                style={[styles.cardTitle, {color: theme.colors.text.primary}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.title}
              </Text>
              <Text
                style={[styles.cardDescription, {color: theme.colors.text.secondary}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {item.description}
              </Text>
            </View>

            {/* Action Section */}
            <View style={styles.actionSection}>
              <ChevronRight size={18} color={theme.colors.text.tertiary} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.colors.text.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    touchable: {
      flex: 1,
    },
    cardGradient: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}12`,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
      minHeight: 80,
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
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    cardDescription: {
      fontSize: 14,
      lineHeight: 18,
      opacity: 0.8,
    },
    actionSection: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 24,
      height: 24,
    },
  });

export default AnalyticsNavigationCard;
