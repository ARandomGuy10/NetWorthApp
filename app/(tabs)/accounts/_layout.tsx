import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';

export default function AccountsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log('User not signed in, redirecting to auth');
      router.replace('/(auth)/sign-in');
    }
  }, [isLoaded, isSignedIn]);

  // Show loading while auth is loading
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Don't render stack if user is not signed in
  if (!isSignedIn) {
    return null; // Redirect is happening in useEffect
  }

  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Each screen in this stack has its own custom header.
        contentStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Accounts' }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ title: 'Account Details' }} 
      />
      <Stack.Screen 
        name="add-account" 
        options={{ 
          presentation: 'modal',
          title: 'Add Account',
        }} 
      />
      <Stack.Screen 
        name="add-balance" 
        options={{ 
          presentation: 'modal',
          title: 'Add Balance',
        }} 
      />
    </Stack>
  );
}

