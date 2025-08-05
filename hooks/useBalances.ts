import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import type { Balance } from '../lib/supabase';

/* ---------- list ---------- */
export const useBalances = (accountId: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['balance', accountId],
    enabled: !!accountId,
    queryFn: async (): Promise<Balance[]> => {
      const { data, error } = await supabase
        .from('balance_entries')
        .select('*')
        .eq('account_id', accountId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

/* ---------- add ---------- */
export const useAddBalance = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
  mutationFn: async (payload: Omit<Balance, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('balance_entries')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['balance', vars.account_id] });
      queryClient.invalidateQueries({ queryKey: ['account', vars.account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/* ---------- update ---------- */
export const useUpdateBalance = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Balance> }) => {
      const { data, error } = await supabase
        .from('balance_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars: { id: string; updates: Partial<Balance> }) => {
      queryClient.invalidateQueries({ queryKey: ['balance', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['account', vars.updates.account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/* ---------- delete ---------- */
export const useDeleteBalance = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, account_id }: { id: string; account_id: string }) => {
      const { error } = await supabase
        .from('balance_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { account_id }) => {
      queryClient.invalidateQueries({ queryKey: ['balance', account_id] });
      queryClient.invalidateQueries({ queryKey: ['account', account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
