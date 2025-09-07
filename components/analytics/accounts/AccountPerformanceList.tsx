// components/analytics/accounts/AccountPerformanceList.tsx

import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useAccountsWithBalances} from '@/hooks/useAccountsWithBalances';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {formatSmartNumber} from '@/src/utils/formatters';
import type {Period} from '@/lib/supabase';

interface AccountPerformanceListProps {
  period: Period;
}

type SortOption = 'performance' | 'alphabetical' | 'balance';

interface AccountPerformance {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  currency: string;
  currentBalance: number;
  startBalance: number;
  change: number;
  changePercent: number;
}

const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    Cash: 'card-outline',
    Checking: 'card-outline',
    Savings: 'wallet-outline',
    Investment: 'trending-up-outline',
    Retirement: 'shield-checkmark-outline',
    'Real Estate': 'home-outline',
    Vehicle: 'car-sport-outline',
    'Credit Card': 'card',
    'Personal Loan': 'document-text-outline',
    Mortgage: 'home',
    'Auto Loan': 'car-sport',
    'Student Loan': 'school-outline',
  };
  return iconMap[category] || 'ellipse-outline';
};

const AccountPerformanceList: React.FC<AccountPerformanceListProps> = ({period}) => {
  const {theme} = useTheme();
  const [sortBy, setSortBy] = useState<SortOption>('performance');

  const {data: rawAccounts} = useAccountsWithBalances();
  const {data: historyData, isLoading} = useNetWorthHistory({
    period,
    includeAccountBreakdown: true,
  });

  // Process accounts with performance metrics
  const accountPerformances = useMemo((): AccountPerformance[] => {
    if (!rawAccounts || !historyData?.data || historyData.data.length === 0) {
      return [];
    }

    const accounts = Array.isArray(rawAccounts) ? rawAccounts.flat() : [];
    const performances = accounts
      .filter(acc => acc.include_in_net_worth && !acc.is_archived)
      .map(account => {
        const accountHistory: number[] = [];
        historyData.data.forEach(dataPoint => {
          const accountSnap = dataPoint.accounts.find(snap => snap.account_id === account.account_id);
          if (accountSnap) {
            accountHistory.push(accountSnap.balance);
          }
        });

        const currentBalance = account.latest_balance || 0;
        const startBalance = accountHistory.length > 0 ? accountHistory[0] : currentBalance;
        const change = currentBalance - startBalance;
        const changePercent = startBalance !== 0 ? (change / Math.abs(startBalance)) * 100 : 0;

        return {
          id: account.account_id,
          name: account.account_name,
          type: account.account_type,
          category: account.category,
          currency: account.currency,
          currentBalance,
          startBalance,
          change,
          changePercent,
        };
      });

    // Apply sorting
    return performances.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.changePercent - a.changePercent;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'balance':
          return b.currentBalance - a.currentBalance;
        default:
          return b.changePercent - a.changePercent;
      }
    });
  }, [rawAccounts, historyData, sortBy]);

  const handleSortChange = () => {
    const options: SortOption[] = ['performance', 'alphabetical', 'balance'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const styles = getStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account Performance</Text>
          <Text style={styles.subtitle}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Account Performance</Text>
          <TouchableOpacity style={styles.sortButton} onPress={handleSortChange}>
            <Ionicons name="swap-vertical" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {period === 'ALL' ? 'All time' : period} • Sort: {sortBy}
        </Text>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {accountPerformances.map((account, index) => (
          <View key={account.id} style={styles.accountItem}>
            {/* Rank Badge */}
            <View style={[styles.rankBadge, index < 3 && styles.topRankBadge]}>
              <Text style={[styles.rankText, index < 3 && styles.topRankText]}>{index + 1}</Text>
            </View>

            {/* Account Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={getAccountIcon(account.category)} size={20} color={theme.colors.text.secondary} />
            </View>

            {/* Account Info */}
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountDetails}>{account.category}</Text>
            </View>

            {/* Performance Metrics */}
            <View style={styles.performanceContainer}>
              <Text
                style={[
                  styles.changeAmount,
                  {
                    color: account.change >= 0 ? theme.colors.asset : theme.colors.liability,
                  },
                ]}>
                {formatSmartNumber(account.currentBalance, account.currency)}
              </Text>
              <Text
                style={[
                  styles.changePercent,
                  {
                    color: account.change >= 0 ? theme.colors.asset : theme.colors.liability,
                  },
                ]}>
                {account.change >= 0 ? '+' : ''}
                {account.changePercent.toFixed(1)}% ({account.change >= 0 ? '+' : ''}
                {formatSmartNumber(account.change, account.currency)})
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.xl,
      overflow: 'hidden',

    },
    header: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    title: {
      fontSize: theme.fontSizes.title,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    sortButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
    },
    subtitle: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
    },
    listContainer: {
      maxHeight: 400,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    rankBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    topRankBadge: {
      backgroundColor: theme.colors.primary,
    },
    rankText: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    topRankText: {
      color: theme.colors.text.onPrimary,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    accountInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    accountName: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    accountDetails: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
    },
    performanceContainer: {
      alignItems: 'flex-end',
      marginRight: theme.spacing.sm,
    },
    changeAmount: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '700',
      marginBottom: 2,
    },
    changePercent: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '500',
    },
  });

export default AccountPerformanceList;
