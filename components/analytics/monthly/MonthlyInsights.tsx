// components/analytics/MonthlyInsights.tsx - Updated to use InsightsSection

import React from 'react';
import InsightsSection, {InsightItem} from '@/components/analytics/InsightsSection';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {Extremes, MonthlyDelta} from '@/lib/supabase';

interface MonthlyInsightsProps {
  monthlyDeltas: MonthlyDelta[];
  extremes?: Extremes;
  currency: string;
  period: string;
}

const MonthlyInsights: React.FC<MonthlyInsightsProps> = ({monthlyDeltas, extremes, currency, period}) => {
  const {theme} = useTheme();

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

  const generateInsights = (): InsightItem[] => {
    if (!monthlyDeltas || monthlyDeltas.length === 0) {
      return [
        {
          type: 'no-data',
          icon: '📅',
          title: 'No Monthly Data',
          description: 'Add some financial data to see monthly performance insights.',
          color: theme.colors.text.tertiary,
        },
      ];
    }

    const insights: InsightItem[] = [];

    // ✅ Consistency insight
    const positiveMonths = monthlyDeltas.filter(d => d.percent > 0).length;
    const totalMonths = monthlyDeltas.length;
    const consistencyPercentage = (positiveMonths / totalMonths) * 100;

    insights.push({
      type: 'consistency',
      icon: '📊',
      title: 'Growth Consistency',
      description: `You had positive growth in ${positiveMonths} out of ${totalMonths} months (${consistencyPercentage.toFixed(0)}% consistency rate).`,
      color: consistencyPercentage > 60 ? theme.colors.success : theme.colors.warning,
    });

    // ✅ Best month insight
    if (extremes?.biggestGain) {
      const month = new Date(extremes.biggestGain.month).toLocaleDateString('en', {
        month: 'long',
        year: 'numeric',
      });

      insights.push({
        type: 'best-month',
        icon: '🚀',
        title: 'Best Performing Month',
        description: `${month} was your strongest month with a gain of ${formatSmartNumber(extremes.biggestGain.delta, currency)} (+${extremes.biggestGain.percent.toFixed(1)}%).`,
        color: theme.colors.success,
      });
    }

    // ✅ Volatility insight
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
      type: 'volatility',
      icon: volatilityIcon,
      title: `${volatilityLevel} Volatility`,
      description: `Your monthly performance shows ${volatilityLevel.toLowerCase()} volatility with an average monthly change of ${avgPercent.toFixed(1)}%.`,
      color: theme.colors.info,
    });

    // ✅ NEW: Worst month insight (if exists)
    if (extremes?.biggestDrop) {
      const month = new Date(extremes.biggestDrop.month).toLocaleDateString('en', {
        month: 'long',
        year: 'numeric',
      });

      insights.push({
        type: 'worst-month',
        icon: '📉',
        title: 'Most Challenging Month',
        description: `${month} was your most challenging month with a decline of ${formatSmartNumber(extremes.biggestDrop.delta, currency)} (${extremes.biggestDrop.percent.toFixed(1)}%).`,
        color: theme.colors.warning,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <InsightsSection
      title="Monthly Analysis Insights"
      subtitle={`Key patterns and trends from your monthly performance over the ${getPeriodDisplayName(period)}`}
      insights={insights}
      paddingBottom={theme.spacing.xl}
      headerIcon="calendar-outline"
    />
  );
};

export default MonthlyInsights;
