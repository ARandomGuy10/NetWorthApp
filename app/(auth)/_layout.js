import {View, ActivityIndicator} from 'react-native';

import {Stack} from 'expo-router';

import {useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold} from '@expo-google-fonts/inter';

import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

import {useWarmUpBrowser} from '../../hooks/useWarmUpBrowser';

export default function AuthLayout() {
  // Warm up the browser for OAuth flows on Android
  useWarmUpBrowser();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    // Display a loading indicator while fonts are loading
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: onboardingTheme.colors.background.primary,
        }}>
        <ActivityIndicator size="large" color={onboardingTheme.colors.primary} />
      </View>
    );
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
