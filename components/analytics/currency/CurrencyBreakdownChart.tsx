import React, {useMemo, useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, AccessibilityRole} from 'react-native';
import Svg, {G, Path, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop} from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useHaptics} from '@/hooks/useHaptics';
import {formatSmartNumber} from '@/src/utils/formatters';

type CurrencySlice = {
  currency: string;
  amount: number;
  percentage: number; // 0-1 fraction
  type: 'asset' | 'liability';
};

interface CurrencyBreakdownChartProps {
  data: CurrencySlice[];
  title: string;
  type: 'asset' | 'liability';
  total: number;
  currency: string;
  centerLabel?: string;
}

// Chart constants - exactly matching CategoryAllocationPieChart
const INNER_RATIO = 0.6;
const HOVER_OUTER_GAIN = 1.08;
const HOVER_OFFSET = 12;
const LABEL_THRESHOLD_PERCENT = 2;

// Currency color palettes
const CURRENCY_COLORS = {
  USD: '#2E8B57', // Sea Green
  EUR: '#4682B4', // Steel Blue
  GBP: '#9370DB', // Medium Purple
  JPY: '#FF6B6B', // Light Red
  AUD: '#FFA500', // Orange
  CAD: '#20B2AA', // Light Sea Green
  CHF: '#DC143C', // Crimson
  CNY: '#FF1493', // Deep Pink
  INR: '#32CD32', // Lime Green
  BRL: '#FF4500', // Orange Red
  KRW: '#8B5CF6', // Purple
  MXN: '#06B6D4', // Cyan
  SGD: '#10B981', // Emerald
  HKD: '#F59E0B', // Amber
  NZD: '#EF4444', // Red
  default: '#6366f1', // Indigo fallback
};

const FALLBACK_COLORS = [
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#84CC16',
  '#F97316',
  '#14B8A6',
  '#8B5CF6',
  '#F472B6',
];

