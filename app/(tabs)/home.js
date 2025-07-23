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
  PanResponder,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

// Conditionally import Victory components only for non-web platforms
let VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTooltip, VictoryScatter;
if (Platform.OS !== 'web') {
  const Victory = require('victory-native');
  VictoryChart = Victory.VictoryChart;
  VictoryLine = Victory.VictoryLine;
  VictoryArea = Victory.VictoryArea;
  VictoryAxis = Victory.VictoryAxis;
  VictoryTooltip = Victory.VictoryTooltip;
  VictoryScatter = Victory.VictoryScatter;
}

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
  const [fabVisible, setFabVisible] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
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
        const processedData = processChartData(history);
        setChartData(processedData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (supabase && userId) {
      loadDashboardData();
    }
  }, [supabase, userId, loadDashboardData]);

  const processChartData = (history) => {
    if (!history || history.length === 0) return null;

    return history.map((item, index) => ({
      x: index + 1,
      y: item.value,
      label: item.month,
      date: item.date,
      value: item.value
    }));
  };

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  const toggleFab = () => {
    const toValue = fabVisible ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: fabVisible ? 1 : 0.9,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    setFabVisible(!fabVisible);
  };

  const closeFab = () => {
    if (fabVisible) {
      Animated.parallel([
        Animated.timing(fabRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      setFabVisible(false);
    }
  };

  const handleFabAction = (action) => {
    closeFab();

    if (action === 'account') {
      router.push('/add-account');
    } else if (action === 'balance') {
      router.push('/add-balance');
    }
  };

  // Create PanResponder to handle touches outside FAB
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => fabVisible,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      closeFab();
    },
  });

  const getNetWorthTrend = () => {
    if (!chartData || chartData.length < 2) return null;
    
    const current = chartData[chartData.length - 1].y;
    const previous = chartData[chartData.length - 2].y;
    const change = current - previous;
    const percentChange = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;
    
    return {
      change,
      percentChange,
      isPositive: change >= 0
    };
  };

  const trend = getNetWorthTrend();

  if (loading || !supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const fabRotationStyle = {
    transform: [
      {
        rotate: fabRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg']
        })
      },
      { scale: fabScale }
    ]
  };

  return (
    <Animated.View 
      style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}
      {...panResponder.panHandlers}
    >
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
          
          {trend && (
            <View style={styles.changeContainer}>
              <View style={[
                styles.changeIndicator,
                { backgroundColor: trend.isPositive ? colors.success : colors.error }
              ]}>
                <Ionicons
                  name={trend.isPositive ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={colors.text.inverse}
                />
              </View>
              <Text style={[
                styles.changeText,
                { color: trend.isPositive ? colors.success : colors.error }
              ]}>
                {trend.isPositive ? '+' : ''}{formatCurrency(trend.change, netWorthData?.currency || 'EUR')} 
                ({trend.percentChange.toFixed(1)}%) from last month
              </Text>
            </View>
          )}

          {netWorthData && (
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
          )}
        </View>

        {/* Interactive Chart Section */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Net Worth Progression</Text>
            <View style={styles.chartPeriod}>
              <Text style={styles.chartPeriodText}>Last 12 months</Text>
            </View>
          </View>

          {chartData && chartData.length > 0 ? (
            Platform.OS !== 'web' ? (
              <View style={styles.chartContainer}>
              <VictoryChart
                width={screenWidth - (spacing.xl * 2)}
                height={280}
                padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
                theme={{
                  axis: {
                    style: {
                      axis: { stroke: colors.border.primary },
                      tickLabels: { 
                        fill: colors.text.secondary, 
                        fontSize: 12,
                        fontFamily: 'System'
                      },
                      grid: { stroke: colors.border.primary, strokeWidth: 0.5 }
                    }
                  }
                }}
              >
                {/* Gradient Area */}
                <VictoryArea
                  data={chartData}
                  style={{
                    data: {
                      fill: `url(#gradient)`,
                      fillOpacity: 0.1,
                      stroke: colors.primary,
                      strokeWidth: 0
                    }
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
                
                {/* Main Line */}
                <VictoryLine
                  data={chartData}
                  style={{
                    data: { 
                      stroke: colors.primary, 
                      strokeWidth: 3,
                      strokeLinecap: "round"
                    }
                  }}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
                
                {/* Interactive Points */}
                <VictoryScatter
                  data={chartData}
                  size={4}
                  style={{
                    data: { 
                      fill: colors.primary,
                      stroke: colors.background.card,
                      strokeWidth: 2
                    }
                  }}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{
                        fill: colors.background.elevated,
                        stroke: colors.border.primary,
                        strokeWidth: 1
                      }}
                      style={{
                        fill: colors.text.primary,
                        fontSize: 12,
                        fontFamily: 'System'
                      }}
                    />
                  }
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onPressIn: (evt, targetProps) => {
                        const { datum } = targetProps;
                        setSelectedDataPoint(datum);
                        return [
                          {
                            target: "data",
                            mutation: () => ({ style: { fill: colors.primaryDark, r: 6 } })
                          },
                          {
                            target: "labels",
                            mutation: () => ({ 
                              text: `${datum.label}\n${formatCurrency(datum.value, netWorthData?.currency || 'EUR')}` 
                            })
                          }
                        ];
                      }
                    }
                  }]}
                />
                
                <VictoryAxis
                  dependentAxis
                  tickFormat={(value) => formatCurrency(value, netWorthData?.currency || 'EUR')}
                  style={{
                    tickLabels: { fontSize: 11, fill: colors.text.secondary }
                  }}
                />
                
                <VictoryAxis
                  tickFormat={(x) => chartData[x - 1]?.label || ''}
                  style={{
                    tickLabels: { fontSize: 11, fill: colors.text.secondary, angle: -45 }
                  }}
                />
              </VictoryChart>
              
              {selectedDataPoint && (
                <View style={styles.chartTooltip}>
                  <Text style={styles.tooltipDate}>{selectedDataPoint.label}</Text>
                  <Text style={styles.tooltipValue}>
                    {formatCurrency(selectedDataPoint.value, netWorthData?.currency || 'EUR')}
                  </Text>
                </View>
              )}
              </View>
            ) : (
              <View style={styles.webChartFallback}>
                <View style={styles.webChartIcon}>
                  <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
                </View>
                <Text style={styles.webChartTitle}>Chart not available on web</Text>
                <Text style={styles.webChartText}>
                  Interactive charts are available on mobile devices
                </Text>
                <View style={styles.webChartData}>
                  {chartData.map((item, index) => (
                    <View key={index} style={styles.webChartDataItem}>
                      <Text style={styles.webChartDataLabel}>{item.label}</Text>
                      <Text style={styles.webChartDataValue}>
                        {formatCurrency(item.value, netWorthData?.currency || 'EUR')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          ) : (
            <View style={styles.emptyChart}>
              <View style={styles.emptyChartIcon}>
                <Ionicons name="analytics-outline" size={48} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyChartTitle}>No data yet</Text>
              <Text style={styles.emptyChartText}>
                Add some accounts and balance entries to see your net worth progression
              </Text>
              <TouchableOpacity
                style={styles.emptyChartButton}
                onPress={() => router.push('/add-account')}
              >
                <Text style={styles.emptyChartButtonText}>Get Started</Text>
              </TouchableOpacity>
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

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Enhanced Floating Action Button */}
      <View style={styles.fabContainer}>
        {/* FAB Options */}
        {fabVisible && (
          <Animated.View 
            style={[
              styles.fabOptions,
              {
                opacity: fabRotation,
                transform: [{
                  translateY: fabRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('balance')}
              activeOpacity={0.8}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Balance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('account')}
              activeOpacity={0.8}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Account</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

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

      {/* Overlay for FAB */}
      {fabVisible && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={closeFab}
        />
      )}
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
    borderRadius: 20,
    backgroundColor: colors.interactive.hover,
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
  chartSection: {
    backgroundColor: colors.background.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.lg,
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
  chartPeriod: {
    backgroundColor: colors.interactive.hover,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  chartPeriodText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  chartTooltip: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  tooltipDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emptyChart: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyChartIcon: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  emptyChartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyChartText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyChartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  emptyChartButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
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
  bottomSpacing: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.xl + 20,
    right: spacing.xl,
    alignItems: 'flex-end',
  },
  fabOptions: {
    marginBottom: spacing.md,
  },
  fabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.lg,
    minWidth: 140,
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
    elevation: 8,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  webChartFallback: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  webChartIcon: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  webChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  webChartText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  webChartData: {
    width: '100%',
    maxHeight: 200,
  },
  webChartDataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  webChartDataLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  webChartDataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});