import React, {useMemo, useState, useEffect} from 'react';

import {FlatList, View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent, Pressable} from 'react-native';

import {useRouter} from 'expo-router';

import * as Haptics from 'expo-haptics';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MonthlyHeatmap from '@/components/analytics/MonthlyHeatmap';
import MonthlyInsights from '@/components/analytics/MonthlyInsights';
import MonthlyPerformanceOverview from '@/components/analytics/MonthlyPerformanceOverview';
import {useHaptics} from '@/hooks/useHaptics';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useTheme} from '@/src/styles/theme/ThemeContext';

type Period = '3M' | '6M' | '12M' | 'ALL';
const periods: Period[] = ['3M', '6M', '12M', 'ALL'];

const MonthlyChangesScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();

  // Default period
  const defaultPeriod: Period = '6M';
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(defaultPeriod);

  // Data
  const {data: historyData, isLoading} = useNetWorthHistory({period: selectedPeriod});

  const styles = getStyles(theme);

  // Back
  const onBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  // Segmented control
  const indicatorX = useSharedValue(0);
  const segmentW = useSharedValue(0);
  const [segWidth, setSegWidth] = useState(0);
  const [measured, setMeasured] = useState(false);

  const onSegmentsLayout = (e: LayoutChangeEvent) => {
    const total = e.nativeEvent.layout.width;
    const w = total / periods.length;
    segmentW.value = w;
    setSegWidth(w);
    setMeasured(true);
    // Place under current selection immediately (prevents "3M" flash)
    indicatorX.value = withTiming(w * periods.indexOf(selectedPeriod), {duration: 0});
  };

  // Keep indicator synced if layout or selection changes
  useEffect(() => {
    if (segWidth > 0) {
      indicatorX.value = withTiming(segWidth * periods.indexOf(selectedPeriod), {duration: 0});
    }
  }, [segWidth, selectedPeriod]);

  const moveIndicator = (idx: number) => {
    indicatorX.value = withTiming(segmentW.value * idx, {duration: 240, easing: Easing.out(Easing.cubic)});
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: indicatorX.value}],
    width: segmentW.value,
    opacity: measured ? 1 : 0,
  }));

  const handlePeriodChange = (period: Period) => {
    const idx = periods.indexOf(period);
    moveIndicator(idx);
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

  // Header
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

        {/* Segmented control */}
        <View style={styles.segmentedWrap} onLayout={onSegmentsLayout}>
          <Animated.View style={[styles.segmentIndicator, indicatorStyle]} />
          {periods.map(p => {
            const active = selectedPeriod === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => handlePeriodChange(p)}
                style={styles.segmentBtn}
                activeOpacity={0.9}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{p === 'ALL' ? 'All' : p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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

// Styles
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background.primary},
    contentContainer: {paddingBottom: theme.spacing.xxxl * 3},
    headerGradient: {
      paddingHorizontal: theme.spacing.lg,
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
    segmentedWrap: {
      marginTop: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 3},
      elevation: 6,
    },
    segmentIndicator: {
      position: 'absolute',
      top: theme.spacing.xs,
      bottom: theme.spacing.xs,
      left: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: theme.spacing.xs + 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentText: {fontSize: theme.fontSizes.body, fontWeight: '700', color: theme.colors.text.secondary},
    segmentTextActive: {color: theme.colors.text.onPrimary || '#fff'},
    separator: {height: theme.spacing.xl},
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    loadingText: {fontSize: theme.fontSizes.body, color: theme.colors.text.secondary},
  });

export default MonthlyChangesScreen;
