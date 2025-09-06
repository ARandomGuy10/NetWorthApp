import React, {useMemo, useState, useEffect} from 'react';

import {View, Text, StyleSheet, FlatList, LayoutChangeEvent, ScrollView, Pressable} from 'react-native';

import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  Layout as ReLayout,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';

import {NetWorthHistoryInsights, MonthlyDelta} from '@/lib/supabase';
import {formatSmartNumber} from '@/src/utils/formatters';
import {useTheme} from '@/src/styles/theme/ThemeContext';

type Measure = 'percent' | 'amount';
type SortMode = 'chronological' | 'best' | 'worst';

interface Props {
  insights: NetWorthHistoryInsights;
  currency: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Chip = ({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);
  const scale = useSharedValue(1);
  const rStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.96, {damping: 18, stiffness: 220}))}
      onPressOut={() => (scale.value = withSpring(1, {damping: 18, stiffness: 220}))}
      hitSlop={8}
      style={[
        styles.chip,
        rStyle,
        {
          backgroundColor: active ? theme.colors.interactive.pressed : theme.colors.background.secondary,
          borderColor: active ? theme.colors.border.focus || theme.colors.border.primary : theme.colors.border.primary,
        },
      ]}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs}}>
        {icon ? (
          <Ionicons
            name={icon}
            size={theme.fontSizes.body}
            color={active ? theme.colors.text.primary : theme.colors.text.secondary}
          />
        ) : null}
        <Text
          style={[
            styles.chipText,
            {
              color: active ? theme.colors.text.primary : theme.colors.text.secondary,
              fontSize: theme.fontSizes.caption,
            },
          ]}>
          {label}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const Badge = ({icon, text, tint}: {icon: keyof typeof Ionicons.glyphMap; text: string; tint?: string}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);
  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: theme.colors.interactive.hover, borderColor: theme.colors.border.primary},
      ]}>
      <Ionicons name={icon} size={theme.fontSizes.body} color={tint || theme.colors.text.secondary} />
      <Text style={[styles.badgeText, {color: theme.colors.text.secondary}]}>{text}</Text>
    </View>
  );
};

