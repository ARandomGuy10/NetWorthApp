// lib/supabase.ts

import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Simplified base client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -----------------------------------------------------------------------------
// Database type (public schema) – tables + RPC
// -----------------------------------------------------------------------------

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
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
          theme: string;
          remind_after_days: number;
          haptic_feedback_enabled: boolean;
          sounds_enabled: boolean;
          has_completed_onboarding: boolean;
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
          remind_after_days?: number;
          haptic_feedback_enabled?: boolean;
          sounds_enabled?: boolean;
          has_completed_onboarding?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          preferred_currency?: string;
          timezone?: string | null;
          date_format?: string | null;
          theme?: string;
          remind_after_days?: number;
          haptic_feedback_enabled?: boolean;
          sounds_enabled?: boolean;
          has_completed_onboarding?: boolean;
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
          is_archived: boolean | null;
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
          is_archived?: boolean | null;
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
          include_in_net_worth: boolean | null;
          is_archived: boolean | null;
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
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type AccountWithBalance = Database['public']['Functions']['get_accounts_with_balances']['Returns'];

// -----------------------------------------------------------------------------
// Analytics and Dashboard interfaces
// -----------------------------------------------------------------------------

export interface CategoryBreakdown {
  category: string;
  assets: number;
  liabilities: number;
  total: number;
}

export interface CurrencyExposure {
  currency: string;
  assets: number;
  liabilities: number;
  total: number;
}

export interface TopAccount {
  account_id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  currency: string;
  amount: number;
}

export interface DashboardAnalytics {
  asOfDate: string;
  daysSinceLastUpdate: number;
  categoryBreakdown: CategoryBreakdown[];
  currencyExposure: CurrencyExposure[];
  topAccounts: TopAccount[];
  badges: string[];
  toCurrency: string;
}

export type DashboardAccount = AccountWithBalance & {
  converted_balance: number;
};

export interface DashboardData {
  accounts: DashboardAccount[];
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  analytics: DashboardAnalytics;
}

// -----------------------------------------------------------------------------
// Net worth history: insights and data points
// -----------------------------------------------------------------------------

export interface PerformanceSummary {
  start: number;
  end: number;
  change: number;
  percent: number;
}

export interface MonthlyDelta {
  month: string; // e.g., '2025-07'
  delta: number;
  percent: number;
}

export interface GrowthStreak {
  current_streak: number;
  longest_streak: number;
}

export interface Trend {
  slope: number;
  direction: string; // 'up' | 'down' | 'flat'
}

export interface Highs {
  allTimeHigh: number;
  isAtAllTimeHigh: boolean;
}

export interface Volatility {
  stddevPercent: number;
}

export interface Extremes {
  biggestGain: MonthlyDelta;
  biggestDrop: MonthlyDelta;
}

export interface NetWorthHistoryInsights {
  performanceSummary: PerformanceSummary;
  monthlyDeltas: MonthlyDelta[];
  growthStreak: GrowthStreak;
  trend: Trend;
  highs: Highs;
  volatility: Volatility;
  extremes: Extremes;
}

// Period and sampling
export type Period = '1M' | '3M' | '6M' | '12M' | 'ALL' | 'CUSTOM';
export type SamplingStrategy = 'daily' | 'weekly' | 'monthly' | 'adaptive';

// Badge
export interface Badge {
  title: string;
  description: string;
  icon: string;
}

// -----------------------------------------------------------------------------
// Account-level breakdown types and discriminated response
// -----------------------------------------------------------------------------

export interface AccountSnapshot {
  balance: number;
  category: string;
  currency: string;
  account_id: string;
  institution: string | null;
  account_name: string;
  account_type: 'asset' | 'liability';
  include_in_net_worth: boolean;
}

// Single data point type - accounts array is always present
export interface NetWorthDataPoint {
  date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  accounts: AccountSnapshot[]; // Always present, empty [] if no breakdown
}

// Common envelope
interface NetWorthHistoryBase {
  period: Period;
  startDate: string;
  endDate: string;
  currency: string;
  samplingStrategy: SamplingStrategy;
  maxDataPoints: number;
  actualDataPoints: number;
  calculatedAt: string;
  insights: NetWorthHistoryInsights;
  badges: Badge[];
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

// Simple, single response type
export interface NetWorthHistoryResponse {
  period: Period;
  startDate: string;
  endDate: string;
  currency: string;
  samplingStrategy: SamplingStrategy;
  maxDataPoints: number;
  actualDataPoints: number;
  calculatedAt: string;
  data: NetWorthDataPoint[]; // Always has accounts array
  insights: NetWorthHistoryInsights;
  badges: Badge[];
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

// -----------------------------------------------------------------------------
// App constants and supporting types
// -----------------------------------------------------------------------------

// Account creation payload
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
  asset: ['Cash', 'Checking', 'Savings', 'Investment', 'Retirement', 'Real Estate', 'Vehicle', 'Other Asset'],
  liability: ['Credit Card', 'Personal Loan', 'Mortgage', 'Auto Loan', 'Student Loan', 'Other Liability'],
};

export const CURRENCIES = [
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
];

export const THEMES = [
  'LIGHT',
  'DARK',
  'SYSTEM',
  'MODERN_FINANCE',
  'WARM_LUXURY',
  'NEO_BANKING',
  'DARK_MODE_FOCUSED',
  'EARTHY_CALM',
  'MINIMAL_MONOCHROME',
  'SUNSET_VIBES',
  'OCEAN_DEPTHS',
  'PLATINUM_ELEGANCE',
];

type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  asset: string;
  liability: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    elevated: string;
    navBarBackground?: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    onPrimary: string;
    onCard?: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus?: string;
  };
  interactive: {
    hover: string;
    pressed?: string;
    disabled?: string;
  };
  error: string;
  success: string;
  warning: string;
  info?: string;
  gradient?: any;
};

export type Theme = {
  name: string;
  colors: ColorPalette;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  shadows: Record<string, any>;
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    caption: number;
    body: number;
    subtitle: number;
    title: number;
    heading: number;
    display: number;
  };
  responsive: {
    small: {fontScale: number; spacingScale: number};
    medium: {fontScale: number; spacingScale: number};
    large: {fontScale: number; spacingScale: number};
  };
};
