// sign-in.tsx (FIXED keyboard and animations)
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
import {useSignIn} from '@clerk/clerk-expo';

import BackgroundGlow from '@/components/ui/BackgroundGlow';
import {
  AnimatedButton,
  ErrorMessage,
  SocialButton,
  GradientButton,
  useInputFocusAnimation, // NEW hook
  sharedStyles,
} from '@/components/auth/SharedAuthComponents';
import {SignInCredentials, FormErrors} from '@/src/types/auth';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useAuthForm} from '@/hooks/useAuthForm';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const SignInScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {signIn, setActive, isLoaded} = useSignIn();

  const [credentials, setCredentials] = useState<SignInCredentials>({
    emailAddress: '',
    password: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation styles for each input
  const emailAnimatedStyle = useInputFocusAnimation(focusedField === 'emailAddress');
  const passwordAnimatedStyle = useInputFocusAnimation(focusedField === 'password');

  const {loading, setLoading, socialLoading, errors, clearError, setFieldErrors, handleOAuth} = useAuthForm();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!credentials.emailAddress) {
      newErrors.emailAddress = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(credentials.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email.';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required.';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSignInPress = async (): Promise<void> => {
    if (!isLoaded || !validateForm()) return;

    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: credentials.emailAddress,
        password: credentials.password,
      });
      await setActive({session: completeSignIn.createdSessionId});
    } catch (err: any) {
      Alert.alert('Sign In Error', err.errors?.[0]?.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const updateCredentials = (field: keyof SignInCredentials, value: string) => {
    setCredentials(prev => ({...prev, [field]: value}));
    clearError(field);
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

          <Link href="/(auth)/sign-up" asChild>
            <AnimatedButton style={sharedStyles.headerButtonDark}>
              <Text style={sharedStyles.headerButtonText}>Sign Up</Text>
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
              {/* Left-aligned titles */}
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to view daily mortgage updates.</Text>

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
                  textContentType="password"
                />
                <AnimatedButton onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="rgba(255,255,255,0.5)" />
                </AnimatedButton>
              </Animated.View>
              <ErrorMessage message={errors.password} />

              {/* Remember Me and Forgot Password */}
              <View style={styles.optionsContainer}>
                <AnimatedButton style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={12} color="#22c55e" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </AnimatedButton>

                <Link href="/(auth)/forgot-password">
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Link>
              </View>

              {/* Gradient Log In Button */}
              <GradientButton onPress={onSignInPress} loading={loading}>
                <Text style={sharedStyles.gradientButtonText}>Log In</Text>
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

              {/* Link to signup */}
              <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Don't have an account? </Text>
                <Link href="/(auth)/sign-up">
                  <Text style={styles.linkTextBold}>Create an account</Text>
                </Link>
              </View>

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
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
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
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#22c55e',
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

export default SignInScreen;
