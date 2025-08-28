import {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Tabs, router} from 'expo-router';
import {useAuth} from '@clerk/clerk-expo';

import {ThemeProvider, useTheme} from '@/src/styles/theme/ThemeContext';
import CustomBottomTabBar from '../../components/ui/CustomBottomTabBar';
import {useProfile, useCreateProfile} from '../../hooks/useProfile';

/**
 * This is the "gatekeeper" layout. It ensures the user is authenticated
 * and has completed the initial onboarding setup.
 */
function ProtectedLayout() {
  console.log('TabsLayout rendered');
  const {isSignedIn, isLoaded} = useAuth();
  const {data: profile, isLoading: isProfileLoading} = useProfile();
  const {mutate: createProfile} = useCreateProfile();
  const {theme} = useTheme(); // Use theme for loading background

  // This effect handles three critical scenarios:
  // 1. If Clerk has loaded but the user is not signed in, redirect to the sign-in screen.
  // 2. If the user is signed in but has no profile in the DB (first-ever login), create one.
  // 3. If the user is signed in, has a profile, but hasn't completed onboarding, redirect to the setup screen.
  useEffect(() => {
    // Scenario 1: Not signed in
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
      return;
    }

    // Wait for profile to finish loading before making decisions
    if (isProfileLoading) {
      return;
    }

    // Scenario 2: Signed in, but no profile exists yet.
    // This happens for brand new users (both email and social).
    if (isLoaded && isSignedIn && profile === null) {
      createProfile();
      // The useProfile query will refetch after creation, triggering the next check.
      return;
    }

    // Scenario 3: Profile exists, but onboarding is not complete.
    if (profile && !profile.has_completed_onboarding) {
      router.replace('/(onboarding)/setup');
    }
  }, [isSignedIn, isLoaded, isProfileLoading, profile, createProfile]);

  // Show a loading indicator while auth/profile is loading or while redirecting.
  // This prevents a flash of the dashboard content before the redirect logic runs.
  const showLoading = !isLoaded || isProfileLoading || !profile || !profile.has_completed_onboarding;

  if (showLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background.primary,
        }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If all checks pass, render the main application tabs.
  return (
    <Tabs
      tabBar={props => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: undefined,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: undefined,
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            router.navigate('/(tabs)/accounts');
          },
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: undefined,
        }}
      />
    </Tabs>
  );
}

/**
 * This is the root layout for the authenticated part of the app.
 * It wraps the main content in the ThemeProvider, which provides
 * user-specific theme settings fetched from the database.
 */
export default function TabsLayout() {
  return (
    <ThemeProvider>
      <ProtectedLayout />
    </ThemeProvider>
  );
}
