import React, { memo, useState } from 'react';
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
import * as Haptics from 'expo-haptics';

import { useDashboardData } from '../../../hooks/useDashboard';
import { useDeleteAccount } from '../../../hooks/useAccounts';
import { formatCurrency } from '../../../utils/utils';
import ActionMenu, { Action } from '../../../components/ui/ActionMenu';
import { DashboardAccount, Theme } from '../../../lib/supabase';
import { useTheme } from '@/src/styles/theme/ThemeContext';


function AccountsScreen() {
  console.log('AccountsScreen rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: dashboardData, isLoading, refetch, isFetching } = useDashboardData();
  const deleteAccountMutation = useDeleteAccount();

  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Extract accounts with latest balances from dashboard data
  const accounts = dashboardData?.accounts || [];

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DashboardAccount | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = () => refetch();

  // Enhanced handleAccountMenu with haptic feedback and better positioning
  const handleAccountMenu = (account: DashboardAccount, event: any) => {
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
  const showLoadingSpinner = (isLoading || (!dashboardData && isFetching)) && !accounts.length;

  if (showLoadingSpinner) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('accounts/add-account');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={theme.colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && isLoading}
            onRefresh={onRefresh} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {assetAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.asset }]} />
                <Text style={styles.sectionTitle}>Assets</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: theme.colors.asset }]}>
                {formatCurrency(totalAssets, currency)}
              </Text>
            </View>
            {assetAccounts.map((account: DashboardAccount) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
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
                      color={theme.colors.asset} 
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
                  <Text style={[styles.balanceAmount, { color: theme.colors.asset }]}>
                    {formatCurrency(account.latest_balance, account.currency)}
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
            ))}
          </View>
        )}

        {liabilityAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.liability }]} />
                <Text style={styles.sectionTitle}>Liabilities</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: theme.colors.liability }]}>
                -{formatCurrency(totalLiabilities, currency)}
              </Text>
            </View>
            {liabilityAccounts.map((account: DashboardAccount) => (
              <TouchableOpacity
                key={account.account_id}
                style={styles.accountCard}
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
                      color={theme.colors.liability} 
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
                  <Text style={[styles.balanceAmount, { color: theme.colors.liability }]}>
                    -{formatCurrency(account.latest_balance, account.currency)}
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
            ))}
          </View>
        )}

        {accounts.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={48} color={theme.colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptyText}>
              Add your first account to start tracking your net worth
            </Text>
          </View>
        )}

        {/* Add New Account Button - Fixed positioning */}
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
  scrollView: { 
    flex: 1 
  },
  // Fixed: Simplified content container style
  scrollContent: {
    paddingBottom: theme.spacing.xxxl + 80, // Extra padding to ensure button is always visible
  },
  section: { 
    marginTop: theme.spacing.xxl, 
    paddingHorizontal: theme.spacing.xl 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: theme.spacing.lg 
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
