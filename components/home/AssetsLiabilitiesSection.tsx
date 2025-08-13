// components/home/AssetsLiabilitiesSection.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { formatCurrency, formatSmartNumber, makeGradientColors } from '@/utils/utils';

const { width: screenWidth } = Dimensions.get('window');

interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

interface AssetsLiabilitiesSectionProps {
  netWorthData?: NetWorthData;
}

const AssetsLiabilitiesSection: React.FC<AssetsLiabilitiesSectionProps> = ({ netWorthData }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // State for toggling between percentage and actual values
  const [showPercentage, setShowPercentage] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  // Animated values for feedback and info
  const [assetsScale] = useState(new Animated.Value(1));
  const [liabilitiesScale] = useState(new Animated.Value(1));
  const [infoOpacity] = useState(new Animated.Value(0)); // ✅ New: For smooth info animation
  
  // Calculate percentages
  const totalValue = (netWorthData?.totalAssets || 0) + (netWorthData?.totalLiabilities || 0);
  const assetsPercentage = totalValue > 0 ? ((netWorthData?.totalAssets || 0) / totalValue) * 100 : 0;
  const liabilitiesPercentage = totalValue > 0 ? ((netWorthData?.totalLiabilities || 0) / totalValue) * 100 : 0;
  
  // Get gradient colors using your utility function
  const gradientColors = makeGradientColors(theme);

  // ✅ New: Auto-hide info after 2 seconds
  useEffect(() => {
    if (showInfo) {
      // Fade in animation
      Animated.timing(infoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        // Fade out animation
        Animated.timing(infoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowInfo(false);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showInfo, infoOpacity]);

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

  // ✅ Updated: Show info with animation
  const handleInfoPress = () => {
    if (!showInfo) {
      setShowInfo(true);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* ✅ Improved: Better styled info icon */}
        <TouchableOpacity 
          style={styles.infoIcon}
          onPress={handleInfoPress}
          activeOpacity={0.7}
        >
          <View style={styles.infoIconCircle}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
        </TouchableOpacity>

        {/* ✅ Fixed: Overlay info that doesn't push content */}
        {showInfo && (
          <Animated.View 
            style={[
              styles.infoOverlay,
              {
                opacity: infoOpacity,
              }
            ]}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                💡 Tap the pie charts to toggle between percentages and values
              </Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.chartsContainer}>
          {/* Assets Chart */}
          <View style={styles.chartItem}>
            <Animated.View style={[styles.chartWrapper, { transform: [{ scale: assetsScale }] }]}>
              <TouchableOpacity 
                onPress={() => handleChartPress('assets')}
                activeOpacity={0.8}
                style={styles.chartTouchable}
              >
                <AnimatedCircularProgress
                  size={120}
                  width={10}
                  fill={assetsPercentage}
                  tintColor={theme.colors.asset}
                  backgroundColor={theme.colors.border?.primary || theme.colors.border}
                  rotation={0}
                  lineCap="round"
                  duration={1000}
                >
                  {() => (
                    <View style={styles.chartCenter}>
                      <Text 
                        style={styles.chartValue}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                      >
                        {showPercentage 
                          ? `${Math.round(assetsPercentage)}%`
                          : formatSmartNumber(netWorthData?.totalAssets || 0, netWorthData?.currency)
                        }
                      </Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.chartLabel}>Assets</Text>
          </View>

          {/* Liabilities Chart */}
          <View style={styles.chartItem}>
            <Animated.View style={[styles.chartWrapper, { transform: [{ scale: liabilitiesScale }] }]}>
              <TouchableOpacity 
                onPress={() => handleChartPress('liabilities')}
                activeOpacity={0.8}
                style={styles.chartTouchable}
              >
                <AnimatedCircularProgress
                  size={120}
                  width={10}
                  fill={liabilitiesPercentage}
                  tintColor={theme.colors.liability}
                  backgroundColor={theme.colors.border?.primary || theme.colors.border}
                  rotation={0}
                  lineCap="round"
                  duration={1000}
                >
                  {() => (
                    <View style={styles.chartCenter}>
                      <Text 
                        style={styles.chartValue}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                      >
                        {showPercentage 
                          ? `${Math.round(liabilitiesPercentage)}%`
                          : formatSmartNumber(netWorthData?.totalLiabilities || 0, netWorthData?.currency)
                        }
                      </Text>
                    </View>
                  )}
                </AnimatedCircularProgress>
              </TouchableOpacity>
            </Animated.View>
            <Text style={styles.chartLabel}>Liabilities</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: screenWidth,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  gradientBackground: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  // ✅ Improved: Better info icon styling
  infoIcon: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.onGradient,
  },
  // ✅ Fixed: Overlay positioning that doesn't affect layout
  infoOverlay: {
    position: 'absolute',
    top: theme.spacing.xl + 8, // Just below the icon
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 5,
  },
  infoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
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
});

export default AssetsLiabilitiesSection;
