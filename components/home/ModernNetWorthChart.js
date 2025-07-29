import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius } from '../../src/styles/colors';
// Import the formatter
import { formatCurrency } from '../../src/services/dashboardService';

const { width: screenWidth } = Dimensions.get('window');

const TIME_RANGES = [
  { label: '1M', value: 1 },
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '1Y', value: 12 },
  { label: 'All', value: 'all' },
];

const ModernNetWorthChart = ({ chartData, netWorthData }) => {
  const [selectedRange, setSelectedRange] = useState('6M');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);

  // Get the currency from the data, with a fallback
  const currency = netWorthData?.currency || 'EUR';

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.background.card,
    backgroundGradientTo: colors.background.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(32, 227, 178, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
      fill: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border.primary,
      strokeWidth: 1,
    },
  };

  const processChartData = () => {
    if (!chartData || chartData.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0],
          color: (opacity = 1) => `rgba(32, 227, 178, ${opacity})`,
          strokeWidth: 3,
        }],
      };
    }

    return {
      labels: chartData.slice(-6).map(item => item.label),
      datasets: [{
        data: chartData.slice(-6).map(item => item.value),
        color: (opacity = 1) => `rgba(32, 227, 178, ${opacity})`,
        strokeWidth: 3,
      }],
    };
  };

  const handleDataPointClick = (data) => {
    const pointIndex = data.index;
    const value = data.value;
    const label = processChartData().labels[pointIndex];
    
    setTooltipData({
      label,
      value,
      assets: netWorthData?.totalAssets || 0,
      liabilities: netWorthData?.totalLiabilities || 0,
    });
    setTooltipVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Net Worth</Text>
        <View style={styles.currentValue}>
          {/* Use the formatCurrency function */}
          <Text style={styles.valueText}>
            {netWorthData ? formatCurrency(netWorthData.netWorth, currency) : formatCurrency(0, currency)}
          </Text>
          {/* The asset and liability counts have been removed */}
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={processChartData()}
          width={screenWidth - 40}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          onDataPointClick={handleDataPointClick}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          withDots={true}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
        />
        
        {/* Custom X-axis labels */}
        <View style={styles.xAxisLabels}>
          {processChartData().labels.map((label, index) => (
            <Text key={index} style={styles.xAxisLabel}>
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {TIME_RANGES.map((range) => (
          <TouchableOpacity
            key={range.label}
            style={[
              styles.timeRangeButton,
              selectedRange === range.label && styles.timeRangeButtonActive,
            ]}
            onPress={() => setSelectedRange(range.label)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedRange === range.label && styles.timeRangeTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={tooltipVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTooltipVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTooltipVisible(false)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>{tooltipData?.label}</Text>
            {/* Use the formatCurrency function in the tooltip */}
            <Text style={styles.tooltipValue}>
              {formatCurrency(tooltipData?.value || 0, currency)}
            </Text>
            <View style={styles.tooltipBreakdown}>
              <Text style={styles.tooltipAssets}>
                Assets: {formatCurrency(tooltipData?.assets || 0, currency)}
              </Text>
              <Text style={styles.tooltipLiabilities}>
                Liabilities: {formatCurrency(tooltipData?.liabilities || 0, currency)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  currentValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  assetsText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  liabilitiesText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: screenWidth - 80,
    marginTop: spacing.sm,
  },
  xAxisLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  timeRangeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tooltipValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  tooltipBreakdown: {
    alignItems: 'center',
  },
  tooltipAssets: {
    fontSize: 14,
    color: colors.asset,
    marginBottom: spacing.xs,
  },
  tooltipLiabilities: {
    fontSize: 14,
    color: colors.liability,
  },
});

export default ModernNetWorthChart;