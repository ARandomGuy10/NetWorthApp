import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FlashList } from '@shopify/flash-list';

import { useAccountsWithBalances } from '../../../hooks/useAccountsWithBalances'; // Updated hook
import { useDeleteAccount } from '../../../hooks/useAccounts';
import { formatCurrency } from '../../../utils/utils';
import ActionMenu, { Action } from '../../../components/ui/ActionMenu';
import { AccountWithBalance, Theme } from '../../../lib/supabase'; // Updated type
import { useTheme } from '@/src/styles/theme/ThemeContext';


import AccountsHeader from '../../../components/accounts/AccountsHeader'; // Import the new header

// Define types for FlashList items
interface FlashListItem {
  type: 'header' | 'account' | 'emptyState' | 'footer';
  id: string; // Unique ID for FlashList keyExtractor
  data?: any; // Either section data, account data, or null for empty/footer
}

function AccountsScreen() {
  console.log('AccountsScreen rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Use useAccountsWithBalances hook as per new requirement
  const { data: accountsData, isLoading, refetch, isFetching } = useAccountsWithBalances();
  const deleteAccountMutation = useDeleteAccount();

  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Extract accounts with latest balances from dashboard data
  const accounts = accountsData || [];

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithBalance | null>(null); // Updated type
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Enhanced handleAccountMenu with haptic feedback and better positioning
  const handleAccountMenu = (account: AccountWithBalance, event: any) => { // Updated type
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { pageY } = event.nativeEvent;
    setSelectedAccount(account);
    setMenuPosition({ x: 0, y: pageY });
    setMenuVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${selectedAccount.account_name}"? This will also delete all balance entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccountMutation.mutateAsync(selectedAccount.account_id);
              setMenuVisible(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const accountMenuActions: Action[] = [
    {
      title: 'View Details',
      icon: 'eye-outline',
      onPress: () => {
        if (selectedAccount) {
          router.push(`/accounts/${selectedAccount.account_id}`);
          setMenuVisible(false);
        }
      },
    },
    {
      title: 'Edit Account',
      icon: 'create-outline',
      onPress: () => {
        if (selectedAccount) {
          router.push({
            pathname: 'accounts/add-account',
            params: {
              accountId: selectedAccount.account_id,
              mode: 'edit',
              accountData: JSON.stringify(selectedAccount)
            },
          });
          setMenuVisible(false);
        }
      },
    },
    {
      title: 'Delete Account',
      icon: 'trash-outline',
      destructive: true,
      onPress: handleDeleteAccount,
    },
  ];

   // Fixed: Better loading logic that accounts for cached data
  const showLoadingSpinner = (isLoading || (!accountsData && isFetching)) && !accounts.length;

  if (showLoadingSpinner) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  // Group accounts by type
  const assetAccounts = accounts.filter(acc => acc.account_type === 'asset');
  const liabilityAccounts = accounts.filter(acc => acc.account_type === 'liability');

  const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Cash': 'cash-outline',
      'Checking': 'card-outline',
      'Savings': 'wallet-outline',
      'Investment': 'trending-up-outline',
      'Retirement': 'shield-outline',
      'Real Estate': 'home-outline',
      'Vehicle': 'car-outline',
      'Credit Card': 'card-outline',
      'Personal Loan': 'document-text-outline',
      'Mortgage': 'home-outline',
      'Auto Loan': 'car-outline',
      'Student Loan': 'school-outline',
      'Other Asset': 'ellipse-outline',
      'Other Liability': 'ellipse-outline'
    };
    return iconMap[category] || 'ellipse-outline';
  };

  // Prepare data for FlashList
  const prepareFlashListData = (): FlashListItem[] => {
    const data: FlashListItem[] = [];

    if (assetAccounts.length > 0) {
      data.push({
        type: 'header',
        id: 'header-assets',
        data: { title: 'Assets', type: 'asset' },
      });
      assetAccounts.forEach(account => {
        data.push({ type: 'account', id: account.account_id, data: account });
      });
    }

    if (liabilityAccounts.length > 0) {
      data.push({
        type: 'header',
        id: 'header-liabilities',
        data: { title: 'Liabilities', type: 'liability' },
      });
      liabilityAccounts.forEach(account => {
        data.push({ type: 'account', id: account.account_id, data: account });
      });
    }

    if (accounts.length === 0 && !isLoading) {
      data.push({ type: 'emptyState', id: 'empty-state' });
    }

    data.push({ type: 'footer', id: 'footer-add-button' }); // Add a footer item for the button

    return data;
  };

  const flashListData = prepareFlashListData();

  // Render function for FlashList items
  const renderFlashListItem = ({ item }: { item: FlashListItem }) => {
    switch (item.type) {
      case 'header':
        const headerData = item.data;
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: headerData.type === 'asset' ? theme.colors.asset : theme.colors.liability }]} />
                <Text style={styles.sectionTitle}>{headerData.title}</Text>
              </View>
              {/* Removed total display as per user instruction */}
            </View>
          </View>
        );
      case 'account':
        const account: AccountWithBalance = item.data;
        return (
          <TouchableOpacity
            key={account.account_id}
            style={[styles.accountCard, { marginHorizontal: theme.spacing.xl }]} // Apply horizontal margin here
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/accounts/${account.account_id}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: theme.colors.interactive.hover }]}>
                <Ionicons 
                  name={getAccountIcon(account.category)} 
                  size={20} 
                  color={account.account_type === 'asset' ? theme.colors.asset : theme.colors.liability} 
                />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{account.account_name}</Text>
                <View style={styles.accountMeta}>
                  <Text style={styles.accountInstitution}>
                    {account.institution || account.category}
                  </Text>
                  <Text style={styles.accountCurrency}>{account.currency}</Text>
                </View>
              </View>
            </View>
            <View style={styles.accountBalance}>
              <Text style={[styles.balanceAmount, { color: account.account_type === 'asset' ? theme.colors.asset : theme.colors.liability }]}>
                {account.account_type === 'liability' ? '-' : ''}{formatCurrency(account.latest_balance, account.currency)}
              </Text>
              <TouchableOpacity 
                style={styles.moreButton} 
                onPress={(e) => {
                  e.stopPropagation(); 
                  handleAccountMenu(account, e); 
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={18} 
                  color={theme.colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      case 'emptyState':
        return (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={48} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptyText}>
              Add your first account to start tracking your net worth
            </Text>
          </View>
        );
      case 'footer':
        return (
          <TouchableOpacity 
            style={[
              styles.addAccountButton,
              isDeleting && styles.addAccountButtonDisabled
            ]} 
            onPress={() => {
              if (!isDeleting) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('accounts/add-account');
              }
            }} 
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.colors.text.inverse} />
            ) : (
              <Ionicons name="add" size={20} color={theme.colors.text.inverse} />
            )}
            <Text style={styles.addAccountText}>
              {isDeleting ? 'Processing...' : 'Add New Account'}
            </Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AccountsHeader
        onAdd={() => router.push('accounts/add-account')}
        onFilter={() => console.log('Filter pressed')}
        onMore={() => console.log('More pressed')}
      />

      <FlashList
        data={flashListData}
        renderItem={renderFlashListItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={100} // Adjust as needed for better performance
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={onRefresh} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.flashListContent}
        keyboardShouldPersistTaps="handled"
      />

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={accountMenuActions}
        anchorPosition={menuPosition}
      />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background.primary 
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: theme.spacing.lg, 
    fontSize: 16, 
    color: theme.colors.text.secondary 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: theme.spacing.xl, 
    paddingVertical: theme.spacing.lg, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border.primary 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: theme.colors.text.primary 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: theme.colors.text.secondary, 
    marginTop: 2 
  },
  addButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...theme.shadows.sm 
  },
  flashListContent: { // New style for FlashList content container
    paddingBottom: theme.spacing.xxxl + 80, // Extra padding to ensure button is always visible
  },
  section: { 
    marginTop: theme.spacing.xxl, 
    // paddingHorizontal removed from here, applied to accountCard directly
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl, // Apply horizontal padding here
  },
  sectionTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  sectionIndicator: { 
    width: 4, 
    height: 16, 
    borderRadius: 2, 
    marginRight: theme.spacing.sm 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: theme.colors.text.primary 
  },
  sectionTotal: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  accountCard: { 
    backgroundColor: theme.colors.background.card, 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.lg, 
    marginBottom: theme.spacing.sm, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: theme.colors.border.primary, 
    ...theme.shadows.sm 
  },
  accountInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  accountIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: theme.spacing.md 
  },
  accountDetails: { 
    flex: 1 
  },
  accountName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginBottom: theme.spacing.xs 
  },
  accountMeta: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  accountInstitution: { 
    fontSize: 13, 
    color: theme.colors.text.secondary, 
    flex: 1 
  },
  accountCurrency: { 
    fontSize: 12, 
    color: theme.colors.text.tertiary, 
    backgroundColor: theme.colors.background.elevated, 
    paddingHorizontal: theme.spacing.sm, 
    paddingVertical: 2, 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  accountBalance: { 
    alignItems: 'flex-end', 
    flexDirection: 'row'
  },
  balanceAmount: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginRight: theme.spacing.sm 
  },
  moreButton: { 
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  emptyState: { 
    padding: theme.spacing.xxxl, 
    alignItems: 'center', 
    marginTop: theme.spacing.xxxl 
  },
  emptyIcon: { 
    marginBottom: theme.spacing.lg 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginBottom: theme.spacing.sm 
  },
  emptyText: { 
    fontSize: 14, 
    color: theme.colors.text.secondary, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  // Fixed: Simplified add account button styling
  addAccountButton: { 
    backgroundColor: theme.colors.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: theme.spacing.lg, 
    borderRadius: theme.borderRadius.md, 
    margin: theme.spacing.xl, 
    marginTop: theme.spacing.xxxl, 
    marginBottom: theme.spacing.xxxl, // Extra bottom margin
    ...theme.shadows.md 
  },
  addAccountButtonDisabled: {
    opacity: 0.6,
  },
  addAccountText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: theme.colors.text.inverse, 
    marginLeft: theme.spacing.sm 
  },
});

export default memo(AccountsScreen);