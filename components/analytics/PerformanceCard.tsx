import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {TrendingUp, TrendingDown} from 'lucide-react-native';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {formatSmartNumber} from '@/src/utils/formatters';
import type {PerformanceSummary} from '@/lib/supabase';

interface Props {
  performance: PerformanceSummary;
  currency: string;
}

const PerformanceCard: React.FC<Props> = ({performance, currency}) => {
  const {theme} = useTheme();

  // Fixed: Safe theme access with fallbacks
  if (!theme || !theme.colors) {
    return (
      <View style={{padding: 20, alignItems: 'center'}}>
        <Text style={{color: '#666'}}>Loading theme...</Text>
      </View>
    );
  }

  const isPositive = performance.change >= 0;

  // Fixed: Safe gradient access with fallbacks
  const successGradient = theme.gradient?.success || [theme.colors.success || '#22C55E', '#16A34A', '#15803D'];
  const errorGradient = theme.gradient?.error || [theme.colors.error || '#F87171', '#EF4444', '#DC2626'];

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isPositive
            ? (successGradient as [string, string, ...string[]])
            : (errorGradient as [string, string, ...string[]])
        }
        style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Summary</Text>
          <View style={styles.iconContainer}>
            {isPositive ? <TrendingUp size={24} color="white" /> : <TrendingDown size={24} color="white" />}
          </View>
        </View>

        <View style={styles.valuesContainer}>
          <View style={styles.valueRow}>
            <Text style={styles.label}>Started at</Text>
            <Text style={styles.value}>{formatSmartNumber(performance.start, currency)}</Text>
          </View>

          <View style={styles.valueRow}>
            <Text style={styles.label}>Now at</Text>
            <Text style={styles.value}>{formatSmartNumber(performance.end, currency)}</Text>
          </View>
        </View>

        <View style={styles.changeContainer}>
          <Text style={styles.changeLabel}>Total Change</Text>
          <Text style={styles.changeValue}>
            {isPositive ? '+' : ''}
            {formatSmartNumber(performance.change, currency)}
          </Text>
          <Text style={styles.changePercent}>({performance.percent.toFixed(1)}%)</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing?.xl || 24,
      borderRadius: theme.borderRadius?.lg || 16,
      overflow: 'hidden',
      ...(theme.shadows?.md || {}),
    },
    gradient: {
      padding: theme.spacing?.xl || 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing?.xl || 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    iconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: theme.spacing?.sm || 8,
      borderRadius: 20,
    },
    valuesContainer: {
      marginBottom: theme.spacing?.xl || 24,
    },
    valueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing?.md || 12,
    },
    label: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    value: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    changeContainer: {
      alignItems: 'center',
      paddingTop: theme.spacing?.xl || 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.3)',
    },
    changeLabel: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: theme.spacing?.sm || 8,
    },
    changeValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
    },
    changePercent: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: theme.spacing?.xs || 4,
    },
  });

export default PerformanceCard;
