import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserAccounts, deleteAccount, ACCOUNT_CATEGORIES } from '../../src/services/accountService';
import { formatCurrency } from '../../src/services/dashboardService';
import { useSupabase } from '../../hooks/useSupabase';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';
import ActionMenu from '../../components/ui/ActionMenu';


function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const supabase = useSupabase();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load accounts when component mounts or supabase becomes available
  useEffect(() => {
    if (supabase) {
      console.log('Supabase available, loading accounts...');
      loadAccounts();
    } else {
      console.log('Supabase not available yet...');
    }
  }, [supabase]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAccounts = async (showRefreshing = false) => {
    if (!supabase) {
      console.log('No supabase client available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading accounts...');
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const accountsData = await getUserAccounts(supabase);
      console.log('Accounts loaded:', accountsData.length);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadAccounts(true);
  }, [supabase]);

  const handleAccountMenu = (account, event) => {
    const { pageY } = event.nativeEvent;
    setSelectedAccount(account);
    setMenuPosition({ x: 0, y: pageY - 100 });
    setMenuVisible(true);
  };

  const handleEditAccount = () => {
    if (selectedAccount) {
      router.push({
        pathname: '/add-account',
        params: { accountId: selectedAccount.id, mode: 'edit' }
      });
    }
  };

  const handleDeleteAccount = () => {
    if (!selectedAccount) return;

    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${selectedAccount.name}"? This will also delete all balance entries for this account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(supabase, selectedAccount.id);
              // Immediately update state and reload
              setAccounts(prev => prev.filter(acc => acc.id !== selectedAccount.id));
              // Optionally reload to ensure consistency
              setTimeout(() => loadAccounts(), 100);
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  const groupedAccounts = accounts.reduce((groups, account) => {
    if (!groups[account.type]) {
      groups[account.type] = [];
    }
    groups[account.type].push(account);
    return groups;
  }, {});

  const assetAccounts = groupedAccounts.asset || [];
  const liabilityAccounts = groupedAccounts.liability || [];

  const totalAssets = assetAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, account) => sum + account.current_balance, 0);

  const accountMenuActions = [
    {
      title: 'View Details',
      icon: 'eye-outline',
      onPress: () => {
        if (selectedAccount) {
          router.push(`/account/${selectedAccount.id}`);
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
            params: { 
              accountId: selectedAccount.id, 
              mode: 'edit',
              accountData: JSON.stringify({
                name: selectedAccount.name,
                type: selectedAccount.type,
                category: selectedAccount.category,
                currency: selectedAccount.currency,
                institution: selectedAccount.institution,
                include_in_net_worth: selectedAccount.include_in_net_worth
              })
            }
          });
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
      'Student Loan': 'school-outline'
    };
    return iconMap[category] || 'ellipse-outline';
  };

  if (loading || !supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {!supabase ? 'Connecting to database...' : 'Loading accounts...'}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Accounts</Text>
          <Text style={styles.headerSubtitle}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-account')}
        >
          <Ionicons name="add" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Assets Section */}
        {assetAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: colors.asset }]} />
                <Text style={styles.sectionTitle}>Assets</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: colors.asset }]}>
                {formatCurrency(totalAssets, 'EUR')}
              </Text>
            </View>

            {assetAccounts.map((account, index) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountCard, index === 0 && styles.firstCard]}
                onPress={() => router.push(`/account/${account.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: colors.interactive.hover }]}>
                    <Ionicons
                      name={getAccountIcon(account.category)}
                      size={20}
                      color={colors.asset}
                    />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountInstitution}>{account.institution || account.category}</Text>
                      <Text style={styles.accountCurrency}>{account.currency}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.accountBalance}>
                  <Text style={[styles.balanceAmount, { color: colors.asset }]}>
                    {formatCurrency(account.current_balance, account.currency)}
                  </Text>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAccountMenu(account, e);
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Liabilities Section */}
        {liabilityAccounts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.sectionIndicator, { backgroundColor: colors.liability }]} />
                <Text style={styles.sectionTitle}>Liabilities</Text>
              </View>
              <Text style={[styles.sectionTotal, { color: colors.liability }]}>
                -{formatCurrency(totalLiabilities, 'EUR')}
              </Text>
            </View>

            {liabilityAccounts.map((account, index) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountCard, index === 0 && styles.firstCard]}
                onPress={() => router.push(`/account/${account.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.accountInfo}>
                  <View style={[styles.accountIcon, { backgroundColor: colors.interactive.hover }]}>
                    <Ionicons
                      name={getAccountIcon(account.category)}
                      size={20}
                      color={colors.liability}
                    />
                  </View>
                  <View style={styles.accountDetails}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <View style={styles.accountMeta}>
                      <Text style={styles.accountInstitution}>{account.institution || account.category}</Text>
                      <Text style={styles.accountCurrency}>{account.currency}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.accountBalance}>
                  {/* Corrected: Use account.current_balance for individual liability */}
                  <Text style={[styles.balanceAmount, { color: colors.liability }]}>
                    -{formatCurrency(account.current_balance, account.currency)}
                  </Text>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAccountMenu(account, e);
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="wallet-outline" size={48} color={colors.text.tertiary} />
            </View>
            <Text style={styles.emptyTitle}>No accounts yet</Text>
            <Text style={styles.emptyText}>Add your first account to start tracking your net worth</Text>
          </View>
        )}

        {/* Add Account Button */}
        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={() => router.push('/add-account')}
          activeOpacity={0.8}
        >
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
    </Animated.View>
  );
}

// Moved styles definition above the component function
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.sm,
  },
  firstCard: {
    marginTop: spacing.sm,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountInstitution: {
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  accountCurrency: {
    fontSize: 12,
    color: colors.text.tertiary,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  accountBalance: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  moreButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
  emptyState: {
    padding: spacing.xxxl,
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  addAccountButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    margin: spacing.xl,
    marginTop: spacing.xxxl,
    ...shadows.md,
  },
  addAccountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
});

// Wrap AccountsScreen with React.memo to prevent unnecessary re-renders
export default memo(AccountsScreen);