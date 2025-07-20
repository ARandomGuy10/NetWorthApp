-- =============================================
-- NetWorthApp Database Setup with Clerk Integration
-- Simplified Schema Focusing on Balance Entry Tracking
-- =============================================

-- 0. Create Custom Types
CREATE TYPE public.account_type AS ENUM ('asset', 'liability');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF');

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clerk_user_id text UNIQUE,
  full_name text,
  email text,
  preferred_currency public.currency_code NOT NULL DEFAULT 'EUR',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  is_active boolean GENERATED ALWAYS AS (deleted_at IS NULL) STORED
);

-- 3. Accounts Table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type public.account_type NOT NULL,
  currency public.currency_code NOT NULL DEFAULT 'EUR',
  category text NOT NULL,
  institution text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  is_active boolean GENERATED ALWAYS AS (deleted_at IS NULL) STORED,
  CONSTRAINT valid_account_name CHECK (length(trim(name)) > 0)
);

-- 4. Balance Entries Table
CREATE TABLE IF NOT EXISTS public.balance_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount decimal(15,2) NOT NULL CHECK (amount != 0),
  date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE (account_id, date)
);

-- 5. Temporary Exchange Rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency public.currency_code NOT NULL,
  to_currency public.currency_code NOT NULL,
  rate decimal(15,8) NOT NULL CHECK (rate > 0),
  date date NOT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at timestamptz DEFAULT now(),
  UNIQUE (from_currency, to_currency, date)
);

-- 6. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 7. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_profile_id ON public.accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_balance_entries_account_id ON public.balance_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_entries_date ON public.balance_entries(date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_exchange_rate 
  ON public.exchange_rates(from_currency, to_currency, date);

-- 8. RLS Policies
-- Profiles Policies
CREATE POLICY "Users can manage own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Accounts Policies
CREATE POLICY "Users can read own accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own accounts"
  ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own accounts"
  ON public.accounts
  FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Balance Entries Policies
CREATE POLICY "Users can read own balance entries"
  ON public.balance_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own balance entries"
  ON public.balance_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own balance entries"
  ON public.balance_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts 
      WHERE accounts.id = balance_entries.account_id 
      AND accounts.profile_id = auth.uid()
    )
  );

-- Exchange Rates Policies
CREATE POLICY "Authenticated users can read exchange rates"
  ON public.exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);

-- 9. Functions and Triggers
-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced user creation function with conflict handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with conflict handling
  INSERT INTO public.profiles (
    id, 
    clerk_user_id, 
    full_name, 
    email,
    last_sign_in_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'clerk_user_id',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'firstName' || ' ' || NEW.raw_user_meta_data->>'lastName',
      NEW.email,
      'User'
    ),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in_at = now(),
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    clerk_user_id = COALESCE(EXCLUDED.clerk_user_id, profiles.clerk_user_id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE NOTICE 'Profile creation/update failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure profile exists (for application use)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  user_id uuid,
  user_email text DEFAULT NULL,
  user_name text DEFAULT NULL,
  clerk_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  profile_id uuid;
BEGIN
  -- Try to get existing profile
  SELECT id INTO profile_id
  FROM public.profiles
  WHERE id = user_id;
  
  -- If profile doesn't exist, create it
  IF profile_id IS NULL THEN
    INSERT INTO public.profiles (
      id,
      clerk_user_id,
      full_name,
      email,
      last_sign_in_at
    )
    VALUES (
      user_id,
      clerk_id,
      COALESCE(user_name, user_email, 'User'),
      user_email,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      last_sign_in_at = now()
    RETURNING id INTO profile_id;
  ELSE
    -- Update last sign in time
    UPDATE public.profiles
    SET last_sign_in_at = now()
    WHERE id = user_id;
    
    profile_id := user_id;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE TRIGGER create_profile_for_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.accounts TO authenticated;
GRANT ALL ON public.balance_entries TO authenticated;
GRANT SELECT ON public.exchange_rates TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;