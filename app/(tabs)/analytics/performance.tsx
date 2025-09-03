import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {useRouter} from 'expo-router';
import {ArrowLeft} from 'lucide-react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNetWorthHistory} from '@/hooks/useNetWorthHistory';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import PerformanceCard from '@/components/analytics/PerformanceCard';

const {width: screenWidth} = Dimensions.get('window');

const periods = [
  {label: '1M', value: '1M'},
  {label: '3M', value: '3M'},
  {label: '6M', value: '6M'},
  {label: '1Y', value: '12M'},
  {label: 'All', value: 'ALL'},
];

export default function PerformanceScreen() {
  const {theme} = useTheme();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('6M');

  const {data: historyData, isLoading} = useNetWorthHistory({period: selectedPeriod});

  // Fixed: Safe theme access with fallback
  if (!theme || !theme.colors) {
    return (
      <View style={{flex: 1, backgroundColor: '#0A0E28', justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white'}}>Loading...</Text>
      </View>
    );
  }

  const styles = getStyles(theme);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background.primary}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: theme.colors.text.primary}]}>Performance Summary</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={[styles.periodSelector, {backgroundColor: theme.colors.background.secondary}]}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && [
                  styles.selectedPeriodButton,
                  {backgroundColor: theme.colors.primary},
                ],
              ]}
              onPress={() => setSelectedPeriod(period.value as any)}>
              <Text
                style={[
                  styles.periodButtonText,
                  {color: selectedPeriod === period.value ? 'white' : theme.colors.text.secondary},
                ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <Text style={[styles.loadingText, {color: theme.colors.text.secondary}]}>Loading performance data...</Text>
        ) : historyData?.insights?.performanceSummary ? (
          <PerformanceCard performance={historyData.insights.performanceSummary} currency={historyData.currency} />
        ) : (
          <Text style={[styles.errorText, {color: theme.colors.text.secondary}]}>
            No performance data available for the selected period
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingTop: 60,
      paddingBottom: theme.spacing?.xl || 20,
    },
    backButton: {
      marginRight: theme.spacing?.lg || 16,
      padding: theme.spacing?.sm || 8,
    },
    headerTitle: {
      fontSize: screenWidth > 400 ? 24 : 20,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing?.lg || 16,
    },
    periodSelector: {
      flexDirection: 'row',
      borderRadius: theme.borderRadius?.lg || 16,
      padding: 4,
      marginBottom: theme.spacing?.xl || 24,
    },
    periodButton: {
      flex: 1,
      paddingVertical: theme.spacing?.md || 12,
      alignItems: 'center',
      borderRadius: theme.borderRadius?.md || 12,
    },
    selectedPeriodButton: {
      // Dynamic background color set inline above
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    loadingText: {
      textAlign: 'center',
      fontSize: 16,
      marginTop: 40,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 16,
      marginTop: 40,
      lineHeight: 22,
    },
  });
