import { SupabaseClient } from '@supabase/supabase-js';

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
