// sign-up.tsx (FIXED keyboard, animations, and styling)
import React, {useEffect, useState} from 'react';
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
import {Link, router} from 'expo-router';
import Animated, {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSignUp} from '@clerk/clerk-expo';

import BackgroundGlow from '@/components/ui/BackgroundGlow';
import {
  AnimatedButton,
  ErrorMessage,
  SocialButton,
  GradientButton,
  useInputFocusAnimation, // NEW hook for animations
  sharedStyles,
} from '@/components/auth/SharedAuthComponents';
import {SignUpCredentials, VerificationData, FormErrors} from '@/src/types/auth';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useAuthForm} from '@/hooks/useAuthForm';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const SignUpScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {isLoaded, signUp, setActive} = useSignUp();

  // Simplified form state (removed lastName as per reference)
  const [credentials, setCredentials] = useState({
    firstName: '',
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

  // Animation styles for each input using the new hook
  const firstNameAnimatedStyle = useInputFocusAnimation(focusedField === 'firstName');
  const emailAnimatedStyle = useInputFocusAnimation(focusedField === 'emailAddress');
  const passwordAnimatedStyle = useInputFocusAnimation(focusedField === 'password');
  const confirmPasswordAnimatedStyle = useInputFocusAnimation(focusedField === 'confirmPassword');
  const codeAnimatedStyle = useInputFocusAnimation(focusedField === 'code');

  const {loading, setLoading, socialLoading, errors, clearError, setFieldErrors, handleOAuth} = useAuthForm();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!credentials.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!credentials.emailAddress) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(credentials.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email.';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required.';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignUpPress = async (): Promise<void> => {
    if (!isLoaded || !validateForm()) return;

    setLoading(true);
    try {
      await signUp.create({
        firstName: credentials.firstName,
        emailAddress: credentials.emailAddress,
        password: credentials.password,
      });
      await signUp.prepareEmailAddressVerification({strategy: 'email_code'});
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.errors?.[0]?.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async (): Promise<void> => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      await setActive({session: completeSignUp.createdSessionId});
      router.replace('/(main)');
    } catch (err: any) {
      Alert.alert('Verification Error', err.errors?.[0].message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const updateCredentials = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({...prev, [field]: value}));
    clearError(field);
  };

  const updateVerification = (field: keyof VerificationData, value: string) => {
    setVerification(prev => ({...prev, [field]: value}));
  };

  return (
    <LinearGradient colors={['#0a1120', '#112a52', '#1a4e8d']} style={styles.container}>
      <BackgroundGlow />
      <View style={[styles.safeArea, {paddingTop: insets.top}]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <AnimatedButton style={sharedStyles.headerButtonDark} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </AnimatedButton>

          <Link href="/(auth)/sign-in" asChild>
            <AnimatedButton style={sharedStyles.headerButtonDark}>
              <Text style={sharedStyles.headerButtonText}>Login</Text>
            </AnimatedButton>
          </Link>
        </View>

        {/* FIXED: Proper KeyboardAvoidingView setup */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setFocusedField(null); // Clear focus when dismissing keyboard
            }}>
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              keyboardShouldPersistTaps="never" // CHANGED from 'handled' to 'never'
              showsVerticalScrollIndicator={false}>
              {!pendingVerification ? (
                <>
                  {/* Left-aligned titles */}
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Create your account for daily updates.</Text>

                  {/* First Name Input with FIXED styling and animation */}
                  <Animated.View style={[sharedStyles.inputWrapper, firstNameAnimatedStyle]}>
                    <Ionicons name="person" size={20} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      placeholder="Enter your first name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={credentials.firstName}
                      onChangeText={text => updateCredentials('firstName', text)}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      style={sharedStyles.input}
                      autoCapitalize="words"
                      autoCorrect={false}
                      textContentType="givenName"
                    />
                  </Animated.View>
                  <ErrorMessage message={errors.firstName} />

                  {/* Email Input with FIXED styling and animation */}
                  <Animated.View style={[sharedStyles.inputWrapper, emailAnimatedStyle]}>
                    <Ionicons name="mail" size={20} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={credentials.emailAddress}
                      onChangeText={text => updateCredentials('emailAddress', text)}
                      onFocus={() => setFocusedField('emailAddress')}
                      onBlur={() => setFocusedField(null)}
                      style={sharedStyles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                    />
                  </Animated.View>
                  <ErrorMessage message={errors.emailAddress} />

                  {/* Password Input with FIXED styling and animation */}
                  <Animated.View style={[sharedStyles.inputWrapper, passwordAnimatedStyle]}>
                    <Ionicons name="lock-closed" size={20} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      placeholder="Enter your Password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={credentials.password}
                      onChangeText={text => updateCredentials('password', text)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      style={sharedStyles.input}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                    />
                    <AnimatedButton onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="rgba(255,255,255,0.5)" />
                    </AnimatedButton>
                  </Animated.View>
                  <ErrorMessage message={errors.password} />

                  {/* Confirm Password Input with FIXED styling and animation */}
                  <Animated.View style={[sharedStyles.inputWrapper, confirmPasswordAnimatedStyle]}>
                    <Ionicons name="lock-closed" size={20} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      placeholder="Confirm your Password"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={credentials.confirmPassword}
                      onChangeText={text => updateCredentials('confirmPassword', text)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      style={sharedStyles.input}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                    />
                    <AnimatedButton onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={20}
                        color="rgba(255,255,255,0.5)"
                      />
                    </AnimatedButton>
                  </Animated.View>
                  <ErrorMessage message={errors.confirmPassword} />

                  {/* Gradient Create Account Button */}
                  <GradientButton onPress={onSignUpPress} loading={loading}>
                    <Text style={sharedStyles.gradientButtonText}>Create Account</Text>
                  </GradientButton>

                  {/* Divider */}
                  <View style={sharedStyles.dividerContainer}>
                    <View style={sharedStyles.dividerLine} />
                    <Text style={sharedStyles.dividerText}>Or</Text>
                    <View style={sharedStyles.dividerLine} />
                  </View>

                  {/* Social Buttons */}
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

                  {/* Already have account link */}
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>Already have an account? </Text>
                    <Link href="/(auth)/sign-in">
                      <Text style={styles.linkTextBold}>login</Text>
                    </Link>
                  </View>
                </>
              ) : (
                <>
                  {/* Verification Step */}
                  <Text style={styles.title}>Verify Your Email</Text>
                  <Text style={styles.subtitle}>We've sent a verification code to your email.</Text>

                  {/* Verification Code Input with FIXED styling and animation */}
                  <Animated.View style={[sharedStyles.inputWrapper, codeAnimatedStyle]}>
                    <Ionicons name="mail" size={20} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      placeholder="Verification Code"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={verification.code}
                      onChangeText={text => updateVerification('code', text)}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      style={sharedStyles.input}
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="oneTimeCode"
                    />
                  </Animated.View>

                  {/* Gradient Verify Button */}
                  <GradientButton onPress={onPressVerify} loading={loading}>
                    <Text style={sharedStyles.gradientButtonText}>Verify Email</Text>
                  </GradientButton>
                </>
              )}

              <View style={styles.spacer} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  // Left-aligned title with tighter spacing
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 4, // Reduced spacing
    textAlign: 'left', // Changed from center
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32, // Reduced spacing
    textAlign: 'left', // Changed from center
    lineHeight: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  linkTextBold: {
    color: '#22c55e',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  spacer: {
    height: 16,
  },
});

export default SignUpScreen;
