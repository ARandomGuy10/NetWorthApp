import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';

import type { Profile, ProfileUpdate } from '../lib/supabase';
import { useSettingsStore } from '../stores/settingsStore';
import { useSupabase } from './useSupabase';
import { useToast } from './providers/ToastProvider';

// Helper function to ensure boolean values for enabled
const fixEnabled = (value: any): boolean => {
  return typeof value === 'boolean' ? value : Boolean(value);
};

export const useProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  
  // Ensure enabled is always a proper boolean
  const enabled = fixEnabled(user && typeof user === 'object' && user.id);

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      console.log('🔥 CALLING DATABASE - useProfile queryFn');
      
      // Extra safety check before database call
      if (!user || typeof user !== 'object' || !user.id) {
        console.warn('useProfile: Invalid user object, skipping query');
        // Initialize with defaults when no user
        initializeSettings({
          hapticsEnabled: true,
          soundsEnabled: true,
          theme: 'DARK', // Default theme for signed-out users
          isSignedIn: false
        });
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error?.code === 'PGRST116') {
        // No profile found - signed in but no profile yet
        initializeSettings({
          hapticsEnabled: true,
          soundsEnabled: true,
          theme: 'SYSTEM',
          isSignedIn: true
        });
        return null;
      }
      
      if (error) throw error;

      if (data) {
        // Update settings store with profile data
        initializeSettings({
          hapticsEnabled: data.haptic_feedback_enabled ?? true,
          soundsEnabled: data.sounds_enabled ?? true,
          theme: data.theme ?? 'DARK',
          isSignedIn: true
        });
      }

      return data;
    },
    enabled, // Now guaranteed to be boolean
  });
};

export const useCreateProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);

  return useMutation({
    mutationFn: async () => {
      console.log('🔥 CALLING DATABASE - useCreateProfile mutationFn');
      
      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('User not authenticated or invalid user object');
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.emailAddresses[0].emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.imageUrl,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (!user?.id) return;
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.setQueryData(['profile', user.id], data);
      
      // Update settings store with new profile data
      initializeSettings({
        hapticsEnabled: data.haptic_feedback_enabled ?? true,
        soundsEnabled: data.sounds_enabled ?? true,
        theme: data.theme ?? 'DARK',
        isSignedIn: true
      });
      
      showToast('Profile created successfully!', 'success');
    },
    onError: (error) => {
      showToast('Failed to create profile. Please try again.', 'error');
      console.error('Error creating profile:', error);
    },
  });
};

export const useUpdateProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      console.log('🔥 CALLING DATABASE - useUpdateProfile mutationFn');
      
      if (!user || typeof user !== 'object' || !user.id) {
        throw new Error('Invalid user object for profile update');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, updates) => {
      // Only proceed if user is still valid
      if (!user?.id) {
        console.warn('useUpdateProfile: Invalid user during onSuccess, skipping cache updates');
        return;
      }

      queryClient.setQueryData(['profile', user.id], data);

      // Update settings store with any changed settings
      if (updates.haptic_feedback_enabled !== undefined || 
          updates.sounds_enabled !== undefined || 
          updates.theme !== undefined) {
        initializeSettings({
          hapticsEnabled: updates.haptic_feedback_enabled ?? data.haptic_feedback_enabled ?? true,
          soundsEnabled: updates.sounds_enabled ?? data.sounds_enabled ?? true,
          theme: updates.theme ?? data.theme ?? 'DARK',
          isSignedIn: true
        });
      }

      // If the currency was changed, invalidate all queries that depend on it
      if (updates.preferred_currency) {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['accountsWithBalances'] });
        queryClient.invalidateQueries({ queryKey: ['netWorthHistory'] });
      }

      showToast('Profile updated successfully!', 'success');
    },
    onError: (error: Error) => {
      showToast('Failed to update profile', 'error', { text: error.message });
      console.error('Error updating profile:', error);
    },
  });
};

export const useDeleteUser = () => {
  const supabase = useSupabase();
  const { showToast } = useToast();
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);

  return useMutation({
    mutationFn: async () => {
      console.log('🔥 CALLING EDGE FUNCTION - delete-user');
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
    },
    onSuccess: () => {
      // Reset settings store to defaults when user is deleted
      initializeSettings({
        hapticsEnabled: true,
        soundsEnabled: true,
        theme: 'SYSTEM',
        isSignedIn: false
      });
      
      showToast('Account deleted successfully', 'success');
    },
    onError: (error: Error) => {
      showToast('Failed to delete account', 'error', {
        text: error.message,
      });
      console.error('Error deleting user:', error);
    },
  });
};
