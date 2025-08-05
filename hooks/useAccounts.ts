// hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import type { Account, AccountUpdate, CreateAccountData } from '../lib/supabase';
import { useToast } from '../app/providers/ToastProvider';



/* ---------- list ---------- */
export const useAccounts = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

/* ---------- details ---------- */
export const useAccountDetails = (accountId: string) => {
  const supabase = useSupabase();
  
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async (): Promise<Account | null> => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
};

/* ---------- add ---------- */
export const useAddAccount = () => {
  const { user }     = useUser();
  const supabase     = useSupabase();
  const queryClient  = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAccountData) => {
      const { initial_balance, ...fields } = payload;

      const { data: account, error } = await supabase
        .from('accounts')
        .insert([{ ...fields, user_id: user!.id }])
        .select()
        .single();
      if (error) throw error;

      if (initial_balance && initial_balance > 0) {
        await supabase.from('balance_entries').insert([{
          account_id: account.id,
          amount: initial_balance,
          date: new Date().toISOString().split('T')[0],
          notes: 'Initial balance',
        }]);
      }
      return account;
    },  
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/* ---------- update ---------- */
export const useUpdateAccount = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Account> }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/* ---------- delete ---------- */
export const useDeleteAccount = () => {
  const supabase    = useSupabase();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      await supabase.from('balance_entries').delete().eq('account_id', accountId);
      const { error } = await supabase.from('accounts').delete().eq('id', accountId);
      if (error) throw error;
    },
    
    onSuccess: (_d, accountId) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Account deleted successfully', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    }
  });
};