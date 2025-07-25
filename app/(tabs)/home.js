import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSupabase } from '../../hooks/useSupabase';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { getCurrentUserProfile } from '../../src/services/profileService';
import NetWorthSummaryCard from '../../components/home/NetWorthSummaryCard';
import NetWorthChart from '../../components/home/NetWorthChart';
import QuickActions from '../../components/home/QuickActions';
import HomeFAB from '../../components/home/HomeFAB';
import HomeHeader from '../../components/home/HomeHeader';
import { 
  getNetWorthData, 
  getNetWorthHistory, 
  getDailyNetWorthChange
} from '../../src/services/dashboardService';
import { colors, spacing } from '../../src/styles/colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const supabase = useSupabase();
  const userId = useCurrentUserId();
  
  const [profile, setProfile] = useState(null);
  const [netWorthData, setNetWorthData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dailyChange, setDailyChange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
      setDailyChange(change);
      
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

  const toggleFab = () => {
    const toValue = fabVisible ? 0 : 1;
    
    Animated.parallel([
      Animated.timing(fabRotation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: fabVisible ? 1 : 0.9,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    setFabVisible(!fabVisible);
  };

  const closeFab = () => {
        if (fabVisible) {
      Animated.parallel([
        Animated.timing(fabRotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      setFabVisible(false);
    }
  };

  const handleFabAction = (action) => {
      if (action === 'account') {
        router.push('/add-account');
      } else if (action === 'balance') {
        router.push('/add-balance');
      }
      closeFab();
  };

  // Create PanResponder to handle touches outside FAB
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => fabVisible,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      closeFab();
    },
  });

  const getNetWorthTrend = () => {
    if (!chartData || chartData.length < 2) return null;
    
    const current = chartData[chartData.length - 1].y;
    const previous = chartData[chartData.length - 2].y;
    const change = current - previous;
    const percentChange = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;
    
    return {
      change,
      percentChange,
      isPositive: change >= 0
    };
  };

  const trend = getNetWorthTrend();

  if (loading || !supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}
      {...panResponder.panHandlers}
    >
      <HomeHeader profile={profile} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <NetWorthSummaryCard netWorthData={netWorthData} trend={trend} />

        <NetWorthChart 
          chartData={chartData} 
          netWorthData={netWorthData} 
          setSelectedDataPoint={setSelectedDataPoint} 
          router={router} 
        />

        <QuickActions netWorthData={netWorthData} />

        {/* Bottom spacing for FAB */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

       <HomeFAB 
        fabVisible={fabVisible}
        toggleFab={toggleFab}
        closeFab={closeFab}
        handleFabAction={handleFabAction}
        fabRotation={fabRotation}
        fabScale={fabScale}
      />

    </Animated.View>
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
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});