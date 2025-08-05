// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Simplified base client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simplified Database type (fixes the generic issues)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          preferred_currency: string;
          timezone: string | null;
          date_format: string | null;
          last_sign_in_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          theme: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          preferred_currency?: string;
          timezone?: string | null;
          date_format?: string | null;
          last_sign_in_at?: string | null;
          theme?: string;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          preferred_currency?: string;
          timezone?: string | null;
          date_format?: string | null;
          theme?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'asset' | 'liability';
          currency: string;
          category: string;
          institution: string | null;
          include_in_net_worth: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'asset' | 'liability';
          currency?: string;
          category: string;
          institution?: string | null;
          include_in_net_worth?: boolean;
        };
        Update: {
          name?: string;
          type?: 'asset' | 'liability';
          currency?: string;
          category?: string;
          institution?: string | null;
          include_in_net_worth?: boolean | null;
        };
      };
      balance_entries: {
        Row: {
          id: string;
          account_id: string;
          amount: number;
          date: string;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          account_id: string;
          amount: number;
          date: string;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          date?: string;
          notes?: string | null;
        };
      };
    };
    Functions: {
      get_accounts_with_balances: {
        Args: {};
        Returns: {
          account_id: string;
          account_name: string;
          account_type: 'asset' | 'liability';
          category: string;
          institution: string | null;
          currency: string;
          latest_balance: number | null;
          latest_balance_date: string | null;
        }[];
      };
    };
  };
};

// Convenience types
export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];
export type Balance = Database['public']['Tables']['balance_entries']['Row'];
export type BalanceInsert = Database['public']['Tables']['balance_entries']['Insert'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type AccountWithBalance = Database['public']['Functions']['get_accounts_with_balances']['Returns'][0];

// Edge Function Response Types
export interface DashboardAccount {
  account_id: string;
  account_name: string;
  account_type: 'asset' | 'liability';
  category: string;
  converted_balance: number;
  currency: string;
  institution: string;
  latest_balance: number;
  latest_balance_date: string;
}

export interface DashboardResponse {
  accounts: DashboardAccount[];
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
}

export interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
  totalNetWorth: number;
  currency: string;
}

// Custom interface for account creation with initial balance
export interface CreateAccountData {
  name: string;
  type: 'asset' | 'liability';
  category: string;
  currency: string;
  institution: string | null;
  include_in_net_worth: boolean;
  initial_balance?: number;
}


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
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
  'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK',
  'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN',
  'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
];

export const THEMES = [
  'LIGHT',
  'DARK',
  'SYSTEM',
  'MODERN_FINANCE',
  'WARM_LUXURY',
  'NEO_BANKING',
  'DARK_MODE_FOCUSED',
  'EARTHY_CALM'
];
