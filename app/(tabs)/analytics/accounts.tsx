import React, {useCallback, useState} from 'react';

import {View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Text} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {useQueryClient} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AccountComparisonChart from '@/components/analytics/accounts/AccountComparisonChart';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const AccountsAnalyticsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Invalidate queries that power this screen to refetch data
    await queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
    await queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
    setIsRefreshing(false);
  }, [queryClient]);

  const styles = getStyles(theme);

  const onBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }>
      {/* Chart Component */}
      <AccountComparisonChart />
    </ScrollView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
    },
    backBtn: {
      position: 'absolute',
      left: theme.spacing.md,
      width: theme.spacing.xl + theme.spacing.lg, // 36px
      height: theme.spacing.xl + theme.spacing.lg, // 36px
      borderRadius: (theme.spacing.xl + theme.spacing.lg) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.interactive.hover,
      borderWidth: 0.5,
      borderColor: theme.colors.border.primary,
      zIndex: 10,
    },
  });

export default AccountsAnalyticsScreen;
