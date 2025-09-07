// app/(tabs)/analytics/accounts.tsx
import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import AccountComparisonChart from '@/components/analytics/accounts/AccountComparisonChart';
import {useTheme} from '@/src/styles/theme/ThemeContext';

const AccountsAnalyticsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const styles = getStyles(theme);

  const onBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Only Back Button - positioned absolutely */}
      <TouchableOpacity onPress={onBack} style={[styles.backBtn, {top: insets.top + 27}]}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.text.onGradient} />
      </TouchableOpacity>

      {/* Chart Component */}
      <AccountComparisonChart />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    backBtn: {
      position: 'absolute',
      left: theme.spacing.md,
      width: theme.spacing.xl + theme.spacing.lg,
      height: theme.spacing.xl + theme.spacing.lg,
      borderRadius: (theme.spacing.xl + theme.spacing.lg) / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.interactive.hover,
      borderWidth: 0.5,
      borderColor: theme.colors.border.primary,
      zIndex: 10,
    },
  });

export default AccountsAnalyticsScreen;
