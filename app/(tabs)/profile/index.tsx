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
import { CURRENCIES, Theme, THEMES } from '@/lib/supabase';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useTheme } from '@/src/styles/theme/ThemeContext';

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

  const { theme , switchTheme} = useTheme();
  const styles = getStyles(theme);
  

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
    switchTheme(theme);
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        paddingBottom: insets.bottom + theme.spacing.xxl,
        flexGrow: 1, // Ensure ScrollView grows to fill space
      }}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={{
          backgroundColor: theme.colors.background.secondary,
          padding: theme.spacing.xl,
          paddingTop: insets.top + theme.spacing.xl,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
          marginBottom: theme.spacing.xl, // Added margin bottom to separate from sections
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
        

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow icon="cash-outline" text="Preferred Currency" value={profile?.preferred_currency || 'EUR'} onPress={() => handleAction('currency') } styles ={styles} theme={theme}/>
            <SettingRow icon="color-palette-outline" text="Theme" value={profile?.theme || 'SYSTEM'} onPress={() => handleAction('theme')} styles={styles} theme={theme}/>
            <SettingRow icon="notifications-outline" text="Notifications" isSwitch={true} switchValue={notificationsEnabled} onSwitchChange={setNotificationsEnabled} styles={styles} theme={theme}/>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Data</Text>
          <View style={styles.card}>
            <SettingRow icon="help-circle-outline" text="Help & Support" onPress={() => handleAction('support')} styles={styles} theme={theme}/>
            <SettingRow icon="document-text-outline" text="Terms of Service" onPress={() => handleAction('terms')} styles={styles} theme={theme}/>
            <SettingRow icon="shield-checkmark-outline" text="Privacy Policy" onPress={() => handleAction('privacy')} styles={styles} theme={theme}/>
            <SettingRow icon="download-outline" text="Export Data" onPress={() => handleAction('export')} styles={styles} theme={theme}/>
          </View>
        </View>

        
        <View style={[styles.section, { marginBottom: theme.spacing.xxxl + 80 }]}> 
          <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('delete')}>
            <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ActionSheet ref={currencySheetRef} containerStyle={{ backgroundColor: theme.colors.background.primary }}>
        <View style={[styles.actionSheetContainer, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.actionSheetTitle, { color: theme.colors.text.primary }]}>Select Currency</Text>
          <ScrollView style={styles.currencyList}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency}
                style={styles.currencyRow}
                onPress={() => handleCurrencySelect(currency)}
              >
                <Text style={[styles.currencyText, { color: theme.colors.text.primary }]}>{currency}</Text>
                {profile?.preferred_currency === currency && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ActionSheet>

      <ActionSheet ref={themeSheetRef} containerStyle={{ backgroundColor: theme.colors.background.primary }}>
        <View style={[styles.actionSheetContainer, { backgroundColor: theme.colors.background.primary }]}>
          <Text style={[styles.actionSheetTitle, { color: theme.colors.text.primary }]}>Select Theme</Text>
          <ScrollView style={styles.currencyList}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme}
                style={styles.currencyRow}
                onPress={() => handleThemeSelect(theme)}
              >
                <Text style={[styles.currencyText, { color: '#fff' }]}>{theme}</Text>
                {profile?.theme === theme && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ActionSheet>
    </ScrollView>
  );
}

const SettingRow = ({ icon, text, value, onPress, isSwitch, switchValue, onSwitchChange, styles, theme }: any) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={isSwitch}>
    <View style={styles.settingRowLeft}>
      <Ionicons name={icon} size={24} color={theme.colors.text.secondary} style={styles.settingIcon} />
      <Text style={styles.settingText}>{text}</Text>
    </View>
    <View style={styles.settingRowRight}>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitchChange} />
      ) : (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </>
      )}
    </View>
  </TouchableOpacity>
);

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xxl,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ... theme.shadows.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  editProfileButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  editProfileButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: theme.spacing.lg,
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  actionButton: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
  },
  signOutButton: {
    // No specific styles needed here now
  },
  deleteButton: {
    // No specific styles needed here now
  },
  actionSheetContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40, // Extra space for home indicator
  },
  actionSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  currencyText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
});