// components/analytics/accounts/AccountComparisonChart.tsx
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Pressable, // Keep Pressable for modal overlay
  FlatList,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {LineChart} from 'react-native-wagmi-charts';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {formatSmartNumber, getGradientColors} from '@/src/utils/formatters';
import {useHaptics} from '@/hooks/useHaptics';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useAccountsWithBalances} from '@/hooks/useAccountsWithBalances';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import type {Period, AccountSnapshot} from '@/lib/supabase';
import {Platform} from 'react-native'; // Import Platform separately

const {width: screenWidth} = Dimensions.get('window');

const ranges = [
  {label: '1M', value: '1M'},
  {label: '3M', value: '3M'},
  {label: '6M', value: '6M'},
  {label: '1Y', value: '12M'},
  {label: 'All', value: 'ALL'},
];

type SingleAccount = {
  account_id: string;
  account_name: string;
  account_type: 'asset' | 'liability';
  category: string;
  institution: string | null;
  currency: string;
  include_in_net_worth: boolean | null;
  is_archived: boolean | null;
  latest_balance: number | null;
  latest_balance_date: string | null;
};

// Helper to get account icon
const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    Cash: 'card-outline',
    Checking: 'card-outline',
    Savings: 'wallet-outline',
    Investment: 'trending-up-outline',
    Retirement: 'shield-checkmark-outline',
    'Real Estate': 'home-outline',
    Vehicle: 'car-sport-outline',
    'Credit Card': 'card',
    'Personal Loan': 'document-text-outline',
    Mortgage: 'home',
    'Auto Loan': 'car-sport',
    'Student Loan': 'school-outline',
    Brokerage: 'stats-chart-outline',
  };
  return iconMap[category] || 'ellipse-outline';
};

