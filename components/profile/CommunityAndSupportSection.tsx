import React, { useState } from 'react';

import { Share, Alert, View, Text, StyleSheet, Linking, Platform } from 'react-native';

import { useRouter } from 'expo-router';

import * as Device from 'expo-device';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';

import { SettingRow } from '@/components/ui/SettingRow';
import { Theme } from '@/lib/supabase';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/src/styles/theme/ThemeContext';

import FeedbackSheet from './FeedbackSheet';

const CommunityAndSupportSection = () => {
  const { impactAsync } = useHaptics();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isFeedbackSheetVisible, setFeedbackSheetVisible] = useState(false);

  const handleShare = async () => {
    await impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Using platform-specific URLs for a better user experience.
      const storeUrl = Platform.select({
        // TODO: Replace <YOUR_APP_ID_HERE> with your actual Apple App ID from App Store Connect.
        ios: 'https://apps.apple.com/app/id<YOUR_APP_ID_HERE>',
        // The app's page on the Google Play Store.
        android: 'https://play.google.com/store/apps/details?id=com.networthtrackr',
        // A fallback website for other platforms (like web).
        default: 'https://networthtrackr.example.com',
      });

      const message = `Check out NetWorthTrackr! It’s a great app for tracking your net worth and achieving financial goals.`;

      // The Share API can accept a URL, which is often handled better by receiving apps.
      await Share.share({
        message: `${message}\n\n${storeUrl}`,
        // The URL property is used by iOS's AirDrop and other services.
        url: storeUrl,
        title: 'Share NetWorthTrackr',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not open the share dialog.');
    }
  };
  
  const handleRateApp = async () => {
    await impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    const storeUrl = Platform.select({
      // TODO: Replace <YOUR_APP_ID_HERE> with your actual Apple App ID from App Store Connect.
      ios: 'https://apps.apple.com/app/id<YOUR_APP_ID_HERE>',
      android: 'market://details?id=com.networthtrackr',
      default: 'https://networthtrackr.example.com', // A fallback website
    });
  
    // In development (__DEV__ is true), we'll always show the fallback alert.
    // This makes testing predictable, as the native review prompt is rate-limited
    // by the OS and doesn't show on simulators.
    if (__DEV__) {
      Alert.alert(
        'Dev Mode: Rate App',
        'This would open the native review prompt in production. In dev, we link directly to the store.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Store URL',
            onPress: async () => {
              await Linking.openURL(storeUrl).catch(() => Alert.alert('Error', 'Could not open the app store.'));
            },
          },
        ]
      );
      return;
    }
  
    // In production, use the native in-app review API.
    const isReviewAvailable = await StoreReview.isAvailableAsync();
    if (isReviewAvailable) {
      StoreReview.requestReview();
    } else {
      // As a fallback in production (e.g., on older devices), link to the store.
      await Linking.openURL(storeUrl).catch(() => Alert.alert('Error', 'Could not open the app store.'));
    }
  };

  const handleOpenFeedback = async () => {
    await impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFeedbackSheetVisible(true);
  };
  const handleHelp = () => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/profile/help');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Community & Support</Text>
      <View style={styles.card}>
        <SettingRow
          icon="star-outline"
          text="Rate the App"
          subtitle="Enjoying the app? Let us know!"
          onPress={handleRateApp}
        />
        <SettingRow
          icon="share-social-outline"
          text="Share with Friends"
          subtitle="Help others on their financial journey"
          onPress={handleShare}
        />
        <SettingRow
          icon="chatbubble-ellipses-outline"
          text="Send Feedback"
          subtitle="Help us improve your experience"
          onPress={handleOpenFeedback}
        />
        <SettingRow
          icon="help-circle-outline"
          text="Help & Support"
          subtitle="FAQs and contact information"
          onPress={handleHelp}
          isLast
        />
      </View>
      <FeedbackSheet isVisible={isFeedbackSheetVisible} onClose={() => setFeedbackSheetVisible(false)} />
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

export default CommunityAndSupportSection;
