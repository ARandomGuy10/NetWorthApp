import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors, spacing, borderRadius } from '../../src/styles/colors';

const AssetsLiabilitiesSection = ({ netWorthData }) => {
  const totalValue = (netWorthData?.totalAssets || 0) + (netWorthData?.totalLiabilities || 0);
  const assetsPercentage = totalValue > 0 ? ((netWorthData?.totalAssets || 0) / totalValue) * 100 : 0;
  const liabilitiesPercentage = totalValue > 0 ? ((netWorthData?.totalLiabilities || 0) / totalValue) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assets & Liabilities</Text>
      
      <View style={styles.chartsContainer}>
        {/* Assets Circle */}
        <View style={styles.chartItem}>
          <AnimatedCircularProgress
            size={120}
            width={8}
            fill={assetsPercentage}
            tintColor={colors.asset}
            backgroundColor={colors.background.tertiary}
            rotation={0}
            lineCap="round"
          >
            {() => (
              <Text style={styles.percentageText}>
                {Math.round(assetsPercentage)}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.chartLabel}>Assets</Text>
        </View>

        {/* Liabilities Circle */}
        <View style={styles.chartItem}>
          <AnimatedCircularProgress
            size={120}
            width={8}
            fill={liabilitiesPercentage}
            tintColor={colors.liability}
            backgroundColor={colors.background.tertiary}
            rotation={0}
            lineCap="round"
          >
            {() => (
              <Text style={styles.percentageText}>
                {Math.round(liabilitiesPercentage)}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.chartLabel}>Liabilities</Text>
        </View>
      </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  chartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  chartItem: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  chartLabel: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontWeight: '500',
  },
});

export default AssetsLiabilitiesSection;