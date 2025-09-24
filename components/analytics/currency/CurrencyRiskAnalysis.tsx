import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {formatSmartNumber} from '@/src/utils/formatters';
import {LinearGradient} from 'expo-linear-gradient';
import {CURRENCIES} from '@/lib/supabase'; // ✅ ONLY CHANGE: Added import

interface CurrencyRiskAnalysisProps {
  data: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    diversificationScore: number;
    baseCurrency: string;
    assets: Array<{currency: string; amount: number; percentage: number}>;
    liabilities: Array<{currency: string; amount: number; percentage: number}>;
    allCurrencies: Array<{currency: string; assets: number; liabilities: number; total: number}>;
  };
  theme: any;
  userCurrency: string;
}

// ✅ ONLY CHANGE: Enhanced currency volatility classification using official currency list
const getCurrencyVolatilityGroup = (currency: string): 'stable' | 'moderate' | 'volatile' => {
  // Validate currency is supported
  if (!CURRENCIES.includes(currency)) {
    console.warn(`Unsupported currency in risk analysis: ${currency}`);
    return 'volatile'; // Default to highest risk for unknown currencies
  }

  // Major reserve currencies - truly the most stable
  const stable = ['USD', 'EUR', 'JPY', 'CHF'];

  // Developed economies with established central banks - moderate volatility
  const moderate = ['CAD', 'AUD', 'NZD', 'SEK', 'NOK', 'DKK', 'SGD', 'HKD', 'ILS'];

  // European currencies (stable due to EU proximity)
  const europeanStable = ['BGN', 'CZK', 'HUF', 'PLN', 'RON'];

  // All others are considered volatile (including GBP due to Brexit, emerging markets, etc.)
  if (stable.includes(currency)) return 'stable';
  if (moderate.includes(currency) || europeanStable.includes(currency)) return 'moderate';
  return 'volatile';
};

