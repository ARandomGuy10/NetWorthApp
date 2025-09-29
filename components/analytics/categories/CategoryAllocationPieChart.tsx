import React, {useMemo, useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, AccessibilityRole} from 'react-native';
import Svg, {G, Path, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop} from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {useHaptics} from '@/hooks/useHaptics';
import {formatSmartNumber} from '@/src/utils/formatters';

type Slice = {category: string; amount: number; percentage: number; type: 'asset' | 'liability'};
interface Props {
  items: Slice[];
  currency: string;
  title?: string;
  centerLabel?: string;
}

const INNER_RATIO = 0.6;
const HOVER_OUTER_GAIN = 1.08;
const HOVER_OFFSET = 12;
const LABEL_THRESHOLD_PERCENT = 4;

const ASSET_PALETTE = [
  '#22C55E',
  '#0EA5E9',
  '#F59E0B',
  '#A855F7',
  '#14B8A6',
  '#6366F1',
  '#10B981',
  '#8B5CF6',
  '#FBBF24',
  '#06B6D4',
  '#F472B6',
];
const LIABILITY_PALETTE = [
  '#EF4444',
  '#F97316',
  '#F43F5E',
  '#BE123C',
  '#DC2626',
  '#B91C1C',
  '#FCA5A5',
  '#FB7185',
  '#B91C1C',
  '#EF4444',
  '#F87171',
];

const CategoryAllocationPieChart: React.FC<Props> = ({
  items,
  currency,
  title = 'Allocation',
  centerLabel = 'Total',
}) => {
  const {theme} = useTheme() as any;
  const {selectionAsync} = useHaptics();
  const {width: screenWidth} = useWindowDimensions();

  const size = Math.max(220, Math.min(360, screenWidth * 0.72));
  const outerRadius = size / 2;
  const innerRadius = outerRadius * INNER_RATIO;
  const pad = Math.ceil(outerRadius * (HOVER_OUTER_GAIN - 1) + HOVER_OFFSET + 12);
  const canvas = size + pad * 2;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Top 5 + Others logic
  const data = useMemo(() => {
    if (!items || items.length === 0) return [];
    const sorted = [...items].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    if (rest.length) {
      const amount = rest.reduce((sum, i) => sum + i.amount, 0);
      const percentage = rest.reduce((sum, i) => sum + i.percentage, 0);
      const type = rest.every(i => i.type === 'asset') ? 'asset' : 'liability';
      top.push({category: 'Others', amount, percentage, type});
    }
    return top;
  }, [items]);

  const totalAmount = useMemo(() => data.reduce((s, d) => s + (d.amount || 0), 0), [data]);

  const pieGen = useMemo(
    () =>
      d3Shape
        .pie<Slice>()
        .value(d => Math.max(d.amount, 0))
        .sort(null),
    []
  );
  const arcs = useMemo(() => pieGen(data), [pieGen, data]);

  // Color based on type
  const colors = useMemo(
    () =>
      data.map((d, i) =>
        d.type === 'asset' ? ASSET_PALETTE[i % ASSET_PALETTE.length] : LIABILITY_PALETTE[i % LIABILITY_PALETTE.length]
      ),
    [data]
  );

  const arcForIndex = useCallback(
    (i: number) => {
      const hovered = activeIndex === i;
      const baseOuter = hovered ? outerRadius * HOVER_OUTER_GAIN : outerRadius;
      return d3Shape.arc<d3Shape.PieArcDatum<Slice>>().innerRadius(innerRadius).outerRadius(baseOuter);
    },
    [activeIndex, innerRadius, outerRadius]
  );

  const getSliceTranslate = useCallback(
    (a: d3Shape.PieArcDatum<Slice>, i: number) => {
      if (activeIndex !== i) return {dx: 0, dy: 0};
      const midAngle = (a.startAngle + a.endAngle) / 2;
      return {dx: Math.cos(midAngle) * HOVER_OFFSET, dy: Math.sin(midAngle) * HOVER_OFFSET};
    },
    [activeIndex]
  );

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

  if (!items || items.length === 0)
    return <Text style={[dynamicStyles.noDataText, {color: theme.colors.text.secondary}]}>No data to display</Text>;

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
                <Stop offset="0%" stopColor={colors[i]} stopOpacity={0.85} />
                <Stop offset="100%" stopColor={colors[i]} stopOpacity={0.55} />
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
                  <Path d={arcGen(a) as string} fill={`url(#grad-${i})`} onPress={() => onSlicePress(i)} />
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
              {centerLabel}
            </SvgText>
            <SvgText x={0} y={16} fill={centerPrimary} fontSize={16} fontWeight="800" textAnchor="middle">
              {formatSmartNumber(totalAmount, currency)}
            </SvgText>
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View style={[dynamicStyles.legendWrap, dynamicStyles.legendGap]}>
        {data.map((item, i) => {
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
              accessibilityLabel={`${item.category} ${Math.round(item.percentage * 100)}% — ${formatSmartNumber(item.amount, currency)}`}>
              <View style={[dynamicStyles.legendDot, {backgroundColor: colors[i]}]} />
              <View style={dynamicStyles.legendTextCol}>
                <Text style={[dynamicStyles.legendLabel, {color: theme.colors.text.primary}]}>{item.category}</Text>
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

// ✅ FIXED: Only static styles in StyleSheet, no functions
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    // ✅ Moved inline containerBackground
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

export default CategoryAllocationPieChart;
