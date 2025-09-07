import React, {useState, useMemo, useCallback, useEffect} from 'react';

import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {LineChart} from 'react-native-wagmi-charts';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import type {Period, AccountSnapshot} from '@/lib/supabase';
import {formatSmartNumber, getGradientColors} from '@/src/utils/formatters';
import {useAccountsWithBalances} from '@/hooks/useAccountsWithBalances';
import {useHaptics} from '@/hooks/useHaptics';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useProfile} from '@/hooks/useProfile';
import {useTheme} from '@/src/styles/theme/ThemeContext';

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

// Define a more robust, theme-aware color palette function
const getComparisonColors = (theme: any) => {
  return [
    '#3498db', // Bright Blue
    '#e74c3c', // Alizarin Red
    '#2ecc71', // Emerald Green
    '#f1c40f', // Sunflower Yellow
    '#9b59b6', // Amethyst Purple
    '#e67e22', // Carrot Orange
  ];
};

const AccountComparisonChart: React.FC = () => {
  const {theme} = useTheme();
  const lineColors = useMemo(() => getComparisonColors(theme), [theme]);
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {impactAsync} = useHaptics();
  const {data: profile} = useProfile();
  const router = useRouter();

  // State
  const [period, setPeriod] = useState<Period>('3M');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    date: string;
    values: {name: string; value: number; color: string; currency: string}[];
  } | null>(null);
  const tooltipTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return (Array.isArray(rawAccounts) ? rawAccounts.flat() : []) as SingleAccount[];
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
        category: acc.category,
      }));
  }, [accounts]);

  // Auto-select top account on first load
  useEffect(() => {
    if (availableAccounts.length > 0 && selectedAccountIds.length === 0) {
      setSelectedAccountIds([availableAccounts[0].id]);
    }
  }, [availableAccounts, selectedAccountIds]);

  // Clear tooltip when period changes
  useEffect(() => {
    setTooltipData(null);
  }, [period]);

  // Get selected account info
  const selectedAccounts = useMemo(
    () =>
      selectedAccountIds
        .map(id => availableAccounts.find(acc => acc.id === id))
        .filter(Boolean) as typeof availableAccounts,
    [selectedAccountIds, availableAccounts]
  );

  // Calculate performance for selected account
  const prepared = useMemo(() => {
    if (
      !historyData ||
      !historyData.metadata?.includeAccountBreakdown ||
      !historyData.data ||
      selectedAccountIds.length === 0
    ) {
      return {
        yRange: {min: 0, max: 0},
        chartDataSets: [],
        latest: 0,
        first: 0,
        delta: 0,
        pct: 0,
        currency: profile?.preferred_currency || 'EUR',
      };
    }

    // Create a separate chart dataset for each selected account
    const chartDataSets = selectedAccountIds.map(id => {
      const accountHistory: {timestamp: number; value: number}[] = [];
      historyData.data.forEach(dataPoint => {
        const accountSnap = dataPoint.accounts.find(snap => snap.account_id === id);
        if (accountSnap) {
          accountHistory.push({
            timestamp: new Date(dataPoint.date).getTime(),
            value: accountSnap.balance,
          });
        }
      });
      return {
        id,
        data: accountHistory,
      };
    });

    // Calculate the min and max range across ALL datasets for uniform scaling
    let yMin = Infinity;
    let yMax = -Infinity;
    chartDataSets.forEach(dataSet => {
      dataSet.data.forEach(point => {
        if (point.value < yMin) yMin = point.value;
        if (point.value > yMax) yMax = point.value;
      });
    });

    const yRange = {min: yMin, max: yMax};

    // Calculate aggregate performance stats
    let totalLatest = 0;
    let totalFirst = 0;

    chartDataSets.forEach(dataSet => {
      if (dataSet.data.length > 0) {
        totalFirst += dataSet.data[0].value;
        totalLatest += dataSet.data[dataSet.data.length - 1].value;
      }
    });

    const totalDelta = totalLatest - totalFirst;
    const totalPct = totalFirst !== 0 ? (totalDelta / Math.abs(totalFirst)) * 100 : 0;

    return {
      yRange,
      chartDataSets,
      latest: totalLatest,
      first: totalFirst,
      delta: totalDelta,
      pct: totalPct,
      currency: profile?.preferred_currency || 'EUR',
    };
  }, [historyData, selectedAccountIds, profile?.preferred_currency]);

  // Back button handler
  const handleBack = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [impactAsync, router]);

  // Period change handler
  const handlePeriodChange = useCallback(
    (newPeriod: Period) => {
      setPeriod(newPeriod);
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [impactAsync]
  );

  // Account selection
  const toggleAccountSelection = useCallback(
    (accountId: string) => {
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedAccountIds(prevSelected => {
        const isSelected = prevSelected.includes(accountId);
        if (isSelected) {
          return prevSelected.filter(id => id !== accountId);
        } else if (prevSelected.length < 3) {
          return [...prevSelected, accountId];
        }
        return prevSelected;
      });
    },
    [impactAsync]
  );

  // Remove account function
  const removeAccount = useCallback(
    (accountId: string) => {
      setSelectedAccountIds(prev => prev.filter(id => id !== accountId));
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [impactAsync]
  );

  // Tooltip handler
  const onCurrentIndexChange = useCallback(
    (index: number) => {
      impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }

      if (index === -1 || prepared.chartDataSets.length === 0) {
        setTooltipData(null);
        return;
      }

      const dataPoint = prepared.chartDataSets[0]?.data[index];

      if (dataPoint) {
        const date = new Date(dataPoint.timestamp);
        const values = prepared.chartDataSets.map((dataSet, i) => {
          const account = availableAccounts.find(a => a.id === dataSet.id);
          const point = dataSet.data[index];

          return {
            name: account?.name || 'Unknown',
            value: point?.value ?? 0,
            color: lineColors[i % lineColors.length],
            currency: prepared.currency,
          };
        });

        values.sort((a, b) => b.value - a.value);

        setTooltipData({
          date: date.toLocaleDateString('en', {weekday: 'short', month: 'short', day: 'numeric'}),
          values,
        });

        tooltipTimeoutRef.current = setTimeout(() => {
          setTooltipData(null);
        }, 3000);
      }
    },
    [impactAsync, prepared, availableAccounts, lineColors, selectedAccountIds]
  );

  const chartHeight = Math.max(180, Math.min(250, height * 0.25));
  const styles = getStyles(theme, insets);

  const lineColor = lineColors[0];
  const liabilityColor = theme.colors.liability || theme.colors.error;

  return (
    <View>
      <LinearGradient
        colors={getGradientColors(theme, 'header')}
        locations={[0, 0.5, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.gradientContainer}>
        {/* ✅ UNIFIED: Header with Back Button, Title, and Add Account Button */}
        <View style={[styles.headerSection, {paddingTop: insets.top + theme.spacing.md}]}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} hitSlop={8} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text.onGradient} />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitle}>Account Comparison</Text>
          </View>

          {/* Add Account Button */}
          {/* ✅ ALTERNATIVE: Compact Pill Style */}
          <TouchableOpacity
            style={[styles.compactAddButton, selectedAccountIds.length >= 3 && styles.compactAddButtonDisabled]}
            onPress={() => setShowAccountPicker(true)}
            activeOpacity={0.7}
            disabled={selectedAccountIds.length >= 3}>
            <LinearGradient
              colors={
                selectedAccountIds.length >= 3
                  ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                  : [`${theme.colors.primary}CC`, `${theme.colors.primaryDark}CC`] // 80% opacity
              }
              style={styles.compactAddGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Ionicons
                name={selectedAccountIds.length >= 3 ? 'checkmark' : 'add'}
                size={14}
                color={theme.colors.text.onPrimary}
              />
              <Text style={[styles.compactAddText]}>
                {selectedAccountIds.length >= 3 ? 'Full' : `Add (${selectedAccountIds.length}/3)`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Account Pills with 30% Width Each */}
        {selectedAccounts.length > 0 && (
          <View
            style={[
              styles.accountPillsContainer,
              {
                justifyContent:
                  selectedAccounts.length === 1
                    ? 'center'
                    : selectedAccounts.length === 2
                      ? 'space-evenly'
                      : 'space-between',
              },
            ]}>
            {selectedAccounts.map((account, index) => (
              <TouchableOpacity
                key={account.id}
                style={[styles.accountPill, {borderColor: lineColors[index % lineColors.length]}]}
                onPress={() => removeAccount(account.id)}>
                <View style={[styles.colorIndicator, {backgroundColor: lineColors[index % lineColors.length]}]} />
                <View style={styles.accountPillContent}>
                  <Text style={styles.accountPillName} numberOfLines={1}>
                    {account.name}
                  </Text>
                  <Text style={styles.accountPillBalance} numberOfLines={1}>
                    {formatSmartNumber(account.balance, account.currency)}
                  </Text>
                </View>
                <Ionicons name="close-circle" size={14} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Net Worth Display */}
        <View style={styles.netWorthWrapper}>
          <View style={styles.netWorthContainer}>
            <Text style={styles.netWorthText}>{formatSmartNumber(prepared.latest, prepared.currency)}</Text>

            <LinearGradient
              colors={
                prepared.delta >= 0
                  ? [`${theme.colors.asset}25`, `${theme.colors.asset}15`]
                  : [`${liabilityColor}25`, `${liabilityColor}15`]
              }
              style={styles.deltaContainer}>
              <Text
                style={[
                  styles.netWorthChangeText,
                  {color: prepared.delta >= 0 ? theme.colors.asset || theme.colors.primary : liabilityColor},
                ]}>
                {prepared.delta >= 0 ? '+' : ''}
                {formatSmartNumber(prepared.delta, prepared.currency)} ({prepared.pct.toFixed(1)}%)
              </Text>
            </LinearGradient>
          </View>

          {/* Tooltip */}
          {tooltipData && (
            <View
              style={[
                styles.customTooltip,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: lineColor,
                },
              ]}>
              <Text style={[styles.tooltipDate, {color: theme.colors.text.secondary}]}>{tooltipData.date}</Text>
              {tooltipData.values.map(item => (
                <View key={item.name} style={styles.tooltipRow}>
                  <View style={[styles.tooltipColorDot, {backgroundColor: item.color}]} />
                  <Text style={styles.tooltipName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.tooltipValue}>{formatSmartNumber(item.value, item.currency)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Chart Container */}
        <View style={[styles.improvedChartContainer, {height: chartHeight}]}>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error || prepared.chartDataSets.length === 0 ? (
            <View style={styles.loadingOverlay}>
              <Text style={styles.placeholderText}>
                {selectedAccounts.length === 0
                  ? 'Select accounts to compare their performance'
                  : 'No data available for selected accounts'}
              </Text>
            </View>
          ) : (
            <View style={styles.chartRow}>
              <View style={styles.chartWrapper}>
                <View style={{flex: 1}}>
                  {/* Render non-interactive background lines first */}
                  {prepared.chartDataSets.slice(1).map((dataSet, index) => (
                    <View key={dataSet.id} style={[StyleSheet.absoluteFill, {pointerEvents: 'none'}]}>
                      <LineChart.Provider data={dataSet.data} yRange={prepared.yRange}>
                        <LineChart height={chartHeight}>
                          <LineChart.Path
                            color={lineColors[(index + 1) % lineColors.length]}
                            width={theme.responsive?.isSmallScreen ? 2 : 3}
                          />
                        </LineChart>
                      </LineChart.Provider>
                    </View>
                  ))}
                  {prepared.chartDataSets.length > 0 && (
                    <LineChart.Provider
                      data={prepared.chartDataSets[0].data}
                      yRange={prepared.yRange}
                      onCurrentIndexChange={onCurrentIndexChange}
                      // ✅ KEY FIX: Force re-render when data changes to prevent stale tooltip callbacks.
                      // A unique key ensures the provider and its children re-mount with fresh props.
                      key={`${period}-${selectedAccountIds.join('-')}`}>
                      <LineChart height={chartHeight}>
                        <LineChart.Path color={lineColor} width={theme.responsive?.isSmallScreen ? 2 : 3} />
                        {selectedAccountIds.length === 1 && <LineChart.Gradient color={lineColor} />}
                        <LineChart.CursorCrosshair color={lineColor} onEnded={() => {}} />
                      </LineChart>
                    </LineChart.Provider>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Period Selector */}
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
            <Pressable style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Accounts ({selectedAccountIds.length}/3)</Text>
                <TouchableOpacity onPress={() => setShowAccountPicker(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              <FlatList
                style={{maxHeight: height * 0.6}}
                data={availableAccounts}
                keyExtractor={item => item.id}
                renderItem={({item}) => {
                  const isSelected = selectedAccountIds.includes(item.id);
                  const isDisabled = !isSelected && selectedAccountIds.length >= 3;
                  return (
                    <TouchableOpacity
                      style={[styles.accountOption, isDisabled && styles.accountOptionDisabled]}
                      onPress={() => toggleAccountSelection(item.id)}
                      disabled={isDisabled}>
                      <View style={[styles.accountOptionIcon, isSelected && styles.accountOptionIconSelected]}>
                        <Ionicons
                          name={getAccountIcon(item.category)}
                          size={22}
                          color={
                            isSelected
                              ? theme.colors.text.onPrimary
                              : item.type === 'asset'
                                ? theme.colors.asset
                                : theme.colors.liability
                          }
                        />
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.accountOptionName}>{item.name}</Text>
                        <Text style={styles.accountOptionType}>
                          {item.type} • {formatSmartNumber(item.balance, item.currency)}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: insets.bottom}}
                ItemSeparatorComponent={() => (
                  <View style={[styles.separator, {backgroundColor: theme.colors.border.primary}]} />
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    gradientContainer: {
      width: screenWidth,
      paddingBottom: theme.spacing.xxl,
      borderBottomLeftRadius: theme.borderRadius.xxl,
      borderBottomRightRadius: theme.borderRadius.xxl,
    },

    // ✅ UNIFIED: Header Layout with Back Button, Title, and Add Account Button
    headerSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      minHeight: 44, // Ensure minimum height for touch targets
    },

    // ✅ NEW: Back Button Style
    backButton: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
      //left: theme.spacing.md,
      width: theme.spacing.xl + theme.spacing.lg,
      height: theme.spacing.xl + theme.spacing.lg,
      borderRadius: (theme.spacing.xl + theme.spacing.lg) / 2,
      backgroundColor: theme.colors.interactive.hover,
      borderWidth: 0.5,
      borderColor: theme.colors.border.primary,
      zIndex: 10,
    },

    titleContainer: {
      flex: 1, // Take remaining space
      justifyContent: 'center',
      alignItems: 'center', // Center the title
    },

    sectionTitle: {
      fontSize: theme.fontSizes.title,
      fontWeight: '800',
      color: theme.colors.text.onGradient,
    },

    addAccountButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.sm,
    },

    addAccountText: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.onGradient,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },

    // Pills with 30% Width Each
    accountPillsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      flexWrap: 'wrap',
    },
    accountPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      width: '30%', // ✅ 30% width so 3 pills fit per row
      marginBottom: theme.spacing.xs,
    },
    colorIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacing.xs,
      flexShrink: 0,
    },
    accountPillContent: {
      flex: 1,
      marginRight: theme.spacing.xs,
    },
    accountPillName: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      color: theme.colors.text.onGradient,
    },
    accountPillBalance: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },

    // Rest of existing styles...
    netWorthWrapper: {
      alignItems: 'center',
    },
    netWorthContainer: {
      alignItems: 'center',
      marginVertical: theme.spacing.xl,
    },
    netWorthText: {
      fontSize: theme.fontSizes?.display || 30,
      fontWeight: '700',
      letterSpacing: -0.8,
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary,
    },
    deltaContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    netWorthChangeText: {
      fontSize: theme.fontSizes.sm,
      fontWeight: '600',
    },
    improvedChartContainer: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: 'transparent',
      paddingVertical: theme.spacing.lg,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: theme.fontSizes.title,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: theme.spacing.xl,
      color: theme.colors.text.primary,
    },
    chartWrapper: {
      flex: 1,
      flexDirection: 'row',
    },
    chartRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    customTooltip: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      zIndex: 1000,
      position: 'absolute',
      top: 0,
      minWidth: 200,
      maxWidth: '60%',
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
      fontSize: theme.fontSizes.body,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginLeft: 'auto',
    },
    tooltipDate: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    tooltipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: theme.spacing.xs,
    },
    tooltipColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacing.sm,
    },
    tooltipName: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    enhancedPeriodSelector: {
      flexDirection: 'row',
      backgroundColor: 'transparent',
      borderRadius: 16,
      padding: theme.spacing.xs,
      marginTop: theme.spacing.lg,
    },
    enhancedPeriodButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs / 2,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
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
    accountOptionIconSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    accountOptionDisabled: {
      opacity: 0.5,
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
    },
    // ✅ ALTERNATIVE: Compact Pill Styles
    compactAddButton: {
      borderRadius: theme.borderRadius.full,
      marginLeft: theme.spacing.sm,
      overflow: 'hidden',
      minHeight: 32,
    },

    compactAddButtonDisabled: {
      opacity: 0.8,
    },

    compactAddGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },

    compactAddText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      color: theme.colors.text.onPrimary,
      marginLeft: theme.spacing.xs,
      letterSpacing: 0.3,
    },

    compactAddTextDisabled: {
      color: theme.colors.text.disabled,
    },
  });

export default AccountComparisonChart;
