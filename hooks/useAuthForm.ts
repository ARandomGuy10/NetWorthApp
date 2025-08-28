// src/hooks/useAuthForm.ts
import {useState} from 'react';
import {Alert} from 'react-native';
import {useOAuth} from '@clerk/clerk-expo';
import {router} from 'expo-router';
import {FormErrors, OAuthStrategy} from '@/src/types/auth';

export const useAuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<OAuthStrategy | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const {startOAuthFlow: googleAuth} = useOAuth({strategy: 'oauth_google'});
  const {startOAuthFlow: appleAuth} = useOAuth({strategy: 'oauth_apple'});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const setFieldErrors = (newErrors: FormErrors) => {
    setErrors(newErrors);
  };

  const handleOAuth = async (strategy: OAuthStrategy) => {
    const selectedAuth = strategy === 'google' ? googleAuth : appleAuth;

    try {
      setSocialLoading(strategy);
      const {createdSessionId, setActive} = await selectedAuth();

      if (createdSessionId && setActive) {
        await setActive({session: createdSessionId});
        // Redirect all social logins to the main app. The (tabs) layout's
        // "gatekeeper" logic will handle redirecting new users to onboarding.
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      console.error('OAuth error', err);
      Alert.alert('OAuth Error', err.errors?.[0]?.message || `Failed to continue with ${strategy}.`);
    } finally {
      setSocialLoading(null);
    }
  };

  return {
    loading,
    setLoading,
    socialLoading,
    errors,
    clearError,
    setFieldErrors,
    handleOAuth,
  };
};
