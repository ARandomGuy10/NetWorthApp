import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Switch,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinancialData } from '../../hooks/context/FinancialDataContext';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';
import { CURRENCIES } from '../../src/services/accountService';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('system');
  
  // Animation refs
  const fadeAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  
  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const {
    profile,
    loading,
    loadAllFinancialData,
  } = useFinancialData();

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || user?.emailAddresses?.[0]?.emailAddress || '',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    // Staggered animation for sections
    const animations = fadeAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(100, animations).start();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (err) {
              console.error('Error signing out:', err);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    setEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCurrencyChange = () => {
    const currencyOptions = CURRENCIES.map(currency => ({ text: currency, onPress: () => {
      // TODO: Update currency preference
      Alert.alert('Currency Updated', `Currency changed to ${currency}`);
    }}));
    
    Alert.alert('Select Currency', 'Choose your preferred currency', [
      ...currencyOptions.slice(0, 5), // Show first 5 currencies
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleThemeChange = () => {
    Alert.alert('Select Theme', 'Choose your preferred theme', [
      { text: 'Light', onPress: () => setSelectedTheme('light') },
      { text: 'Dark', onPress: () => setSelectedTheme('dark') },
      { text: 'System', onPress: () => setSelectedTheme('system') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const getInitials = () => {
    const firstName = profile?.first_name || user?.firstName || '';
    const lastName = profile?.last_name || user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement, animationIndex = 0 }) => (
    <Animated.View style={[styles.settingItem, { opacity: fadeAnims[animationIndex] }]}>
      <TouchableOpacity
        style={styles.settingButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${icon.color}20` }]}>
            <Ionicons name={icon.name} size={20} color={icon.color} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />}
      </TouchableOpacity>
    </Animated.View>
  );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnims[0] }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {profile?.first_name || user?.firstName || 'User'} {profile?.last_name || user?.lastName || ''}
          </Text>
          <Text style={styles.userEmail}>
            {profile?.email || user?.emailAddresses?.[0]?.emailAddress}
          </Text>
          
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon={{ name: 'person-outline', color: colors.primary }}
            title="Personal Information"
            subtitle="Name, email, and other details"
            onPress={() => setEditModalVisible(true)}
            animationIndex={1}
          />
          
          <SettingItem
            icon={{ name: 'shield-outline', color: colors.info }}
            title="Security"
            subtitle="Password, 2FA, and login methods"
            onPress={() => Alert.alert('Security', 'Security settings coming soon!')}
            animationIndex={1}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon={{ name: 'card-outline', color: colors.warning }}
            title="Currency"
            subtitle={`Current: ${profile?.preferred_currency || 'EUR'}`}
            onPress={handleCurrencyChange}
            animationIndex={2}
          />
          
          <SettingItem
            icon={{ name: 'color-palette-outline', color: colors.liability }}
            title="Theme"
            subtitle={`Current: ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`}
            onPress={handleThemeChange}
            animationIndex={2}
          />
          
          <SettingItem
            icon={{ name: 'notifications-outline', color: colors.success }}
            title="Notifications"
            subtitle="Push notifications and alerts"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border.secondary, true: colors.primary }}
                thumbColor={colors.text.primary}
              />
            }
            animationIndex={2}
          />
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <SettingItem
            icon={{ name: 'download-outline', color: colors.asset }}
            title="Export Data"
            subtitle="Download your financial data"
            onPress={() => Alert.alert('Export Data', 'Data export feature coming soon!')}
            animationIndex={3}
          />
          
          <SettingItem
            icon={{ name: 'document-text-outline', color: colors.text.secondary }}
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon!')}
            animationIndex={3}
          />
          
          <SettingItem
            icon={{ name: 'document-outline', color: colors.text.secondary }}
            title="Terms of Service"
            subtitle="App terms and conditions"
            onPress={() => Alert.alert('Terms of Service', 'Terms of service coming soon!')}
            animationIndex={3}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={{ name: 'help-circle-outline', color: colors.info }}
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() => Alert.alert('Help & Support', 'Support feature coming soon!')}
            animationIndex={4}
          />
          
          <SettingItem
            icon={{ name: 'mail-outline', color: colors.primary }}
            title="Contact Us"
            subtitle="Send us feedback or questions"
            onPress={() => Alert.alert('Contact Us', 'Contact feature coming soon!')}
            animationIndex={4}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <SettingItem
            icon={{ name: 'trash-outline', color: colors.error }}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            animationIndex={5}
          />
          
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.firstName}
                onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                placeholder="Enter first name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.lastName}
                onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                placeholder="Enter last name"
                placeholderTextColor={colors.text.secondary}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={editForm.email}
                editable={false}
                placeholder="Email address"
                placeholderTextColor={colors.text.secondary}
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.background.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  editProfileButton: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  settingItem: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  settingButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signOutButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});
