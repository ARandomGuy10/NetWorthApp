import { supabase } from './supabase';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Custom hook to get Supabase client with Clerk JWT token
 */
export const useSupabaseClient = () => {
  const { getToken } = useAuth();

  const getSupabaseClient = async () => {
    const token = await getToken({ template: 'supabase' });
    
    if (token) {
      supabase.realtime.setAuth(token);
      supabase.auth.session = () => ({ access_token: token });
    }
    
    return supabase;
  };

  return { getSupabaseClient };
};

/**
 * Get authenticated Supabase client for server-side operations
 */
export const getAuthenticatedSupabase = async (getToken) => {
  const token = await getToken({ template: 'supabase' });
  
  if (token) {
    supabase.realtime.setAuth(token);
    supabase.auth.session = () => ({ access_token: token });
  }
  
  return supabase;
};