import React, {useEffect, useState, useCallback, useRef} from 'react';

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
  TouchableOpacity,
} from 'react-native';

import {Link, router} from 'expo-router';

import * as Haptics from 'expo-haptics';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSignUp} from '@clerk/clerk-expo';

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
import {VerificationData, FormErrors} from '@/src/types/auth';
import {useAuthForm} from '@/hooks/useAuthForm';
import {useHaptics} from '@/hooks/useHaptics';
import MeshBackgroundGlow from '@/components/ui/MeshBackgroundGlow';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Helper function to log errors privately
const logErrorPrivately = (error: any, context: string) => {
  // Send to monitoring service like Sentry instead of console
  // Sentry.captureException(error, { tags: { context } });
};

// Helper function to get user-friendly error messages
const getUserFriendlyError = (error: any): {field?: string; message: string} => {
  const errorMessage = error?.errors?.[0]?.message || error?.message || '';

  if (errorMessage.toLowerCase().includes('password has been found')) {
    return {
      field: 'password',
      message: 'This password was found in a data breach. Please choose a different, stronger password.',
    };
  }

  if (errorMessage.toLowerCase().includes('email')) {
    return {
      field: 'emailAddress',
      message: 'This email address is already in use or invalid.',
    };
  }

  if (errorMessage.toLowerCase().includes('weak') || errorMessage.toLowerCase().includes('strength')) {
    return {
      field: 'password',
      message: 'Please choose a stronger password with uppercase, lowercase, numbers, and symbols.',
    };
  }

  return {
    message: 'Unable to create account. Please check your details and try again.',
  };
};

const SignUpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {isLoaded, signUp, setActive} = useSignUp();
  const {impactAsync, notificationAsync, selectionAsync} = useHaptics();

  // 🎯 UPDATED: Removed firstName from credentials
  const [credentials, setCredentials] = useState({
    emailAddress: '',
    password: '',
    confirmPassword: '',
  });

  const [verification, setVerification] = useState<VerificationData>({
    code: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State for resend functionality
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  // Refs for text inputs
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const {loading, setLoading, socialLoading, errors, clearError, setFieldErrors, handleOAuth} = useAuthForm();

  // 🎯 UPDATED: Removed firstName animation style
  const emailAnimatedStyle = useInputFocusAnimation(focusedField === 'emailAddress', !!errors.emailAddress);
  const passwordAnimatedStyle = useInputFocusAnimation(focusedField === 'password', !!errors.password);
  const confirmPasswordAnimatedStyle = useInputFocusAnimation(
    focusedField === 'confirmPassword',
    !!errors.confirmPassword
  );
  const codeAnimatedStyle = useInputFocusAnimation(focusedField === 'code');

  // Handle resend countdown timer
  useEffect(() => {
    if (!resendDisabled) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 30; // Reset for next time
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendDisabled]);
  // Show loading screen while Clerk initializes
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

  // Show error screen if signUp is undefined after loading
  if (!signUp) {
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

  // 🎯 UPDATED: Removed firstName validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!credentials.emailAddress) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email.';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required.';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!credentials.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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

  // 🎯 UPDATED: Removed firstName from signup call
  const onSignUpPress = useCallback(async (): Promise<void> => {
    if (!isLoaded || !signUp || !validateForm()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: credentials.emailAddress.trim(),
        password: credentials.password,
      });

      await signUp.prepareEmailAddressVerification({strategy: 'email_code'});

      notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPendingVerification(true);
    } catch (err: any) {
      logErrorPrivately(err, 'sign_up');

      const userError = getUserFriendlyError(err);
      notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (userError.field) {
        setFieldErrors({[userError.field]: userError.message});
      } else {
        Alert.alert('Sign Up Error', userError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, validateForm, credentials, setLoading, setFieldErrors, notificationAsync]);

  const onPressVerify = useCallback(async (): Promise<void> => {
    if (!isLoaded || !signUp || !verification.code.trim()) {
      notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code.trim(),
      });

      if (completeSignUp.status === 'complete') {
        setIsSuccess(true);
        notificationAsync(Haptics.NotificationFeedbackType.Success);

        await setActive({session: completeSignUp.createdSessionId});

        setTimeout(() => {
          router.replace('/(tabs)/dashboard');
        }, 500);
      }
    } catch (err: any) {
      logErrorPrivately(err, 'email_verification');

      notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Verification Failed',
        'The verification code is incorrect or expired. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
      setIsSuccess(false);
    }
  }, [isLoaded, signUp, verification.code, setActive, setLoading, notificationAsync]);

  const onResendCode = useCallback(async (): Promise<void> => {
    if (!isLoaded || !signUp) return;

    try {
      setResendDisabled(true);
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      // Briefly show a success message instead of an alert
      setShowResendSuccess(true);
      setTimeout(() => setShowResendSuccess(false), 2000);
      notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      logErrorPrivately(err, 'resend_verification_code');
      notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Resend Failed', 'Could not send a new verification code. Please try again in a moment.');
      // Allow user to try again immediately on failure
      setResendDisabled(false);
    }
  }, [isLoaded, signUp, notificationAsync]);

  const updateCredentials = useCallback(
    (field: keyof typeof credentials, value: string) => {
      setCredentials(prev => ({...prev, [field]: value}));
      clearError(field);
    },
    [clearError]
  );

  const updateVerification = useCallback((field: keyof VerificationData, value: string) => {
    setVerification(prev => ({...prev, [field]: value}));
  }, []);

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

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync]);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync]);

  const handleBackPress = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [impactAsync]);

  return (
    <>
      <StatusBar style="light" translucent />
      <MeshBackgroundGlow
        colors={onboardingTheme.intro.meshBackground}
        glowColors={onboardingTheme.final.meshBackground.map(color => [color, 'transparent']) as [string, string][]}
        glowDurations={[8000, 10000, 12000]}
      />
      <View style={[styles.safeArea, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <AnimatedButton style={sharedStyles.headerButtonDark} onPress={handleBackPress} hapticType="light">
            <Ionicons name="arrow-back" size={responsiveSizes.fontSize + 2} color="#FFFFFF" />
          </AnimatedButton>

          <Link href="/(auth)/sign-in" asChild>
            <AnimatedButton style={sharedStyles.headerButtonDark} hapticType="light">
              <Text style={sharedStyles.headerButtonText}>Login</Text>
            </AnimatedButton>
          </Link>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <ScrollView
              contentContainerStyle={[
                styles.scrollContentContainer,
                {paddingBottom: responsiveSizes.verticalSpacing * 2 + insets.bottom},
              ]}
              keyboardShouldPersistTaps="never"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {!pendingVerification ? (<>
                <View>
                  <Text style={styles.title} allowFontScaling={false}>
                    Create Account
                  </Text>
                  <Text style={styles.subtitle} allowFontScaling={false}>
                    Sign up to access your account
                  </Text>
                </View>
                <View>
                  <TouchableWithoutFeedback onPress={() => emailInputRef.current?.focus()}>
                    <Animated.View style={[sharedStyles.inputWrapper, emailAnimatedStyle]}>
                      <Ionicons
                        name="mail"
                        size={responsiveSizes.fontSize}
                        color="#FFFFFF"
                        style={sharedStyles.inputIcon}
                      />
                      <AnimatedTextInput
                        ref={emailInputRef}
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
                        accessibilityHint="Enter your email address to create account"
                        accessibilityRole="text"
                        accessible={true}
                      />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.emailAddress} />

                  <TouchableWithoutFeedback onPress={() => passwordInputRef.current?.focus()}>
                    <Animated.View style={[sharedStyles.inputWrapper, passwordAnimatedStyle]}>
                      <Ionicons
                        name="lock-closed"
                        size={responsiveSizes.fontSize}
                        color="#FFFFFF"
                        style={sharedStyles.inputIcon}
                      />
                      <AnimatedTextInput
                        ref={passwordInputRef}
                        placeholder="Create a password"
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
                        returnKeyType="next"
                        allowFontScaling={false}
                        accessibilityLabel="Password input"
                        accessibilityHint="Create a secure password"
                        accessibilityRole="text"
                        accessible={true}
                      />
                      <PasswordToggle showPassword={showPassword} onToggle={togglePasswordVisibility} />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.password} />

                  <TouchableWithoutFeedback onPress={() => confirmPasswordInputRef.current?.focus()}>
                    <Animated.View style={[sharedStyles.inputWrapper, confirmPasswordAnimatedStyle]}>
                      <Ionicons
                        name="lock-closed"
                        size={responsiveSizes.fontSize}
                        color="#FFFFFF"
                        style={sharedStyles.inputIcon}
                      />
                      <AnimatedTextInput
                        ref={confirmPasswordInputRef}
                        placeholder="Confirm your password"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={credentials.confirmPassword}
                        onChangeText={text => updateCredentials('confirmPassword', text)}
                        onFocus={() => handleFieldFocus('confirmPassword')}
                        onBlur={handleFieldBlur}
                        style={sharedStyles.input}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={onSignUpPress}
                        allowFontScaling={false}
                        accessibilityLabel="Confirm password input"
                        accessibilityHint="Re-enter your password to confirm"
                        accessibilityRole="text"
                        accessible={true}
                      />
                      <PasswordToggle showPassword={showConfirmPassword} onToggle={toggleConfirmPasswordVisibility} />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.confirmPassword} />

                  <GradientButton onPress={onSignUpPress} loading={loading} success={isSuccess}>
                    <Text style={sharedStyles.gradientButtonText} allowFontScaling={false}>
                      Create Account
                    </Text>
                  </GradientButton>
                </View>
                <View>
                  <View style={sharedStyles.dividerContainer}>
                    <View style={sharedStyles.dividerLine} />
                    <Text style={sharedStyles.dividerText} allowFontScaling={false}>
                      Or
                    </Text>
                    <View style={sharedStyles.dividerLine} />
                  </View>

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

                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText} allowFontScaling={false}>
                      Already have an account?{' '}
                    </Text>

                    <Text
                      style={styles.linkTextBold}
                      onPress={() => {
                        impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(auth)/sign-in');
                      }}>
                      Sign in
                    </Text>
                  </View>
                </View></>
              ) : (
                <>
                  {/* Verification Step */}
                  <Text style={styles.title} allowFontScaling={false}>
                    Verify Your Email
                  </Text>
                  <Text style={styles.subtitle} allowFontScaling={false}>
                    We've sent a verification code to{'\n'}
                    <Text style={styles.emailHighlight}>{credentials.emailAddress}</Text>
                  </Text>

                  {/* Verification Code Input */}
                  <Animated.View style={[sharedStyles.inputWrapper, codeAnimatedStyle]}>
                    <Ionicons
                      name="keypad"
                      size={responsiveSizes.fontSize}
                      color="#FFFFFF"
                      style={sharedStyles.inputIcon}
                    />
                    <AnimatedTextInput
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={verification.code}
                      onChangeText={text => updateVerification('code', text)}
                      onFocus={() => handleFieldFocus('code')}
                      onBlur={handleFieldBlur}
                      style={sharedStyles.input}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="oneTimeCode"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={onPressVerify}
                      allowFontScaling={false}
                      accessibilityLabel="Verification code input"
                      accessibilityHint="Enter the 6-digit verification code sent to your email"
                      accessibilityRole="text"
                      accessible={true}
                    />
                  </Animated.View>

                  {/* Verify Button */}
                  <GradientButton onPress={onPressVerify} loading={loading} success={isSuccess}>
                    <Text style={sharedStyles.gradientButtonText} allowFontScaling={false}>
                      Verify Email
                    </Text>
                  </GradientButton>

                  {/* Resend Code Link */}
                  <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Didn't receive a code? </Text>
                    <TouchableOpacity onPress={onResendCode} disabled={resendDisabled}>
                      <Text style={[styles.footerLink, resendDisabled && styles.footerLinkDisabled]}>
                        {resendDisabled ? `Resend in ${countdown}s` : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Resend Success Message */}
                  {showResendSuccess && (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteTextSuccess}>A new code has been sent!</Text>
                    </View>
                  )}

                  {/* Note about profile completion */}
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteText} allowFontScaling={false}>
                      You can complete your profile after verification
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: '6%', // Keep horizontal padding consistent
    paddingTop: responsiveSizes.verticalSpacing * 3, // Increased space from header
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
    marginBottom: responsiveSizes.verticalSpacing, // Dynamic spacing for consistency
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
  emailHighlight: {
    color: '#22c55e',
    fontFamily: 'Inter_600SemiBold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveSizes.verticalSpacing * 1.5,
    marginBottom: responsiveSizes.verticalSpacing / 2,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveSizes.verticalSpacing * 2,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: responsiveSizes.fontSize - 1,
  },
  footerLink: {
    color: '#22c55e',
    fontSize: responsiveSizes.fontSize - 1,
    fontFamily: 'Inter_600SemiBold',
  },
  footerLinkDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  noteContainer: {
    marginTop: responsiveSizes.verticalSpacing * 2,
    paddingHorizontal: responsiveSizes.verticalSpacing,
    alignItems: 'center',
  },
  noteText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: responsiveSizes.fontSize - 2,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: responsiveSizes.fontSize * 1.3,
  },
  noteTextSuccess: {
    color: '#22c55e',
    fontSize: responsiveSizes.fontSize - 2,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
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

export default SignUpScreen;
