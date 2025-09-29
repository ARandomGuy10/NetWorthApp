import React, {useCallback, useState} from 'react';
import {View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl, ActivityIndicator} from 'react-native';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CategoryAllocationPieChart from '@/components/analytics/categories/CategoryAllocationPieChart';
import CategoryInsights from '@/components/analytics/categories/CategoryInsights';
import CategoryPerformanceList from '@/components/analytics/categories/CategoryPerformanceList';
import NetWorthSummaryCard from '@/components/analytics/categories/NetWorthSummaryCard';

import {useDashboardData} from '@/hooks/useDashboard';
import {useProfile} from '@/hooks/useProfile';
import {useHaptics} from '@/hooks/useHaptics';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {getGradientColors} from '@/src/utils/formatters';

const CategoriesAnalyticsScreen: React.FC = () => {
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
        <Text style={styles.loadingText}>Loading portfolio analysis...</Text>
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

  // Process the data with safe handling
  const userCurrency = profile.preferred_currency;
  const processedData = processCategoryData(
    dashboardData.analytics.categoryBreakdown,
    dashboardData.totalAssets,
    dashboardData.totalLiabilities,
    userCurrency
  );


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }>
        {/* Header */}
        <LinearGradient
          colors={getGradientColors(theme, 'header')}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color={theme.colors.text.onGradient} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Portfolio Breakdown</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </LinearGradient>

        {/* Net Worth Summary Card */}
        <View style={styles.sectionContainer}>
          <NetWorthSummaryCard
            data={{
              totalAssets: processedData.totalAssets,
              totalLiabilities: processedData.totalLiabilities,
              netWorth: processedData.netWorth,
              healthScore: processedData.healthScore,
              currency: processedData.currency,
            }}
          />
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          {/* Assets Pie */}
          {processedData.totalAssets > 0 && (
            <View style={styles.sectionContainer}>
              <CategoryAllocationPieChart
                items={processedData.assets}
                currency={processedData.currency}
                title="Asset Allocation"
                centerLabel="Assets"
              />
            </View>
          )}

          {/* Liabilities Pie */}
          {processedData.totalLiabilities > 0 && (
            <View style={styles.sectionContainer}>
              <CategoryAllocationPieChart
                items={processedData.liabilities}
                currency={processedData.currency}
                title="Liability Breakdown"
                centerLabel="Liabilities"
              />
            </View>
          )}
        </View>

        {/* Category Performance - Full Width */}
        <View style={styles.sectionContainer}>
          <CategoryPerformanceList data={processedData.allCategories} currency={processedData.currency} />
        </View>

        {/* Category Insights */}
        <View style={styles.sectionContainer}>
          <CategoryInsights
            categoryData={processedData}
            dashboardData={dashboardData}
            currency={processedData.currency}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const processCategoryData = (
  categoryBreakdown: any[],
  totalAssets: number,
  totalLiabilities: number,
  currency: string
) => {
  const totalAssetsNum = Number(totalAssets) || 0;
  const totalLiabilitiesNum = Number(totalLiabilities) || 0;

  if (!categoryBreakdown || !Array.isArray(categoryBreakdown)) {
    return {
      assets: [],
      liabilities: [],
      allCategories: [],
      totalAssets: totalAssetsNum,
      totalLiabilities: totalLiabilitiesNum,
      netWorth: totalAssetsNum - totalLiabilitiesNum,
      healthScore: 100,
      currency,
    };
  }

  const validCategories = categoryBreakdown.filter(
    cat => cat && typeof cat === 'object' && cat.category && typeof cat.category === 'string'
  );

  const assetsRaw = validCategories.filter(cat => Number(cat.assets || 0) > 0);
  const liabilitiesRaw = validCategories.filter(cat => Number(cat.liabilities || 0) > 0);

  const assets = assetsRaw.map(cat => {
    const amount = Number(cat.assets || 0);
    return {
      type: 'asset' as const,
      category: cat.category,
      amount,
      percentage: totalAssetsNum > 0 ? amount / totalAssetsNum : 0, // fraction 0–1
    };
  });

  const liabilities = liabilitiesRaw.map(cat => {
    const amount = Number(cat.liabilities || 0);
    return { // Explicitly cast to 'liability' type
      type: 'liability' as const,
      category: cat.category,
      amount,
      percentage: totalLiabilitiesNum > 0 ? amount / totalLiabilitiesNum : 0, // fraction 0–1
    };
  });

  return {
    assets,
    liabilities,
    allCategories: validCategories,
    totalAssets: totalAssetsNum,
    totalLiabilities: totalLiabilitiesNum,
    netWorth: totalAssetsNum - totalLiabilitiesNum,
    healthScore: calculateHealthScore(totalAssetsNum, totalLiabilitiesNum),
    currency,
  };
};

// Calculate portfolio health score
const calculateHealthScore = (assets: number, liabilities: number): number => {
  if (liabilities === 0) return 100; // Perfect if no debt
  const ratio = liabilities / assets;
  if (ratio <= 0.1) return 95;
  if (ratio <= 0.3) return 85;
  if (ratio <= 0.5) return 70;
  if (ratio <= 0.8) return 60;
  return 50;
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      flexGrow: 1,
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
      marginBottom: theme.spacing.xxl,
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
    // Bottom spacing for better scroll experience
    bottomSpacing: {
      height: theme.spacing.xxxl + insets.bottom,
    },
    chartsSection: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
    },
  });

export default CategoriesAnalyticsScreen;
