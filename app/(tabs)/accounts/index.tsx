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
import { useIsFocused } from '@react-navigation/native';
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
import { isAccountOutdated } from '@/src/utils/dateUtils'; // Import the new utility
import SortOptionsSheet, { SortOption } from '../../../components/accounts/SortOptionsSheet';


// Define types for FlashList items
interface FlashListItem {
  type: 'header' | 'account' | 'emptyState';
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

  // Consolidated handler for deleting an account with confirmation
  const handleDeleteAccountWithConfirmation = (account: { id: string; name: string }, onCompletion?: () => void) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This will also delete all balance entries.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccountMutation.mutateAsync(account.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onCompletion?.();
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
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name_a_to_z');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const isFocused = useIsFocused();

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Scroll to top when filter changes
  useEffect(() => {
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [activeFilter]);

  // Automatically close search when navigating away from the screen
  useEffect(() => {
    if (!isFocused && isSearchVisible) {
      handleCloseSearch();
    }
  }, [isFocused, isSearchVisible]);

  const onRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleToggleSection = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSort = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortOption(option);
  };

  const handleShowSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchVisible(true);
  };

  const handleCloseSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSearchVisible(false);
    setSearchQuery('');
  };

  const handleFilterChange = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const handleViewOutdated = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveFilter('Outdated');
  };

  // Group search props for the header to keep the component API clean
  const searchProps = {
    isVisible: isSearchVisible,
    query: searchQuery,
    setQuery: setSearchQuery,
    onOpen: handleShowSearch,
    onClose: handleCloseSearch,
  };

  // Enhanced handleAccountMenu with haptic feedback and better positioning
  const handleAccountMenu = (account: AccountWithBalance, event: any) => { // Updated type
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { pageY } = event.nativeEvent;
    setSelectedAccount(account);
    setMenuPosition({ x: 0, y: pageY });
    setMenuVisible(true);
  };

  const handleQuickEdit = (account: AccountWithBalance) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAccount(account);
    setIsQuickEditVisible(true);
  };

  const handleSaveBalance = async (newBalance: number, newDate: Date, notes: string) => {
    if (!selectedAccount) return;

    // Correctly format the date to 'YYYY-MM-DD' without timezone shifts.
    // Using toISOString() can result in the previous or next day in some timezones.
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0'); // JS months are 0-indexed.
    const day = String(newDate.getDate()).padStart(2, '0');

    await addBalanceMutation.mutateAsync({
      account_id: selectedAccount.account_id,
      amount: newBalance,
      date: `${year}-${month}-${day}`,
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
      onPress: () => {
        if (!selectedAccount) return;
        handleDeleteAccountWithConfirmation(
          { id: selectedAccount.account_id, name: selectedAccount.account_name },
          () => setMenuVisible(false)
        );
      },
    },
  ];

  const outdatedAccounts = useMemo(() => {
    const remindAfterDays = profile?.remind_after_days || 30;
    return accounts.filter(acc => isAccountOutdated(acc.latest_balance_date, remindAfterDays));
  }, [accounts, profile]);

  const hiddenAccounts = useMemo(() => accounts.filter(acc => acc.is_archived), [accounts]);

  const filteredAccounts = useMemo(() => {
    let filtered = [];
    switch (activeFilter) {
      case 'Assets':
        filtered = accounts.filter(acc => acc.account_type === 'asset' && !acc.is_archived);
        break;
      case 'Liabilities':
        filtered = accounts.filter(acc => acc.account_type === 'liability' && !acc.is_archived);
        break;
      case 'Archived':
        filtered = hiddenAccounts;
        break;
      case 'Outdated':
        filtered = outdatedAccounts;
        break;
      case 'All':
      default:
        filtered = accounts.filter(acc => !acc.is_archived);
    }
    if (searchQuery) {
      return filtered.filter(acc => acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [accounts, activeFilter, outdatedAccounts, hiddenAccounts, searchQuery]);

  const sortedAccounts = useMemo(() => {
    const sortable = [...filteredAccounts];
    sortable.sort((a, b) => {
      switch (sortOption) {
        case 'balance_high_to_low':
          return (b.latest_balance ?? 0) - (a.latest_balance ?? 0);
        case 'balance_low_to_high':
          return (a.latest_balance ?? 0) - (b.latest_balance ?? 0);
        case 'name_a_to_z':
          return a.account_name.localeCompare(b.account_name);
        case 'name_z_to_a':
          return b.account_name.localeCompare(a.account_name);
        case 'last_updated':
          return new Date(b.latest_balance_date ?? 0).getTime() - new Date(a.latest_balance_date ?? 0).getTime();
        default:
          return 0;
      }
    });
    return sortable;
  }, [filteredAccounts, sortOption]);

  const assetAccounts = useMemo(() => sortedAccounts.filter(acc => acc.account_type === 'asset'), [sortedAccounts]);
  const liabilityAccounts = useMemo(() => sortedAccounts.filter(acc => acc.account_type === 'liability'), [sortedAccounts]);

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

    //data.push({ type: 'footer', id: 'footer-add-button' }); // Add a footer item for the button

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
            onAdd={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const type = headerData.title === 'Assets' ? 'asset' : 'liability';
              router.push({
                pathname: 'accounts/add-account',
                params: { type },
              });
            }}
          />
        );
      case 'account':
        const account: AccountWithBalance = item.data;
        return (
          <AccountRow 
            account={account} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/accounts/${account.account_id}`);
            }}
            onEdit={() => handleQuickEdit(account)}
            onDelete={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleDeleteAccountWithConfirmation({ id: account.account_id, name: account.account_name });
            }}
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
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AccountsHeader
        onAdd={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('accounts/add-account');
        }}
        onSort={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsSortSheetVisible(true);
        }}
        search={searchProps}
      />
      <FilterChipsRow 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
        outdatedCount={outdatedAccounts.length}
        hiddenCount={hiddenAccounts.length}
      />
      <StatusShelf 
        outdatedCount={outdatedAccounts.length} 
        remindAfterDays={profile?.remind_after_days || 30} 
        onView={handleViewOutdated} 
      />

      <FlashList
        ref={flashListRef}
        data={flashListData}
        renderItem={renderFlashListItem}
        keyExtractor={(item) => item.id}
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

      <SortOptionsSheet
        isVisible={isSortSheetVisible}
        onClose={() => setIsSortSheetVisible(false)}
        onSort={handleSort}
        currentSort={sortOption}
        title="Sort Accounts"
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
    paddingBottom: 90 + theme.spacing.lg, // Padding to ensure content doesn't hide behind the tab bar
  },
  emptyState: { 
    padding: theme.spacing.xxxl, 
    alignItems: 'center', 
    marginTop: theme.spacing.xxxl,
    flex: 1,
    justifyContent: 'center',
  },
  emptyIcon: { 
    marginBottom: theme.spacing.xl,
    opacity: 0.7,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginBottom: theme.spacing.sm 
  },
  emptyText: { 
    fontSize: 15, 
    color: theme.colors.text.secondary, 
    textAlign: 'center', 
    lineHeight: 22 
  },
  addAccountText: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    color: theme.colors.text.inverse, 
    marginLeft: theme.spacing.sm 
  },
});

export default memo(AccountsScreen);