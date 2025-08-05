// components/home/AssetsLiabilitiesSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useTheme } from '../../src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';


interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

interface AssetsLiabilitiesSectionProps {
  netWorthData?: NetWorthData;
}

const AssetsLiabilitiesSection: React.FC<AssetsLiabilitiesSectionProps> = ({ netWorthData }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
            tintColor={theme.colors.asset}
            backgroundColor={theme.colors.background.tertiary}
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
            tintColor={theme.colors.liability}
            backgroundColor={theme.colors.background.tertiary}
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

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
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
    color: theme.colors.text.primary,
  },
  chartLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
});

export default AssetsLiabilitiesSection;
