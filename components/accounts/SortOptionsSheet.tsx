import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { Theme } from '@/lib/supabase';
import { useTheme } from '@/src/styles/theme/ThemeContext';

export type SortOption = 
  | 'balance_high_to_low'
  | 'balance_low_to_high'
  | 'name_a_to_z'
  | 'name_z_to_a'
  | 'last_updated';

interface SortOptionsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
  title: string;
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'balance_high_to_low', label: 'Balance (High to Low)' },
  { key: 'balance_low_to_high', label: 'Balance (Low to High)' },
  { key: 'name_a_to_z', label: 'Name (A-Z)' },
  { key: 'name_z_to_a', label: 'Name (Z-A)' },
  { key: 'last_updated', label: 'Last Updated' },
];

const SortOptionsSheet: React.FC<SortOptionsSheetProps> = ({
  isVisible,
  onClose,
  onSort,
  currentSort,
  title,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleSelectSort = (option: SortOption) => {
    onSort(option);
    onClose();
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
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{title}</Text>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={styles.optionButton}
                  onPress={() => handleSelectSort(option.key)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {currentSort === option.key && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
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
      textAlign: 'center',
    },
    optionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    button: {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    cancelButton: {
      backgroundColor: theme.colors.background.elevated,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
  });

export default SortOptionsSheet;