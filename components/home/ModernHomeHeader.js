import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatCurrency } from '../../src/services/dashboardService';
import { colors, spacing } from '../../src/styles/colors';

const ModernHomeHeader = ({ profile, netWorthData, trend }) => {
  const router = useRouter();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = () => {
    if (!trend) return colors.text.secondary;
    return trend.isPositive ? colors.asset : colors.error;
  };

  return (
    <View style={styles.container}>
      {/* App Title and Add Button */}
      <View style={styles.topRow}>
        <Text style={styles.appTitle}>PocketRackr</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-account')}
        >
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreeting()}, {profile?.first_name || 'there'} 👋
      </Text>

      {/* Net Worth Display */}
      <Text style={styles.netWorthAmount}>
        {netWorthData ? formatCurrency(netWorthData.netWorth, netWorthData.currency) : '$0'}
      </Text>

      {/* Trend Indicator */}
      {trend?.percentChange != null && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={getTrendIcon()}
            size={16}
            color={getTrendColor()}
            style={styles.trendIcon}
          />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend.isPositive ? '+' : ''}
            {trend.percentChange.toFixed(1)}% from last month
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  netWorthAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: -2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: spacing.xs,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ModernHomeHeader;