// components/analytics/accounts/AccountInsights.tsx

import React, {useMemo} from 'react';
import InsightsSection, {InsightItem} from '@/components/analytics/InsightsSection';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useAccountsWithBalances} from '@/hooks/useAccountsWithBalances';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {formatSmartNumber} from '@/src/utils/formatters';
import type {Period} from '@/lib/supabase';

interface AccountPerformance {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  currency: string;
  currentBalance: number;
  startBalance: number;
  change: number;
  changePercent: number;
}

interface AccountInsightsProps {
  period: Period;
}

const AccountInsights: React.FC<AccountInsightsProps> = ({period}) => {
  const {theme} = useTheme();

  // ✅ Fetch data inside the component
  const {data: rawAccounts} = useAccountsWithBalances();
  const {data: historyData, isLoading} = useNetWorthHistory({
    period,
    includeAccountBreakdown: true,
  });

  // ✅ Calculate account performances (same logic as AccountPerformanceList)
  const accountPerformances = useMemo((): AccountPerformance[] => {
    if (!rawAccounts || !historyData?.data || historyData.data.length === 0) {
      return [];
    }

    const accounts = Array.isArray(rawAccounts) ? rawAccounts.flat() : [];
    const performances = accounts
      .filter(acc => acc.include_in_net_worth && !acc.is_archived)
      .map(account => {
        const accountHistory: number[] = [];
        historyData.data.forEach(dataPoint => {
          const accountSnap = dataPoint.accounts.find(snap => snap.account_id === account.account_id);
          if (accountSnap) {
            accountHistory.push(accountSnap.convertedBalance);
          }
        });

        const currentBalance = account.latest_balance || 0;
        const startBalance = accountHistory.length > 0 ? accountHistory[0] : currentBalance;
        const change = currentBalance - startBalance;
        const changePercent = startBalance !== 0 ? (change / Math.abs(startBalance)) * 100 : 0;

        return {
          id: account.account_id,
          name: account.account_name,
          type: account.account_type,
          category: account.category,
          currency: account.currency,
          currentBalance,
          startBalance,
          change,
          changePercent,
        };
      })
      .sort((a, b) => b.changePercent - a.changePercent); // Sort by performance

    return performances;
  }, [rawAccounts, historyData]);

  const getPeriodDisplayName = (period: Period) => {
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

  const generateAccountInsights = (): InsightItem[] => {
    if (!accountPerformances || accountPerformances.length === 0) {
      return [
        {
          type: 'no-data',
          icon: '📊',
          title: 'No Account Data',
          description: 'Add some accounts to see performance insights.',
          color: theme.colors.text.tertiary,
        },
      ];
    }

    const insights: InsightItem[] = [];

    // ✅ Top Performer Insight
    const topPerformer = accountPerformances[0];
    if (topPerformer && topPerformer.changePercent > 0) {
      insights.push({
        type: 'top-performer',
        icon: '🏆',
        title: `Top Performer: ${topPerformer.name}`,
        description: `Your ${topPerformer.category} account is your best performer with a ${topPerformer.changePercent.toFixed(1)}% growth (${formatSmartNumber(topPerformer.change, topPerformer.currency)}).`,
        color: theme.colors.success,
      });
    }

    // ✅ Asset vs Liability Performance
    const assets = accountPerformances.filter(acc => acc.type === 'asset');
    const liabilities = accountPerformances.filter(acc => acc.type === 'liability');

    const avgAssetPerformance =
      assets.length > 0 ? assets.reduce((sum, acc) => sum + acc.changePercent, 0) / assets.length : 0;

    if (assets.length > 0) {
      insights.push({
        type: 'asset-performance',
        icon: '📈',
        title: 'Asset Performance',
        description: `Your ${assets.length} asset account${assets.length > 1 ? 's' : ''} averaged ${avgAssetPerformance.toFixed(1)}% growth over the ${getPeriodDisplayName(period)}.`,
        color: avgAssetPerformance > 0 ? theme.colors.asset : theme.colors.warning,
      });
    }

    // ✅ Category Diversification
    const categories = [...new Set(accountPerformances.map(acc => acc.category))];
    if (categories.length >= 3) {
      insights.push({
        type: 'diversification',
        icon: '🎯',
        title: 'Well Diversified Portfolio',
        description: `You have accounts across ${categories.length} different categories: ${categories.slice(0, 3).join(', ')}${categories.length > 3 ? ` and ${categories.length - 3} more` : ''}.`,
        color: theme.colors.primary,
      });
    }

    // ✅ Consistency Insight
    const positiveAccounts = accountPerformances.filter(acc => acc.changePercent > 0).length;
    const consistencyRate = (positiveAccounts / accountPerformances.length) * 100;

    insights.push({
      type: 'consistency',
      icon: consistencyRate > 60 ? '📊' : '🔄',
      title: `${consistencyRate.toFixed(0)}% Growth Consistency`,
      description: `${positiveAccounts} out of ${accountPerformances.length} accounts showed positive growth during the ${getPeriodDisplayName(period)}.`,
      color: consistencyRate > 60 ? theme.colors.asset : theme.colors.warning,
    });

    return insights;
  };

  // ✅ Show loading state
  if (isLoading) {
    return (
      <InsightsSection
        title="Account Performance Insights"
        subtitle="Analyzing your account performance..."
        insights={[
          {
            type: 'loading',
            icon: '⏳',
            title: 'Loading Insights',
            description: 'Analyzing your account performance data...',
            color: theme.colors.text.tertiary,
          },
        ]}
        paddingBottom={90}
      />
    );
  }

  const insights = generateAccountInsights();

  return (
    <InsightsSection
      title="Account Performance Insights"
      subtitle={`Key patterns and standout performers from your accounts over the ${getPeriodDisplayName(period)}`}
      insights={insights}
      paddingBottom={90}
      headerIcon="wallet-outline" // ✅ Custom icon for account insights
    />
  );
};

export default AccountInsights;
