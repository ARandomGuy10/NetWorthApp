// app/(tabs)/analytics/accounts.tsx
import React, {useCallback, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {useQueryClient} from '@tanstack/react-query';

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
      {/* Only Back Button - positioned absolutely */}
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, {top: insets.top + 23}]}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text.onGradient} />
      </TouchableOpacity>

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
