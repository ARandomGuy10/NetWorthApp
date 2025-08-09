// components/home/ModernNetWorthChart.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { formatCurrency } from '@/utils/utils';
import { Theme } from '@/lib/supabase';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';

const { width: screenWidth } = Dimensions.get('window');

const TIME_RANGES = [
  { label: '1M', value: '1M' as const },
  { label: '3M', value: '3M' as const },
  { label: '6M', value: '6M' as const },
  { label: '1Y', value: '12M' as const },
  { label: 'All', value: 'ALL' as const },
];

const ModernNetWorthChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('3M');
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { data, isLoading, error } = useNetWorthHistory({ period: selectedRange });

  const getPointsToShow = () => {
    switch (selectedRange) {
      case '1M': return -30;
      case '3M': return -20;
      case '6M': return -15;
      case '12M': return -12;
      case 'ALL': return -10;
      default: return -6;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#F8FAFC', '#FFFFFF']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Loading portfolio...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="analytics-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Chart unavailable</Text>
        </View>
      </View>
    );
  }

  const chartData = data?.data || [];
  const pointsToShow = getPointsToShow();
  const displayData = chartData.slice(pointsToShow);

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Ionicons name="trending-up-outline" size={64} color="#9CA3AF" />
          <Text style={styles.noDataText}>Start tracking to see your growth</Text>
        </View>
      </View>
    );
  }

  const values = displayData.map(item => item.net_worth);
  const latestValue = values[values.length - 1];
  const firstValue = values[0];
  const growth = latestValue - firstValue;
  const growthPercentage = firstValue !== 0 ? (growth / Math.abs(firstValue)) * 100 : 0;
  const isPositive = growth >= 0;

  // Enhanced chart data
  const processedData = {
    labels: displayData.map(() => ''),
    datasets: [{
      data: values,
      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  // Premium chart configuration
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    labelColor: () => 'transparent',
    style: { borderRadius: 0 },
    formatYLabel: () => '',
    propsForBackgroundLines: {
      strokeWidth: 0, // Remove grid lines for cleaner look
    },
    fillShadowGradient: '#22C55E',
    fillShadowGradientOpacity: 0.1,
  };

  return (
    <View style={styles.outerContainer}>
      {/* Header Section */}
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.headerContainer}
      >
        <View style={styles.valueSection}>
          <Text style={styles.currentValue}>
            {formatCurrency(latestValue, data?.currency || 'EUR')}
          </Text>
          
          <View style={[styles.growthBadge, { backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons 
              name={isPositive ? "trending-up" : "trending-down"} 
              size={16} 
              color={isPositive ? '#22C55E' : '#EF4444'} 
            />
            <Text style={[styles.growthText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
              {isPositive ? '+' : ''}{formatCurrency(growth, data?.currency || 'EUR')} ({Math.abs(growthPercentage).toFixed(1)}%)
            </Text>
          </View>
        </View>

        <View style={styles.periodInfo}>
          <Text style={styles.periodLabel}>
            {TIME_RANGES.find(r => r.value === selectedRange)?.label} Period
          </Text>
          <Text style={styles.dataPoints}>
            {displayData.length} data points
          </Text>
        </View>
      </LinearGradient>

      {/* Full-Width Chart Section */}
      <View style={styles.chartSection}>
        <LineChart
          data={processedData}
          width={screenWidth}
          height={240}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier={true}
          withDots={false}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          segments={0}
        />
        
        {/* Gradient overlay for premium effect */}
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.1)', 'transparent']}
          style={styles.chartOverlay}
          pointerEvents="none"
        />
      </View>

      {/* Enhanced Time Range Selector */}
      <View style={styles.selectorContainer}>
        <View style={styles.buttonContainer}>
          {TIME_RANGES.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.button,
                selectedRange === range.value && styles.buttonActive,
              ]}
              onPress={() => setSelectedRange(range.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedRange === range.value && styles.buttonTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueSection: {
    flex: 1,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -1,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  periodInfo: {
    alignItems: 'flex-end',
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dataPoints: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chartSection: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  chart: {
    marginLeft: 0,
    paddingLeft: 0,
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonTextActive: {
    color: '#111827',
  },
  loadingContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 12,
  },
  noDataContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default ModernNetWorthChart;
