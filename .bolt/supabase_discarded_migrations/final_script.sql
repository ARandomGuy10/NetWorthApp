-- =============================================
-- NetWorthApp Database Schema - Final Version
-- amount > 0 enforced in balance_entries for clarity
-- =============================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Enables gen_random_uuid()

-- 1. Custom Types
CREATE TYPE public.account_type AS ENUM ('asset', 'liability');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF');

-- 2. Auth Helper Function – Extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  preferred_currency public.currency_code NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  type public.account_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  institution TEXT DEFAULT '',
  include_in_net_worth BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Balance Entries Table (amount > 0)
CREATE TABLE IF NOT EXISTS public.balance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- 6. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency public.currency_code NOT NULL,
  to_currency public.currency_code NOT NULL,
  rate DECIMAL(15,8) NOT NULL CHECK (rate > 0),
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  CHECK (from_currency <> to_currency),
  UNIQUE (from_currency, to_currency, date)
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = get_user_id());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE TO authenticated
  USING (id = get_user_id());

-- Accounts
CREATE POLICY "Users can read their own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = get_user_id());

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE TO authenticated
  USING (user_id = get_user_id());

-- Balance Entries
CREATE POLICY "Users can read own balance entries"
  ON public.balance_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can insert own balance entries"
  ON public.balance_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can update own balance entries"
  ON public.balance_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can delete own balance entries"
  ON public.balance_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

-- Exchange Rates
CREATE POLICY "Authenticated users can read exchange rates"
  ON public.exchange_rates FOR SELECT TO authenticated
  USING (true);

-- 9. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers to update updated_at on update
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_balance_entries_updated_at
  BEFORE UPDATE ON public.balance_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- =============================================
-- NetWorthApp Database Schema - Final Version
-- amount > 0 enforced in balance_entries for clarity
-- =============================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Enables gen_random_uuid()

-- 1. Custom Types
CREATE TYPE public.account_type AS ENUM ('asset', 'liability');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF');

-- 2. Auth Helper Function – Extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  preferred_currency public.currency_code NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  type public.account_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  institution TEXT DEFAULT '',
  include_in_net_worth BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Balance Entries Table (amount > 0)
CREATE TABLE IF NOT EXISTS public.balance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- 6. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency public.currency_code NOT NULL,
  to_currency public.currency_code NOT NULL,
  rate DECIMAL(15,8) NOT NULL CHECK (rate > 0),
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  CHECK (from_currency <> to_currency),
  UNIQUE (from_currency, to_currency, date)
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = get_user_id());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE TO authenticated
  USING (id = get_user_id());

-- Accounts
CREATE POLICY "Users can read their own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = get_user_id());

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE TO authenticated
  USING (user_id = get_user_id());

-- Balance Entries
CREATE POLICY "Users can read own balance entries"
  ON public.balance_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can insert own balance entries"
  ON public.balance_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can update own balance entries"
  ON public.balance_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can delete own balance entries"
  ON public.balance_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

-- Exchange Rates
CREATE POLICY "Authenticated users can read exchange rates"
  ON public.exchange_rates FOR SELECT TO authenticated
  USING (true);

-- 9. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers to update updated_at on update
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_balance_entries_updated_at
  BEFORE UPDATE ON public.balance_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- =============================================
-- NetWorthApp Database Schema - Final Version
-- amount > 0 enforced in balance_entries for clarity
-- =============================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Enables gen_random_uuid()

-- 1. Custom Types
CREATE TYPE public.account_type AS ENUM ('asset', 'liability');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF');

-- 2. Auth Helper Function – Extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  preferred_currency public.currency_code NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  type public.account_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  institution TEXT DEFAULT '',
  include_in_net_worth BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Balance Entries Table (amount > 0)
CREATE TABLE IF NOT EXISTS public.balance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- 6. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency public.currency_code NOT NULL,
  to_currency public.currency_code NOT NULL,
  rate DECIMAL(15,8) NOT NULL CHECK (rate > 0),
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  CHECK (from_currency <> to_currency),
  UNIQUE (from_currency, to_currency, date)
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = get_user_id());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE TO authenticated
  USING (id = get_user_id());

-- Accounts
CREATE POLICY "Users can read their own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = get_user_id());

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE TO authenticated
  USING (user_id = get_user_id());

-- Balance Entries
CREATE POLICY "Users can read own balance entries"
  ON public.balance_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can insert own balance entries"
  ON public.balance_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can update own balance entries"
  ON public.balance_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can delete own balance entries"
  ON public.balance_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

-- Exchange Rates
CREATE POLICY "Authenticated users can read exchange rates"
  ON public.exchange_rates FOR SELECT TO authenticated
  USING (true);

-- 9. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers to update updated_at on update
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_balance_entries_updated_at
  BEFORE UPDATE ON public.balance_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- =============================================
-- NetWorthApp Database Schema - Final Version
-- amount > 0 enforced in balance_entries for clarity
-- =============================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- Enables gen_random_uuid()

-- 1. Custom Types
CREATE TYPE public.account_type AS ENUM ('asset', 'liability');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF');

-- 2. Auth Helper Function – Extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE sql STABLE;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  preferred_currency public.currency_code NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  type public.account_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'EUR',
  category TEXT NOT NULL,
  institution TEXT DEFAULT '',
  include_in_net_worth BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Balance Entries Table (amount > 0)
CREATE TABLE IF NOT EXISTS public.balance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- 6. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency public.currency_code NOT NULL,
  to_currency public.currency_code NOT NULL,
  rate DECIMAL(15,8) NOT NULL CHECK (rate > 0),
  date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  CHECK (from_currency <> to_currency),
  UNIQUE (from_currency, to_currency, date)
);

-- 7. Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = get_user_id());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = get_user_id());

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE TO authenticated
  USING (id = get_user_id());

-- Accounts
CREATE POLICY "Users can read their own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = get_user_id());

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING (user_id = get_user_id());

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE TO authenticated
  USING (user_id = get_user_id());

-- Balance Entries
CREATE POLICY "Users can read own balance entries"
  ON public.balance_entries FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can insert own balance entries"
  ON public.balance_entries FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can update own balance entries"
  ON public.balance_entries FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

CREATE POLICY "Users can delete own balance entries"
  ON public.balance_entries FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.user_id = get_user_id()
    )
  );

-- Exchange Rates
CREATE POLICY "Authenticated users can read exchange rates"
  ON public.exchange_rates FOR SELECT TO authenticated
  USING (true);

-- 9. Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers to update updated_at on update
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_balance_entries_updated_at
  BEFORE UPDATE ON public.balance_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
