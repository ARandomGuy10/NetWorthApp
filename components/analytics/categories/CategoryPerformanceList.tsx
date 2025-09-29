// components/analytics/categories/CategoryPerformanceList.tsx

import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp, FadeInDown} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {useHaptics} from '@/hooks/useHaptics';
import {useAccountsWithBalances} from '@/hooks/useAccountsWithBalances';
import * as Haptics from 'expo-haptics';

interface CategoryPerformanceData {
  category: string;
  assets: number;
  liabilities: number;
  total: number;
}

interface CategoryPerformanceListProps {
  data: CategoryPerformanceData[];
  currency: string;
}

type SortOption = 'value' | 'name' | 'type';

interface ProcessedCategoryData {
  category: string;
  amount: number;
  type: 'asset' | 'liability';
  percentage: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accountCount: number; // ✅ NEW: Add account count
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
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
    Business: 'briefcase-outline',
    Crypto: 'logo-bitcoin',
    'Other Asset': 'ellipse-outline',
    'Other Liability': 'ellipse',
  };
  return iconMap[category] || 'ellipse-outline';
};

const getSortLabel = (sortBy: SortOption): string => {
  switch (sortBy) {
    case 'value':
      return 'Value';
    case 'name':
      return 'A-Z';
    case 'type':
      return 'Type';
    default:
      return 'Value';
  }
};

