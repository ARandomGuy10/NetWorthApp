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
  console.log('AddAccountScreen rendered');
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Only prefill once per edit session
  const didPrefillRef = useRef(false);

  // Load existing account data for edit mode
  useEffect(() => {
    console.log('isEditMode: ' + isEditMode);
    if (isEditMode && accountData && !didPrefillRef.current) {
      try {
        const parsedData = JSON.parse(accountData as string);
        console.log('Parsed account data:', parsedData);
        setFormData({
          name: parsedData.account_name || '',
          type: parsedData.account_type || 'asset',
          category: parsedData.category || '',
          currency: parsedData.currency || 'EUR',
          institution: parsedData.institution || '',
          initial_balance: '', // Don't pre-fill balance for edit
          include_in_net_worth: parsedData.include_in_net_worth !== false,
        });
        didPrefillRef.current = true;
      } catch (error) {
        console.error('Error parsing account data:', error);
      } finally {
        setInitialLoading(false);
      }
    }
  }, [isEditMode, accountData]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      if (isEditMode) {
        // Update existing account
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
        setTimeout(() => router.back(), 1500);
      } else {
        // Create new account with initial balance
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
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setToast({
        visible: true,
        message: `Failed to ${isEditMode ? 'update' : 'create'} account. Please try again.`,
        type: 'error'
      });
    }
  };

  const availableCategories = (ACCOUNT_CATEGORIES[formData.type] || []).map(cat => ({
    label: cat,
    value: cat
  }));

  const currencyOptions = CURRENCIES.map(currency => ({
    label: currency,
    value: currency
  }));

  const loading = addAccountMutation.isPending || updateAccountMutation.isPending;

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Account' : 'Add Account'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Chase Checking, Vanguard IRA"
            placeholderTextColor={colors.text.secondary}
            editable={!loading}
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
              onPress={() => setFormData({ ...formData, type: 'asset', category: '' })}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="trending-up" 
                size={20} 
                color={formData.type === 'asset' ? colors.text.inverse : colors.text.secondary} 
                style={styles.iconSpacing} 
              />
              <Text style={[
                styles.typeButtonText,
                formData.type === 'asset' ? styles.typeButtonTextActive : styles.typeButtonTextInactive
              ]}>
                Asset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'liability' ? styles.typeButtonActive : styles.typeButtonInactive
              ]}
              onPress={() => setFormData({ ...formData, type: 'liability', category: '' })}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="trending-down" 
                size={20} 
                color={formData.type === 'liability' ? colors.text.inverse : colors.text.secondary} 
                style={styles.iconSpacing} 
              />
              <Text style={[
                styles.typeButtonText,
                formData.type === 'liability' ? styles.typeButtonTextActive : styles.typeButtonTextInactive
              ]}>
                Liability
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <CustomPicker
            selectedValue={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            items={availableCategories}
            placeholder="Select a category"
            disabled={loading}
          />
        </View>

        {/* Currency & Initial Balance Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.halfWidth, styles.inputGroup]}>
            <Text style={styles.label}>Currency</Text>
            <CustomPicker
              selectedValue={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
              items={currencyOptions}
              disabled={loading}
            />
          </View>
          {!isEditMode && (
            <View style={[styles.halfWidth, styles.inputGroup]}>
              <Text style={styles.label}>Initial Balance</Text>
              <TextInput
                style={styles.textInput}
                value={formData.initial_balance}
                onChangeText={(text) => setFormData({ ...formData, initial_balance: text })}
                placeholder="0.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          )}
        </View>

        {/* Bank/Institution */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank/Institution</Text>
          <TextInput
            style={styles.textInput}
            value={formData.institution}
            onChangeText={(text) => setFormData({ ...formData, institution: text })}
            placeholder="Optional"
            placeholderTextColor={colors.text.secondary}
            editable={!loading}
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
              onValueChange={(value) => setFormData({ ...formData, include_in_net_worth: value })}
              disabled={loading}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton, 
            loading && styles.saveButtonDisabled,
            { marginTop: spacing.xxxl, marginBottom: spacing.lg }
          ]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update Account' : 'Save Account'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { marginBottom: spacing.xxxl }]}
          onPress={() => router.back()}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast({ ...toast, visible: false })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholder: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  inputGroup: {
    marginTop: spacing.xxl,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 52,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
