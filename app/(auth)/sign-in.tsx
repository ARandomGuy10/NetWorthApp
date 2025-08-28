// sign-in.tsx - PRODUCTION READY WITH HAPTICS, ERROR HANDLING & RESPONSIVE DESIGN
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {Link, router} from 'expo-router';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSignIn} from '@clerk/clerk-expo';
import {StatusBar} from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import BackgroundGlow from '@/components/ui/BackgroundGlow';
import {
  AnimatedButton,
  ErrorMessage,
  SocialButton,
  GradientButton,
  PasswordToggle,
  useInputFocusAnimation,
  sharedStyles,
  responsiveSizes,
} from '@/components/auth/SharedAuthComponents';
import {SignInCredentials, FormErrors} from '@/src/types/auth';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useAuthForm} from '@/hooks/useAuthForm';
import {useHaptics} from '@/hooks/useHaptics';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// 🎯 Helper function to log errors privately (not to user UI)
const logErrorPrivately = (error: any, context: string) => {
  // Remove console.error that shows at bottom of screen
  // Instead, send to monitoring service like Sentry
  // console.error('Sign-in error:', error); // ❌ Remove this line
  // ✅ Use proper error monitoring instead
  // Sentry.captureException(error, { tags: { context } });
  // Or your preferred monitoring solution
};

// 🎯 Helper function to get user-friendly error messages
const getUserFriendlyError = (error: any): {field?: string; message: string} => {
  const errorMessage = error?.errors?.[0]?.message || error?.message || '';

  if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('identifier')) {
    return {
      field: 'emailAddress',
      message: 'Email address or Password incorrect. Please try again.',
    };
  }

  if (errorMessage.toLowerCase().includes('password')) {
    return {
      field: 'password',
      message: 'Incorrect password. Please try again.',
    };
  }

  if (errorMessage.toLowerCase().includes('too many')) {
    return {
      message: 'Too many login attempts. Please wait a few minutes and try again.',
    };
  }

  // Generic fallback - don't expose internal errors
  return {
    message: 'Unable to sign in. Please check your credentials and try again.',
  };
};

const SignInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {signIn, setActive, isLoaded} = useSignIn();
  const {impactAsync, notificationAsync, selectionAsync} = useHaptics();

  // 🎯 MOVE useAuthForm TO TOP - BEFORE ANY USAGE
  const {loading, setLoading, socialLoading, errors, clearError, setFieldErrors, handleOAuth} = useAuthForm();

  const [credentials, setCredentials] = useState<SignInCredentials>({
    emailAddress: '',
    password: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🎯 NOW errors can be safely used
  const emailAnimatedStyle = useInputFocusAnimation(focusedField === 'emailAddress', !!errors.emailAddress);
  const passwordAnimatedStyle = useInputFocusAnimation(focusedField === 'password', !!errors.password);

  // 🎯 Show loading screen while Clerk initializes
  if (!isLoaded) {
    return (
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  // 🎯 Show error screen if signIn is undefined after loading
  if (!signIn) {
    return (
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Service Unavailable</Text>
          <Text style={styles.errorMessage}>
            Authentication service is currently unavailable.{'\n'}
            Please check your internet connection and try again.
          </Text>
          <AnimatedButton style={styles.retryButton} onPress={() => router.back()} hapticType="medium">
            <Text style={styles.retryButtonText}>Go Back</Text>
          </AnimatedButton>
        </View>
      </LinearGradient>
    );
  }

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const emailTrimmed = credentials.emailAddress.trim();
    if (!emailTrimmed) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.emailAddress = 'Please enter a valid email.';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required.';
    }

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    } else {
      selectionAsync();
      return true;
    }
  }, [credentials, setFieldErrors, notificationAsync, selectionAsync]);

  const onSignInPress = useCallback(async (): Promise<void> => {
    // 🎯 FIXED: Add signIn check along with other validations
    if (!isLoaded || !signIn || !validateForm()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const completeSignIn = await signIn.create({
        identifier: credentials.emailAddress.trim(),
        password: credentials.password,
      });

      if (completeSignIn.status === 'complete') {
        setIsSuccess(true);
        // Success haptic handled by GradientButton component
        await setActive({session: completeSignIn.createdSessionId});
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: any) {
      // 🎯 FIXED: Handle errors privately and show user-friendly messages
      logErrorPrivately(err, 'sign_in');

      const userError = getUserFriendlyError(err);
      notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (userError.field) {
        // Set field-specific error
        setFieldErrors({[userError.field]: userError.message});
      } else {
        // Show generic alert for non-field errors
        Alert.alert('Sign In Error', userError.message);
      }
    } finally {
      setLoading(false);
      setIsSuccess(false);
    }
  }, [isLoaded, signIn, validateForm, credentials, setActive, setLoading, setFieldErrors, notificationAsync]);

  const updateCredentials = useCallback(
    (field: keyof SignInCredentials, value: string) => {
      setCredentials(prev => ({...prev, [field]: value}));
      clearError(field);
    },
    [clearError]
  );

  // 🎯 Enhanced focus handlers with haptics
  const handleFieldFocus = useCallback(
    (field: string) => {
      setFocusedField(field);
      selectionAsync();
    },
    [selectionAsync]
  );

  const handleFieldBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    setFocusedField(null);
    selectionAsync();
  }, [selectionAsync]);

  // 🎯 Enhanced toggle handlers with haptics
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync]);

  const toggleRememberMe = useCallback(() => {
    setRememberMe(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [impactAsync]);

  const handleBackPress = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [impactAsync]);

  return (
    <>
      <StatusBar style="light" translucent />
      <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
        <BackgroundGlow />
        <View style={[styles.safeArea, {paddingTop: insets.top}]}>
          {/* Enhanced Header with Haptics */}
          <View style={styles.headerContainer}>
            <AnimatedButton style={sharedStyles.headerButtonDark} onPress={handleBackPress} hapticType="light">
              <Ionicons name="arrow-back" size={responsiveSizes.fontSize + 2} color="#FFFFFF" />
            </AnimatedButton>

            <Link href="/(auth)/sign-up" asChild>
              <AnimatedButton style={sharedStyles.headerButtonDark} hapticType="light">
                <Text style={sharedStyles.headerButtonText}>Sign Up</Text>
              </AnimatedButton>
            </Link>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
              <ScrollView
                contentContainerStyle={styles.scrollContentContainer}
                keyboardShouldPersistTaps="never"
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <Text style={styles.title} allowFontScaling={false}>
                  Welcome Back
                </Text>
                <Text style={styles.subtitle} allowFontScaling={false}>
                  Sign in to access your account
                </Text>

                {/* Enhanced Email Input with Haptics */}
                <Animated.View style={[sharedStyles.inputWrapper, emailAnimatedStyle]}>
                  <Ionicons
                    name="mail"
                    size={responsiveSizes.fontSize}
                    color="#FFFFFF"
                    style={sharedStyles.inputIcon}
                  />
                  <AnimatedTextInput
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={credentials.emailAddress}
                    onChangeText={text => updateCredentials('emailAddress', text)}
                    onFocus={() => handleFieldFocus('emailAddress')}
                    onBlur={handleFieldBlur}
                    style={sharedStyles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    returnKeyType="next"
                    allowFontScaling={false}
                    accessibilityLabel="Email address input"
                    accessibilityHint="Enter your email address to sign in"
                    accessibilityRole="text"
                    accessible={true}
                  />
                </Animated.View>
                <ErrorMessage message={errors.emailAddress} />

                {/* Enhanced Password Input with Haptic Toggle */}
                <Animated.View style={[sharedStyles.inputWrapper, passwordAnimatedStyle]}>
                  <Ionicons
                    name="lock-closed"
                    size={responsiveSizes.fontSize}
                    color="#FFFFFF"
                    style={sharedStyles.inputIcon}
                  />
                  <AnimatedTextInput
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={credentials.password}
                    onChangeText={text => updateCredentials('password', text)}
                    onFocus={() => handleFieldFocus('password')}
                    onBlur={handleFieldBlur}
                    style={sharedStyles.input}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={onSignInPress}
                    allowFontScaling={false}
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password to sign in"
                    accessibilityRole="text"
                    accessible={true}
                  />
                  <PasswordToggle showPassword={showPassword} onToggle={togglePasswordVisibility} />
                </Animated.View>
                <ErrorMessage message={errors.password} />

                {/* Enhanced Options Row with Haptics */}
                <View style={styles.optionsContainer}>
                  <AnimatedButton
                    style={styles.rememberMeContainer}
                    onPress={toggleRememberMe}
                    hapticType="light"
                    accessibilityLabel="Remember me checkbox"
                    accessibilityHint="Toggle to remember your login"
                    accessibilityRole="checkbox"
                    accessible={true}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={10} color="#22c55e" />}
                    </View>
                    <Text style={styles.rememberMeText} allowFontScaling={false}>
                      Remember me
                    </Text>
                  </AnimatedButton>

                  <Text
                    style={styles.forgotPasswordText}
                    onPress={() => {
                      impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/(auth)/forgot-password');
                    }}>
                    Forgot Password?
                  </Text>
                </View>

                {/* Enhanced Sign In Button with Success Haptics */}
                <GradientButton onPress={onSignInPress} loading={loading} success={isSuccess}>
                  <Text style={sharedStyles.gradientButtonText} allowFontScaling={false}>
                    Sign In
                  </Text>
                </GradientButton>

                {/* Divider */}
                <View style={sharedStyles.dividerContainer}>
                  <View style={sharedStyles.dividerLine} />
                  <Text style={sharedStyles.dividerText} allowFontScaling={false}>
                    Or
                  </Text>
                  <View style={sharedStyles.dividerLine} />
                </View>

                {/* Enhanced Social Buttons with Haptics */}
                <View style={sharedStyles.socialContainer}>
                  <SocialButton
                    strategy="google"
                    onPress={handleOAuth}
                    loading={socialLoading === 'google'}
                    disabled={socialLoading !== null}
                  />
                  <SocialButton
                    strategy="apple"
                    onPress={handleOAuth}
                    loading={socialLoading === 'apple'}
                    disabled={socialLoading !== null}
                  />
                </View>

                {/* Link with Haptics */}
                <View style={styles.linkContainer}>
                  <Text style={styles.linkText} allowFontScaling={false}>
                    Don't have an account?{' '}
                  </Text>
                  <Text
                    style={styles.linkTextBold}
                    onPress={() => {
                      impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/(auth)/sign-up');
                    }}>
                    Create account
                  </Text>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: '6%',
    paddingVertical: responsiveSizes.verticalSpacing,
    minHeight: '90%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: responsiveSizes.verticalSpacing,
  },
  title: {
    fontSize: responsiveSizes.titleSize,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: responsiveSizes.subtitleSize,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: responsiveSizes.verticalSpacing * 2,
    textAlign: 'left',
    lineHeight: responsiveSizes.subtitleSize * 1.4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: responsiveSizes.verticalSpacing,
    marginBottom: responsiveSizes.verticalSpacing,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
  },
  rememberMeText: {
    fontSize: responsiveSizes.fontSize - 1,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  forgotPasswordText: {
    fontSize: responsiveSizes.fontSize - 1,
    fontFamily: 'Inter_600SemiBold',
    color: '#22c55e',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveSizes.verticalSpacing * 2,
    marginBottom: responsiveSizes.verticalSpacing,
  },
  linkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: responsiveSizes.fontSize - 1,
    fontFamily: 'Inter_400Regular',
  },
  linkTextBold: {
    color: '#22c55e',
    fontSize: responsiveSizes.fontSize - 1,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    marginTop: 16,
  },
  // Error screen styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '10%',
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default SignInScreen;
