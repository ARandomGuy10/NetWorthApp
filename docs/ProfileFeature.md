# Profile Tab Feature Implementation Plan

This document outlines the implementation plan for the Profile screen, tracking completed work and future enhancements.

---

## General Guidelines

- **Data Source**: All data is fetched and mutated via custom hooks (e.g., `useProfile`, `useUpdateProfile`).
- **Component Structure**: Profile-specific components are located in `@components/profile/`.
- **Styling**: All components use the `useTheme` hook for consistent styling.

---

## Phase 1: Profile Foundation (Completed)

- [x] **ProfileHeader (`components/profile/ProfileHeader.tsx`)**: Displays the screen title and a settings icon.
- [x] **UserProfileCard (`components/profile/UserProfileCard.tsx`)**:
  - Displays user's avatar (with initials fallback) and a profile completion ring.
  - Shows user's full name and email.
  - Is tappable and navigates to the edit profile screen.
- [x] **EditProfileScreen (`app/(tabs)/profile/edit.tsx`)**: A modal screen allowing users to update their name and upload/remove their avatar.
- [x] **PremiumBanner (`components/profile/PremiumBanner.tsx`)**: A static banner to promote future premium features.

---

## Phase 2: Preferences & Settings (In Progress)

- [x] **AppearancePreferencesSection (`components/profile/AppearancePreferencesSection.tsx`)**: A single card that groups all user preferences.
- [x] **Theme Selection**:
  - A `SettingRow` that opens the `ThemePicker` modal.
  - Allows users to select a theme with a live visual preview.
  - Saves the `theme` preference to the user's profile.
- [x] **Currency Selection**:
  - A `SettingRow` that opens the `CurrencyPicker` modal.
  - Allows users to select their preferred currency.
  - Saves the `preferred_currency` preference to the user's profile.
- [x] **Update Reminders**:
  - A `SettingRow` that opens the `RemindAfterDaysPicker` modal.
  - Allows users to set how often they are reminded to update balances.
  - Saves the `remind_after_days` preference to the user's profile.
- [x] **Haptic Feedback & Sound Toggles**:
  - [x] Two `SettingRow` components with switches.
  - [x] Allows users to enable or disable `haptic_feedback_enabled` and `sounds_enabled`.
- [ ] **Notifications**:
  - A `SettingRow` that currently shows a placeholder alert.
  - **Next Step**: Create a detailed notification settings screen.

---

## Phase 3: Account Management (Future)

- [x] **Sign Out**: A button to log the user out of the application.
- [x] **Delete Account**: A secure flow for users to permanently delete their account and all associated data.

---

## Phase 4: Community & Support (Completed)

- [x] **Rate the App**: A link to the App Store/Play Store for users to leave a rating.
- [x] **Share with Friends**: A button to open the native share sheet.
- [x] **Send Feedback**: A way for users to send feedback, suggestions, or bug reports. (Includes rate-limiting)
- [x] **Help & Support**: A section for FAQs and contacting support.

---

## Phase 5: Information & Legal (Completed)

- [x] **About the App**:
  - A screen that shows the app version, build number, and a link to a "What's New" changelog.
- [x] **Privacy Policy**:
  - A screen or link to display the app's privacy policy. This is a legal requirement.
- [x] **Terms of Use**:
  - A screen or link to display the app's terms of use. This is a legal requirement.

---

## Post-MVP / Future Ideas

- [ ] **Data Export**: Allow users to export their data.
- [ ] **Gamification**: Consider adding achievements or streaks to encourage engagement.
