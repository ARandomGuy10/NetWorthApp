import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../src/services/dashboardService';
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
} else {
  // Provide dummy components for web to prevent undefined errors
  const DummyComponent = () => null;
  VictoryChart = DummyComponent;
  VictoryLine = DummyComponent;
  VictoryArea = DummyComponent;
  VictoryAxis = DummyComponent;
  VictoryTooltip = DummyComponent;
  VictoryScatter = DummyComponent;
}

const { width: screenWidth } = Dimensions.get('window');

const NetWorthChart = ({ chartData, netWorthData, setSelectedDataPoint, router }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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

export default NetWorthChart;
