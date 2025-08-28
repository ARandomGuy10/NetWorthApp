import React, {useState, useCallback, useRef, useEffect} from 'react';
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
} from 'react-native';
import {router, Link} from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSignIn} from '@clerk/clerk-expo';

import MeshBackgroundGlow from '@/components/ui/MeshBackgroundGlow';
import {
  AnimatedButton,
  ErrorMessage,
  GradientButton,
  useInputFocusAnimation,
  PasswordToggle,
  sharedStyles,
  responsiveSizes,
} from '@/components/auth/SharedAuthComponents';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useAuthForm} from '@/hooks/useAuthForm';
import {useHaptics} from '@/hooks/useHaptics';
import {useToast} from '@/hooks/providers/ToastProvider';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Helper to get user-friendly error messages
const getUserFriendlyError = (error: any): {field?: string; message: string} => {
  const errorMessage = error?.errors?.[0]?.message || 'An unexpected error occurred.';
  if (errorMessage.toLowerCase().includes('not found')) {
    return {
      field: 'emailAddress',
      message: 'No account found with this email. Please sign up.',
    };
  }

  if (errorMessage.toLowerCase().includes('too many')) {
    return {
      message: 'Too many attempts. Please wait a few minutes and try again.',
    };
  }

  return {
    message: 'Unable to send reset link. Please check the email and try again.',
  };
};

// Helper to get user-friendly error messages for password reset
const getResetPasswordError = (error: any): {field?: string; message: string} => {
  const errorMessage = error?.errors?.[0]?.message || 'An unexpected error occurred.';
  const errorCode = error?.errors?.[0]?.code || '';

  if (errorCode.includes('form_code_incorrect')) {
    return {
      field: 'code',
      message: 'The verification code is incorrect. Please try again.',
    };
  }

  if (errorMessage.toLowerCase().includes('password has been found')) {
    return {
      field: 'password',
      message: 'This password was found in a data breach. Please choose a different, stronger password.',
    };
  }

  if (errorMessage.toLowerCase().includes('weak') || errorMessage.toLowerCase().includes('strength')) {
    return {
      field: 'password',
      message: 'Please choose a stronger password with uppercase, lowercase, numbers, and symbols.',
    };
  }

  return {
    message: 'Failed to reset password. Please try again.',
  };
};

const ForgotPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {signIn, setActive, isLoaded} = useSignIn();
  const {impactAsync, notificationAsync, selectionAsync} = useHaptics();
  const {showToast} = useToast();

  const emailInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const {loading, setLoading, errors, setFieldErrors, clearError} = useAuthForm();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [pendingReset, setPendingReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailAnimatedStyle = useInputFocusAnimation(focusedField === 'emailAddress', !!errors.emailAddress);
  const codeAnimatedStyle = useInputFocusAnimation(focusedField === 'code', !!errors.code);
  const passwordAnimatedStyle = useInputFocusAnimation(focusedField === 'password', !!errors.password);
  const confirmPasswordAnimatedStyle = useInputFocusAnimation(
    focusedField === 'confirmPassword',
    !!errors.confirmPassword
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: {[key: string]: string} = {};
    const emailTrimmed = emailAddress.trim();

    if (!emailTrimmed) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.emailAddress = 'Please enter a valid email.';
    }

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    selectionAsync();
    return true;
  }, [emailAddress, setFieldErrors, notificationAsync, selectionAsync]);

  const validateResetForm = useCallback((): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!code.trim() || code.length < 6) {
      newErrors.code = 'Please enter a valid 6-digit code.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    selectionAsync();
    return true;
  }, [code, password, confirmPassword, setFieldErrors, notificationAsync, selectionAsync]);

  const onSendResetEmailPress = useCallback(async (): Promise<void> => {
    if (!isLoaded || !signIn || !validateForm()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress.trim(),
      });

      notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPendingReset(true);
    } catch (err: any) {
      const userError = getUserFriendlyError(err);
      notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (userError.field) {
        setFieldErrors({[userError.field]: userError.message});
      } else {
        Alert.alert('Error', userError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, validateForm, emailAddress, setLoading, setFieldErrors, notificationAsync]);

  const onResetPasswordPress = useCallback(async (): Promise<void> => {
    if (!isLoaded || !signIn || !setActive || !validateResetForm()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({session: result.createdSessionId});
        // Show a success toast. The button will remain in a loading state.
        showToast('Password reset successfully!', 'success');

        // Redirect immediately. The toast will be visible across the transition.
        router.replace('/(tabs)/dashboard');
        return; // Exit to prevent setLoading(false) from being called.
      }
    } catch (err: any) {
      notificationAsync(Haptics.NotificationFeedbackType.Error);
      const userError = getResetPasswordError(err);

      if (userError.field) {
        setFieldErrors({[userError.field]: userError.message});
      } else {
        Alert.alert('Error', userError.message);
      }
    }
    // This line is only reached if an error occurred.
    setLoading(false);
  }, [isLoaded, signIn, setActive, validateResetForm, code, password, setLoading, setFieldErrors, notificationAsync, showToast]);

  const updateEmail = useCallback(
    (value: string) => {
      setEmailAddress(value);
      clearError('emailAddress');
    },
    [clearError]
  );

  const updateField = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string>>, field: string, value: string) => {
      setter(value);
      clearError(field);
    },
    [clearError]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync]);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [impactAsync]);

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

  const handleBackPress = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/sign-in');
    }
  }, [impactAsync]);

  return (
    <>
      <StatusBar style="light" translucent />
      <MeshBackgroundGlow
        colors={onboardingTheme.intro.meshBackground}
        glowColors={onboardingTheme.final.meshBackground.map(color => [color, 'transparent']) as [string, string][]}
        glowDurations={[8000, 10000, 12000]}
      />
      <View style={[styles.safeArea, {paddingTop: insets.top}]}>
        <View style={styles.headerContainer}>
          <AnimatedButton style={sharedStyles.headerButtonDark} onPress={handleBackPress} hapticType="light">
            <Ionicons name="arrow-back" size={responsiveSizes.fontSize + 2} color="#FFFFFF" />
          </AnimatedButton>
          <Link href="/(auth)/sign-in" asChild>
            <AnimatedButton style={sharedStyles.headerButtonDark} hapticType="light">
              <Text style={sharedStyles.headerButtonText}>Sign In</Text>
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
              <View>
                {!pendingReset ? (
                  <>
                    <Text style={sharedStyles.title} allowFontScaling={false}>
                      Forgot your password?
                    </Text>
                    <Text style={sharedStyles.subtitle} allowFontScaling={false}>
                      Don’t worry, we’ll get you back on track in seconds.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={sharedStyles.title} allowFontScaling={false}>
                      Reset and Restart
                    </Text>
                    <Text style={sharedStyles.subtitle} allowFontScaling={false}>
                      Enter the code sent to <Text style={styles.emailHighlight}>{emailAddress}</Text> and create a new
                      password.
                    </Text>
                  </>
                )}
              </View>

              {!pendingReset ? (
                // Step 1: Enter Email
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
                        value={emailAddress}
                        onChangeText={updateEmail}
                        onFocus={() => handleFieldFocus('emailAddress')}
                        onBlur={handleFieldBlur}
                        style={sharedStyles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        returnKeyType="done"
                        onSubmitEditing={onSendResetEmailPress}
                        allowFontScaling={false}
                      />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.emailAddress} />

                  <GradientButton
                    onPress={onSendResetEmailPress}
                    loading={loading}
                    style={{marginTop: responsiveSizes.verticalSpacing}}>
                    <Text style={sharedStyles.gradientButtonText} allowFontScaling={false}>
                      Send Reset Link
                    </Text>
                  </GradientButton>
                </View>
              ) : (
                // Step 2: Enter Code and New Password
                <View>
                  <TouchableWithoutFeedback onPress={() => codeInputRef.current?.focus()}>
                    <Animated.View style={[sharedStyles.inputWrapper, codeAnimatedStyle]}>
                      <Ionicons
                        name="keypad"
                        size={responsiveSizes.fontSize}
                        color="#FFFFFF"
                        style={sharedStyles.inputIcon}
                      />
                      <AnimatedTextInput
                        ref={codeInputRef}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={code}
                        onChangeText={text => updateField(setCode, 'code', text)}
                        onFocus={() => handleFieldFocus('code')}
                        onBlur={handleFieldBlur}
                        style={sharedStyles.input}
                        keyboardType="number-pad"
                        maxLength={6}
                        returnKeyType="next"
                        allowFontScaling={false}
                      />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.code} />

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
                        placeholder="New password"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={password}
                        onChangeText={text => updateField(setPassword, 'password', text)}
                        onFocus={() => handleFieldFocus('password')}
                        onBlur={handleFieldBlur}
                        style={sharedStyles.input}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        textContentType="newPassword"
                        returnKeyType="next"
                        allowFontScaling={false}
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
                        placeholder="Confirm new password"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={confirmPassword}
                        onChangeText={text => updateField(setConfirmPassword, 'confirmPassword', text)}
                        onFocus={() => handleFieldFocus('confirmPassword')}
                        onBlur={handleFieldBlur}
                        style={sharedStyles.input}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        textContentType="newPassword"
                        returnKeyType="done"
                        onSubmitEditing={onResetPasswordPress}
                        allowFontScaling={false}
                      />
                      <PasswordToggle showPassword={showConfirmPassword} onToggle={toggleConfirmPasswordVisibility} />
                    </Animated.View>
                  </TouchableWithoutFeedback>
                  <ErrorMessage message={errors.confirmPassword} />

                  <GradientButton
                    onPress={onResetPasswordPress}
                    loading={loading}
                    style={{marginTop: responsiveSizes.verticalSpacing}}>
                    <Text style={sharedStyles.gradientButtonText} allowFontScaling={false}>
                      Reset Password
                    </Text>
                  </GradientButton>
                </View>
              )}

              {/* This block ensures the layout is consistent between the two steps */}
              {pendingReset ? (
                <View /> // Placeholder to maintain the 'space-between' layout
              ) : (
                <View style={styles.linkContainer}>
                  <Text style={styles.linkText} allowFontScaling={false}>
                    Remembered your password?{' '}
                  </Text>
                  <Text
                    style={styles.linkTextBold}
                    onPress={() => {
                      impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.replace('/(auth)/sign-in');
                    }}>
                    Sign In
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingTop: responsiveSizes.verticalSpacing * 3,
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
  emailHighlight: {
    color: '#22c55e',
    fontFamily: 'Inter_600SemiBold',
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
});

export default ForgotPasswordScreen;
