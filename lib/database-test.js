import { supabase } from './supabase';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Test database connection and schema
 */
export const testDatabaseSchema = async (getToken) => {
  console.log('🧪 Testing database schema...');
  
  try {
    // Get Clerk token for authentication
    const token = await getToken({ template: 'supabase' });
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Set auth token for Supabase
    supabase.realtime.setAuth(token);
    
    const results = {
      accounts: false,
      balance_entries: false,
      user_preferences: false,
      exchange_rates: false,
      auth: false
    };

    // Test 1: Check if we can read exchange_rates (public read)
    console.log('Testing exchange_rates table...');
    const { data: rates, error: ratesError } = await supabase
      .from('exchange_rates')
      .select('*')
      .limit(5);
    
    if (ratesError) {
      console.error('❌ Exchange rates error:', ratesError);
    } else {
      console.log('✅ Exchange rates working:', rates?.length, 'rates found');
      results.exchange_rates = true;
    }

    // Test 2: Try to create a test account (should work with auth)
    console.log('Testing accounts table...');
    const testAccount = {
      name: 'Test Account',
      type: 'asset',
      category: 'checking',
      currency: 'EUR',
      institution: 'Test Bank'
    };

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert(testAccount)
      .select()
      .single();

    if (accountError) {
      console.error('❌ Accounts error:', accountError);
    } else {
      console.log('✅ Accounts working: Created account', account?.id);
      results.accounts = true;
      results.auth = true;

      // Test 3: Try to create a balance entry for the test account
      console.log('Testing balance_entries table...');
      const testBalance = {
        account_id: account.id,
        amount: 1000.50,
        date: new Date().toISOString().split('T')[0],
        notes: 'Test balance entry'
      };

      const { data: balance, error: balanceError } = await supabase
        .from('balance_entries')
        .insert(testBalance)
        .select()
        .single();

      if (balanceError) {
        console.error('❌ Balance entries error:', balanceError);
      } else {
        console.log('✅ Balance entries working: Created entry', balance?.id);
        results.balance_entries = true;
      }

      // Test 4: Try to create user preferences
      console.log('Testing user_preferences table...');
      const testPrefs = {
        preferred_currency: 'EUR',
        timezone: 'Europe/Berlin',
        date_format: 'DD/MM/YYYY'
      };

      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .upsert(testPrefs)
        .select()
        .single();

      if (prefsError) {
        console.error('❌ User preferences error:', prefsError);
      } else {
        console.log('✅ User preferences working:', prefs?.id);
        results.user_preferences = true;
      }

      // Cleanup: Delete test data
      console.log('Cleaning up test data...');
      await supabase.from('balance_entries').delete().eq('account_id', account.id);
      await supabase.from('accounts').delete().eq('id', account.id);
      await supabase.from('user_preferences').delete().eq('id', prefs?.id);
    }

    // Summary
    console.log('\n📊 Test Results:');
    console.log('- Exchange rates:', results.exchange_rates ? '✅' : '❌');
    console.log('- Accounts:', results.accounts ? '✅' : '❌');
    console.log('- Balance entries:', results.balance_entries ? '✅' : '❌');
    console.log('- User preferences:', results.user_preferences ? '✅' : '❌');
    console.log('- Authentication:', results.auth ? '✅' : '❌');

    const allPassed = Object.values(results).every(result => result === true);
    console.log('\n🎯 Overall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

    return results;

  } catch (error) {
    console.error('💥 Database test failed:', error);
    return {
      accounts: false,
      balance_entries: false,
      user_preferences: false,
      exchange_rates: false,
      auth: false,
      error: error.message
    };
  }
};

/**
 * React hook to test database
 */
export const useDatabaseTest = () => {
  const { getToken } = useAuth();

  const runTest = async () => {
    return await testDatabaseSchema(getToken);
  };

  return { runTest };
};