import {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Stack, router} from 'expo-router';
import {useAuth} from '@clerk/clerk-expo';
import {useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold} from '@expo-google-fonts/inter';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useWarmUpBrowser} from '../../hooks/useWarmUpBrowser';

export default function AuthLayout() {
  const {isSignedIn, isLoaded} = useAuth();

  useWarmUpBrowser();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // Small delay to prevent flash - works for both OAuth and email/password
      const timer = setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isLoaded]);

  // Show loading while auth is loading OR during redirect
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

  // Prevent showing auth screens if user is signed in
  if (isSignedIn) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: onboardingTheme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={onboardingTheme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
