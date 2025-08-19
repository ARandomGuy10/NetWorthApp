# Profile Tab Feature Implementation Plan (Engagement-Driven UI)

This comprehensive roadmap details how to implement the PocketrackrApp Profile screen to maximize user motivation, retention, and satisfaction. Every UI aspect should reinforce positive feedback, visualize progress, and make users want to interact and return.

---

## General Guidelines

- **All data**: Fetched/mutated via custom hooks (e.g. `useProfile`, `useUpdateProfile`) against the Supabase `profiles` table, authenticated with Clerk.
- **Component structure**: Shared UI in `@components/ui/`, profile-specific in `@components/profile/`.
- **File Structure**: All Profile Tab files live in `@app/(tabs)/profile/` or `@components/profile/`.
- **Styling**: Use the app `useTheme` throughout; all color and typography must align.
- **UX focus**: Every interaction should feel rewarding and fun, with instant feedback, subtle animation, and clear progress.

---

## Phase 1: Foundation & Motivating Header

- [ ] **1.1 ProfileHeader (`components/profile/ProfileHeader.tsx`)**
  - **Visual Layout**:
    - Clean header with "Settings" title centered
    - Optional settings gear icon (top-right) for quick access to advanced settings
    - Minimal, focused design that doesn't compete with content below
  
- [ ] **1.2 UserProfileCard (`components/profile/UserProfileCard.tsx`)**
  - **Visuals**:
    - **Avatar with Progress Ring**: Animated ring shows profile completion % (e.g. photo + name + email + preferences all set = 100%)
    - **Achievement Badge Overlay**: Small badge on avatar with current streak, or e.g. "Profile Star" for completion.
    - **Animated Background**: Subtle gradient or glow that shifts color as the user progresses or maintains streaks.
    - **Dynamic Greeting**: "Good morning, Surya! 🌞", "Welcome back! 💪" etc., with emoji and time/context sensitivity.
    - Large avatar (72px) with fallback initials from first/last name
    - Full name as primary text (18px, semibold)
    - Email or location as secondary text (14px, muted color)
    - Right-aligned chevron indicating the card is tappable
  
  - **Interactive Elements**:
    - **Edit Profile Button**: Large, inviting, animated ("pulse"/gentle wiggle on idle). Tapping opens full edit modal/screen.
    - **Avatar Tap & Hold**: Reveals a quick actions/celebration modal ("See your badges", "Set a new goal", etc.)
    - **Name or Email Tap**: Reveals hidden stats like "Days since signup", "Last updated", or "Accounts managed".
    - **Animated Typing Reveal**: On first view after update, animate-in the user's name/email for delight.
    - Entire card tappable to open detailed profile editor
    - Subtle press animation with haptic feedback
    - Progress ring around avatar if profile incomplete (hidden when 100%)

- [ ] **1.3 PremiumBanner (`components/profile/PremiumBanner.tsx`)**
  - **Visual Design**:
    - Eye-catching gradient card (purple/blue/teal gradient)
    - Diamond/gem icon with subtle animation or sparkles
    - "Upgrade Your Plan" headline (bold, white text)
    - Engaging subtitle: "Unlock exclusive insights and advanced analytics for your journey"
    - Full-width card with rounded corners, generous padding
  
  - **Functionality**:
    - Tappable to navigate to premium upgrade flow
    - Dismissible with preference storage
    - A/B test messaging variations
    - Analytics tracking for conversion optimization

---

## Phase 2: Engaging Appearance & Preferences Section

