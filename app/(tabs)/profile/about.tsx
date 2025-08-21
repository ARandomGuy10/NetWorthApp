import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';

import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

const AboutScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const appVersion = Application.nativeApplicationVersion;
  const buildVersion = Application.nativeBuildVersion;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          paddingTop: theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
      >
        <View style={styles.headerContainer}>
          <Image source={require('../../../assets/adaptive-icon.png')} style={styles.appIcon} />
          <Text style={styles.appName}>NetWorthTrackr</Text>
          <Text style={styles.tagline}>Your financial journey, simplified.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>App Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>{appVersion}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Build Version</Text>
              <Text style={styles.infoValue}>{buildVersion}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's New in v{appVersion}</Text>
          <Text style={styles.bodyText}>
            • Implemented a brand new Profile screen!{'\n'}
            • Added an in-app feedback form.{'\n'}
            • Redesigned legal and info pages.{'\n'}
            • Squashed some bugs and made performance improvements.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    appIcon: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.xl,
      marginBottom: theme.spacing.lg,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    tagline: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    bodyText: {
      fontSize: 15,
      color: theme.colors.text.secondary,
      lineHeight: 22,
    },
    infoContainer: {
      // This container is needed to apply border radius correctly with inner borders
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    infoValue: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
  });

export default AboutScreen;