# NetWorthTrackr Development Roadmap

This document outlines the development plan for the NetWorthApp, focusing on the Minimum Viable Product (MVP) and future enhancements.

## Development Strategy
As discussed, our strategy is to focus on implementing and verifying core functionality first, as the backend and service logic are your strengths. A dedicated UI polish phase will follow, ensuring the application is both robust and visually appealing without letting UI challenges block progress.

## MVP (Target: Launch in 1 Month)

The primary goal for the MVP is to deliver a fully functional and stable application that covers the core user journey.

### Completed MVP Tasks
-   [x] **Profile Management (CRUD):** Service layer is complete.
-   [x] **Account Management (CRUD):** Users can create, read, update, and delete accounts.
-   [x] **Balance Management (CRUD):** Users can add, update, and delete balance entries. The "edit" functionality is now implemented.
-   [x] **Service Layer Refactoring:** Balance management logic has been correctly separated into its own service (`balanceService.ts`).
-   [x] **Net Worth Graph (Initial):** The home screen displays a net worth summary and a chart of historical data.
-   [x] **Core UI Scaffolding:** The main screens (`home`, `accounts`, `add-account`, `add-balance`, `profile`) have been created.

### Remaining MVP Tasks

#### 1. Account Details & Balance History
This is the most critical remaining feature. Users need to see the list of balances for an account and be able to manage them.
-   [X] **Implement Balance List UI:** In `app/account/[id].js`, fetch and display a list of all balance entries for the selected account using `getAccountBalances`.
-   [X] **Enable Edit Navigation:** From the balance list, allow users to navigate to the `add-balance` screen in "edit" mode for a specific entry.
-   [X] **Enable Deletion:** Add a way for users to delete a balance entry directly from the list, using the `deleteBalanceEntry` function.

#### 1. Profile Screen (Completed)
-   **Objective**: Build a comprehensive and polished profile and settings experience.
-   **Completed Tasks**:
    -   [x] Implemented user profile card with avatar and completion ring.
    -   [x] Created a full preferences section for theme, currency, and update reminders.
    -   [x] Added a Community & Support section with an in-app feedback form, rate/share options, and a help page.
    -   [x] Built out Information & Legal pages (About, Privacy, Terms).
    -   [x] Implemented secure sign-out and account deletion flows with custom confirmation modals.

#### 2. Pre-Login UI/UX Polish
-   **Objective**: Ensure the first impression of the app is professional and consistent with the post-login experience.
-   **Tasks**:
    -   [ ] **Review `sign-in.js` and `sign-up.js`**: Refine the layout, spacing, and typography to align with the app's overall design system.
    -   [ ] **Theming**: Ensure all colors and components on these pages are derived from the `useTheme` hook for consistency.
    -   [ ] **Improve User Flow**: Add links to the Privacy Policy and Terms of Use on the sign-up page.

#### 3. Premium Features (MVP Foundation)
-   **Objective**: Lay the foundational groundwork for premium features, enabling the app to accept subscriptions at launch.
-   **Tasks**:
    -   [ ] **Database Schema Update**: Add `subscription_tier`, `subscription_provider`, `subscription_expires_at`, and `revenuecat_customer_id` to the `profiles` table.
    -   [ ] **Backend Webhook**: Create the Supabase Edge Function to handle subscription updates from RevenueCat.
    -   [ ] **Frontend Hook**: Implement the `useSubscription` hook to check a user's pro status from their profile.
    -   [ ] **Paywall Screen**: Build the initial paywall screen that displays offerings from RevenueCat and includes a "Restore Purchases" button.
    -   [ ] **Feature Gating**: Gate at least one feature (e.g., premium themes) behind the `isProUser` flag from the `useSubscription` hook.

## Post-MVP

This section lists features and enhancements to be considered after the successful launch of the MVP.

### Core Feature Enhancements
-   **Advanced Analytics & Filtering**: Introduce more detailed financial analysis, such as spending by category, asset allocation charts, and performance tracking. Implement advanced filtering on the accounts screen.
-   **Data Management (Import/Export)**: Allow users to import and export their account and balance data via CSV.
-   **Net Worth Sharing**: Allow users to generate and share a stylized image of their dashboard chart to encourage community engagement and organic growth.

### User Experience & Security
-   **App Security (PIN & Biometrics)**: Add an extra layer of security with a PIN and/or biometric app lock.
-   **Smart Notifications & Reminders**: Enhance the notification system with proactive alerts for significant net worth changes, streak protection, and customizable alert channels.
-   **UI/UX Enhancements**: Revisit components like the DatePicker for a more modern feel and add subtle micro-interactions and animations throughout the app.
-   **UI Themes**: Fully implement the theming functionality (e.g., Light/Dark mode) as defined in the database schema.

### Community & Feedback
-   **User Feedback Implementation**: Address user feedback and bug reports from the initial MVP release.

### Final Release Preparations
-   **End-to-End Testing**: Thoroughly test all user flows on both iOS and Android.
-   **Asset Finalization**: Prepare and finalize all necessary assets for app store submission (icons, splash screens, screenshots, etc.).
-   **Build & Deploy**: Create the final release build of the application for both the Apple App Store and Google Play Store.
