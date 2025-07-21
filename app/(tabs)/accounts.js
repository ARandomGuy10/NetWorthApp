import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserAccounts, deleteAccount, ACCOUNT_CATEGORIES } from '../../src/services/accountService';
import { formatCurrency } from '../../src/services/dashboardService';

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const accountsData = await getUserAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAccounts();
  }, [loadAccounts]);

  const handleDeleteAccount = (account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"? This will also delete all balance entries for this account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(account.id);
              loadAccounts();
            } catch (error) {
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading accounts...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-account')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Assets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assets</Text>
            <Text style={styles.sectionTotal}>
              {formatCurrency(totalAssets, 'EUR')}
            </Text>
          </View>

          {assetAccounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={styles.accountCard}
              onPress={() => router.push(`/account/${account.id}`)}
            >
              <View style={styles.accountInfo}>
                <View style={styles.accountIcon}>
                  <Ionicons
                    name={getAccountIcon(account.category)}
                    size={24}
                    color="#4ECDC4"
                  />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountInstitution}>{account.institution}</Text>
                </View>
              </View>
              <View style={styles.accountBalance}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(account.current_balance, account.currency)}
                </Text>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => handleDeleteAccount(account)}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {assetAccounts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No asset accounts yet</Text>
            </View>
          )}
        </View>

        {/* Liabilities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liabilities</Text>
            <Text style={[styles.sectionTotal, styles.liabilityTotal]}>
              -{formatCurrency(totalLiabilities, 'EUR')}
            </Text>
          </View>

          {liabilityAccounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={styles.accountCard}
              onPress={() => router.push(`/account/${account.id}`)}
            >
              <View style={styles.accountInfo}>
                <View style={styles.accountIcon}>
                  <Ionicons
                    name={getAccountIcon(account.category)}
                    size={24}
                    color="#FF6B6B"
                  />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountInstitution}>{account.institution}</Text>
                </View>
              </View>
              <View style={styles.accountBalance}>
                <Text style={[styles.balanceAmount, styles.liabilityAmount]}>
                  -{formatCurrency(account.current_balance, account.currency)}
                </Text>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => handleDeleteAccount(account)}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {liabilityAccounts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No liability accounts yet</Text>
            </View>
          )}
        </View>

        {/* Add Account Button */}
        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={() => router.push('/add-account')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addAccountText}>Add New Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  liabilityTotal: {
    color: '#FF6B6B',
  },
  accountCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  accountInstitution: {
    fontSize: 14,
    color: '#8E8E93',
  },
  accountBalance: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginRight: 8,
  },
  liabilityAmount: {
    color: '#FF6B6B',
  },
  moreButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  addAccountButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    marginTop: 32,
  },
  addAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});