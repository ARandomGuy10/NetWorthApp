# Premium Features Implementation Plan

This document outlines the strategy and step-by-step plan for integrating premium "Pro" features into the NetWorthTrackr application.

---

## Recommended Provider: RevenueCat

For a React Native/Expo application, **RevenueCat** is the highly recommended provider for managing in-app purchases and subscriptions.

### Key Advantages:

-   **Cross-Platform Abstraction**: Write purchase logic once. RevenueCat handles the native complexities of Apple's StoreKit and Google's Play Billing.
-   **Server-Side Receipt Validation**: Provides crucial security by validating purchases on its servers, preventing spoofing.
-   **Subscription State Management**: Acts as the source of truth for a user's subscription status, tracking renewals, cancellations, grace periods, etc.
-   **Seamless Backend Integration**: Can send webhooks to a Supabase Edge Function to keep our `profiles` table in sync with a user's premium status.
-   **Excellent Expo Support**: The RevenueCat SDK is fully compatible with Expo.

---

## Strategic Implementation Plan (High-Level)

### Step 0: Provider & App Store Setup

Before writing any code, the necessary services must be configured.

#### 1. RevenueCat Dashboard Setup

1.  **Create an Account**: Sign up for a free account at [revenuecat.com](https://www.revenuecat.com/).
2.  **Create a Project**: Create a new project for "PocketRackr".
2.  **Create a Project**: Create a new project for "NetWorthTrackr".
3.  **Configure Apps**:
    -   Inside your project, add a new app for **Apple App Store**. You will need your app's Bundle ID (`com.yourcompany.pocketrackr`).
    -   Inside your project, add a new app for **Apple App Store**. You will need your app's Bundle ID (`com.yourcompany.networthtrackr`).
    -   Add another app for **Google Play Store**. You will need your app's Package Name (`com.yourcompany.networthtrackr`).
4.  **Define Entitlements**:
    -   Go to "Entitlements" and create one called `pro_access`. This represents the user having access to all premium features.
5.  **Define Offerings & Packages**:
    -   Go to "Offerings". The default `current` offering is usually sufficient.
    -   Inside the `current` offering, add "Packages" that correspond to your subscription products (e.g., a `monthly` package and an `annual` package).
    -   You will link these packages to the actual products you create in the app stores in the next steps.

#### 2. Apple App Store Connect Setup

1.  **Agreements, Tax, and Banking**: Ensure all financial agreements are signed in App Store Connect.
2.  **Create In-App Purchases**:
    -   Go to your app's page -> "In-App Purchases" -> "Subscriptions".
    -   Create a "Subscription Group" (e.g., "Pro Access").
    -   Inside the group, create your subscription products (e.g., "Monthly Pro", "Annual Pro"). Each will have a unique **Product ID**.
3.  **Generate App-Specific Shared Secret**:
    -   Go to your app's page -> "App Information" -> "App-Specific Shared Secret". Generate a secret and copy it.
4.  **Link to RevenueCat**:
    -   In the RevenueCat dashboard (under your Apple app settings), paste the App-Specific Shared Secret.
    -   In the "Products" section of RevenueCat, add your products and link them to the `pro_access` entitlement using the Product IDs from App Store Connect.

#### 3. Google Play Console Setup

1.  **Create Subscriptions**:
    -   Go to your app's page -> "Monetize" -> "Subscriptions".
    -   Create your subscription products (e.g., "Monthly Pro", "Annual Pro"). Each will have a unique **Product ID**.
2.  **Set up Google Cloud Service Account & Permissions**:
    -   In the Google Play Console, go to "API access" and link to a Google Cloud Project.
    -   Create a new "Service Account" and grant it "Financial data" permissions.
3.  **Generate & Upload JSON Key**:
    -   In the Google Cloud Console, create and download a JSON key for the service account.
    -   In the RevenueCat dashboard (under your Google app settings), upload this JSON key file.
4.  **Link to RevenueCat**:
    -   In the "Products" section of RevenueCat, add your products and link them to the `pro_access` entitlement using the Product IDs from the Play Console.

---

### Step 1: Define the "Pro" Tier Features

Before implementation, we must clearly define which features are exclusive to paying users. Based on the existing `ROADMAP.md` and `PostMVPFeatures.md`, potential candidates include:

-   **Advanced Analytics**: Deeper insights, custom date ranges, and category-based spending reports.
-   **Smart Notifications**: Proactive alerts for significant net worth changes or streak protection.
-   **Data Management**: The ability to import and export account data via CSV.
-   **Exclusive Themes**: Offer a selection of premium themes (e.g., `PLATINUM_ELEGANCE`, `SUNSET_VIBES`).
-   **Unlimited Accounts**: Introduce a limit for free users (~10 accounts) and offer unlimited accounts for pro users.

---

### Step 2: Backend & Database Setup (Supabase)

Prepare the database to recognize and manage premium users.

1.  **Modify `profiles` Table**: Add the following columns to the `profiles` table schema:
    -   `subscription_tier` (e.g., an ENUM of `'free'`, `'pro'`)
    -   `subscription_provider` (e.g., `'apple'`, `'google'`, `'stripe'`)
    -   `subscription_expires_at` (a `TIMESTAMPTZ`)
    -   `revenuecat_customer_id` (a `TEXT` field to link the Supabase user to the RevenueCat customer)

2.  **Create a Webhook Endpoint**:
    -   **Technology**: Create a new Supabase Edge Function.
    -   **Purpose**: This function will listen for webhook events from RevenueCat.
    -   **Logic**: When an event like `INITIAL_PURCHASE` or `RENEWAL` is received, the function will securely parse it and update the corresponding user's row in the `profiles` table with their new `subscription_tier` and `subscription_expires_at` date. This is the most secure and reliable way to manage subscription status.

---

### Step 3: Frontend Implementation (React Native & RevenueCat SDK)

Build the user-facing components and logic for the premium experience.

1.  **Create a `useSubscription` Hook**:
    -   **Purpose**: This hook will be the primary way for the UI to check a user's subscription status.
    -   **Logic**: It will read the `subscription_tier` and `subscription_expires_at` fields from the user's profile data (which is kept up-to-date by the webhook).
    -   **Output**: It will return simple, easy-to-use booleans like `isProUser` and `isSubscriptionActive`.

2.  **Build the Paywall Screen**:
    -   The `PremiumBanner` on the Profile screen will navigate to a new, dedicated paywall screen.
    -   This screen will use the RevenueCat SDK to fetch the "Offerings" configured in the RevenueCat dashboard (e.g., "Monthly Plan," "Annual Plan").
    -   It will display these options clearly to the user.
    -   It must include a "Restore Purchases" button, which is a requirement for app stores.

3.  **Gate Features in the UI**:
    -   Use the `useSubscription` hook to conditionally render or disable features throughout the application.
    -   **Example (Themes)**: In `AppearancePreferencesSection.tsx`, check `isProUser` before rendering premium themes in the `ThemePicker`.
    -   **Example (Banner)**: The `PremiumBanner` itself will be hidden if `isProUser` is true.
    -   **Example (Data Export)**: The "Export Data" button in the `MoreActionsSheet` would be disabled with a "Pro" badge next to it for free users.
