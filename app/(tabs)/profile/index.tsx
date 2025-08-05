import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Animated,
  useColorScheme,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { colors, spacing, borderRadius, shadows } from '@/src/styles/colors';
import { CURRENCIES, THEMES } from '@/lib/supabase';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const currencySheetRef = useRef<ActionSheetRef>(null);
  const themeSheetRef = useRef<ActionSheetRef>(null);
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (err) {
      console.error('Error signing out:', err);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (action) {
      case 'edit':
        router.push('/(tabs)/profile/edit');
        break;
      case 'currency':
        currencySheetRef.current?.show();
        break;
      case 'theme':
        themeSheetRef.current?.show();
        break;
      case 'delete':
        Alert.alert(
          'Delete Account',
          'Are you sure you want to permanently delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deletion', 'Account deletion feature coming soon!') },
          ]
        );
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is not yet available.');
    }
  };

  const handleCurrencySelect = async (currency: string) => {
    currencySheetRef.current?.hide();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateProfileMutation.mutateAsync({ preferred_currency: currency });
  };

  const handleThemeSelect = async (theme: string) => {
    themeSheetRef.current?.hide();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateProfileMutation.mutateAsync({ theme: theme });
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.emailAddresses[0]?.emailAddress[0].toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error loading profile.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{
        paddingBottom: insets.bottom + spacing.xxl,
        flexGrow: 1, // Ensure ScrollView grows to fill space
      }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Profile Header */}
        <View style={{
          backgroundColor: colors.background.secondary,
          padding: spacing.xl,
          paddingTop: insets.top + spacing.xl,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary,
          marginBottom: spacing.xl, // Added margin bottom to separate from sections
        }}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</Text>
          <TouchableOpacity style={styles.editProfileButton} onPress={() => handleAction('edit')}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow icon="cash-outline" text="Preferred Currency" value={profile?.preferred_currency || 'EUR'} onPress={() => handleAction('currency')} />
            <SettingRow icon="color-palette-outline" text="Theme" value={profile?.theme || 'SYSTEM'} onPress={() => handleAction('theme')} />
            <SettingRow icon="notifications-outline" text="Notifications" isSwitch={true} switchValue={notificationsEnabled} onSwitchChange={setNotificationsEnabled} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Data</Text>
          <View style={styles.card}>
            <SettingRow icon="help-circle-outline" text="Help & Support" onPress={() => handleAction('support')} />
            <SettingRow icon="document-text-outline" text="Terms of Service" onPress={() => handleAction('terms')} />
            <SettingRow icon="shield-checkmark-outline" text="Privacy Policy" onPress={() => handleAction('privacy')} />
            <SettingRow icon="download-outline" text="Export Data" onPress={() => handleAction('export')} />
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { marginBottom: spacing.xxxl + 80 }]}> {/* Increased bottom margin for scrollability */}
          <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleAction('delete')}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ActionSheet ref={currencySheetRef} containerStyle={{ backgroundColor: colors.background.primary }}>
        <View style={[styles.actionSheetContainer, { backgroundColor: colors.background.primary }]}>
          <Text style={[styles.actionSheetTitle, { color: colors.text.primary }]}>Select Currency</Text>
          <ScrollView style={styles.currencyList}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={styles.currencyRow}
                onPress={() => handleCurrencySelect(currency)}
              >
                <Text style={[styles.currencyText, { color: colors.text.primary }]}>{currency}</Text>
                {profile?.preferred_currency === currency && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ActionSheet>

      <ActionSheet ref={themeSheetRef} containerStyle={{ backgroundColor: colors.background.primary }}>
        <View style={[styles.actionSheetContainer, { backgroundColor: colors.background.primary }]}>
          <Text style={[styles.actionSheetTitle, { color: colors.text.primary }]}>Select Theme</Text>
          <ScrollView style={styles.currencyList}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme}
                style={styles.currencyRow}
                onPress={() => handleThemeSelect(theme)}
              >
                <Text style={[styles.currencyText, { color: colors.text.primary }]}>{theme}</Text>
                {profile?.theme === theme && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ActionSheet>
    </ScrollView>
  );
}

const SettingRow = ({ icon, text, value, onPress, isSwitch, switchValue, onSwitchChange }: any) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={isSwitch}>
    <View style={styles.settingRowLeft}>
      <Ionicons name={icon} size={24} color={colors.text.secondary} style={styles.settingIcon} />
      <Text style={styles.settingText}>{text}</Text>
    </View>
    <View style={styles.settingRowRight}>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitchChange} />
      ) : (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  editProfileButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: spacing.lg,
  },
  settingText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.md,
  },
  signOutButton: {
    // No specific styles needed here now
  },
  deleteButton: {
    // No specific styles needed here now
  },
  actionSheetContainer: {
    padding: spacing.lg,
    paddingBottom: 40, // Extra space for home indicator
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  currencyText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});