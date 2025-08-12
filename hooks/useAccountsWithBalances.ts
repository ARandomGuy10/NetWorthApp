import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import type { AccountWithBalance } from '@/lib/supabase';

export const useAccountsWithBalances = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  console.log('useAccountsWithBalances - user?.id:', user?.id);

  return useQuery<AccountWithBalance[]> ({
    queryKey: ['accountsWithBalances', user?.id],
    queryFn: async () => {
      console.log('🔥 CALLING DATABASE - get_accounts_with_balances function');
      const { data, error } = await supabase.functions.invoke('get_accounts_with_balances');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};