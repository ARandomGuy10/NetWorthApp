import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import type { Profile } from '../lib/supabase';
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
  const { user }     = useUser();
  const supabase     = useSupabase();
  const queryClient  = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accountsWithBalances'] });
      queryClient.invalidateQueries({ queryKey: ['netWorthHistory'] });
      queryClient.setQueryData(['profile', user?.id], data);
      showToast('Profile updated successfully!', 'success');
    },
    onError: (error: Error) => {
      showToast('Failed to update profile', 'error', { text: error.message });
      console.error('Error updating profile:', error);
    }
  });
};