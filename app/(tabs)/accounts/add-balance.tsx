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

import { useAccounts } from '../../../hooks/useAccounts';
import { useAddBalance, useUpdateBalance, useBalances } from '../../../hooks/useBalances';
import { formatCurrency } from '../../../utils/utils';
import { colors, spacing, borderRadius, shadows } from '../../../src/styles/colors';
import CustomPicker from '../../../components/ui/CustomPicker';
import DatePicker from '../../../components/ui/DatePicker';
import Toast from '../../../components/ui/Toast';
import { Balance } from '@/lib/supabase';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export default function AddBalanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accountId, balanceId, mode } = useLocalSearchParams();

  const { data: accounts } = useAccounts();
  const addBalanceMutation = useAddBalance();
  const updateBalanceMutation = useUpdateBalance();

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    account_id: (accountId as string) || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ 
    visible: false, 
    message: '', 
    type: 'success' 
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isEditMode = mode === 'edit' && balanceId;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [accounts, isEditMode, balanceId]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);

      // If we have an accountId, set it as selected
      if (accountId && accounts) {
        const account = accounts.find(acc => acc.id === accountId);
        setSelectedAccount(account);
        setFormData(prev => ({ ...prev, account_id: accountId as string }));
      }

      // If editing, load the balance entry data
      if (isEditMode && balanceId) {
        // You would fetch balance data here if needed
        // For now, we'll handle this case when you implement balance fetching by ID
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  };

  const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Cash': 'cash-outline',
      'Checking': 'card-outline',
      'Savings': 'wallet-outline',
      'Investment': 'trending-up-outline',
      'Retirement': 'shield-outline',
      'Real Estate': 'home-outline',
      'Vehicle': 'car-outline',
      'Credit Card': 'card-outline',
      'Personal Loan': 'document-text-outline',
      'Mortgage': 'home-outline',
      'Auto Loan': 'car-outline',
      'Student Loan': 'school-outline',
    };
    return iconMap[category] || 'ellipse-outline';
  };

  const handleSave = async () => {
    if (!formData.account_id) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    try {
      const balanceData : Omit<Balance, 'id' | 'created_at' | 'updated_at'> = {
        account_id: formData.account_id,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes.trim(),
      };

      if (isEditMode) {
        await updateBalanceMutation.mutateAsync({ 
          id: balanceId as string, 
          updates: balanceData 
        });
        Alert.alert('Success', 'Balance entry updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addBalanceMutation.mutateAsync(balanceData);
        setToast({
          visible: true,
          message: 'Balance entry created successfully!',
          type: 'success'
        });
        setTimeout(() => router.back(), 1500);
      }
    } catch (error: any) {
      console.error('Error saving balance entry:', error);
      if (error?.message?.includes('duplicate key')) {
        setToast({
          visible: true,
          message: 'A balance entry already exists for this date. Please choose a different date.',
          type: 'error'
        });
      } else {
        setToast({
          visible: true,
          message: 'Failed to save balance entry. Please try again.',
          type: 'error'
        });
      }
    }
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts?.find(acc => acc.id === accountId);
    setSelectedAccount(account);
    setFormData({ ...formData, account_id: accountId });
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const accountOptions = accounts?.map(account => ({
    label: `${account.name} (${account.currency})`,
    value: account.id
  })) || [];

  const loading = addBalanceMutation.isPending || updateBalanceMutation.isPending;

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Balance' : 'Record Balance'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Account Selection */}
        {!accountId && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Account</Text>
            <CustomPicker
              selectedValue={formData.account_id}
              onValueChange={handleAccountChange}
              items={accountOptions}
              placeholder="Select an account"
              disabled={loading}
            />
          </View>
        )}

        {/* Selected Account Info */}
        {selectedAccount && (
          <View style={styles.accountInfo}>
            <View style={styles.accountHeader}>
              <View style={[
                styles.accountIcon, 
                { backgroundColor: selectedAccount.type === 'asset' ? colors.asset : colors.liability }
              ]}>
                <Ionicons 
                  name={getAccountIcon(selectedAccount.category)} 
                  size={24} 
                  color="white" 
                />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{selectedAccount.name}</Text>
                <Text style={styles.accountMeta}>
                  {selectedAccount.type === 'asset' ? 'Asset' : 'Liability'} • {selectedAccount.category}
                </Text>
                <Text style={styles.currentBalance}>
                  Current: {formatCurrency(selectedAccount.latest_balance || 0, selectedAccount.currency)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
            disabled={loading}
          />
          <Text style={styles.helperText}>
            Note: Only one balance entry per date is allowed per account.
          </Text>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>
              {selectedAccount?.currency || 'EUR'}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              placeholder="0.00"
              placeholderTextColor={colors.text.secondary}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
          <Text style={styles.helperText}>
            Enter the total balance amount (always positive).
          </Text>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add any additional notes about this balance entry..."
            placeholderTextColor={colors.text.secondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update Entry' : 'Save Entry'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
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
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  accountInfo: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountMeta: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  currentBalance: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 52,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: spacing.lg,
    paddingRight: spacing.lg,
  },
  notesInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 80,
  },
  helperText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xxxl,
  },
  cancelButtonText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
