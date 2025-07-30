import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import 'react-native-url-polyfill/auto'; // Polyfill for URL API in React Native

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 1. Create the Supabase Context
const SupabaseContext = createContext(undefined);

// 2. Create the Supabase Provider Component
export const SupabaseProvider = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const authRef = useRef({ getToken, isLoaded, isSignedIn });

  // Update the ref whenever auth state changes
  useEffect(() => {
    console.log('SupabaseProvider: Auth state changed:', { isLoaded, isSignedIn });
    authRef.current = { getToken, isLoaded, isSignedIn };
  }, [isLoaded, isSignedIn]);

  const [supabase] = useState(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not defined. Check environment variables.');
      return null;
    }

    console.log('Supabase Client: Initializing new instance (guaranteed once per app lifecycle)...');

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options) => {
          const headers = new Headers(options?.headers);
          let tokenToUse = null;

          // Access latest auth state from ref
          const currentAuth = authRef.current;

          if (currentAuth.isLoaded && currentAuth.isSignedIn) {
            try {
              const clerkToken = await currentAuth.getToken({ skipCache: true });
              if (clerkToken && clerkToken.length > 0) {
                tokenToUse = clerkToken;
              } else {
                console.warn('Supabase Fetch: Clerk returned an empty or invalid token. Request will be unauthenticated.');
              }
            } catch (error) {
              console.error('Supabase Fetch: Error getting Clerk token:', error);
            }
          } else {
            console.log('Supabase Fetch: Clerk not loaded or user not signed in. Request will be unauthenticated.');
          }

          if (tokenToUse) {
            headers.set('Authorization', `Bearer ${tokenToUse}`);
          } else {
            headers.delete('Authorization');
          }

          return fetch(url, { ...options, headers });
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  });

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

// 3. Create a custom hook to use the Supabase client from the context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
