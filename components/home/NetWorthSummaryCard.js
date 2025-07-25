import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../src/services/dashboardService';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

const NetWorthSummaryCard = ({ netWorthData, trend }) => {
  if (!netWorthData) {
    return null;
  }

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>Total Net Worth</Text>
        <Text style={styles.summaryAmount}>
          {formatCurrency(netWorthData.netWorth, netWorthData.currency)}
        </Text>
      </View>

      {trend && (
        <View style={styles.changeContainer}>
          <View
            style={[
              styles.changeIndicator,
              { backgroundColor: trend.isPositive ? colors.success : colors.error },
            ]}
          >
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={colors.text.inverse}
            />
          </View>
          <Text
            style={[
              styles.changeText,
              { color: trend.isPositive ? colors.success : colors.error },
            ]}
          >
            {trend.isPositive ? '+' : ''}
            {formatCurrency(trend.change, netWorthData.currency)} (
            {trend.percentChange.toFixed(1)}%) from last month
          </Text>
        </View>
      )}

      <View style={styles.breakdownContainer}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.asset }]} />
            <Text style={styles.breakdownLabel}>Assets</Text>
          </View>
          <Text style={[styles.breakdownValue, { color: colors.asset }]}>
            {formatCurrency(netWorthData.totalAssets, netWorthData.currency)}
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <View style={[styles.breakdownDot, { backgroundColor: colors.liability }]} />
            <Text style={styles.breakdownLabel}>Liabilities</Text>
          </View>
          <Text style={[styles.breakdownValue, { color: colors.liability }]}>
            {formatCurrency(netWorthData.totalLiabilities, netWorthData.currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.background.card,
    margin: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.lg,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  changeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NetWorthSummaryCard;
