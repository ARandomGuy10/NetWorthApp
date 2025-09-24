import React, {useCallback, useState} from 'react';
import {View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl, ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CurrencyBreakdownChart from '@/components/analytics/currency/CurrencyBreakdownChart';
import CurrencyNetWorthCard from '@/components/analytics/currency/CurrencyNetWorthCard';
import CurrencyRiskAnalysis from '@/components/analytics/currency/CurrencyRiskAnalysis';
import CurrencyInsights from '@/components/analytics/currency/CurrencyInsights';

import {useDashboardData} from '@/hooks/useDashboard';
import {useProfile} from '@/hooks/useProfile';
import {useHaptics} from '@/hooks/useHaptics';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const CurrencyAnalyticsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const queryClient = useQueryClient();
  const {impactAsync} = useHaptics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {data: dashboardData, isLoading, refetch} = useDashboardData();
  const {data: profile} = useProfile();

  const styles = getStyles(theme, insets);

  const onBack = useCallback(() => {
    Haptics.selectionAsync();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/analytics/');
    }
  }, [router]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await refetch();
    setIsRefreshing(false);
  }, [refetch, impactAsync]);

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading currency analysis...</Text>
      </View>
    );
  }

  if (!dashboardData || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No data available</Text>
      </View>
    );
  }

  // Process the currency data with safe handling
  const userCurrency = profile.preferred_currency;
  const processedData = processCurrencyData(
    dashboardData.analytics.currencyExposure,
    dashboardData.totalAssets,
    dashboardData.totalLiabilities,
    userCurrency
  );

  // Check if we have meaningful currency data
  const hasCurrencyData = processedData.assets.length > 0 || processedData.liabilities.length > 0;

  // FIXED: Use gradient properly from theme
  const getGradientColors = (gradient: any) => {
    if (Array.isArray(gradient)) return gradient;
    if (gradient?.header && Array.isArray(gradient.header)) return gradient.header;
    if (gradient?.primary && Array.isArray(gradient.primary)) return gradient.primary;
    return ['#1a1a2e', '#16213e', '#0f4c75']; // fallback
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 90}}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <LinearGradient
        colors={getGradientColors(theme.colors.gradient)}
        style={styles.headerGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.onGradient} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Currency Exposure</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* Net Worth Summary Card */}
      <View style={styles.sectionContainer}>
        <CurrencyNetWorthCard data={processedData} userCurrency={userCurrency} />
      </View>

      {/* ✅ FIXED: Only show analytics components if we have currency data */}
      {hasCurrencyData ? (
        <>
          {/* Charts Section */}
          <View style={styles.chartsSection}>
            {/* Assets Pie Chart */}
            {processedData.totalAssets > 0 && processedData.assets.length > 0 && (
              <View style={styles.sectionContainer}>
                <CurrencyBreakdownChart
                  data={processedData.assets}
                  title="Assets by Currency"
                  type="asset"
                  total={processedData.totalAssets}
                  currency={userCurrency}
                />
              </View>
            )}

            {/* Liabilities Pie Chart */}
            {processedData.totalLiabilities > 0 && processedData.liabilities.length > 0 && (
              <View style={styles.sectionContainer}>
                <CurrencyBreakdownChart
                  data={processedData.liabilities}
                  title="Liabilities by Currency"
                  type="liability"
                  total={processedData.totalLiabilities}
                  currency={userCurrency}
                />
              </View>
            )}
          </View>

          {/* Currency Risk Analysis */}
          <View style={styles.sectionContainer}>
            <CurrencyRiskAnalysis data={processedData} theme={theme} userCurrency={userCurrency} />
          </View>

          {/* ✅ Currency Insights - Will only render if insights exist */}
          <CurrencyInsights data={processedData} userCurrency={userCurrency} />
        </>
      ) : (
        /* Empty state for no currency data */
        <View style={styles.emptyChartsContainer}>
          <Ionicons name="globe-outline" size={48} color={theme.colors.text.secondary} />
          <Text style={styles.emptyChartsTitle}>No Currency Data</Text>
          <Text style={styles.emptyChartsText}>
            Add assets or liabilities in different currencies to see detailed analytics and insights.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const processCurrencyData = (
  currencyExposure: any[],
  totalAssets: number,
  totalLiabilities: number,
  baseCurrency: string
) => {
  const totalAssetsNum = Number(totalAssets) || 0;
  const totalLiabilitiesNum = Number(totalLiabilities) || 0;

  if (!currencyExposure || !Array.isArray(currencyExposure)) {
    return {
      assets: [],
      liabilities: [],
      allCurrencies: [],
      totalAssets: totalAssetsNum,
      totalLiabilities: totalLiabilitiesNum,
      netWorth: totalAssetsNum - totalLiabilitiesNum,
      diversificationScore: 100,
      baseCurrency,
    };
  }

  const validCurrencies = currencyExposure.filter(
    curr => curr && typeof curr === 'object' && curr.currency && typeof curr.currency === 'string'
  );

  const assetsRaw = validCurrencies.filter(curr => Number(curr.assets || 0) > 0);
  const liabilitiesRaw = validCurrencies.filter(curr => Number(curr.liabilities || 0) > 0);

  const assets = assetsRaw.map(curr => {
    const amount = Number(curr.assets || 0);
    return {
      type: 'asset' as const,
      currency: curr.currency,
      amount,
      percentage: totalAssetsNum > 0 ? amount / totalAssetsNum : 0, // fraction 0–1
    };
  });

  const liabilities = liabilitiesRaw.map(curr => {
    const amount = Number(curr.liabilities || 0);
    return {
      type: 'liability' as const,
      currency: curr.currency,
      amount,
      percentage: totalLiabilitiesNum > 0 ? amount / totalLiabilitiesNum : 0, // fraction 0–1
    };
  });

  return {
    assets,
    liabilities,
    allCurrencies: validCurrencies,
    totalAssets: totalAssetsNum,
    totalLiabilities: totalLiabilitiesNum,
    netWorth: totalAssetsNum - totalLiabilitiesNum,
    diversificationScore: calculateDiversificationScore(assets, baseCurrency),
    baseCurrency,
  };
};

// Calculate currency diversification score
const calculateDiversificationScore = (assets: any[], baseCurrency: string): number => {
  if (assets.length <= 1) return 50; // Low diversification

  const baseCurrencyExposure = assets.find(a => a.currency === baseCurrency)?.percentage || 0;

  // Higher score for better diversification
  if (baseCurrencyExposure <= 0.5) return 95; // Well diversified
  if (baseCurrencyExposure <= 0.7) return 85; // Good diversification
  if (baseCurrencyExposure <= 0.85) return 70; // Moderate diversification
  if (baseCurrencyExposure <= 0.95) return 60; // Low diversification
  return 40; // Single currency concentration
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    // Header Styles
    headerGradient: {
      paddingTop: insets.top + theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.interactive.hover,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: theme.colors.border.primary,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '800',
      color: theme.colors.text.onGradient,
      letterSpacing: 0.5,
    },
    headerSpacer: {
      width: 44,
    },
    // Section spacing
    sectionContainer: {
      marginBottom: theme.spacing.lg,
    },
    chartsSection: {
      gap: theme.spacing.sm,
    },
    // Empty states
    emptyChartsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxxl * 2,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyChartsTitle: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyChartsText: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: theme.fontSizes.body * 1.4,
      maxWidth: 280,
    },
    // Loading States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

export default CurrencyAnalyticsScreen;
