import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- Step 1: Import from our new central sources ---
import { deleteAccount } from '../../src/services/accountService';
import { formatCurrency } from '../../src/services/dashboardService';
import { useFinancialData } from '../../hooks/context/FinancialDataContext';
import { useSupabase } from '../../hooks/useSupabase'; // Still needed for the delete action

// --- Step 2: Import styles and UI components ---
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';
import ActionMenu from '../../components/ui/ActionMenu';

function AccountsScreen() {
  console.log("Inside AccountsScreen")
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // We only need the supabase client for the delete action, which is a reasonable exception.
  const supabase = useSupabase();

  // --- Step 3: Consume all data from the central context ---
  // No more local useState for accounts, loading, or refreshing.
  const {
    accounts,
    loading,
    refreshing,
    dataDirty,
    loadAllFinancialData,
    markDataAsDirty,
    netWorthData,
  } = useFinancialData();

  // Local UI state for the action menu remains, as it's specific to this screen.
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // --- Step 4: Wire up effects to the central context ---
  // Refetch data if it's marked as dirty when the user focuses on the screen.
  useFocusEffect(
    useCallback(() => {
      if (dataDirty) {
        loadAllFinancialData(true);
      }
    }, [dataDirty, loadAllFinancialData])
  );

  // Pull-to-refresh now calls the central data loading function.
  const onRefresh = useCallback(() => {
    loadAllFinancialData(true);
  }, [loadAllFinancialData]);

  // --- Step 5: Simplify Handlers ---
  const handleAccountMenu = (account, event) => {
    const { pageY } = event.nativeEvent;
    setSelectedAccount(account);
    setMenuPosition({ x: 0, y: pageY - 100 });
    setMenuVisible(true);
  };

  // The delete handler is now much simpler and more robust.
  const handleDeleteAccount = () => {
    if (!selectedAccount || !supabase) return;

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${selectedAccount.account_name}"? This will also delete all balance entries for this account.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setMenuVisible(false) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(supabase, selectedAccount.account_id);
              // Instead of manipulating local state, just mark data as dirty.
              // The context will handle refetching when this screen is focused again.
              markDataAsDirty();
              setMenuVisible(false);
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  // --- Step 6: Process data from the context ---
  const groupedAccounts = (accounts || []).reduce((groups, account) => {
    const type = account.account_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  const assetAccounts = groupedAccounts.asset || [];
  const liabilityAccounts = groupedAccounts.liability || [];

  // Use totals and currency directly from the context's netWorthData object.
  const totalAssets = netWorthData?.totalAssets || 0;
  const totalLiabilities = netWorthData?.totalLiabilities || 0;
  const currency = netWorthData?.currency || 'EUR';

  const accountMenuActions = [
    // Actions now use the correct property names from the Edge Function response
    {
      title: 'View Details',
      icon: 'eye-outline',
      onPress: () => {
        if (selectedAccount) {
          router.push(`/account/${selectedAccount.account_id}`);
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
            pathname: '/add-account',
            params: { accountId: selectedAccount.account_id, mode: 'edit' }
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

  const getAccountIcon = (category) => {
    const iconMap = {
      'Cash': 'cash-outline', 'Checking': 'card-outline', 'Savings': 'wallet-outline',
      'Investment': 'trending-up-outline', 'Retirement': 'shield-outline', 'Real Estate': 'home-outline',
      'Vehicle': 'car-outline', 'Credit Card': 'card-outline', 'Personal Loan': 'document-text-outline',
      'Mortgage': 'home-outline', 'Auto Loan': 'car-outline', 'Student Loan': 'school-outline',
      'Other Asset': 'ellipse-outline', 'Other Liability': 'ellipse-outline'
    };
    return iconMap[category] || 'ellipse-outline';
  };

  // --- Step 7: Update Render Logic ---
  // The main loading indicator now uses the central 'loading' state.
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Accounts</Text>
          <Text style={styles.headerSubtitle}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-account')}>
          <Ionicons name="add" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {assetAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: colors.asset }]} />
                <Text style={styles.sectionTitle}>Assets</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: colors.asset }]}>
                {formatCurrency(totalAssets, currency)}
              </Text>
            </View>
            {assetAccounts.map((account) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
                onPress={() => router.push(`/account/${account.account_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: colors.interactive.hover }]}>
                    <Ionicons name={getAccountIcon(account.category)} size={20} color={colors.asset} />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.account_name}</Text>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountInstitution}>{account.institution || account.category}</Text>
                      <Text style={styles.accountCurrency}>{account.currency}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.accountBalance}>
                  <Text style={[styles.balanceAmount, { color: colors.asset }]}>
                    {formatCurrency(account.latest_balance, account.currency)}
                  </Text>
                  <TouchableOpacity style={styles.moreButton} onPress={(e) => { e.stopPropagation(); handleAccountMenu(account, e); }}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {liabilityAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: colors.liability }]} />
                <Text style={styles.sectionTitle}>Liabilities</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: colors.liability }]}>
                -{formatCurrency(totalLiabilities, currency)}
              </Text>
            </View>
            {liabilityAccounts.map((account) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
                onPress={() => router.push(`/account/${account.account_id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: colors.interactive.hover }]}>
                    <Ionicons name={getAccountIcon(account.category)} size={20} color={colors.liability} />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.account_name}</Text>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountInstitution}>{account.institution || account.category}</Text>
                      <Text style={styles.accountCurrency}>{account.currency}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.accountBalance}>
                  <Text style={[styles.balanceAmount, { color: colors.liability }]}>
                    -{formatCurrency(account.latest_balance, account.currency)}
                  </Text>
                  <TouchableOpacity style={styles.moreButton} onPress={(e) => { e.stopPropagation(); handleAccountMenu(account, e); }}>
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {accounts.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Ionicons name="wallet-outline" size={48} color={colors.text.tertiary} /></View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptyText}>Add your first account to start tracking your net worth</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addAccountButton} onPress={() => router.push('/add-account')} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={colors.text.inverse} />
          <Text style={styles.addAccountText}>Add New Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={accountMenuActions}
        anchorPosition={menuPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  centered: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.lg, fontSize: 16, color: colors.text.secondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.primary },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
  headerSubtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 2 },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
  scrollView: { flex: 1 },
  section: { marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  sectionIndicator: { width: 4, height: 16, borderRadius: 2, marginRight: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary },
  sectionTotal: { fontSize: 16, fontWeight: 'bold' },
  accountCard: { backgroundColor: colors.background.card, borderRadius: borderRadius.md, padding: spacing.lg, marginBottom: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border.primary, ...shadows.sm },
  accountInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  accountIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  accountDetails: { flex: 1 },
  accountName: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.xs },
  accountMeta: { flexDirection: 'row', alignItems: 'center' },
  accountInstitution: { fontSize: 13, color: colors.text.secondary, flex: 1 },
  accountCurrency: { fontSize: 12, color: colors.text.tertiary, backgroundColor: colors.background.elevated, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  accountBalance: { alignItems: 'flex-end', flexDirection: 'row', alignItems: 'center' },
  balanceAmount: { fontSize: 15, fontWeight: 'bold', marginRight: spacing.sm },
  moreButton: { padding: spacing.sm, borderRadius: 6 },
  emptyState: { padding: spacing.xxxl, alignItems: 'center', marginTop: spacing.xxxl },
  emptyIcon: { marginBottom: spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  addAccountButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: borderRadius.md, margin: spacing.xl, marginTop: spacing.xxxl, ...shadows.md },
  addAccountText: { fontSize: 15, fontWeight: 'bold', color: colors.text.inverse, marginLeft: spacing.sm },
});

export default memo(AccountsScreen);