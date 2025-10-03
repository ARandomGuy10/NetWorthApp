// components/analytics/MonthlyHeatmap.tsx

import React, {memo, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, FlatList} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import {Extremes, MonthlyDelta} from '@/lib/supabase';
import {Star, AlertTriangle} from 'lucide-react-native';

interface Props {
  monthlyDeltas: MonthlyDelta[];
  extremes?: Extremes | null;
  currency: string;
  period?: string;
}

const AnimatedWrapper = Animated.createAnimatedComponent(View);

// Handle zero values with neutral colors
const getConsistentCardStyle = (percent: number, intensity: number, theme: any) => {
  if (percent === 0) {
    return {
      backgroundGradient: [
        `${theme.colors.text.secondary}15`,
        `${theme.colors.text.secondary}08`,
        `${theme.colors.text.secondary}05`,
      ] as const,
      borderColor: `${theme.colors.border.primary}60`,
      textColor: theme.colors.text.primary,
      accentColor: theme.colors.text.secondary,
    };
  }

  const isPositive = percent > 0;

  if (isPositive) {
    return {
      backgroundGradient: [
        `#22C55E${Math.floor(15 + intensity * 25)
          .toString(16)
          .padStart(2, '0')}`,
        `#DCFCE7${Math.floor(10 + intensity * 15)
          .toString(16)
          .padStart(2, '0')}`,
        `#DCFCE705`,
      ] as const,
      borderColor: `#22C55E${Math.floor(40 + intensity * 40)
        .toString(16)
        .padStart(2, '0')}`,
      textColor: theme.colors.text.primary,
      accentColor: '#22C55E',
    };
  } else {
    return {
      backgroundGradient: [
        `#EF4444${Math.floor(15 + intensity * 25)
          .toString(16)
          .padStart(2, '0')}`,
        `#FEE2E2${Math.floor(10 + intensity * 15)
          .toString(16)
          .padStart(2, '0')}`,
        `#FEE2E205`,
      ] as const,
      borderColor: `#EF4444${Math.floor(40 + intensity * 40)
        .toString(16)
        .padStart(2, '0')}`,
      textColor: theme.colors.text.primary,
      accentColor: '#EF4444',
    };
  }
};

