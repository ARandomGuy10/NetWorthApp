// hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { useProfile } from './useProfile';

export const useDashboardData = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  const { data: profile } = useProfile(); // Get user profile
  
  return useQuery({
    queryKey: ['dashboard', user?.id, profile?.preferred_currency],
    queryFn: async () => {
      console.log('🔥 CALLING DATABASE - useDashboardData queryFn');
      
      const { data, error } = await supabase.functions.invoke('fetch-account-date-and-net-worth', {
        body: { 
          toCurrency: profile?.preferred_currency || 'EUR' // Use user's preferred currency or fallback
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!profile, // Wait for both user and profile to be loaded
  });
};
