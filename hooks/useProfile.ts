import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { useSmartMutation } from './useSmartMutation';
import type { Profile } from '../lib/supabase';

export const useProfile = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      console.log('🔥 Fetching user profile');
      
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
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
      console.log('🔥 Updating profile:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    invalidateQueries: ['profile', 'dashboard'], // ✅ Simple! No manual query key management
  });
};
