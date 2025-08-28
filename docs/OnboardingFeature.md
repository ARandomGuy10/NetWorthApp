# Onboarding Feature Implementation Plan

This document outlines the step-by-step plan for building a **motivational, low-friction onboarding flow** for **NetWorthTrackr**. It includes both technical implementation steps and the copy/visual direction for designers.

---

## General Guidelines

- **Auth Provider**: Use Clerk (`@clerk/clerk-expo`) for authentication (Email/Password, Google, Apple).  
- **Navigation**: Place all pre-auth screens inside `app/(auth)/`.  
- **Styling**: Use `useTheme` for consistent UI. Keep visuals motivational, modern, and low-friction.  
- **Friction Reduction**:
  - Only require **Email + Password** at sign-up.
  - Defer all name collection to the `Profile` tab to minimize initial friction.
- **Verification**: Require immediate email verification before accessing main app.  
- **Visuals**: Use real app screenshots (Dashboard, Accounts, Profile). For now, use **placeholder images** in carousel.  
- **Core Slogans**:
  - Primary: *“Track Today, Thrive Tomorrow.”*  
  - Secondary: *“Grow Wealth, Not Worries.”*  

---
## Phase 1: Splash & Welcome Screen

- [X] **1.1 Create `welcome.tsx`**:
  - Implement an initial animated splash screen that fades into the main welcome screen.
  - The welcome screen displays the app logo, name, and tagline: *"Track, grow, and visualize your wealth effortlessly."*
  - Showcase key app features using animated `FeatureCard` components.
  - Features highlighted:
    - *Track Today, Thrive Tomorrow*
    - *All Finances, Simplified*
    - *Grow Wealth, Stress-Free*

- [X] **1.2 CTA Buttons**:
  - Add **"Get Started" → Sign Up**.
  - Add **"Already have an account? Sign In" → Sign In**.

---

## Phase 2: Sign Up Flow

- [X] **2.1 Create `SignUpScreen` (`app/(auth)/sign-up.tsx`)**:
  - Inputs: Email, Password, Confirm Password.
  - Add social login buttons: *Continue with Google*, *Continue with Apple*.  
  - **Subtitle**: *“Sign up to access your account”*  
  - **Friendly hint**: *“Just your email and a secure password to get started.”*  

- [X] **2.2 Clerk Integration**:
  - Hook into Clerk’s `useSignUp` flow.
  - Trigger **email verification step** immediately.  

- [X] **2.3 Smooth Transitions**:
  - Haptic feedback + animations on submit.

---

## Phase 3: Sign In Flow

- [X] **3.1 Create `SignInScreen` (`app/(auth)/sign-in.tsx`)**:
  - Inputs: Email + Password.
  - Add social login buttons.  
  - Link: *Forgot password?* → Forgot Password.  
  - **Subtitle**: *“Welcome back, let’s keep building your wealth.”*  

- [X] **3.2 Clerk Integration**:
  - Use Clerk’s `useSignIn` flow.
  - Redirect authenticated users to `(tabs)/dashboard`.  

  [X] **3.3 Session Persistence (Default Behavior)**:
  - Clerk's `setActive` function securely saves the session token to the device, ensuring users remain logged in between sessions. This is the standard, expected behavior for mobile apps, so a "Remember Me" checkbox has been removed to simplify the UI.
---

## Phase 4: Email Verification

- [X] **4.1 Create `VerifyEmailScreen` - Inside SignUp Screen (`app/(auth)/sign-up.tsx`)**:
  - **Motivational copy**: *“One last step! Verify your email and start thriving today.”*  
  - **Support text**: *“Didn’t get it? Resend verification.”*  
  - UI: Verification code input + resend option.  
  - Success animation → navigate to dashboard.  

- [X] **4.2 Clerk Integration**:
  - Use `signUp.prepareEmailAddressVerification` + `signUp.attemptEmailAddressVerification`.  

---

## Phase 5: Forgot / Reset Password Flow

- [X] **5.1 Forgot Password (`app/(auth)/forgot-password.tsx`)**:
  - **Step 1: Request Code**
    - **Headline**: *“Forgot your password?”*
    - **Subtext**: *“Don’t worry, we’ll get you back on track in seconds.”*
  - **Step 2: Reset Password**
    - **Headline**: *“Reset and Restart.”*
    - **Subtext**: *“Create a new password and continue growing your wealth.”*
  - **Flow**: A single, two-step component for a seamless user experience, consistent with the sign-up flow.

---
## Phase 6: Final Polish

- [X] **6.1 Animations & Micro-Interactions**:
  - Smooth transitions between screens.
  - Success animations (confetti/pulse).  

- [X] **6.2 Error Handling**:
  - Friendly error messages: *“That email is already in use.”*  
  - Retry for network issues.  

- [X] **6.3 Haptic Feedback**:
  - Trigger on submit, success, error.  

- [X] **6.4 Accessibility & Keyboard Handling**:
  - Forms scroll into view with keyboard.
  - Screen reader labels.  

---

## Post-MVP / Future Enhancements

- [ ] **Biometric Sign In**: Face ID / Touch ID with Clerk sessions.  
- [ ] **Magic Link Authentication**.  
- [ ] **Gamified Onboarding**: Profile completion progress bar.  
- [ ] **Deep Link Support**: Direct handling of reset/verification links.  
- [ ] **Remember Last Login**: Pre-fill the email address or highlight the last-used social provider on the sign-in screen after a user logs out.
