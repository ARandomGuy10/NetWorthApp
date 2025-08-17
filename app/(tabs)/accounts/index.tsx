import React, { memo, useState, useMemo, useRef, useEffect } from 'react';
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
import { FlashList, FlashListRef } from '@shopify/flash-list';

import { useAccountsWithBalances } from '../../../hooks/useAccountsWithBalances'; // Updated hook
import { useDeleteAccount, useUpdateAccount } from '../../../hooks/useAccounts';
import { useAddBalance } from '../../../hooks/useBalances';
import { useProfile } from '../../../hooks/useProfile'; // Import useProfile hook
import { useToast } from '../../../hooks/providers/ToastProvider'; // Add this import
import ActionMenu, { Action } from '../../../components/ui/ActionMenu';
import { AccountWithBalance, Theme } from '../../../lib/supabase'; // Updated type
import { useTheme } from '@/src/styles/theme/ThemeContext';
import AccountsHeader from '../../../components/accounts/AccountsHeader'; // Import the new header
import FilterChipsRow, { FilterType } from '../../../components/accounts/FilterChipsRow'; // Import the new filter chips
import StatusShelf from '../../../components/accounts/StatusShelf'; // Import the new status shelf
import AccountSectionHeader from '../../../components/accounts/AccountSectionHeader';
import AccountRow from '../../../components/accounts/AccountRow';
import QuickEditSheet from '../../../components/accounts/QuickEditSheet';


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
  const flashListRef = useRef<FlashListRef<FlashListItem>>(null);

  // Use useAccountsWithBalances hook as per new requirement
  const { data: accountsData, isLoading, refetch, isFetching } = useAccountsWithBalances();
  const { data: profile } = useProfile();
  const deleteAccountMutation = useDeleteAccount();
  const updateAccountMutation = useUpdateAccount();
  const addBalanceMutation = useAddBalance();

  const { showToast } = useToast(); // Get showToast from the hook

  const handleArchiveAccount = async (account: AccountWithBalance) => {
    try {
      await updateAccountMutation.mutateAsync({ id: account.account_id, updates: { is_archived: !account.is_archived } });
      showToast(`Account ${account.is_archived ? 'unarchived' : 'archived'} successfully!`, 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      showToast(`Failed to ${account.is_archived ? 'unarchive' : 'archive'} account.`, 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // New function for swipe-to-delete with confirmation
  const confirmAndDeleteAccount = (accountId: string, accountName: string) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${accountName}"? This will also delete all balance entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true); 
            try {
              await deleteAccountMutation.mutateAsync(accountId); 
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

  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Extract accounts with latest balances from dashboard data
  const accounts = accountsData || [];

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithBalance | null>(null); // Updated type
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQuickEditVisible, setIsQuickEditVisible] = useState(false);

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Scroll to top when filter changes
  useEffect(() => {
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [activeFilter]);

  const onRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleToggleSection = (title: string) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
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

  const handleQuickEdit = (account: AccountWithBalance) => {
    setSelectedAccount(account);
    setIsQuickEditVisible(true);
  };

  const handleSaveBalance = async (newBalance: number, newDate: Date, notes: string) => {
    if (!selectedAccount) return;

    await addBalanceMutation.mutateAsync({
      account_id: selectedAccount.account_id,
      amount: newBalance,
      date: newDate.toISOString().split('T')[0],
      notes: notes,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const outdatedAccounts = useMemo(() => {
    const remindAfterDays = profile?.remind_after_days || 30;
    return accounts.filter(acc => {
      if (!acc.latest_balance_date) return true;
      const daysSinceUpdate = (Date.now() - new Date(acc.latest_balance_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > remindAfterDays;
    });
  }, [accounts, profile]);

  const hiddenAccounts = useMemo(() => accounts.filter(acc => acc.is_archived), [accounts]);

  const filteredAccounts = useMemo(() => {
    switch (activeFilter) {
      case 'Assets':
        return accounts.filter(acc => acc.account_type === 'asset');
      case 'Liabilities':
        return accounts.filter(acc => acc.account_type === 'liability');
      case 'Archived':
        return hiddenAccounts;
      case 'Outdated':
        return outdatedAccounts;
      case 'All':
      default:
        // Return all accounts EXCEPT archived ones
        return accounts.filter(acc => !acc.is_archived);
    }
  }, [accounts, activeFilter, outdatedAccounts, hiddenAccounts]);

  if (showLoadingSpinner) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  // Group accounts by type
  const assetAccounts = filteredAccounts.filter(acc => acc.account_type === 'asset');
  const liabilityAccounts = filteredAccounts.filter(acc => acc.account_type === 'liability');

  // Prepare data for FlashList
  const prepareFlashListData = (): FlashListItem[] => {
    const data: FlashListItem[] = [];

    if (assetAccounts.length > 0) {
      const isCollapsed = collapsedSections['Assets'];
      data.push({
        type: 'header',
        id: 'header-assets',
        data: { title: 'Assets', count: assetAccounts.length, isCollapsed },
      });
      if (!isCollapsed) {
        assetAccounts.forEach(account => {
          data.push({ type: 'account', id: account.account_id, data: account });
        });
      }
    }

    if (liabilityAccounts.length > 0) {
      const isCollapsed = collapsedSections['Liabilities'];
      data.push({
        type: 'header',
        id: 'header-liabilities',
        data: { title: 'Liabilities', count: liabilityAccounts.length, isCollapsed },
      });
      if (!isCollapsed) {
        liabilityAccounts.forEach(account => {
          data.push({ type: 'account', id: account.account_id, data: account });
        });
      }
    }

    if (filteredAccounts.length === 0 && !isLoading) {
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
          <AccountSectionHeader
            title={headerData.title}
            count={headerData.count}
            isCollapsed={headerData.isCollapsed}
            onToggleCollapse={() => handleToggleSection(headerData.title)}
            onAdd={() => console.log('Add from section')}
            onSort={() => console.log('Sort section')}
            onBulkEdit={() => console.log('Bulk edit section')}
          />
        );
      case 'account':
        const account: AccountWithBalance = item.data;
        return (
          <AccountRow 
            account={account} 
            onPress={() => router.push(`/accounts/${account.account_id}`)}
            onEdit={() => handleQuickEdit(account)}
            onDelete={() => confirmAndDeleteAccount(account.account_id, account.account_name)}
            onArchive={() => handleArchiveAccount(account)}
            isIncludedInNetWorth={account.include_in_net_worth ?? false}
            isOutdated={outdatedAccounts.some(outdatedAcc => outdatedAcc.account_id === account.account_id)}
          />
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
      <FilterChipsRow 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        outdatedCount={outdatedAccounts.length}
        hiddenCount={hiddenAccounts.length}
      />
      <StatusShelf 
        outdatedCount={outdatedAccounts.length} 
        remindAfterDays={profile?.remind_after_days || 30} 
        onView={() => setActiveFilter('Outdated')} 
      />

      <FlashList
        ref={flashListRef}
        data={flashListData}
        renderItem={renderFlashListItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={100}
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

      <QuickEditSheet
        isVisible={isQuickEditVisible}
        onClose={() => setIsQuickEditVisible(false)}
        account={selectedAccount}
        onSave={handleSaveBalance}
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
  flashListContent: { // New style for FlashList content container
    paddingBottom: theme.spacing.xxxl + 80, // Extra padding to ensure button is always visible
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
