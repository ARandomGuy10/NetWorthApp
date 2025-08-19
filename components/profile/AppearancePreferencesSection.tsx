import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme, ProfileUpdate } from '@/lib/supabase';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { SettingRow } from '../ui/SettingRow';
import ThemePicker from './ThemePicker';
import RemindAfterDaysPicker from './RemindAfterDaysPicker';

const formatThemeName = (name: string | undefined) => {
  if (!name) return '';
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const AppearancePreferencesSection = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [isThemePickerVisible, setThemePickerVisible] = useState(false);
  const [isReminderPickerVisible, setReminderPickerVisible] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setHapticsEnabled(profile.haptic_feedback_enabled);
      setSoundsEnabled(profile.sounds_enabled);
    }
  }, [profile]);

  const isLoading = isLoadingProfile || updateProfileMutation.isPending;

  const handleCurrencyPress = () => {
    Alert.alert('Currency Selection', 'This will open the currency selection modal.');
  };

  const handleNotificationsPress = () => {
    Alert.alert('Notification Settings', 'This will navigate to notification settings.');
  };

  const handleSavePreference = async (updates: ProfileUpdate) => {
    try {
      await updateProfileMutation.mutateAsync(updates);
    } catch (error) {
      // Error toast is handled by the hook
    }
  };

  const handleSaveTheme = (themeName: string) => {
    handleSavePreference({ theme: themeName });
  };

  const handleSaveReminder = (days: number) => {
    handleSavePreference({ remind_after_days: days });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Appearance & Preferences</Text>
      <View style={styles.card}>
        {isLoading ? (
          <ActivityIndicator style={{ padding: theme.spacing.xl }} color={theme.colors.primary} />
        ) : (
          <>
            <SettingRow
              theme={theme}
              icon="color-palette-outline"
              text="Theme"
              value={formatThemeName(theme.name)}
              onPress={() => setThemePickerVisible(true)}
            />
            <SettingRow
              theme={theme}
              icon="cash-outline"
              text="Preferred Currency"
              value={profile?.preferred_currency}
              onPress={handleCurrencyPress}
            />
            <SettingRow
              theme={theme}
              icon="alarm-outline"
              text="Remind to Update"
              value={`${profile?.remind_after_days || 30} days`}
              onPress={() => setReminderPickerVisible(true)}
            />
            <SettingRow
              theme={theme}
              icon="notifications-outline"
              text="Notifications"
              onPress={handleNotificationsPress}
            />
            <SettingRow
              theme={theme}
              icon="pulse-outline"
              text="Haptic Feedback"
              isSwitch
              switchValue={hapticsEnabled}
              onSwitchChange={(value) => {
                setHapticsEnabled(value);
                handleSavePreference({ haptic_feedback_enabled: value });
              }}
            />
            <SettingRow
              theme={theme}
              icon="musical-notes-outline"
              text="Sound Effects"
              isSwitch
              switchValue={soundsEnabled}
              onSwitchChange={(value) => {
                setSoundsEnabled(value);
                handleSavePreference({ sounds_enabled: value });
              }}
              isLast
            />
          </>
        )}
      </View>
      <ThemePicker
        isVisible={isThemePickerVisible}
        onClose={() => setThemePickerVisible(false)}
        currentValue={profile?.theme || 'DARK'}
        onSave={handleSaveTheme}
      />
      <RemindAfterDaysPicker
        isVisible={isReminderPickerVisible}
        onClose={() => setReminderPickerVisible(false)}
        currentValue={profile?.remind_after_days || 30}
        onSave={handleSaveReminder}
      />
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
    overflow: 'hidden', // Ensures the border radius is respected by child elements
    ...theme.shadows.sm,
  },
});

export default AppearancePreferencesSection;