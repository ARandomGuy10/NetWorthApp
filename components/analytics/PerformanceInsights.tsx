// components/analytics/PerformanceInsights.tsx

import React from 'react';
import InsightsSection, {InsightItem} from '@/components/ui/InsightsSection';
import {formatSmartNumber} from '@/src/utils/formatters';
import {NetWorthHistoryInsights} from '@/lib/supabase';
import {useTheme} from '@/src/styles/theme/ThemeContext';

interface PerformanceInsightsProps {
  insights: NetWorthHistoryInsights;
  currency: string;
  period: '1M' | '3M' | '6M' | '12M' | 'ALL';
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({insights, currency, period}) => {
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

  const insightItems: InsightItem[] = [
    {
      type: 'streak',
      icon: '🔥',
      title: `${insights.growthStreak.current_streak}-Month Growth Streak`,
      description: `You've grown consistently for ${insights.growthStreak.current_streak} months. Your longest streak was ${insights.growthStreak.longest_streak} months.`,
      color: theme.colors.asset,
    },
    {
      type: 'achievement',
      icon: insights.highs.isAtAllTimeHigh ? '🏆' : '📈',
      title: insights.highs.isAtAllTimeHigh ? 'All-Time High Achievement' : 'Strong Performance',
      description: insights.highs.isAtAllTimeHigh
        ? 'Congratulations! Your net worth is at an all-time high. Keep up the excellent progress.'
        : `Your all-time high was ${formatSmartNumber(insights.highs.allTimeHigh, currency)}.`,
      color: theme.colors.success,
    },
    {
      type: 'trend',
      icon: insights.trend.direction === 'up' ? '⚡' : '📉',
      title: `${insights.trend.direction === 'up' ? 'Positive' : 'Negative'} Growth Trend`,
      description: `Your net worth is trending ${insights.trend.direction}ward with ${insights.trend.direction === 'up' ? 'strong' : 'concerning'} momentum over the ${getPeriodDisplayName(period)}.`,
      color: insights.trend.direction === 'up' ? theme.colors.asset : theme.colors.warning,
    },
  ];

  return (
    <InsightsSection
      title="Performance Insights"
      subtitle={`Key insights about your financial growth over the ${getPeriodDisplayName(period)}`}
      insights={insightItems}
      paddingBottom={120}
      headerIcon="trending-up-outline" // ✅ Custom icon for account insights
    />
  );
};

export default PerformanceInsights;
