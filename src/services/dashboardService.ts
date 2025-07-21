import { SupabaseClient } from '@supabase/supabase-js';
import { getUserAccounts } from './accountService';

/**
 * Dashboard Service - Handles net worth calculations and dashboard data
 */

/**
 * Get current net worth in user's preferred currency
 * @param supabase - Supabase client instance
 * @param preferredCurrency - User's preferred currency (default: EUR)
 * @returns Promise<Object> Net worth data
 */
export const getNetWorthData = async (supabase: SupabaseClient, preferredCurrency: string = 'EUR') => {
  try {
    const accounts = await getUserAccounts(supabase);
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    const assetAccounts: any[] = [];
    const liabilityAccounts: any[] = [];

    // Group accounts and calculate totals
    for (const account of accounts) {
      if (!account.include_in_net_worth) continue;

      // Convert to preferred currency (for now, assume 1:1 - we'll implement conversion later)
      const balanceInPreferredCurrency = account.current_balance;

      if (account.type === 'asset') {
        totalAssets += balanceInPreferredCurrency;
        assetAccounts.push({
          ...account,
          balance_in_preferred_currency: balanceInPreferredCurrency
        });
      } else {
        totalLiabilities += balanceInPreferredCurrency;
        liabilityAccounts.push({
          ...account,
          balance_in_preferred_currency: balanceInPreferredCurrency
        });
      }
    }

    const netWorth = totalAssets - totalLiabilities;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      assetAccounts,
      liabilityAccounts,
      currency: preferredCurrency
    };
  } catch (error) {
    console.error('Error calculating net worth:', error);
    throw error;
  }
};

/**
 * Get net worth history for chart (last 12 months)
 * @param supabase - Supabase client instance
 * @param preferredCurrency - User's preferred currency
 * @returns Promise<Array> Array of monthly net worth data
 */
export const getNetWorthHistory = async (supabase: SupabaseClient, preferredCurrency: string = 'EUR') => {
  try {
    // Get all accounts
    const accounts = await getUserAccounts(supabase);
    
    // Generate last 12 months
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      months.push({
        month: monthKey,
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    // Calculate net worth for each month
    const historyData = await Promise.all(
      months.map(async (month) => {
        let monthlyNetWorth = 0;

        for (const account of accounts) {
          if (!account.include_in_net_worth) continue;

          // Get the latest balance entry for this account up to the end of this month
          const endOfMonth = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0);
          
          const { data: balanceEntry } = await supabase
            .from('balance_entries')
            .select('amount')
            .eq('account_id', account.id)
            .lte('date', endOfMonth.toISOString().split('T')[0])
            .order('date', { ascending: false })
            .limit(1)
            .single();

          if (balanceEntry) {
            const amount = account.type === 'asset' ? balanceEntry.amount : -balanceEntry.amount;
            monthlyNetWorth += amount;
          }
        }

        return {
          month: month.label,
          value: monthlyNetWorth,
          date: month.date
        };
      })
    );

    return historyData;
  } catch (error) {
    console.error('Error fetching net worth history:', error);
    throw error;
  }
};

/**
 * Get daily change in net worth
 * @param supabase - Supabase client instance
 * @param preferredCurrency - User's preferred currency
 * @returns Promise<Object> Daily change data
 */
export const getDailyNetWorthChange = async (supabase: SupabaseClient, preferredCurrency: string = 'EUR') => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get net worth for today and yesterday
    const [todayNetWorth, yesterdayNetWorth] = await Promise.all([
      getNetWorthForDate(supabase, today, preferredCurrency),
      getNetWorthForDate(supabase, yesterday, preferredCurrency)
    ]);

    const change = todayNetWorth - yesterdayNetWorth;
    const percentageChange = yesterdayNetWorth !== 0 ? (change / Math.abs(yesterdayNetWorth)) * 100 : 0;

    return {
      change,
      percentageChange,
      isPositive: change >= 0
    };
  } catch (error) {
    console.error('Error calculating daily change:', error);
    return { change: 0, percentageChange: 0, isPositive: true };
  }
};

/**
 * Get net worth for a specific date
 * @param supabase - Supabase client instance
 * @param date - Date in YYYY-MM-DD format
 * @param preferredCurrency - User's preferred currency
 * @returns Promise<number> Net worth for the date
 */
const getNetWorthForDate = async (supabase: SupabaseClient, date: string, preferredCurrency: string = 'EUR') => {
  try {
    const accounts = await getUserAccounts(supabase);
    let netWorth = 0;

    for (const account of accounts) {
      if (!account.include_in_net_worth) continue;

      const { data: balanceEntry } = await supabase
        .from('balance_entries')
        .select('amount')
        .eq('account_id', account.id)
        .lte('date', date)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (balanceEntry) {
        const amount = account.type === 'asset' ? balanceEntry.amount : -balanceEntry.amount;
        netWorth += amount;
      }
    }

    return netWorth;
  } catch (error) {
    console.error('Error calculating net worth for date:', error);
    return 0;
  }
};

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns string Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  const currencySymbols: { [key: string]: string } = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    SEK: 'kr'
  };

  const symbol = currencySymbols[currency] || currency;
  
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount)).replace(/^/, symbol);
};