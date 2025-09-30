import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Modal} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';

interface NetWorthSummaryCardProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    healthScore: number;
    currency: string;
  };
  onPress?: () => void;
}

function useCountUp(to: number, duration = 700) {
  const [value, setValue] = useState(to);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(to);

  useEffect(() => {
    const from = fromRef.current;
    const diff = to - from;
    const start = Date.now();
    startRef.current = start;

    const step = () => {
      const now = Date.now();
      const t = Math.min(1, (now - (startRef.current ?? start)) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + diff * eased;

      setValue(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);

  return value;
}

const NetWorthSummaryCard: React.FC<NetWorthSummaryCardProps> = ({data}) => {
  const {theme} = useTheme() as any;
  const colors = theme?.colors ?? {};
  const spacing = theme?.spacing ?? {};
  const fontSizes = theme?.fontSizes ?? {};
  const borderRadius = theme?.borderRadius ?? {};
  const styles = getStyles(theme);

  // Centered modal tooltip state (only for Health Score)
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);

  // Background subtle blob
  const blob = useSharedValue(0);
  useEffect(() => {
    const id = setInterval(() => {
      blob.value = Math.random();
    }, 2400);
    return () => clearInterval(id);
  }, []);
  const blobStyle = useAnimatedStyle(() => ({
    opacity: withTiming(0.08 + blob.value * 0.08, {duration: 1400}),
    transform: [
      {translateX: withTiming((blob.value - 0.5) * 12, {duration: 1400, easing: Easing.inOut(Easing.ease)})},
      {translateY: withTiming((0.5 - blob.value) * 6, {duration: 1400, easing: Easing.inOut(Easing.ease)})},
      {scale: withTiming(1 + blob.value * 0.03, {duration: 1400})},
    ],
  }));

  const animatedNumber = useCountUp(data.netWorth, 900);

  // Pulse for badge
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withTiming(1, {duration: 650});
  }, [data.healthScore]);
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + (pulse.value % 0.85) * 0.03}],
    opacity: 0.98,
  }));

  const total = Math.max(data.totalAssets + data.totalLiabilities, 1);
  const assetsRatio = data.totalAssets / total;
  const liabilitiesRatio = data.totalLiabilities / total;
  const assetToDebtRatio = data.totalLiabilities > 0 ? data.totalAssets / data.totalLiabilities : Infinity;

  const cardGradient = colors?.gradient?.card ?? colors?.gradient?.primary ?? ['#1a1a2e', '#16213e', '#0f4c75'];
  const headerGradient = colors?.gradient?.header ?? colors?.gradient?.primary ?? ['#1a1a2e', '#16213e', '#0f4c75'];

  const assetAccent = colors?.asset ?? '#4facfe';
  const liabilityAccent = colors?.liability ?? '#f093fb';

  const healthColor =
    data.healthScore >= 80
      ? (colors?.success ?? '#00d4aa')
      : data.healthScore >= 60
        ? (colors?.warning ?? '#ffd700')
        : (colors?.error ?? '#ff6b9d');

  const primaryTextColor = colors?.text?.primary ?? '#ffffff';
  const secondaryTextColor = colors?.text?.secondary ?? '#b8c6db';

  // Detailed health info with tips (kept from your earlier version)
  const getHealthInfo = () => {
    if (data.healthScore >= 80) {
      return {
        title: 'Excellent Portfolio Health',
        description:
          'Your net worth is strongly positive with a healthy asset-to-debt ratio. You have substantial wealth accumulation and minimal financial risk.',
        tips: ['Continue building your assets', 'Consider diversifying investments', 'Maintain emergency fund'],
        color: theme.colors.success,
        icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      };
    } else if (data.healthScore >= 60) {
      return {
        title: 'Good Portfolio Health',
        description:
          'Your financial position is positive with room for improvement. You have more assets than debts but could optimize your wealth-building strategy.',
        tips: ['Focus on debt reduction', 'Increase asset allocation', 'Review spending habits'],
        color: theme.colors.warning,
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
      };
    } else {
      return {
        title: 'Portfolio Needs Attention',
        description:
          'Your debt levels are concerning relative to your assets. Consider prioritizing debt reduction and building an emergency fund.',
        tips: [
          'Create debt reduction plan',
          'Build emergency fund',
          'Review and cut expenses',
          'Seek financial advice',
        ],
        color: theme.colors.error,
        icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      };
    }
  };

  const healthInfo = getHealthInfo();

  const openHealthTooltip = () => {
    setShowHealthTooltip(true);
  };
  const closeHealthTooltip = () => {
    setShowHealthTooltip(false);
  };

  return (
    <View style={styles.container}>
      {/* Centered Modal Tooltip */}
      <Modal visible={showHealthTooltip} transparent animationType="fade" onRequestClose={closeHealthTooltip}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeHealthTooltip}>
          <View style={styles.modalCard}>
            <LinearGradient colors={cardGradient} style={styles.modalCardGradient}>
              {/* Header */}
              <View style={styles.tooltipHeader}>
                <Ionicons name={healthInfo.icon} size={22} color={healthInfo.color} style={styles.tooltipIcon} />
                <Text style={[styles.tooltipTitle, {color: healthInfo.color}]}>{healthInfo.title}</Text>
                <TouchableOpacity onPress={closeHealthTooltip} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <Ionicons name="close" size={18} color={secondaryTextColor} />
                </TouchableOpacity>
              </View>

              {/* Explanation */}
              <Text style={[styles.tooltipDescription, {color: secondaryTextColor}]}>{healthInfo.description}</Text>

              {/* Metrics block - uses all available data */}
              <View style={styles.metricsBlock}>
                <Text style={[styles.metricLine, {color: primaryTextColor}]}>
                  Net Worth:{' '}
                  <Text style={{color: primaryTextColor, fontWeight: '700'}}>
                    {formatSmartNumber(data.netWorth, data.currency)}
                  </Text>
                </Text>
                <Text style={[styles.metricLine, {color: assetAccent}]}>
                  Assets:{' '}
                  <Text style={{color: assetAccent, fontWeight: '700'}}>
                    {formatSmartNumber(data.totalAssets, data.currency)}
                  </Text>
                </Text>
                <Text style={[styles.metricLine, {color: liabilityAccent}]}>
                  Debts:{' '}
                  <Text style={{color: liabilityAccent, fontWeight: '700'}}>
                    {formatSmartNumber(data.totalLiabilities, data.currency)}
                  </Text>
                </Text>
                <Text style={[styles.metricLine, {color: primaryTextColor}]}>
                  Asset-to-Debt Ratio:{' '}
                  <Text style={{color: primaryTextColor, fontWeight: '700'}}>
                    {assetToDebtRatio === Infinity ? '∞' : assetToDebtRatio.toFixed(2)}x
                  </Text>
                </Text>
                <Text style={[styles.metricLine, {color: healthInfo.color}]}>
                  Health Score: <Text style={{color: healthInfo.color, fontWeight: '800'}}>{data.healthScore}%</Text>
                </Text>
              </View>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsHeader, {color: primaryTextColor}]}>Recommendations:</Text>
                {healthInfo.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={[styles.tipBullet, {color: healthInfo.color}]}>•</Text>
                    <Text style={[styles.tipText, {color: secondaryTextColor}]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      <Animated.View entering={FadeInUp} style={styles.cardWrapper}>
        <LinearGradient colors={headerGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.cardGradient}>
          {/* Animated background blob */}
          <Animated.View style={[styles.blobLayer, blobStyle]} />

          {/* Net Worth */}
          <View style={styles.netWorthSection}>
            <Text style={[styles.netWorthLabel, {color: secondaryTextColor}]}>Net Worth</Text>
            <Text
              style={[
                styles.netWorthValue,
                {color: data.netWorth >= 0 ? primaryTextColor : liabilityAccent},
                {fontSize: fontSizes.display * 1.02},
              ]}>
              {formatSmartNumber(Math.round(animatedNumber), data.currency)}
            </Text>
          </View>

          {/* Assets vs Debts */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <View style={styles.balanceHeader}>
                <View style={[styles.dot, {backgroundColor: assetAccent}]} />
                <Text style={[styles.balanceLabel, {color: secondaryTextColor}]}>Assets</Text>
              </View>
              <Text style={[styles.balanceValue, {color: assetAccent}]}>
                {formatSmartNumber(data.totalAssets, data.currency)}
              </Text>
            </View>

            <View style={styles.minusContainer}>
              <Text style={[styles.minusSign, {color: secondaryTextColor}]}>−</Text>
            </View>

            <View style={styles.balanceItem}>
              <View style={styles.balanceHeader}>
                <View style={[styles.dot, {backgroundColor: liabilityAccent}]} />
                <Text style={[styles.balanceLabel, {color: secondaryTextColor}]}>Debts</Text>
              </View>
              <Text style={[styles.balanceValue, {color: liabilityAccent}]}>
                {formatSmartNumber(data.totalLiabilities, data.currency)}
              </Text>
            </View>
          </View>

          {/* Proportion bar */}
          <View style={styles.proportionRow}>
            <Text style={[styles.proportionText, {color: secondaryTextColor, marginBottom: spacing.xs}]}>
              Assets vs Debts
            </Text>
            <View style={styles.proportionBarTrack}>
              <View style={[styles.proportionChunk, {backgroundColor: assetAccent, flex: assetsRatio}]} />
              <View style={[styles.proportionChunk, {backgroundColor: liabilityAccent, flex: liabilitiesRatio}]} />
            </View>
          </View>

          {/* Portfolio Health */}
          <View style={styles.healthSection}>
            <View style={styles.healthHeader}>
              <View style={styles.healthTitleRow}>
                <Text style={[styles.healthLabel, {color: secondaryTextColor}]}>Portfolio Health</Text>
                {/* Info icon to indicate tooltip */}
                <TouchableOpacity
                  onPress={openHealthTooltip}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                  accessibilityRole="button"
                  accessibilityLabel="More info about portfolio health"
                  style={styles.infoIconButton}>
                  <Ionicons name="information-circle-outline" size={18} color={secondaryTextColor} />
                </TouchableOpacity>
              </View>
              <Animated.View style={[styles.healthBadge, {backgroundColor: `${healthColor}20`}, badgeStyle]}>
                <Text style={[styles.healthText, {color: healthColor}]}>
                  {data.healthScore >= 80 ? 'Excellent' : data.healthScore >= 60 ? 'Good' : 'Needs Work'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.healthScoreCol}>
              <TouchableOpacity onPress={openHealthTooltip} activeOpacity={0.8}>
                <Text style={[styles.healthScore, {color: healthColor, fontSize: fontSizes.heading}]}>
                  {data.healthScore}%
                </Text>
              </TouchableOpacity>
              <View style={styles.healthProgressTrack}>
                <View
                  style={[styles.healthProgressFill, {backgroundColor: healthColor, width: `${data.healthScore}%`}]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const getStyles = (theme: any) => {
  const colors = theme?.colors ?? {};
  const text = colors.text ?? {};
  const border = colors.border ?? {};
  const spacing = theme?.spacing ?? {};
  const fontSizes = theme?.fontSizes ?? {};
  const borderRadius = theme?.borderRadius ?? {};

  return StyleSheet.create({
    container: {
      width: '100%',
      marginHorizontal: 0,
      marginBottom: spacing.lg,
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },

    // Modal styles (centered tooltip)
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    modalCardGradient: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: border?.secondary ?? 'rgba(255,255,255,0.2)',
    },

    // Tooltip content
    tooltipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    tooltipIcon: {
      marginRight: spacing.xs,
    },
    tooltipTitle: {
      fontSize: fontSizes.subtitle,
      fontWeight: '700',
      flex: 1,
    },
    tooltipDescription: {
      fontSize: fontSizes.body,
      lineHeight: fontSizes.body * 1.45,
      marginBottom: spacing.md,
    },
    metricsBlock: {
      borderTopWidth: 1,
      borderTopColor: border?.secondary ?? 'rgba(255,255,255,0.12)',
      paddingTop: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
      gap: 6,
    },
    metricLine: {
      fontSize: fontSizes.caption,
    },
    tipsContainer: {
      marginTop: spacing.xs,
    },
    tipsHeader: {
      fontSize: fontSizes.caption,
      fontWeight: '700',
      marginBottom: spacing.xs,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.xs / 2,
    },
    tipBullet: {
      fontSize: fontSizes.sm,
      fontWeight: '700',
      marginRight: spacing.xs,
      marginTop: 1,
    },
    tipText: {
      fontSize: fontSizes.xs,
      flex: 1,
      lineHeight: fontSizes.xs * 1.35,
    },

    cardWrapper: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      width: '100%',
    },
    cardGradient: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: border?.secondary ?? 'rgba(255,255,255,0.05)',
      minHeight: 160,
      justifyContent: 'space-between',
      width: '100%',
    },
    blobLayer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors?.primary ?? '#4facfe',
      opacity: 0.08,
      borderRadius: borderRadius.xl,
      zIndex: 0,
      transform: [{scale: 1.04}],
    },

    netWorthSection: {
      alignItems: 'center',
      marginBottom: spacing.md,
      zIndex: 1,
    },
    netWorthLabel: {
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    netWorthValue: {
      fontWeight: '800',
      letterSpacing: -0.6,
      zIndex: 1,
    },

    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
      zIndex: 1,
    },
    balanceItem: {
      flex: 1,
      alignItems: 'center',
    },
    balanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 8,
      marginRight: spacing.xs,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)',
    },
    balanceLabel: {
      fontWeight: '600',
    },
    balanceValue: {
      fontWeight: '700',
    },
    minusContainer: {
      marginHorizontal: spacing.md,
      alignItems: 'center',
    },
    minusSign: {
      fontWeight: '400',
    },

    proportionRow: {
      marginBottom: spacing.md,
    },
    proportionBarTrack: {
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.06)',
      flexDirection: 'row',
      marginBottom: spacing.xs,
    },
    proportionChunk: {
      minWidth: 6,
      height: '100%',
    },
    proportionText: {
      fontWeight: '500',
      textAlign: 'center',
    },

    healthSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: border?.secondary ?? 'rgba(255,255,255,0.08)',
      zIndex: 1,
    },
    healthHeader: {
      flex: 1,
    },
    healthTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    infoIconButton: {
      marginLeft: spacing.xs,
    },
    healthLabel: {
      fontWeight: '600',
    },
    healthBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      alignSelf: 'flex-start',
      marginTop: spacing.xs,
    },
    healthText: {
      fontWeight: '700',
    },
    healthScoreCol: {
      alignItems: 'flex-end',
      width: 140,
    },
    healthScore: {
      fontWeight: '800',
    },
    healthProgressTrack: {
      height: 8,
      width: 120,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.08)',
      overflow: 'hidden',
      marginTop: 8,
      flexDirection: 'row',
    },
    healthProgressFill: {
      height: '100%',
    },
  });
};

export default NetWorthSummaryCard;
