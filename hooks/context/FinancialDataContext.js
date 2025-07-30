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
  console.log('FinancialDataProvider rendered');
  const supabase = useSupabase();
  const userId = useCurrentUserId();

  // State for each distinct piece of data
  const [state, setState] = useState({
    profile: null,
    netWorthData: null,
    accounts: [],
    chartData: null,
    trend: null,
    loading: true,
    refreshing: false,
    dataDirty: false,
  });

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
    console.log('loadAllFinancialData called');
    if (!supabase || !userId) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      if (showRefreshing) {
        setState(prev => ({ ...prev, refreshing: true }));
      } else {
        setState(prev => ({ ...prev, loading: true }));
      }

      // --- Step 1: Fetch the user's profile first to get their preferred currency ---
      const userProfile = await getCurrentUserProfile(supabase, userId);

      // Determine the currency to use. Fallback to EUR if not set.
      const preferredCurrency = userProfile?.preferred_currency || 'EUR';

      // --- Step 2: Fetch financial data using the user's preferred currency ---
      const [accountsAndNetWorth, history] = await Promise.all([
        getAccountsAndNetWorth(supabase, preferredCurrency),
        null
      ]);

      // --- Step 3: Set the rest of the state ---

      setState({
        profile: userProfile,
        accounts: accountsAndNetWorth.accounts,
        netWorthData: {
          netWorth: accountsAndNetWorth.totalNetWorth,
          totalAssets: accountsAndNetWorth.totalAssets,
          totalLiabilities: accountsAndNetWorth.totalLiabilities,
          currency: preferredCurrency,
        },
        trend: { change: 0, percentageChange: 0, isPositive: true },
        chartData: processChartData(history),
        loading: false,
        refreshing: false,
        dataDirty: false,
      });
      

    } catch (error) {
      console.error('Error loading all financial data in FinancialDataContext:', error);
      setState(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, [supabase, userId]);

  // Function to allow other parts of the app to signal that data needs to be refetched
  const markDataAsDirty = useCallback(() => {
    setState(prev => ({ ...prev, dataDirty: true }));
  }, []);

  // Effect to trigger the initial data load
  useEffect(() => {
    console.log('useEffect called');
    if ( supabase && userId) {
      loadAllFinancialData();
    }
  }, [supabase, userId]);



  return (
    <FinancialDataContext.Provider value={{ ...state, loadAllFinancialData, markDataAsDirty, supabase }}>
      {children}
    </FinancialDataContext.Provider>
  );
};
