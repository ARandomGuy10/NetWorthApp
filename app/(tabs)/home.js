import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Modal from 'react-native-modal';
import { useSupabase } from '../../hooks/useSupabase';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { getCurrentUserProfile } from '../../src/services/profileService';
import { 
  getNetWorthData, 
  getNetWorthHistory, 
  getDailyNetWorthChange,
  formatCurrency 
} from '../../src/services/dashboardService';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const supabase = useSupabase();
  const userId = useCurrentUserId();
  
  const [profile, setProfile] = useState(null);
  const [netWorthData, setNetWorthData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dailyChange, setDailyChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartViewMode, setChartViewMode] = useState('absolute'); // 'absolute' or 'percentage'
  const [fabVisible, setFabVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load user profile and dashboard data in parallel
      const [userProfile, netWorth, history, change] = await Promise.all([
        getCurrentUserProfile(supabase, userId),
        getNetWorthData(supabase, 'EUR'),
        getNetWorthHistory(supabase, 'EUR'),
        getDailyNetWorthChange(supabase, 'EUR')
      ]);

      setProfile(userProfile);
      setNetWorthData(netWorth);
      setDailyChange(change);
      
      // Process chart data
      if (history && history.length > 0) {
        const processedData = processChartData(history, chartViewMode);
        setChartData(processedData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, userId, chartViewMode]);

  useEffect(() => {
    if (supabase && userId) {
      loadDashboardData();
    }
  }, [supabase, userId, loadDashboardData]);

  const processChartData = (history, viewMode) => {
    if (!history || history.length === 0) return null;

    const labels = history.map(item => item.month);
    let datasets;

    if (viewMode === 'percentage') {
      const firstValue = history[0].value;
      const percentageData = history.map(item => 
        firstValue !== 0 ? ((item.value - firstValue) / Math.abs(firstValue)) * 100 : 0
      );
      
      datasets = [{
        data: percentageData,
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
        strokeWidth: 3,
      }];
    } else {
      datasets = [{
        data: history.map(item => item.value),
        color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
        strokeWidth: 3,
      }];
    }

    return {
      labels,
      datasets,
    };
  };

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  const toggleChartView = () => {
    const newMode = chartViewMode === 'absolute' ? 'percentage' : 'absolute';
    setChartViewMode(newMode);
  };

  const toggleFab = () => {
    const toValue = fabVisible ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setFabVisible(!fabVisible);
  };

  const handleFabAction = (action) => {
    setFabVisible(false);
    Animated.timing(fabRotation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (action === 'account') {
      router.push('/add-account');
    } else if (action === 'balance') {
      router.push('/add-balance');
    }
  };

  if (loading || !supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: colors.background.card,
    backgroundGradientFrom: colors.background.card,
    backgroundGradientTo: colors.background.card,
    decimalPlaces: chartViewMode === 'percentage' ? 1 : 0,
    color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: borderRadius.md,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: colors.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: colors.border.primary,
      strokeWidth: 1
    },
    formatYLabel: (value) => {
      if (chartViewMode === 'percentage') {
        return `${parseFloat(value).toFixed(1)}%`;
      }
      return formatCurrency(parseFloat(value), profile?.preferred_currency || 'EUR');
    }
  };

  const fabRotationStyle = {
    transform: [{
      rotate: fabRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
      })
    }]
  };

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </Text>
          <Text style={styles.userName}>
            {profile?.first_name ? `${profile.first_name}` : 'Welcome back'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Net Worth Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total Net Worth</Text>
            <Text style={styles.summaryAmount}>
              {netWorthData ? formatCurrency(netWorthData.netWorth, netWorthData.currency) : '€0.00'}
            </Text>
          </View>
          
          {dailyChange && (
            <View style={styles.changeContainer}>
              <Ionicons
                name={dailyChange.isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                color={dailyChange.isPositive ? colors.success : colors.error}
              />
              <Text style={[
                styles.changeText,
                { color: dailyChange.isPositive ? colors.success : colors.error }
              ]}>
                {dailyChange.isPositive ? '+' : ''}{formatCurrency(dailyChange.change, netWorthData?.currency || 'EUR')} 
                ({dailyChange.percentageChange.toFixed(2)}%) today
              </Text>
            </View>
          )}

          {netWorthData && (
            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Assets</Text>
                <Text style={[styles.breakdownValue, { color: colors.asset }]}>
                  {formatCurrency(netWorthData.totalAssets, netWorthData.currency)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Liabilities</Text>
                <Text style={[styles.breakdownValue, { color: colors.liability }]}>
                  -{formatCurrency(netWorthData.totalLiabilities, netWorthData.currency)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Net Worth Progression</Text>
            <TouchableOpacity
              style={styles.chartToggle}
              onPress={toggleChartView}
            >
              <Text style={styles.chartToggleText}>
                {chartViewMode === 'absolute' ? 'Show %' : 'Show €'}
              </Text>
            </TouchableOpacity>
          </View>

          {chartData && chartData.datasets[0].data.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - (spacing.xl * 2)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={chartViewMode === 'percentage'}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyChartTitle}>No data yet</Text>
              <Text style={styles.emptyChartText}>
                Add some accounts and balance entries to see your net worth progression
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/accounts')}
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
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.interactive.hover }]}>
                <Ionicons name="pie-chart-outline" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionSubtitle}>View insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Modal
          isVisible={fabVisible}
          onBackdropPress={toggleFab}
          backdropOpacity={0}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={styles.fabModal}
        >
          <View style={styles.fabOptions}>
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('account')}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('balance')}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Balance</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.fab}
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Animated.View style={fabRotationStyle}>
            <Ionicons name="add" size={28} color={colors.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  greeting: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  profileButton: {
    padding: spacing.sm,
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
  summaryHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: spacing.xs,
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
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartSection: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  chartToggle: {
    backgroundColor: colors.interactive.hover,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  chartToggleText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyChart: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyChartText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
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
    ...shadows.sm,
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
  bottomSpacing: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl + 20,
    right: spacing.xl,
  },
  fabModal: {
    margin: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fabOptions: {
    marginBottom: 80,
    marginRight: spacing.xl,
  },
  fabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  fabOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fabOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});