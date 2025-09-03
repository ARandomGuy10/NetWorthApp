import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, View, Text, Dimensions} from 'react-native';
import {Activity, TrendingUp, BarChart3, PieChart, Award, Landmark, Globe} from 'lucide-react-native';
import Animated, {useSharedValue, useAnimatedStyle, withDelay, withTiming, withRepeat} from 'react-native-reanimated';
import {LinearGradient} from 'expo-linear-gradient';
import AnalyticsNavigationCard from '@/components/analytics/AnalyticsNavigationCard';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useDashboardData} from '@/hooks/useDashboard';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {formatSmartNumber} from '@/src/utils/formatters';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const analyticsItems = [
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

// Fixed: Responsive AnimatedOrb using theme spacing
const AnimatedOrb = ({theme}: {theme: any}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, {duration: 30000}), -1, false);
    scale.value = withRepeat(withTiming(1.2, {duration: 4000}), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}, {scale: scale.value}],
  }));

  // Fixed: Responsive dimensions using screen width and theme spacing
  const orbSize = Math.min(screenWidth * 0.4, 150); // Max 150px, responsive to screen

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -orbSize / 3,
          right: -orbSize / 3,
          width: orbSize,
          height: orbSize,
        },
        animatedStyle,
      ]}>
      <LinearGradient
        colors={[`${theme.colors.primary}20`, `${theme.colors.primary}05`]}
        style={{flex: 1, borderRadius: orbSize / 2}}
      />
    </Animated.View>
  );
};

const HeroSection = ({theme, styles}: {theme: any; styles: any}) => {
  const {data: dashboardData} = useDashboardData();
  const {data: historyData} = useNetWorthHistory({period: '1M'});

  const netWorth = dashboardData?.totalNetWorth || 0;
  const change = historyData?.insights?.performanceSummary?.percent || 0;
  const accountsCount = dashboardData?.accounts?.length || 0;

  // Fixed: Safe gradient access with fallbacks
  const headerGradient = theme.gradient?.header || [
    theme.colors.background.primary,
    theme.colors.background.secondary,
    `${theme.colors.primary}20`,
  ];

  return (
    <View style={styles.heroSection}>
      <LinearGradient colors={headerGradient as [string, string, ...string[]]} style={styles.heroGradient}>
        <AnimatedOrb theme={theme} />
        <Text style={[styles.heroTitle, {color: theme.colors.text.primary}]}>Your Financial Command Center</Text>
        <Text style={[styles.heroSubtitle, {color: theme.colors.text.secondary}]}>
          Discover patterns, celebrate wins, and unlock your wealth potential
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.text.primary}]}>
              {formatSmartNumber(netWorth, dashboardData?.analytics?.toCurrency || 'EUR')}
            </Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.tertiary}]}>Total Worth</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: change >= 0 ? theme.colors.success : theme.colors.error}]}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.tertiary}]}>This Month</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.text.primary}]}>{accountsCount}</Text>
            <Text style={[styles.statLabel, {color: theme.colors.text.tertiary}]}>Accounts</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const AnimatedCard = ({item, index}: {item: (typeof analyticsItems)[0]; index: number}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const delay = 200 + index * 100;
    opacity.value = withDelay(delay, withTiming(1, {duration: 600}));
    translateY.value = withDelay(delay, withTiming(0, {duration: 600}));
  }, [index, opacity, translateY]);

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

const MotivationalFooter = ({theme, styles}: {theme: any; styles: any}) => {
  return (
    <View style={styles.motivationFooter}>
      <Text style={[styles.motivationText, {color: theme.colors.text.primary}]}>
        💡 "Every financial decision shapes your future. Make them count."
      </Text>
      <Text style={[styles.footerSubtext, {color: theme.colors.text.tertiary}]}>
        Check back daily for new insights and celebrate your progress
      </Text>
    </View>
  );
};

export default function AnalyticsIndexScreen() {
  const {theme} = useTheme();

  // Don't render until theme is loaded
  if (!theme || !theme.colors) {
    return (
      <View style={{flex: 1, backgroundColor: '#0A0E28', justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white'}}>Loading...</Text>
      </View>
    );
  }

  const styles = getStyles(theme);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background.primary}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
        <HeroSection theme={theme} styles={styles} />

        <View style={styles.contentContainer}>
          {analyticsItems.map((item, index) => (
            <AnimatedCard key={item.href} item={item} index={index} />
          ))}

          <MotivationalFooter theme={theme} styles={styles} />
        </View>
      </ScrollView>
    </View>
  );
}

// Fixed: Responsive styles using theme spacing and screen dimensions
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    heroSection: {
      height: Math.max(screenHeight * 0.25, 200), // Responsive: 25% of screen or min 200px
      marginBottom: theme.spacing.xl,
    },
    heroGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      position: 'relative',
    },
    heroTitle: {
      fontSize: screenWidth > 400 ? 24 : 20, // Responsive font size
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontSize: screenWidth > 400 ? 16 : 14, // Responsive font size
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: theme.spacing.xl,
    },
    statCard: {
      alignItems: 'center',
      flex: 1,
      minWidth: 0, // Prevent overflow
    },
    statValue: {
      fontSize: screenWidth > 400 ? 18 : 16, // Responsive font size
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxxl,
    },
    motivationFooter: {
      marginTop: theme.spacing.xxxl,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius?.lg || 16,
      backgroundColor: `${theme.colors.primary}08`,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    motivationText: {
      fontSize: screenWidth > 400 ? 16 : 14, // Responsive font size
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      lineHeight: 24,
    },
    footerSubtext: {
      fontSize: screenWidth > 400 ? 14 : 12, // Responsive font size
      textAlign: 'center',
      lineHeight: 20,
    },
  });
