import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

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

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Accounts',
          headerShown: false, // You're handling the header in the component
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Account Details',
          headerShown: false, // You're handling the header in the component
        }} 
      />
      <Stack.Screen 
        name="add-account" 
        options={{ 
          presentation: 'modal',
          title: 'Add Account',
          headerShown: false, // You're handling the header in the component
        }} 
      />
      <Stack.Screen 
        name="add-balance" 
        options={{ 
          presentation: 'modal',
          title: 'Add Balance',
          headerShown: false, // You're handling the header in the component
        }} 
      />
    </Stack>
  );
}
