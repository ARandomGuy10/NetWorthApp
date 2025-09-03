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

// Analytics items array (same as before)
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

// Fixed Achievement Badge Component - No truncation, proper sizing
const AchievementBadge = ({badge, index}: {badge: any; index: number}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePress = useCallback(async () => {
    scale.value = withSequence(
      withTiming(0.95, {duration: 100}),
      withTiming(1.05, {duration: 200}),
      withTiming(1, {duration: 100})
    );

    await impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync, scale]);

  const styles = getStyles(theme);

  return (
    <Animated.View style={[styles.achievementBadge, animatedStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.badgeContent}>
        <LinearGradient
          colors={[`${theme.colors.primary}15`, `${theme.colors.primary}08`]}
          style={styles.badgeGradient}>
          <Text style={[styles.badgeLabel, {color: theme.colors.text.primary}]}>{badge.label}</Text>
          {badge.value && <Text style={[styles.badgeValue, {color: theme.colors.primary}]}>{badge.value}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Fixed Badges Strip - No truncation, proper horizontal scroll
const BadgesStrip = ({theme, badges}: {theme: any; badges: any[]}) => {
  const styles = getStyles(theme);

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

// Improved Hero Section - Better metrics, cleaner design
const HeroSection = ({theme}: {theme: any}) => {
  const {data: dashboardData} = useDashboardData();
  const {data: historyData} = useNetWorthHistory({period: '12M'});
  console.log('Dashboard Data:', JSON.stringify(dashboardData));
  const netWorth = dashboardData?.totalNetWorth || 0;
  const change = historyData?.insights?.performanceSummary?.percent || 0;

  // Get last update info
  const lastUpdate = dashboardData?.analytics?.asOfDate;
  const daysSince = dashboardData?.analytics?.daysSinceLastUpdate || 0;

  const headerGradient = theme.colors.gradient?.header || [
    theme.colors.background.primary,
    theme.colors.background.secondary,
    `${theme.colors.primary}08`,
  ];

  const styles = getStyles(theme);

  return (
    <View style={styles.heroContainer}>
      <LinearGradient colors={headerGradient} style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroLabel, {color: theme.colors.text.secondary}]}>Your Portfolio</Text>

          {/* Large Net Worth Display */}
          <Text style={[styles.heroAmount, {color: theme.colors.text.primary}]}>
            {formatSmartNumber(netWorth, dashboardData?.analytics?.toCurrency || 'EUR')}
          </Text>

          {/* Performance Row */}
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

            {/* Last Updated Info */}
            {daysSince !== undefined && (
              <Text style={[styles.lastUpdateText, {color: theme.colors.text.tertiary}]}>
                {daysSince === 0
                  ? 'Updated today'
                  : daysSince === 1
                    ? 'Updated yesterday'
                    : `Updated ${daysSince} days ago`}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Animated Card (same as before)
const AnimatedCard = ({item, index}: {item: AnalyticsNavItem; index: number}) => {
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
      <AnalyticsNavigationCard item={item} />
    </Animated.View>
  );
};

// Motivational Footer (same as before)
const MotivationalFooter = ({theme}: {theme: any}) => {
  const styles = getStyles(theme);

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

  const styles = getStyles(theme);

  // Better badges - shorter, more meaningful
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

        <HeroSection theme={theme} />
        <BadgesStrip theme={theme} badges={badges} />

        <View style={{height: theme.spacing.lg}} />

        {analyticsItems.map((item, index) => (
          <AnimatedCard key={item.href} item={item} index={index} />
        ))}

        <MotivationalFooter theme={theme} />
      </ScrollView>
    </View>
  );
}

// Updated Styles with Fixed Badge Sizing
const getStyles = (theme: any) =>
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
      paddingHorizontal: theme.spacing.lg,
    },

    // Screen Header
    screenTitle: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    screenSubtitle: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      opacity: 0.8,
    },

    // Improved Hero Section
    heroContainer: {
      marginBottom: theme.spacing.lg,
    },
    heroCard: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      elevation: 6,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}12`,
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
      gap: theme.spacing.xs,
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
    lastUpdateText: {
      fontSize: 12,
      fontWeight: '500',
      opacity: 0.7,
    },

    // Fixed Badge Styles - No truncation
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
      elevation: 2,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    badgeContent: {
      // No fixed width - let content determine size
    },
    badgeGradient: {
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
      // Allow natural sizing - no width constraints
    },
    badgeLabel: {
      fontSize: 13,
      fontWeight: '600',
      // No maxWidth - let it size naturally
    },
    badgeValue: {
      fontSize: 13,
      fontWeight: '700',
    },

    // Footer
    motivationFooter: {
      marginTop: theme.spacing.xxl,
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
