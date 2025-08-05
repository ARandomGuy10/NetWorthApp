import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

/**
 * Initial route component that handles the app's initial routing
 * based on authentication state and platform.
 */
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Use setTimeout to ensure navigation happens after initial render
    const timer = setTimeout(() => {
      if (Platform.OS === 'web') {
        // On web, redirect to landing page
        if (!window.location.pathname.startsWith('/landing')) {
          router.replace('/landing');
        }
      } else {
        // On mobile, use the existing auth flow
        if (isSignedIn) {
          console.log('User is signed in, redirecting to /(tabs)/dashboard');
          router.replace('/(tabs)/dashboard');
        } else {
          console.log('User is not signed in, redirecting to /(auth)/welcome');
          router.replace('/(auth)/welcome');
        }
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  // Show loading state while checking auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size ="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
});