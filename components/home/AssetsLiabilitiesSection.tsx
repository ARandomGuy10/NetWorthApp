// components/home/AssetsLiabilitiesSection.tsx

import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Animated} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {LinearGradient} from 'expo-linear-gradient';
import {useTheme} from '../../src/styles/theme/ThemeContext';
import {Theme} from '@/lib/supabase';
import {formatCurrency, formatSmartNumber, makeGradientColors} from '@/utils/utils';

const {width: screenWidth} = Dimensions.get('window');

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

interface AssetsLiabilitiesSectionProps {
  netWorthData?: NetWorthData;
}

const AssetsLiabilitiesSection: React.FC<AssetsLiabilitiesSectionProps> = ({netWorthData}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // State for toggling between percentage and actual values
  const [showPercentage, setShowPercentage] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Animated values for feedback
  const [assetsScale] = useState(new Animated.Value(1));
  const [liabilitiesScale] = useState(new Animated.Value(1));

  // Calculate percentages
  const totalValue = (netWorthData?.totalAssets || 0) + (netWorthData?.totalLiabilities || 0);
  const assetsPercentage = totalValue > 0 ? ((netWorthData?.totalAssets || 0) / totalValue) * 100 : 0;
  const liabilitiesPercentage = totalValue > 0 ? ((netWorthData?.totalLiabilities || 0) / totalValue) * 100 : 0;

  // Get gradient colors using your utility function
  const gradientColors = makeGradientColors(theme);

  const handleChartPress = (chartType: 'assets' | 'liabilities') => {
    // Visual feedback animation
    const scaleValue = chartType === 'assets' ? assetsScale : liabilitiesScale;

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowPercentage(!showPercentage);
  };

  const handleLongPress = () => {
    setShowTooltip(true);
  };

  return (
    <>
      {/* Full width container */}
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientBackground}>
          <View style={styles.chartsContainer}>
            {/* Assets Chart */}
            <View style={styles.chartItem}>
              <Animated.View style={[styles.chartWrapper, {transform: [{scale: assetsScale}]}]}>
                <TouchableOpacity
                  onPress={() => handleChartPress('assets')}
                  onLongPress={handleLongPress}
                  activeOpacity={0.8}
                  style={styles.chartTouchable}>
                  <AnimatedCircularProgress
                    size={120}
                    width={10}
                    fill={assetsPercentage}
                    tintColor={theme.colors.asset}
                    backgroundColor={theme.colors.border?.primary || theme.colors.border}
                    rotation={0}
                    lineCap="round"
                    duration={1000}>
                    {() => (
                      <View style={styles.chartCenter}>
                        <Text style={styles.chartValue} numberOfLines={2} adjustsFontSizeToFit>
                          {showPercentage
                            ? `${Math.round(assetsPercentage)}%`
                            : formatSmartNumber(netWorthData?.totalAssets || 0, netWorthData?.currency)}
                        </Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.chartLabel}>Assets</Text>
              <View style={[styles.indicator, {backgroundColor: theme.colors.asset}]} />
            </View>

            {/* Liabilities Chart */}
            <View style={styles.chartItem}>
              <Animated.View style={[styles.chartWrapper, {transform: [{scale: liabilitiesScale}]}]}>
                <TouchableOpacity
                  onPress={() => handleChartPress('liabilities')}
                  onLongPress={handleLongPress}
                  activeOpacity={0.8}
                  style={styles.chartTouchable}>
                  <AnimatedCircularProgress
                    size={120}
                    width={10}
                    fill={liabilitiesPercentage}
                    tintColor={theme.colors.liability}
                    backgroundColor={theme.colors.border?.primary || theme.colors.border}
                    rotation={0}
                    lineCap="round"
                    duration={1000}>
                    {() => (
                      <View style={styles.chartCenter}>
                        <Text style={styles.chartValue} numberOfLines={2} adjustsFontSizeToFit>
                          {showPercentage
                            ? `${Math.round(liabilitiesPercentage)}%`
                            : formatSmartNumber(netWorthData?.totalLiabilities || 0, netWorthData?.currency)}
                        </Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.chartLabel}>Liabilities</Text>
              <View style={[styles.indicator, {backgroundColor: theme.colors.liability}]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Tooltip Modal */}
      <Modal transparent={true} visible={showTooltip} animationType="fade" onRequestClose={() => setShowTooltip(false)}>
        <View style={styles.tooltipOverlay}>
          <TouchableOpacity style={styles.tooltipTouchable} onPress={() => setShowTooltip(false)} activeOpacity={1}>
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipText}>💡 Tap the pie charts to toggle between percentages and values</Text>
              <Text style={styles.tooltipSubText}>Long press to show this tip again</Text>
              <TouchableOpacity style={styles.tooltipButton} onPress={() => setShowTooltip(false)}>
                <Text style={styles.tooltipButtonText}>Got it!</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

// ... rest of the styles remain the same
const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: screenWidth,
      marginBottom: theme.spacing.lg,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    gradientBackground: {
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    chartsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    chartItem: {
      alignItems: 'center',
      padding: theme.spacing.md,
      flex: 1,
    },
    chartWrapper: {
      borderRadius: 60,
    },
    chartTouchable: {
      borderRadius: 60,
      padding: 5,
    },
    chartCenter: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xs,
      width: 100,
    },
    chartValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text.onGradient,
      textAlign: 'center',
    },
    chartLabel: {
      fontSize: 16,
      color: theme.colors.text.onGradient,
      marginTop: theme.spacing.md,
      fontWeight: '600',
      opacity: 0.9,
    },
    indicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: theme.spacing.sm,
    },
    tooltipOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltipTouchable: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltipContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      marginHorizontal: theme.spacing.xl,
      maxWidth: screenWidth - theme.spacing.xl * 2,
      ...theme.shadows.lg,
      alignItems: 'center',
    },
    tooltipText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    tooltipSubText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      opacity: 0.8,
      marginBottom: theme.spacing.lg,
    },
    tooltipButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    tooltipButtonText: {
      color: theme.colors.text.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default AssetsLiabilitiesSection;
