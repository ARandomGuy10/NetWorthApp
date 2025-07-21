import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import { // Added Animated
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
  Animated // Import Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createAccount, ACCOUNT_CATEGORIES, CURRENCIES } from '../src/services/accountService';
import { useSupabase } from '../hooks/useSupabase';
import { colors, spacing, borderRadius, shadows } from '../src/styles/colors';
import CustomPicker from '../components/ui/CustomPicker';
import Switch from '../components/ui/Switch';

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const supabase = useSupabase();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'asset',
    category: '',
    currency: 'EUR',
    institution: '',
    initial_balance: '',
    include_in_net_worth: true,
  });
  
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Use useRef for Animated.Value

  useEffect(() => { // Changed from React.useEffect to useEffect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    if (!supabase) {
      Alert.alert('Error', 'Database connection not available');
      return;
    }
    
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter an account name');
      return;
    }
    
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      const accountData = {
        ...formData,
        name: formData.name.trim(),
        institution: formData.institution.trim(),
        initial_balance: parseFloat(formData.initial_balance) || 0
      };

      await createAccount(supabase, accountData);
      
      Alert.alert('Success', 'Account created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
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

  if (!supabase) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    );
  }

  return ( // Corrected: Main return statement for the component
    <Animated.View style={[styles.container, { paddingTop: insets.top, opacity: fadeAnim }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <Text style={styles.headerTitle}>Add Account</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  formData.type === 'asset' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, type: 'asset', category: '' })}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="trending-up" 
                  size={16} 
                  color={formData.type === 'asset' ? colors.text.inverse : colors.text.secondary} 
                  style={styles.typeIcon}
                />
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'asset' && styles.typeButtonTextActive
                ]}>
                  Asset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'liability' && styles.typeButtonActive
                ]}
                onPress={() => setFormData({ ...formData, type: 'liability', category: '' })}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="trending-down" 
                  size={16} 
                  color={formData.type === 'liability' ? colors.text.inverse : colors.text.secondary} 
                  style={styles.typeIcon}
                />
                <Text style={[
                  styles.typeButtonText,
                  formData.type === 'liability' && styles.typeButtonTextActive
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
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Currency</Text>
              <CustomPicker
                selectedValue={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                items={currencyOptions}
                disabled={loading}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
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
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.saveButtonText}>Save Account</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
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
    marginTop: spacing.xxl,
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
  typeIcon: {
    marginRight: spacing.sm,
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.text.inverse,
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
