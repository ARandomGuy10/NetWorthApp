import React, {useMemo, useState} from 'react';

import {FlatList, View, Text, StyleSheet, Pressable} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MonthlyHeatmap from '@/components/analytics/MonthlyHeatmap';
import MonthlyInsights from '@/components/analytics/MonthlyInsights';
import MonthlyPerformanceOverview from '@/components/analytics/MonthlyPerformanceOverview';
import PeriodSelector from '@/components/ui/PeriodSelector';
import {Period} from '@/lib/supabase';
import {useHaptics} from '@/hooks/useHaptics';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const MonthlyChangesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();

  // ✅ Updated to use proper Period type and default to 6M
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('6M');

  // Data
  const {data: historyData, isLoading} = useNetWorthHistory({period: selectedPeriod});

  const styles = getStyles(theme);

  // Back
  const onBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  // ✅ Simple period change handler
  const handlePeriodChange = (period: Period) => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(period);
  };

  const sections = useMemo(() => {
    if (!historyData) return [];
    return [
      {
        id: 'heatmap',
        render: () => (
          <MonthlyHeatmap
            monthlyDeltas={historyData.insights.monthlyDeltas}
            extremes={historyData.insights.extremes}
            currency={historyData.currency}
            period={selectedPeriod}
          />
        ),
      },
      {
        id: 'overview',
        render: () => <MonthlyPerformanceOverview insights={historyData.insights} currency={historyData.currency} />,
      },
      {
        id: 'insights',
        render: () => (
          <MonthlyInsights
            monthlyDeltas={historyData.insights.monthlyDeltas}
            extremes={historyData.insights.extremes}
            currency={historyData.currency}
            period={selectedPeriod}
          />
        ),
      },
    ] as const;
  }, [historyData, selectedPeriod]);

  // ✅ Simplified header with PeriodSelector
  const renderHeader = () => {
    const TOP = insets.top + theme.spacing.md;
    return (
      <LinearGradient
        colors={theme.colors.gradient?.header || [theme.colors.background.primary, theme.colors.background.secondary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.headerGradient, {paddingTop: TOP}]}>
        {/* Back */}
        <Pressable onPress={onBack} hitSlop={8} style={[styles.backBtn, {top: TOP}]}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.text.onGradient} />
        </Pressable>

        {/* Title */}
        <Text style={styles.headerTitle}>Monthly Changes</Text>

        {/* ✅ PeriodSelector replaces custom segmented control */}
        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
      </LinearGradient>
    );
  };

  if (isLoading || !historyData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading monthly analysis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sections as any}
        keyExtractor={(item: any) => item.id}
        renderItem={({item}: any) => item.render()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

// ✅ Simplified styles - removed all segmented control related styles
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background.primary},
    contentContainer: {paddingBottom: theme.spacing.xxxl * 3},
    headerGradient: {
      //paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 0,
    },
    backBtn: {
      position: 'absolute',
      left: theme.spacing.md,
      width: theme.spacing.xl + theme.spacing.lg,
      height: theme.spacing.xl + theme.spacing.lg,
      borderRadius: (theme.spacing.xl + theme.spacing.lg) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.interactive.hover,
      borderWidth: 0.5,
      borderColor: theme.colors.border.primary,
      zIndex: 10,
    },
    headerTitle: {
      textAlign: 'center',
      fontSize: theme.fontSizes.heading,
      fontWeight: '800',
      color: theme.colors.text.onGradient,
      letterSpacing: 0.2,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    // ✅ Simple styling for PeriodSelector
    periodSelector: {
      marginTop: theme.spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 3},
      elevation: 6,
    },
    separator: {height: theme.spacing.xl},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    loadingText: {fontSize: theme.fontSizes.body, color: theme.colors.text.secondary},
  });

export default MonthlyChangesScreen;
