import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme, AccountWithBalance } from '@/lib/supabase';
import DatePicker from '@/components/ui/DatePicker';

interface QuickEditSheetProps {
  isVisible: boolean;
  onClose: () => void;
  account: AccountWithBalance | null;
  onSave: (newBalance: number, newDate: Date, notes: string) => void;
}

const QuickEditSheet: React.FC<QuickEditSheetProps> = ({ isVisible, onClose, account, onSave }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getLocalDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [balance, setBalance] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (account) {
      setBalance(account.latest_balance?.toString() || '');
      setDate(getLocalDateString());
      setNotes(''); // Reset notes on new account
    } else {
      setBalance('');
      setDate(getLocalDateString());
      setNotes('');
    }
  }, [account]);

  const handleSave = () => {
    const newBalance = parseFloat(balance);
    if (!isNaN(newBalance)) {
      onSave(newBalance, new Date(date), notes);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flexEndContainer}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Quick Edit: {account?.account_name}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Balance</Text>
                  <TextInput
                    style={styles.input}
                    value={balance}
                    onChangeText={setBalance}
                    keyboardType="numeric"
                    placeholder="Enter new balance"
                    placeholderTextColor={theme.colors.text.tertiary}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Balance Date</Text>
                  <DatePicker value={date} onChange={setDate} />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Notes (Optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add a quick note..."
                    placeholderTextColor={theme.colors.text.tertiary}
                    multiline
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  flexEndContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xxxl : theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  notesInput: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background.elevated,
    marginRight: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
});

export default QuickEditSheet;