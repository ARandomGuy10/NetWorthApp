import React, {useEffect} from 'react';

import {View, Text, StyleSheet, ActivityIndicator, Platform} from 'react-native';

import {router} from 'expo-router';

import * as ScreenOrientation from 'expo-screen-orientation';
import {useAuth} from '@clerk/clerk-expo';
import * as Sentry from '@sentry/react-native';

import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

/**
 * Initial route component that handles the app's initial routing
 * based on authentication state and platform.
 */
export default function Index() {
  const {isSignedIn, isLoaded} = useAuth();

  useEffect(() => {
    // Fallback for devices that don't respect app.json
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Use setTimeout to ensure navigation happens after initial render
    const timer = setTimeout(() => {
      try {
        if (Platform.OS === 'web') {
          // On web, redirect to landing page
          if (!window.location.pathname.startsWith('/landing')) {
            router.replace('/landing');
          }
        } else {
          // On mobile, use the existing auth flow
          if (isSignedIn) {
            router.replace('/(tabs)/dashboard');
          } else {
            router.replace('/(auth)/welcome');
          }
        }
      } catch (error) {
        Sentry.withScope(scope => {
          scope.setTag('location', 'initial-redirect');
          scope.setExtra('isLoaded', isLoaded);
          scope.setExtra('isSignedIn', isSignedIn);
          scope.setExtra('platform', Platform.OS);
          scope.setLevel('fatal');
          Sentry.captureException(error);
        });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  // Show loading state while checking auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={onboardingTheme.colors.primary} />
      <Text style={styles.loadingText}>Initializing...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: onboardingTheme.colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: onboardingTheme.colors.text.secondary,
  },
});
