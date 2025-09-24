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
}

// Chart constants - exactly matching CategoryAllocationPieChart
const INNER_RATIO = 0.6;
const HOVER_OUTER_GAIN = 1.08;
const HOVER_OFFSET = 12;
const LABEL_THRESHOLD_PERCENT = 4;

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

const CurrencyBreakdownChart: React.FC<CurrencyBreakdownChartProps> = ({data, title, type, total, currency}) => {
  const {theme} = useTheme() as any;
  const {selectionAsync} = useHaptics();
  const {width: screenWidth} = useWindowDimensions();

  // Safe theme access with fallbacks
  const colors = theme?.colors ?? {};
  const text = colors.text ?? {};
  const surface = colors.surface ?? {};
  const border = colors.border ?? {};

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

  const centerPrimary = text?.primary ?? '#ffffff';
  const centerSecondary = text?.secondary ?? '#b8c6db';

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, {backgroundColor: surface?.primary ?? '#1a1a2e'}]}>
        <Text style={[styles.title, {color: text?.primary ?? '#ffffff'}]}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: text?.secondary ?? '#b8c6db'}]}>No {type} data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: surface?.primary ?? '#1a1a2e'}]}>
      {/* Title */}
      <Text style={[styles.title, {color: text?.primary ?? '#ffffff'}]}>{title}</Text>

      {/* Donut chart */}
      <View style={styles.chartContainer}>
        <Svg width={canvas} height={canvas}>
          <G transform={`translate(${canvas / 2}, ${canvas / 2})`}>
            {/* Slice shadows - same as CategoryAllocationPieChart */}
            {arcs.map((_, i) => (
              <G key={`shadow-${chartData[i].currency}-${i}`}>
                <Defs>
                  <SvgLinearGradient id={`shadow-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#000000" stopOpacity={0.08} />
                    <Stop offset="100%" stopColor="#000000" stopOpacity={0.12} />
                  </SvgLinearGradient>
                </Defs>
              </G>
            ))}

            {/* FIXED: Main slices with labels - exactly like CategoryAllocationPieChart */}
            {arcs.map((a, i) => {
              const arcGen = arcForIndex(i);
              const {dx, dy} = getSliceTranslate(a, i);

              // FIXED: Use d3 centroid for label positioning - just like CategoryAllocationPieChart
              const [labelX, labelY] = arcGen.centroid(a);

              return (
                <G key={`slice-${chartData[i].currency}-${i}`} transform={`translate(${dx}, ${dy})`}>
                  {/* Slice path */}
                  <Path
                    d={arcGen(a) || ''}
                    fill={chartColors[i]}
                    stroke={surface?.primary ?? '#1a1a2e'}
                    strokeWidth={2}
                    onPress={() => onSlicePress(i)}
                  />

                  {/* FIXED: Percent label using centroid positioning */}
                  {a.data.percentage * 100 > LABEL_THRESHOLD_PERCENT && (
                    <SvgText
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={12}
                      fontWeight="600"
                      fill={text?.onPrimary ?? '#ffffff'}>
                      {`${Math.round(a.data.percentage * 100)}%`}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </G>
        </Svg>

        {/* Center label - same as CategoryAllocationPieChart */}
        <View style={styles.centerLabel}>
          <Text style={[styles.centerTotal, {color: centerPrimary}]}>{formatSmartNumber(totalAmount, currency)}</Text>
          <Text style={[styles.centerSubtitle, {color: centerSecondary}]}>Total {type}s</Text>
        </View>
      </View>

      {/* Legend - same layout as CategoryAllocationPieChart */}
      <View style={styles.legendWrap}>
        {chartData.map((item, i) => {
          const selected = activeIndex === i;
          return (
            <TouchableOpacity
              key={`legend-${item.currency}-${i}`}
              style={[
                styles.legendItem,
                {
                  backgroundColor: selected ? (surface?.secondary ?? 'rgba(255,255,255,0.05)') : 'transparent',
                  borderColor: selected ? chartColors[i] : (border?.primary ?? 'rgba(255,255,255,0.1)'),
                },
              ]}
              onPress={() => onSlicePress(i)}
              accessibilityRole={'button' as AccessibilityRole}
              accessibilityLabel={`${item.currency} ${Math.round(item.percentage * 100)}% — ${formatSmartNumber(item.amount, currency)}`}>
              <View style={[styles.legendDot, {backgroundColor: chartColors[i]}]} />
              <View style={styles.legendTextCol}>
                <Text style={[styles.legendLabel, {color: text?.primary ?? '#ffffff'}]}>{item.currency}</Text>
                <Text style={[styles.legendSub, {color: text?.secondary ?? '#b8c6db'}]}>
                  {formatSmartNumber(item.amount, currency)}
                </Text>
              </View>
              <Text style={[styles.legendPct, {color: text?.primary ?? '#ffffff'}]}>
                {Math.round(item.percentage * 100)}%
              </Text>
              {selected && (
                <Ionicons name="checkmark-circle" size={16} color={chartColors[i]} style={{marginLeft: 8}} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Styles - exact same as CategoryAllocationPieChart
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTotal: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  legendItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendTextCol: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  legendSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CurrencyBreakdownChart;
