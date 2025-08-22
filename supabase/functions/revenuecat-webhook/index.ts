// supabase/functions/revenuecat-webhook/index.ts

import { createClient } from '@supabase/supabase-js';
import { RevenueCatEvent } from './types.ts';

// Environment variables - These must be set in your Supabase project's secrets
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

// Utility to create a Supabase admin client
const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Main webhook handler
Deno.serve(async (req) => {
  // 1. Verify the request is from RevenueCat
  const signature = req.headers.get('Authorization');
  if (!REVENUECAT_WEBHOOK_SECRET || signature !== `Bearer ${REVENUECAT_WEBHOOK_SECRET}`) {
    console.error('Unauthorized webhook attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload: RevenueCatEvent = await req.json();
    const { event } = payload;
    const userId = event.app_user_id;

    if (!userId) {
      console.warn('Webhook received without a user ID');
      return new Response('User ID is missing', { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Determine the new subscription status based on the active entitlement
    const isProActive = event.entitlement_ids?.includes('pro_access') ?? false;

    const subscription_tier = isProActive ? 'pro' : 'free';
    const subscription_expires_at = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : null;

    // 3. Prepare the data to update in the profiles table
    const profileUpdate = {
      subscription_tier,
      subscription_expires_at,
      revenuecat_customer_id: event.original_app_user_id,
      subscription_provider: event.store.toLowerCase(),
    };

    // 4. Update the user's profile in Supabase
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (error) {
      console.error(`Failed to update profile for user ${userId}:`, error);
      throw new Error(`Supabase update failed: ${error.message}`);
    }

    console.log(`Successfully processed '${event.type}' for user ${userId}. New tier: ${subscription_tier}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing RevenueCat webhook:', error.message);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});