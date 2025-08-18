# Accounts Tab Feature Implementation Plan

This document outlines the incremental plan for building the high-performance, user-friendly Accounts tab. Each step will be tracked with a checkbox.

## General Guidelines:
-   **Data Source**: Use the `@hooks/useAccountsWithBalances.ts` hook to fetch user account data.
-   **Component Reusability**: Split the UI into smaller, reusable components.
    -   Common UI components go into `@components/ui/`.
    -   Accounts-specific components will go into a new folder, e.g., `@components/accounts/`.
-   **No Dashboard Changes**: Do NOT modify `@app/(tabs)/dashboard.tsx` as it is stable.
-   **File Structure**: All new accounts tab pages and components will reside within `@app/(tabs)/accounts/` or `@components/accounts/`.
-   **Styling**: Utilize the theming system defined in `@src/styles/theme/themes.js` via the `useTheme` hook.

---

## Phase 1: Foundation & Performance Upgrade (FlashList & New Header)

-   [x] **1.1 Install FlashList**:
    -   Add `@shopify/flash-list` to `package.json` dependencies.
    -   Run `npm install`.
-   [x] **1.2 Replace `ScrollView` with `FlashList` in `app/(tabs)/accounts/index.tsx`**:
    -   Import `FlashList` from `@shopify/flash-list`.
    -   Adapt the existing account grouping and rendering logic to `FlashList`'s `data` and `renderItem` props.
    -   Ensure `FlashList` is correctly configured for performance (e.g., `estimatedItemSize`).
-   [x] **1.3 Create `HeaderBar` Component**:
    -   Create a new file: `components/accounts/AccountsHeader.tsx`.
    -   Implement the "Accounts" title, "+ Add" button, "Search/Filter" icon, and "⋯ menu" icon as specified.
    -   This component will handle navigation to `AddAccountScreen`, `FiltersSheet`, and `MoreActionsSheet`.
-   [x] **1.4 Integrate `AccountsHeader` into `app/(tabs)/accounts/index.tsx`**:
    -   Replace the existing header section with the new `AccountsHeader` component.
-   [x] **1.5 Integrate Add Account Navigation**: 
    -   Ensure the "+" button in `AccountsHeader` correctly navigates to `accounts/add-account`.

---

## Phase 2: Filtering & Status Shelf

-   [x] **2.1 Create `FilterChipsRow` Component**:
    -   Create `components/accounts/FilterChipsRow.tsx`.
    -   Implement the horizontal scrollable row with chips: "All", "Assets", "Liabilities", "Hidden", "30d+".
    -   This component will manage its own internal state for the selected chip initially.
-   [x] **2.2 Integrate `FilterChipsRow`**:
    -   Add `FilterChipsRow` below the `AccountsHeader` in `app/(tabs)/accounts/index.tsx`.
-   [x] **2.3 Implement Filtering Logic**:
    -   In `app/(tabs)/accounts/index.tsx`, add state to manage the active filter.
    -   Modify the data passed to `FlashList` to filter accounts based on the selected chip.
-   [x] **2.4 Create `StatusShelf` Component**:
    -   Create `components/accounts/StatusShelf.tsx`.
    -   Implement logic to detect accounts with last balance entry older than 30 days.
    -   Display the "X balances outdated (>30d) — View" message conditionally.
-   [x] **2.5 Integrate `StatusShelf`**:
    -   Add `StatusShelf` to `app/(tabs)/accounts/index.tsx`.
    -   Implement the "View" tap action to automatically apply the "30d+" filter.

---

## Phase 3: Enhanced Sections & Account Rows

-   [x] **3.1 Create `SectionHeader` Component**:
    -   [x] **3.1.1 Basic `SectionHeader` UI**:
        -   Create `components/accounts/AccountSectionHeader.tsx`.
        -   Implement collapsible header with chevron, section title, total balance, and account count.
    -   [x] **3.1.2 Implement "Add" Action**:
        -   The "Add" button in the `AccountSectionHeader` should navigate to the `add-account` screen, pre-filling the account type (Asset/Liability) based on the section.
    -   [x] **3.1.3 Implement "Sort" Action**:
        -   Create a `SortOptionsSheet` bottom modal that opens when "Sort ▾" is tapped.
        -   Provide sorting options: "Balance (High to Low)", "Balance (Low to High)", "Name (A-Z)", "Name (Z-A)", "Last Updated".
        -   Apply the selected sort order to the accounts within that section.
-   [x] **3.2 Create `AccountRow` Component**:
    -   Create `components/accounts/AccountRow.tsx`.
    -   Implement the specified layout: Circular account-type icon, Account name, Subtitle, Amount, "Updated X days ago", Pencil button, Include toggle, Chevron.
    -   Ensure `AccountRow` is memoized (`React.memo`).
-   [x] **3.3 Refactor `index.tsx` to use `AccountSectionHeader` and `AccountRow`**:
    -   Modify `app/(tabs)/accounts/index.tsx` to render accounts using these new components within `FlashList`.
-   [x] **3.4 Implement Swipe Gestures on `AccountRow`**:
    -   Add swipe-right for Quick Edit and swipe-left for Hide/Archive functionality. This will require `react-native-gesture-handler` and `react-native-reanimated`.

---

## Phase 4: Quick Edit & Advanced Actions

-   [x] **4.1 Create `QuickEditSheet` Component**:
    -   Create `components/accounts/QuickEditSheet.tsx` as a bottom modal.
    -   Implement numeric input, quick math strip, date picker, and optional note field.
    -   Implement "Save" and "Save & Next" buttons.
    -   Integrate this sheet with the pencil button and swipe-right gesture on `AccountRow`.
-   [x] **4.2 Implement In-Place Search**: The "Search" icon in the header now toggles a direct, in-place text input for a fast and modern search experience.

---

## Phase 5: Final Polish

-   [x] **5.1 Haptic Feedback**:
    -   Ensure haptic feedback is applied consistently for interactions like save, tap, etc., throughout the new components.

---

## Phase 6: UI Refinement

-   [x] **6.1 Review and Refine Component Styles**:
    -   Iterate on the styles of all new components (`AccountsHeader`, `FilterChipsRow`, `StatusShelf`, `AccountSectionHeader`, `AccountRow`, etc.) to ensure a polished and cohesive look and feel.
    -   Adjust spacing, colors, and typography as needed.
-   [x] **6.2 Add Animations and Transitions**:
    -   Implement smooth animations for component mounting, state changes, and interactions.
    -   Add micro-interactions to enhance the user experience.
-   [x] **6.3 Final Polish**:
    -   Perform a final review of the entire Accounts tab UI to identify and address any remaining visual inconsistencies or rough edges.
-   [x] **6.4 Improve DatePicker (Moved to Post-MVP)**:

---