const Row = ({
  item,
  idx,
  maxAbsDelta,
  maxAbsPercent,
  measure,
  currency,
  isBest,
  isWorst,
}: {
  item: MonthlyDelta;
  idx: number;
  maxAbsDelta: number;
  maxAbsPercent: number;
  measure: Measure;
  currency: string;
  isBest: boolean;
  isWorst: boolean;
}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // measure-aware value and ratio
  const value = measure === 'percent' ? item.percent : item.delta;
  const maxAbs = measure === 'percent' ? maxAbsPercent : maxAbsDelta;
  const rawRatio = maxAbs === 0 ? 0 : Math.min(Math.abs(value) / maxAbs, 1);
  const ratio = rawRatio > 0 && rawRatio < 0.04 ? 0.04 : rawRatio; // keep tiny changes visible

  const sign = value > 0 ? 'pos' : value < 0 ? 'neg' : 'zero';

  const trackW = useSharedValue(0);
  const progress = useSharedValue(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackW.value = e.nativeEvent.layout.width;
    progress.value = withTiming(ratio, {duration: 350, easing: Easing.out(Easing.cubic)});
  };

  useEffect(() => {
    progress.value = withTiming(ratio, {duration: 350, easing: Easing.out(Easing.cubic)});
  }, [ratio]);

  const barStyle = useAnimatedStyle(() => ({width: trackW.value * progress.value}));

  const month = new Date(item.month).toLocaleDateString('en', {month: 'short', year: '2-digit'});

  const rightValue =
    measure === 'percent'
      ? `${value >= 0 ? '+' : ''}${Math.abs(item.percent) < 10 ? item.percent.toFixed(1) : Math.round(item.percent)}%`
      : `${value >= 0 ? '+' : ''}${formatSmartNumber(item.delta, currency)}`;

  const valueColor =
    sign === 'pos' ? theme.colors.success : sign === 'neg' ? theme.colors.error : theme.colors.text.tertiary;

  const fillColors =
    sign === 'pos'
      ? theme.colors.gradient?.success || [theme.colors.asset, theme.colors.asset, theme.colors.asset]
      : sign === 'neg'
        ? theme.colors.gradient?.error || [theme.colors.liability, theme.colors.liability, theme.colors.liability]
        : [theme.colors.background.tertiary, theme.colors.background.tertiary, theme.colors.background.tertiary];

  const tagIcon = isBest ? 'rocket-outline' : isWorst ? 'trending-down-outline' : undefined;
  const tagTint = isBest ? theme.colors.success : isWorst ? theme.colors.error : theme.colors.text.secondary;

  return (
    <Animated.View
      entering={FadeInUp.delay(idx * 25)}
      layout={ReLayout.springify().damping(18).stiffness(170)}
      style={{marginBottom: theme.spacing.lg}}>
      {/* Row header */}
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1}}>
          <Text style={{color: theme.colors.text.primary, fontWeight: '700', fontSize: theme.fontSizes.body}}>
            {month}
          </Text>
          {tagIcon ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.xs / 2,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs / 2,
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.colors.interactive.hover,
              }}>
              <Ionicons name={tagIcon} size={theme.fontSizes.caption} color={tagTint} />
              <Text style={{color: tagTint, fontSize: theme.fontSizes.caption, fontWeight: '700'}}>
                {isBest ? 'Best' : 'Worst'}
              </Text>
            </View>
          ) : null}
        </View>
        <Animated.View entering={FadeInUp.duration(150)}>
          <Text
            style={{
              minWidth: theme.spacing.xxxl * 3,
              textAlign: 'right',
              fontSize: theme.fontSizes.subtitle,
              fontWeight: '800',
              color: valueColor,
            }}
            numberOfLines={1}>
            {rightValue}
          </Text>
        </Animated.View>
      </View>

      {/* Track with animated gradient fill */}
      <View
        onLayout={onTrackLayout}
        style={{
          height: theme.spacing.md,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.background.tertiary,
          overflow: 'hidden',
        }}>
        {sign !== 'zero' ? (
          <Animated.View
            style={[{height: '100%', borderRadius: theme.borderRadius.full, overflow: 'hidden'}, barStyle]}>
            <LinearGradient colors={fillColors} start={{x: 0, y: 0.5}} end={{x: 1, y: 0.5}} style={{flex: 1}} />
          </Animated.View>
        ) : null}
      </View>

      <Text style={{marginTop: theme.spacing.xs, color: theme.colors.text.tertiary, fontSize: theme.fontSizes.caption}}>
        Change · {measure === 'percent' ? 'Percent' : 'Amount'}
      </Text>
    </Animated.View>
  );
};

