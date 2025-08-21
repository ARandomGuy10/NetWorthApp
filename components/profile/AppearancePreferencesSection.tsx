import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme, ProfileUpdate } from '@/lib/supabase';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { SettingRow } from '../ui/SettingRow';
import ThemePicker from './ThemePicker';
import RemindAfterDaysPicker from './RemindAfterDaysPicker';
import CurrencyPicker from './CurrencyPicker';

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
  const [isCurrencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(false);

  useEffect(() => {
    if (profile) {
      setHapticsEnabled(profile.haptic_feedback_enabled);
      setSoundsEnabled(profile.sounds_enabled);
    }
  }, [profile]);

  const isLoading = isLoadingProfile || updateProfileMutation.isPending;

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

  const handleSaveCurrency = (currency: string) => {
    handleSavePreference({ preferred_currency: currency });
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
              icon="color-palette-outline"
              text="Theme"
              value={formatThemeName(theme.name)}
              onPress={() => setThemePickerVisible(true)}
            />
            <SettingRow
              icon="cash-outline"
              text="Preferred Currency"
              value={profile?.preferred_currency}
              onPress={() => setCurrencyPickerVisible(true)}
            />
            <SettingRow
              icon="alarm-outline"
              text="Remind to Update"
              value={`${profile?.remind_after_days || 30} days`}
              onPress={() => setReminderPickerVisible(true)}
            />
            <SettingRow
              icon="notifications-outline"
              text="Notifications"
              onPress={handleNotificationsPress}
            />
            <SettingRow
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
      <CurrencyPicker
        isVisible={isCurrencyPickerVisible}
        onClose={() => setCurrencyPickerVisible(false)}
        currentValue={profile?.preferred_currency || 'USD'}
        onSave={handleSaveCurrency}
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