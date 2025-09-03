import React, {useEffect} from 'react';

import {ScrollView, StyleSheet, View, Text} from 'react-native';

import Animated, {useSharedValue, useAnimatedStyle, withDelay, withTiming} from 'react-native-reanimated';
import {Activity, Award, BarChart3, Globe, Landmark, PieChart, TrendingUp} from 'lucide-react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AnalyticsNavigationCard from '@/components/analytics/AnalyticsNavigationCard';
import {formatSmartNumber} from '@/src/utils/formatters';
import {useDashboardData} from '@/hooks/useDashboard';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useTheme} from '@/src/styles/theme/ThemeContext';

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

const BadgesStrip = ({theme, badges}: {theme: any; badges: {label: string; value?: string}[]}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.sm,
      }}
      style={{zIndex: 2}} // sit above header
    >
      {badges.map((b, i) => (
        <View
          key={`${b.label}-${i}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: theme.colors.background.card, // higher contrast
            borderWidth: 1,
            borderColor: theme.colors.border.primary,
            gap: 6,
          }}>
          <Text style={{fontWeight: '600', color: theme.colors.text.primary}}>{b.label}</Text>
          {b.value ? <Text style={{color: theme.colors.text.secondary}}>{b.value}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
};

const HeroSection = ({theme, styles}: {theme: any; styles: any}) => {
  const {data: dashboardData} = useDashboardData();
  const {data: historyData} = useNetWorthHistory({period: '1M'});
  const netWorth = dashboardData?.totalNetWorth || 0;
  const change = historyData?.insights?.performanceSummary?.percent || 0;
  const accountsCount = dashboardData?.accounts?.length || 0;

  const headerGradient: [string, string, string] = [
    theme.colors.background.primary,
    theme.colors.background.secondary,
    `${theme.colors.primary}14`,
  ];

  return (
    <View style={styles.heroSection}>
      <LinearGradient colors={headerGradient} style={styles.heroGradient}>
        <Text style={[styles.heroTitle, {color: theme.colors.text.primary}]}>Analytics</Text>
        <Text style={[styles.heroSubtitle, {color: theme.colors.text.secondary}]}>
          A clear view of progress and opportunities
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.text.primary}]}>
              {formatSmartNumber(netWorth, dashboardData?.analytics?.toCurrency || 'EUR')}
            </Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.secondary}]}>Total Worth</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: change >= 0 ? theme.colors.success : theme.colors.error}]}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.secondary}]}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.text.primary}]}>{accountsCount}</Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.secondary}]}>Accounts</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const AnimatedCard = ({item, index}: {item: AnalyticsNavItem; index: number}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const delay = 150 + index * 80;
    opacity.value = withDelay(delay, withTiming(1, {duration: 450}));
    translateY.value = withDelay(delay, withTiming(0, {duration: 450}));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[animatedStyle, {marginBottom: 12}]}>
      <AnalyticsNavigationCard item={item} variant="neutral" />
    </Animated.View>
  );
};

const MotivationalFooter = ({theme, styles}: {theme: any; styles: any}) => {
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

export default function AnalyticsIndexScreen() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  if (!theme || !theme.colors) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000'}}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const styles = getStyles(theme);

  const badges = [
    {label: 'Streak', value: '7d'},
    {label: 'All‑time High'},
    {label: 'Savings Rate', value: '18%'},
    {label: 'Top Performer', value: 'ETF A'},
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.contentContainer, {paddingBottom: insets.bottom + 96}]}
        showsVerticalScrollIndicator={false}>
        <HeroSection theme={theme} styles={styles} />
        <BadgesStrip theme={theme} badges={badges} />
        <View style={{height: theme.spacing.md}} />
        {analyticsItems.map((item, index) => (
          <AnimatedCard key={item.href} item={item} index={index} />
        ))}
        <MotivationalFooter theme={theme} styles={styles} />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary, // dark screen bg
    },
    scrollView: {
      flex: 1,
      backgroundColor: 'transparent', // avoid white default
    },
    heroSection: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden', // clip gradient
      ...theme.shadows.md,
    },
    heroGradient: {
      // no background here, gradient provides it
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
    },
    heroTitle: {fontSize: 22, fontWeight: '800', letterSpacing: -0.2},
    heroSubtitle: {
      marginTop: 6,
      fontSize: 14,
      opacity: 0.9,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: theme.spacing.lg,
    },
    statCard: {alignItems: 'center', flex: 1, minWidth: 0},
    statValue: {fontSize: 16, fontWeight: '700', marginBottom: 4, textAlign: 'center'},
    statLabel: {fontSize: 12, fontWeight: '500', opacity: 0.8, textAlign: 'center'},
    contentContainer: {paddingHorizontal: theme.spacing.lg},
    motivationFooter: {
      marginTop: theme.spacing.xxl,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius?.lg || 16,
      backgroundColor: `${theme.colors.primary}08`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    motivationText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      lineHeight: 22,
    },
    footerSubtext: {fontSize: 12, textAlign: 'center', lineHeight: 18},
  });
