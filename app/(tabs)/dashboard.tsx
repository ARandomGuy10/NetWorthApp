import React, { useCallback, memo, useState } from 'react';

import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';

import { router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccountSummary from '@/components/home/AccountSummary';
import AssetsLiabilitiesSection from '@/components/home/AssetsLiabilitiesSection';
import EmptyDashboardState from '@/components/home/EmptyDashboardState';
import IntegratedDashboard_Wagmi from '@/components/home/IntegratedDashboard_Wagmi';
import StickyHeader from '@/components/home/StickyHeader';
import ModernFAB from '@/components/home/ModernFAB';
import type { Theme } from '@/lib/supabase';
import { useDashboardData } from '@/hooks/useDashboard';
import { useProfile } from '@/hooks/useProfile';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { useTheme } from '@/src/styles/theme/ThemeContext';

function DashboardScreen() {
  console.log('DashboardScreen rendered');
  const insets = useSafeAreaInsets();

   // Safety check for the race condition
  const safeInsets = typeof insets === 'object' && insets !== null 
    ? insets 
    : { top: 0, right: 0, bottom: 0, left: 0 };

  const { theme } = useTheme();
  const styles = getStyles(theme, safeInsets);

  // Get both profile and dashboard data
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: dashboardData, isLoading: dashboardLoading, error, refetch, isFetching } = useDashboardData();

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
    console.log('Navigate to add account screen');
    router.push('accounts/add-account');
  };

  // The flicker happens in a state where `dashboardLoading` is false but `dashboardData` is still undefined.
  // We must treat this as a loading state.
  // We are loading if:
  // 1. The profile is loading (our first dependency).
  // 2. The dashboard is in its initial loading phase.
  // 3. The history data is loading.
  // 4. The dashboard is NOT loading, but we have no data AND no error. This catches the flicker.
  const showSpinner =
    profileLoading ||
    dashboardLoading ||
    (!dashboardData && !error);

  if (showSpinner) {
    console.log('Rendering loading spinner', theme.colors.primary);
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If we're past the spinner, it means we either have data or an error.
  // If there's an error, or if the data is empty, show the empty state.
  if (error || !dashboardData || dashboardData.accounts.length === 0) {
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
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
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
