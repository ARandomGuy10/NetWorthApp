import React, {useCallback, useState} from 'react';

import {View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AccountComparisonChart from '@/components/analytics/accounts/AccountComparisonChart';
import AccountPerformanceList from '@/components/analytics/accounts/AccountPerformanceList';
import PeriodSelector from '@/components/ui/PeriodSelector';
import type {Period} from '@/lib/supabase';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const AccountsAnalyticsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const queryClient = useQueryClient();

  // ✅ SHARED period state for all components
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('3M');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <View style={styles.container}>
     
    
      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        
        {/* Account Comparison Chart - controlled by shared period */}
        <AccountComparisonChart period={selectedPeriod} onPeriodChange={setSelectedPeriod} />

        {/* Account Performance List - uses same period, no comparison */}
        <AccountPerformanceList period={selectedPeriod} />
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
    
  });

export default AccountsAnalyticsScreen;
