import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAddAccount, useUpdateAccount } from '@/hooks/useAccounts';
import { ACCOUNT_CATEGORIES, CURRENCIES } from '@/lib/supabase';
import { colors, spacing, borderRadius, shadows } from '@/src/styles/colors';
import CustomPicker from '@/components/ui/CustomPicker';
import Switch from '@/components/ui/Switch';
import Toast from '@/components/ui/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accountId, mode, accountData } = useLocalSearchParams();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  
  const isEditMode = mode === 'edit' && accountId;

  const [formData, setFormData] = useState({
    name: '',
    type: 'asset' as 'asset' | 'liability',
    category: '',
    currency: 'EUR',
    institution: '',
    initial_balance: '',
    include_in_net_worth: true,
  });

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success'
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const didPrefillRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load existing account data for edit mode
  useEffect(() => {
    if (isEditMode && accountData && !didPrefillRef.current) {
      try {
        const parsedData = typeof accountData === 'string' 
          ? JSON.parse(accountData) 
          : accountData;
        
        setFormData({
          name: parsedData.account_name || '',
          type: parsedData.account_type || 'asset',
          category: parsedData.category || '',
          currency: parsedData.currency || 'EUR',
          institution: parsedData.institution || '',
          initial_balance: '',
          include_in_net_worth: parsedData.include_in_net_worth !== false,
        });
        
        didPrefillRef.current = true;
      } catch (error) {
        console.error('Error parsing account data:', error);
        setToast({
          visible: true,
          message: 'Error loading account data',
          type: 'error'
        });
      } finally {
        setInitialLoading(false);
      }
    }
  }, [isEditMode, accountData]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setToast({
        visible: true,
        message: 'Please enter an account name',
        type: 'error'
      });
      return false;
    }
    
    if (!formData.category) {
      setToast({
        visible: true,
        message: 'Please select a category',
        type: 'error'
      });
      return false;
    }
    
    if (!isEditMode && formData.initial_balance && isNaN(parseFloat(formData.initial_balance))) {
      setToast({
        visible: true,
        message: 'Please enter a valid initial balance',
        type: 'error'
      });
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isEditMode) {
        const saveData = {
          name: formData.name.trim(),
          type: formData.type,
          category: formData.category,
          currency: formData.currency,
          institution: formData.institution.trim() || null,
          include_in_net_worth: formData.include_in_net_worth,
        };

        await updateAccountMutation.mutateAsync({
          id: accountId as string,
          updates: saveData
        });

        setToast({
          visible: true,
          message: 'Account updated successfully!',
          type: 'success'
        });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.back(), 1500);
      } else {
        const accountWithBalance = {
          name: formData.name.trim(),
          type: formData.type,
          category: formData.category,
          currency: formData.currency,
          institution: formData.institution.trim() || null,
          include_in_net_worth: formData.include_in_net_worth,
          initial_balance: parseFloat(formData.initial_balance) || 0
        };

        await addAccountMutation.mutateAsync(accountWithBalance);

        setToast({
          visible: true,
          message: 'Account created successfully!',
          type: 'success'
        });
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setToast({
        visible: true,
        message: `Failed to ${isEditMode ? 'update' : 'create'} account. Please try again.`,
        type: 'error'
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleTypeChange = (type: 'asset' | 'liability') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFormData({ ...formData, type, category: '' });
  };

  const availableCategories = (ACCOUNT_CATEGORIES[formData.type] || []).map(cat => ({
    label: cat,
    value: cat
  }));

  const currencyOptions = CURRENCIES.map(currency => ({
    label: currency,
    value: currency
  }));

  
  const loading = addAccountMutation.isPending || updateAccountMutation.isPending || initialLoading;
  // Make sure loading is always a boolean
  const isLoading = Boolean(loading);

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Account' : 'Add Account'}
        </Text>
        
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.ScrollView 
          style={[styles.scrollView, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name *</Text>
            <TextInput
              style={[styles.textInput, loading && styles.textInputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Chase Checking, Vanguard IRA"
              placeholderTextColor={colors.text.secondary}
              editable={!loading}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Account Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'asset' ? styles.typeButtonActive : styles.typeButtonInactive
                ]}
                onPress={() => handleTypeChange('asset')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trending-up"
                  size={16}
                  color={formData.type === 'asset' ? colors.text.inverse : colors.asset}
                  style={styles.iconSpacing}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'asset' ? styles.typeButtonTextActive : styles.typeButtonTextInactive
                  ]}
                >
                  Asset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'liability' ? styles.typeButtonActive : styles.typeButtonInactive
                ]}
                onPress={() => handleTypeChange('liability')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trending-down"
                  size={16}
                  color={formData.type === 'liability' ? colors.text.inverse : colors.liability}
                  style={styles.iconSpacing}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'liability' ? styles.typeButtonTextActive : styles.typeButtonTextInactive
                  ]}
                >
                  Liability
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <CustomPicker
              value={formData.category}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFormData({ ...formData, category: value });
              }}
              items={availableCategories}
              placeholder="Select a category"
              disabled={isLoading}
            />
          </View>

          {/* Currency & Initial Balance Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Currency</Text>
              <CustomPicker
                value={formData.currency}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormData({ ...formData, currency: value });
                }}
                items={currencyOptions}
                disabled={isLoading}
              />
            </View>

            {!isEditMode && (
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Initial Balance</Text>
                <TextInput
                  style={[styles.textInput, loading && styles.textInputDisabled]}
                  value={formData.initial_balance}
                  onChangeText={(text) => setFormData({ ...formData, initial_balance: text })}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="decimal-pad"
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>
            )}
          </View>

          {/* Bank/Institution */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank/Institution</Text>
            <TextInput
              style={[styles.textInput, loading && styles.textInputDisabled]}
              value={formData.institution}
              onChangeText={(text) => setFormData({ ...formData, institution: text })}
              placeholder="Optional"
              placeholderTextColor={colors.text.secondary}
              editable={!loading}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {/* Include in Net Worth */}
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>Include in Net Worth</Text>
                <Text style={styles.switchDescription}>
                  Include this account when calculating your total net worth
                </Text>
              </View>
              <Switch
                value={formData.include_in_net_worth}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormData({ ...formData, include_in_net_worth: value });
                }}
                disabled={isLoading}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Update Account' : 'Save Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, isLoading && styles.cancelButtonTextDisabled]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  inputGroup: {
    marginTop: spacing.xl,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  halfWidth: {
    flex: 1,
    marginTop: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 52,
    ...shadows.sm,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  typeButtonInactive: {
    backgroundColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.text.inverse,
  },
  typeButtonTextInactive: {
    color: colors.text.secondary,
  },
  iconSpacing: {
    marginRight: spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.sm,
  },
  switchLabel: {
    flex: 1,
    marginRight: spacing.lg,
  },
  switchDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    ...shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  cancelButtonTextDisabled: {
    opacity: 0.5,
  },
});