const getCurrencyColor = (currency: string, index: number): string => {
  const color = CURRENCY_COLORS[currency as keyof typeof CURRENCY_COLORS];
  return color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

const CurrencyBreakdownChart: React.FC<CurrencyBreakdownChartProps> = ({
  data,
  title,
  type,
  total,
  currency,
  centerLabel,
}) => {
  const {theme} = useTheme() as any;
  const {selectionAsync} = useHaptics();
  const {width: screenWidth} = useWindowDimensions();

  // Exact same sizing logic as CategoryAllocationPieChart
  const size = Math.max(220, Math.min(360, screenWidth * 0.72));
  const outerRadius = size / 2;
  const innerRadius = outerRadius * INNER_RATIO;
  const pad = Math.ceil(outerRadius * (HOVER_OUTER_GAIN - 1) + HOVER_OFFSET + 12);
  const canvas = size + pad * 2;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Process and sort data - exact same logic as CategoryAllocationPieChart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);

    if (rest.length) {
      const amount = rest.reduce((sum, i) => sum + i.amount, 0);
      const percentage = rest.reduce((sum, i) => sum + i.percentage, 0);
      top.push({currency: 'Others', amount, percentage, type});
    }

    return top;
  }, [data, type]);

  const totalAmount = useMemo(() => chartData.reduce((s, d) => s + (d.amount || 0), 0), [chartData]);

  // D3 generators - exact same as CategoryAllocationPieChart
  const pieGen = useMemo(
    () =>
      d3Shape
        .pie<CurrencySlice>()
        .value(d => Math.max(d.amount, 0))
        .sort(null),
    []
  );

  const arcs = useMemo(() => pieGen(chartData), [pieGen, chartData]);

  // Colors based on currency
  const chartColors = useMemo(() => chartData.map((d, i) => getCurrencyColor(d.currency, i)), [chartData]);

  // Arc generator - exact same as CategoryAllocationPieChart
  const arcForIndex = useCallback(
    (i: number) => {
      const hovered = activeIndex === i;
      const baseOuter = hovered ? outerRadius * HOVER_OUTER_GAIN : outerRadius;
      return d3Shape.arc<d3Shape.PieArcDatum<CurrencySlice>>().innerRadius(innerRadius).outerRadius(baseOuter);
    },
    [activeIndex, innerRadius, outerRadius]
  );

  // Slice translation - exact same as CategoryAllocationPieChart
  const getSliceTranslate = useCallback(
    (a: d3Shape.PieArcDatum<CurrencySlice>, i: number) => {
      if (activeIndex !== i) return {dx: 0, dy: 0};
      const midAngle = (a.startAngle + a.endAngle) / 2;
      return {dx: Math.cos(midAngle) * HOVER_OFFSET, dy: Math.sin(midAngle) * HOVER_OFFSET};
    },
    [activeIndex]
  );

  // Handle slice interaction
  const onSlicePress = useCallback(
    (i: number) => {
      selectionAsync();
      setActiveIndex(prev => (prev === i ? null : i));
    },
    [selectionAsync]
  );

  const centerPrimary = theme.colors.text.primary;
  const centerSecondary = theme.colors.text.secondary;

  const dynamicStyles = getStyles(theme);

  if (!data || data.length === 0) {
    return (
      <Text style={[dynamicStyles.noDataText, {color: theme.colors.text.secondary}]}>No {type} data available</Text>
    );
  }

  return (
    <View style={[dynamicStyles.container, dynamicStyles.containerBackground]}>
      {/* Title */}
      <View style={dynamicStyles.titleContainer}>
        <Text style={[dynamicStyles.title, {color: theme.colors.text.primary}]}>{title}</Text>
      </View>

      {/* Donut chart */}
      <View style={[dynamicStyles.chartContainer, dynamicStyles.chartMargin]}>
        <Svg width={canvas} height={canvas}>
          <Defs>
            {arcs.map((_, i) => (
              <SvgLinearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={chartColors[i]} stopOpacity={0.85} />
                <Stop offset="100%" stopColor={chartColors[i]} stopOpacity={0.55} />
              </SvgLinearGradient>
            ))}
          </Defs>

          <G x={canvas / 2} y={canvas / 2}>
            {/* Slice shadow */}
            <Path
              d={
                d3Shape
                  .arc()
                  .innerRadius(innerRadius)
                  .outerRadius(outerRadius)
                  .startAngle(0)
                  .endAngle(Math.PI * 2)({} as d3Shape.DefaultArcObject) as string
              }
              fill="rgba(0,0,0,0.08)"
            />

            {arcs.map((a, i) => {
              const arcGen = arcForIndex(i);
              const {dx, dy} = getSliceTranslate(a, i);
              return (
                <G key={i} transform={`translate(${dx},${dy})`}>
                  <Path
                    d={arcGen(a) as string}
                    fill={`url(#grad-${i})`}
                    onPressIn={() => onSlicePress(i)} // ✅ FIX: Use onPressIn for better reliability on iOS
                  />
                  {/* Percent label */}
                  {a.data.percentage * 100 > LABEL_THRESHOLD_PERCENT && (
                    <SvgText
                      x={arcGen.centroid(a)[0]}
                      y={arcGen.centroid(a)[1]}
                      fill={centerPrimary}
                      fontSize={12}
                      fontWeight="700"
                      textAnchor="middle"
                      alignmentBaseline="middle">
                      {`${Math.round(a.data.percentage * 100)}%`}
                    </SvgText>
                  )}
                </G>
              );
            })}

            {/* Center label */}
            <SvgText x={0} y={-4} fill={centerSecondary} fontSize={12} fontWeight="500" textAnchor="middle">
              {centerLabel || 'Total'}
            </SvgText>
            <SvgText x={0} y={16} fill={centerPrimary} fontSize={16} fontWeight="800" textAnchor="middle">
              {formatSmartNumber(totalAmount, currency)}
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View style={[dynamicStyles.legendWrap, dynamicStyles.legendGap]}>
        {chartData.map((item, i) => {
          const selected = activeIndex === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                dynamicStyles.legendItem,
                // ✅ KEPT INLINE: Dynamic logic for selected state
                {
                  backgroundColor: selected ? `${theme.colors.primary}15` : theme.colors.background.secondary,
                  borderColor: selected ? theme.colors.primary : theme.colors.border.primary,
                },
              ]}
              onPress={() => onSlicePress(i)}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel={`${item.currency} ${Math.round(item.percentage * 100)}% — ${formatSmartNumber(item.amount, currency)}`}>
              <View style={[dynamicStyles.legendDot, {backgroundColor: chartColors[i]}]} />
              <View style={dynamicStyles.legendTextCol}>
                <Text style={[dynamicStyles.legendLabel, {color: theme.colors.text.primary}]}>{item.currency}</Text>
                <Text style={[dynamicStyles.legendSub, {color: theme.colors.text.tertiary}]}>
                  {formatSmartNumber(item.amount, currency)}
                </Text>
              </View>
              <Text style={[dynamicStyles.legendPct, {color: theme.colors.text.primary}]}>
                {Math.round(item.percentage * 100)}%
              </Text>
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.primary}
                  style={dynamicStyles.selectedIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ✅ FIXED: Exact same styling approach as CategoryAllocationPieChart with theme flexibility
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    // ✅ Moved inline containerBackground with theme values
    containerBackground: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
    },
    // ✅ Moved inline titleContainer
    titleContainer: {
      alignItems: 'center',
    },
    title: {
      fontSize: theme.fontSizes?.title || 18,
      fontWeight: '800',
      marginBottom: theme.spacing?.sm || 12,
    },
    chartContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // ✅ Moved inline chartMargin
    chartMargin: {
      marginVertical: theme.spacing?.xs || 6,
    },
    legendWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    // ✅ Moved inline legendGap
    legendGap: {
      gap: theme.spacing.sm,
    },
    legendItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing?.sm || 8,
      paddingHorizontal: theme.spacing?.sm || 10,
      borderRadius: theme.borderRadius?.md || 12,
      borderWidth: 1,
      marginBottom: theme.spacing?.sm || 8,
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing?.sm || 10,
    },
    legendTextCol: {
      flex: 1,
    },
    legendLabel: {
      fontSize: theme.fontSizes?.body || 14,
      fontWeight: '700',
    },
    legendSub: {
      fontSize: theme.fontSizes?.caption || 12,
      fontWeight: '500',
    },
    legendPct: {
      fontSize: theme.fontSizes?.body || 13,
      fontWeight: '700',
      marginLeft: theme.spacing?.xs || 6,
    },
    // ✅ Moved inline selectedIcon
    selectedIcon: {
      marginLeft: theme.spacing?.xs || 6,
    },
    // ✅ Added for no data text
    noDataText: {
      fontSize: theme.fontSizes?.body || 14,
    },
  });

export default CurrencyBreakdownChart;
