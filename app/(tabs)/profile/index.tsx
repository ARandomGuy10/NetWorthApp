import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '@/hooks/providers/SubscriptionProvider';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserProfileCard from '@/components/profile/UserProfileCard';
import PremiumBanner from '@/components/profile/PremiumBanner';
import SubscriptionManagementSection from '@/components/profile/SubscriptionManagementSection';
import AppearancePreferencesSection from '@/components/profile/AppearancePreferencesSection';
import CommunityAndSupportSection from '@/components/profile/CommunityAndSupportSection';
import InformationAndLegalSection from '@/components/profile/InformationAndLegalSection';
import AccountActionsSection from '@/components/profile/AccountActionsSection';

const ProfileScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isPro } = useSubscription();
  const insets = useSafeAreaInsets();

  const handleProfileCardPress = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handlePremiumPress = () => {
    router.push('/(tabs)/profile/paywall');
  };

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <UserProfileCard onPress={handleProfileCardPress} />
        {isPro ? (
          <SubscriptionManagementSection />
        ) : (
          <PremiumBanner onPress={handlePremiumPress} />
        )}
        <AppearancePreferencesSection />
        <CommunityAndSupportSection />
        <InformationAndLegalSection />
        <AccountActionsSection />
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
});

export default ProfileScreen;