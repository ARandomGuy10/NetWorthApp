import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import type { Profile } from '../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

export const useUpdateProfile = () => {
  const { user }     = useUser();
  const supabase     = useSupabase();
  const queryClient  = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      console.log('🔥 CALLING DATABASE - useUpdateProfile mutationFn');
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};