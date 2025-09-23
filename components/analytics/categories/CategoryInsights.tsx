// components/analytics/categories/CategoryInsights.tsx

import React from 'react';
import InsightsSection from '@/components/analytics/InsightsSection';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';

interface CategoryInsightsProps {
  categoryData: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    healthScore: number;
    assets: Array<{category: string; amount: number; percentage: number}>;
    liabilities: Array<{category: string; amount: number; percentage: number}>;
  };
  dashboardData: any;
  currency: string;
}

const CategoryInsights: React.FC<CategoryInsightsProps> = ({categoryData, dashboardData, currency}) => {
  const {theme} = useTheme();

  const generateInsights = () => {
    const insights = [];

    // Portfolio Health Insight
    const healthScore = categoryData.healthScore;
    let healthIcon = '💚';
    let healthTitle = 'Portfolio Health';
    let healthDescription = '';
    let healthColor = theme.colors.success;

    if (healthScore >= 90) {
      healthDescription = `Excellent portfolio health with ${healthScore}% score! Your debt-to-asset ratio is very low, indicating strong financial stability.`;
      healthIcon = '🏆';
    } else if (healthScore >= 70) {
      healthDescription = `Good portfolio health with ${healthScore}% score. You're maintaining a healthy balance between assets and liabilities.`;
      healthIcon = '💚';
      healthColor = theme.colors.success;
    } else if (healthScore >= 50) {
      healthDescription = `Fair portfolio health with ${healthScore}% score. Consider focusing on debt reduction or increasing assets.`;
      healthIcon = '⚠️';
      healthColor = theme.colors.warning;
    } else {
      healthDescription = `Your portfolio needs attention with ${healthScore}% health score. Focus on reducing debt or building assets.`;
      healthIcon = '🚨';
      healthColor = theme.colors.error;
    }

    insights.push({
      icon: healthIcon,
      title: healthTitle,
      description: healthDescription,
      color: healthColor,
    });

    // ✅ FIXED: Asset Diversification Insight with proper sorting
    if (categoryData.assets.length > 0) {
      // ✅ FIX: Sort assets by amount (largest first) to find actual top asset
      const sortedAssets = [...categoryData.assets].sort((a, b) => b.amount - a.amount);
      const topAsset = sortedAssets[0];
      const diversificationScore = categoryData.assets.length;

      // Calculate percentage correctly - this asset as % of total assets
      const assetPercentageOfAssets =
        categoryData.totalAssets > 0 ? (topAsset.amount / categoryData.totalAssets) * 100 : 0;

      if (assetPercentageOfAssets > 70) {
        insights.push({
          icon: '⚖️',
          title: 'Concentration Risk',
          description: `${assetPercentageOfAssets.toFixed(0)}% of your assets are in ${topAsset.category}. Consider diversifying to reduce risk.`,
          color: theme.colors.warning,
        });
      } else if (diversificationScore >= 4) {
        insights.push({
          icon: '🎯',
          title: 'Well Diversified',
          description: `Great diversification with assets spread across ${diversificationScore} categories. Your largest holding (${topAsset.category}) is ${assetPercentageOfAssets.toFixed(0)}% of assets.`,
          color: theme.colors.success,
        });
      } else {
        insights.push({
          icon: '📊',
          title: 'Asset Allocation',
          description: `Your top asset category is ${topAsset.category} at ${assetPercentageOfAssets.toFixed(0)}% of assets. Consider adding more categories for better diversification.`,
          color: theme.colors.info,
        });
      }
    }

    // Net Worth Insight
    const netWorthColor = categoryData.netWorth >= 0 ? theme.colors.asset : theme.colors.liability;
    const netWorthIcon = categoryData.netWorth >= 0 ? '📈' : '📉';

    if (categoryData.netWorth >= 0) {
      insights.push({
        icon: netWorthIcon,
        title: 'Positive Net Worth',
        description: `Your net worth of ${formatSmartNumber(categoryData.netWorth, currency)} shows your assets exceed liabilities. Keep building wealth!`,
        color: netWorthColor,
      });
    } else {
      insights.push({
        icon: netWorthIcon,
        title: 'Rebuilding Phase',
        description: `Your net worth is ${formatSmartNumber(categoryData.netWorth, currency)}. Focus on debt reduction and asset building.`,
        color: netWorthColor,
      });
    }

    // Debt Management Insight
    if (categoryData.totalLiabilities > 0 && categoryData.liabilities.length > 0) {
      // ✅ FIX: Sort liabilities by amount (largest first) to find actual top debt
      const sortedLiabilities = [...categoryData.liabilities].sort((a, b) => b.amount - a.amount);
      const topDebt = sortedLiabilities[0];

      insights.push({
        icon: '💳',
        title: 'Debt Focus',
        description: `Your largest debt category is ${topDebt.category} (${formatSmartNumber(topDebt.amount, currency)}). Consider prioritizing high-interest debt payoff.`,
        color: theme.colors.warning,
      });
    } else if (categoryData.totalLiabilities === 0) {
      insights.push({
        icon: '🎉',
        title: 'Debt Free!',
        description:
          'Congratulations! You have no recorded debts. This is excellent for your financial health and wealth building.',
        color: theme.colors.success,
      });
    }

    // ✅ FIXED: Investment-Specific Insight with proper sorting
    if (categoryData.assets.length > 0) {
      const sortedAssets = [...categoryData.assets].sort((a, b) => b.amount - a.amount);
      const investmentCategories = sortedAssets.filter(
        asset =>
          asset.category.toLowerCase().includes('investment') ||
          asset.category.toLowerCase().includes('brokerage') ||
          asset.category.toLowerCase().includes('retirement')
      );

      if (investmentCategories.length > 0) {
        const totalInvestments = investmentCategories.reduce((sum, inv) => sum + inv.amount, 0);
        const investmentPercentageOfAssets =
          categoryData.totalAssets > 0 ? (totalInvestments / categoryData.totalAssets) * 100 : 0;

        if (investmentPercentageOfAssets >= 20) {
          insights.push({
            icon: '📈',
            title: 'Investment Focus',
            description: `${investmentPercentageOfAssets.toFixed(0)}% of your assets are in investments. Great job focusing on wealth building!`,
            color: theme.colors.success,
          });
        } else if (investmentPercentageOfAssets > 0) {
          insights.push({
            icon: '🌱',
            title: 'Growing Investments',
            description: `${investmentPercentageOfAssets.toFixed(0)}% of your assets are in investments. Consider increasing this allocation for long-term wealth building.`,
            color: theme.colors.info,
          });
        }
      }
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <InsightsSection
      title="Category Insights"
      subtitle="AI-powered analysis of your portfolio composition"
      insights={insights}
      headerIcon="analytics-outline"
    />
  );
};

export default CategoryInsights;
