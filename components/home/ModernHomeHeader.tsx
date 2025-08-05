// components/home/ModernHomeHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatCurrency } from '@/utils/utils';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  preferred_currency: string;
  theme: string;
  created_at: string | null;
  updated_at: string | null;
}

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

interface Trend {
  isPositive: boolean;
  percentChange: number;
}

interface ModernHomeHeaderProps {
  profile?: Profile | null;
  netWorthData?: NetWorthData | null;
  trend?: Trend | null;
}

const ModernHomeHeader: React.FC<ModernHomeHeaderProps> = ({ profile, netWorthData, trend }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTrendIcon = (): keyof typeof Ionicons.glyphMap | null => {
    if (!trend) return null;
    return trend.isPositive ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = (): string => {
    if (!trend) return theme.colors.text.secondary;
    return trend.isPositive ? theme.colors.asset : theme.colors.error;
  };

  return (
    <View style={styles.container}>
      {/* App Title and Add Button */}
      <View style={styles.topRow}>
        <Text style={styles.appTitle}>PocketRackr</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('accounts/add-account')}
        >
          <Ionicons name="add" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <Text style={styles.greeting}>
        {getGreeting()}, {profile?.first_name || 'there'} 👋
      </Text>

      {/* Net Worth Display */}
      <Text style={styles.netWorthAmount}>
        {netWorthData ? formatCurrency(netWorthData.totalNetWorth, netWorthData.currency) : '$0'}
      </Text>

      {/* Trend Indicator */}
      {trend?.percentChange != null && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={getTrendIcon()!}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  netWorthAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: -2,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: theme.spacing.xs,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ModernHomeHeader;
