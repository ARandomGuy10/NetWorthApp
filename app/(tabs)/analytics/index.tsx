import React, {useEffect, useState, useCallback, useRef} from 'react';
import {ScrollView, StyleSheet, View, Text, TouchableOpacity, Modal, Animated as RNAnimated} from 'react-native';
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
  type: 'performance' | 'monthly' | 'accounts' | 'categories' | 'currency' | 'achievements';
};

const analyticsItems: AnalyticsNavItem[] = [
  {
    href: '/analytics/performance',
    icon: Activity,
    title: 'Performance Overview',
    description: 'Complete wealth growth journey & trends',
    accent: '🚀',
    type: 'performance',
  },
  {
    href: '/analytics/monthly-changes',
    icon: BarChart3,
    title: 'Monthly Changes',
    description: 'Month-over-month detailed progress',
    accent: '📊',
    type: 'monthly',
  },
  {
    href: '/analytics/accounts',
    icon: Landmark,
    title: 'Account Analysis',
    description: 'Individual account performance & drill-down',
    accent: '🏆',
    type: 'accounts',
  },
  {
    href: '/analytics/categories',
    icon: PieChart,
    title: 'Category Breakdown',
    description: 'Asset distribution & portfolio allocation',
    accent: '🎯',
    type: 'categories',
  },
  {
    href: '/analytics/currency',
    icon: Globe,
    title: 'Currency Exposure',
    description: 'Multi-currency portfolio breakdown',
    accent: '🌍',
    type: 'currency',
  },
  // ✅ COMMENTED OUT: Achievements navigation (not needed for now)
  // {
  //   href: '/analytics/achievements',
  //   icon: Award,
  //   title: 'Achievements',
  //   description: 'Financial milestones & gamification',
  //   accent: '🏅',
  //   type: 'achievements',
  // },
];

// Badge Tooltip Component (unchanged)
const BadgeTooltip = ({badge, visible, onClose}: {badge: any; visible: boolean; onClose: () => void}) => {
  const {theme} = useTheme();
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        RNAnimated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={tooltipStyles.overlay} activeOpacity={1} onPress={onClose}>
        <RNAnimated.View
          style={[
            tooltipStyles.container,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
              backgroundColor: theme?.colors?.background?.card || '#2A2A2E',
              borderColor: theme?.colors?.border?.primary || '#404040',
            },
          ]}>
          <Text style={[tooltipStyles.title, {color: theme?.colors?.text?.primary || '#FFFFFF'}]}>
            {badge.icon} {badge.title}
          </Text>
          <Text style={[tooltipStyles.description, {color: theme?.colors?.text?.secondary || '#B8C6DB'}]}>
            {badge.description}
          </Text>
        </RNAnimated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// ✅ UPDATED: Achievement Badge - uses only database icon
const AchievementBadge = ({badge, index}: {badge: any; index: number}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);
  const [showTooltip, setShowTooltip] = useState(false);

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
    setShowTooltip(true);
  }, [impactAsync, scale, shine]);

  // Hash-based gradient for consistent colors
  const getPremiumGradient = (badge: any): [string, string, string] => {
    const badgeKey = badge.title || badge.label || badge.id || '';

    let hash = 0;
    for (let i = 0; i < badgeKey.length; i++) {
      hash = badgeKey.charCodeAt(i) + ((hash << 5) - hash);
    }

    const gradientOptions: [string, string, string][] = [
      ['#FFD700', '#FFA500', '#FF8C00'], // Gold
      ['#20E3B2', '#1BC49A', '#16A085'], // Teal
      ['#22C55E', '#16A34A', '#15803D'], // Green
      ['#F59E0B', '#D97706', '#B45309'], // Amber
      ['#6366F1', '#8B5CF6', '#A855F7'], // Purple
      ['#EF4444', '#DC2626', '#B91C1C'], // Red
      ['#06B6D4', '#0891B2', '#0E7490'], // Cyan
      ['#10B981', '#059669', '#047857'], // Emerald
      ['#84CC16', '#65A30D', '#4D7C0F'], // Lime
      ['#F97316', '#EA580C', '#C2410C'], // Orange
    ];

    const gradientIndex = Math.abs(hash) % gradientOptions.length;
    return gradientOptions[gradientIndex];
  };

  const styles = getStyles(theme, true);

  return (
    <>
      <Animated.View style={[styles.achievementBadge, animatedStyle]}>
        <TouchableOpacity onPress={handlePress} style={styles.badgeContent}>
          <LinearGradient
            colors={getPremiumGradient(badge)}
            style={styles.badgeGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            {/* Shine overlay */}
            <Animated.View style={[styles.shineOverlay, shineStyle]} />

            {/* ✅ UPDATED: Only use database icon and title, no hardcoded fallbacks */}
            <Text style={[styles.badgeLabel, {color: '#FFFFFF'}]} numberOfLines={1}>
              {badge.icon}
              {badge.title || badge.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <BadgeTooltip badge={badge} visible={showTooltip} onClose={() => setShowTooltip(false)} />
    </>
  );
};

// Premium Badges Strip (unchanged)
const BadgesStrip = ({theme, badges}: {theme: any; badges: any[]}) => {
  const styles = getStyles(theme, true);

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.badgesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesScrollContent}
        style={styles.badgesScroll}>
        {badges.map((badge, index) => (
          <AchievementBadge key={badge.title || badge.id || index} badge={badge} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

// Enhanced Hero Section (unchanged)
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

// Animated Card (unchanged)
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

// Motivational Footer (unchanged)
const MotivationalFooter = ({theme}: {theme: any}) => {
  const styles = getStyles(theme, true);

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

// ✅ REMOVED: Helper functions for hardcoded icons - no longer needed since icons come from database

// Main Screen Component
export default function AnalyticsIndexScreen() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  const {data: dashboardData} = useDashboardData();
  const {data: historyData} = useNetWorthHistory({period: '12M'});

  const FULL_WIDTH_CARDS = true;
  const FULL_WIDTH_HEADER = true;

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

  // ✅ UPDATED: Get badges dynamically from API data - no fallback hardcoded icons
  const badges = React.useMemo(() => {
    // First try to get full badge objects from NetWorth history (with title, description, icon)
    if (historyData?.badges && historyData.badges.length > 0) {
      return historyData.badges;
    }

    // Fallback to dashboard analytics badges (just strings) and map them to basic objects
    if (dashboardData?.analytics?.badges && dashboardData.analytics.badges.length > 0) {
      return dashboardData.analytics.badges.map((badgeString: string) => ({
        title: badgeString,
        description: 'Achievement unlocked', // Generic description
        icon: '🏅', // Generic icon since we don't have mapping
      }));
    }

    // No static fallbacks - badges come from database or none at all
    return [];
  }, [historyData?.badges, dashboardData?.analytics?.badges]);

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

// Complete Styles (unchanged)
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
      paddingHorizontal: fullWidth ? 0 : theme.spacing.lg,
    },
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
    heroContainer: {
      ...(fullWidth
        ? {
            width: '100%',
            alignSelf: 'stretch',
          }
        : {
            marginHorizontal: theme.spacing.xs,
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
    // Badge Styles
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
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      position: 'relative',
      minWidth: 100,
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
      textAlign: 'center',
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

// Tooltip styles (unchanged)
const tooltipStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
