import { create } from 'zustand';

interface NetWorthState {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
  isLoading: boolean;
  error: any;
  refetch: () => void; // Add refetch function
  setNetWorthData: (data: { totalAssets: number; totalLiabilities: number; totalNetWorth: number; currency: string }, isLoading: boolean, error: any, refetch: () => void) => void;
}

export const useNetWorthStore = create<NetWorthState>((set) => ({
  totalAssets: 0,
  totalLiabilities: 0,
  totalNetWorth: 0,
  currency: 'EUR',
  isLoading: true,
  error: null,
  refetch: () => {},
  setNetWorthData: (data, isLoading, error, refetch) => set({
    totalAssets: data.totalAssets,
    totalLiabilities: data.totalLiabilities,
    totalNetWorth: data.totalNetWorth,
    currency: data.currency,
    isLoading,
    error,
    refetch,
  }),
}));