- [x] **2.1 AppearancePreferencesSection (`components/profile/AppearancePreferencesSection.tsx`)**
  - **Section Header**: "Appearance & Preferences" with consistent styling (16px, semibold, accent color)
  - **Card Container**: Single grouped card with internal dividers
  - **Section Progress Meter**: Visual ring or progress bar showing how many preferences completed (and what's missing).
  
  - **Theme Row**:
    - [x] Paint palette or theme icon (color-adaptive)
    - [x] "Theme" label
    - [x] Current theme as secondary text ("System", "Dark", "Light")
    - [x] Right chevron to open theme selection modal
    - [x] **Live Preview**: Real-time theme preview with smooth transitions
    - **Mood Indicators**: Theme options show mood/energy level ("Energizing Dark", "Calm Light")
    - **Time-based Suggestions**: "Switch to light theme? It's morning! ☀️"
    - **Theme Streak**: Track consecutive days using selected theme
  
  - **Country/Region Row**:
    - Globe icon with flag overlay based on user's country
    - "Country" or "Region" label  
    - Current country name as secondary text
    - Used for currency suggestions and locale settings
    - Opens country picker modal with search and flag icons
  
  - **Currency Preference Row**:
    - Currency symbol icon with flag overlay
    - "Preferred Currency" label
    - Current currency code as secondary text (EUR, USD, etc.)
    - **Flag Animations**: Country flags with smooth entry animations
    - **Exchange Rate Teaser**: Show live rate info on selection: "1 EUR = $1.08 USD ↗️"
    - **Impact Preview**: "This will update 12 accounts" with preview animations
    - **Popular Choice Badge**: Show "Most popular" or "Trending" badges for common currencies
  
  - **Notifications Row**:
    - Bell icon (adaptive fill based on state)
    - "Notifications" label
    - "Reminders and alerts" as secondary text
    - Right chevron to detailed notification settings
    - **Smart Timing**: Show optimal notification times based on usage patterns
    - **Benefit Callouts**: "Stay on track! Users with notifications update 3x more often"
    - **Preview Mode**: "Test notification" button with sample notification
    - **Streak Protection**: "Don't break your 15-day streak!" messaging
  
  - **Remind to Update Every Row**:
    - Calendar/clock icon
    - "Remind to Update Every" label
    - Value: `${remind_after_days} days` (e.g., "30 days")
    - Subtitle: "How often you'd like to be reminded to update balances"
    - Chevron or number picker/modal (e.g., 7, 15, 30, 60, custom numeric input)
    - Updates `remind_after_days` field in `profiles` table on change
  
  - **Haptic Feedback Row**:
    - Vibration/haptic icon
    - "Haptic Feedback" label
    - "On"/"Off" secondary text
    - Toggle switch on right side
    - Immediate haptic test when toggled

---

## Phase 3: Feature Toggles Section (Only Include if Features Exist)

- [ ] **3.1 FeatureTogglesSection (`components/profile/FeatureTogglesSection.tsx`)**
  - **Section Header**: "Features" or "Advanced Features"
  - **Card Container**: Grouped settings with consistent toggle design
  
  - **Budget Feature Row** (Only if feature exists):
    - Dollar/budget icon
    - "Budget Feature" label
    - "Enabled"/"Disabled" secondary text
    - Toggle switch with confirmation dialog if disabling
    - Beta badge if feature is in testing
  
  - **Experimental File Upload Row** (Only if feature exists):
    - Upload/document icon
    - "Experimental File Upload" label
    - "Enabled"/"Disabled" secondary text
    - Toggle switch with beta warning
    - Feature explanation tooltip

---

## Phase 4: Engaging Sharing & Feedback Section

- [ ] **4.1 SharingFeedbackSection (`components/profile/SharingFeedbackSection.tsx`)**
  - **Section Header**: "Sharing & Feedback" with consistent styling
  - **Card Container**: Social and community features
  - **Community Feel**:
    - **Help Usage Stats**: "Join 2,847 users who found help this week"
    - **Response Time Promise**: "We typically respond within 2 hours ⚡"
    - **Success Stories**: Brief testimonials or help success metrics
  
  - **Refer a Friend Row**:
    - Share/people icon
    - "Refer a Friend" label
    - "Share PocketrackrApp with others" secondary text
    - Right chevron to referral flow
    - Generates unique referral code/link
    - Tracks referral success and rewards
    - **Referral System Integration**: Unique referral codes per user, tracking and analytics, reward system
  
  - **Send Feedback Row**:
    - Feedback/message icon
    - "Send Feedback" label
    - "Tell us how to improve the app" secondary text
    - Opens feedback form with categories: Bug Report, Feature Request, General
    - **Smart Help**: AI-powered suggestions before opening email
    - **Quick Actions**: "Common issues" expandable section
  
  - **Rate App Row**:
    - Star icon
    - "Rate PocketrackrApp" label
    - "Share your experience" secondary text
    - Directs to App Store/Play Store rating
    - Smart timing (only show after positive usage patterns)

---

## Phase 5: Account & Security Section

- [ ] **5.1 AccountSecuritySection (`components/profile/AccountSecuritySection.tsx`)**
  - **Section Header**: "Account & Security"
  
  - **Account Details Row**:
    - User profile icon
    - "Account Details" label
    - "Manage profile and preferences" secondary text
    - Opens detailed account management screen
    - **Edit Profile Integration**: Fields for avatar (photo picker/upload), first name, last name, email
    - **Real-time Validation**: Fields show checkmarks as they're completed correctly
    - **Progress Bar**: Visual progress showing completion percentage at top
    - **Before/After Preview**: Split view showing current vs. new profile info
    - **Celebration Animation**: Confetti or success animation on save completion
  
  - **Password & Security Row**:
    - Lock/key icon
    - "Password & Security" label
    - Security status indicator ("Strong", "Needs Review")
    - Change password, 2FA, login history
    - **Multi-step Confirmation**: For sensitive changes
  
  - **Biometric Authentication Row**:
    - Fingerprint/Face ID icon (platform-specific)
    - "Biometric Login" label
    - Current state as secondary text
    - Toggle switch with permission handling
  
  - **Login Sessions Row** (Future):
    - Devices icon
    - "Active Sessions" label
    - Device count as secondary text
    - Manage logged-in devices

---

## Phase 6: Support & Data Section (with Community/Positive Framing)

- [ ] **6.1 SupportDataSection (`components/profile/SupportDataSection.tsx`)**
  - **Section Header**: "Support & Data"
  
  - **Help & Support Row**:
    - Question mark or help icon
    - "Help & Support" label
    - Average response time as secondary text
    - Opens support options (FAQ, contact, chat)
    - **Community Features**: "95% of users got a response within 2 hours!" stat
    - **Community Answers**: Show 2–3 recent resolved questions
    - **Response Time Indicator**: Live average response time display
  
  - **Export Data Row**:
    - Download icon
    - "Export Data" label
    - Last export date as secondary text
    - GDPR-compliant data export functionality
    - **Lively Animation**: Shows export animation/progress bar
    - **Journey Messaging**: "Keep your records—download your journey!" message
    - **Community Stats**: "120 users exported their data this month!"
  
  - **Privacy Settings Row**:
    - Shield/privacy icon
    - "Privacy Settings" label
    - "Manage data and privacy" secondary text
    - Granular privacy controls
  
  - **Terms & Privacy Row**:
    - Document icon
    - "Terms & Privacy Policy" label
    - Last updated date as secondary text
    - **Update Indicators**: "Updated 4 days ago – what's new?" badge links to highlights
    - **Reading Progress**: Progress bar for dense docs; TL;DR summary up front
    - Highlights recent changes

---

## Phase 7: Positive Feedback Account Actions Section

- [ ] **7.1 AccountActionsSection (`components/profile/AccountActionsSection.tsx`)**
  - **Clear Visual Separation**: Extra spacing from other sections
  - **Positive Reinforcement Before Leaving**:
    - **Journey Summary**: "You've tracked $X across Y accounts for Z days"
    - **Achievement Showcase**: Display earned badges/milestones before sign out
    - **Data Export Teaser**: "Download your financial journey" with progress visualization
  
  - **Sign Out Row**:
    - Exit/logout icon (subtle red tint)
    - "Sign Out" label
    - Separate card with red accent
    - **Gentle Retention**: "See you tomorrow! Your 30-day streak is almost here 🔥"
    - **Quick Return**: "Quick sign-in" preview for easy return
    - **Progress Preservation**: "Your data will be waiting" reassurance
    - **Last Session Summary**: Show what was accomplished in current session
    - **Uplifting Animation**: Confetti spark, gently waving hand, etc
  
  - **Delete Account Row**:
    - Trash icon (red)
    - "Delete Account" label
    - Most prominent red styling
    - **Data Value Showcase**: Visual representation of data that would be lost
    - **Alternative Options**: Suggest account pause instead of deletion
    - **Recovery Window**: "Changed your mind? Restore within 30 days"
    - **Export Reminder**: Mandatory data export before deletion option
    - **Hopeful Design**: Sad but hopeful design with support contact

---

## Phase 8: Micro-Interactions & Positive Feedback

- [ ] **8.1 Engaging Micro-Animations**
  - **Loading States**:
    - Skeleton animations with pulsing gradients
    - Morphing icons during state changes
    - Progress indicators with personality (bouncing, elastic effects)
  
  - **Success Feedback**:
    - Satisfying save animations (checkmark morphing, color transitions)
    - Celebration particles for major achievements
    - Haptic patterns matched to visual feedback intensity
    - Sound design for positive reinforcement (optional, user-controlled)
  
  - **Interaction Responses**:
    - Button press animations with spring physics
    - Card lift effects on hover/press
    - Ripple effects for tap confirmation
    - Magnetic effects for drag-and-drop interactions
    - Ring progress bars fill dynamically
    - Checkbox icons animate when preferences are completed
    - Touch interactions "magnetize" nearby controls for fun

- [ ] **8.2 Progressive Enhancement**
  - **Smart Suggestions**:
    - Contextual tips based on usage patterns
    - Seasonal theme recommendations
    - Currency suggestions based on location/travel
    - Notification timing optimization suggestions
  
  - **Achievement System**:
    - "Profile Perfectionist" badge for 100% completion
    - "Early Adopter" badges for trying new features
    - "Loyal User" streaks and milestones
    - "Helper" badges for providing good feedback/support

---

## Phase 9: Progress & Achievement System

- [ ] **9.1 Progress Overview Card**: Shows:
    - Profile setup % (animated ring)
    - App usage streak (days in a row opened)
    - Key milestone icons ("Logged 100th entry", "1st data export", etc)
    - Next achievement to unlock: "Edit your avatar to level up!"

- [ ] **9.2 Badges Modal**: Button/link for users to review unlocked badges, with suggestions for next badges to pursue. Each badge animates when viewed/unlocked.

- [ ] **9.3 "Keep Going!" Nudges**:
    - If user hasn't completed profile, display motivational nudge: "3 steps to a complete profile"
    - Gentle reminders about missed streaks, and encouragement messages.

---

## Phase 10: Accessibility & Platform Adaptivity

- [ ] **10.1 Universal Design Principles**
  - **Visual Accessibility**:
    - High contrast mode support with engaging gradients
    - Reduced motion preferences respected while maintaining appeal
    - Text scaling that preserves visual hierarchy
    - Color-blind friendly indicators and feedback
  
  - **Motor Accessibility**:
    - Large touch targets (minimum 44px) with generous spacing
    - Swipe gestures with alternative tap options
    - Voice control compatibility for all actions
    - One-handed operation optimization
  
  - **Cognitive Accessibility**:
    - Clear information hierarchy with visual breathing room
    - Consistent interaction patterns throughout
    - Error messages with helpful recovery suggestions
    - Progress indicators that reduce cognitive load

- [ ] **10.2 Cross-Platform Optimization**
  - **Platform-Specific Enhancements**:
    - iOS: Native haptic patterns, SF Symbols integration
    - Android: Material Design 3 principles, adaptive colors
    - Web: Keyboard navigation, hover states, responsive breakpoints
  
  - **Performance Optimization**:
    - Lazy loading for heavy animations
    - Memory-efficient particle systems
    - Battery-conscious animation timing
    - Graceful degradation on low-end devices

---

## Visual Design System & Component Architecture

### Card Component Pattern

Base card with consistent styling.

```tsx
<SettingsCard>
  <SettingsRow
    icon={<Icon />}
    label="Setting Name"
    value="Current Value"
    onPress={() => navigate()}
    rightElement={<Chevron />}
  />
</SettingsCard>
```

### Section Pattern

```tsx
<SettingsSection title="Section Name">
  <SettingsCard>
    {/* Multiple rows */}
  </SettingsCard>
</SettingsSection>
```

### Typography & Spacing System

- **Section headers**: 16px, semibold, theme-colored
- **Row labels**: 16px, medium weight
- **Subtitles**: 14px, secondary color
- **Padding**: Consistent 16px horizontal padding
- **Row Padding**: 12px vertical padding per row
- **Section Spacing**: 24px spacing between sections

### Icon System

- **Size**: 20px consistent icon size
- **Colors**: Theme-adaptive colors (accent color for active states)
- **Libraries**: SF Symbols on iOS, Material Icons on Android
- **Custom**: Custom icons for brand-specific features

### Data Model Integration

**Profile Table Fields Used:**
- `id`, `first_name`, `last_name`, `email` (user info card)
- `avatar_url` (profile picture)
- `preferred_currency` (currency selection)
- `theme` (theme toggle)
- `country` (region settings)
- `notifications_enabled` (notification settings)
- `haptic_feedback_enabled` (haptic preferences)
- `remind_after_days` (reminder frequency)
- `created_at` (account age, premium eligibility)
- `last_sign_in_at` (activity tracking, streaks)

**Additional engagement tables to consider:**
- `user_achievements` (badge system)
- `user_streaks` (engagement tracking)
- `preference_history` (trend analysis)
- `engagement_metrics` (session quality scoring)

### Example UI Copy & Messaging

- **Greeting**: "Welcome back, Surya! Your progress is inspiring 🌟"
- **Preferences Progress**: "You're just 1 step from 100% complete – customize your theme!"
- **Achievements**: "Badges unlocked: Profile Explorer, App Regular! Next: Notification Pro 👋"
- **Support**: "Most questions are answered in 1.5hrs – we're always here for you!"
- **Sign out**: "Take care! We'll keep your momentum safe. See you soon."
- **Delete**: "We hate to see you go. Export your journey, or email support if we can help!"

### Integration Patterns for Engagement

- **Positive Reinforcement Loop**: Every user action provides immediate, positive feedback
- **Progressive Disclosure**: Advanced features unlock as users demonstrate engagement
- **Social Proof Integration**: Anonymous community insights to encourage participation
- **Habit Formation Support**: Streak tracking, gentle reminders, and celebration of consistency
- **Personalization Engine**: AI-driven suggestions that improve with usage
- **Gamification Elements**: Achievement systems, progress visualization, and milestone celebrations

### Key Engagement User Stories

- **"I feel accomplished"**: User sees immediate progress feedback for every profile action
- **"I'm part of something bigger"**: Community insights make user feel connected
- **"The app knows me"**: Personalized suggestions feel relevant and helpful
- **"I don't want to lose my progress"**: Streaks and achievements create positive pressure to return
- **"This is actually fun"**: Micro-interactions and animations make mundane tasks enjoyable
- **"I feel in control"**: Clear options and immediate feedback create sense of agency
- **"I'm getting better at this"**: Progressive enhancement helps user feel they're leveling up

### Development Conventions

- **Typed Props**: All row and section components are strictly typed.
- **Data Fetching**: All data-fetching/mutations go through TanStack Query hooks (`useQuery`, `useMutation`); do not call Supabase directly from components.
- **Global State**: Use Zustand only for ephemeral UI/control state.
- **Navigation**: Use Expo Router for modal/detail screens.
- **Accessibility**: Test with screen readers & device-sized text, non-color cues for all statuses.
- **Dismissal Logic**: Banners and suggestions respect user preference and are stored for UX persistency.
