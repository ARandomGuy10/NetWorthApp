import {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Stack, router} from 'expo-router';
import {useAuth} from '@clerk/clerk-expo';
import {useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold} from '@expo-google-fonts/inter';

import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useWarmUpBrowser} from '../../hooks/useWarmUpBrowser';

export default function AuthLayout() {
  const {isSignedIn, isLoaded} = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // This is the "safety net". If the user is signed in, this layout will
    // redirect them away from any screen in the (auth) group.
    if (isSignedIn) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isSignedIn, isLoaded]);

  // Warm up the browser for OAuth flows on Android
  useWarmUpBrowser();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Show a loading screen while Clerk and fonts are loading.
  if (!isLoaded || (!fontsLoaded && !fontError)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: onboardingTheme.colors.background.primary, // Use a consistent background
        }}>
        <ActivityIndicator size="large" color={onboardingTheme.colors.primary} />
      </View>
    );
  }

  // If the user is signed in and not on the forgot password screen, the redirect is in progress.
  // Return null to prevent a flash of the auth screen.
  if (isSignedIn) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Allow screens to control their own background color for full-screen effects
        contentStyle: {backgroundColor: 'transparent'},
      }}
    />
  );
}
