import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ChartData {
  date: string;
  value: number;
}

interface NetWorthChartProps {
  data: ChartData[];
}

export function NetWorthChart({ data }: NetWorthChartProps) {
  const screenWidth = Dimensions.get('window').width;

  const chartData = {
    labels: data.length > 0 ? data.map(d => d.date) : ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        data: data.length > 0 ? data.map(d => d.value) : [80000, 85000, 95000, 110000, 115000, 123456],
        color: (opacity = 1) => `rgba(79, 209, 199, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#111827',
    backgroundGradientTo: '#111827',
    color: (opacity = 1) => `rgba(79, 209, 199, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '500',
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fill: '#9CA3AF',
    },
    propsForHorizontalLabels: {
      fontSize: 12,
      fill: '#9CA3AF',
    },
    fillShadowGradient: '#4FD1C7',
    fillShadowGradientOpacity: 0.3,
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={false}
        segments={4}
        formatYLabel={(value) => {
          const num = parseFloat(value);
          if (num >= 1000000) {
            return `$${(num / 1000000).toFixed(1)}M`;
          } else if (num >= 1000) {
            return `$${(num / 1000).toFixed(0)}k`;
          }
          return `$${num.toFixed(0)}`;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});