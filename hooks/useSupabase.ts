// hooks/useSupabase.ts
import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import type { Database } from '../lib/supabase';

export const useSupabase = () => {
  
  const { getToken, isLoaded, isSignedIn } = useAuth();
  
  return useMemo(() => {
    return createClient<Database>(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options) => {
            const headers = new Headers(options?.headers);
            
            if (isLoaded && isSignedIn) {
              const token = await getToken();
              if (token) headers.set('Authorization', `Bearer ${token}`);
            }
            //console.log(headers.get('Authorization'));
            return fetch(url, { ...options, headers });
          },
        },
        auth: { persistSession: false },
      }
    );
  }, [getToken, isLoaded, isSignedIn]);
};
