import { create } from 'zustand';
import type { AccountWithBalance } from '@/lib/supabase';

interface AccountState {
  accounts: AccountWithBalance[];
  isLoading: boolean;
  error: any;
  refetch: () => void; // Add refetch function
  setAccounts: (accounts: AccountWithBalance[], isLoading: boolean, error: any, refetch: () => void) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: true,
  error: null,
  refetch: () => {},
  setAccounts: (accounts, isLoading, error, refetch) => set({
    accounts,
    isLoading,
    error,
    refetch,
  }),
}));