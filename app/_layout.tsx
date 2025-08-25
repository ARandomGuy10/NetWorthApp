import { Stack } from 'expo-router';

import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { ThemeProvider } from '../src/styles/theme/ThemeContext';
import { ToastProvider } from '../hooks/providers/ToastProvider';
import { queryClient } from '../lib/queryClient';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkProvider
          tokenCache={tokenCache}
          publishableKey={publishableKey}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ToastProvider>
                <ClerkLoaded>
                  <StatusBar style="auto" />
                  <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                  </Stack>
                </ClerkLoaded>
              </ToastProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
