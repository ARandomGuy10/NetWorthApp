import React from 'react';

import {View, TouchableOpacity, Text, StyleSheet, Platform} from 'react-native';

import * as Haptics from 'expo-haptics';

import type {Period} from '@/lib/supabase';
import {useHaptics} from '@/hooks/useHaptics';
import {useTheme} from '@/src/styles/theme/ThemeContext';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  style?: any;
}

const ranges = [
  {label: '1M', value: '1M' as Period},
  {label: '3M', value: '3M' as Period},
  {label: '6M', value: '6M' as Period},
  {label: '1Y', value: '12M' as Period},
  {label: 'All', value: 'ALL' as Period},
];

const PeriodSelector: React.FC<PeriodSelectorProps> = ({selectedPeriod, onPeriodChange, style}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();

  const handlePeriodChange = (period: Period) => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPeriodChange(period);
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 4,
      marginTop: theme.spacing.md,
      backgroundColor: 'rgba(255,255,255,0.06)',
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 3},
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      marginHorizontal: 2,
    },
    selectedButton: {
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    buttonText: {
      fontWeight: '600',
      fontSize: theme.fontSizes?.sm || 14,
      letterSpacing: -0.2,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {ranges.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[styles.button, selectedPeriod === option.value && styles.selectedButton]}
          onPress={() => handlePeriodChange(option.value)}>
          <Text
            style={[
              styles.buttonText,
              {
                color: option.value === selectedPeriod ? theme.colors.text.inverse : theme.colors.text.secondary,
              },
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PeriodSelector;
