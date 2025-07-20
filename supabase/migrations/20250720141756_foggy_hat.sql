@@ .. @@
 CREATE TABLE IF NOT EXISTS accounts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  user_id text NOT NULL DEFAULT (jwt() ->> 'sub'),
+  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
   name text NOT NULL,
   type text NOT NULL CHECK (type IN ('asset', 'liability')),
   currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
@@ .. @@
 CREATE TABLE IF NOT EXISTS balance_entries (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
-  user_id text NOT NULL DEFAULT (jwt() ->> 'sub'),
+  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
   amount decimal(15,2) NOT NULL,
   date date NOT NULL,
@@ .. @@
 CREATE TABLE IF NOT EXISTS user_preferences (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
-  user_id text NOT NULL DEFAULT (jwt() ->> 'sub'),
+  user_id text NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
   preferred_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
   timezone VARCHAR(50) DEFAULT 'UTC',
@@ .. @@
 CREATE POLICY "Users can read own accounts"
   ON accounts
   FOR SELECT
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can insert own accounts"
   ON accounts
   FOR INSERT
   TO authenticated
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can update own accounts"
   ON accounts
   FOR UPDATE
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id)
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id)
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can delete own accounts"
   ON accounts
   FOR DELETE
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id);
 
 -- Policies for balance_entries table
 CREATE POLICY "Users can read own balance entries"
   ON balance_entries
   FOR SELECT
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can insert own balance entries"
   ON balance_entries
   FOR INSERT
   TO authenticated
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can update own balance entries"
   ON balance_entries
   FOR UPDATE
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id)
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id)
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can delete own balance entries"
   ON balance_entries
   FOR DELETE
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id);
 
 -- Policies for user_preferences table
 CREATE POLICY "Users can read own preferences"
   ON user_preferences
   FOR SELECT
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can insert own preferences"
   ON user_preferences
   FOR INSERT
   TO authenticated
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
 
 CREATE POLICY "Users can update own preferences"
   ON user_preferences
   FOR UPDATE
   TO authenticated
-  USING ((jwt() ->> 'sub') = user_id)
-  WITH CHECK ((jwt() ->> 'sub') = user_id);
+  USING ((auth.jwt() ->> 'sub') = user_id)
+  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);