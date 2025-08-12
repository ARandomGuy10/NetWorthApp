import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-wagmi-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { formatCurrency } from '@/utils/utils';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

const ranges = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '12M' },
  { label: 'All', value: 'ALL' },
];

const makeGradientColors = (theme: any): [string, string, string] => {
  const c1 = theme.colors.background.primary || '#0B1020';
  const c2 = theme.colors.background.secondary || c1;
  const c3 = theme.colors.background.tertiary || c2;
  return [c1, c2, c3];
};

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
    const empty = { chartData: [], latest: 0, first: 0, delta: 0, pct: 0, currency: 'EUR' };
    if (!data || !data.data || !data.data.length) return empty;

    let raw = [];
    const all = data.data;
    const slice = (n: number) => n === -1 ? all : all.slice(-n);
    
    switch (range) {
      case '1M': raw = slice(30); break;
      case '3M': raw = slice(90); break;
      case '6M': raw = slice(180); break;
      case '12M': raw = slice(365); break;
      case 'ALL': raw = slice(-1); break;
      default: raw = slice(30);
    }

    // Filter consecutive duplicates
    const filtered = [];
    for (let i = 0; i < raw.length; i++) {
      if (i === 0 || raw[i].net_worth !== raw[i - 1].net_worth) {
        filtered.push(raw[i]);
      }
    }

    // Ensure minimum data points for full width
    let chartData = filtered.map((d) => ({
      timestamp: new Date(d.date).getTime(),
      value: d.net_worth,
    }));

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
    };
  }, [data, range]);

  // Enhanced callback to handle tooltip data
  const onCurrentIndexChange = useCallback((index: number) => {
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
          day: 'numeric' 
        }),
        x: 50, // You can calculate actual position if needed
        y: 50,
      });
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setTooltipData(null);
      }, 3000);
    }
  }, [invokeHaptic, prepared.chartData]);

  const lineColor = theme.colors.asset || theme.colors.primary || '#22c55e';
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
    <GestureHandlerRootView>
      <LinearGradient 
        colors={makeGradientColors(theme)} 
        style={styles.container} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        {/* Centered Net Worth Display */}
        <View style={styles.netWorthContainer}>
          <LineChart.Provider data={prepared.chartData} onCurrentIndexChange={onCurrentIndexChange}>
            <Text style={[styles.netWorthText, { color: theme.colors.text.primary }]}>
              {formatCurrency(prepared.latest, prepared.currency)}
            </Text>
            
            <View style={[
              styles.netWorthChangeContainer, 
              { backgroundColor: prepared.delta >= 0 ? '#22c55e25' : '#ef444425' }
            ]}> 
              <Text style={[
                styles.netWorthChangeText, 
                { color: prepared.delta >= 0 ? lineColor : '#ef4444' }
              ]}> 
                {prepared.delta >= 0 ? '+' : ''}{formatCurrency(prepared.delta, prepared.currency)} ({prepared.pct.toFixed(1)}%)
              </Text>
            </View>
          </LineChart.Provider>
        </View>

        {/* Interactive Chart Section with Custom Tooltip */}
        <View style={styles.chartContainer}>
          <LineChart.Provider data={prepared.chartData} onCurrentIndexChange={onCurrentIndexChange}>
            <LineChart width={screenWidth} height={220}>
              <LineChart.Path color={lineColor} width={3} />
              <LineChart.CursorCrosshair 
                color={lineColor}
                onActivated={invokeHaptic}
                onEnded={invokeHaptic}
              />
            </LineChart>
          </LineChart.Provider>
          
          {/* Custom Tooltip - Safe Implementation */}
          {tooltipData && (
            <View style={[styles.customTooltip, { 
              backgroundColor: theme.colors.background.secondary,
              borderColor: lineColor 
            }]}>
              <Text style={[styles.tooltipValue, { color: theme.colors.text.primary }]}>
                {formatCurrency(tooltipData.value, prepared.currency)}
              </Text>
              <Text style={[styles.tooltipDate, { color: theme.colors.text.secondary }]}>
                {tooltipData.date}
              </Text>
              <View style={[styles.tooltipArrow, { borderTopColor: theme.colors.background.secondary }]} />
            </View>
          )}
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelectorContainer}>
          {ranges.map((option) => {
            const selected = option.value === range;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.periodButton,
                  { backgroundColor: theme.colors.background.secondary },
                  selected && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setRange(option.value as any)}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: selected ? theme.colors.background.primary : theme.colors.text.secondary },
                  selected && { fontWeight: '700' }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  // ... all your existing styles ...
  container: {
    width: screenWidth,
    paddingTop: 30,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  userName: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
  netWorthContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  netWorthText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
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
  chartContainer: {
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative', // Important for tooltip positioning
  },
  // New Custom Tooltip Styles
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
        shadowColor: '#000',
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
  periodSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 6 
      },
      android: { elevation: 2 },
    }),
  },
  periodButtonText: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    width: screenWidth,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default IntegratedDashboard_Wagmi;
