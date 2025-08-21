import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isDestructive?: boolean;
  requireConfirmationText?: string;
  confirmationInputPlaceholder?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  iconName,
  iconColor,
  isDestructive = false,
  requireConfirmationText,
  confirmationInputPlaceholder,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset input when visibility changes to ensure it's fresh on next open
  useEffect(() => {
    if (!isVisible) {
      // Using a timeout to prevent the text from disappearing before the modal has fully animated out.
      const timer = setTimeout(() => {
        setConfirmationInput('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const destructiveColor = '#FF3B30'; // Use a specific, hardcoded red for destructive actions
  const confirmButtonColor = isDestructive ? destructiveColor : theme.colors.primary;
  const finalIconColor = isDestructive ? destructiveColor : (iconColor || confirmButtonColor);
  const isConfirmationTextMatched =
    !requireConfirmationText || confirmationInput.toLowerCase() === requireConfirmationText.toLowerCase();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {iconName && (
            <View style={[styles.iconContainer, { backgroundColor: `${finalIconColor}20` }]}>
              <Ionicons name={iconName} size={32} color={finalIconColor} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {requireConfirmationText && (
            <View style={styles.confirmationInputContainer}>
              <TextInput
                style={[
                  styles.confirmationInput,
                  isConfirmationTextMatched && styles.confirmationInputMatched,
                ]}
                placeholder={confirmationInputPlaceholder}
                placeholderTextColor={theme.colors.text.tertiary}
                value={confirmationInput}
                onChangeText={setConfirmationInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: confirmButtonColor }, !isConfirmationTextMatched && styles.buttonDisabled]}
              onPress={() => {
                onConfirm();
              }}
              disabled={!isConfirmationTextMatched}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
    modalContainer: { width: '100%', maxWidth: 400, backgroundColor: theme.colors.background.card, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, alignItems: 'center', ...theme.shadows.lg },
    iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg },
    title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: theme.spacing.md, textAlign: 'center' },
    message: { fontSize: 15, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: theme.spacing.lg, lineHeight: 22 },
    confirmationInputContainer: {
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    confirmationInput: {
      backgroundColor: theme.colors.background.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    confirmationInputMatched: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}1A`,
    },
    buttonRow: { flexDirection: 'row', width: '100%', gap: theme.spacing.md },
    button: { flex: 1, paddingVertical: theme.spacing.lg, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
    buttonDisabled: { opacity: 0.5 },
    cancelButton: { backgroundColor: theme.colors.background.secondary },
    cancelButtonText: { color: theme.colors.text.primary, fontSize: 16, fontWeight: '600' },
    confirmButtonText: { color: theme.colors.text.inverse, fontSize: 16, fontWeight: 'bold' },
  });

export default ConfirmationModal;