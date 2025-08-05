import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import type { Balance } from '../lib/supabase';
import { useToast } from '../hooks/providers/ToastProvider';

/* ---------- list ---------- */
export const useBalances = (accountId: string) => {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ['balance', accountId],
    enabled: !!accountId,
    queryFn: async (): Promise<Balance[]> => {
      console.log('🔥 CALLING DATABASE - useBalances queryFn, Account ID:', accountId);
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
  const { showToast } = useToast();

  return useMutation({
  mutationFn: async (payload: Omit<Balance, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('🔥 CALLING DATABASE - useAddBalance mutationFn');
        const { data, error } = await supabase
        .from('balance_entries')
        .upsert(payload, { onConflict: 'account_id,date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['balance', vars.account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Balance added successfully', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });
};

/* ---------- update ---------- */
export const useUpdateBalance = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Balance> }) => {
      console.log('🔥 CALLING DATABASE - useUpdateBalance mutationFn');
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
      queryClient.invalidateQueries({ queryKey: ['balance', vars.updates.account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Balance updated successfully', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });
};

/* ---------- delete ---------- */
export const useDeleteBalance = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, account_id }: { id: string; account_id: string }) => {
      console.log('🔥 CALLING DATABASE - useDeleteBalance mutationFn');
      const { error } = await supabase
        .from('balance_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, { account_id }) => {
      queryClient.invalidateQueries({ queryKey: ['balance', account_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Balance deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });
};
