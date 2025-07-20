import { supabase } from './supabase';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Custom hook to get Supabase client with Clerk JWT token
 */
export const useSupabaseClient = () => {
  const { getToken, userId } = useAuth();

  const getSupabaseClient = async () => {
    try {
      // Try to get Supabase template token first
      const token = await getToken({ template: 'supabase' });
      
      if (token) {
        supabase.realtime.setAuth(token);
        supabase.auth.session = () => ({ access_token: token });
      }
    } catch (error) {
      console.warn('Supabase JWT template not configured, using fallback auth');
      
      // Fallback: Use regular Clerk token or create a custom header
      try {
        const regularToken = await getToken();
        if (regularToken) {
          // Set custom header for RLS policies
          supabase.rest.headers['x-clerk-user-id'] = userId;
        }
      } catch (fallbackError) {
        console.error('Failed to get any token:', fallbackError);
      }
    }
    
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
  try {
    const token = await getToken({ template: 'supabase' });
    
    if (token) {
      supabase.realtime.setAuth(token);
      supabase.auth.session = () => ({ access_token: token });
    }
  } catch (error) {
    console.warn('Supabase JWT template not configured');
    // For now, we'll rely on RLS policies that check user_id directly
  }
  
  return supabase;
};