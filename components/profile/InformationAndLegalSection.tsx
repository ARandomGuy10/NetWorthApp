import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useHaptics } from '@/hooks/useHaptics';
import { SettingRow } from '@/components/ui/SettingRow';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

const InformationAndLegalSection = () => {
  const { impactAsync } = useHaptics();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleNavigation = (path: string) => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Information & Legal</Text>
      <View style={styles.card}>
        <SettingRow
          icon="information-circle-outline"
          text="About PocketRackr"
          onPress={() => handleNavigation('/(tabs)/profile/about')}
        />
        <SettingRow
          icon="shield-checkmark-outline"
          text="Privacy Policy"
          onPress={() => handleNavigation('/(tabs)/profile/privacy')}
        />
        <SettingRow
          icon="document-text-outline"
          text="Terms of Use"
          onPress={() => handleNavigation('/(tabs)/profile/terms')}
          isLast
        />
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
});

export default InformationAndLegalSection;