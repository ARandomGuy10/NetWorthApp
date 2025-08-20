import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme, CURRENCIES } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface CurrencyPickerProps {
  isVisible: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (value: string) => void;
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  isVisible,
  onClose,
  currentValue,
  onSave,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Currency</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.optionRow, currentValue === item && styles.selectedOption]}
                onPress={() => {
                  onSave(item);
                  onClose();
                }}
              >
                <Text style={[styles.optionText, currentValue === item && styles.selectedText]}>
                  {item}
                </Text>
                {currentValue === item && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: Theme, insets: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { backgroundColor: theme.colors.background.card, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, paddingBottom: insets.bottom + theme.spacing.lg, maxHeight: '60%' },
  header: { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: theme.colors.text.primary },
  closeButton: { padding: theme.spacing.sm },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border.primary },
  selectedOption: { backgroundColor: theme.colors.interactive.hover },
  optionText: { fontSize: 16, color: theme.colors.text.primary },
  selectedText: { fontWeight: 'bold', color: theme.colors.primary },
});

export default CurrencyPicker;