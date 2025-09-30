import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {formatSmartNumber} from '@/src/utils/formatters';
import {LinearGradient} from 'expo-linear-gradient';

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

const CurrencyRiskAnalysis: React.FC<CurrencyRiskAnalysisProps> = ({data, theme, userCurrency}) => {
  const styles = getStyles(theme);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // State for dynamic list height
  const [rowHeight, setRowHeight] = useState(68); // Default estimate
  const maxVisibleRows = 6;

  // ✅ SAFE: Simple exposure calculation with colors but neutral language
  const getExposureLevel = (foreignExposure: number) => {
    if (foreignExposure <= 0.2)
      return {level: 'Low', color: theme.colors?.status?.success || '#00d4aa', icon: 'information-circle'};
    if (foreignExposure <= 0.5)
      return {level: 'Medium', color: theme.colors?.status?.warning || '#ffd700', icon: 'information-circle'};
    return {level: 'High', color: theme.colors?.status?.info || '#4facfe', icon: 'information-circle'};
  };

  // Calculate exposure metrics
  const baseCurrencyAssetExposure = data.assets.find(a => a.currency === userCurrency)?.percentage || 0;
  const baseCurrencyLiabilityExposure = data.liabilities.find(l => l.currency === userCurrency)?.percentage || 0;

  const foreignAssetExposure = 1 - baseCurrencyAssetExposure;
  const foreignLiabilityExposure = 1 - baseCurrencyLiabilityExposure;

  const assetExposure = getExposureLevel(foreignAssetExposure);
  const liabilityExposure = getExposureLevel(foreignLiabilityExposure);

  // ✅ FIXED: Calculate net positions with proper +/- indicators
  const netExposureByCurrency = new Map<string, {amount: number; isHedged: boolean}>();

  // Process assets
  data.assets.forEach(asset => {
    const current = netExposureByCurrency.get(asset.currency) || {amount: 0, isHedged: false};
    netExposureByCurrency.set(asset.currency, {
      ...current,
      amount: current.amount + asset.amount,
    });
  });

  // Process liabilities and determine hedging
  data.liabilities.forEach(liability => {
    const current = netExposureByCurrency.get(liability.currency) || {amount: 0, isHedged: false};
    const newAmount = current.amount - liability.amount;
    const hasAssets = data.assets.some(a => a.currency === liability.currency);

    netExposureByCurrency.set(liability.currency, {
      amount: newAmount,
      isHedged: hasAssets && Math.abs(newAmount) < Math.max(current.amount, liability.amount) * 0.5,
    });
  });

  // Enhanced net exposures with context
  const netExposures = Array.from(netExposureByCurrency.entries())
    .map(([currency, details]) => ({
      currency,
      ...details,
      exposurePercent: Math.abs(details.amount) / Math.abs(data.netWorth),
      isNetAsset: details.amount > 0, // ✅ FIXED: Track if net asset or liability
    }))
    .filter(item => Math.abs(item.amount) > 0.01)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  // ✅ SAFE: Factual tooltip content with disclaimers
  const getTooltipContent = (type: string) => {
    switch (type) {
      case 'exposure-levels':
        return {
          title: 'Currency Exposure Information',
          content: [
            'This shows what percentage of your wealth is in currencies other than your base currency.',
            '',
            '• Low (0-20%): Most wealth in base currency',
            '• Medium (20-50%): Moderate foreign currency holdings',
            '• High (50%+): Majority in foreign currencies',
            '',
            'Base currency: ' + userCurrency,
            '',
            'This is informational only. Consult a financial advisor for investment decisions.',
          ],
        };
      case 'natural-hedging':
        return {
          title: 'Currency Matching',
          content: [
            'When you have both assets and liabilities in the same currency, they may offset each other.',
            '',
            'Example:',
            '• €10,000 European investment (asset)',
            '• €6,000 European mortgage (liability)',
            '• Net EUR position = +€4,000',
            '',
            'Currency movements affect both positions. This information is educational only.',
          ],
        };
      case 'net-positions':
        return {
          title: 'Net Currency Positions',
          content: [
            'Net position = Total assets - Total liabilities in each currency',
            '',
            '+ Positive = You have more assets than liabilities',
            '- Negative = You have more liabilities than assets',
            '',
            'These positions may be affected by currency exchange rate changes.',
            '',
            'This information is for educational purposes only.',
          ],
        };
      default:
        return {title: '', content: []};
    }
  };

  // Callback to measure the first row for dynamic maxHeight
  const onFirstRowLayout = useCallback((event: any) => {
    const {height} = event.nativeEvent.layout;
    if (height > 0 && height !== rowHeight) {
      setRowHeight(height);
    }
  }, []);

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
              <Ionicons name="analytics-outline" size={28} color={theme.colors?.primary || '#4facfe'} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Currency Exposure Analysis</Text>
              <Text style={styles.headerSubtitle}>Portfolio currency distribution</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ FIXED: Exposure Assessment with colors */}
      <View style={styles.exposureSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Currency Exposure</Text>
          <TouchableOpacity style={styles.tooltipButton} onPress={() => showTooltip('exposure-levels')}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors?.text?.secondary || '#b8c6db'} />
          </TouchableOpacity>
        </View>

        <View style={styles.exposureGrid}>
          <View style={styles.exposureCard}>
            <View style={styles.exposureCardHeader}>
              <Ionicons name={assetExposure.icon as any} size={24} color={assetExposure.color} />
              <View style={[styles.exposureBadge, {backgroundColor: assetExposure.color + '20'}]}>
                <Text style={[styles.exposureLevel, {color: assetExposure.color}]}>{assetExposure.level}</Text>
              </View>
            </View>
            <Text style={styles.exposureCardTitle}>Assets</Text>
            <Text style={styles.exposureCardValue}>{Math.round(foreignAssetExposure * 100)}%</Text>
            <Text style={styles.exposureCardDescription}>Non-{userCurrency} exposure</Text>
          </View>

          <View style={styles.exposureCard}>
            <View style={styles.exposureCardHeader}>
              <Ionicons name={liabilityExposure.icon as any} size={24} color={liabilityExposure.color} />
              <View style={[styles.exposureBadge, {backgroundColor: liabilityExposure.color + '20'}]}>
                <Text style={[styles.exposureLevel, {color: liabilityExposure.color}]}>{liabilityExposure.level}</Text>
              </View>
            </View>
            <Text style={styles.exposureCardTitle}>Liabilities</Text>
            <Text style={styles.exposureCardValue}>{Math.round(foreignLiabilityExposure * 100)}%</Text>
            <Text style={styles.exposureCardDescription}>Non-{userCurrency} debt</Text>
          </View>
        </View>
      </View>

      {/* ✅ FIXED: Currency Positions with labels under values */}
      {netExposures.length > 0 && (
        <View style={styles.positionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Net Currency Positions</Text>
            <TouchableOpacity style={styles.tooltipButton} onPress={() => showTooltip('net-positions')}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.colors?.text?.secondary || '#b8c6db'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={[styles.listContainer, {maxHeight: rowHeight * maxVisibleRows}]}
            showsVerticalScrollIndicator={false}>
            {netExposures.map((exposure, index) => (
              <View
                key={exposure.currency}
                onLayout={index === 0 ? onFirstRowLayout : undefined}
                style={[styles.positionItem, index === netExposures.length - 1 && styles.lastPositionItem]}>
                {/* ✅ FIXED: Beautiful circular currency icon with border */}
                <View
                  style={[
                    styles.currencyIconContainer,
                    {
                      backgroundColor:
                        (exposure.isNetAsset ? theme.colors?.status?.success : theme.colors?.status?.error) + '15' ||
                        '#00d4aa15',
                      borderColor: exposure.isNetAsset
                        ? theme.colors?.status?.success || '#00d4aa'
                        : theme.colors?.status?.error || '#ff6b9d',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.currencyIcon,
                      {
                        color: exposure.isNetAsset
                          ? theme.colors?.status?.success || '#00d4aa'
                          : theme.colors?.status?.error || '#ff6b9d',
                      },
                    ]}>
                    {exposure.currency}
                  </Text>
                </View>

                <View style={styles.positionMain}>
                  <View style={styles.positionHeader}>
                    <Text style={styles.positionCurrency}>{exposure.currency}</Text>
                    <View style={styles.positionIndicators}>
                      {exposure.isHedged && (
                        <TouchableOpacity
                          style={[
                            styles.hedgeBadge,
                            {backgroundColor: theme.colors?.status?.info + '20' || '#4facfe20'},
                          ]}
                          onPress={() => showTooltip('natural-hedging')}>
                          <Ionicons name="link-outline" size={12} color={theme.colors?.status?.info || '#4facfe'} />
                          <Text style={[styles.hedgeText, {color: theme.colors?.status?.info || '#4facfe'}]}>
                            Matched
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Text style={styles.positionPercent}>{Math.round(exposure.exposurePercent * 100)}% of net worth</Text>
                </View>

                {/* ✅ FIXED: Amount with Net Asset/Liability label underneath */}
                <View style={styles.positionRight}>
                  <Text
                    style={[
                      styles.positionAmount,
                      {
                        color: exposure.isNetAsset
                          ? theme.colors?.status?.success || '#00d4aa'
                          : theme.colors?.status?.error || '#ff6b9d',
                      },
                    ]}>
                    {exposure.isNetAsset ? '+' : '-'}
                    {formatSmartNumber(Math.abs(exposure.amount), userCurrency)}
                  </Text>
                  {/* ✅ KEPT: Net Asset/Liability label under the value */}
                  <Text
                    style={[
                      styles.positionLabel,
                      {
                        color: exposure.isNetAsset
                          ? theme.colors?.status?.success || '#00d4aa'
                          : theme.colors?.status?.error || '#ff6b9d',
                      },
                    ]}>
                    Net {exposure.isNetAsset ? 'Asset' : 'Liability'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ✅ SAFE: Add disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This information is for educational purposes only and does not constitute financial advice. Currency values
          fluctuate and past performance does not guarantee future results.
        </Text>
      </View>
    </View>
  );
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
    exposureSection: {
      marginBottom: theme.spacing?.xl || 20,
    },
    exposureGrid: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing?.lg || 16,
      gap: theme.spacing?.md || 12,
    },
    exposureCard: {
      flex: 1,
      backgroundColor: theme.colors?.surface?.secondary || 'rgba(255,255,255,0.05)',
      borderRadius: theme.borderRadius?.lg || 16,
      padding: theme.spacing?.md || 12,
    },
    exposureCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing?.sm || 8,
    },
    exposureCardTitle: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
      fontWeight: '600',
      marginBottom: 4,
    },
    exposureCardValue: {
      fontSize: theme.fontSizes?.title || 20,
      fontWeight: '800',
      color: theme.colors?.text?.primary || '#ffffff',
      marginBottom: 4,
    },
    exposureCardDescription: {
      fontSize: theme.fontSizes?.xs || 10,
      color: theme.colors?.text?.secondary || '#b8c6db',
    },
    exposureBadge: {
      paddingHorizontal: theme.spacing?.xs || 6,
      paddingVertical: 2,
      borderRadius: theme.borderRadius?.sm || 8,
    },
    exposureLevel: {
      fontSize: theme.fontSizes?.xs || 10,
      fontWeight: '700',
    },
    positionsSection: {
      marginBottom: theme.spacing?.lg || 16,
    },
    listContainer: {
      // maxHeight is now set dynamically
    },
    positionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingVertical: theme.spacing?.md || 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors?.border?.primary || 'rgba(255,255,255,0.1)',
      backgroundColor: theme.colors?.background?.card || theme.colors?.surface?.secondary,
    },
    lastPositionItem: {
      borderBottomWidth: 0,
    },
    // ✅ FIXED: Beautiful circular icon with border like original
    currencyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing?.md || 12,
      borderWidth: 2, // ✅ Nice circular border restored
    },
    currencyIcon: {
      fontSize: 12,
      fontWeight: '800',
    },
    positionMain: {
      flex: 1,
    },
    positionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing?.xs || 4,
    },
    positionCurrency: {
      fontSize: theme.fontSizes?.subtitle || 16,
      fontWeight: '700',
      color: theme.colors?.text?.primary || '#ffffff',
    },
    positionIndicators: {
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
    positionPercent: {
      fontSize: theme.fontSizes?.caption || 12,
      color: theme.colors?.text?.secondary || '#b8c6db',
    },
    positionRight: {
      alignItems: 'flex-end',
      marginLeft: theme.spacing?.md || 12,
      minWidth: 100,
    },
    positionAmount: {
      fontSize: theme.fontSizes?.subtitle || 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    // ✅ KEPT: Style for Net Asset/Liability label
    positionLabel: {
      fontSize: theme.fontSizes?.xs || 10,
      fontWeight: '600',
    },
    // ✅ SAFE: Disclaimer section
    disclaimerContainer: {
      padding: theme.spacing?.md || 12,
      backgroundColor: theme.colors?.surface?.secondary || 'rgba(255,255,255,0.05)',
      borderRadius: theme.borderRadius?.lg || 16,
      margin: theme.spacing?.lg || 16,
    },
    disclaimerText: {
      fontSize: theme.fontSizes?.xs || 10,
      color: theme.colors?.text?.secondary || '#b8c6db',
      textAlign: 'center',
      lineHeight: 14,
    },
    // Tooltip styles (same as before)
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
