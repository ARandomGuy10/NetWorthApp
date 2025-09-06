// components/analytics/MonthlyHeatmap.tsx — FIXED hooks + polished UI

import React, {memo, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, FlatList} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {Extremes, MonthlyDelta} from '@/lib/supabase';

interface Props {
  monthlyDeltas: MonthlyDelta[];
  extremes?: Extremes;
  currency: string;
  period?: '3M' | '6M' | '12M' | 'ALL';
}

const APressable = Animated.createAnimatedComponent(Pressable);

// Child component so hooks live inside a real component (not inside renderItem)
const HeatmapCell = memo(function HeatmapCell({
  item,
  index,
  currency,
  posText,
  negText,
  theme,
  intensity, // 0..1
  isBest,
  isWorst,
}: {
  item: MonthlyDelta;
  index: number;
  currency: string;
  posText: string;
  negText: string;
  theme: any;
  intensity: number;
  isBest: boolean;
  isWorst: boolean;
}) {
  const entering = FadeInUp.springify()
    .mass(0.6)
    .stiffness(180)
    .damping(20)
    .delay(index * 40);

  // Press micro interaction + haptic
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
  const onPressIn = () => {
    scale.value = withTiming(0.98, {duration: 100, easing: Easing.out(Easing.quad)});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => {
    scale.value = withTiming(1, {duration: 120, easing: Easing.out(Easing.quad)});
  };

  // Pulse for best/worst badge
  const pulse = useSharedValue(1);
  const badgeStyle = useAnimatedStyle(() => ({transform: [{scale: pulse.value}]}));
  useEffect(() => {
    if (isBest || isWorst) {
      pulse.value = withRepeat(withTiming(1.06, {duration: 1200}), -1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBest, isWorst]);

  const monthLabel = new Date(item.month).toLocaleDateString('en', {month: 'short'});

  const base = item.percent >= 0 ? theme.colors.success : theme.colors.error;
  const bgOpacity = 0.65 + 0.35 * intensity; // 0.65–1.0 vivid range
  const textColor = item.percent >= 0 ? posText : negText;

  return (
    <Animated.View entering={entering} style={{width: '32%', marginBottom: theme.spacing.sm}}>
      <APressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{color: 'rgba(255,255,255,0.22)', radius: 120}}
        style={[
          {
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 96,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: base,
            opacity: bgOpacity,
            borderColor: base,
            borderWidth: 1,
          },
          pressStyle,
          {overflow: 'visible'},
        ]}>
        {/* Accent overlay adds a soft, theme‑consistent glow */}
        <LinearGradient
          pointerEvents="none"
          colors={theme.colors.gradient.accent}
          style={[StyleSheet.absoluteFillObject, {opacity: 0.05 + 0.12 * intensity}]}
        />

        <Text style={{color: textColor, fontSize: theme.fontSizes.sm, fontWeight: '600', marginBottom: 2}}>
          {monthLabel}
        </Text>

        <Text
          style={{
            color: textColor,
            fontSize: theme.fontSizes.lg,
            fontWeight: '800',
            marginBottom: 2,
            lineHeight: theme.fontSizes.lg * 1.2,
          }}>
          {item.percent >= 0 ? '+' : ''}
          {Math.abs(item.percent) < 10 ? item.percent.toFixed(1) : Math.round(item.percent)}%
        </Text>

        <Text numberOfLines={1} adjustsFontSizeToFit style={{color: textColor, fontSize: theme.fontSizes.sm}}>
          {formatSmartNumber(item.delta, currency)}
        </Text>

        {(isBest || isWorst) && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -theme.spacing.xs,
                right: -theme.spacing.xs,
                backgroundColor: theme.colors.background.primary,
                borderRadius: theme.spacing.md,
                paddingHorizontal: 4,
                paddingVertical: 2,
                ...theme.shadows?.sm,
              },
              badgeStyle,
            ]}>
            <Text style={{fontSize: theme.fontSizes.sm}}>{isBest ? '🚀' : '📉'}</Text>
          </Animated.View>
        )}
      </APressable>
    </Animated.View>
  );
});

const MonthlyHeatmap: React.FC<Props> = ({monthlyDeltas, extremes, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // Keep grid consistent: cap ALL at 12
  const displayMonths = React.useMemo(() => {
    if (period === '3M') return monthlyDeltas.slice(-3);
    if (period === '6M') return monthlyDeltas.slice(-6);
    if (period === '12M' || period === 'ALL') return monthlyDeltas.slice(-12);
    return monthlyDeltas;
  }, [monthlyDeltas, period]);

  const POS_TEXT = theme.colors.text.onSuccess || '#FFFFFF';
  const NEG_TEXT = theme.colors.text.onError || '#FFFFFF';

  const maxAbs = Math.max(...displayMonths.map(d => Math.abs(d.percent)), 1);

  const renderItem = ({item, index}: {item: MonthlyDelta; index: number}) => {
    const intensity = Math.min(Math.abs(item.percent) / maxAbs, 1);
    const isBest = extremes?.biggestGain?.month === item.month;
    const isWorst = extremes?.biggestDrop?.month === item.month;

    return (
      <HeatmapCell
        item={item}
        index={index}
        currency={currency}
        posText={POS_TEXT}
        negText={NEG_TEXT}
        theme={theme}
        intensity={intensity}
        isBest={!!isBest}
        isWorst={!!isWorst}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors.gradient.card} style={styles.card}>
        <FlatList
          data={displayMonths}
          keyExtractor={m => m.month}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal: 0, paddingBottom: theme.spacing.md}}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          scrollEnabled={false}
        />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, {backgroundColor: theme.colors.success}]} />
            <Text style={styles.legendText}>Positive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, {backgroundColor: theme.colors.error}]} />
            <Text style={styles.legendText}>Negative</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendText}>🚀 Best</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendText}>📉 Worst</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingTop: theme.spacing.xl,
      paddingHorizontal: 0,
    },
    
    card: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      width: '100%',
      ...(theme.shadows?.md || {}),
    },
    legendRow: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.primary,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    legendItem: {flexDirection: 'row', alignItems: 'center'},
    dot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
    legendText: {fontSize: theme.fontSizes.caption, color: theme.colors.text.secondary},
  });

export default MonthlyHeatmap;
