import { useRef } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';
import 'react-native-url-polyfill/auto'; // Polyfill for URL API in React Native

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Custom hook to provide a Supabase client instance.
 * This hook guarantees a single SupabaseClient instance throughout the app's lifecycle,
 * and integrates with Clerk for authentication by dynamically injecting
 * the Clerk session token into each Supabase request.
 *
 * @returns {SupabaseClient | null} The Supabase client instance, or null if configuration is missing.
 */
export const useSupabase = (): SupabaseClient | null => {
  // Log every time the useSupabase hook function is called
  console.log('useSupabase Hook: Function called');

  // Get authentication state and functions from Clerk's useAuth hook.
  // These values will be captured by the closure of the custom fetch function.
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // useRef to hold the SupabaseClient instance.
  // This ensures the client is created only once and persists across renders.
  const supabaseClientRef = useRef<SupabaseClient | null>(null);

  // Initialize the Supabase client only if it hasn't been created yet.
  // This block runs only once per application lifecycle.
  if (!supabaseClientRef.current) {
    console.log('Supabase Client: Initializing new instance (guaranteed once per app lifecycle)...');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is not defined. Check environment variables.');
      // Do not set supabaseClientRef.current if config is missing, it will remain null.
      return null;
    }

    supabaseClientRef.current = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        // Custom fetch function to inject the Authorization header dynamically.
        // This function forms a closure over `getToken`, `isLoaded`, `isSignedIn`
        // ensuring it always accesses their latest values from the current render cycle
        // when a request is made.
        fetch: async (url, options) => {
          const headers = new Headers(options?.headers);
          let tokenToUse = null;

          // Log when the token is being fetched for a request
          console.log('Supabase Fetch: Attempting to get Clerk token for request to:', url);

          // Use the latest `isLoaded` and `isSignedIn` from the current render context.
          if (isLoaded && isSignedIn) {
            try {
              // Get the latest token from Clerk. `getToken` is also from the closure.
              // `skipCache: true` ensures Clerk provides the freshest token.
              const clerkToken = await getToken({ skipCache: true });
              if (clerkToken && clerkToken.length > 0) {
                tokenToUse = clerkToken;
                console.log('Supabase Fetch: Clerk token obtained. Setting Authorization header.');
              } else {
                console.warn('Supabase Fetch: Clerk returned an empty or invalid token. Request will be unauthenticated.');
              }
            } catch (error) {
              console.error('Supabase Fetch: Error getting Clerk token:', error);
            }
          } else {
            console.log('Supabase Fetch: Clerk not loaded or user not signed in. Request will be unauthenticated.');
          }

          // Set or delete the Authorization header based on token availability.
          if (tokenToUse) {
            headers.set('Authorization', `Bearer ${tokenToUse}`);
          } else {
            headers.delete('Authorization');
          }

          // Proceed with the actual fetch request.
          return fetch(url, { ...options, headers });
        },
      },
      auth: {
        // Clerk handles session persistence and token refreshing.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  // Return the stable Supabase client instance.
  return supabaseClientRef.current;
};
