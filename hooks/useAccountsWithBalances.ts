import {useQuery} from '@tanstack/react-query';
import {useUser} from '@clerk/clerk-expo';
import {useSupabase} from './useSupabase';
import {useToast} from './providers/ToastProvider';
import {captureSentryException} from '@/lib/sentry';
import type {AccountWithBalance} from '@/lib/supabase';

interface UseAccountsDataOptions {
  sentry?: {
    location: string;
    component: string;
  };
}

export const useAccountsWithBalances = (options?: UseAccountsDataOptions) => {
  const {user} = useUser();
  const supabase = useSupabase();
  const {showToast} = useToast();

  return useQuery<AccountWithBalance[], Error>({
    queryKey: ['accountsWithBalances', user?.id],
    queryFn: async () => {
      try {
        const {data, error} = await supabase.rpc('get_accounts_with_balances');
        if (error) throw error;
        return data;
      } catch (error) {
        // Centralized error handling for this query.
        showToast('Could not load accounts.', 'error');
        captureSentryException(error, {
          location: options?.sentry?.location || 'unknown_accounts',
          context: 'data_fetch',
          component: options?.sentry?.component || 'useAccountsWithBalances',
          level: 'warning',
        });
        // Re-throw the error so TanStack Query can mark the query as failed.
        throw error;
      }
    },
    enabled: !!user?.id,
  });
};
