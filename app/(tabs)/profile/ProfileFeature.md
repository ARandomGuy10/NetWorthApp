# Profile Tab Feature Implementation Plan (Engagement-Driven UI)

This roadmap details how to implement the PocketrackrApp Profile screen to maximize user motivation, retention, and satisfaction. Every UI aspect should reinforce positive feedback, visualize progress, and make users want to interact and return.

---

## General Guidelines

- **All data**: Fetched/mutated via custom hooks (e.g. `useProfile`, `useUpdateProfile`) against the Supabase `profiles` table, authenticated with Clerk.
- **Component structure**: Shared UI in `@components/ui/`, profile-specific in `@components/profile/`.
- **Styling**: Use the app `useTheme` throughout; all color and typography must align.
- **UX focus**: Every interaction should feel rewarding and fun, with instant feedback, subtle animation, and clear progress.

---

## Phase 1: Motivating & Personalized Header

- [ ] **ProfileHeader (`components/profile/ProfileHeader.tsx`)**
  - **Visuals**:
    - **Avatar with Progress Ring**: Animated ring shows profile completion % (e.g. photo + name + email + preferences all set = 100%)
    - **Achievement Badge Overlay**: Small badge on avatar with current streak, or e.g. "Profile Star" for completion.
    - **Animated Background**: Subtle gradient or glow that shifts color as the user progresses or maintains streaks.
    - **Dynamic Greeting**: "Good morning, Surya! 🌞", "Welcome back! 💪" etc., with emoji and time/context sensitivity.
  - **Interactions**:
    - **Edit Profile Button**: Large, inviting, animated ("pulse"/gentle wiggle on idle). Tapping opens full edit modal/screen.
    - **Avatar Tap & Hold**: Reveals a quick actions/celebration modal ("See your badges", "Set a new goal", etc.)
    - **Name or Email Tap**: Reveals hidden stats like "Days since signup", "Last updated", or "Accounts managed".
    - **Animated Typing Reveal**: On first view after update, animate-in the user’s name/email for delight.

---

## Phase 2: Engaging Preferences Section

- [ ] **PreferencesSection (`components/profile/PreferencesSection.tsx`)**
  - **Section Progress Meter**: Visual ring or progress bar showing how many preferences completed (and what's missing).
  - **Currency Preference**:
    - Dropdown rendered with flag icons, trending and popular badges, and live rates (if feasible).
    - "Users in your country" or "Most chosen" tag added to popular selections.
    - Animated impact preview: "This will set EUR as your default for 12 accounts."
  - **Theme Picker**:
    - Live transition preview as user changes theme (simulate overall app look for a moment).
    - Theme names with "mood" labels: "Dark – Focus", "Light – Clarity".
    - Time-of-day or streak-based suggestions: "Morning? Try Light Theme! ☀️"
    - Streak badge: "You've stuck with Dark for 5 days!"
  - **Notifications Toggle**:
    - "Test notification" button (fires a playful local push).
    - "Users with notifications enabled log 3x more updates!" chat bubble/tooltip.
    - "Don't break your 12-day streak!"—toast if they try to disable with a streak going.

---

## Phase 3: Support & Data Section (with Community/Positive Framing)

- [ ] **SupportDataSection (`components/profile/SupportDataSection.tsx`)**
  - **Help & Support**:
    - Opens prefilled mail composer.
    - "95% of users got a response within 2 hours!" stat.
    - "Community Answers" expandable (show 2–3 recent resolved questions).
  - **Terms of Service & Privacy Policy**:
    - Latest update indicator, "Updated 4 days ago – what's new?" badge links to highlights.
    - Reading progress bar for dense docs; TL;DR summary up front.
  - **Export Data** (post-MVP):
    - Shows a lively export animation/progress bar.
    - "Keep your records—download your journey!" message.
    - Community use stat: "120 users exported their data this month!"

---

## Phase 4: Positive Feedback Loops for Account Actions

- [ ] **AccountActionsSection (`components/profile/AccountActionsSection.tsx`)**
  - **Sign Out**:
    - Friendly sign-off: "See you soon, Surya! Your 14-day streak is on fire! 🔥"
    - Summary card: "This session: +2 accounts, +5 updates. Keep up the progress!"
    - Haptic feedback and uplifting animation (confetti spark, gently waving hand, etc).
  - **Delete Account**:
    - Pre-deletion visualization: "You've logged 8 months of progress, 250 records, 3 badges earned."
    - "Download your data before you go!" enforce export if possible.
    - "Changed your mind? Restore within 30 days" – a gentle safety net, not a hard edge.
    - Sad but hopeful design, e.g., rainy day motif, but with an email for help in the modal.

---

## Phase 5: Micro-Interactions & Delight

- [ ] **Animations Everywhere**:
    - Ring progress bars fill dynamically.
    - Checkbox icons animate when preferences are completed.
    - Card tap feedback (lift, bounce, ripple).
    - Touch interactions "magnetize" nearby controls for fun.
    - Save/Success triggers checkmarks, confetti, and haptic success feedback.
- [ ] **Sound Design** (opt-in): Satisfying "chime" or "pop" on major achievements, streaks, and save actions.

---

## Phase 6: Progress & Achievement System

- [ ] **Progress Overview Card**: Shows:
    - Profile setup % (animated ring)
    - App usage streak (days in a row opened)
    - Key milestone icons ("Logged 100th entry", "1st data export", etc)
    - Next achievement to unlock: "Edit your avatar to level up!"
- [ ] **Badges Modal**: Button/link for users to review unlocked badges, with suggestions for next badges to pursue. Each badge animates when viewed/unlocked.
- [ ] **"Keep Going!" Nudges**:
    - If user hasn't completed profile, display motivational nudge: "3 steps to a complete profile"
    - Gentle reminders about missed streaks, and encouragement messages.

---

## Phase 7: Accessibility, Platform Adaptivity

- [ ] **Strong Accessibility Support**:
    - Better than AA contrast for all text and icons.
    - All interactive elements have ARIA/accessibility labels and hints.
    - Animations respect reduced motion OS preferences.
- [ ] **Platform Responsive**:
    - Keyboard nav on web, large tap areas and safe insets on mobile.
    - Smooth experience on both light and dark themes (auto-detect).
    - Lazy load heavy visuals, animations throttled on low-end devices.

---

## Example UI Copy & Messaging

- **Greeting:** "Welcome back, Surya! Your progress is inspiring 🌟"
- **Preferences Progress:** "You're just 1 step from 100% complete – customize your theme!"
- **Achievements:** "Badges unlocked: Profile Explorer, App Regular! Next: Notification Pro 👋"
- **Support:** "Most questions are answered in 1.5hrs – we're always here for you!"
- **Sign out:** "Take care! We'll keep your momentum safe. See you soon."
- **Delete:** "We hate to see you go. Export your journey, or email support if we can help!"

---

This plan will keep the Profile tab functional, beautiful, and most importantly, inspiring—helping users build healthy financial habits and celebrating every step they take.
