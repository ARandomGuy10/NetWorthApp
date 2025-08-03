// components/home/AccountsList.tsx
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
import { formatCurrency } from '@/utils/utils';
import { colors, spacing, borderRadius } from '../../src/styles/colors';

// TypeScript interfaces
interface Account {
  account_id: string;
  account_name: string;
  account_type: 'asset' | 'liability';
  category: string;
  institution: string | null;
  currency: string;
  latest_balance: number | null;
  latest_balance_date: string | null;
}

interface AccountsListProps {
  accounts?: Account[];
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts }) => {
  const router = useRouter();

  const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
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

  const getAccountIconColor = (type: 'asset' | 'liability'): string => {
    return type === 'asset' ? colors.asset : colors.liability;
  };

  // No need to combine arrays anymore. We use the 'accounts' prop directly.
  if (!accounts || accounts.length === 0) {
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
          {/* We now map over the 'accounts' prop directly. */}
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.account_id} // Use the correct key from the edge function response
              style={styles.accountCard}
              onPress={() => router.push(`/account/${account.account_id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.accountHeader}>
                <View style={[
                  styles.accountIcon,
                  { backgroundColor: `${getAccountIconColor(account.account_type)}20` }
                ]}>
                  <Ionicons
                    name={getAccountIcon(account.category)}
                    size={24}
                    color={getAccountIconColor(account.account_type)}
                  />
                </View>
              </View>
              
              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {account.account_name}
                </Text>
                <Text style={styles.accountBalance}>
                  {/* Use latest_balance and currency from the edge function response */}
                  {formatCurrency(account.latest_balance || 0, account.currency)}
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
