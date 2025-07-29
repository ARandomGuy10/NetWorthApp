import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useSupabase } from '../useSupabase';
import { useCurrentUserId } from '../useCurrentUserId';
import { getCurrentUserProfile } from '../../src/services/profileService';
import {
  getAccountsAndNetWorth,
  getNetWorthHistory,
} from '../../src/services/dashboardService';

// 1. Create the Context
const FinancialDataContext = createContext(undefined);

// 2. Create a custom hook to use the context
export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};

// 3. Create the Provider Component
export const FinancialDataProvider = ({ children }) => {
  const supabase = useSupabase();
  const userId = useCurrentUserId();

  // State for each distinct piece of data
  const [profile, setProfile] = useState(null);
  const [netWorthData, setNetWorthData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [trend, setTrend] = useState(null); // Note: Edge function does not provide this yet

  // General state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataDirty, setDataDirty] = useState(false);

  const processChartData = (history) => {
    if (!history || history.length === 0) return null;
    return history.map((item, index) => ({
      x: index + 1,
      y: item.value,
      label: item.month,
      date: item.date,
      value: item.value
    }));
  };

  // Central function to load all data required for the dashboard and related screens
  const loadAllFinancialData = useCallback(async (showRefreshing = false) => {
    if (!supabase || !userId) {
      setLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // --- Step 1: Fetch the user's profile first to get their preferred currency ---
      const userProfile = await getCurrentUserProfile(supabase, userId);
      setProfile(userProfile); // Set profile state immediately

      // Determine the currency to use. Fallback to EUR if not set.
      const preferredCurrency = userProfile?.preferred_currency || 'EUR';

      // --- Step 2: Fetch financial data using the user's preferred currency ---
      const [accountsAndNetWorth, history] = await Promise.all([
        getAccountsAndNetWorth(supabase, preferredCurrency),
        getNetWorthHistory(supabase, preferredCurrency)
      ]);

      // --- Step 3: Set the rest of the state ---
      setAccounts(accountsAndNetWorth.accounts);
      
      setNetWorthData({
        netWorth: accountsAndNetWorth.totalNetWorth,
        totalAssets: accountsAndNetWorth.totalAssets,
        totalLiabilities: accountsAndNetWorth.totalLiabilities,
        currency: preferredCurrency, // Use the dynamic currency here
      });

      // TODO: The daily trend calculation needs to be added to the Edge Function.
      setTrend({ change: 0, percentageChange: 0, isPositive: true });
      
      if (history && history.length > 0) {
        const processedData = processChartData(history);
        setChartData(processedData);
      }

    } catch (error) {
      console.error('Error loading all financial data in FinancialDataContext:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setDataDirty(false);
    }
  }, [supabase, userId]);

  // Function to allow other parts of the app to signal that data needs to be refetched
  const markDataAsDirty = useCallback(() => {
    setDataDirty(true);
  }, []);

  // Effect to trigger the initial data load
  useEffect(() => {
    // We no longer check for profile === null here, as it's the first thing to be fetched.
    if (supabase && userId) {
      loadAllFinancialData();
    }
  }, [supabase, userId]); // Removed profile and loadAllFinancialData from deps to prevent re-triggering

  // The value provided to consuming components
  const value = {
    profile,
    netWorthData,
    chartData,
    trend,
    accounts,
    loading,
    refreshing,
    dataDirty,
    loadAllFinancialData,
    markDataAsDirty,
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
};
