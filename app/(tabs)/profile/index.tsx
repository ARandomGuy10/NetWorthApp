import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserProfileCard from '@/components/profile/UserProfileCard';
import PremiumBanner from '@/components/profile/PremiumBanner';
import AppearancePreferencesSection from '@/components/profile/AppearancePreferencesSection';
import AccountActionsSection from '@/components/profile/AccountActionsSection';

const ProfileScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Advanced settings will be available here.');
  };

  const handleProfileCardPress = () => {
    router.push('/(tabs)/profile/edit');
  };

  const handlePremiumPress = () => {
    Alert.alert('Premium Banner', 'This will navigate to the upgrade screen.');
  };

  return (
    <View style={styles.container}>
      <ProfileHeader onSettingsPress={handleSettingsPress} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <UserProfileCard onPress={handleProfileCardPress} />
        <PremiumBanner onPress={handlePremiumPress} />
        <AppearancePreferencesSection />
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