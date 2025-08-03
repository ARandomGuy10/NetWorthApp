import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDashboardData } from '../../../hooks/useDashboard';
import { useDeleteAccount } from '../../../hooks/useAccounts';
import { formatCurrency } from '../../../utils/utils';
import { colors, spacing, borderRadius, shadows } from '../../../src/styles/colors';
import ActionMenu, { Action } from '../../../components/ui/ActionMenu';
import { DashboardAccount } from '../../../lib/supabase';

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: dashboardData, isLoading, refetch, isFetching } = useDashboardData();
  const deleteAccountMutation = useDeleteAccount();

  // Extract accounts with latest balances from dashboard data
  const accounts = dashboardData?.accounts || [];

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DashboardAccount | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const onRefresh = () => refetch();

  const handleAccountMenu = (account: DashboardAccount, event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setSelectedAccount(account);
    setMenuPosition({ x: pageX, y: pageY });
    setMenuVisible(true);
  };

  const handleDeleteAccount = () => {
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
            await deleteAccountMutation.mutateAsync(selectedAccount.account_id);
            setMenuVisible(false);
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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  const groupedAccounts = accounts.reduce((groups: { [key: string]: DashboardAccount[] }, account: DashboardAccount) => {
    const type = account.account_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(account);
    return groups;
  }, {});

  const assetAccounts = groupedAccounts.asset || [];
  const liabilityAccounts = groupedAccounts.liability || [];

  // Calculate totals from the accounts
  const totalAssets = dashboardData?.totalAssets || 0;
  const totalLiabilities = dashboardData?.totalLiabilities || 0;
  const currency = dashboardData?.currency || 'EUR';

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Accounts</Text>
          <Text style={styles.headerSubtitle}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('accounts/add-account')}>
          <Ionicons name="add" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
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
            {assetAccounts.map((account: DashboardAccount) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
                onPress={() => router.push(`/accounts/${account.account_id}`)}
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
            {liabilityAccounts.map((account: DashboardAccount) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
                onPress={() => router.push(`/accounts/${account.account_id}`)}
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

        {accounts.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={48} color={colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptyText}>Add your first account to start tracking your net worth</Text>
          </View>
        )}

        <TouchableOpacity style={styles.addAccountButton} onPress={() => router.push('accounts/add-account')} activeOpacity={0.8}>
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
  accountBalance: { alignItems: 'flex-end', flexDirection: 'row'},
  balanceAmount: { fontSize: 15, fontWeight: 'bold', marginRight: spacing.sm },
  moreButton: { padding: spacing.sm, borderRadius: 6 },
  emptyState: { padding: spacing.xxxl, alignItems: 'center', marginTop: spacing.xxxl },
  emptyIcon: { marginBottom: spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
  addAccountButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: borderRadius.md, margin: spacing.xl, marginTop: spacing.xxxl, ...shadows.md },
  addAccountText: { fontSize: 15, fontWeight: 'bold', color: colors.text.inverse, marginLeft: spacing.sm },
});
