import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

/**
 * Initial route component that handles the app's initial routing
 * based on authentication state.
 */
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    
    // Use setTimeout to ensure navigation happens after initial render
    const timer = setTimeout(() => {
      if (isSignedIn) {
        console.log('User is signed in, redirecting to /(tabs)/home');
        router.replace('/(tabs)/home');
      } else {
        console.log('User is not signed in, redirecting to /(auth)/welcome');
        router.replace('/(auth)/welcome');
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  // Show loading state while checking auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size ="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});