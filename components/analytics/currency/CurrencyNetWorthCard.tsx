import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';

interface CurrencyNetWorthCardProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    diversificationScore: number;
    baseCurrency: string;
    assets: Array<{currency: string; amount: number; percentage: number}>;
    liabilities: Array<{currency: string; amount: number; percentage: number}>;
  };
  userCurrency: string;
}

// Reuse the same count-up animation from original card
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

const CurrencyNetWorthCard: React.FC<CurrencyNetWorthCardProps> = ({data, userCurrency}) => {
  const {theme} = useTheme() as any;
  const colors = theme?.colors ?? {};
  const spacing = theme?.spacing ?? {};
  const fontSizes = theme?.fontSizes ?? {};
  const borderRadius = theme?.borderRadius ?? {};
  const styles = getStyles(theme);

  // Modal state for diversification tooltip
  const [showDiversificationTooltip, setShowDiversificationTooltip] = useState(false);

  // Background subtle blob animation (same as original)
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

  // Animated net worth number
  const animatedNumber = useCountUp(data.netWorth, 900);

  // Pulse animation for diversification badge
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withTiming(1, {duration: 650});
  }, [data.diversificationScore]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 + (pulse.value % 0.85) * 0.03}],
    opacity: 0.98,
  }));

  // Calculate ratios and unique currencies
  const uniqueCurrencies = new Set([...data.assets.map(a => a.currency), ...data.liabilities.map(l => l.currency)])
    .size;

  const total = Math.max(data.totalAssets + data.totalLiabilities, 1);
  const assetsRatio = data.totalAssets / total;
  const liabilitiesRatio = data.totalLiabilities / total;

  // FIXED: Use exact same gradient logic as NetWorthSummaryCard
  const cardGradient = colors?.gradient?.card ?? colors?.gradient?.primary ?? ['#1a1a2e', '#16213e', '#0f4c75'];
  const headerGradient = colors?.gradient?.header ?? colors?.gradient?.primary ?? ['#1a1a2e', '#16213e', '#0f4c75'];

  const assetAccent = colors?.asset ?? '#4facfe';
  const liabilityAccent = colors?.liability ?? '#f093fb';

  // Diversification color logic
  const diversificationColor =
    data.diversificationScore >= 85
      ? (colors?.success ?? '#00d4aa')
      : data.diversificationScore >= 70
        ? (colors?.warning ?? '#ffd700')
        : (colors?.error ?? '#ff6b9d');

  const primaryTextColor = colors?.text?.primary ?? '#ffffff';
  const secondaryTextColor = colors?.text?.secondary ?? '#b8c6db';

  // Diversification info for tooltip
  const getDiversificationInfo = () => {
    if (data.diversificationScore >= 85) {
      return {
        title: 'Excellent Currency Diversification',
        description:
          'Your wealth is well-distributed across multiple currencies, providing good protection against exchange rate volatility.',
        tips: [
          'Continue monitoring exchange rate trends',
          'Consider rebalancing if one currency becomes dominant',
          'Keep some base currency for stability',
        ],
        color: colors?.success ?? '#00d4aa',
        icon: 'globe' as keyof typeof Ionicons.glyphMap,
      };
    } else if (data.diversificationScore >= 70) {
      return {
        title: 'Good Currency Diversification',
        description: 'You have decent currency spread but could improve diversification to reduce concentration risk.',
        tips: [
          'Consider adding exposure to other major currencies',
          'Balance foreign assets with home currency stability',
          'Monitor exchange rate volatility',
        ],
        color: colors?.warning ?? '#ffd700',
        icon: 'warning' as keyof typeof Ionicons.glyphMap,
      };
    } else {
      return {
        title: 'Limited Currency Diversification',
        description: 'High concentration in few currencies may expose you to significant exchange rate risk.',
        tips: [
          'Diversify into additional major currencies',
          'Consider international investments',
          'Natural hedging through matched assets/liabilities',
          'Consult financial advisor for currency strategy',
        ],
        color: colors?.error ?? '#ff6b9d',
        icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      };
    }
  };

  const diversificationInfo = getDiversificationInfo();

  const openDiversificationTooltip = () => {
    setShowDiversificationTooltip(true);
  };

  const closeDiversificationTooltip = () => {
    setShowDiversificationTooltip(false);
  };

  return (
    <Animated.View entering={FadeInUp.delay(200)} style={styles.container}>
    
      <Modal
        visible={showDiversificationTooltip}
        transparent
        animationType="fade"
        onRequestClose={closeDiversificationTooltip}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeDiversificationTooltip}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={cardGradient}
              style={styles.modalCardGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              {/* Header */}
              <View style={styles.tooltipHeader}>
                <Ionicons
                  name={diversificationInfo.icon}
                  size={24}
                  color={diversificationInfo.color}
                  style={styles.tooltipIcon}
                />
                <Text style={[styles.tooltipTitle, {color: primaryTextColor}]}>{diversificationInfo.title}</Text>
              </View>

              {/* Description */}
              <Text style={[styles.tooltipDescription, {color: secondaryTextColor}]}>
                {diversificationInfo.description}
              </Text>

              {/* Metrics block */}
              <View style={styles.metricsBlock}>
                <Text style={[styles.metricLine, {color: secondaryTextColor}]}>
                  Net Worth:{' '}
                  <Text style={{color: primaryTextColor}}>{formatSmartNumber(data.netWorth, userCurrency)}</Text>
                </Text>
                <Text style={[styles.metricLine, {color: secondaryTextColor}]}>
                  Assets: <Text style={{color: assetAccent}}>{formatSmartNumber(data.totalAssets, userCurrency)}</Text>
                </Text>
                <Text style={[styles.metricLine, {color: secondaryTextColor}]}>
                  Liabilities:{' '}
                  <Text style={{color: liabilityAccent}}>{formatSmartNumber(data.totalLiabilities, userCurrency)}</Text>
                </Text>
                <Text style={[styles.metricLine, {color: secondaryTextColor}]}>
                  Currencies: <Text style={{color: primaryTextColor}}>{uniqueCurrencies}</Text>
                </Text>
                <Text style={[styles.metricLine, {color: secondaryTextColor}]}>
                  Diversification Score: <Text style={{color: diversificationColor}}>{data.diversificationScore}%</Text>
                </Text>
              </View>

              {/* Tips */}
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsHeader, {color: primaryTextColor}]}>Recommendations:</Text>
                {diversificationInfo.tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={[styles.tipBullet, {color: diversificationColor}]}>•</Text>
                    <Text style={[styles.tipText, {color: secondaryTextColor}]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

     
      <View style={styles.cardWrapper}>
        <LinearGradient colors={headerGradient} style={styles.cardGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          {/* Animated background blob */}
          <Animated.View style={[styles.blobLayer, blobStyle]} />

          {/* Net Worth Section */}
          <View style={styles.netWorthSection}>
            <Text
              style={[
                styles.netWorthLabel,
                {
                  fontSize: fontSizes.body,
                  color: secondaryTextColor,
                },
              ]}>
              Net Worth
            </Text>
            <Text
              style={[
                styles.netWorthValue,
                {
                  color: data.netWorth >= 0 ? primaryTextColor : liabilityAccent,
                  fontSize: fontSizes.display * 1.02,
                },
              ]}>
              {formatSmartNumber(Math.round(animatedNumber), userCurrency)}
            </Text>
          </View>

          {/* Assets vs Liabilities Row */}
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <View style={styles.balanceHeader}>
                <View style={[styles.dot, {backgroundColor: assetAccent}]} />
                <Text
                  style={[
                    styles.balanceLabel,
                    {
                      fontSize: fontSizes.caption,
                      color: secondaryTextColor,
                    },
                  ]}>
                  Assets
                </Text>
              </View>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    fontSize: fontSizes.body,
                    color: assetAccent,
                  },
                ]}>
                {formatSmartNumber(data.totalAssets, userCurrency)}
              </Text>
            </View>

            <View style={styles.minusContainer}>
              <Text
                style={[
                  styles.minusSign,
                  {
                    fontSize: fontSizes.subtitle,
                    color: secondaryTextColor,
                  },
                ]}>
                −
              </Text>
            </View>

            <View style={styles.balanceItem}>
              <View style={styles.balanceHeader}>
                <View style={[styles.dot, {backgroundColor: liabilityAccent}]} />
                <Text
                  style={[
                    styles.balanceLabel,
                    {
                      fontSize: fontSizes.caption,
                      color: secondaryTextColor,
                    },
                  ]}>
                  Liabilities
                </Text>
              </View>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    fontSize: fontSizes.body,
                    color: liabilityAccent,
                  },
                ]}>
                {formatSmartNumber(data.totalLiabilities, userCurrency)}
              </Text>
            </View>
          </View>

          {/* Proportion Bar */}
          <View style={styles.proportionRow}>
            <View style={styles.proportionBarTrack}>
              <View
                style={[
                  styles.proportionChunk,
                  {
                    backgroundColor: assetAccent,
                    flex: assetsRatio,
                  },
                ]}
              />
              <View
                style={[
                  styles.proportionChunk,
                  {
                    backgroundColor: liabilityAccent,
                    flex: liabilitiesRatio,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.proportionText,
                {
                  fontSize: fontSizes.caption,
                  color: secondaryTextColor,
                },
              ]}>
              Assets vs Liabilities
            </Text>
          </View>

          {/* Currency Diversification Section */}
          <View style={styles.healthSection}>
            <View style={styles.healthHeader}>
              <View style={styles.healthTitleRow}>
                <Text
                  style={[
                    styles.healthLabel,
                    {
                      fontSize: fontSizes.caption,
                      color: secondaryTextColor,
                    },
                  ]}>
                  Currency Diversification
                </Text>
                <TouchableOpacity style={styles.infoIconButton} onPress={openDiversificationTooltip}>
                  <Ionicons name="information-circle-outline" size={16} color={secondaryTextColor} />
                </TouchableOpacity>
              </View>
              <Animated.View style={[styles.healthBadge, badgeStyle, {backgroundColor: diversificationColor + '20'}]}>
                <Text
                  style={[
                    styles.healthText,
                    {
                      fontSize: fontSizes.xs,
                      color: diversificationColor,
                    },
                  ]}>
                  {data.diversificationScore >= 85 ? 'Excellent' : data.diversificationScore >= 70 ? 'Good' : 'Limited'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.healthScoreCol}>
              <Text
                style={[
                  styles.healthScore,
                  {
                    fontSize: fontSizes.heading,
                    color: diversificationColor,
                  },
                ]}>
                {data.diversificationScore}%
              </Text>
              <View style={styles.healthProgressTrack}>
                <View
                  style={[
                    styles.healthProgressFill,
                    {
                      backgroundColor: diversificationColor,
                      width: `${Math.min(data.diversificationScore, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

// Use the exact same styles structure from NetWorthSummaryCard
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
    // Modal styles (same as original)
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
    // Tooltip content (same structure as original)
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
    // Main card styles (exact same as original)
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

export default CurrencyNetWorthCard;
