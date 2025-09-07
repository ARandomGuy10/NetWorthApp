// components/analytics/accounts/AccountPerformanceList.tsx

import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, Pressable, StyleSheet, ScrollView, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';

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
  originalCurrency: string;
  displayCurrency: string;
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
    Brokerage: 'stats-chart-outline',
  };
  return iconMap[category] || 'ellipse-outline';
};

const getSortLabel = (sortBy: SortOption): string => {
  switch (sortBy) {
    case 'performance':
      return 'Performance';
    case 'alphabetical':
      return 'A-Z';
    case 'balance':
      return 'Balance';
    default:
      return 'Performance';
  }
};

const AccountPerformanceList: React.FC<AccountPerformanceListProps> = ({period}) => {
  const {theme} = useTheme();
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('performance');

  const {data: rawAccounts} = useAccountsWithBalances();
  const {data: historyData, isLoading} = useNetWorthHistory({
    period,
    includeAccountBreakdown: true,
  });

  // ✅ Updated logic to use convertedBalance for consistent currency calculations
  const accountPerformances = useMemo((): AccountPerformance[] => {
    if (!rawAccounts || !historyData?.data || historyData.data.length === 0) {
      return [];
    }

    const accounts = Array.isArray(rawAccounts) ? rawAccounts.flat() : [];

    const performances = accounts
      .filter(acc => acc.include_in_net_worth && !acc.is_archived)
      .map(account => {
        const convertedBalanceHistory: number[] = [];

        historyData.data.forEach(dataPoint => {
          const accountSnap = dataPoint.accounts.find(snap => snap.account_id === account.account_id);
          if (accountSnap) {
            convertedBalanceHistory.push(accountSnap.convertedBalance);
          }
        });

        const currentBalance =
          convertedBalanceHistory.length > 0 ? convertedBalanceHistory[convertedBalanceHistory.length - 1] : 0;

        const startBalance = convertedBalanceHistory.length > 0 ? convertedBalanceHistory[0] : currentBalance;

        const change = currentBalance - startBalance;
        const changePercent = startBalance !== 0 ? (change / Math.abs(startBalance)) * 100 : 0;

        return {
          id: account.account_id,
          name: account.account_name,
          type: account.account_type,
          category: account.category,
          originalCurrency: account.currency,
          displayCurrency: historyData.currency,
          currentBalance,
          startBalance,
          change,
          changePercent,
        };
      });

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

  // ✅ Enhanced tap handler with haptic feedback
  const handleAccountTap = async (account: AccountPerformance) => {
    // Haptic feedback for better UX
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Navigate to account details
    router.replace(`/accounts/${account.id}`);
  };

  const handleSortChange = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const options: SortOption[] = ['performance', 'alphabetical', 'balance'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const styles = getStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing account performance...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={theme.colors.gradient?.card || [theme.colors.background.card, theme.colors.background.elevated]}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Account Performance</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{period === 'ALL' ? 'All Time' : period}</Text>
              </View>
              <Text style={styles.subtitle}>• Ranked by {getSortLabel(sortBy).toLowerCase()}</Text>
            </View>
          </View>

          {/* Enhanced Sort Button */}
          <TouchableOpacity onPress={handleSortChange} style={styles.sortButton} activeOpacity={0.7}>
            <Ionicons name="swap-vertical" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.sortButtonText}>{getSortLabel(sortBy)}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ✅ Enhanced Account List with Touch Functionality */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {accountPerformances.map((account, index) => {
          const isTopPerformer = index < 3;
          const isPositiveChange = account.change >= 0;

          return (
            <Pressable
              key={account.id}
              style={({pressed}) => [
                styles.accountItem,
                index === accountPerformances.length - 1 && styles.lastAccountItem,
                pressed && {opacity: 0.8}, // ✅ Press feedback
              ]}
              onPress={() => handleAccountTap(account)}
              android_ripple={{
                color: theme.colors.interactive.hover,
                borderless: false,
              }}>
              {/* Enhanced Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  isTopPerformer && styles.topRankBadge,
                  index === 0 && styles.goldRankBadge,
                  index === 1 && styles.silverRankBadge,
                  index === 2 && styles.bronzeRankBadge,
                ]}>
                {index < 3 ? (
                  <Ionicons
                    name={index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon'}
                    size={16}
                    color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                  />
                ) : (
                  <Text style={[styles.rankText, isTopPerformer && styles.topRankText]}>{index + 1}</Text>
                )}
              </View>

              {/* Enhanced Account Icon */}
              <View
                style={[
                  styles.iconContainer,
                  isPositiveChange && styles.positiveIconContainer,
                  !isPositiveChange && styles.negativeIconContainer,
                ]}>
                <Ionicons
                  name={getAccountIcon(account.category)}
                  size={20}
                  color={isPositiveChange ? theme.colors.asset : theme.colors.liability}
                />
              </View>

              {/* Enhanced Account Info */}
              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {account.name}
                </Text>
                <View style={styles.accountDetailsRow}>
                  <Text style={styles.accountDetails}>{account.category}</Text>
                  <View
                    style={[
                      styles.accountTypeBadge,
                      account.type === 'asset' ? styles.assetBadge : styles.liabilityBadge,
                    ]}>
                    <Text
                      style={[
                        styles.accountTypeText,
                        account.type === 'asset' ? styles.assetText : styles.liabilityText,
                      ]}>
                      {account.type === 'asset' ? 'Asset' : 'Liability'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Enhanced Performance Metrics */}
              <View style={styles.performanceContainer}>
                <Text
                  style={[
                    styles.changeAmount,
                    {color: isPositiveChange ? theme.colors.asset : theme.colors.liability},
                  ]}>
                  {formatSmartNumber(account.currentBalance, account.displayCurrency)}
                </Text>

                <View
                  style={[
                    styles.changeContainer,
                    isPositiveChange ? styles.positiveChangeContainer : styles.negativeChangeContainer,
                  ]}>
                  <Ionicons
                    name={isPositiveChange ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={isPositiveChange ? theme.colors.asset : theme.colors.liability}
                    style={styles.changeIcon}
                  />
                  <Text
                    style={[
                      styles.changePercent,
                      {color: isPositiveChange ? theme.colors.asset : theme.colors.liability},
                    ]}>
                    {isPositiveChange ? '+' : ''}
                    {account.changePercent.toFixed(1)}%
                  </Text>
                </View>

                <Text style={styles.changeValue}>
                  {isPositiveChange ? '+' : ''}
                  {formatSmartNumber(account.change, account.displayCurrency)}
                </Text>
              </View>

              {/* ✅ Subtle Tap Indicator */}
              <View style={styles.tapIndicator}>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
              </View>
            </Pressable>
          );
        })}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// ✅ Enhanced Styles with Touch States
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.xl,
      marginTop: theme.spacing.xl,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },

    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    titleSection: {
      flex: 1,
    },

    title: {
      fontSize: theme.fontSizes.title,
      fontWeight: '800',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },

    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    periodBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.xs,
    },

    periodText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      color: theme.colors.text.onPrimary,
    },

    subtitle: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      fontWeight: '500',
    },

    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },

    sortButtonText: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
    },

    listContainer: {
      maxHeight: 400,
    },

    // ✅ Enhanced accountItem with better touch states
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
      // ✅ Add subtle hover effect
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      }),
    },

    lastAccountItem: {
      borderBottomWidth: 0,
    },

    rankBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },

    topRankBadge: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },

    goldRankBadge: {
      backgroundColor: '#FFD70015',
      borderColor: '#FFD700',
    },

    silverRankBadge: {
      backgroundColor: '#C0C0C015',
      borderColor: '#C0C0C0',
    },

    bronzeRankBadge: {
      backgroundColor: '#CD7F3215',
      borderColor: '#CD7F32',
    },

    rankText: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '700',
      color: theme.colors.text.secondary,
    },

    topRankText: {
      color: theme.colors.text.onPrimary,
    },

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    positiveIconContainer: {
      backgroundColor: `${theme.colors.asset}15`,
      borderColor: `${theme.colors.asset}30`,
    },

    negativeIconContainer: {
      backgroundColor: `${theme.colors.liability}15`,
      borderColor: `${theme.colors.liability}30`,
    },

    accountInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },

    accountName: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs / 2,
    },

    accountDetailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    accountDetails: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      marginRight: theme.spacing.sm,
    },

    accountTypeBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },

    assetBadge: {
      backgroundColor: `${theme.colors.asset}20`,
    },

    liabilityBadge: {
      backgroundColor: `${theme.colors.liability}20`,
    },

    accountTypeText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
    },

    assetText: {
      color: theme.colors.asset,
    },

    liabilityText: {
      color: theme.colors.liability,
    },

    performanceContainer: {
      alignItems: 'flex-end',
      minWidth: 100,
      marginRight: theme.spacing.sm,
    },

    changeAmount: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '700',
      marginBottom: theme.spacing.xs / 2,
    },

    changeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs / 2,
    },

    positiveChangeContainer: {
      backgroundColor: `${theme.colors.asset}15`,
    },

    negativeChangeContainer: {
      backgroundColor: `${theme.colors.liability}15`,
    },

    changeIcon: {
      marginRight: theme.spacing.xs / 2,
    },

    changePercent: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '700',
    },

    changeValue: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
      fontWeight: '500',
    },

    // ✅ NEW: Tap indicator
    tapIndicator: {
      marginLeft: theme.spacing.xs,
      opacity: 0.6,
    },

    bottomSpacing: {
      height: theme.spacing.xl,
    },

    loadingContainer: {
      padding: theme.spacing.xxxl,
      alignItems: 'center',
      justifyContent: 'center',
    },

    loadingText: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
  });

export default AccountPerformanceList;
