// hooks/useAccounts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { useSmartMutation } from './useSmartMutation';
import type { Account, AccountUpdate, CreateAccountData } from '../lib/supabase';



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

export const useAddAccount = () => {
  const { user } = useUser();
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async (accountData: CreateAccountData) => {
      const { initial_balance, ...accountFields } = accountData;
      
      // Create account first
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert([{ 
          ...accountFields, 
          user_id: user!.id 
        }])
        .select()
        .single();
        
      if (accountError) throw accountError;
      
      // Create initial balance entry if provided and greater than 0
      if (initial_balance && initial_balance > 0) {
        const { error: balanceError } = await supabase
          .from('balance_entries')
          .insert([{
            account_id: account.id,
            amount: initial_balance,
            date: new Date().toISOString().split('T')[0],
            notes: 'Initial balance'
          }]);
          
        if (balanceError) {
          console.error('Error creating initial balance:', balanceError);
          // Note: We don't throw here to avoid rolling back the account creation
          // The account will be created but without the initial balance
        }
      }
      
      return account;
    },
    invalidateQueries: ['accounts', 'dashboard', 'balances'],
  });
};

export const useUpdateAccount = () => {
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AccountUpdate> }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    invalidateQueries: ['accounts', 'dashboard'],
  });
};

export const useDeleteAccount = () => {
  const supabase = useSupabase();
  
  return useSmartMutation({
    mutationFn: async (id: string) => {
      // First delete all balance entries for this account
      const { error: balanceError } = await supabase
        .from('balance_entries')
        .delete()
        .eq('account_id', id);
      
      if (balanceError) throw balanceError;
      
      // Then delete the account
      const { error: accountError } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);
        
      if (accountError) throw accountError;
    },
    invalidateQueries: ['accounts', 'dashboard', 'balances'],
  });
};
