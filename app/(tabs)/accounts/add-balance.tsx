import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAccounts } from '@/hooks/useAccounts';
import { useAddBalance, useUpdateBalance } from '@/hooks/useBalances';
import { useToast } from '@/hooks/providers/ToastProvider';
import CustomPicker from '@/components/ui/CustomPicker';
import DatePicker from '@/components/ui/DatePicker';
import { Balance, Theme } from '@/lib/supabase';
import { useTheme } from '@/src/styles/theme/ThemeContext';

export default function AddBalanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accountId, balanceId, mode, balanceData } = useLocalSearchParams();
  const { showToast } = useToast();
   const { theme } = useTheme();
   const styles = getStyles(theme);

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const addBalanceMutation = useAddBalance();
  const updateBalanceMutation = useUpdateBalance();

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    account_id: (accountId as string) || '',
    amount: '',
    date: getLocalDateString(new Date()),
    notes: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const isEditMode = mode === 'edit' && balanceId;

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

  useEffect(() => {
    if (!accountsLoading) {
      loadInitialData();
    }
  }, [accountsLoading, accounts, isEditMode, balanceId]);

  const loadInitialData = () => {
    try {
      setInitialLoading(true);

      if (isEditMode && typeof balanceData === 'string') {
        const parsedBalance = JSON.parse(balanceData);
        const account = accounts?.find(acc => acc.id === parsedBalance.account_id);
        setSelectedAccount(account);
        setFormData({
          account_id: parsedBalance.account_id,
          amount: parsedBalance.amount.toString(),
          date: parsedBalance.date,
          notes: parsedBalance.notes || '',
        });
      } else if (accountId && accounts) {
        const account = accounts.find(acc => acc.id === accountId);
        setSelectedAccount(account);
        setFormData(prev => ({ ...prev, account_id: accountId as string }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.account_id) {
      showToast('Please select an account', 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) < 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!formData.date) {
      showToast('Please select a date', 'error');
      return;
    }

    // New validation: Prevent future dates
    const selectedDate = new Date(`${formData.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison

    if (selectedDate > today) {
      showToast('Cannot record a balance for a future date.', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const balancePayload: Omit<Balance, 'id' | 'created_at' | 'updated_at'> = {
      account_id: formData.account_id,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes.trim(),
    };

    try {
      if (isEditMode) {
        await updateBalanceMutation.mutateAsync({
          id: balanceId as string,
          updates: balancePayload,
        });
      } else {
        await addBalanceMutation.mutateAsync(balancePayload);
      }
      router.back();
    } catch (error) {
      // Errors are handled by the mutation's onError callback
      console.error('Save operation failed', error);
    }
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts?.find(acc => acc.id === accountId);
    setSelectedAccount(account);
    setFormData({ ...formData, account_id: accountId });
  };

  const accountOptions = accounts?.map(account => ({
    label: `${account.name} (${account.currency})`,
    value: account.id,
  })) || [];

  const loading = addBalanceMutation.isPending || updateBalanceMutation.isPending || initialLoading;

  if (initialLoading || accountsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Balance' : 'Record Balance'}</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + theme.spacing.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>            
            {isEditMode && selectedAccount ? (
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{selectedAccount.name}</Text>
                <Text style={styles.accountMeta}>
                  {selectedAccount.type === 'asset' ? 'Asset' : 'Liability'} · {selectedAccount.category}
                </Text>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account</Text>
                <CustomPicker
                  // Use a more descriptive placeholder when no account is pre-selected
                  placeholder={!accountId ? "Select an account" : (accounts?.find(a => a.id === accountId)?.name || "Select an account")}
                  value={formData.account_id}
                  onValueChange={handleAccountChange}
                  items={accountOptions}
                  disabled={loading || !!accountId}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                disabled={loading}
              />
              <Text style={styles.helperText}>
                Only one balance entry per date is allowed.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>{selectedAccount?.currency || ''}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="decimal-pad"
                  editable={!loading}
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.helperText}>Enter the total balance (always positive).</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Optional"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                editable={!loading}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.saveButtonText}>{isEditMode ? 'Update Entry' : 'Save Entry'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, loading && { opacity: 0.5 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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
    paddingTop: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  accountInfo: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  accountMeta: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 52,
    ...theme.shadows.sm,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.lg,
  },
  notesInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    ...theme.shadows.sm,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.xs,
  },
  buttonContainer: {
    marginTop: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  cancelButton: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
});
