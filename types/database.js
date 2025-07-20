/**
 * Database type definitions for the application
 */

export const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
};

export const ACCOUNT_CATEGORIES = {
  // Asset categories
  CASH: 'cash',
  SAVINGS: 'savings',
  CHECKING: 'checking',
  INVESTMENT: 'investment',
  RETIREMENT: 'retirement',
  REAL_ESTATE: 'real_estate',
  VEHICLE: 'vehicle',
  OTHER_ASSET: 'other_asset',
  
  // Liability categories
  CREDIT_CARD: 'credit_card',
  LOAN: 'loan',
  MORTGAGE: 'mortgage',
  LINE_OF_CREDIT: 'line_of_credit',
  OTHER_LIABILITY: 'other_liability',
};

export const CURRENCIES = {
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
  INR: 'INR',
  JPY: 'JPY',
  CAD: 'CAD',
  AUD: 'AUD',
  CHF: 'CHF',
  CNY: 'CNY',
  SEK: 'SEK',
};

/**
 * Account type definition
 */
export const AccountSchema = {
  id: 'uuid',
  user_id: 'text',
  name: 'text',
  type: 'text', // 'asset' | 'liability'
  currency: 'text', // 3-letter currency code
  category: 'text',
  institution: 'text',
  created_at: 'timestamptz',
  updated_at: 'timestamptz',
};

/**
 * Balance entry type definition
 */
export const BalanceEntrySchema = {
  id: 'uuid',
  account_id: 'uuid',
  user_id: 'text',
  amount: 'decimal(15,2)',
  date: 'date',
  notes: 'text',
  created_at: 'timestamptz',
};

/**
 * User preferences type definition
 */
export const UserPreferencesSchema = {
  id: 'uuid',
  user_id: 'text',
  preferred_currency: 'text',
  timezone: 'text',
  date_format: 'text',
  created_at: 'timestamptz',
  updated_at: 'timestamptz',
};

/**
 * Exchange rates type definition
 */
export const ExchangeRateSchema = {
  id: 'uuid',
  from_currency: 'text',
  to_currency: 'text',
  rate: 'decimal(15,8)',
  updated_at: 'timestamptz',
};