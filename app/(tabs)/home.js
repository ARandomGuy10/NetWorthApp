import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSupabase } from '../../hooks/useSupabase';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { getCurrentUserProfile } from '../../src/services/profileService';
import { 
  getNetWorthData, 
  getNetWorthHistory, 
  getDailyNetWorthChange
} from '../../src/services/dashboardService';
import { colors, spacing } from '../../src/styles/colors';

// Import new modern components
import ModernHomeHeader from '../../components/home/ModernHomeHeader';
import ModernNetWorthChart from '../../components/home/ModernNetWorthChart';
import AssetsLiabilitiesSection from '../../components/home/AssetsLiabilitiesSection';
import AccountsList from '../../components/home/AccountsList';
import ModernFAB from '../../components/home/ModernFAB';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const supabase = useSupabase();
  const userId = useCurrentUserId();
  
  const [profile, setProfile] = useState(null);
  const [netWorthData, setNetWorthData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load user profile and dashboard data in parallel
      const [userProfile, netWorth, history, change] = await Promise.all([
        getCurrentUserProfile(supabase, userId),
        getNetWorthData(supabase, 'EUR'),
        getNetWorthHistory(supabase, 'EUR'),
        getDailyNetWorthChange(supabase, 'EUR')
      ]);

      setProfile(userProfile);
      setNetWorthData(netWorth);
      setTrend(change);
      
      console.log('Trend:', trend);
      
      // Process chart data
      if (history && history.length > 0) {
        const processedData = processChartData(history);
        setChartData(processedData);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (supabase && userId) {
      loadDashboardData();
    }
  }, [supabase, userId, loadDashboardData]);

  const processChartData = (history) => {
    if (!history || history.length === 0) return null;

    return history.map((item, index) => ({
      x: index + 1,
      y: item.value,
      label: item.month,
      date: item.date,
      value: item.value
    }));
  };

  const onRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  if (loading || !supabase) {
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

        <AccountsList netWorthData={netWorthData} />

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