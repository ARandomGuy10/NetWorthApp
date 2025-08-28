import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity, FlatList} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';

import {CURRENCIES} from '@/lib/supabase';
import {onboardingTheme} from '@/src/styles/theme/onboardingTheme';

interface OnboardingCurrencyPickerProps {
  isVisible: boolean;
  onClose: () => void;
  currentValue: string;
  onSave: (value: string) => void;
}

const OnboardingCurrencyPicker: React.FC<OnboardingCurrencyPickerProps> = ({
  isVisible,
  onClose,
  currentValue,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const styles = getStyles(onboardingTheme, insets);

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Currency</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={onboardingTheme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[styles.optionRow, currentValue === item && styles.selectedOption]}
                onPress={() => {
                  onSave(item);
                  onClose();
                }}>
                <Text style={[styles.optionText, currentValue === item && styles.selectedText]}>{item}</Text>
                {currentValue === item && (
                  <Ionicons name="checkmark-circle" size={24} color={onboardingTheme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme: typeof onboardingTheme, insets: any) =>
  StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: insets.bottom + 16,
      maxHeight: '60%',
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {fontSize: 18, fontWeight: '600', color: theme.colors.text.primary, fontFamily: 'Inter_600SemiBold'},
    closeButton: {padding: 8},
    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    selectedOption: {backgroundColor: 'rgba(255,255,255,0.1)'},
    optionText: {fontSize: 16, color: theme.colors.text.primary, fontFamily: 'Inter_500Medium'},
    selectedText: {color: theme.colors.primary, fontFamily: 'Inter_700Bold'},
  });

export default OnboardingCurrencyPicker;
