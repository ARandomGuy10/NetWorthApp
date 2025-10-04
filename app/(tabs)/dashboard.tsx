import React, {useCallback, memo} from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import LoadingView from '@/components/ui/LoadingView';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDashboardData} from '@/hooks/useDashboard';
import {useProfile} from '@/hooks/useProfile';
import type {Theme} from '@/lib/supabase';
import IntegratedDashboard_Wagmi from '@/components/home/IntegratedDashboard_Wagmi';
import AssetsLiabilitiesSection from '@/components/home/AssetsLiabilitiesSection';
import ModernFAB from '@/components/home/ModernFAB';
import EmptyDashboardState from '@/components/home/EmptyDashboardState';
import StickyHeader from '@/components/home/StickyHeader'; // Add this import
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {router} from 'expo-router';
import AccountSummary from '@/components/home/AccountSummary';

function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = getStyles(theme, insets);

  // Get both profile and dashboard data
  const {data: profile, isLoading: profileLoading} = useProfile();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch,
  } = useDashboardData({
    sentry: {
      location: 'dashboard',
      component: 'DashboardScreen',
    },
  });

  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch]);

  const handleAddFirstAccount = () => {
    router.push('accounts/add-account');
  };

  const showLoadingSpinner = dashboardLoading && !dashboardData;

  if (showLoadingSpinner) {
    return <LoadingView />;
  }

  // Show empty state when dashboard data is null/undefined
  if (!dashboardData || dashboardData.accounts.length === 0) {
    return <EmptyDashboardState onAddFirstAccount={handleAddFirstAccount} />;
  }

  const netWorthData = {
    totalAssets: dashboardData.totalAssets || 0,
    totalLiabilities: dashboardData.totalLiabilities || 0,
    totalNetWorth: dashboardData.totalNetWorth || 0,
    currency: profile?.preferred_currency || 'EUR',
  };

  return (
    <View style={styles.container}>
      <StickyHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            progressViewOffset={insets.top + 100}
          />
        }>
        <IntegratedDashboard_Wagmi />

        <AssetsLiabilitiesSection netWorthData={netWorthData} />

        {/*  <AccountsList accounts={dashboardData?.accounts || []} /> */}
        <AccountSummary accounts={dashboardData?.accounts || []} remindAfterDays={profile?.remind_after_days || 30} />

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      <ModernFAB />
    </View>
  );
}

const getStyles = (theme: Theme, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingTop: insets.top + 40, // Add padding for sticky header
    },
    sectionsContainer: {
      paddingHorizontal: 16,
    },
    bottomSpacing: {
      height: 120,
    },
  });

export default memo(DashboardScreen);
