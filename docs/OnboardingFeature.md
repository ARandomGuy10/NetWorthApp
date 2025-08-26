# Onboarding Feature Implementation Plan

This document outlines the step-by-step plan for building a **motivational, low-friction onboarding flow** for **NetWorthTrackr**. It includes both technical implementation steps and the copy/visual direction for designers.

---

## General Guidelines

- **Auth Provider**: Use Clerk (`@clerk/clerk-expo`) for authentication (Email/Password, Google, Apple).  
- **Navigation**: Place all pre-auth screens inside `app/(auth)/`.  
- **Styling**: Use `useTheme` for consistent UI. Keep visuals motivational, modern, and low-friction.  
- **Friction Reduction**:
  - Only require **First name + Email + Password**.
  - **Last name optional**.
  - Defer profile completion to `Profile` tab.  
- **Verification**: Require immediate email verification before accessing main app.  
- **Visuals**: Use real app screenshots (Dashboard, Accounts, Profile). For now, use **placeholder images** in carousel.  
- **Core Slogans**:
  - Primary: *“Track Today, Thrive Tomorrow.”*  
  - Secondary: *“Grow Wealth, Not Worries.”*  

---

## Phase 1: Welcome Carousel

- [ ] **1.1 Create `OnboardingCarousel` (`app/(auth)/welcome.tsx`)**:
  - Implement a multi-slide carousel with motivational messaging and app previews.
  - Use `react-native-reanimated-carousel` or equivalent.  
  - Slides:

    ### Slide 1: Welcome  
    - **Headline**: *“Track Today, Thrive Tomorrow.”*  
    - **Subtext**: *“Your net worth journey starts here.”*  
    - **Visual**: Placeholder image of **Dashboard (net worth graph)** → `onboarding_dashboard.png`.  

    ### Slide 2: Accounts in One Place  
    - **Headline**: *“All Your Finances, Simplified.”*  
    - **Subtext**: *“Assets, liabilities, and balances — all in one clean view.”*  
    - **Visual**: Placeholder image of **Accounts tab with grouped assets/liabilities** → `onboarding_accounts.png`.  

    ### Slide 3: Stay Motivated  
    - **Headline**: *“Grow Wealth, Not Worries.”*  
    - **Subtext**: *“Set reminders and stay consistent without the stress.”*  
    - **Visual**: Placeholder image of **Profile tab (reminders + completion ring)** → `onboarding_profile.png`.  

    ### Slide 4: See Your Growth  
    - **Headline**: *“Your Journey, Visualized.”*  
    - **Subtext**: *“Watch your wealth grow over time.”*  
    - **Visual**: Placeholder image of **Dashboard growth chart with milestones highlighted** → `onboarding_growth.png`.  
    - **CTA**: “Create Your Account” → Sign Up.  

- [ ] **1.2 CTA Buttons**:
  - Add **"Get Started" → Sign Up**.
  - Add **"Already have an account? Sign In" → Sign In**.

---

## Phase 2: Sign Up Flow

- [ ] **2.1 Create `SignUpScreen` (`app/(auth)/sign-up.tsx`)**:
  - Inputs: First Name (required), Last Name (optional), Email, Password.
  - Add social login buttons: *Continue with Google*, *Continue with Apple*.  
  - **Subtitle**: *“Start your journey towards financial clarity.”*  
  - **Friendly hint**: *“Only takes a minute — first name, email, password.”*  

- [ ] **2.2 Clerk Integration**:
  - Hook into Clerk’s `useSignUp` flow.
  - Store first/last name in Clerk user metadata.
  - Trigger **email verification step** immediately.  

- [ ] **2.3 Smooth Transitions**:
  - Haptic feedback + animations on submit.
  - Progress indicator while request processes.  

---

## Phase 3: Sign In Flow

- [ ] **3.1 Create `SignInScreen` (`app/(auth)/sign-in.tsx`)**:
  - Inputs: Email + Password.
  - Add social login buttons.  
  - Link: *Forgot password?* → Forgot Password.  
  - **Subtitle**: *“Welcome back, let’s keep building your wealth.”*  

- [ ] **3.2 Clerk Integration**:
  - Use Clerk’s `useSignIn` flow.
  - Redirect authenticated users to `(tabs)/dashboard`.  

---

## Phase 4: Email Verification

- [ ] **4.1 Create `VerifyEmailScreen` (`app/(auth)/verify-email.tsx`)**:
  - **Motivational copy**: *“One last step! Verify your email and start thriving today.”*  
  - **Support text**: *“Didn’t get it? Resend verification.”*  
  - UI: Verification code input + resend option.  
  - Success animation → navigate to dashboard.  

- [ ] **4.2 Clerk Integration**:
  - Use `signUp.prepareEmailAddressVerification` + `signUp.attemptEmailAddressVerification`.  

---

## Phase 5: Forgot / Reset Password Flow

- [ ] **5.1 Forgot Password (`app/(auth)/forgot-password.tsx`)**:
  - **Headline**: *“Forgot your password?”*  
  - **Subtext**: *“Don’t worry, we’ll get you back on track in seconds.”*  
  - Input: Email.  
  - Clerk `createPasswordReset` → send reset email.  

- [ ] **5.2 Reset Password (`app/(auth)/reset-password.tsx`)**:
  - **Headline**: *“Reset and Restart.”*  
  - **Subtext**: *“Create a new password and continue growing your wealth.”*  
  - Inputs: Verification code + New password.  
  - Success animation → Sign In.  

---

## Phase 6: Final Polish

- [ ] **6.1 Animations & Micro-Interactions**:
  - Smooth transitions between screens.
  - Success animations (confetti/pulse).  

- [ ] **6.2 Error Handling**:
  - Friendly error messages: *“That email is already in use.”*  
  - Retry for network issues.  

- [ ] **6.3 Haptic Feedback**:
  - Trigger on submit, success, error.  

- [ ] **6.4 Accessibility & Keyboard Handling**:
  - Forms scroll into view with keyboard.
  - Screen reader labels.  

---

## Post-MVP / Future Enhancements

- [ ] **Biometric Sign In**: Face ID / Touch ID with Clerk sessions.  
- [ ] **Magic Link Authentication**.  
- [ ] **Gamified Onboarding**: Profile completion progress bar.  
- [ ] **Deep Link Support**: Direct handling of reset/verification links.  
