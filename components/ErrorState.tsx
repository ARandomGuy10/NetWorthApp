import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

/**
 * A user-friendly fallback component to display when a critical
 * rendering error occurs in the application.
 */
export default function ErrorState() {
  const handleRestart = async () => {
    try {
      if (Platform.OS === 'web') {
        // Fallback for web: simply reload the page.
        window.location.reload();
      } else {
        // Dynamically require expo-updates only when needed.
        const Updates = require('expo-updates');
        // This forces the app to fetch the latest update and restart.
        await Updates.reloadAsync();
      }
    } catch (error) {
      // The app is already in a crashed state. Try to report the restart
      // failure to Sentry, but fall back to console.error if Sentry fails.
      Sentry.captureException(error);
      console.error('Failed to restart the app after a crash:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.title}>Oops! Something went wrong.</Text>
        <Text style={styles.message}>
          We're sorry for the inconvenience. Our team has been notified, and we are working to fix it. Please try
          restarting the app.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleRestart}>
          <Text style={styles.buttonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: onboardingTheme.colors.background.primary,
    padding: 24,
  },
  content: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: onboardingTheme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: onboardingTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: onboardingTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12, // Default border radius
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
