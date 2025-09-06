// components/analytics/PerformanceInsights.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {NetWorthHistoryInsights} from '@/lib/supabase';

interface PerformanceInsightsProps {
  insights: NetWorthHistoryInsights;
  currency: string;
  period: '1M' | '3M' | '6M' | '12M' | 'ALL';
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({insights, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case '1M':
        return 'past month';
      case '3M':
        return 'past 3 months';
      case '6M':
        return 'past 6 months';
      case '12M':
        return 'past 12 months';
      case 'ALL':
        return 'entire history';
      default:
        return 'selected period';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'growth':
        return '📈';
      case 'achievement':
        return '🏆';
      case 'trend':
        return '⚡';
      case 'streak':
        return '🔥';
      default:
        return '💡';
    }
  };

  const insightItems = [
    {
      type: 'streak',
      title: `${insights.growthStreak.current_streak}-Month Growth Streak`,
      description: `You've grown consistently for ${insights.growthStreak.current_streak} months. Your longest streak was ${insights.growthStreak.longest_streak} months.`,
      color: theme.colors.asset,
    },
    {
      type: 'achievement',
      title: insights.highs.isAtAllTimeHigh ? 'All-Time High Achievement' : 'Strong Performance',
      description: insights.highs.isAtAllTimeHigh
        ? 'Congratulations! Your net worth is at an all-time high. Keep up the excellent progress.'
        : `Your all-time high was ${formatSmartNumber(insights.highs.allTimeHigh, currency)}.`,
      color: theme.colors.success,
    },
    {
      type: 'trend',
      title: `${insights.trend.direction === 'up' ? 'Positive' : 'Negative'} Growth Trend`,
      description: `Your net worth is trending ${insights.trend.direction}ward with ${insights.trend.direction === 'up' ? 'strong' : 'concerning'} momentum over the ${getPeriodDisplayName(period)}.`,
      color: insights.trend.direction === 'up' ? theme.colors.asset : theme.colors.warning,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <Text style={styles.sectionSubtitle}>
          Key insights about your financial growth over the {getPeriodDisplayName(period)}
        </Text>
      </View>

      <View style={styles.insightsContainer}>
        {insightItems.map((item, index) => (
          <Animated.View key={item.title} style={styles.insightCard} entering={FadeInUp.delay(index * 150)}>
            <LinearGradient colors={theme.colors.gradient.card} style={styles.insightGradient}>
              {/* ✅ FIXED: Proper icon/title alignment */}
              <View style={styles.insightHeader}>
                <View style={[styles.iconContainer, {backgroundColor: `${item.color}20`}]}>
                  <Text style={styles.insightIcon}>{getInsightIcon(item.type)}</Text>
                </View>
                <Text style={styles.insightTitle}>{item.title}</Text>
              </View>
              {/* ✅ FIXED: Reduced spacing for description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.insightDescription}>{item.description}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 120,
    },
    headerContainer: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.body * 1.4,
    },
    insightsContainer: {
      gap: theme.spacing.lg,
    },
    insightCard: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    insightGradient: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      shadowColor: theme.colors.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    // ✅ FIXED: Perfect icon/title alignment
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center', // ✅ CHANGED: Use 'center' instead of 'flex-start' for perfect alignment
      marginBottom: theme.spacing.xs, // ✅ REDUCED: From 'md' to 'xs' to reduce space
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    insightIcon: {
      fontSize: theme.fontSizes.lg,
      lineHeight: theme.fontSizes.lg,
    },
    // ✅ SIMPLIFIED: Remove separate textContainer - not needed with center alignment
    insightTitle: {
      flex: 1,
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: theme.fontSizes.subtitle * 1.2,
    },
    // ✅ FIXED: Proper description alignment and spacing
    descriptionContainer: {
      marginLeft: 52, // ✅ Align with title text (icon width + margin)
      marginTop: 0, // ✅ Remove any extra top margin
    },
    insightDescription: {
      fontSize: theme.fontSizes.body,
      lineHeight: theme.fontSizes.body * 1.5,
      color: theme.colors.text.secondary,
    },
  });

export default PerformanceInsights;
