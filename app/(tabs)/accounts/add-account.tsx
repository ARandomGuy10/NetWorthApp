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
import { useToast } from '@/hooks/providers/ToastProvider';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import CustomPicker from '@/components/ui/CustomPicker';
import Switch from '@/components/ui/Switch';
import { Theme } from '@/lib/supabase';

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accountId, mode, accountData, type: accountType } = useLocalSearchParams();
  const addAccountMutation = useAddAccount();
  const updateAccountMutation = useUpdateAccount();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
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
  const { showToast } = useToast();

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

  // Pre-fill account type from navigation parameter
  useEffect(() => {
    if (accountType && !isEditMode && !didPrefillRef.current) {
      if (accountType === 'asset' || accountType === 'liability') {
        setFormData(prev => ({ ...prev, type: accountType as 'asset' | 'liability' }));
        didPrefillRef.current = true;
      }
    }
  }, [accountType, isEditMode]);

  // Load existing account data for edit mode
  useEffect(() => {
    console.log("useEffect");
    if (isEditMode && accountData && !didPrefillRef.current) {
      try {
        const parsedData = typeof accountData === 'string' 
          ? JSON.parse(accountData) 
          : accountData;
        
        setFormData({
          name: parsedData.account_name || parsedData.name || '',
          type: parsedData.account_type || parsedData.type || 'asset',
          category: parsedData.category || '',
          currency: parsedData.currency || 'EUR',
          institution: parsedData.institution || '',
          initial_balance: '',
          include_in_net_worth: parsedData.include_in_net_worth,
        });
        
        didPrefillRef.current = true;
      } catch (error) {
        console.error('Error parsing account data:', error);
        showToast('Error loading account data', 'error');
      } finally {
        setInitialLoading(false);
      }
    }
  }, [isEditMode, accountData]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('Please enter an account name', 'error');
      return false;
    }
    
    if (!formData.category) {
      showToast('Please select a category', 'error');
      return false;
    }
    
    if (!isEditMode && formData.initial_balance && isNaN(parseFloat(formData.initial_balance))) {
      showToast('Please enter a valid initial balance', 'error');
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

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      showToast(`Failed to ${isEditMode ? 'update' : 'create'} account. Please try again.`, 'error');
      
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.min(insets.top + 8, 24)}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}          style={styles.headerButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Account' : 'Add Account'}
        </Text>
        
        <View style={styles.headerButton} />
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
              placeholderTextColor={theme.colors.text.secondary}
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
                  formData.type === 'asset'
                    ? { backgroundColor: theme.colors.asset, ...theme.shadows.sm }
                    : styles.typeButtonInactive,
                ]}
                onPress={() => handleTypeChange('asset')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trending-up"
                  size={16}
                  color={formData.type === 'asset' ? theme.colors.text.inverse : theme.colors.asset}
                  style={styles.iconSpacing}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'asset' 
                      ? styles.typeButtonTextActive 
                      : { color: theme.colors.asset }
                  ]}
                >
                  Asset
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'liability'
                    ? { backgroundColor: theme.colors.liability, ...theme.shadows.sm }
                    : styles.typeButtonInactive,
                ]}
                onPress={() => handleTypeChange('liability')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trending-down"
                  size={16}
                  color={formData.type === 'liability' ? theme.colors.text.inverse : theme.colors.liability}
                  style={styles.iconSpacing}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === 'liability' 
                      ? styles.typeButtonTextActive 
                      : { color: theme.colors.liability }
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
                  placeholderTextColor={theme.colors.text.secondary}
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
              placeholderTextColor={theme.colors.text.secondary}
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
                activeColor={theme.colors.primary}
                inactiveColor={theme.colors.border.secondary}
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
                <ActivityIndicator size="small" color={theme.colors.text.inverse} />
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

      
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
    minHeight: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  inputGroup: {
    marginTop: theme.spacing.xl,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  halfWidth: {
    flex: 1,
    marginTop: 0,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 52,
    ...theme.shadows.sm,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  typeButtonInactive: {
    backgroundColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  iconSpacing: {
    marginRight: theme.spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.sm,
  },
  switchLabel: {
    flex: 1,
    marginRight: theme.spacing.lg,
  },
  switchDescription: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  cancelButton: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  cancelButtonTextDisabled: {
    opacity: 0.5,
  },
});
