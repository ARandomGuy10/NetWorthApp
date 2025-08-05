// app/(tabs)/dashboard.tsx
import React, { useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDashboardData } from '@/hooks/useDashboard';
import { useProfile } from '@/hooks/useProfile';
import type { DashboardAccount, Theme } from '@/lib/supabase';

// Import modern components
import ModernHomeHeader from '../../components/home/ModernHomeHeader';
import ModernNetWorthChart from '../../components/home/ModernNetWorthChart';
import AssetsLiabilitiesSection from '../../components/home/AssetsLiabilitiesSection';
import AccountsList from '../../components/home/AccountsList';
import ModernFAB from '../../components/home/ModernFAB';
import { useTheme } from '@/src/styles/theme/ThemeContext';

function DashboardScreen() {
  console.log('DashboardScreen rendered');
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Get both profile and dashboard data
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error, 
    refetch,
    isFetching 
  } = useDashboardData();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Fixed: Better loading logic that respects cached data
  const showLoadingSpinner = (profileLoading || dashboardLoading) && 
                            !profile && 
                            !dashboardData && 
                            !isFetching;

  // Show loading while either profile or dashboard is loading
  if (showLoadingSpinner) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Prepare data for components
  const netWorthData = {
    totalAssets: dashboardData?.totalAssets || 0,
    totalLiabilities: dashboardData?.totalLiabilities || 0,
    totalNetWorth: dashboardData?.totalNetWorth || 0,
    currency: profile?.preferred_currency || 'EUR'
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={Boolean(isFetching && !dashboardData)} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            progressViewOffset={0}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ModernHomeHeader 
          profile={profile} 
          netWorthData={netWorthData} 
          trend={dashboardData?.trend}
        />

        <ModernNetWorthChart 
          chartData={dashboardData?.chartData} 
          netWorthData={netWorthData} 
        />

        <AssetsLiabilitiesSection netWorthData={netWorthData} />

        <AccountsList accounts={dashboardData?.accounts || []} />

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ModernFAB />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 120,
  },
});

export default memo(DashboardScreen);
