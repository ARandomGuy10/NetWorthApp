import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createAccount, ACCOUNT_CATEGORIES, CURRENCIES } from '../src/services/accountService';
import { useSupabase } from '../hooks/useSupabase';

export default function AddAccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { supabase } = useSupabase();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'asset',
    category: '',
    currency: 'EUR',
    institution: '',
    initial_balance: '',
    include_in_net_worth: true
  });
  
  const [loading, setLoading] = useState(false);

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

  const availableCategories = ACCOUNT_CATEGORIES[formData.type] || [];

  if (!supabase) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Connecting...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Account</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
        </TouchableOpacity>
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
            placeholderTextColor="#8E8E93"
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
            >
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
            >
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              style={styles.picker}
              dropdownIconColor="#8E8E93"
              enabled={!loading}
            >
              <Picker.Item label="Select a category" value="" color="#8E8E93" />
              {availableCategories.map((category) => (
                <Picker.Item
                  key={category}
                  label={category}
                  value={category}
                  color="#FFFFFF"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
              style={styles.picker}
              dropdownIconColor="#8E8E93"
              enabled={!loading}
            >
              {CURRENCIES.map((currency) => (
                <Picker.Item
                  key={currency}
                  label={currency}
                  value={currency}
                  color="#FFFFFF"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Initial Balance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Initial Balance</Text>
          <TextInput
            style={styles.textInput}
            value={formData.initial_balance}
            onChangeText={(text) => setFormData({ ...formData, initial_balance: text })}
            placeholder="0.00"
            placeholderTextColor="#8E8E93"
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        {/* Bank/Institution */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank/Institution</Text>
          <TextInput
            style={styles.textInput}
            value={formData.institution}
            onChangeText={(text) => setFormData({ ...formData, institution: text })}
            placeholder="Optional"
            placeholderTextColor="#8E8E93"
            editable={!loading}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Account</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  pickerContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});