const AccountProgressChart: React.FC = () => {
  const {theme} = useTheme();
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {impactAsync} = useHaptics();

  // State
  const [period, setPeriod] = useState<Period>('3M');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    value: number;
    date: string;
    x: number;
    y: number;
  } | null>(null);

  // Data
  const {data: rawAccounts} = useAccountsWithBalances();
  const {
    data: historyData,
    isLoading,
    error,
  } = useNetWorthHistory({
    period,
    includeAccountBreakdown: true,
  });

  // Process accounts data
  const accounts = useMemo(() => {
    if (!rawAccounts) return [];
    const flatAccounts = Array.isArray(rawAccounts[0]) ? rawAccounts.flat() : rawAccounts;
    return flatAccounts as SingleAccount[];
  }, [rawAccounts]);

  // Available accounts for selection
  const availableAccounts = useMemo(() => {
    return accounts
      .filter(acc => acc.include_in_net_worth && !acc.is_archived)
      .sort((a, b) => (b.latest_balance || 0) - (a.latest_balance || 0))
      .map(acc => ({
        id: acc.account_id,
        name: acc.account_name,
        type: acc.account_type,
        currency: acc.currency,
        balance: acc.latest_balance || 0,
        category: acc.category, // Add category for icon
      }));
  }, [accounts]);

  // Auto-select top account on first load
  useEffect(() => {
    if (availableAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(availableAccounts[0].id);
    }
  }, [availableAccounts, selectedAccountId]);

  // Clear tooltip when period changes - FIX #1
  useEffect(() => {
    setTooltipData(null);
  }, [period]);

  // Get selected account info
  const selectedAccount = availableAccounts.find(acc => acc.id === selectedAccountId);

  // Calculate performance for selected account - like IntegratedDashboard_Wagmi
  const prepared = useMemo(() => {
    const empty = {
      chartData: [],
      latest: 0,
      first: 0,
      delta: 0,
      pct: 0,
      currency: selectedAccount?.currency || 'EUR',
    };

    if (!historyData || !historyData.metadata?.includeAccountBreakdown || !historyData.data || !selectedAccountId) {
      return empty;
    }

    // 1. Extract the raw series for the selected account
    const accountHistory: {timestamp: number; value: number}[] = [];
    for (const dataPoint of historyData.data) {
      const accountSnap = dataPoint.accounts.find((snap: AccountSnapshot) => snap.account_id === selectedAccountId);
      if (accountSnap) {
        accountHistory.push({
          timestamp: new Date(dataPoint.date).getTime(),
          value: accountSnap.balance,
        });
      }
    }

    if (accountHistory.length === 0) return empty;

    // Filter consecutive duplicates like IntegratedDashboard_Wagmi
    const filtered = [];
    for (let i = 0; i < accountHistory.length; i++) {
      if (i === 0 || i === accountHistory.length - 1 || accountHistory[i].value !== accountHistory[i - 1].value) {
        filtered.push(accountHistory[i]);
      }
    }

    if (filtered.length === 0) return empty;

    const values = filtered.map(d => d.value);
    const latest = values[values.length - 1];
    const first = values[0];
    const delta = latest - first;
    const pct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;

    return {
      chartData: filtered,
      latest,
      first,
      delta,
      pct,
      currency: selectedAccount?.currency || 'EUR',
    };
  }, [historyData, selectedAccountId, selectedAccount]);

  // Period change handler
  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      setPeriod(newPeriod);
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [impactAsync]
  );

  // Account selection
  const selectAccount = useCallback(
    (accountId: string) => {
      setSelectedAccountId(accountId);
      setShowAccountPicker(false);
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [impactAsync]
  );

  // Tooltip handler - exactly like IntegratedDashboard_Wagmi with proper positioning
  const onCurrentIndexChange = useCallback(
    (index: number) => {
      impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (prepared.chartData[index]) {
        const dataPoint = prepared.chartData[index];
        const date = new Date(dataPoint.timestamp);

        setTooltipData({
          visible: true,
          value: dataPoint.value,
          date: date.toLocaleDateString('en', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          x: 0, // Add x, even if unused
          y: 0, // Add y, even if unused
        });

        // Hide tooltip after 3 seconds
        setTimeout(() => {
          setTooltipData(null);
        }, 3000);
      }
    },
    [impactAsync, prepared.chartData]
  );

  const chartHeight = Math.max(180, Math.min(250, height * 0.25));
  const styles = getStyles(theme);

  // Determine line color based on account type
  const getLineColor = () => {
    if (!selectedAccount) return theme.colors.asset || theme.colors.primary;

    if (selectedAccount.type === 'asset') {
      return theme.colors.asset || theme.colors.primary;
    } else {
      return theme.colors.liability || theme.colors.error;
    }
  };

  const lineColor = getLineColor();
  const liabilityColor = theme.colors.liability || theme.colors.error;

  return (
    <GestureHandlerRootView>
      <LinearGradient
        colors={getGradientColors(theme, 'header')}
        locations={[0, 0.5, 1]} // Keep gradient
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientContainer}>
        {/* Header section with padding to avoid the back button */}
        {selectedAccount ? (
          <View style={[styles.headerContainer, {paddingTop: insets.top + 10}]}>
            <TouchableOpacity
              style={styles.accountSelector}
              onPress={() => setShowAccountPicker(true)}
              activeOpacity={0.8}>
              <View style={styles.accountIcon}>
                <Ionicons
                  name={getAccountIcon(selectedAccount.category)}
                  size={22}
                  color={selectedAccount.type === 'asset' ? theme.colors.asset : theme.colors.liability}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountSelectorTitle}>Selected Account</Text>
                <Text style={styles.accountName} numberOfLines={1}>
                  {selectedAccount.name}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={theme.colors.text.onGradient} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{paddingTop: insets.top, height: 60 + theme.spacing.lg}} />
        )}

        {/* Net Worth Display - exactly like IntegratedDashboard_Wagmi */}
        <View style={styles.netWorthContainer}>
          <Text style={styles.netWorthText}>{formatSmartNumber(prepared.latest, prepared.currency)}</Text>

          <LinearGradient
            colors={
              prepared.delta >= 0
                ? [`${lineColor}25`, `${lineColor}15`]
                : [`${liabilityColor}25`, `${liabilityColor}15`]
            }
            style={styles.netWorthChangeContainer}>
            <Text style={[styles.netWorthChangeText, {color: prepared.delta >= 0 ? lineColor : liabilityColor}]}>
              {prepared.delta >= 0 ? '+' : ''}
              {formatSmartNumber(prepared.delta, prepared.currency)} ({prepared.pct.toFixed(1)}%)
            </Text>
          </LinearGradient>
        </View>

        {/* Chart Container - exactly like IntegratedDashboard_Wagmi */}
        <View style={[styles.improvedChartContainer, {height: chartHeight}]}>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={theme.colors.primary} // Use lineColor to match chart
              />
            </View>
          ) : error || prepared.chartData.length === 0 ? (
            <View style={styles.loadingOverlay}>
              <Text style={styles.placeholderText}>
                {!selectedAccount
                  ? 'Select an account to view its performance'
                  : 'No data available for selected account'}
              </Text>
            </View>
          ) : (
            <GestureHandlerRootView style={{flex: 1}}>
              <LineChart.Provider
                data={prepared.chartData}
                onCurrentIndexChange={onCurrentIndexChange}
                key={`${selectedAccountId}-${period}`}>
                <LineChart height={200}>
                  <LineChart.Path color={lineColor} width={theme.responsive.isSmallScreen ? 2 : 3} />
                  <LineChart.CursorCrosshair
                    color={lineColor}
                    onActivated={() => impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    onEnded={() => {}}
                  />
                </LineChart>
              </LineChart.Provider>
            </GestureHandlerRootView>
          )}
          {/* Custom Tooltip - Safe Implementation */}
          {tooltipData && (
            <View // This View is correctly positioned relative to its parent
              style={[
                styles.customTooltip,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: lineColor,
                },
              ]}>
              <Text style={[styles.tooltipValue, {color: theme.colors.text.primary}]}>
                {formatSmartNumber(tooltipData.value, prepared.currency)}
              </Text>
              <Text style={[styles.tooltipDate, {color: theme.colors.text.secondary}]}>{tooltipData.date}</Text>
              <View style={[styles.tooltipArrow, {borderTopColor: theme.colors.background.secondary}]} />
            </View>
          )}
        </View>

        {/* Enhanced Period Selector - exactly like IntegratedDashboard_Wagmi */}
        <View style={styles.enhancedPeriodSelector}>
          {ranges.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.enhancedPeriodButton, period === option.value && styles.selectedPeriodButton]}
              onPress={() => handlePeriodChange(option.value as Period)}>
              <Text style={[styles.periodButtonText, period === option.value && {color: theme.colors.text.onPrimary}]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Picker Modal */}
        <Modal visible={showAccountPicker} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setShowAccountPicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Account</Text>
                <TouchableOpacity onPress={() => setShowAccountPicker(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={availableAccounts}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity style={[styles.accountOption]} onPress={() => selectAccount(item.id)}>
                    <View style={styles.accountOptionIcon}>
                      <Ionicons
                        name={getAccountIcon(item.category)}
                        size={22}
                        color={item.type === 'asset' ? theme.colors.asset : theme.colors.liability}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.accountOptionName}>{item.name}</Text>
                      <Text style={styles.accountOptionType}>
                        {item.type} • {formatSmartNumber(item.balance, item.currency)}
                      </Text>
                    </View>
                    {item.id === selectedAccountId && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: insets.bottom}}
                ItemSeparatorComponent={() => (
                  // Add a separator for better visual distinction
                  <View style={[styles.separator, {backgroundColor: theme.colors.border.primary}]} />
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    gradientContainer: {
      width: screenWidth,
      paddingBottom: theme.spacing.xxl,
      borderBottomLeftRadius: theme.borderRadius.xxl,
      borderBottomRightRadius: theme.borderRadius.xxl,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end', // Align the selector to the right
      paddingHorizontal: theme.spacing.md, // Use consistent spacing
      alignItems: 'center',
      marginBottom: theme.spacing.lg, // Add more space below header
    },
    accountSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      width: '80%',
    },
    accountIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    accountInfo: {
      flex: 1,
    },
    accountSelectorTitle: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.onGradient,
      opacity: 0.7,
      marginBottom: 2,
    },
    accountName: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.onGradient,
    },

    // Net worth display - exactly like IntegratedDashboard_Wagmi
    netWorthContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    netWorthText: {
      fontSize: theme.fontSizes?.display || 30,
      fontWeight: '700',
      letterSpacing: -0.8,
      marginBottom: theme.spacing?.sm || 8,
      color: theme.colors.text.primary,
    },
    netWorthChangeContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    netWorthChangeText: {
      fontSize: theme.fontSizes?.sm || 12,
      fontWeight: '600',
    },

    // Chart container - exactly like IntegratedDashboard_Wagmi
    improvedChartContainer: {
      marginBottom: 20,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: 'transparent',
      paddingVertical: 16,
    },
    loadingOverlay: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 20,
      color: theme.colors.text.primary,
    },

    // Fixed tooltip positioning - exactly like IntegratedDashboard_Wagmi
    customTooltip: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      zIndex: 1000,
      position: 'absolute',
      top: 20,
      alignSelf: 'center',
      minWidth: 140,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tooltipValue: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
      textAlign: 'center',
    },
    tooltipDate: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    tooltipArrow: {
      position: 'absolute',
      bottom: -6,
      left: '50%',
      marginLeft: -6,
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderTopWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },

    // Period selector - exactly like IntegratedDashboard_Wagmi
    enhancedPeriodSelector: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: 4,
      marginTop: 16,
    },
    enhancedPeriodButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    selectedPeriodButton: {
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    periodButtonText: {
      fontWeight: '600',
      fontSize: theme.fontSizes?.sm || 14,
      color: theme.colors.text.onGradient,
      letterSpacing: -0.2,
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalTitle: {
      fontSize: theme.fontSizes.title,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    separator: {
      height: 1,
      marginHorizontal: theme.spacing.lg,
    },
    accountOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    accountOptionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    accountOptionName: {
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    accountOptionType: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      textTransform: 'capitalize',
    },
  });

export default AccountProgressChart;
