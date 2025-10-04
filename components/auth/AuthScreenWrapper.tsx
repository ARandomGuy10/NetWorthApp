import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';

import {captureSentryMessage} from '@/lib/sentry';
import {AnimatedButton} from './SharedAuthComponents';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

interface AuthScreenWrapperProps {
  isLoaded: boolean;
  authHook: unknown; // The result of useSignIn() or useSignUp()
  componentName: string;
  children: React.ReactNode;
}

/**
 * A wrapper for authentication screens that handles the common states of
 * SDK initialization and critical hook failures.
 */
export const AuthScreenWrapper: React.FC<AuthScreenWrapperProps> = ({isLoaded, authHook, componentName, children}) => {
  // State 1: Clerk SDK is initializing
  if (!isLoaded) {
    return (
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={onboardingTheme.colors.button.gradientStart} />
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  // State 2: Clerk SDK loaded, but the specific auth hook (signIn/signUp) failed
  if (!authHook) {
    captureSentryMessage(`Clerk auth hook returned null after loading.`, {
      level: 'fatal',
      location: 'auth',
      context: 'init',
      component: componentName,
    });
    return (
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <View style={styles.centeredContainer}>
          <Ionicons name="warning-outline" size={48} color={onboardingTheme.colors.border.error} />
          <Text style={styles.errorTitle}>Service Unavailable</Text>
          <Text style={styles.errorMessage}>
            Authentication service is currently unavailable. Please check your internet connection and try again.
          </Text>
          <AnimatedButton style={styles.retryButton} onPress={() => router.back()} hapticType="medium">
            <Text style={styles.retryButtonText}>Go Back</Text>
          </AnimatedButton>
        </View>
      </LinearGradient>
    );
  }

  // State 3: All checks passed, render the actual screen content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%',
  },
  messageText: {
    color: onboardingTheme.colors.text.primary,
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    color: onboardingTheme.colors.border.error,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: onboardingTheme.colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: onboardingTheme.colors.button.gradientStart,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: onboardingTheme.colors.text.primary,
    fontSize: 16,
  },
});
