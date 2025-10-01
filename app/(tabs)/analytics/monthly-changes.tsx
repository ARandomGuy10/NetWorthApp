import React, {useCallback, useState} from 'react';

import {View, StyleSheet, ScrollView, Text, TouchableOpacity, RefreshControl} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useQueryClient} from '@tanstack/react-query';

import MonthlyHeatmap from '@/components/analytics/monthly/MonthlyHeatmap';
import MonthlyInsights from '@/components/analytics/monthly/MonthlyInsights';
import MonthlyPerformanceOverview from '@/components/analytics/monthly/MonthlyPerformanceOverview';
import PeriodSelector from '@/components/ui/PeriodSelector';
import LoadingView from '@/components/ui/LoadingView';
import {Period} from '@/lib/supabase';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import EmptyState from '@/components/ui/EmptyState';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const MonthlyChangesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const queryClient = useQueryClient();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('6M');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {data: historyData, isLoading} = useNetWorthHistory({period: selectedPeriod});
  const styles = getStyles(theme, insets);

  const onBack = useCallback(() => {
    Haptics.selectionAsync();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/analytics/');
    }
  }, [router]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
    setIsRefreshing(false);
  }, [queryClient]);

  const handlePeriodChange = useCallback((period: Period) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(period);
  }, []);

  if (isLoading || !historyData) {
    return <LoadingView message="Loading monthly analysis..." />;
  }

  // Add a defensive check for insights. If they don't exist, show a static empty state.
  if (!historyData.insights) {
    return (
      <EmptyState
        icon="analytics-outline"
        title="Not Enough Data"
        message="We need at least two months of balance history to generate monthly insights."
        onActionPress={() => router.push('/(tabs)/accounts')}
        actionText="Add Balance History"
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        // Use a consistent background color for overscroll on iOS
        style={styles.scrollContent}
        contentContainerStyle={{paddingBottom: insets.bottom + 90}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}>
        <LinearGradient
          colors={theme.colors.gradient.header}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Monthly Changes</Text>

            {/* Invisible spacer to balance the layout */}
            <View style={styles.headerSpacer} />
          </View>
          {/* Period Selector */}
          <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
        </LinearGradient>

        {/* Monthly Heatmap */}
        <View style={styles.sectionContainer}>
          <MonthlyHeatmap
            monthlyDeltas={historyData.insights.monthlyDeltas}
            extremes={historyData.insights.extremes}
            currency={historyData.currency}
            period={selectedPeriod}
          />
        </View>

        {/* Monthly Performance Overview */}
        <View style={styles.sectionContainer}>
          <MonthlyPerformanceOverview
            insights={historyData.insights}
            currency={historyData.currency}
            period={selectedPeriod}
          />
        </View>

        {/* Monthly Insights */}
        <MonthlyInsights
          monthlyDeltas={historyData.insights.monthlyDeltas}
          extremes={historyData.insights.extremes}
          currency={historyData.currency}
          period={selectedPeriod}
        />
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },

    scrollContent: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },

    // ✅ Simplified header styling
    headerGradient: {
      paddingTop: insets.top + theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.text.primary,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    headerTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '800',
      color: theme.colors.text.onGradient,
      textAlign: 'center',
      letterSpacing: 0.5,
    },

    headerSpacer: {
      width: 44, // Same width as back button
    },

    // ✅ Consistent section spacing
    sectionContainer: {
      marginBottom: theme.spacing.xxl,
    },
  });

export default MonthlyChangesScreen;
