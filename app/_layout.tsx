import {Stack} from 'expo-router';

import {ClerkProvider, ClerkLoaded} from '@clerk/clerk-expo';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClientProvider} from '@tanstack/react-query';
import {StatusBar} from 'expo-status-bar';
import {tokenCache} from '@clerk/clerk-expo/token-cache';

import {ThemeProvider} from '../src/styles/theme/ThemeContext';
import {ToastProvider} from '../hooks/providers/ToastProvider';
import {queryClient} from '../lib/queryClient';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey} telemetry={false}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ClerkLoaded>
              <StatusBar style="auto" />
              <Stack screenOptions={{headerShown: false, animation: 'none'}}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </ClerkLoaded>
          </ToastProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
