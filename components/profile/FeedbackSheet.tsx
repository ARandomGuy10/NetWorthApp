import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import CustomPicker, { PickerItem } from '@/components/ui/CustomPicker';
import { useSubmitFeedback } from '@/hooks/useFeedback';
import { useHaptics } from '@/hooks/useHaptics';

interface FeedbackSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const feedbackTypes: PickerItem[] = [
  { label: 'Feature Request', value: 'feature_request' },
  { label: 'Bug Report', value: 'bug_report' },
  { label: 'General Feedback', value: 'general_feedback' },
  { label: 'Other', value: 'other' },
];

const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ isVisible, onClose }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);
  const submitFeedbackMutation = useSubmitFeedback();
  const { notificationAsync } = useHaptics();

  const [feedbackType, setFeedbackType] = useState<string>('feature_request');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = 'Subject is required.';
    if (!body.trim()) newErrors.body = 'Feedback message is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (submitFeedbackMutation.isPending) return;
    // Reset form state when closing
    setFeedbackType('feature_request');
    setSubject('');
    setBody('');
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) {
      notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await submitFeedbackMutation.mutateAsync({ type: feedbackType, subject, body });
      // On success, the hook shows a toast, and we close the sheet.
      handleClose();
    } catch (error: any) {
      // The hook's onError callback handles showing the toast.
      // We just need to decide if we should also close the sheet.
      if (error.message && error.message.includes('violates row-level security policy')) {
        // If the user hit the rate limit, close the sheet after a short delay
        // to allow them to see the "limit reached" toast message.
        setTimeout(() => {
          handleClose();
        }, 500);
      }
      // For other errors, the sheet remains open for the user to retry.
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <TouchableOpacity activeOpacity={1} style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Send Feedback</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={submitFeedbackMutation.isPending}>
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Feedback Type</Text>
                <CustomPicker
                  value={feedbackType}
                  onValueChange={setFeedbackType}
                  items={feedbackTypes}
                  disabled={submitFeedbackMutation.isPending}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={[styles.textInput, !!errors.subject && styles.errorBorder]}
                  value={subject}
                  onChangeText={(text) => {
                    setSubject(text);
                    if (errors.subject) {
                      setErrors((prev) => ({ ...prev, subject: '' }));
                    }
                  }}
                  placeholder="e.g., Suggestion for Dashboard"
                  placeholderTextColor={theme.colors.text.secondary}
                  editable={!submitFeedbackMutation.isPending}
                />
                {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.textArea, !!errors.body && styles.errorBorder]}
                  value={body}
                  onChangeText={(text) => {
                    setBody(text);
                    if (errors.body) {
                      setErrors((prev) => ({ ...prev, body: '' }));
                    }
                  }}
                  placeholder="Describe your idea or issue..."
                  placeholderTextColor={theme.colors.text.secondary}
                  multiline
                  editable={!submitFeedbackMutation.isPending}
                />
                {errors.body && <Text style={styles.errorText}>{errors.body}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitFeedbackMutation.isPending && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitFeedbackMutation.isPending}
              >
                {submitFeedbackMutation.isPending ? (
                  <ActivityIndicator color={theme.colors.text.inverse} />
                ) : (
                  <Text style={styles.submitButtonText}>Send Feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getStyles = (theme: Theme, insets: any) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    container: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingBottom: insets.bottom + theme.spacing.lg,
      maxHeight: '85%',
    },
    header: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { fontSize: 18, fontWeight: '600', color: theme.colors.text.primary },
    closeButton: { padding: theme.spacing.sm },
    formContainer: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg },
    inputGroup: { marginBottom: theme.spacing.lg },
    label: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary, marginBottom: theme.spacing.sm },
    textInput: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 52,
    },
    textArea: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    errorBorder: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 13, marginTop: theme.spacing.sm },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      marginTop: theme.spacing.md,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.inverse },
  });

export default FeedbackSheet;