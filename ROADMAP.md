# NetWorthApp Development Roadmap

This document outlines the development plan for the NetWorthApp, focusing on the Minimum Viable Product (MVP) and future enhancements.

## MVP (Target: Launch in 1 Month)

The primary goal for the MVP is to deliver the core functionality of the app with a polished and intuitive user interface.

### 1. UI/UX Foundation
-   [ ] **Choose & Integrate UI Component Library:** Select and integrate a component library like React Native Paper or UI Kitten to ensure a consistent and high-quality look and feel across the app.
-   [ ] **Define Style Guide:** Solidify the basic style guide in `src/styles/colors.js` and expand it to include typography and spacing rules.
-   [ ] **Create Reusable Form Components:** Develop a set of generic, reusable components for forms (inputs, buttons, pickers) to streamline the development of CRUD features.

### 2. Profile Management (CRUD)
-   [ ] **Build Profile UI:** Implement the user interface for the Profile screen located at `app/(tabs)/profile.js`.
-   [ ] **Implement Edit Profile Form:** Create the form that allows users to edit their profile information (e.g., first name, last name, preferred currency).
-   [ ] **Integrate with `profileService.ts`:** Connect the UI to the existing `profileService.ts` to handle creating, reading, and updating the user's profile data in the Supabase database.
-   [ ] **Initial Profile Load:** Ensure that the user's profile data is fetched and loaded when the application starts.

### 3. Account Management (CRUD)
-   [ ] **Build Accounts List UI:** Develop the user interface for the Accounts list screen at `app/(tabs)/accounts.js`.
-   [ ] **Implement Add/Edit Account Forms:** Create the forms for `app/add-account.js` and the editing functionality for existing accounts.
-   [ ] **Integrate with `accountService.ts`:** Connect the UI components to `accountService.ts` to handle the creation, reading, updating, and deletion of accounts.
-   [ ] **Display User Accounts:** Implement the logic to fetch and display a list of the user's accounts on the `accounts.js` screen.

### 4. Balance Management (CRUD)
-   [ ] **Build Balance History UI:** Design and implement the UI to display the balance history for a selected account, likely within `app/account/[id].js`.
-   [ ] **Implement Add/Edit Balance Forms:** Create the forms for `app/add-balance.js` and for editing existing balance entries.
-   [ ] **Create `balanceService.ts`:** Develop a new service or extend an existing one to manage the logic for creating, reading, updating, and deleting balance entries.
-   [ ] **Integrate with UI:** Connect the balance management UI components to the new service.

### 5. Net Worth Graph
-   [ ] **Select & Install Charting Library:** Choose and install a suitable charting library for React Native, such as `react-native-gifted-charts` or `react-native-svg-charts`.
-   [ ] **Develop Data Aggregation Logic:** In `dashboardService.ts`, create a function to calculate the user's net worth over time by aggregating balances from all accounts.
-   [ ] **Build Home Screen UI:** Implement the Home screen at `app/(tabs)/home.js` to display the net worth graph as the central feature.
-   [ ] **Connect Graph to Service:** Wire the graph component to the data provided by `dashboardService.ts`.

### 6. Final Polish & Release Prep
-   [ ] **End-to-End Testing:** Thoroughly test all CRUD operations, the net worth graph visualization, and the complete user authentication flow with Clerk.
-   [ ] **Asset Finalization:** Prepare and finalize all necessary assets for the app store submission (icons, splash screens, etc.).
-   [...
] **Build & Deploy:** Create the final release build of the application and prepare for deployment to the app stores.

## Post-MVP

This section lists features and enhancements to be considered after the successful launch of the MVP.

-   **Advanced Analytics:** Introduce more detailed financial analysis, such as spending by category, asset allocation charts, and performance tracking.
-   **UI Themes:** Implement the theming functionality (e.g., Light/Dark mode) as defined in the database schema.
-   **Multi-Currency Support:** Integrate the `exchange_rates` table to provide accurate net worth calculations for accounts in different currencies.
-   **Notifications & Reminders:** Add features for users to set reminders for bill payments or to update their balances.
-   **User Feedback Implementation:** Address user feedback and bug reports from the initial MVP release.
