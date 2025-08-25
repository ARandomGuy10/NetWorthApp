// supabase/functions/revenuecat-webhook/types.ts

// A simplified version of the RevenueCat webhook event payload.
// For a full list of fields, see: https://www.revenuecat.com/docs/webhooks#event-object
export interface RevenueCatEvent {
  api_version: string;
  event: {
    id: string;
    type:
      | 'TEST'
      | 'INITIAL_PURCHASE'
      | 'RENEWAL'
      | 'CANCELLATION'
      | 'UNCANCELLATION'
      | 'BILLING_ISSUE'
      | 'PRODUCT_CHANGE'
      | 'EXPIRATION'
      | 'TRANSFER';
    app_user_id: string; // This is our Clerk user ID
    original_app_user_id: string;
    product_id: string;
    entitlement_ids: string[] | null;
    period_type: 'normal' | 'intro' | 'trial';
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    store: 'APP_STORE' | 'MAC_APP_STORE' | 'PLAY_STORE' | 'STRIPE' | 'PROMOTIONAL';
    // ... and many other fields
  };
}