const CategoryPerformanceList: React.FC<CategoryPerformanceListProps> = ({data, currency}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const {data: accountsData} = useAccountsWithBalances();
  const router = useRouter();
  const styles = getStyles(theme);

  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // ✅ HELPER: Get account count for a category and type
  const getCategoryAccountCount = (category: string, type: 'asset' | 'liability'): number => {
    if (!accountsData) return 0;
    const accounts = Array.isArray(accountsData) ? accountsData.flat() : [];
    return accounts.filter(
      acc => acc.category === category && acc.account_type === type && acc.include_in_net_worth && !acc.is_archived
    ).length;
  };

  // Process and sort categories
  const processedCategories = useMemo((): ProcessedCategoryData[] => {
    const categories: ProcessedCategoryData[] = [];

    // Calculate total for correct percentage
    const totalValue = data.reduce((sum, cat) => sum + Math.abs(cat.assets) + Math.abs(cat.liabilities), 0);

    // Process assets
    data.forEach(cat => {
      if (cat.assets > 0) {
        categories.push({
          category: cat.category,
          amount: cat.assets,
          type: 'asset',
          percentage: totalValue > 0 ? (cat.assets / totalValue) * 100 : 0,
          icon: getCategoryIcon(cat.category),
          color: theme.colors.asset,
          accountCount: getCategoryAccountCount(cat.category, 'asset'), // ✅ NEW: Add account count
        });
      }
    });

    // Process liabilities
    data.forEach(cat => {
      if (cat.liabilities > 0) {
        categories.push({
          category: cat.category,
          amount: cat.liabilities,
          type: 'liability',
          percentage: totalValue > 0 ? (cat.liabilities / totalValue) * 100 : 0,
          icon: getCategoryIcon(cat.category),
          color: theme.colors.liability,
          accountCount: getCategoryAccountCount(cat.category, 'liability'), // ✅ NEW: Add account count
        });
      }
    });

    // Sorting logic
    return categories.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.amount - a.amount;
        case 'name':
          return a.category.localeCompare(b.category);
        case 'type':
          if (a.type !== b.type) {
            return a.type === 'asset' ? -1 : 1;
          }
          return b.amount - a.amount;
        default:
          return b.amount - a.amount;
      }
    });
  }, [data, theme.colors.asset, theme.colors.liability, sortBy, accountsData]);

  // Get accounts for expanded category
  const getCategoryAccounts = (category: string, type: 'asset' | 'liability') => {
    if (!accountsData) return [];
    const accounts = Array.isArray(accountsData) ? accountsData.flat() : [];
    return accounts
      .filter(
        acc => acc.category === category && acc.account_type === type && acc.include_in_net_worth && !acc.is_archived
      )
      .sort((a, b) => (b.latest_balance || 0) - (a.latest_balance || 0));
  };

  const handleSortChange = async () => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const options: SortOption[] = ['value', 'name', 'type'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const handleCategoryPress = async (category: string) => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Handle account press - navigate to account details
  const handleAccountPress = async (accountId: string) => {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/accounts/[id]',
      params: {id: accountId},
    });
  };

  if (processedCategories.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="analytics-outline" size={48} color={theme.colors.text.tertiary} />
        <Text style={styles.emptyText}>No categories to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Header matching AccountPerformanceList style */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors?.primary + '20' || '#4facfe20', 'transparent']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="stats-chart" size={28} color={theme.colors?.primary || '#4facfe'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Category Performance</Text>
              <Text style={styles.headerSubtitle}>{processedCategories.length} categories</Text>
            </View>
            <TouchableOpacity style={styles.sortButton} onPress={handleSortChange}>
              <Ionicons name="filter-outline" size={16} color={theme.colors?.text?.secondary || '#b8c6db'} />
              <Text style={styles.sortButtonText}>{getSortLabel(sortBy)}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Category List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {processedCategories.map((category, index) => (
          <Animated.View key={`${category.category}-${category.type}`} entering={FadeInUp.delay(index * 50)}>
            {/* Main Category Item */}
            <Pressable
              style={({pressed}) => [
                styles.categoryItem,
                expandedCategory === `${category.category}-${category.type}` && styles.expandedItem,
                index === processedCategories.length - 1 && styles.lastAccountItem,
                pressed && {opacity: 0.8}, // Press feedback
              ]}
              onPress={() => handleCategoryPress(`${category.category}-${category.type}`)}
              android_ripple={{
                color: theme.colors.interactive.hover,
                borderless: false,
              }}>
              {/* Category Icon */}
              <LinearGradient
                colors={[`${category.color}20`, `${category.color}10`]}
                style={[
                  styles.iconContainer,
                  category.type === 'asset' ? styles.positiveIconContainer : styles.negativeIconContainer,
                ]}>
                <Ionicons name={category.icon} size={20} color={category.color} />
              </LinearGradient>

              {/* Category Info */}
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <View style={styles.accountDetailsRow}>
                  {/* ✅ FIXED: Show account count instead of duplicate category name */}
                  <Text style={styles.accountDetails}>
                    {category.accountCount} {category.accountCount === 1 ? 'account' : 'accounts'}
                  </Text>
                  <View
                    style={[
                      styles.accountTypeBadge,
                      category.type === 'asset' ? styles.assetBadge : styles.liabilityBadge,
                    ]}>
                    <Text
                      style={[
                        styles.accountTypeText,
                        category.type === 'asset' ? styles.assetText : styles.liabilityText,
                      ]}>
                      {category.type === 'asset' ? 'Asset' : 'Liability'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Performance Container */}
              <View style={styles.performanceContainer}>
                <Text style={[styles.changeAmount, {color: category.color}]}>
                  {formatSmartNumber(category.amount, currency)}
                </Text>
                <Text style={styles.changeValue}>{category.percentage.toFixed(1)}% of total</Text>
              </View>

              {/* Expand Indicator */}
              <Ionicons
                name={expandedCategory === `${category.category}-${category.type}` ? 'chevron-up' : 'chevron-forward'}
                size={18}
                color={theme.colors.text.tertiary}
                style={styles.tapIndicator}
              />
            </Pressable>

            {/* Expanded Accounts Section */}
            {expandedCategory === `${category.category}-${category.type}` && (
              <Animated.View style={styles.expandedSection} entering={FadeInDown.duration(300)}>
                {getCategoryAccounts(category.category, category.type).map(account => (
                  <TouchableOpacity
                    key={account.account_id}
                    style={styles.accountItem}
                    onPress={() => handleAccountPress(account.account_id)}
                    activeOpacity={0.7}>
                    <View style={styles.accountIcon}>
                      <Ionicons
                        name={getCategoryIcon(account.category)}
                        size={16}
                        color={theme.colors.text.secondary}
                      />
                    </View>
                    <View style={styles.accountInfoExpanded}>
                      <Text style={styles.accountNameExpanded}>{account.account_name}</Text>
                      <Text style={styles.accountInstitution}>{account.institution || 'Personal Account'}</Text>
                    </View>
                    <Text style={[styles.accountBalance, {color: category.color}]}>
                      {formatSmartNumber(account.latest_balance || 0, account.currency)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.text.tertiary} />
                  </TouchableOpacity>
                ))}

                {getCategoryAccounts(category.category, category.type).length === 0 && (
                  <Text style={styles.noAccountsText}>No accounts in this category</Text>
                )}
              </Animated.View>
            )}
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </View>
  );
};

// ✅ Styles remain exactly the same
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors?.surface?.primary || '#1a1a2e',
      borderRadius: theme.borderRadius?.xl || 20,
      overflow: 'hidden',
      shadowColor: theme.colors?.shadow || '#000000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: theme.spacing?.xl || 20,
    },
    // ✅ UPDATED: Header styles matching CurrencyRiskAnalysis
    header: {
      marginBottom: theme.spacing?.lg || 16,
    },
    headerGradient: {
      padding: theme.spacing?.lg || 16,
      borderTopLeftRadius: theme.borderRadius?.xl || 20,
      borderTopRightRadius: theme.borderRadius?.xl || 20,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      marginRight: theme.spacing?.md || 12,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors?.primary + '20' || '#4facfe20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.fontSizes?.subtitle || 18,
      fontWeight: '800',
      color: theme.colors?.text?.primary || '#ffffff',
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
      fontWeight: '500',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors?.interactive?.hover || 'rgba(255,255,255,0.1)',
      paddingHorizontal: theme.spacing?.md || 12,
      paddingVertical: theme.spacing?.sm || 8,
      borderRadius: theme.borderRadius?.md || 12,
      borderWidth: 0.5,
      borderColor: theme.colors?.border?.primary || 'rgba(255,255,255,0.1)',
    },
    sortButtonText: {
      fontSize: theme.fontSizes?.caption || 12,
      fontWeight: '600',
      color: theme.colors?.text?.secondary || '#b8c6db',
      marginLeft: theme.spacing?.xs || 4,
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
    subtitle: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      fontWeight: '500',
    },
    listContainer: {
      maxHeight: 500,
    },
    listContent: {
      paddingVertical: theme.spacing.sm,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      }),
    },
    expandedItem: {
      backgroundColor: theme.colors.background.secondary,
    },
    lastAccountItem: {
      borderBottomWidth: 0,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
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
    categoryInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    categoryName: {
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
    changeValue: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
      fontWeight: '500',
    },
    tapIndicator: {
      marginLeft: theme.spacing.xs,
      opacity: 0.6,
    },
    // Expanded section styles
    expandedSection: {
      backgroundColor: theme.colors.background.tertiary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    accountItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.secondary,
    },
    accountIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    accountInfoExpanded: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    accountNameExpanded: {
      fontSize: theme.fontSizes.body,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    accountInstitution: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
      marginTop: 2,
    },
    accountBalance: {
      fontSize: theme.fontSizes.body,
      fontWeight: '700',
    },
    noAccountsText: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingVertical: theme.spacing.md,
    },
    bottomSpacing: {
      height: theme.spacing.xl,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxxl,
    },
    emptyText: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.tertiary,
      marginTop: theme.spacing.md,
      fontWeight: '500',
    },
  });

export default CategoryPerformanceList;
