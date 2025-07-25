import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

const QuickActions = ({ netWorthData }) => {
  const router = useRouter();

  return (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/accounts')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.interactive.hover }]}>
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.actionTitle}>View Accounts</Text>
          <Text style={styles.actionSubtitle}>
            {netWorthData ? `${netWorthData.assetAccounts.length + netWorthData.liabilityAccounts.length} accounts` : '0 accounts'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/analytics')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.interactive.hover }]}>
            <Ionicons name="pie-chart-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Analytics</Text>
          <Text style={styles.actionSubtitle}>View insights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default QuickActions;
