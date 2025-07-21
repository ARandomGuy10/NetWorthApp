import { useEffect, useState } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let cachedToken: string | null = null;
let cachedClient: SupabaseClient | null = null;

export const useSupabase = (): SupabaseClient | null => {
  const { getToken, isLoaded } = useAuth();
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      if (!isLoaded) {
        console.log('Clerk auth not loaded yet');
        return;
      }
      try {
        const token = await getToken();

        if (!token) {
          console.warn('No token received from Clerk');
          setClient(null);
          return;
        }

        if (cachedClient && token === cachedToken) {
          setClient(cachedClient);
          return;
        }

        cachedToken = token;
        cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });

        setClient(cachedClient);
      } catch (error) {
        console.error('Error in useSupabase setupClient:', error);
        setClient(null);
      }
    };

    setupClient();
  }, [getToken, isLoaded]);

  return client;
};
