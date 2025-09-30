// app/(tabs)/analytics/accounts.tsx

import React, {useCallback, useState} from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AccountComparisonChart from '@/components/analytics/accounts/AccountComparisonChart';
import AccountPerformanceList from '@/components/analytics/accounts/AccountPerformanceList';
import AccountInsights from '@/components/analytics/accounts/AccountInsights'; // ✅ NEW
import LoadingView from '@/components/ui/LoadingView';
import type {Period} from '@/lib/supabase';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';

const AccountsAnalyticsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const queryClient = useQueryClient();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('3M');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {data: historyData, isLoading} = useNetWorthHistory({
    period: selectedPeriod,
    includeAccountBreakdown: true,
  });

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
    await queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
    setIsRefreshing(false);
  }, [queryClient]);

  const onBack = useCallback(() => {
    Haptics.selectionAsync();
    router.back();
  }, [router]);

  const styles = getStyles(theme, insets);

  if (isLoading && !historyData) {
    return <LoadingView message="Analyzing account performance..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{paddingBottom: insets.bottom + 90}}
        showsVerticalScrollIndicator={false}>
        {/* Account Comparison Chart - controlled by shared period */}
        <View style={styles.sectionContainer}>
          <AccountComparisonChart
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            historyData={historyData}
          />
        </View>

        {/* Account Performance List */}
        <View style={styles.sectionContainer}>
          <AccountPerformanceList period={selectedPeriod} historyData={historyData} />
        </View>

        {/* ✅ NEW: Account Insights */}
        <AccountInsights period={selectedPeriod} historyData={historyData} />
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },

    scrollContent: {
      flexGrow: 1,
    },

    sectionContainer: {
      marginBottom: theme.spacing.xxl, // ✅ Consistent spacing between sections
    },
  });

export default AccountsAnalyticsScreen;
