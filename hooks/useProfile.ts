import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import type { Profile, ProfileUpdate } from '../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './providers/ToastProvider';

export const useProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      console.log('🔥 CALLING DATABASE - useProfile queryFn');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      
      if (error?.code === 'PGRST116') return null; // No profile found
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreateProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔥 CALLING DATABASE - useCreateProfile mutationFn');
      if (!user) throw new Error('User not authenticated');

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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.setQueryData(['profile', user?.id], data);
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
  const supabase     = useSupabase();
  const queryClient  = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      console.log('🔥 CALLING DATABASE - useUpdateProfile mutationFn');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, updates) => {
      // Optimistically update the profile in the cache
      queryClient.setQueryData(['profile', user?.id], data);

      // If the currency was changed, invalidate all queries that depend on it.
      // This is much more efficient than invalidating on every profile update.
      if (updates.preferred_currency) {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['accountsWithBalances'] });
        queryClient.invalidateQueries({ queryKey: ['netWorthHistory'] });
      }

      // Disable haptics on this specific toast to prevent race conditions when toggling haptics off.
      showToast('Profile updated successfully!', 'success', { haptics: false });
    },
    onError: (error: Error) => {
      showToast('Failed to update profile', 'error', { text: error.message });
      console.error('Error updating profile:', error);
    }
  });
};

export const useDeleteUser = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🔥 CALLING EDGE FUNCTION - delete-user');
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) throw error;
    },
    onSuccess: () => {
      // The toast is shown, and then the component handles sign-out and cache clearing.
      // This prevents a race condition where a profile auto-creation might be triggered.
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
