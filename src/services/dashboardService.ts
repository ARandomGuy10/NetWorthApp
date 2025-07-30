import { FunctionsHttpError, SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches the user's accounts and calculated net worth from a Supabase Edge Function.
 * This is the primary data-fetching method for the main dashboard, combining
 * multiple data points into a single, efficient network request.
 *
 * @param supabase The Supabase client instance used to invoke the edge function.
 * @param toCurrency The target currency for net worth calculations. Defaults to 'EUR'.
 * @returns A promise that resolves to an object containing:
 *          - accounts: An array of user accounts with their latest balances.
 *          - totalNetWorth: The calculated total net worth in the specified currency.
 *          - totalAssets: The calculated total assets in the specified currency.
 *          - totalLiabilities: The calculated total liabilities in the specified currency.
 *          Returns a default object with empty/zero values in case of an error.
 */
export const getAccountsAndNetWorth = async (supabase: SupabaseClient, toCurrency: string = 'EUR') => {
  try {
    // Invoke the edge function, passing the desired currency in the body.
    const { data, error } = await supabase.functions.invoke('fetch-account-date-and-net-worth', {
      body: { toCurrency },
    });

    if (error && error instanceof FunctionsHttpError) {
      const errorMessage = await error.context.json()
      console.log('Function returned an error', errorMessage)
    }

    if (error) {
      // Throw a detailed error if the function invocation itself fails.
      throw new Error(`Edge function invocation failed: ${error}`);
    }

    
    //console.log('Function returned data', data)
    // The edge function returns the exact structure we need.
    return data;

  } catch (error) {
    console.error('Error fetching data from getAccountsAndNetWorth edge function:', error);
    // Return a default, safe structure in case of an error to prevent app crashes.
    return {
      accounts: [],
      totalNetWorth: 0,
      totalAssets: 0,
      totalLiabilities: 0,
    };
  }
};


/**
 * Get net worth history for chart (last 12 months).
 * This function remains as it performs a specific historical analysis
 * that is separate from the main dashboard data.
 * @param supabase - Supabase client instance
 * @param preferredCurrency - User's preferred currency
 * @returns Promise<Array> Array of monthly net worth data
 */
export const getNetWorthHistory = async (supabase: SupabaseClient, preferredCurrency: string = 'EUR') => {
  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, type, include_in_net_worth');

    if (accountsError) throw accountsError;
    
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      months.push({
        month: monthKey,
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    const historyData = await Promise.all(
      months.map(async (month) => {
        let monthlyNetWorth = 0;

        for (const account of accounts) {
          if (!account.include_in_net_worth) continue;

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