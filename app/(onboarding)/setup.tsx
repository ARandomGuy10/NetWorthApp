import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {router} from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';

import {
  GradientButton,
  useInputFocusAnimation,
  ErrorMessage,
  sharedStyles,
  responsiveSizes,
} from '@/components/auth/SharedAuthComponents';
import MeshBackgroundGlow from '@/components/ui/MeshBackgroundGlow';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';
import {useHaptics} from '@/hooks/useHaptics';
import {useUpdateProfile} from '@/hooks/useProfile';
import {CURRENCIES, ProfileUpdate} from '@/lib/supabase';
import OnboardingCurrencyPicker from '@/components/auth/OnboardingCurrencyPicker';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const InitialSetupScreen = () => {
  const insets = useSafeAreaInsets();
  const {impactAsync, selectionAsync, notificationAsync} = useHaptics();
  const {mutate: updateProfile, isPending: isUpdating} = useUpdateProfile();

  const [profileData, setProfileData] = useState<Partial<ProfileUpdate>>({
    first_name: '',
    last_name: '',
    preferred_currency: 'EUR',
  });
  const [errors, setErrors] = useState<{first_name?: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isCurrencyPickerVisible, setCurrencyPickerVisible] = useState(false);

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);

  const firstNameAnimatedStyle = useInputFocusAnimation(focusedField === 'firstName', !!errors.first_name);
  const lastNameAnimatedStyle = useInputFocusAnimation(focusedField === 'lastName');

  const TOP_CURRENCIES = ['EUR', 'GBP', 'INR', 'USD'];

  const validateForm = useCallback((): boolean => {
    const newErrors: {first_name?: string} = {};
    if (!profileData.first_name || profileData.first_name.trim() === '') {
      newErrors.first_name = 'Please enter your first name.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData.first_name]);

  const handleUpdate = (field: keyof typeof profileData, value: any) => {
    setProfileData(prev => ({...prev, [field]: value}));
    if (field === 'first_name') {
      clearError('first_name');
    }
    selectionAsync();
  };

  const handleFieldFocus = (field: string) => {
    setFocusedField(field);
    selectionAsync();
  };

  const handleFieldBlur = () => setFocusedField(null);
  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
    setFocusedField(null);
  };

  const onCompleteSetup = useCallback(() => {
    if (!validateForm()) {
      notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Keyboard.dismiss();

    updateProfile(
      {
        ...profileData,
        first_name: profileData.first_name?.trim(),
        last_name: profileData.last_name?.trim(),
        has_completed_onboarding: true,
      },
      {
        onSuccess: () => {
          router.replace('/(tabs)/dashboard');
        },
        onError: error => {
          console.error('Failed to update profile', error);
          // Optionally show an alert to the user
        },
      }
    );
  }, [profileData, updateProfile, impactAsync, validateForm, notificationAsync]);

  const onSkip = useCallback(() => {
    impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateProfile(
      {has_completed_onboarding: true},
      {
        onSuccess: () => {
          router.replace('/(tabs)/dashboard');
        },
      }
    );
  }, [updateProfile, impactAsync]);

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  return (
    <>
      <StatusBar style="light" translucent />
      <MeshBackgroundGlow
        colors={onboardingTheme.intro.meshBackground}
        glowColors={onboardingTheme.final.meshBackground.map(color => [color, 'transparent']) as [string, string][]}
        glowDurations={[8000, 10000, 12000]}
      />
      <View style={[styles.safeArea, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <TouchableWithoutFeedback onPress={handleDismissKeyboard}>
            <ScrollView
              contentContainerStyle={styles.scrollContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <Text style={styles.title}>One Last Step</Text>
                <Text style={styles.subtitle}>
                  Personalize your experience. You can always change this in your profile.
                </Text>
              </View>

              <View style={styles.formContainer}>
                <TouchableWithoutFeedback onPress={() => firstNameRef.current?.focus()}>
                  <Animated.View style={[sharedStyles.inputWrapper, firstNameAnimatedStyle]}>
                    <Ionicons name="person" size={responsiveSizes.fontSize} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      ref={firstNameRef}
                      placeholder="First Name"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.first_name || ''}
                      onChangeText={text => handleUpdate('first_name', text)}
                      onFocus={() => handleFieldFocus('firstName')}
                      onBlur={handleFieldBlur}
                      style={sharedStyles.input}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>
                <ErrorMessage message={errors.first_name} />

                <TouchableWithoutFeedback onPress={() => lastNameRef.current?.focus()}>
                  <Animated.View style={[sharedStyles.inputWrapper, lastNameAnimatedStyle]}>
                    <Ionicons name="person" size={responsiveSizes.fontSize} color="#FFFFFF" style={sharedStyles.inputIcon} />
                    <AnimatedTextInput
                      ref={lastNameRef}
                      placeholder="Last Name (Optional)"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={profileData.last_name || ''}
                      onChangeText={text => handleUpdate('last_name', text)}
                      onFocus={() => handleFieldFocus('lastName')}
                      onBlur={handleFieldBlur}
                      style={sharedStyles.input}
                      autoCapitalize="words"
                      returnKeyType="done"
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>

                <Text style={styles.currencyTitle}>Primary Currency</Text>
                <View style={styles.currencySection}>
                  <View style={styles.currencyRow}>
                    {TOP_CURRENCIES.map(currency => (
                      <TouchableOpacity
                        key={currency}
                        style={[
                          styles.currencyButton,
                          {flex: 1}, // Make buttons in the row expand equally
                          profileData.preferred_currency === currency && styles.currencyButtonSelected,
                        ]}
                        onPress={() => handleUpdate('preferred_currency', currency)}>
                        <Text
                          style={[
                            styles.currencyText,
                            profileData.preferred_currency === currency && styles.currencyTextSelected,
                          ]}>
                          {currency}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.currencyButton, // Reuse base style for appearance
                      !TOP_CURRENCIES.includes(profileData.preferred_currency || '') && styles.currencyButtonSelected,
                    ]}
                    onPress={() => setCurrencyPickerVisible(true)}>
                    <Text
                      style={[
                        styles.currencyText,
                        !TOP_CURRENCIES.includes(profileData.preferred_currency || '') && styles.currencyTextSelected,
                      ]}>
                      {TOP_CURRENCIES.includes(profileData.preferred_currency || '')
                        ? 'Other...'
                        : profileData.preferred_currency}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footer}>
                <GradientButton onPress={onCompleteSetup} loading={isUpdating}>
                  <Text style={sharedStyles.gradientButtonText}>Let's Go!</Text>
                </GradientButton>
                <TouchableOpacity onPress={onSkip} disabled={isUpdating}>
                  <Text style={styles.skipText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
      <OnboardingCurrencyPicker
        isVisible={isCurrencyPickerVisible}
        onClose={() => setCurrencyPickerVisible(false)}
        currentValue={profileData.preferred_currency || 'EUR'}
        onSave={currency => handleUpdate('preferred_currency', currency)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1},
  keyboardAvoidingView: {flex: 1},
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
  },
  header: {paddingTop: responsiveSizes.verticalSpacing * 4},
  title: {...sharedStyles.title, textAlign: 'center'},
  subtitle: {...sharedStyles.subtitle, textAlign: 'center', marginBottom: responsiveSizes.verticalSpacing * 3},
  formContainer: {gap: responsiveSizes.verticalSpacing * 1.5},
  currencyTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: responsiveSizes.subtitleSize,
    fontFamily: 'Inter_600SemiBold',
    marginTop: responsiveSizes.verticalSpacing,
    marginBottom: responsiveSizes.verticalSpacing * 0.5,
  },
  currencySection: {
    gap: 8,
    paddingBottom: 10, // Space for shadow
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyButton: {
    paddingHorizontal: 16, // Reduced horizontal padding
    paddingVertical: 10, // Reduced vertical padding
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyButtonSelected: {
    backgroundColor: onboardingTheme.colors.primary,
    borderColor: onboardingTheme.colors.primaryLight,
    shadowColor: onboardingTheme.colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  currencyText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_500Medium',
    fontSize: responsiveSizes.fontSize - 2, // Make font a bit smaller
  },
  currencyTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  footer: {paddingVertical: responsiveSizes.verticalSpacing * 2, gap: responsiveSizes.verticalSpacing * 1.5},
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: responsiveSizes.fontSize,
  },
});

export default InitialSetupScreen;