const CurrencyRiskAnalysis: React.FC<CurrencyRiskAnalysisProps> = ({data, theme, userCurrency}) => {
  const styles = getStyles(theme);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Simplified risk calculation
  const getSimplifiedRiskLevel = (foreignExposure: number) => {
    if (foreignExposure <= 0.2)
      return {level: 'Low', color: theme.colors?.status?.success || '#00d4aa', icon: 'shield-checkmark'};
    if (foreignExposure <= 0.5)
      return {level: 'Medium', color: theme.colors?.status?.warning || '#ffd700', icon: 'warning'};
    return {level: 'High', color: theme.colors?.status?.error || '#ff6b9d', icon: 'alert-circle'};
  };

  // Calculate risk metrics
  const baseCurrencyAssetExposure = data.assets.find(a => a.currency === userCurrency)?.percentage || 0;
  const baseCurrencyLiabilityExposure = data.liabilities.find(l => l.currency === userCurrency)?.percentage || 0;

  const foreignAssetExposure = 1 - baseCurrencyAssetExposure;
  const foreignLiabilityExposure = 1 - baseCurrencyLiabilityExposure;

  const assetRisk = getSimplifiedRiskLevel(foreignAssetExposure);
  const liabilityRisk = getSimplifiedRiskLevel(foreignLiabilityExposure);

  // Net exposure calculations
  const netExposureByCurrency = new Map<
    string,
    {
      amount: number;
      isHedged: boolean;
      volatilityGroup: 'stable' | 'moderate' | 'volatile';
    }
  >();

  // Process assets
  data.assets.forEach(asset => {
    const current = netExposureByCurrency.get(asset.currency) || {
      amount: 0,
      isHedged: false,
      volatilityGroup: getCurrencyVolatilityGroup(asset.currency),
    };
    netExposureByCurrency.set(asset.currency, {
      ...current,
      amount: current.amount + asset.amount,
    });
  });

  // Process liabilities and determine hedging
  data.liabilities.forEach(liability => {
    const current = netExposureByCurrency.get(liability.currency) || {
      amount: 0,
      isHedged: false,
      volatilityGroup: getCurrencyVolatilityGroup(liability.currency),
    };
    const newAmount = current.amount - liability.amount;
    const hasAssets = data.assets.some(a => a.currency === liability.currency);

    netExposureByCurrency.set(liability.currency, {
      ...current,
      amount: newAmount,
      isHedged: hasAssets && Math.abs(newAmount) < Math.max(current.amount, liability.amount) * 0.5,
      volatilityGroup: getCurrencyVolatilityGroup(liability.currency),
    });
  });

  // Enhanced net exposures with context
  const netExposures = Array.from(netExposureByCurrency.entries())
    .map(([currency, details]) => ({
      currency,
      ...details,
      exposurePercent: Math.abs(details.amount) / Math.abs(data.netWorth),
    }))
    .filter(item => Math.abs(item.amount) > 0.01)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  // Tooltip content
  const getTooltipContent = (type: string) => {
    switch (type) {
      case 'risk-levels':
        return {
          title: 'How Risk Levels Work',
          content: [
            'We assess your exchange rate risk based on how much of your wealth is in foreign currencies:',
            '',
            '🟢 Low Risk (0-20%): Minimal foreign exposure',
            '🟡 Medium Risk (20-50%): Moderate foreign exposure',
            '🔴 High Risk (50%+): High foreign exposure',
            '',
            'Foreign currency = any currency other than your base currency (' + userCurrency + ')',
          ],
        };
      case 'natural-hedging':
        return {
          title: 'Natural Currency Hedging',
          content: [
            'When you have both assets and liabilities in the same foreign currency, they naturally offset each other.',
            '',
            'Example with EUR:',
            '• €10,000 in European stocks (asset)',
            '• €6,000 European mortgage (liability)',
            '• Net EUR exposure = €4,000 (not €10,000)',
            '',
            'Currency movements affect both sides, reducing your overall risk.',
          ],
        };
      case 'volatility':
        return {
          title: 'Currency Stability Groups',
          content: [
            'Different currencies have different volatility patterns:',
            '',
            '🟢 Stable: USD, EUR, JPY, CHF',
            '• Major reserve currencies',
            '• Deep global markets, lower volatility',
            '',
            '🟡 Moderate: CAD, AUD, SEK, NOK, SGD, etc.',
            '• Developed country currencies',
            '• Generally stable with some fluctuation',
            '',
            '🔴 Volatile: GBP, BRL, TRY, ZAR, etc.',
            '• Political uncertainty or emerging markets',
            '• Higher potential for large swings',
          ],
        };
      default:
        return {title: '', content: []};
    }
  };

  const showTooltip = (type: string) => setActiveTooltip(type);
  const hideTooltip = () => setActiveTooltip(null);

  // Use proper card gradient
  const cardGradient = theme.colors?.gradient?.card ??
    theme.colors?.gradient?.primary ?? ['#1a1a2e', '#16213e', '#0f4c75'];

  return (
    <View style={styles.container}>
      {/* Tooltip Modal */}
      <Modal visible={activeTooltip !== null} transparent animationType="fade" onRequestClose={hideTooltip}>
        <View style={styles.tooltipOverlay}>
          <TouchableOpacity style={styles.tooltipTouchArea} activeOpacity={1} onPress={hideTooltip}>
            <View style={styles.tooltipModal}>
              <LinearGradient colors={cardGradient} style={styles.tooltipGradient}>
                {activeTooltip && (
                  <>
                    <Text style={styles.tooltipTitle}>{getTooltipContent(activeTooltip).title}</Text>
                    <View style={styles.tooltipContent}>
                      {getTooltipContent(activeTooltip).content.map((line, index) => (
                        <Text key={index} style={styles.tooltipText}>
                          {line}
                        </Text>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.tooltipCloseButton} onPress={hideTooltip}>
                      <Text style={styles.tooltipCloseText}>Got it</Text>
                    </TouchableOpacity>
                  </>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[theme.colors?.primary + '20' || '#4facfe20', 'transparent']}
          style={styles.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={28} color={theme.colors?.primary || '#4facfe'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Currency Risk Analysis</Text>
              <Text style={styles.headerSubtitle}>Exchange rate exposure assessment</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Risk Assessment */}
      <View style={styles.riskSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exchange Rate Risk</Text>
          <TouchableOpacity style={styles.tooltipButton} onPress={() => showTooltip('risk-levels')}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors?.text?.secondary || '#b8c6db'} />
          </TouchableOpacity>
        </View>

        <View style={styles.riskGrid}>
          <View style={styles.riskCard}>
            <View style={styles.riskCardHeader}>
              <Ionicons name={assetRisk.icon as any} size={24} color={assetRisk.color} />
              <View style={[styles.riskBadge, {backgroundColor: assetRisk.color + '20'}]}>
                <Text style={[styles.riskLevel, {color: assetRisk.color}]}>{assetRisk.level}</Text>
              </View>
            </View>
            <Text style={styles.riskCardTitle}>Assets</Text>
            <Text style={styles.riskCardValue}>{Math.round(foreignAssetExposure * 100)}%</Text>
            <Text style={styles.riskCardDescription}>Foreign currency exposure</Text>
          </View>

          <View style={styles.riskCard}>
            <View style={styles.riskCardHeader}>
              <Ionicons name={liabilityRisk.icon as any} size={24} color={liabilityRisk.color} />
              <View style={[styles.riskBadge, {backgroundColor: liabilityRisk.color + '20'}]}>
                <Text style={[styles.riskLevel, {color: liabilityRisk.color}]}>{liabilityRisk.level}</Text>
              </View>
            </View>
            <Text style={styles.riskCardTitle}>Liabilities</Text>
            <Text style={styles.riskCardValue}>{Math.round(foreignLiabilityExposure * 100)}%</Text>
            <Text style={styles.riskCardDescription}>Foreign currency debt</Text>
          </View>
        </View>
      </View>

      {/* Currency Positions - Only show if there are any */}
      {netExposures.length > 0 && (
        <View style={styles.exposureSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Currency Positions</Text>
            <TouchableOpacity style={styles.tooltipButton} onPress={() => showTooltip('natural-hedging')}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.colors?.text?.secondary || '#b8c6db'}
              />
            </TouchableOpacity>
          </View>

          {/* List container matching CategoryPerformanceList */}
          <View style={styles.listContainer}>
            {netExposures.slice(0, 6).map((exposure, index) => (
              <View
                key={exposure.currency}
                style={[styles.exposureItem, index === netExposures.slice(0, 6).length - 1 && styles.lastExposureItem]}>
                {/* Currency Icon */}
                <View
                  style={[
                    styles.currencyIconContainer,
                    {backgroundColor: getVolatilityColor(exposure.volatilityGroup, theme) + '15'},
                  ]}>
                  <Text style={[styles.currencyIcon, {color: getVolatilityColor(exposure.volatilityGroup, theme)}]}>
                    {exposure.currency}
                  </Text>
                </View>

                <View style={styles.exposureMain}>
                  <View style={styles.exposureHeader}>
                    <Text style={styles.exposureCurrency}>{exposure.currency}</Text>
                    <View style={styles.exposureIndicators}>
                      {exposure.isHedged && (
                        <TouchableOpacity
                          style={[
                            styles.hedgeBadge,
                            {backgroundColor: theme.colors?.status?.info + '20' || '#4facfe20'},
                          ]}
                          onPress={() => showTooltip('natural-hedging')}>
                          <Ionicons name="shield-checkmark" size={12} color={theme.colors?.status?.info || '#4facfe'} />
                          <Text style={[styles.hedgeText, {color: theme.colors?.status?.info || '#4facfe'}]}>
                            Hedged
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[
                          styles.volatilityBadge,
                          {backgroundColor: getVolatilityColor(exposure.volatilityGroup, theme) + '20'},
                        ]}
                        onPress={() => showTooltip('volatility')}>
                        <Text
                          style={[styles.volatilityText, {color: getVolatilityColor(exposure.volatilityGroup, theme)}]}>
                          {exposure.volatilityGroup}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.exposurePercent}>{Math.round(exposure.exposurePercent * 100)}% of net worth</Text>
                </View>

                <View style={styles.exposureRight}>
                  <Text
                    style={[
                      styles.exposureAmount,
                      {
                        color:
                          exposure.amount >= 0
                            ? theme.colors?.status?.success || '#00d4aa'
                            : theme.colors?.status?.error || '#ff6b9d',
                      },
                    ]}>
                    {exposure.amount >= 0 ? '+' : ''}
                    {formatSmartNumber(exposure.amount, userCurrency)}
                  </Text>
                  <Ionicons
                    name={exposure.amount >= 0 ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={
                      exposure.amount >= 0
                        ? theme.colors?.status?.success || '#00d4aa'
                        : theme.colors?.status?.error || '#ff6b9d'
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// Helper function
const getVolatilityColor = (group: string, theme: any) => {
  switch (group) {
    case 'stable':
      return theme.colors?.status?.success || '#00d4aa';
    case 'moderate':
      return theme.colors?.status?.warning || '#ffd700';
    case 'volatile':
      return theme.colors?.status?.error || '#ff6b9d';
    default:
      return theme.colors?.text?.secondary || '#b8c6db';
  }
};

// Styling
const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors?.surface?.primary || '#1a1a2e',
      borderRadius: theme.borderRadius?.xl || 20,
      marginHorizontal: 0,
      shadowColor: theme.colors?.shadow || '#000000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: theme.spacing?.xl || 20,
      overflow: 'hidden',
    },
    header: {
      marginBottom: theme.spacing?.lg || 16,
    },
    headerGradient: {
      padding: theme.spacing?.lg || 16,
      borderTopLeftRadius: theme.borderRadius?.xl || 20,
      borderTopRightRadius: theme.borderRadius?.xl || 20,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      marginRight: theme.spacing?.md || 12,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors?.primary + '20' || '#4facfe20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: theme.fontSizes?.subtitle || 18,
      fontWeight: '800',
      color: theme.colors?.text?.primary || '#ffffff',
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
      fontWeight: '500',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing?.md || 12,
      paddingHorizontal: theme.spacing?.lg || 16,
    },
    sectionTitle: {
      fontSize: theme.fontSizes?.body || 14,
      fontWeight: '700',
      color: theme.colors?.text?.primary || '#ffffff',
      flex: 1,
    },
    tooltipButton: {
      padding: theme.spacing?.xs || 4,
      marginLeft: theme.spacing?.xs || 4,
    },
    riskSection: {
      marginBottom: theme.spacing?.xl || 20,
    },
    riskGrid: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing?.lg || 16,
      gap: theme.spacing?.md || 12,
    },
    riskCard: {
      flex: 1,
      backgroundColor: theme.colors?.surface?.secondary || 'rgba(255,255,255,0.05)',
      borderRadius: theme.borderRadius?.lg || 16,
      padding: theme.spacing?.md || 12,
    },
    riskCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing?.sm || 8,
    },
    riskCardTitle: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
      fontWeight: '600',
      marginBottom: 4,
    },
    riskCardValue: {
      fontSize: theme.fontSizes?.title || 20,
      fontWeight: '800',
      color: theme.colors?.text?.primary || '#ffffff',
      marginBottom: 4,
    },
    riskCardDescription: {
      fontSize: theme.fontSizes?.xs || 10,
      color: theme.colors?.text?.secondary || '#b8c6db',
    },
    riskBadge: {
      paddingHorizontal: theme.spacing?.xs || 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius?.sm || 8,
    },
    riskLevel: {
      fontSize: theme.fontSizes?.xs || 10,
      fontWeight: '700',
    },
    exposureSection: {
      paddingBottom: theme.spacing?.lg || 16,
    },
    // List container matching CategoryPerformanceList exactly
    listContainer: {
      backgroundColor: theme.colors?.background?.card || theme.colors?.surface?.secondary,
      borderRadius: theme.borderRadius?.lg || 16,
      overflow: 'hidden',
    },
    exposureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingVertical: theme.spacing?.md || 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors?.border?.primary || 'rgba(255,255,255,0.1)',
      backgroundColor: theme.colors?.background?.card || theme.colors?.surface?.secondary,
    },
    lastExposureItem: {
      borderBottomWidth: 0,
    },
    currencyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing?.md || 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    currencyIcon: {
      fontSize: 12,
      fontWeight: '800',
    },
    exposureMain: {
      flex: 1,
    },
    exposureHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing?.xs || 4,
    },
    exposureCurrency: {
      fontSize: theme.fontSizes?.subtitle || 16,
      fontWeight: '700',
      color: theme.colors?.text?.primary || '#ffffff',
    },
    exposureIndicators: {
      flexDirection: 'row',
      gap: theme.spacing?.xs || 4,
    },
    hedgeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 2,
    },
    hedgeText: {
      fontSize: theme.fontSizes?.xs || 10,
      fontWeight: '600',
    },
    volatilityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
    },
    volatilityText: {
      fontSize: theme.fontSizes?.xs || 10,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    exposurePercent: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
    },
    exposureRight: {
      alignItems: 'flex-end',
      marginLeft: theme.spacing?.md || 12,
      minWidth: 100,
    },
    exposureAmount: {
      fontSize: theme.fontSizes?.subtitle || 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    // Tooltip styles
    tooltipOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltipTouchArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing?.lg || 16,
    },
    tooltipModal: {
      width: '100%',
      maxWidth: 350,
      borderRadius: theme.borderRadius?.xl || 20,
      overflow: 'hidden',
      marginHorizontal: theme.spacing?.lg || 16,
    },
    tooltipGradient: {
      padding: theme.spacing?.xl || 20,
      borderRadius: theme.borderRadius?.xl || 20,
    },
    tooltipTitle: {
      fontSize: theme.fontSizes?.subtitle || 18,
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: theme.spacing?.md || 12,
      textAlign: 'center',
    },
    tooltipContent: {
      marginBottom: theme.spacing?.lg || 16,
    },
    tooltipText: {
      fontSize: theme.fontSizes?.body || 14,
      color: '#ffffff',
      lineHeight: 20,
      marginBottom: theme.spacing?.xs || 4,
    },
    tooltipCloseButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: theme.borderRadius?.lg || 16,
      paddingVertical: theme.spacing?.md || 12,
      alignItems: 'center',
    },
    tooltipCloseText: {
      fontSize: theme.fontSizes?.body || 14,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

export default CurrencyRiskAnalysis;
