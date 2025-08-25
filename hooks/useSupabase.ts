import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import type { Database } from '../lib/supabase';

export const useSupabase = () => {
  const authResult = useAuth();
  
  // Defensive check for corrupted auth object
  const { getToken, isLoaded, isSignedIn } = authResult && typeof authResult === 'object' 
    ? authResult 
    : { getToken: null, isLoaded: false, isSignedIn: false };

  return useMemo(() => {
    return createClient<Database>(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options) => {
            const headers = new Headers(options?.headers);
            if (isLoaded && isSignedIn && getToken) {
              try {
                const token = await getToken();
                if (token) headers.set('Authorization', `Bearer ${token}`);
              } catch (error) {
                console.warn('useSupabase: Error getting token:', error);
              }
            }
            return fetch(url, { ...options, headers });
          },
        },
        auth: { persistSession: false },
      }
    );
  }, [getToken, isLoaded, isSignedIn]);
};
