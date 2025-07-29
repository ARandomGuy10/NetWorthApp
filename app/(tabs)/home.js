import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Import the custom hook from our Financial Data Context
import { useFinancialData } from '../../hooks/context/FinancialDataContext';

// Import modern components
import ModernHomeHeader from '../../components/home/ModernHomeHeader';
import ModernNetWorthChart from '../../components/home/ModernNetWorthChart';
import AssetsLiabilitiesSection from '../../components/home/AssetsLiabilitiesSection';
import AccountsList from '../../components/home/AccountsList';
import ModernFAB from '../../components/home/ModernFAB';
import { colors } from '../../src/styles/colors';

export default function HomeScreen() {
  console.log('Inside HomeScreen');
  const insets = useSafeAreaInsets();

  // Consume data and functions from the FinancialDataContext
  const {
    profile,
    netWorthData,
    chartData,
    trend,
    accounts,
    loading,
    refreshing,
    dataDirty,
    loadAllFinancialData,
  } = useFinancialData();

  useFocusEffect(
    useCallback(() => {
      if (dataDirty) {
        loadAllFinancialData(true);
      }
    }, [dataDirty, loadAllFinancialData])
  );

  const onRefresh = useCallback(() => {
    loadAllFinancialData(true);
  }, [loadAllFinancialData]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ModernHomeHeader 
          profile={profile} 
          netWorthData={netWorthData} 
          trend={trend} 
        />

        <ModernNetWorthChart 
          chartData={chartData} 
          netWorthData={netWorthData} 
        />

        <AssetsLiabilitiesSection netWorthData={netWorthData} />

        <AccountsList accounts={accounts} />

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <ModernFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 120,
  },
});