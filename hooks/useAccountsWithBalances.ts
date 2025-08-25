import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';

import type { AccountWithBalance } from '@/lib/supabase';

import { useSupabase } from './useSupabase';

export const useAccountsWithBalances = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useQuery<AccountWithBalance[]> ({
    queryKey: ['accountsWithBalances', user?.id],
    queryFn: async () => {
      console.log('🔥 CALLING DATABASE - get_accounts_with_balances function');
      const { data, error } = await supabase.rpc('get_accounts_with_balances');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};