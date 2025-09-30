// screens/PerformanceScreen.tsx
import React, {useState, useCallback} from 'react';
import {ScrollView, StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';

import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import IntegratedDashboard_Wagmi from '@/components/home/IntegratedDashboard_Wagmi';
import KeyPerformanceMetrics from '@/components/analytics/performance/KeyPerformanceMetrics';
import PerformanceInsights from '@/components/analytics/performance/PerformanceInsights';
import LoadingView from '@/components/ui/LoadingView';

const PerformanceScreen: React.FC = () => {
  const {theme} = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ✅ Add state for period management
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('3M');

  // ✅ Use dynamic period instead of hardcoded '3M'
  const {data: historyData, isLoading, error} = useNetWorthHistory({period: selectedPeriod});

  const onBack = useCallback(() => {
    Haptics.selectionAsync();
    router.back();
  }, [router]);

  const styles = getStyles(theme, insets);

  if (isLoading || !historyData) {
    return <LoadingView message="Analyzing performance..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic">
        {/* ✅ Pass period handlers to chart */}

        <View style={styles.sectionContainer}>
          <IntegratedDashboard_Wagmi onPeriodChange={setSelectedPeriod} currentPeriod={selectedPeriod} />
        </View>

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

      {/* Overlay Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.overlayBackButton}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    overlayBackButton: {
      position: 'absolute',
      top: insets.top + theme.spacing.md,
      left: theme.spacing.lg,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${theme.colors.background.secondary}B3`, // Add some transparency
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderWidth: 1,
      borderColor: `${theme.colors.border.primary}99`,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxxl,
    },
    // ✅ Add proper section spacing
    sectionContainer: {
      marginBottom: theme.spacing.xxl, // ✅ Consistent spacing between sections
    },
  });

export default PerformanceScreen;
