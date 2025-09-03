import React, {useEffect, useState, useCallback} from 'react';
import {ScrollView, StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {
  Activity,
  Award,
  BarChart3,
  Globe,
  Landmark,
  PieChart,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  Clock,
} from 'lucide-react-native';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AnalyticsNavigationCard from '@/components/analytics/AnalyticsNavigationCard';
import {formatSmartNumber} from '@/src/utils/formatters';
import {useDashboardData} from '@/hooks/useDashboard';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHaptics} from '@/hooks/useHaptics';

// Analytics items array
type AnalyticsNavItem = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  type: 'performance' | 'trends' | 'monthly' | 'categories' | 'accounts' | 'currency' | 'achievements';
};

const analyticsItems: AnalyticsNavItem[] = [
  {
    href: '/analytics/performance',
    icon: Activity,
    title: 'Performance Summary',
    description: 'Track your wealth growth journey',
    accent: '🚀',
    type: 'performance',
  },
  {
    href: '/analytics/trends',
    icon: TrendingUp,
    title: 'Growth Trends',
    description: 'Visualize your financial momentum',
    accent: '📈',
    type: 'trends',
  },
  {
    href: '/analytics/monthly-changes',
    icon: BarChart3,
    title: 'Monthly Changes',
    description: 'See month-over-month progress',
    accent: '📊',
    type: 'monthly',
  },
  {
    href: '/analytics/categories',
    icon: PieChart,
    title: 'Category Breakdown',
    description: 'Analyze your asset distribution',
    accent: '🎯',
    type: 'categories',
  },
  {
    href: '/analytics/top-accounts',
    icon: Landmark,
    title: 'Top Accounts',
    description: 'Identify your wealth drivers',
    accent: '🏆',
    type: 'accounts',
  },
  {
    href: '/analytics/currency',
    icon: Globe,
    title: 'Currency Exposure',
    description: 'Global portfolio breakdown',
    accent: '🌍',
    type: 'currency',
  },
  {
    href: '/analytics/achievements',
    icon: Award,
    title: 'Achievements',
    description: 'Celebrate your financial wins',
    accent: '🏅',
    type: 'achievements',
  },
];

