import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-expo';
import { useSupabase } from './useSupabase';
import { useProfile } from './useProfile';

type Period = '1M' | '3M' | '6M' | '12M' | 'ALL' | 'CUSTOM';
type SamplingStrategy = 'daily' | 'weekly' | 'monthly' | 'adaptive';

interface NetWorthDataPoint {
  date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
}

interface NetWorthHistoryResponse {
  period: Period;
  startDate: string;
  endDate: string;
  currency: string;
  samplingStrategy: SamplingStrategy;
  maxDataPoints: number;
  actualDataPoints: number;
  calculatedAt: string;
  data: NetWorthDataPoint[];
  performance: {
    dbQueryTime: number;
    rateQueryTime: number;
    processingTime: number;
    totalProcessingTime: number;
    cacheHitRate: boolean;
    requestId: string;
  };
  metadata: {
    includeAccountBreakdown: boolean;
    uniqueCurrencies: number;
    totalAccounts: number;
  };
  note: string;
}

interface UseNetWorthHistoryOptions {
  period: Period;
  startDate?: string; // Only for CUSTOM period
  endDate?: string; // Only for CUSTOM period
  samplingStrategy?: SamplingStrategy;
  maxDataPoints?: number;
  includeAccountBreakdown?: boolean;
  enabled?: boolean;
}

export const useNetWorthHistory = (options: UseNetWorthHistoryOptions) => {
  const { user } = useUser();
  const supabase = useSupabase();
  const { data: profile } = useProfile();

  const {
    period,
    startDate,
    endDate,
    samplingStrategy,
    maxDataPoints,
    includeAccountBreakdown = false,
    enabled = true
  } = options;

  return useQuery<NetWorthHistoryResponse>({
    queryKey: [
      'netWorthHistory',
      user?.id,
      period,
      startDate,
      endDate,
      profile?.preferred_currency,
      samplingStrategy,
      maxDataPoints,
      includeAccountBreakdown
    ],
    queryFn: async () => {
      console.log(`🔥 CALLING DATABASE - Net Worth History ${period}`);

      const requestBody: any = {
        period,
        toCurrency: profile?.preferred_currency || 'EUR',
      };

      // Only include optional parameters if they're provided
      if (period === 'CUSTOM') {
        if (!startDate || !endDate) {
          throw new Error('Start and end dates are required for CUSTOM period');
        }
        requestBody.startDate = startDate;
        requestBody.endDate = endDate;
      }

      if (samplingStrategy) requestBody.samplingStrategy = samplingStrategy;
      if (maxDataPoints) requestBody.maxDataPoints = maxDataPoints;
      if (includeAccountBreakdown) requestBody.includeAccountBreakdown = includeAccountBreakdown;

      const { data, error } = await supabase.functions.invoke('get-net-worth-history-edge-function', {
        body: requestBody
      });

      if (error) {
        console.error('Error fetching net worth history:', error);
        throw error;
      }
      //console.log('🔥 Net Worth History:', data);
      return data;
    },
    enabled: !!user?.id && !!profile && enabled,
  });
};

// Convenience hooks for specific periods
export const useNetWorthHistory1M = (options?: Omit<UseNetWorthHistoryOptions, 'period'>) =>
  useNetWorthHistory({ period: '1M', ...options });

export const useNetWorthHistory3M = (options?: Omit<UseNetWorthHistoryOptions, 'period'>) =>
  useNetWorthHistory({ period: '3M', ...options });

export const useNetWorthHistory6M = (options?: Omit<UseNetWorthHistoryOptions, 'period'>) =>
  useNetWorthHistory({ period: '6M', ...options });

export const useNetWorthHistory12M = (options?: Omit<UseNetWorthHistoryOptions, 'period'>) =>
  useNetWorthHistory({ period: '12M', ...options });

export const useNetWorthHistoryAll = (options?: Omit<UseNetWorthHistoryOptions, 'period'>) =>
  useNetWorthHistory({ period: 'ALL', ...options });

// Hook for custom date range
export const useNetWorthHistoryCustom = (
  startDate: string,
  endDate: string,
  options?: Omit<UseNetWorthHistoryOptions, 'period' | 'startDate' | 'endDate'>
) =>
  useNetWorthHistory({ 
    period: 'CUSTOM', 
    startDate, 
    endDate, 
    ...options 
  });