// Progress Ring with neutral color for zero
const ProgressRing = memo(function ProgressRing({
  percent,
  intensity,
  size = 40,
  strokeWidth = 3,
}: {
  percent: number;
  intensity: number;
  size?: number;
  strokeWidth?: number;
}) {
  const progress = useSharedValue(0);

  const color = percent === 0 ? '#64748B' : percent > 0 ? '#22C55E' : '#EF4444';

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    progress.value = withSpring(intensity, {
      damping: 15,
      stiffness: 100,
    });
  }, [intensity]);

  const animatedProps = useAnimatedStyle<any>(() => {
    const strokeDashoffset = interpolate(progress.value, [0, 1], [circumference, 0], Extrapolate.CLAMP);

    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{width: size, height: size}}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}20`,
        }}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{rotate: '-90deg'}],
          },
          animatedProps,
        ]}
      />

      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: size * 0.25,
            fontWeight: '800',
            color,
            textAlign: 'center',
          }}>
          {Math.abs(percent).toFixed(0)}
        </Text>
      </View>
    </View>
  );
});

const ModernHeatmapCell = memo(function ModernHeatmapCell({
  item,
  index,
  currency,
  theme,
  intensity,
  isBest,
  isWorst,
}: {
  item: MonthlyDelta;
  index: number;
  currency: string;
  theme: any;
  intensity: number;
  isBest: boolean;
  isWorst: boolean;
}) {
  const entering = FadeInUp.springify()
    .mass(0.6)
    .stiffness(180)
    .damping(20)
    .delay(index * 80);

  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    elevation: elevation.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    elevation.value = withSpring(8, {
      damping: 15,
      stiffness: 300,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    elevation.value = withSpring(0, {
      damping: 15,
      stiffness: 300,
    });
  };

  const monthLabel = new Date(item.month).toLocaleDateString('en', {month: 'short'}).toUpperCase();
  const cardStyle = getConsistentCardStyle(item.percent, intensity, theme);
  const dynamicStyles = getStyles(theme);

  return (
    <AnimatedWrapper entering={entering} style={dynamicStyles.cellContainer}>
      <Animated.View style={pressStyle}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={dynamicStyles.pressableContainer}>
          <LinearGradient
            colors={cardStyle.backgroundGradient}
            style={[dynamicStyles.modernCell, {borderColor: cardStyle.borderColor}]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={dynamicStyles.cellHeader}>
              <Text style={[dynamicStyles.monthText, {color: cardStyle.textColor}]}>{monthLabel}</Text>

              <View style={dynamicStyles.badgeContainer}>
                {isBest && (
                  <View style={dynamicStyles.glowBadge}>
                    <Star size={14} color="#FFA500" fill="#FFA500" />
                  </View>
                )}
                {isWorst && (
                  <View style={dynamicStyles.glowBadge}>
                    <AlertTriangle size={14} color="#FF6B6B" />
                  </View>
                )}
              </View>
            </View>

            <View style={dynamicStyles.contentArea}>
              <ProgressRing percent={item.percent} intensity={intensity} size={50} />

              <Text style={[dynamicStyles.percentageValue, {color: cardStyle.accentColor}]}>
                {item.percent >= 0 ? '+' : ''}
                {item.percent.toFixed(1)}%
              </Text>
            </View>

            <Text style={[dynamicStyles.amountValue, {color: cardStyle.textColor}]} numberOfLines={1}>
              {formatSmartNumber(item.delta, currency)}
            </Text>

            <View style={[dynamicStyles.accentLine, {backgroundColor: cardStyle.accentColor}]} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </AnimatedWrapper>
  );
});

const MonthlyHeatmap: React.FC<Props> = ({monthlyDeltas = [], extremes = null, currency, period}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // ✅ FIXED: Added missing 1M case
  const displayMonths = React.useMemo(() => {
    if (!monthlyDeltas || monthlyDeltas.length === 0) return [];

    const sortedMonths = [...monthlyDeltas].sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    switch (period) {
      case '1M':
        return sortedMonths.slice(-1); // ✅ FIXED: Added this case
      case '3M':
        return sortedMonths.slice(-3);
      case '6M':
        return sortedMonths.slice(-6);
      case '12M':
      case 'ALL':
        return sortedMonths.slice(-12);
      default:
        return sortedMonths;
    }
  }, [monthlyDeltas, period]);

  const maxAbsPercent = React.useMemo(() => {
    if (displayMonths.length === 0) return 1;
    return Math.max(...displayMonths.map(d => Math.abs(d.percent)), 1);
  }, [displayMonths]);

  // Dynamic column count based on data length
  const numColumns = React.useMemo(() => {
    if (displayMonths.length <= 1) return 1;
    if (displayMonths.length <= 2) return 2;
    return 3;
  }, [displayMonths.length]);

  const renderItem = ({item, index}: {item: MonthlyDelta; index: number}) => {
    const rawIntensity = Math.abs(item.percent) / maxAbsPercent;
    const intensity = Math.max(0.3, Math.min(rawIntensity, 1));

    const isBest = extremes?.biggestGain?.month === item.month;
    const isWorst = extremes?.biggestDrop?.month === item.month;

    return (
      <ModernHeatmapCell
        item={item}
        index={index}
        currency={currency}
        theme={theme}
        intensity={intensity}
        isBest={isBest}
        isWorst={isWorst}
      />
    );
  };

  if (!displayMonths || displayMonths.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={[styles.emptyState, {color: theme.colors.text.secondary}]}>
            No monthly data available for the selected period
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* ✅ FIXED: Added key prop to force re-render when numColumns changes */}
        <FlatList
          key={`${numColumns}-${displayMonths.length}`} // ✅ FIXED: Forces re-render when layout changes
          data={displayMonths}
          keyExtractor={m => m.month}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={styles.modernGrid}
          columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {/* Only show legend if there are best/worst items */}
        {(extremes?.biggestGain || extremes?.biggestDrop) && (
          <View style={styles.legendContainer}>
            <View style={styles.legendGrid}>
              {extremes?.biggestGain && (
                <View style={styles.legendItem}>
                  <Star size={16} color="#FFA500" fill="#FFA500" style={{marginRight: 8}} />
                  <Text style={[styles.legendLabel, {color: theme.colors.text.secondary}]}>Best</Text>
                </View>
              )}

              {extremes?.biggestDrop && (
                <View style={styles.legendItem}>
                  <AlertTriangle size={16} color="#FF6B6B" style={{marginRight: 8}} />
                  <Text style={[styles.legendLabel, {color: theme.colors.text.secondary}]}>Worst</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
      paddingTop: theme.spacing.xxl,
      //paddingVertical: theme.spacing.xxl,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 0,
      padding: theme.spacing.lg,
    },

    emptyState: {
      textAlign: 'center',
      fontSize: theme.fontSizes.body,
      padding: theme.spacing.xl,
      fontStyle: 'italic',
    },

    modernGrid: {
      paddingBottom: theme.spacing.xl,
    },
    gridRow: {
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },

    cellContainer: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.lg,
    },

    pressableContainer: {
      flex: 1,
    },

    modernCell: {
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1.5,
      minHeight: 130,
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',

      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 12,
      //elevation: 4,
    },

    cellHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    monthText: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '700',
      letterSpacing: 1,
    },
    badgeContainer: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    glowBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: 4,
      //elevation: 3,
    },

    contentArea: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    percentageValue: {
      fontSize: theme.fontSizes.md,
      fontWeight: '800',
      marginTop: theme.spacing.xs,
      letterSpacing: -0.3,
    },
    amountValue: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      textAlign: 'center',
      opacity: 0.8,
    },

    accentLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderBottomLeftRadius: theme.borderRadius.xl,
      borderBottomRightRadius: theme.borderRadius.xl,
    },

    legendContainer: {
      borderTopWidth: 1,
      borderTopColor: `${theme.colors.border.primary}50`,
    },
    legendGrid: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.xxl,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendLabel: {
      fontSize: theme.fontSizes.caption,
      fontWeight: '500',
    },
  });

export default MonthlyHeatmap;
