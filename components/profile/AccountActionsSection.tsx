import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator } from 'react-native';
import { useDeleteUser } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

const AccountActionsSection = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { signOut } = useAuth();
  const deleteUserMutation = useDeleteUser();
  const queryClient = useQueryClient();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent and cannot be undone. All of your accounts and data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // The mutation's onSuccess will show the toast.
            await deleteUserMutation.mutateAsync();
            // Sign out from Clerk to invalidate the local session.
            await signOut();
            // Clear the query cache *after* signing out to prevent race conditions.
            queryClient.clear();
          },
        },
      ]
    );
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
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
          disabled={deleteUserMutation.isPending}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
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
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  deleteButton: {
    // No specific style needed here as the text color handles the destructive look
  },
  buttonText: {
    color: theme.colors.error,
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