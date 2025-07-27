import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatCurrency } from '../../src/services/dashboardService';
import { colors, spacing, borderRadius } from '../../src/styles/colors';

const AccountsList = ({ netWorthData }) => {
  const router = useRouter();

  const getAccountIcon = (category) => {
    const iconMap = {
      'Cash': 'card',
      'Checking': 'card',
      'Savings': 'wallet',
      'Investment': 'trending-up',
      'Retirement': 'shield',
      'Real Estate': 'home',
      'Vehicle': 'car',
      'Credit Card': 'card',
      'Personal Loan': 'document-text',
      'Mortgage': 'home',
      'Auto Loan': 'car',
      'Student Loan': 'school',
      'Brokerage': 'stats-chart',
    };
    return iconMap[category] || 'ellipse';
  };

  const getAccountIconColor = (type) => {
    return type === 'asset' ? colors.asset : colors.liability;
  };

  const allAccounts = [
    ...(netWorthData?.assetAccounts || []),
    ...(netWorthData?.liabilityAccounts || []),
  ];

  if (!allAccounts.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accounts</Text>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No accounts yet</Text>
          <Text style={styles.emptyText}>Add your first account to get started</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accounts</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.accountsContainer}>
          {allAccounts.map((account, index) => (
            <TouchableOpacity
              key={account.id}
              style={styles.accountCard}
              onPress={() => router.push(`/account/${account.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.accountHeader}>
                <View style={[
                  styles.accountIcon,
                  { backgroundColor: `${getAccountIconColor(account.type)}20` }
                ]}>
                  <Ionicons
                    name={getAccountIcon(account.category)}
                    size={24}
                    color={getAccountIconColor(account.type)}
                  />
                </View>
              </View>
              
              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {account.name}
                </Text>
                <Text style={styles.accountBalance}>
                  {formatCurrency(account.current_balance || 0, account.currency)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  accountsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  accountCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: 140,
    minHeight: 120,
  },
  accountHeader: {
    marginBottom: spacing.md,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default AccountsList;