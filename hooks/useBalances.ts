import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useSupabase} from './useSupabase';
import type {Balance} from '../lib/supabase';
import {useToast} from '../hooks/providers/ToastProvider';
import {captureSentryException} from '@/lib/sentry';

interface MutationOptions {
  sentry?: {
    location: string;
    component: string;
  };
}

/* ---------- list ---------- */
export const useBalances = (accountId: string, options?: MutationOptions) => {
  const supabase = useSupabase();
  const {showToast} = useToast();

  return useQuery<Balance[], Error>({
    queryKey: ['balance', accountId],
    enabled: !!accountId,
    queryFn: async (): Promise<Balance[]> => {
      try {
        const {data, error} = await supabase
          .from('balance_entries')
          .select('*')
          .eq('account_id', accountId)
          .order('date', {ascending: false});
        if (error) throw error;
        return data;
      } catch (error) {
        showToast('Could not load balance history.', 'error');
        captureSentryException(error, {
          location: options?.sentry?.location || 'account_details',
          context: 'data_fetch_balances',
          component: options?.sentry?.component || 'useBalances',
          level: 'warning',
        });
        throw error;
      }
    },
  });
};

/* ---------- add ---------- */
export const useAddBalance = (options?: MutationOptions) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async (payload: Omit<Balance, 'id' | 'created_at' | 'updated_at'>) => {
      const {data, error} = await supabase
        .from('balance_entries')
        .upsert(payload, {onConflict: 'account_id,date'})
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({queryKey: ['balance', vars.account_id]});
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      showToast('Balance added successfully', 'success');
    },
    onError: error => {
      showToast('Failed to add balance.', 'error');
      captureSentryException(error, {
        location: options?.sentry?.location || 'unknown_balance',
        context: 'add_balance',
        component: options?.sentry?.component || 'useAddBalance',
        level: 'error',
      });
    },
  });
};

/* ---------- update ---------- */
export const useUpdateBalance = (options?: MutationOptions) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<Balance>}) => {
      const {data, error} = await supabase.from('balance_entries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars: {id: string; updates: Partial<Balance>}) => {
      queryClient.invalidateQueries({queryKey: ['balance', vars.updates.account_id]});
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      showToast('Balance updated successfully', 'success');
    },
    onError: error => {
      showToast('Failed to update balance.', 'error');
      captureSentryException(error, {
        location: options?.sentry?.location || 'unknown_balance',
        context: 'update_balance',
        component: options?.sentry?.component || 'useUpdateBalance',
        level: 'error',
      });
    },
  });
};

/* ---------- delete ---------- */
export const useDeleteBalance = (options?: MutationOptions) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async ({id, account_id}: {id: string; account_id: string}) => {
      const {error} = await supabase.from('balance_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, {account_id}) => {
      queryClient.invalidateQueries({queryKey: ['balance', account_id]});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      showToast('Balance deleted successfully', 'success');
    },
    onError: error => {
      showToast('Failed to delete balance.', 'error');
      captureSentryException(error, {
        location: options?.sentry?.location || 'account_details',
        context: 'delete_balance',
        component: options?.sentry?.component || 'useDeleteBalance',
        level: 'error',
      });
    },
  });
};
