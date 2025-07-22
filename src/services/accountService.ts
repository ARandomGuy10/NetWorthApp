import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Account Service - Handles all account-related database operations
 */

// Account categories from schema
export const ACCOUNT_CATEGORIES = {
  asset: [
    'Cash',
    'Checking',
    'Savings',
    'Investment',
    'Retirement',
    'Real Estate',
    'Vehicle',
    'Other Asset'
  ],
  liability: [
    'Credit Card',
    'Personal Loan',
    'Mortgage',
    'Auto Loan',
    'Student Loan',
    'Other Liability'
  ]
};

export const CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR', 'CNY', 'SEK'
];

/**
 * Fetch all accounts for the current user
 * @param supabase - Supabase client instance
 * @returns Promise<Array> Array of accounts with latest balance
 */
export const getUserAccounts = async (supabase: SupabaseClient) => {
  try {
    // First get all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (accountsError) throw accountsError;

    // Get latest balance for each account
    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const { data: latestBalance } = await supabase
          .from('balance_entries')
          .select('amount, date')
          .eq('account_id', account.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        return {
          ...account,
          current_balance: latestBalance?.amount || 0,
          last_updated: latestBalance?.date || account.created_at
        };
      })
    );

    return accountsWithBalances;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

/**
 * Create a new account
 * @param supabase - Supabase client instance
 * @param accountData - Account data
 * @returns Promise<Object> Created account
 */
export const createAccount = async (supabase: SupabaseClient, accountData: any) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .insert([{
        name: accountData.name,
        type: accountData.type,
        currency: accountData.currency || 'EUR',
        category: accountData.category,
        institution: accountData.institution || '',
        include_in_net_worth: accountData.include_in_net_worth !== false,
        user_id: accountData.user_id
      }])
      .select()
      .single();

    if (error) throw error;

    // If initial balance is provided, create a balance entry
    if (accountData.initial_balance && accountData.initial_balance > 0) {
      await createBalanceEntry(supabase, {
        account_id: data.id,
        amount: accountData.initial_balance,
        date: new Date().toISOString().split('T')[0],
        notes: 'Initial balance'
      });
    }

    return data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

/**
 * Update an existing account
 * @param supabase - Supabase client instance
 * @param accountId - Account ID
 * @param updates - Fields to update
 * @returns Promise<Object> Updated account
 */
export const updateAccount = async (supabase: SupabaseClient, accountId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

/**
 * Delete an account and all its balance entries
 * @param supabase - Supabase client instance
 * @param accountId - Account ID
 * @returns Promise<boolean> Success status
 */
export const deleteAccount = async (supabase: SupabaseClient, accountId: string) => {
  try {
    // Delete balance entries first (due to foreign key constraint)
    await supabase
      .from('balance_entries')
      .delete()
      .eq('account_id', accountId);

    // Then delete the account
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

/**
 * Get account by ID
 * @param supabase - Supabase client instance
 * @param accountId - Account ID
 * @returns Promise<Object> Account data
 */
export const getAccountById = async (supabase: SupabaseClient, accountId: string) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};

/**
 * Create a balance entry
 * @param supabase - Supabase client instance
 * @param balanceData - Balance entry data
 * @returns Promise<Object> Created balance entry
 */
export const createBalanceEntry = async (supabase: SupabaseClient, balanceData: any) => {
  try {
    const { data, error } = await supabase
      .from('balance_entries')
      .insert([balanceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating balance entry:', error);
    throw error;
  }
};

/**
 * Get balance entries for an account
 * @param supabase - Supabase client instance
 * @param accountId - Account ID
 * @returns Promise<Array> Array of balance entries
 */
export const getAccountBalances = async (supabase: SupabaseClient, accountId: string) => {
  try {
    const { data, error } = await supabase
      .from('balance_entries')
      .select('*')
      .eq('account_id', accountId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching balance entries:', error);
    throw error;
  }
};

/**
 * Update a balance entry
 * @param supabase - Supabase client instance
 * @param entryId - Balance entry ID
 * @param updates - Fields to update
 * @returns Promise<Object> Updated balance entry
 */
export const updateBalanceEntry = async (supabase: SupabaseClient, entryId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('balance_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating balance entry:', error);
    throw error;
  }
};

/**
 * Delete a balance entry
 * @param supabase - Supabase client instance
 * @param entryId - Balance entry ID
 * @returns Promise<boolean> Success status
 */
export const deleteBalanceEntry = async (supabase: SupabaseClient, entryId: string) => {
  try {
    const { error } = await supabase
      .from('balance_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting balance entry:', error);
    throw error;
  }
};