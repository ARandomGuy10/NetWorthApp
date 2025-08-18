import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date"
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  // Correctly parse the date string as local time, not UTC, by appending T00:00:00
  const [tempDate, setTempDate] = useState<Date>(value ? new Date(`${value}T00:00:00`) : new Date());
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Define the maximum selectable date as the current date.
  // This ensures users cannot select a future date, and it correctly
  // respects the user's local timezone.
  const maxDate = new Date();

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return placeholder;
    // Correctly parse the date string as local time for display
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      if (selectedDate) {
        const dateString = toLocalDateString(selectedDate);
        setTempDate(selectedDate);
        onChange(dateString);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = (): void => {
    const dateString = toLocalDateString(tempDate);
    onChange(dateString);
    setShowPicker(false);
  };

  const handleCancel = (): void => {
    setTempDate(value ? new Date(`${value}T00:00:00`) : new Date());
    setShowPicker(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dateButton,
          disabled && styles.dateButtonDisabled
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dateText,
          !value && styles.placeholderText,
          disabled && styles.disabledText
        ]}>
          {formatDateForDisplay(value)}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={disabled ? theme.colors.text.disabled : theme.colors.text.secondary} 
        />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCancel}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalButton, styles.confirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.picker}
                maximumDate={maxDate}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={maxDate}
          />
        )
      )}
    </>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  dateButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 52,
  },
  dateButtonDisabled: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  placeholderText: {
    color: theme.colors.text.secondary,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingBottom: 34, // Safe area padding
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  modalButton: {
    fontSize: 17,
    color: theme.colors.primary,
  },
  confirmButton: {
    fontWeight: '600',
  },
  picker: {
    backgroundColor: theme.colors.background.card,
  },
});
