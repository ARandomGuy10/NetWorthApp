import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import type { Account, Balance } from '../lib/supabase'; 
import { useSmartMutation } from './useSmartMutation';

export const useBalances = (accountId: string) => {
  const supabase = useSupabase();
  
  return useQuery({
    queryKey: ['balances', accountId],
    queryFn: async (): Promise<Balance[]> => {
      console.log('Fetching balances for account:', accountId);
      const { data, error } = await supabase
        .from('balance_entries')
        .select('*')
        .eq('account_id', accountId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
};

export const useAddBalance = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async (balanceData: Omit<Balance, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Adding balance for account:', balanceData.account_id);
      const { data, error } = await supabase
        .from('balance_entries')
        .insert([balanceData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    invalidateQueries: ['balances', 'accounts', 'dashboard'],
  });
};

export const useUpdateBalance = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Balance> }) => {
      console.log('Updating balance for account:', id);
      const { data, error } = await supabase
        .from('balance_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    invalidateQueries: ['balances', 'accounts', 'dashboard'],
  });
};

export const useDeleteBalance = () => {
  const queryClient = useQueryClient();
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting balance for account:', id);
      const { error } = await supabase.from('balances').delete().eq('id', id);
      if (error) throw error;
    },
    invalidateQueries: ['balances', 'accounts', 'dashboard'],
  });
};
