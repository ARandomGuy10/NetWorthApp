// components/home/AssetsLiabilitiesSection.tsx

import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {LinearGradient} from 'expo-linear-gradient';
import {useTheme} from '../../src/styles/theme/ThemeContext';
import {Theme} from '@/lib/supabase';
import {formatSmartNumber, getGradientColors} from '@/src/utils/formatters';
import * as Haptics from 'expo-haptics';

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
  const [showInfo, setShowInfo] = useState(false);

  // Animated values for feedback and info
  const [assetsScale] = useState(new Animated.Value(1));
  const [liabilitiesScale] = useState(new Animated.Value(1));
  const [infoOpacity] = useState(new Animated.Value(0));
  const [infoScale] = useState(new Animated.Value(0.8));

  // Haptics callback
  const invokeHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Calculate percentages
  const totalValue = (netWorthData?.totalAssets || 0) + (netWorthData?.totalLiabilities || 0);
  const assetsPercentage = totalValue > 0 ? ((netWorthData?.totalAssets || 0) / totalValue) * 100 : 0;
  const liabilitiesPercentage = totalValue > 0 ? ((netWorthData?.totalLiabilities || 0) / totalValue) * 100 : 0;

  // Auto-hide with glassmorphic animations
  useEffect(() => {
    if (showInfo) {
      // Smooth glassmorphic entrance
      Animated.parallel([
        Animated.timing(infoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(infoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(infoOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(infoScale, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowInfo(false);
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showInfo, infoOpacity, infoScale]);

  const handleChartPress = (chartType: 'assets' | 'liabilities') => {
    // Add haptic feedback
    invokeHaptic();

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

  // Show info with animation
  const handleInfoPress = () => {
    // Add haptic feedback
    invokeHaptic();

    if (!showInfo) {
      setShowInfo(true);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors(theme, 'card')}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientBackground}>
        {/* Info icon in top right */}
        <TouchableOpacity style={styles.infoIcon} onPress={handleInfoPress} activeOpacity={0.7}>
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </TouchableOpacity>

        {/* ✅ Fixed: Better positioned info overlay with single line text */}
        {showInfo && (
          <Animated.View
            style={[
              styles.infoOverlay,
              {
                opacity: infoOpacity,
                transform: [{scale: infoScale}],
              },
            ]}>
            <View style={styles.glassContainer}>
              <View style={styles.infoContent}>
                <Text style={styles.infoEmoji}>👆</Text>
                <Text style={styles.infoText}>Tap to toggle values</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.chartsContainer}>
          {/* Assets Chart */}
          <View style={styles.chartItem}>
            <TouchableOpacity
              onPress={() => handleChartPress('assets')}
              activeOpacity={0.8}
              style={styles.chartTouchable}>
              <Animated.View style={[styles.chartWrapper, {transform: [{scale: assetsScale}]}]}>
                <AnimatedCircularProgress
                  size={120}
                  width={12}
                  fill={assetsPercentage}
                  tintColor={theme.colors.asset}
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                  rotation={0}
                  lineCap="round"
                  duration={2000}>
                  {() => (
                    <View style={styles.chartCenter}>
                      <Text style={styles.chartValue}>
                        {showPercentage
                          ? `${Math.round(assetsPercentage)}%`
                          : formatSmartNumber(netWorthData?.totalAssets || 0, netWorthData?.currency)}
                      </Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.chartLabel}>Assets</Text>
          </View>

          {/* Liabilities Chart */}
          <View style={styles.chartItem}>
            <TouchableOpacity
              onPress={() => handleChartPress('liabilities')}
              activeOpacity={0.8}
              style={styles.chartTouchable}>
              <Animated.View style={[styles.chartWrapper, {transform: [{scale: liabilitiesScale}]}]}>
                <AnimatedCircularProgress
                  size={120}
                  width={12}
                  fill={liabilitiesPercentage}
                  tintColor={theme.colors.liability}
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                  rotation={0}
                  lineCap="round"
                  duration={2000}>
                  {() => (
                    <View style={styles.chartCenter}>
                      <Text style={styles.chartValue}>
                        {showPercentage
                          ? `${Math.round(liabilitiesPercentage)}%`
                          : formatSmartNumber(netWorthData?.totalLiabilities || 0, netWorthData?.currency)}
                      </Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.chartLabel}>Liabilities</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: screenWidth,
      paddingBottom: theme.spacing.xxl,
      overflow: 'hidden',
    },
    gradientBackground: {
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      position: 'relative',
    },
    // Info icon stays in top right
    infoIcon: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 10,
    },
    infoIconCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    infoIconText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text.onGradient,
      opacity: 0.9,
    },
    // ✅ Fixed: Better positioning - right below the icon, not interfering with charts
    infoOverlay: {
      position: 'absolute',
      top: theme.spacing.md, // Right below the info icon
      right: theme.spacing.md + 30,
      width: 160, // ✅ Wider container for single line text
      zIndex: 5,
    },
    // Glassmorphic glass container
    glassContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
      overflow: 'hidden',
    },
    // Compact content layout
    infoContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm, // ✅ Reduced padding for better fit
      paddingVertical: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    infoEmoji: {
      fontSize: 14, // ✅ Slightly smaller emoji
    },
    // ✅ Fixed: Single line text with shorter message
    infoText: {
      fontSize: 11, // ✅ Slightly smaller font to ensure single line
      fontWeight: '600',
      color: theme.colors.text.onGradient,
      opacity: 0.95,
      flex: 1,
    },
    chartsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      marginTop: theme.spacing.md,
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
  });

export default AssetsLiabilitiesSection;
