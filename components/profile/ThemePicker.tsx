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
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/lib/supabase';
import { getTheme, THEMES } from '@/src/styles/theme/themes.js';

interface ThemePickerProps {
  isVisible: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (value: string) => void;
}

const formatThemeName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ThemePicker: React.FC<ThemePickerProps> = ({
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
            <Text style={styles.title}>Select Theme</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={THEMES}
            keyExtractor={(item) => item}
            renderItem={({ item: themeName }) => {
              const themePreview = getTheme(themeName);
              const isSelected = currentValue === themeName;
              return (
                <TouchableOpacity
                  style={[styles.optionRow, isSelected && styles.selectedOption]}
                  onPress={() => {
                    onSave(themeName);
                    onClose();
                  }}
                >
                  <View style={styles.themePreviewContainer}>
                    <View style={[styles.colorSwatch, { backgroundColor: themePreview.colors.primary }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themePreview.colors.background.secondary }]} />
                    <View style={[styles.colorSwatch, { backgroundColor: themePreview.colors.text.primary }]} />
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                    {formatThemeName(themeName)}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: Theme, insets: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: insets.bottom + theme.spacing.lg,
    maxHeight: '60%',
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
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border.primary },
  selectedOption: { backgroundColor: theme.colors.interactive.hover },
  optionText: { flex: 1, fontSize: 16, color: theme.colors.text.primary },
  selectedText: { fontWeight: 'bold', color: theme.colors.primary },
  themePreviewContainer: {
    flexDirection: 'row',
    marginRight: theme.spacing.lg,
    height: 24,
    width: 48,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
  },
  colorSwatch: {
    flex: 1,
    height: '100%',
  },
});

export default ThemePicker;