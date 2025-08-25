import React from 'react';

import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import * as Haptics from 'expo-haptics';

import { Theme } from '@/lib/supabase';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/src/styles/theme/ThemeContext';

interface CategoryInputProps {
  value: string;
  onChangeText: (text: string) => void;
  suggestions: string[];
  disabled?: boolean;
  soundEffectsEnabled?: boolean;
  accountType: 'asset' | 'liability';
  error?: string;
  onFocus?: () => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({ value, onChangeText, suggestions, disabled, soundEffectsEnabled, accountType, error, onFocus }) => {
  const { theme } = useTheme();
  const { impactAsync } = useHaptics();
  const styles = getStyles(theme);
  const selectedColor = accountType === 'asset' ? theme.colors.asset : theme.colors.liability;
  const placeholderText = accountType === 'asset'
    ? "e.g., Savings, or type your own"
    : "e.g., Credit Card, or type your own";

  return (
    <View>
      <TextInput
        style={[styles.textInput, disabled && styles.textInputDisabled, !!error && styles.errorBorder]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholderText}
        placeholderTextColor={theme.colors.text.secondary}
        editable={!disabled}
        autoCapitalize="words"
        returnKeyType="next"
        onFocus={onFocus}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionsContainer}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={[
              styles.suggestionChip,
              value === suggestion && { backgroundColor: selectedColor, borderColor: selectedColor },
            ]}
            onPress={() => {
              impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChangeText(suggestion);
            }}
            disabled={disabled}
          >
            <Text
              style={[
                styles.suggestionText,
                value === suggestion && styles.suggestionTextSelected,
              ]}
            >
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  textInput: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    minHeight: 52,
    ...theme.shadows.sm,
  },
  textInputDisabled: { opacity: 0.6 },
  errorBorder: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  suggestionsContainer: { marginTop: theme.spacing.md },
  suggestionChip: {
    backgroundColor: theme.colors.background.elevated,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
  },
  suggestionText: { color: theme.colors.text.secondary, fontSize: 14, fontWeight: '500' },
  suggestionTextSelected: { color: theme.colors.text.inverse, fontWeight: '600' },
});

export default CategoryInput;