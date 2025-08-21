import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { useDeleteUser } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmationModal from '../ui/ConfirmationModal';
import * as Haptics from 'expo-haptics';
import { useHaptics } from '@/hooks/useHaptics';

const AccountActionsSection = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { signOut } = useAuth();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();
  const { impactAsync } = useHaptics();

  const [isSignOutModalVisible, setSignOutModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleSignOut = () => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSignOutModalVisible(true);
  };

  const handleDeleteAccount = () => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteModalVisible(false);
    // The mutation's onSuccess will show the toast.
    await deleteUserMutation.mutateAsync();
    // Sign out from Clerk to invalidate the local session.
    await signOut();
    // Clear the query cache *after* signing out to prevent race conditions.
    queryClient.clear();
  };

  return (
    <>
      <Modal
        transparent={true}
        animationType="fade"
        visible={deleteUserMutation.isPending}
        onRequestClose={() => {}} // Prevent closing modal by back button
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Deleting Account...</Text>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        isVisible={isSignOutModalVisible}
        onClose={() => setSignOutModalVisible(false)}
        onConfirm={signOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        iconName="log-out-outline"
        iconColor={theme.colors.primary}
        isDestructive={false}
      />

      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDeleteAccount}
        title="Are you absolutely sure?"
        message="This action is permanent and cannot be undone. All of your accounts and data will be deleted. Please type 'I UNDERSTAND' to proceed."
        confirmText="Delete Account"
        iconName="trash-outline"
        isDestructive={true}
        requireConfirmationText="i understand"
        confirmationInputPlaceholder="Type 'I UNDERSTAND' here"
      />

      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut} activeOpacity={0.7}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleDeleteAccount}
          disabled={deleteUserMutation.isPending}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    width: '100%',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  signOutText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF3B30', // Use a specific, hardcoded red for destructive actions
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  loadingText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountActionsSection;