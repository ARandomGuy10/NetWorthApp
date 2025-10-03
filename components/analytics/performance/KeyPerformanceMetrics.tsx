// components/analytics/KeyPerformanceMetrics.tsx

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {NetWorthHistoryInsights} from '@/lib/supabase';
import {TrendingUp, TrendingDown, Calendar, Target, BarChart3} from 'lucide-react-native';

interface KeyPerformanceMetricsProps {
  insights: NetWorthHistoryInsights;
  currency: string;
  period: '1M' | '3M' | '6M' | '12M' | 'ALL';
}

const KeyPerformanceMetrics: React.FC<KeyPerformanceMetricsProps> = ({insights, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case '1M':
        return 'Past Month';
      case '3M':
        return 'Past 3 Months';
      case '6M':
        return 'Past 6 Months';
      case '12M':
        return 'Past 12 Months';
      case 'ALL':
        return 'All Time';
      default:
        return 'Selected Period';
    }
  };

  const metrics = [
    {
      title: 'TOTAL RETURN',
      value: formatSmartNumber(insights.performanceSummary.change, currency),
      percentage: `${insights.performanceSummary.change >= 0 ? '+' : ''}${insights.performanceSummary.percent.toFixed(1)}%`,
      color: insights.performanceSummary.change >= 0 ? theme.colors.success : theme.colors.error,
      icon: insights.performanceSummary.change >= 0 ? TrendingUp : TrendingDown,
      gradient:
        insights.performanceSummary.change >= 0
          ? (['#22C55E15', '#22C55E08', '#22C55E05'] as const)
          : (['#EF444415', '#EF444408', '#EF444405'] as const),
    },
    {
      title: 'MONTHLY AVG',
      value:
        insights.monthlyDeltas.length > 0
          ? formatSmartNumber(
              insights.monthlyDeltas.reduce((sum, delta) => sum + delta.delta, 0) / insights.monthlyDeltas.length,
              currency
            )
          : formatSmartNumber(0, currency),
      percentage: 'per month',
      color: theme.colors.info,
      icon: Calendar,
      gradient: [`${theme.colors.info}15`, `${theme.colors.info}08`, `${theme.colors.info}05`] as const,
    },
    {
      title: 'BEST MONTH',
      value: insights.extremes?.biggestGain
        ? formatSmartNumber(insights.extremes.biggestGain.delta, currency)
        : formatSmartNumber(0, currency),
      percentage: insights.extremes?.biggestGain
        ? `${insights.extremes.biggestGain.month} (+${insights.extremes.biggestGain.percent.toFixed(1)}%)`
        : 'No data',
      color: theme.colors.success,
      icon: Target,
      gradient: ['#22C55E15', '#22C55E08', '#22C55E05'] as const,
    },
    {
      title: 'GROWTH CONSISTENCY',
      value: `${insights.volatility.stddevPercent.toFixed(1)}%`,
      percentage:
        insights.volatility.stddevPercent > 20
          ? 'Variable Growth'
          : insights.volatility.stddevPercent > 10
            ? 'Moderate Growth'
            : 'Steady Growth',
      color: insights.volatility.stddevPercent > 20 ? theme.colors.warning : theme.colors.info,
      icon: BarChart3,
      gradient:
        insights.volatility.stddevPercent > 20
          ? ([`${theme.colors.warning}15`, `${theme.colors.warning}08`, `${theme.colors.warning}05`] as const)
          : ([`${theme.colors.info}15`, `${theme.colors.info}08`, `${theme.colors.info}05`] as const),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
        <View style={styles.periodBadge}>
          <Text style={styles.periodIndicator}>BASED ON {getPeriodDisplayName(period).toUpperCase()}</Text>
        </View>
      </View>

      {/* Enhanced Grid Layout */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Animated.View
            key={metric.title}
            style={styles.metricCard}
            entering={FadeInUp.delay(index * 100).springify()}>
            <LinearGradient
              colors={metric.gradient}
              style={styles.metricGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              {/* Card Header with Icon */}
              <View style={styles.metricHeader}>
                <View style={[styles.iconContainer, {backgroundColor: `${metric.color}20`}]}>
                  <metric.icon size={18} color={metric.color} />
                </View>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>

              {/* Main Value */}
              <Text style={[styles.metricValue, {color: metric.color}]}>{metric.value}</Text>

              {/* Secondary Info */}
              <Text style={styles.metricPercentage}>{metric.percentage}</Text>

              {/* Subtle Background Pattern */}
              <View style={styles.backgroundPattern} />
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
      marginBottom: theme.spacing.xl,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '800',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      letterSpacing: -0.3,
    },
    periodBadge: {
      alignSelf: 'flex-start',
      backgroundColor: `${theme.colors.primary}10`,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    periodIndicator: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.primary,
      fontWeight: '600',
      letterSpacing: 0.5,
    },

    // Grid Layout
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: theme.spacing.lg,
      columnGap: theme.spacing.md,
    },
    metricCard: {
      width: '48%', // Ensures exactly 2 columns with gap
      minWidth: 150, // Prevents cards from becoming too small
    },
    metricGradient: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 140,
      position: 'relative',
      overflow: 'hidden',

      // Enhanced shadow
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      //elevation: 4,
    },

    // Card Content
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    metricTitle: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1,
      lineHeight: theme.fontSizes.caption * 1.2,
    },
    metricValue: {
      fontSize: theme.fontSizes.xxl,
      fontWeight: '800',
      marginBottom: theme.spacing.sm,
      lineHeight: theme.fontSizes.xxl * 1.1,
      letterSpacing: -0.5,
    },
    metricPercentage: {
      fontSize: theme.fontSizes.sm,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
      lineHeight: theme.fontSizes.sm * 1.3,
    },

    // Visual Enhancement
    backgroundPattern: {
      position: 'absolute',
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: `${theme.colors.primary}05`,
      opacity: 0.5,
    },
  });

export default KeyPerformanceMetrics;
