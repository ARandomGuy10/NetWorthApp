import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Settings, ChevronDown, Calendar, CalendarDays } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from './services/supabase';

interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  institution: string;
}

export default function RecordBalance() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    }
  };

  const handleSaveEntry = async () => {
    if (!selectedAccount || !amount) {
      Alert.alert('Error', 'Please select an account and enter an amount');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in to record balances');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('balance_entries')
        .insert([
          {
            account_id: selectedAccount,
            amount: parseFloat(amount),
            date,
            notes,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Balance recorded successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving balance entry:', error);
      Alert.alert('Error', 'Failed to save balance entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <ChevronLeft size={24} color="#F9FAFB" />
        </TouchableOpacity>
        <Text style={styles.title}>Record Balance</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Select Account */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Account</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {selectedAccount ? 
                accounts.find(a => a.id === selectedAccount)?.name || 'Choose an account' :
                'Choose an account'
              }
            </Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <View style={styles.dateIcons}>
              <Calendar size={20} color="#9CA3AF" />
              <CalendarDays size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.currencyInput}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.balanceInput}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional notes about this balance entry..."
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveEntry}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Entry'}
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
  dateInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dateText: {
    fontSize: 16,
    color: '#F9FAFB',
  },
  dateIcons: {
    flexDirection: 'row',
    gap: 8,
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
  notesInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
    height: 100,
    textAlignVertical: 'top',
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