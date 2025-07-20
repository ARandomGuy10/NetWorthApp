/*
  # Create accounts and preferences schema

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (text, from JWT)
      - `name` (text, account name)
      - `type` (text, asset or liability)
      - `currency` (varchar(3), currency code, default EUR)
      - `category` (text, account category)
      - `institution` (text, bank/institution name)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `balance_entries`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key to accounts)
      - `user_id` (text, from JWT)
      - `amount` (decimal, balance amount)
      - `date` (date, balance date)
      - `notes` (text, optional notes)
      - `created_at` (timestamptz)
    
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (text, from JWT)
      - `preferred_currency` (varchar(3), default EUR)
      - `timezone` (varchar(50), default UTC)
      - `date_format` (varchar(20), default YYYY-MM-DD)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `exchange_rates`
      - `id` (uuid, primary key)
      - `from_currency` (varchar(3))
      - `to_currency` (varchar(3))
      - `rate` (decimal, exchange rate)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add performance indexes for common queries

  4. Initial Data
    - Insert common exchange rates with EUR as base currency
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('asset', 'liability')),
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  category text NOT NULL,
  institution text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create balance_entries table
CREATE TABLE IF NOT EXISTS balance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
  amount decimal(15,2) NOT NULL,
  date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'::text),
  preferred_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,8) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts table
CREATE POLICY "Users can read own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

-- RLS Policies for balance_entries table
CREATE POLICY "Users can read own balance entries"
  ON balance_entries
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can insert own balance entries"
  ON balance_entries
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can update own balance entries"
  ON balance_entries
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can delete own balance entries"
  ON balance_entries
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

-- RLS Policies for user_preferences table
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub'::text) = user_id);

-- RLS Policies for exchange_rates table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read exchange rates"
  ON exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_balance_entries_user_id ON balance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_entries_account_id ON balance_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_entries_date ON balance_entries(date);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial exchange rates (EUR as base currency)
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR to other currencies
('EUR', 'EUR', 1.00000000),
('EUR', 'USD', 1.08500000),
('EUR', 'GBP', 0.86200000),
('EUR', 'INR', 90.25000000),
('EUR', 'JPY', 161.50000000),
('EUR', 'CAD', 1.47200000),
('EUR', 'AUD', 1.63800000),
('EUR', 'CHF', 0.93500000),
('EUR', 'CNY', 7.85000000),
('EUR', 'SEK', 11.42000000),

-- Other currencies to EUR (inverse rates)
('USD', 'EUR', 0.92166000),
('GBP', 'EUR', 1.16009000),
('INR', 'EUR', 0.01108000),
('JPY', 'EUR', 0.00619000),
('CAD', 'EUR', 0.67935000),
('AUD', 'EUR', 0.61050000),
('CHF', 'EUR', 1.06952000),
('CNY', 'EUR', 0.12739000),
('SEK', 'EUR', 0.08756000),

-- Common direct pairs (not through EUR)
('USD', 'INR', 83.25000000),
('GBP', 'USD', 1.25900000),
('USD', 'JPY', 148.85000000),
('USD', 'CAD', 1.35600000),
('USD', 'AUD', 1.50900000)

ON CONFLICT (from_currency, to_currency) DO NOTHING;