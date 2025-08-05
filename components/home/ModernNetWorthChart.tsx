// components/home/ModernNetWorthChart.tsx
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
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { formatCurrency } from '@/utils/utils';
import { Theme } from '@/lib/supabase';

const { width: screenWidth } = Dimensions.get('window');

interface TimeRange {
  label: string;
  value: number | string;
}

const TIME_RANGES: TimeRange[] = [
  { label: '1M', value: 1 },
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '1Y', value: 12 },
  { label: 'All', value: 'all' },
];

interface ChartDataPoint {
  label: string;
  value: number;
}

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

interface TooltipData {
  label: string;
  value: number;
  assets: number;
  liabilities: number;
}

interface ModernNetWorthChartProps {
  chartData?: ChartDataPoint[];
  netWorthData?: NetWorthData;
}

const ModernNetWorthChart: React.FC<ModernNetWorthChartProps> = ({ chartData, netWorthData }) => {
  const [selectedRange, setSelectedRange] = useState<string>('6M');
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Get the currency from the data, with a fallback
  const currency = netWorthData?.currency || 'EUR';

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.colors.background.card,
    backgroundGradientTo: theme.colors.background.card,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
    labelColor: (opacity = 1) => theme.colors.text.secondary.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
      fill: theme.colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.colors.border.primary,
      strokeWidth: 1,
    },
  };

  const processChartData = () => {
    const line_color = (opacity = 1) => theme.colors.primary.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
    if (!chartData || chartData.length === 0) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0],
          color: line_color,
          strokeWidth: 3,
        }],
      };
    }

    return {
      labels: chartData.slice(-6).map(item => item.label),
      datasets: [{
        data: chartData.slice(-6).map(item => item.value),
        color: line_color,
        strokeWidth: 3,
      }],
    };
  };

  const handleDataPointClick = (data: { index: number; value: number }): void => {
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
            {netWorthData ? formatCurrency(netWorthData.totalNetWorth, currency) : formatCurrency(0, currency)}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  currentValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  assetsText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  liabilitiesText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: screenWidth - 80,
    marginTop: theme.spacing.sm,
  },
  xAxisLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  timeRangeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: theme.colors.background.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  tooltipValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  tooltipBreakdown: {
    alignItems: 'center',
  },
  tooltipAssets: {
    fontSize: 14,
    color: theme.colors.asset,
    marginBottom: theme.spacing.xs,
  },
  tooltipLiabilities: {
    fontSize: 14,
    color: theme.colors.liability,
  },
});

export default ModernNetWorthChart;
