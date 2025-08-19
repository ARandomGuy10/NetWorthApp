# Post-MVP Feature Ideas

This document contains features that were considered but deferred until after the initial MVP launch. This allows us to focus on core functionality first and revisit these enhancements later.

## Accounts Tab Enhancements

### Advanced Filtering (`FiltersSheet`)

**Objective**: Provide users with more granular control over how they view their accounts, beyond the simple text search and category chips.

**Implementation Details**:
-   **Component**: A new `components/accounts/FiltersSheet.tsx` would be created.
-   **Trigger**: A dedicated "filter" icon in the `AccountsHeader`.
-   **Functionality**:
    -   **Filter by Institution**: Allow users to select one or more institutions to see only the accounts associated with them.
    -   **Filter by Currency**: Allow users to filter accounts by their currency code (e.g., show only 'USD' accounts).
    -   **Filter by Custom Date Range**: For "Last Updated" status.
    -   **Clear Filters**: A button to reset all advanced filters.
-   **State Management**: The active advanced filters would need to be managed in the `AccountsScreen` state and applied to the `filteredAccounts` memoized calculation.
-   **UI/UX**: The sheet would be a modal bottom sheet, providing a non-intrusive way to access powerful filtering options without cluttering the main screen.

### More Actions Menu (`MoreActionsSheet`)

**Objective**: Provide users with bulk data management options like importing and exporting account data.

**Implementation Details**:
-   **Component**: Create `components/accounts/MoreActionsSheet.tsx`.
-   **Trigger**: The "⋯" (ellipsis) icon in the `AccountsHeader`.
-   **Functionality**:
    -   **Import Accounts**: Allow users to import accounts from a CSV file.
    -   **Export Accounts**: Allow users to export their accounts and balance history to a CSV file.

### Global Filter State

**Objective**: Persist the user's filter and sort preferences on the Accounts screen across app sessions or navigations for a more consistent experience.

**Implementation Details**:
-   **State Management**: Use a client-side state manager like Zustand to store the `activeFilter` and `sortOption` from `app/(tabs)/accounts/index.tsx`.
-   **Integration**: The `AccountsScreen` would initialize its state from the Zustand store and update the store whenever the user changes a filter or sort option.

### Lazy Load Archived/Hidden Section

**Objective**: Improve the initial load performance of the Accounts screen, especially for users with many archived accounts.

**Implementation Details**:
-   **Logic**: In `app/(tabs)/accounts/index.tsx`, modify the `prepareFlashListData` function to only include archived accounts in the `flashListData` array when the "Archived" section is explicitly expanded by the user.


## UI Component Enhancements

### Modern DatePicker (`DatePicker`)

**Objective**: Revisit the `DatePicker` and `CalendarView` components to implement a more modern and interactive UI, inspired by leading design systems.

**Implementation Details**:
-   **Inspiration**: Review implementations from libraries like shadcn/ui and 21st.dev for a better user experience.
-   **Component**: Update `components/ui/DatePicker.tsx` and its dependencies.
-   **Functionality**: Could include features like quick-select ranges, a more intuitive calendar view, and better mobile interaction.

## Smart Notifications

**Objective**: Move beyond simple reminders to a proactive and intelligent notification system that enhances user engagement and helps them stay on track with their financial goals.

**Implementation Details**:
-   **Component**: A new `app/(tabs)/profile/notifications.tsx` screen for detailed notification settings.
-   **Backend Logic**: Would likely require a Supabase Edge Function to run on a schedule or be triggered by certain events.
-   **Functionality**:
    -   **Smart Timing**: Analyze user activity to suggest or automatically send reminders at optimal times (e.g., when they usually check the app).
    -   **Streak Protection**: Send a special notification if a user is about to break a long streak of updating their balances.
    -   **Insightful Alerts**: Notify users about significant changes in their net worth, large transactions, or when an account balance reaches a certain threshold.
    -   **Customizable Channels**: Allow users to choose what they get notified about (e.g., only outdated balances, major net worth shifts, etc.).
    -   **Push Token Management**: Requires a new database table to store device-specific push notification tokens for each user.
