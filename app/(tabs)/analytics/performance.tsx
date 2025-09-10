// screens/PerformanceScreen.tsx
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import IntegratedDashboard_Wagmi from '@/components/home/IntegratedDashboard_Wagmi';
import KeyPerformanceMetrics from '@/components/analytics/performance/KeyPerformanceMetrics';
import PerformanceInsights from '@/components/analytics/performance/PerformanceInsights';

const PerformanceScreen: React.FC = () => {
  const {theme} = useTheme();

  // ✅ Add state for period management
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('3M');

  // ✅ Use dynamic period instead of hardcoded '3M'
  const {data: historyData, isLoading, error} = useNetWorthHistory({period: selectedPeriod});

  const styles = getStyles(theme);

  if (isLoading || !historyData) {
    return <View style={styles.container}>{/* Loading state */}</View>;
  }

  return (
    <SafeAreaView style={styles.container} >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* ✅ Pass period handlers to chart */}
        
        <IntegratedDashboard_Wagmi onPeriodChange={setSelectedPeriod} currentPeriod={selectedPeriod} />

        {historyData?.insights && (
          <>
            {/* ✅ Add section spacing */}
            <View style={styles.sectionContainer}>
              <KeyPerformanceMetrics
                insights={historyData.insights}
                currency={historyData.currency}
                period={selectedPeriod}
              />
            </View>

              <PerformanceInsights
                insights={historyData.insights}
                currency={historyData.currency}
                period={selectedPeriod}
              />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxxl,
    },
    // ✅ Add proper section spacing
    sectionContainer: {
      marginTop: theme.spacing.xxl,
    },
  });

export default PerformanceScreen;
