import React, {useMemo, useState, useEffect} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  LayoutChangeEvent,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
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
type SortOption = 'chrono' | 'best_percent' | 'worst_percent' | 'best_amount' | 'worst_amount';

interface Props {
  insights: NetWorthHistoryInsights;
  currency: string;
  period: string;
}

const getSortLabel = (sortBy: SortOption): string => {
  const labels: Record<SortOption, string> = {
    chrono: 'Chronological',
    best_percent: 'Best %',
    worst_percent: 'Worst %',
    best_amount: 'Best Amount',
    worst_amount: 'Worst Amount',
  };
  return labels[sortBy] || 'Chronological';
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
      // layout={ReLayout.springify().damping(18).stiffness(170)} // Layout animation can be buggy with FlatList
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
    </Animated.View>
  );
};

const MonthlyPerformanceOverview: React.FC<Props> = ({insights, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const [sortBy, setSortBy] = useState<SortOption>('chrono');
  const [showVolInfo, setShowVolInfo] = useState(false);

  const handleSortChange = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const options: SortOption[] = ['chrono', 'best_percent', 'worst_percent', 'best_amount', 'worst_amount'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const months = useMemo(() => {
    const src = [...insights.monthlyDeltas];
    switch (sortBy) {
      case 'best_percent':
        return src.sort((a, b) => b.percent - a.percent);
      case 'worst_percent':
        return src.sort((a, b) => a.percent - b.percent);
      case 'best_amount':
        return src.sort((a, b) => b.delta - a.delta);
      case 'worst_amount':
        return src.sort((a, b) => a.delta - b.delta);
      case 'chrono':
      default:
        return src.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    }
  }, [insights.monthlyDeltas, sortBy]);

  const measure: Measure = sortBy.endsWith('amount') ? 'amount' : 'percent';

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

  const sectionGap = theme.spacing.lg;
  const rowGap = theme.spacing.sm;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient?.card || [theme.colors.background.card, theme.colors.background.elevated]}
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.headerTop}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Monthly Performance</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{period === 'ALL' ? 'All Time' : period}</Text>
              </View>
              <Text style={styles.subtitle}>• Ranked by {getSortLabel(sortBy).toLowerCase()}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSortChange} style={styles.sortButton} activeOpacity={0.7}>
            <Ionicons name="swap-vertical" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.sortButtonText}>{getSortLabel(sortBy)}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* List */}
        <View style={styles.listWrapper}>
          {months.map((item, index) => (
            <Row
              key={item.month}
              item={item}
              idx={index}
              maxAbsDelta={maxAbsDelta}
              maxAbsPercent={maxAbsPercent}
              measure={measure}
              currency={currency}
              isBest={!!insights.extremes.biggestGain && item.month === insights.extremes.biggestGain.month}
              isWorst={!!insights.extremes.biggestDrop && item.month === insights.extremes.biggestDrop.month}
            />
          ))}

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    badgeText: {fontWeight: '700', fontSize: theme.fontSizes.caption, color: theme.colors.text.secondary},
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    titleSection: {
      flex: 1,
    },
    title: {
      fontSize: theme.fontSizes.title,
      fontWeight: '800',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    periodBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.xs,
    },
    periodText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      color: theme.colors.text.onPrimary,
    },
    subtitle: {
      fontSize: theme.fontSizes.caption,
      color: theme.colors.text.tertiary,
      fontWeight: '500',
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    sortButtonText: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
    },
    contentContainer: {
      maxHeight: 400, // Make the list scrollable if content exceeds this height
    },
    listWrapper: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    bottomSpacing: {
      height: theme.spacing.xl,
    },
    chip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    chipText: {
      fontWeight: '700',
      color: theme.colors.text.secondary,
      fontSize: theme.fontSizes.caption,
    },
  });

export default MonthlyPerformanceOverview;
