import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from '../../hooks/useSupabase';
import { getAccountById, getAccountBalances, deleteBalanceEntry } from '../../src/services/accountService';
import { formatCurrency } from '../../src/services/dashboardService';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';
import ActionMenu from '../../components/ui/ActionMenu';

export default function AccountDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const supabase = useSupabase();
  
  const [account, setAccount] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAccountData = useCallback(async () => {
    if (!supabase || !id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [accountData, balanceData] = await Promise.all([
        getAccountById(supabase, id),
        getAccountBalances(supabase, id)
      ]);

      setAccount(accountData);
      setBalances(balanceData);
    } catch (error) {
      console.error('Error loading account data:', error);
      Alert.alert('Error', 'Failed to load account data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, id]);

  useEffect(() => {
    if (supabase && id) {
      setLoading(true);
      loadAccountData();
    }
  }, [supabase, id, loadAccountData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAccountData();
  }, [loadAccountData]);

  const handleBalanceMenu = (balance, event) => {
    const { pageY } = event.nativeEvent;
    setSelectedBalance(balance);
    setMenuPosition({ x: 0, y: pageY - 100 });
    setMenuVisible(true);
  };

  const handleEditBalance = () => {
    if (selectedBalance) {
      router.push({
        pathname: '/add-balance',
        params: { 
          accountId: id,
          balanceId: selectedBalance.id,
          mode: 'edit'
        }
      });
    }
  };

  const handleDeleteBalance = () => {
    if (!selectedBalance) return;

    Alert.alert(
      'Delete Balance Entry',
      `Are you sure you want to delete this balance entry from ${formatDate(selectedBalance.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBalanceEntry(supabase, selectedBalance.id);
              loadAccountData();
            } catch (error) {
              console.error('Error deleting balance:', error);
              Alert.alert('Error', 'Failed to delete balance entry');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  const currentBalance = balances.length > 0 ? balances[0].amount : 0;

  if (loading || !supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Account not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const balanceMenuActions = [
    {
      title: 'Edit Entry',
      icon: 'create-outline',
      onPress: handleEditBalance,
    },
    {
      title: 'Delete Entry',
      icon: 'trash-outline',
      destructive: true,
      onPress: handleDeleteBalance,
    },
  ];

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {account.name}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push({
            pathname: '/add-account',
            params: { accountId: id, mode: 'edit' }
          })}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Account Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.accountHeader}>
            <View style={[styles.accountIcon, { backgroundColor: colors.interactive.hover }]}>
              <Ionicons
                name={getAccountIcon(account.category)}
                size={24}
                color={account.type === 'asset' ? colors.asset : colors.liability}
              />
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountMeta}>
                {account.type === 'asset' ? 'Asset' : 'Liability'} • {account.category}
              </Text>
              {account.institution && (
                <Text style={styles.institution}>{account.institution}</Text>
              )}
            </View>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[
              styles.currentBalance,
              { color: account.type === 'asset' ? colors.asset : colors.liability }
            ]}>
              {account.type === 'liability' ? '-' : ''}
              {formatCurrency(currentBalance, account.currency)}
            </Text>
          </View>
        </View>

        {/* Add Balance Button */}
        <TouchableOpacity
          style={styles.addBalanceButton}
          onPress={() => router.push({
            pathname: '/add-balance',
            params: { accountId: id }
          })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.text.inverse} />
          <Text style={styles.addBalanceText}>Record New Balance</Text>
        </TouchableOpacity>

        {/* Balance History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balance History</Text>
          
          {balances.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No balance entries yet</Text>
              <Text style={styles.emptyText}>
                Record your first balance to start tracking this account
              </Text>
            </View>
          ) : (
            balances.map((balance, index) => (
              <View key={balance.id} style={styles.balanceEntry}>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceDate}>
                    {formatDate(balance.date)}
                  </Text>
                  {balance.notes && (
                    <Text style={styles.balanceNotes}>{balance.notes}</Text>
                  )}
                </View>
                <View style={styles.balanceRight}>
                  <Text style={styles.balanceAmount}>
                    {formatCurrency(balance.amount, account.currency)}
                  </Text>
                  <TouchableOpacity
                    style={styles.balanceMenuButton}
                    onPress={(event) => handleBalanceMenu(balance, event)}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={balanceMenuActions}
        anchorPosition={menuPosition}
      />
    </Animated.View>
  );
}

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
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
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
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.background.card,
    margin: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountMeta: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  institution: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  balanceSection: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  currentBalance: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addBalanceButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  addBalanceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  balanceEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  balanceNotes: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  balanceMenuButton: {
    padding: spacing.sm,
    borderRadius: 6,
  },
});