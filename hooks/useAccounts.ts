// hooks/useAccounts.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useUser} from '@clerk/clerk-expo';
import {useSupabase} from './useSupabase';
import type {Account, AccountUpdate, CreateAccountData} from '../lib/supabase';
import {useToast} from './providers/ToastProvider';
import {captureSentryException} from '@/lib/sentry';

interface MutationOptions {
  sentry?: {
    location: string;
    component: string;
  };
}

/* ---------- list ---------- */
export const useAccounts = () => {
  const {user} = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async (): Promise<Account[]> => {
      console.log('🔥 CALLING DATABASE - useAccounts queryFn');
      const {data, error} = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', {ascending: false});
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

/* ---------- details ---------- */
export const useAccountDetails = (accountId: string, options?: MutationOptions) => {
  const supabase = useSupabase();
  const {showToast} = useToast();

  return useQuery<Account | null, Error>({
    queryKey: ['account', accountId],
    queryFn: async (): Promise<Account | null> => {
      try {
        const {data, error} = await supabase.from('accounts').select('*').eq('id', accountId).single();
        if (error) throw error;
        return data;
      } catch (error) {
        showToast('Could not load account details.', 'error');
        captureSentryException(error, {
          location: options?.sentry?.location || 'account_details',
          context: 'data_fetch',
          component: options?.sentry?.component || 'useAccountDetails',
          level: 'warning',
        });
        throw error;
      }
    },
    enabled: !!accountId,
  });
};

/* ---------- add ---------- */
export const useAddAccount = (options?: MutationOptions) => {
  const {user} = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async (payload: CreateAccountData) => {
      const {initial_balance, ...fields} = payload;

      console.log('🔥 CALLING DATABASE - useAddAccount mutationFn');
      const {data: account, error} = await supabase
        .from('accounts')
        .insert([{...fields, user_id: user!.id}])
        .select()
        .single<Account>();
      if (error) throw error;

      // It's possible for the insert to succeed but return no data.
      // This guard prevents runtime errors.
      if (!account) throw new Error('Account creation failed: No data returned.');

      if (initial_balance && initial_balance > 0) {
        await supabase.from('balance_entries').insert([
          {
            account_id: account.id,
            amount: initial_balance,
            date: new Date().toISOString().split('T')[0],
            notes: 'Initial balance',
          },
        ]);
      }
      return account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      showToast('Account added successfully', 'success');
    },
    onError: error => {
      captureSentryException(error, {
        location: options?.sentry?.location || 'unknown_add_account',
        context: 'add_account',
        component: options?.sentry?.component || 'useAddAccount',
        level: 'error',
      });
      showToast('Failed to add account.', 'error');
    },
  });
};

/* ---------- update ---------- */
export const useUpdateAccount = (options?: MutationOptions) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async ({id, updates}: {id: string; updates: Partial<Account>}) => {
      console.log('🔥 CALLING DATABASE - useUpdateAccount mutationFn', id);
      const {data, error} = await supabase.from('accounts').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      queryClient.invalidateQueries({queryKey: ['account', variables.id]});

      // Manually update the cache for the specific account
      //queryClient.setQueryData(['account', variables.id], data);

      showToast('Account updated successfully', 'success');
    },
    onError: error => {
      captureSentryException(error, {
        location: options?.sentry?.location || 'unknown_update_account',
        context: 'update_account',
        component: options?.sentry?.component || 'useUpdateAccount',
        level: 'error',
      });
      showToast('Failed to update account.', 'error');
    },
  });
};

/* ---------- delete ---------- */
export const useDeleteAccount = (options?: MutationOptions) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const {showToast} = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      console.log('🔥 CALLING DATABASE - useDeleteAccount mutationFn');
      // No need to delete balance_entries manually.
      // The `ON DELETE CASCADE` constraint on the `accounts` table handles this automatically.
      const {error} = await supabase.from('accounts').delete().eq('id', accountId);
      if (error) throw error;
    },

    onSuccess: (_d, accountId) => {
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['accountsWithBalances']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
      queryClient.invalidateQueries({queryKey: ['netWorthHistory']});
      showToast('Account deleted successfully', 'success');
    },
    onError: error => {
      captureSentryException(error, {
        location: options?.sentry?.location || 'unknown_delete_account',
        context: 'delete_account',
        component: options?.sentry?.component || 'useDeleteAccount',
        level: 'error',
      });
      showToast('Failed to delete account.', 'error');
    },
  });
};
