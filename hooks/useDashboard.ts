// hooks/useDashboard.ts
import {useQuery} from '@tanstack/react-query';
import {useUser} from '@clerk/clerk-expo';
import {useSupabase} from './useSupabase';
import {useProfile} from './useProfile';
import type {DashboardData} from '@/lib/supabase';
import {useToast} from './providers/ToastProvider';
import {captureSentryException} from '@/lib/sentry';

interface UseDashboardDataOptions {
  sentry?: {
    location: string;
    component: string;
  };
}

export const useDashboardData = (options?: UseDashboardDataOptions) => {
  const {user} = useUser();
  const supabase = useSupabase();
  const {data: profile} = useProfile();
  const {showToast} = useToast();

  return useQuery<DashboardData, Error>({
    queryKey: ['dashboard', user?.id, profile?.preferred_currency],
    queryFn: async () => {
      try {
        const {data, error} = await supabase.functions.invoke('fetch-account-date-and-net-worth-v2', {
          body: {
            toCurrency: profile?.preferred_currency || 'EUR', // Use user's preferred currency or fallback
          },
        });

        if (error) throw error;

        return data;
      } catch (error) {
        // Centralized error handling for this query.
        showToast('Could not refresh dashboard data.', 'error');
        captureSentryException(error, {
          location: options?.sentry?.location || 'unknown_dashboard',
          context: 'data_fetch',
          component: options?.sentry?.component || 'useDashboardData',
          level: 'warning',
        });
        // Re-throw the error so TanStack Query can mark the query as failed.
        throw error;
      }
    },
    enabled: !!user?.id && !!profile, // Wait for both user and profile to be loaded
  });
};
