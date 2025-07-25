# NetWorthApp Development Roadmap

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
-   [ ] **Implement Balance List UI:** In `app/account/[id].js`, fetch and display a list of all balance entries for the selected account using `getAccountBalances`.
-   [ ] **Enable Edit Navigation:** From the balance list, allow users to navigate to the `add-balance` screen in "edit" mode for a specific entry.
-   [ ] **Enable Deletion:** Add a way for users to delete a balance entry directly from the list, using the `deleteBalanceEntry` function.

#### 2. Profile Screen Polish
The `profile.js` screen exists, but it needs to be fully wired up.
-   [ ] **Verify Profile UI:** Ensure the UI at `app/(tabs)/profile.js` can display all the user's profile data from `profileService.ts`.
-   [ ] **Implement Edit Profile:** Create or verify the form that allows users to update their information (name, currency, etc.) and save it.

#### 3. Final UI/UX Polish
This is the dedicated phase to address the "look and feel" once all logic is complete.
-   [ ] **Review and Refine All Screens:** Go through every screen and improve layout, spacing, and visual consistency.
-   [ ] **Add Micro-interactions:** Implement subtle animations or transitions to enhance the user experience.
-   [ ] **Test on Multiple Devices:** Ensure the UI looks good on different screen sizes.

#### 4. Final Polish & Release Prep
-   [ ] **End-to-End Testing:** Thoroughly test all user flows, from sign-up to deleting an account.
-   [ ] **Asset Finalization:** Prepare and finalize all necessary assets for app store submission (icons, splash screens, etc.).
-   [ ] **Build & Deploy:** Create the final release build of the application.

## Post-MVP

This section lists features and enhancements to be considered after the successful launch of the MVP.

-   **Advanced Analytics:** Introduce more detailed financial analysis, such as spending by category, asset allocation charts, and performance tracking.
-   **UI Themes:** Implement the theming functionality (e.g., Light/Dark mode) as defined in the database schema.
-   **Multi-Currency Support:** Integrate the `exchange_rates` table to provide accurate net worth calculations for accounts in different currencies.
-   **Notifications & Reminders:** Add features for users to set reminders for bill payments or to update their balances.
-   **User Feedback Implementation:** Address user feedback and bug reports from the initial MVP release.