// Premium Achievement Badge with Shine Effect
const AchievementBadge = ({badge, index}: {badge: any; index: number}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: shine.value,
  }));

  const handlePress = useCallback(async () => {
    scale.value = withSequence(
      withTiming(0.95, {duration: 100}),
      withTiming(1.05, {duration: 200}),
      withTiming(1, {duration: 100})
    );

    shine.value = withSequence(withTiming(0.3, {duration: 150}), withTiming(0, {duration: 300}));

    await impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync, scale, shine]);

  // Premium gradient based on badge type - Fixed TS
  const getPremiumGradient = (badgeId: string) => {
    const gradients = {
      streak: ['#FFD700', '#FFA500', '#FF8C00'] as const,
      high: ['#20E3B2', '#1BC49A', '#16A085'] as const,
      savings: ['#6366F1', '#8B5CF6', '#A855F7'] as const,
      performer: ['#F59E0B', '#D97706', '#B45309'] as const,
    };
    return (
      gradients[badgeId as keyof typeof gradients] ||
      ([`${theme.colors.primary}40`, `${theme.colors.primary}20`, `${theme.colors.primary}10`] as const)
    );
  };

  const styles = getStyles(theme, true); // Pass true for fullWidth default

  return (
    <Animated.View style={[styles.achievementBadge, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.badgeContent}>
        <LinearGradient
          colors={getPremiumGradient(badge.id)}
          style={styles.badgeGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          {/* Shine overlay */}
          <Animated.View style={[styles.shineOverlay, shineStyle]} />

          <Text style={[styles.badgeLabel, {color: theme.colors.text.primary}]}>{badge.label}</Text>
          {badge.value && <Text style={[styles.badgeValue, {color: theme.colors.text.primary}]}>{badge.value}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Premium Badges Strip
const BadgesStrip = ({theme, badges}: {theme: any; badges: any[]}) => {
  const styles = getStyles(theme, true); // Pass true for fullWidth default

  return (
    <View style={styles.badgesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesScrollContent}
        style={styles.badgesScroll}>
        {badges.map((badge, index) => (
          <AchievementBadge key={badge.id || index} badge={badge} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

// Enhanced Hero Section with fullWidth prop
const HeroSection = ({theme, fullWidth = true}: {theme: any; fullWidth?: boolean}) => {
  const {data: dashboardData} = useDashboardData();
  const {data: historyData} = useNetWorthHistory({period: '12M'});

  const netWorth = dashboardData?.totalNetWorth || 0;
  const change = historyData?.insights?.performanceSummary?.percent || 0;
  const daysSince = dashboardData?.analytics?.daysSinceLastUpdate || 0;

  const headerGradient =
    theme.colors.gradient?.header ||
    ([theme.colors.background.primary, theme.colors.background.secondary, `${theme.colors.primary}08`] as const);

  const getFreshnessColor = (days: number) => {
    if (days <= 1) return theme.colors.success;
    if (days <= 7) return theme.colors.warning;
    return theme.colors.error;
  };

  const styles = getStyles(theme, fullWidth);

  return (
    <View style={styles.heroContainer}>
      <LinearGradient colors={headerGradient} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroLabel, {color: theme.colors.text.secondary}]}>Your Portfolio</Text>

          <Text style={[styles.heroAmount, {color: theme.colors.text.primary}]}>
            {formatSmartNumber(netWorth, dashboardData?.analytics?.toCurrency || 'EUR')}
          </Text>

          <View style={styles.performanceContainer}>
            <View style={styles.performanceRow}>
              <TrendingUpIcon
                size={18}
                color={change >= 0 ? theme.colors.success : theme.colors.error}
                style={{
                  transform: [{rotate: change >= 0 ? '0deg' : '180deg'}],
                }}
              />
              <Text
                style={[
                  styles.performanceText,
                  {
                    color: change >= 0 ? theme.colors.success : theme.colors.error,
                  },
                ]}>
                {change >= 0 ? '+' : ''}
                {change.toFixed(1)}% this year
              </Text>
            </View>

            <View
              style={[
                styles.freshnessContainer,
                {
                  backgroundColor: `${getFreshnessColor(daysSince)}15`,
                  borderColor: `${getFreshnessColor(daysSince)}25`,
                },
              ]}>
              <Clock size={12} color={getFreshnessColor(daysSince)} />
              <Text
                style={[
                  styles.freshnessText,
                  {
                    color: getFreshnessColor(daysSince),
                  },
                ]}>
                {daysSince === 0
                  ? 'Updated today'
                  : daysSince === 1
                    ? 'Updated yesterday'
                    : `Updated ${daysSince} days ago`}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Animated Card with fullWidth prop
const AnimatedCard = ({
  item,
  index,
  fullWidth = true,
}: {
  item: AnalyticsNavItem;
  index: number;
  fullWidth?: boolean;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const delay = 100 + index * 60;
    opacity.value = withDelay(delay, withTiming(1, {duration: 400}));
    translateY.value = withDelay(delay, withTiming(0, {duration: 400}));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <AnalyticsNavigationCard item={item} variant="premium" fullWidth={fullWidth} />
    </Animated.View>
  );
};

// Motivational Footer
const MotivationalFooter = ({theme}: {theme: any}) => {
  const styles = getStyles(theme, true); // Pass true for fullWidth default

  return (
    <View style={styles.motivationFooter}>
      <Text style={[styles.motivationText, {color: theme.colors.text.primary}]}>
        💡 "Every financial decision shapes your future. Make them count."
      </Text>
      <Text style={[styles.footerSubtext, {color: theme.colors.text.secondary}]}>
        Check back daily for new insights and celebrate your progress
      </Text>
    </View>
  );
};

// Main Screen Component
export default function AnalyticsIndexScreen() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  // ✅ EASY TOGGLE: Change these to false for original padded layout
  const FULL_WIDTH_CARDS = false; // Set to false for original card layout
  const FULL_WIDTH_HEADER = false; // Set to false for original header layout

  if (!theme || !theme.colors) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme?.colors?.background?.primary || '#000',
        }}>
        <Text style={{color: '#FFFFFF'}}>Loading...</Text>
      </View>
    );
  }

  const styles = getStyles(theme, FULL_WIDTH_CARDS);
  const badges = [
    {id: 'streak', label: 'Streak', value: '7d'},
    {id: 'high', label: 'All-time High'},
    {id: 'savings', label: 'Savings Rate', value: '18%'},
    {id: 'performer', label: 'Top Performer', value: 'ETF A'},
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.contentContainer, {paddingBottom: insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, {color: theme.colors.text.primary}]}>Analytics</Text>
        <Text style={[styles.screenSubtitle, {color: theme.colors.text.secondary}]}>
          A clear view of progress and opportunities
        </Text>

        <HeroSection theme={theme} fullWidth={FULL_WIDTH_HEADER} />
        <BadgesStrip theme={theme} badges={badges} />

        <View style={{height: theme.spacing.lg}} />

        {analyticsItems.map((item, index) => (
          <AnimatedCard key={item.href} item={item} index={index} fullWidth={FULL_WIDTH_CARDS} />
        ))}

        <MotivationalFooter theme={theme} />
      </ScrollView>
    </View>
  );
}

// Complete Styles with fullWidth parameter
const getStyles = (theme: any, fullWidth: boolean = true) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    contentContainer: {
      paddingHorizontal: fullWidth ? 0 : theme.spacing.sm,
    },

    // Screen titles always have padding for readability
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
    screenSubtitle: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      opacity: 0.8,
      paddingHorizontal: theme.spacing.lg,
    },

    // Hero section layout
    heroContainer: {
      ...(fullWidth
        ? {
            width: '100%',
            alignSelf: 'stretch',
          }
        : {
            marginHorizontal: theme.spacing.sm,
          }),
      marginBottom: theme.spacing.lg,
    },
    heroCard: {
      borderRadius: fullWidth ? 0 : theme.borderRadius.xl,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    heroContent: {
      padding: theme.spacing.xxl,
      alignItems: 'center',
    },
    heroLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroAmount: {
      fontSize: 36,
      fontWeight: '900',
      letterSpacing: -1,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    performanceContainer: {
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    performanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    performanceText: {
      fontSize: 16,
      fontWeight: '600',
    },
    freshnessContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    freshnessText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Premium Badge Styles
    badgesContainer: {
      marginBottom: theme.spacing.md,
    },
    badgesScroll: {
      flexGrow: 0,
    },
    badgesScrollContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    achievementBadge: {
      elevation: 4,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    badgeContent: {
      borderRadius: theme.borderRadius.lg,
    },
    badgeGradient: {
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      position: 'relative',
    },
    shineOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: theme.borderRadius.lg,
    },
    badgeLabel: {
      fontSize: 13,
      fontWeight: '700',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    badgeValue: {
      fontSize: 13,
      fontWeight: '800',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },

    // Footer
    motivationFooter: {
      marginTop: theme.spacing.xxl,
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: `${theme.colors.primary}06`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}15`,
    },
    motivationText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      lineHeight: 24,
    },
    footerSubtext: {
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
      opacity: 0.8,
    },
  });
