import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface representing a user profile in our application
 * Maps to the 'profiles' table in Supabase
 */
export interface UserProfile {
  id: string;                // Clerk user ID (primary key)
  email: string;             // User's email (unique)
  first_name?: string | null; // Optional first name
  last_name?: string | null;  // Optional last name
  preferred_currency: string; // User's preferred currency (default: 'USD')
  created_at: string;         // ISO timestamp when the profile was created
  updated_at: string;         // ISO timestamp when the profile was last updated
}

/**
 * Fetches a user's profile from Supabase
 * @param client - Authenticated Supabase client
 * @param userId - The Clerk user ID
 * @returns The user's profile if found, null otherwise
 */
export const getProfile = async (
  client: SupabaseClient,
  userId: string
): Promise<UserProfile | null> => {
  try {
    // Query the profiles table for the user's profile
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    // If no profile found, return null
    if (error?.code === 'PGRST116') return null;
    
    // If other error occurred, throw it
    if (error) throw error;
    
    // Return the profile data
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Saves a user's profile
 * @param client - Authenticated Supabase client
 * @param profile - The profile data to save
 * @returns The saved profile
 */
export const saveProfile = async (
  client: SupabaseClient,
  profile: Omit<UserProfile, 'created_at' | 'updated_at'>
): Promise<UserProfile> => {
  try {
    const { data, error } = await client
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

/**
 * Updates the user's preferred currency
 * @param client - Authenticated Supabase client
 * @param userId - The Clerk user ID
 * @param currency - The new currency code
 * @returns The updated profile
 */
export const updatePreferredCurrency = async (
  client: SupabaseClient,
  userId: string,
  currency: string
): Promise<UserProfile> => {
  try {
    const { data, error } = await client
      .from('profiles')
      .update({ 
        preferred_currency: currency,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error updating preferred currency:', error);
    throw error;
  }
};

/**
 * Creates an initial profile for a new user
 * @param userId - The Clerk user ID
 * @param email - The user's email
 * @param token - Optional JWT token from Clerk for authenticated requests
 * @returns The newly created profile
 */
/**
 * Creates an initial profile for a new user
 * @param client - Authenticated Supabase client
 * @param userId - The Clerk user ID
 * @param email - The user's email
 * @returns The newly created profile
 */
export const createInitialProfile = async (
  client: SupabaseClient,
  userId: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<UserProfile> => {
  try {
    const newProfile = {
      id: userId,
      email,
      preferred_currency: 'EUR', // Default currency
      first_name: firstName,
      last_name: lastName,
    };

    return await saveProfile(client, newProfile);
  } catch (error) {
    console.error('Error creating initial profile:', error);
    throw error;
  }
};

/**
 * Gets the current user's profile using their JWT token
 * @param client - Authenticated Supabase client
 * @returns The user's profile if found, null otherwise
 */
export const getCurrentUserProfile = async (
  client: SupabaseClient,
  userId: string
): Promise<UserProfile | null> => {
  try {

    if (!userId) {
      console.error('No userId provided from Clerk');
      return null;
    }
    
    // Fetch the user's profile
    return await getProfile(client,userId);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    throw error;
  }
};
