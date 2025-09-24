import React from 'react';
import InsightsSection from '@/components/analytics/InsightsSection';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {CURRENCIES} from '@/lib/supabase';

interface CurrencyInsightsProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    diversificationScore: number;
    baseCurrency: string;
    assets: Array<{currency: string; amount: number; percentage: number}>;
    liabilities: Array<{currency: string; amount: number; percentage: number}>;
    allCurrencies: Array<{currency: string; assets: number; liabilities: number; total: number}>;
  };
  userCurrency: string;
}

const CurrencyInsights: React.FC<CurrencyInsightsProps> = ({data, userCurrency}) => {
  const {theme} = useTheme();

  // Early return if no meaningful data
  if (!data.assets.length && !data.liabilities.length) {
    return null;
  }

  // ✅ Use the exact currency list from supabase.ts
  // CURRENCIES = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR']

  // Currency classifications based on the official supported list
  const CURRENCY_GROUPS = {
    // Major reserve currencies - highest stability
    stable: ['USD', 'EUR', 'JPY', 'CHF'],

    // Developed market currencies - moderate volatility
    moderate: ['CAD', 'AUD', 'NZD', 'SEK', 'NOK', 'DKK', 'SGD', 'HKD', 'ILS'],

    // European currencies (EU members/candidates) - generally stable due to EU proximity
    europeanStable: ['BGN', 'CZK', 'HUF', 'PLN', 'RON'],

    // Emerging market major economies - higher volatility but significant
    emergingMajor: ['CNY', 'INR', 'BRL', 'KRW', 'MXN', 'ZAR'],

    // Volatile/smaller economies - highest volatility
    volatile: ['GBP', 'TRY', 'IDR', 'MYR', 'PHP', 'THB', 'ISK'],
  };

  // Validate all currencies in groups exist in CURRENCIES array
  const validateCurrencyGroups = () => {
    const allGroupedCurrencies = [
      ...CURRENCY_GROUPS.stable,
      ...CURRENCY_GROUPS.moderate,
      ...CURRENCY_GROUPS.europeanStable,
      ...CURRENCY_GROUPS.emergingMajor,
      ...CURRENCY_GROUPS.volatile,
    ];

    // Check if any supported currency is missing from our groups
    const missingCurrencies = CURRENCIES.filter(currency => !allGroupedCurrencies.includes(currency));
    if (missingCurrencies.length > 0) {
      console.warn('Currencies missing from groups:', missingCurrencies);
    }

    return allGroupedCurrencies.every(currency => CURRENCIES.includes(currency));
  };

  // Validate on first run (development helper)
  if (__DEV__) {
    validateCurrencyGroups();
  }

  // Calculate key metrics for insights
  const baseCurrencyAssetExposure = data.assets.find(a => a.currency === userCurrency)?.percentage || 0;
  const foreignAssetExposure = 1 - baseCurrencyAssetExposure;
  const foreignLiabilityExposure = 1 - (data.liabilities.find(l => l.currency === userCurrency)?.percentage || 0);

  // Count currencies with positions
  const totalCurrencies = new Set([...data.assets.map(a => a.currency), ...data.liabilities.map(l => l.currency)]).size;

  // Calculate hedged currencies
  const hedgedCurrencies = data.assets.filter(asset =>
    data.liabilities.some(liability => liability.currency === asset.currency)
  ).length;

  // Top currency exposure
  const topCurrency = data.assets.sort((a, b) => b.amount - a.amount)[0];
  const topCurrencyIsBase = topCurrency?.currency === userCurrency;

  // Enhanced currency analysis based on official currency list
  const getCurrencyGroup = (currency: string): string => {
    // Ensure currency is in our supported list
    if (!CURRENCIES.includes(currency)) {
      console.warn(`Unsupported currency detected: ${currency}`);
      return 'unknown';
    }

    if (CURRENCY_GROUPS.stable.includes(currency)) return 'stable';
    if (CURRENCY_GROUPS.moderate.includes(currency)) return 'moderate';
    if (CURRENCY_GROUPS.europeanStable.includes(currency)) return 'europeanStable';
    if (CURRENCY_GROUPS.emergingMajor.includes(currency)) return 'emergingMajor';
    if (CURRENCY_GROUPS.volatile.includes(currency)) return 'volatile';
    return 'unknown';
  };

  // Analyze portfolio composition - only process supported currencies
  const portfolioAnalysis = {
    stable: data.assets.filter(
      asset => CURRENCIES.includes(asset.currency) && CURRENCY_GROUPS.stable.includes(asset.currency)
    ),
    moderate: data.assets.filter(
      asset => CURRENCIES.includes(asset.currency) && CURRENCY_GROUPS.moderate.includes(asset.currency)
    ),
    europeanStable: data.assets.filter(
      asset => CURRENCIES.includes(asset.currency) && CURRENCY_GROUPS.europeanStable.includes(asset.currency)
    ),
    emergingMajor: data.assets.filter(
      asset => CURRENCIES.includes(asset.currency) && CURRENCY_GROUPS.emergingMajor.includes(asset.currency)
    ),
    volatile: data.assets.filter(
      asset => CURRENCIES.includes(asset.currency) && CURRENCY_GROUPS.volatile.includes(asset.currency)
    ),
  };

  // Calculate exposure percentages
  const stableExposure = portfolioAnalysis.stable.reduce((sum, curr) => sum + curr.percentage, 0);
  const emergingExposure = portfolioAnalysis.emergingMajor.reduce((sum, curr) => sum + curr.percentage, 0);
  const volatileExposure = portfolioAnalysis.volatile.reduce((sum, curr) => sum + curr.percentage, 0);
  const europeanExposure = portfolioAnalysis.europeanStable.reduce((sum, curr) => sum + curr.percentage, 0);

  // Generate insights
  const insights = [];

  // Diversification insights
  if (data.diversificationScore >= 85) {
    insights.push({
      icon: '🏆',
      title: 'Excellent Currency Diversification',
      description: `Your portfolio spans ${totalCurrencies} currencies with balanced exposure, reducing concentration risk.`,
      color: theme.colors.success,
    });
  } else if (data.diversificationScore <= 40) {
    insights.push({
      icon: '⚠️',
      title: 'High Currency Concentration',
      description: `${Math.round(baseCurrencyAssetExposure * 100)}% of assets in ${userCurrency}. Consider diversifying internationally.`,
      color: theme.colors.warning,
    });
  }

  // Stable currency dominance
  if (stableExposure >= 0.8) {
    insights.push({
      icon: '🛡️',
      title: 'Reserve Currency Focus',
      description: `${Math.round(stableExposure * 100)}% exposure to major reserve currencies (USD, EUR, JPY, CHF) provides excellent stability.`,
      color: theme.colors.success,
    });
  }

  // Emerging market exposure
  if (emergingExposure >= 0.3) {
    insights.push({
      icon: '🌍',
      title: 'Strong Emerging Market Exposure',
      description: `${Math.round(emergingExposure * 100)}% allocation to emerging markets (${portfolioAnalysis.emergingMajor.map(a => a.currency).join(', ')}) offers growth potential.`,
      color: theme.colors.info,
    });
  } else if (emergingExposure === 0 && data.totalAssets > 50000) {
    insights.push({
      icon: '📈',
      title: 'Missing Emerging Market Exposure',
      description:
        'No exposure to high-growth emerging markets like CNY, INR, BRL, or KRW. Consider small allocations for diversification.',
      color: theme.colors.text.secondary,
    });
  }

  // European market exposure
  if (europeanExposure >= 0.2) {
    insights.push({
      icon: '🇪🇺',
      title: 'European Currency Exposure',
      description: `${Math.round(europeanExposure * 100)}% in European currencies (${portfolioAnalysis.europeanStable.map(a => a.currency).join(', ')}) benefits from EU economic integration.`,
      color: theme.colors.info,
    });
  }

  // Volatile currency warnings
  if (volatileExposure >= 0.2) {
    const volatileCurrencies = portfolioAnalysis.volatile.map(a => a.currency).join(', ');
    insights.push({
      icon: '🌊',
      title: 'High Volatility Exposure',
      description: `${Math.round(volatileExposure * 100)}% exposure to volatile currencies (${volatileCurrencies}). Monitor these positions closely.`,
      color: theme.colors.warning,
    });
  }

  // GBP specific insight (Brexit impact)
  const gbpExposure = data.assets.find(asset => asset.currency === 'GBP');
  if (gbpExposure && gbpExposure.percentage > 0.15) {
    insights.push({
      icon: '🇬🇧',
      title: 'British Pound Exposure',
      description: `${Math.round(gbpExposure.percentage * 100)}% in GBP. Brexit-related volatility continues to impact pound stability.`,
      color: theme.colors.warning,
    });
  }

  // Natural hedging insights
  if (hedgedCurrencies > 0) {
    insights.push({
      icon: '⚖️',
      title: 'Natural Currency Hedging',
      description: `${hedgedCurrencies} currencies have both assets and liabilities, naturally reducing exchange rate risk.`,
      color: theme.colors.success,
    });
  }

  // Single currency dominance (non-base)
  if (topCurrency && topCurrency.percentage > 0.7 && !topCurrencyIsBase) {
    insights.push({
      icon: '🚨',
      title: 'Single Currency Dominance',
      description: `${topCurrency.currency} represents ${Math.round(topCurrency.percentage * 100)}% of foreign exposure, creating concentration risk.`,
      color: theme.colors.error,
    });
  }

  // Regional concentration analysis - using only supported currencies
  const asianCurrencies = ['JPY', 'CNY', 'KRW', 'SGD', 'HKD', 'MYR', 'PHP', 'THB', 'IDR', 'INR'].filter(currency =>
    CURRENCIES.includes(currency)
  );
  const asianExposure = data.assets.filter(asset => asianCurrencies.includes(asset.currency));
  const totalAsianExposure = asianExposure.reduce((sum, curr) => sum + curr.percentage, 0);

  if (totalAsianExposure >= 0.4) {
    insights.push({
      icon: '🌏',
      title: 'Strong Asian Market Focus',
      description: `${Math.round(totalAsianExposure * 100)}% exposure to Asian currencies provides access to dynamic growth markets.`,
      color: theme.colors.info,
    });
  }

  // Nordic/Scandinavian exposure - verified against supported currencies
  const nordicCurrencies = ['SEK', 'NOK', 'DKK', 'ISK'].filter(currency => CURRENCIES.includes(currency));
  const nordicExposure = data.assets.filter(asset => nordicCurrencies.includes(asset.currency));
  const totalNordicExposure = nordicExposure.reduce((sum, curr) => sum + curr.percentage, 0);

  if (totalNordicExposure >= 0.15) {
    insights.push({
      icon: '❄️',
      title: 'Nordic Currency Exposure',
      description: `${Math.round(totalNordicExposure * 100)}% in Nordic currencies (${nordicExposure.map(a => a.currency).join(', ')}) reflects strong economic fundamentals.`,
      color: theme.colors.info,
    });
  }

  // ✅ Only render if there are insights
  if (insights.length === 0) {
    return null;
  }

  // Limit to most relevant insights
  const limitedInsights = insights.slice(0, 6);

  return (
    <InsightsSection
      title="Currency Insights"
      subtitle="AI-powered analysis based on your supported currency portfolio"
      insights={limitedInsights}
      headerIcon="globe-outline"
    />
  );
};

export default CurrencyInsights;
