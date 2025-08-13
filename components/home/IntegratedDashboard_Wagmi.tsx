import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-wagmi-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { formatCurrency, makeGradientColors } from '@/utils/utils';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const ranges = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '12M' },
  { label: 'All', value: 'ALL' },
];

const IntegratedDashboard_Wagmi: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme() || {};
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('3M');
  const { data, isLoading, error } = useNetWorthHistory({ period: range });

  // State for custom tooltip
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    value: number;
    date: string;
    x: number;
    y: number;
  } | null>(null);

  const invokeHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const prepared = useMemo(() => {
    const empty = {
      chartData: [],
      latest: 0,
      first: 0,
      delta: 0,
      pct: 0,
      currency: 'EUR',
      calculatedAt: '',
    };
    if (!data || !data.data || !data.data.length) return empty;

    let raw = [];
    const all = data.data;
    const slice = (n: number) => (n === -1 ? all : all.slice(-n));

    switch (range) {
      case '1M':
        raw = slice(30);
        break;
      case '3M':
        raw = slice(90);
        break;
      case '6M':
        raw = slice(180);
        break;
      case '12M':
        raw = slice(365);
        break;
      case 'ALL':
        raw = slice(-1);
        break;
      default:
        raw = slice(30);
        break;
    }

    // Filter consecutive duplicates
    const filtered = [];
    for (let i = 0; i < raw.length; i++) {
      if (i === 0 || raw[i].net_worth !== raw[i - 1].net_worth) {
        filtered.push(raw[i]);
      }
    }

    let chartData = filtered.map(d => ({
      timestamp: new Date(d.date).getTime(),
      value: d.net_worth,
    }));

    if (chartData.length === 0) return empty;

    const values = chartData.map(d => d.value);
    const latestVal = values[values.length - 1];
    const firstVal = values[0];
    const delta = latestVal - firstVal;
    const pct = firstVal !== 0 ? (delta / Math.abs(firstVal)) * 100 : 0;

    return {
      chartData,
      latest: latestVal,
      first: firstVal,
      delta,
      pct,
      currency: data.currency || 'EUR',
      calculatedAt: data.calculatedAt,
    };
  }, [data, range]);

  // Enhanced callback to handle tooltip data
  const onCurrentIndexChange = useCallback(
    (index: number) => {
      invokeHaptic();

      // Show tooltip with current data point
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
          x: 50, // You can calculate actual position if needed
          y: 50,
        });

        // Hide tooltip after 3 seconds
        setTimeout(() => {
          setTooltipData(null);
        }, 3000);
      }
    },
    [invokeHaptic, prepared.chartData]
  );

  const lineColor = theme.colors.asset || theme.colors.primary;
  const liabilityColor = theme.colors.liability || theme.colors.error;
  const styles = getStyles(theme);

  if (isLoading || error || prepared.chartData.length === 0) {
    return (
      <LinearGradient colors={makeGradientColors(theme)} style={styles.loadingContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Text style={[styles.placeholderText, { color: theme.colors.text.primary }]}>
            {error ? 'Unable to load data' : 'Add assets to start tracking'}
          </Text>
        )}
      </LinearGradient>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={makeGradientColors(theme)}
        locations={[0, 0.5, 1]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {/* Centered Net Worth Display */}
        <View style={styles.netWorthContainer}>
          <Text style={[styles.netWorthText, { color: theme.colors.text.primary }]}>
            {formatCurrency(prepared.latest, prepared.currency)}
          </Text>

          <LinearGradient
            colors={
              prepared.delta >= 0
                ? [`${lineColor}25`, `${lineColor}15`]
                : [`${liabilityColor}25`, `${liabilityColor}15`]
            }
            style={styles.netWorthChangeContainer}>
            <Text style={[styles.netWorthChangeText, { color: prepared.delta >= 0 ? lineColor : liabilityColor }]}>
              {prepared.delta >= 0 ? '+' : ''}
              {formatCurrency(prepared.delta, prepared.currency)} ({prepared.pct.toFixed(1)}%)
            </Text>
          </LinearGradient>
        </View>

        {/* Enhanced Chart Container */}
        <View style={styles.improvedChartContainer}>
          <LineChart.Provider
            data={prepared.chartData}
            onCurrentIndexChange={onCurrentIndexChange}
            key={`${range}-${prepared.chartData.length}-${prepared.latest}-${prepared.calculatedAt}`}>
            <LineChart height={200} width={screenWidth}>
              <LineChart.Path color={lineColor} width={3} />
              <LineChart.CursorCrosshair color={lineColor} onActivated={invokeHaptic} onEnded={invokeHaptic} />
            </LineChart>
          </LineChart.Provider>

          {/* Custom Tooltip - Safe Implementation */}
          {tooltipData && (
            <View
              style={[
                styles.customTooltip,
                {
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: lineColor,
                },
              ]}>
              <Text style={[styles.tooltipValue, { color: theme.colors.text.primary }]}>
                {formatCurrency(tooltipData.value, prepared.currency)}
              </Text>
              <Text style={[styles.tooltipDate, { color: theme.colors.text.secondary }]}>{tooltipData.date}</Text>
              <View style={[styles.tooltipArrow, { borderTopColor: theme.colors.background.secondary }]} />
            </View>
          )}
        </View>

        {/* Enhanced Period Selector */}
        <View style={styles.enhancedPeriodSelector}>
          {ranges.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.enhancedPeriodButton, option.value === range && styles.selectedPeriodButton]}
              onPress={() => setRange(option.value as any)}>
              <Text
                style={[
                  styles.periodButtonText,
                  {
                    color: option.value === range ? theme.colors.text.inverse : theme.colors.text.secondary,
                  },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: screenWidth,
      paddingTop: 30,
      paddingBottom: 32,
    },
    netWorthContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    netWorthText: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    netWorthChangeContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    netWorthChangeText: {
      fontSize: 14,
      fontWeight: '600',
    },
    customTooltip: {
      position: 'absolute',
      top: 20,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      minWidth: 140,
      zIndex: 1000,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text.primary,
          shadowOffset: { width: 0, height: 4 },
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
    periodButtonText: {
      fontWeight: '600',
      fontSize: 14,
      letterSpacing: -0.2,
    },
    loadingContainer: {
      width: screenWidth,
      height: 200, // Match LineChart height
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 20,
    },
    improvedChartContainer: {
      marginBottom: 20,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: 'transparent',
      paddingVertical: 16,
    },

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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
  });

export default IntegratedDashboard_Wagmi;
