import React, { useState } from 'react';
import { Share, Alert, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';

import { useHaptics } from '@/hooks/useHaptics';
import { SettingRow } from '@/components/ui/SettingRow';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
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
      // TODO: Before launch, replace the placeholder URL with your app's actual store or website link.
      await Share.share({
        message:
          'Check out PocketRackr! It’s a great app for tracking your net worth and achieving financial goals. Download it here: https://pocketrackr.example.com',
        title: 'Share PocketRackr',
      });
    } catch (error: any) {
      Alert.alert('Error', 'Could not open the share dialog.');
    }
  };

  const handleRateApp = async () => {
    await impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This uses expo-store-review, the recommended way to ask for reviews.
    // It provides a native, non-intrusive prompt.
    // TODO: To enable this, run `npx expo install expo-store-review`. No other code changes are needed.
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      // This will open the native review prompt. iOS and Android handle the logic
      // of when to actually show it to the user to avoid spamming them.
      StoreReview.requestReview();
    } else {
      // Fallback for when the native review UI isn't available (e.g., on web or older devices)
      Alert.alert(
        'Enjoying PocketRackr?',
        'Your feedback helps us grow. Please take a moment to rate us on the App Store!',
        [
          { text: 'Not Now', style: 'cancel' },
          // TODO: Replace this with a Linking.openURL() call to your app's store page.
          { text: 'Rate Now', onPress: () => Alert.alert('Thank You!', 'This would link to the store URL.') },
        ]
      );
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
