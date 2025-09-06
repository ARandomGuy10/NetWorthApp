// components/analytics/MonthlyInsights.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {Extremes, MonthlyDelta} from '@/lib/supabase';

interface MonthlyInsightsProps {
  monthlyDeltas: MonthlyDelta[];
  extremes?: Extremes;
  currency: string;
  period: '3M' | '6M' | '12M' | 'ALL';
}

const MonthlyInsights: React.FC<MonthlyInsightsProps> = ({monthlyDeltas, extremes, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case '12M':
        return 'past 12 months';
      case 'ALL':
        return 'entire history';
      default:
        return 'selected period';
    }
  };

  const generateInsights = () => {
    const insights = [];

    // Consistency insight
    const positiveMonths = monthlyDeltas.filter(d => d.percent > 0).length;
    const totalMonths = monthlyDeltas.length;
    const consistencyPercentage = (positiveMonths / totalMonths) * 100;

    insights.push({
      icon: '📊',
      title: 'Growth Consistency',
      description: `You had positive growth in ${positiveMonths} out of ${totalMonths} months (${consistencyPercentage.toFixed(0)}% consistency rate).`,
      color: consistencyPercentage > 60 ? theme.colors.success : theme.colors.warning,
    });

    // Best month insight
    if (extremes?.biggestGain) {
      const month = new Date(extremes.biggestGain.month).toLocaleDateString('en', {
        month: 'long',
        year: 'numeric',
      });
      insights.push({
        icon: '🚀',
        title: 'Best Performing Month',
        description: `${month} was your strongest month with a gain of ${formatSmartNumber(extremes.biggestGain.delta, currency)} (+${extremes.biggestGain.percent.toFixed(1)}%).`,
        color: theme.colors.success,
      });
    }

    // Volatility insight
    const percentages = monthlyDeltas.map(d => d.percent);
    const avgPercent = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - avgPercent, 2), 0) / percentages.length;
    const stdDev = Math.sqrt(variance);

    let volatilityLevel = 'Low';
    let volatilityIcon = '📈';
    if (stdDev > 20) {
      volatilityLevel = 'High';
      volatilityIcon = '🎢';
    } else if (stdDev > 10) {
      volatilityLevel = 'Moderate';
      volatilityIcon = '📊';
    }

    insights.push({
      icon: volatilityIcon,
      title: `${volatilityLevel} Volatility`,
      description: `Your monthly performance shows ${volatilityLevel.toLowerCase()} volatility with an average monthly change of ${avgPercent.toFixed(1)}%.`,
      color: theme.colors.info,
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Monthly Analysis Insights</Text>
        <Text style={styles.sectionSubtitle}>
          Key patterns and trends from your monthly performance over the {getPeriodDisplayName(period)}
        </Text>
      </View>

      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <Animated.View key={insight.title} style={styles.insightCard} entering={FadeInUp.delay(index * 150)}>
            <LinearGradient colors={theme.colors.gradient.card} style={styles.insightGradient}>
              <View style={styles.insightHeader}>
                <View style={[styles.iconContainer, {backgroundColor: `${insight.color}20`}]}>
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <View style={styles.descriptionContainer}>
                <Text style={styles.insightDescription}>{insight.description}</Text>
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
      paddingBottom: theme.spacing.xl,
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
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    iconContainer: {
      width: theme.spacing.xl * 2,
      height: theme.spacing.xl * 2,
      borderRadius: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    insightIcon: {
      fontSize: theme.fontSizes.lg,
      lineHeight: theme.fontSizes.lg,
    },
    insightTitle: {
      flex: 1,
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: theme.fontSizes.subtitle * 1.2,
    },
    descriptionContainer: {marginLeft: theme.spacing.lg + theme.spacing.sm},
    insightDescription: {
      fontSize: theme.fontSizes.body,
      lineHeight: theme.fontSizes.body * 1.5,
      color: theme.colors.text.secondary,
    },
  });

export default MonthlyInsights;
