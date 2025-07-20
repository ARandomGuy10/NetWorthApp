import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Settings, ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from './services/supabase';

export default function AddAccount() {
  const { user } = useUser();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'asset' | 'liability'>('asset');
  const [category, setCategory] = useState('');
  const [institution, setInstitution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAccount = async () => {
    if (!accountName || !category) {
      Alert.alert('Error', 'Please fill in account name and category');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to add accounts');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('accounts')
        .insert([
          {
            name: accountName,
            type: accountType,
            category,
            institution,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving account:', error);
      Alert.alert('Error', 'Failed to save account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <ChevronLeft size={24} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Account</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Account Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chase Checking, Vanguard IRA"
            placeholderTextColor="#6B7280"
            value={accountName}
            onChangeText={setAccountName}
          />
        </View>

        {/* Account Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                accountType === 'asset' && styles.typeButtonActive
              ]}
              onPress={() => setAccountType('asset')}
            >
              <Text style={[
                styles.typeButtonText,
                accountType === 'asset' && styles.typeButtonTextActive
              ]}>
                Asset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                accountType === 'liability' && styles.typeButtonActive
              ]}
              onPress={() => setAccountType('liability')}
            >
              <Text style={[
                styles.typeButtonText,
                accountType === 'liability' && styles.typeButtonTextActive
              ]}>
                Liability
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {category || 'Select a category'}
            </Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Initial Balance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Balance</Text>
          <View style={styles.currencyInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.balanceInput}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Bank/Institution */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank/Institution</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Chase, Vanguard, etc."
            placeholderTextColor="#6B7280"
            value={institution}
            onChangeText={setInstitution}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAccount}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Account'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  typeButtonActive: {
    backgroundColor: '#4FD1C7',
    borderColor: '#4FD1C7',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  typeButtonTextActive: {
    color: '#111827',
  },
  dropdown: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dropdownText: {
    fontSize: 16,
    color: '#6B7280',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#F9FAFB',
    marginRight: 8,
  },
  balanceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#4FD1C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});