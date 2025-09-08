// components/analytics/KeyPerformanceMetrics.tsx
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {NetWorthHistoryInsights} from '@/lib/supabase';

const {width: screenWidth} = Dimensions.get('window');

interface KeyPerformanceMetricsProps {
  insights: NetWorthHistoryInsights;
  currency: string;
  period: '1M' | '3M' | '6M' | '12M' | 'ALL'; // ✅ Use 12M instead of 1Y
}

const KeyPerformanceMetrics: React.FC<KeyPerformanceMetricsProps> = ({insights, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // ✅ Updated to use 12M instead of 1Y
  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case '1M':
        return 'Past Month';
      case '3M':
        return 'Past 3 Months';
      case '6M':
        return 'Past 6 Months';
      case '12M':
        return 'Past 12 Months'; // ✅ Changed from 'Past Year'
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
      icon: '📈',
      color: insights.performanceSummary.change >= 0 ? theme.colors.asset : theme.colors.liability,
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
      icon: '📊',
      color: theme.colors.info,
    },
    {
      title: 'BEST MONTH',
      value: insights.extremes?.biggestGain
        ? formatSmartNumber(insights.extremes.biggestGain.delta, currency)
        : formatSmartNumber(0, currency),
      percentage: insights.extremes?.biggestGain
        ? `${insights.extremes.biggestGain.month} (+${insights.extremes.biggestGain.percent.toFixed(1)}%)`
        : 'No data',
      icon: '🚀',
      color: theme.colors.success,
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
      icon: '📊',
      color: insights.volatility.stddevPercent > 20 ? theme.colors.warning : theme.colors.info,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Key Performance Metrics</Text>
      <Text style={styles.periodIndicator}>BASED ON {getPeriodDisplayName(period).toUpperCase()}</Text>

      {/* ✅ NEW: 2-column grid layout */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Animated.View key={metric.title} style={styles.metricCard} entering={FadeInUp.delay(index * 100)}>
            <LinearGradient colors={theme.colors.gradient.card} style={styles.metricGradient}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIconContainer, {backgroundColor: `${metric.color}20`}]}>
                  <Text style={styles.metricIcon}>{metric.icon}</Text>
                </View>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>
              <Text style={[styles.metricValue, {color: metric.color}]}>{metric.value}</Text>
              <Text style={styles.metricPercentage}>{metric.percentage}</Text>
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
    },
    sectionTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    periodIndicator: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.lg,
    },
    // ✅ NEW: Grid container for 2-column layout
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', // ✅ Better spacing distribution
    },
    // ✅ UPDATED: Card width for 2-column layout
    metricCard: {
      width: '48%', // ✅ Each card takes ~48% of container width
      marginBottom: theme.spacing.lg,
    },
    metricGradient: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 140, // ✅ Consistent card height
      // ✅ Add subtle shadow for depth
      shadowColor: theme.colors.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    metricIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.sm,
    },
    metricIcon: {
      fontSize: theme.fontSizes.md,
    },
    metricTitle: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1, // ✅ Take remaining space
    },
    metricValue: {
      fontSize: theme.fontSizes.xl,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
      lineHeight: theme.fontSizes.xl * 1.2,
    },
    metricPercentage: {
      fontSize: theme.fontSizes.sm,
      fontWeight: '500',
      color: theme.colors.text.tertiary,
      lineHeight: theme.fontSizes.sm * 1.3,
    },
  });

export default KeyPerformanceMetrics;
