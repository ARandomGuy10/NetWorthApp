import React from 'react';
import {Stack} from 'expo-router';

import {ClerkProvider, ClerkLoaded} from '@clerk/clerk-expo';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClientProvider} from '@tanstack/react-query';
import {StatusBar} from 'expo-status-bar';
import {tokenCache} from '@clerk/clerk-expo/token-cache';

import {ToastProvider} from '../hooks/providers/ToastProvider';
import {queryClient} from '../lib/queryClient';
import {ThemeProvider as NavigationThemeProvider, DarkTheme} from '@react-navigation/native';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (!sentryDsn) {
  // In a real app, you might want to log this error without crashing.
  console.error('Missing Sentry DSN. Sentry will not be initialized.');
}

Sentry.init({
  dsn: sentryDsn,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: onboardingTheme.colors.background.primary,
    card: onboardingTheme.colors.background.primary,
  },
};

export default Sentry.wrap(function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey} telemetry={false}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ClerkLoaded>
              <StatusBar style="auto" />
              <NavigationThemeProvider value={navigationTheme}>
                <Stack screenOptions={{headerShown: false, animation: 'none'}}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </NavigationThemeProvider>
            </ClerkLoaded>
          </ToastProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
});