const MonthlyPerformanceOverview: React.FC<Props> = ({insights, currency}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const [measure, setMeasure] = useState<Measure>('percent');
  const [sortMode, setSortMode] = useState<SortMode>('chronological');
  const [showVolInfo, setShowVolInfo] = useState(false);

  const months = useMemo(() => {
    const src = [...insights.monthlyDeltas];
    switch (sortMode) {
      case 'best':
        return src.sort((a, b) => (measure === 'percent' ? b.percent - a.percent : b.delta - a.delta));
      case 'worst':
        return src.sort((a, b) => (measure === 'percent' ? a.percent - b.percent : a.delta - b.delta));
      case 'chronological':
      default:
        return src;
    }
  }, [insights.monthlyDeltas, sortMode, measure]);

  const maxAbsDelta = useMemo(
    () => Math.max(...insights.monthlyDeltas.map(m => Math.abs(m.delta)), 0),
    [insights.monthlyDeltas]
  );
  const maxAbsPercent = useMemo(
    () => Math.max(...insights.monthlyDeltas.map(m => Math.abs(m.percent)), 0),
    [insights.monthlyDeltas]
  );

  const vol = insights.volatility.stddevPercent;
  const volLevel = vol > 20 ? 'High' : vol > 10 ? 'Moderate' : 'Low';
  const volTint =
    vol > 20 ? theme.colors.error : vol > 10 ? theme.colors.warning : theme.colors.info || theme.colors.asset;

  const onToggle = (fn: (v: any) => void, v: any) => {
    fn(v);
    Haptics.selectionAsync();
  };

  const sectionGap = theme.spacing.lg;
  const rowGap = theme.spacing.sm;

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors.gradient.card} style={styles.card}>
        <Text style={styles.title}>Monthly Performance Overview</Text>

        {/* 1) Badges */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: rowGap}}
          style={{marginBottom: sectionGap}}>
          <Badge icon="repeat-outline" text={`Streak: ${insights.growthStreak.current_streak} mo`} />
          <Pressable onPress={() => onToggle(setShowVolInfo, !showVolInfo)} hitSlop={8}>
            <Badge icon="pulse-outline" text={`Volatility σ: ${vol.toFixed(1)}% (${volLevel})`} tint={volTint} />
          </Pressable>
          <Badge icon="trophy-outline" text={`ATH ${insights.highs.isAtAllTimeHigh ? '✅' : '❌'}`} />
        </ScrollView>

        {showVolInfo ? (
          <Text
            style={{color: theme.colors.text.tertiary, fontSize: theme.fontSizes.caption, marginBottom: sectionGap}}>
            Volatility σ is the standard deviation of monthly percentage changes, indicating typical variability
            month‑to‑month.
          </Text>
        ) : null}

        {/* 2) Measure */}
        <View style={{flexDirection: 'row', gap: rowGap, marginBottom: rowGap}}>
          <Chip
            label="Percent"
            active={measure === 'percent'}
            onPress={() => onToggle(setMeasure, 'percent')}
            icon="stats-chart-outline"
          />
          <Chip
            label="Amount"
            active={measure === 'amount'}
            onPress={() => onToggle(setMeasure, 'amount')}
            icon="cash-outline"
          />
        </View>

        {/* 3) Sorting */}
        <View style={{flexDirection: 'row', gap: rowGap, marginBottom: sectionGap}}>
          <Chip
            label="Chrono"
            active={sortMode === 'chronological'}
            onPress={() => onToggle(setSortMode, 'chronological')}
            icon="time-outline"
          />
          <Chip
            label="Best"
            active={sortMode === 'best'}
            onPress={() => onToggle(setSortMode, 'best')}
            icon="trending-up-outline"
          />
          <Chip
            label="Worst"
            active={sortMode === 'worst'}
            onPress={() => onToggle(setSortMode, 'worst')}
            icon="trending-down-outline"
          />
        </View>

        {/* List */}
        <FlatList
          data={months}
          keyExtractor={m => m.month}
          extraData={{measure, maxAbsDelta, maxAbsPercent, sortMode}}
          renderItem={({item, index}) => (
            <Row
              item={item}
              idx={index}
              maxAbsDelta={maxAbsDelta}
              maxAbsPercent={maxAbsPercent}
              measure={measure}
              currency={currency}
              isBest={item.month === insights.extremes.biggestGain.month}
              isWorst={item.month === insights.extremes.biggestDrop.month}
            />
          )}
          scrollEnabled={false}
          contentContainerStyle={{paddingBottom: theme.spacing.xl, paddingTop: rowGap}}
        />
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
    },
    title: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xl,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    chipText: {fontWeight: '700'},
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    badgeText: {fontWeight: '700', fontSize: theme.fontSizes.caption},
    card: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      width: '100%',
      ...(theme.shadows?.md || {}),
    },
  });

export default MonthlyPerformanceOverview;
