import React, { JSX, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

export interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value?: string; // Fixed: was selectedValue
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function CustomPicker({
  value, // Fixed: changed from selectedValue
  onValueChange,
  items,
  placeholder = "Select an option",
  disabled = false,
  icon
}: CustomPickerProps): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const insets = useSafeAreaInsets();
  
  const selectedItem = items.find(item => item.value === value);

  const showModal = () => {
    if (disabled) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setModalVisible(false));
  };

  const handleSelect = (selectedValue: string): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(selectedValue);
    hideModal();
  };

  const { height: screenHeight } = Dimensions.get('window');
  const maxModalHeight = screenHeight * 0.6;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          disabled && styles.pickerButtonDisabled,
          selectedItem && styles.pickerButtonSelected
        ]}
        onPress={showModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={selectedItem ? colors.text.primary : colors.text.tertiary} 
            style={styles.inputIcon}
          />
        )}
        <Text
          style={[
            styles.pickerText,
            selectedItem ? styles.selectedText : styles.placeholderText,
            disabled && styles.disabledText
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.text.disabled : colors.text.tertiary}
          style={[
            styles.chevron,
            modalVisible && styles.chevronUp
          ]}
        />
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="none"
        onRequestClose={hideModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={hideModal}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                maxHeight: maxModalHeight,
                marginBottom: insets.bottom || 20,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity
                onPress={hideModal}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && styles.selectedOption,
                    index === items.length - 1 && styles.lastOption
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.selectedOptionText
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    backgroundColor: colors.background.elevated,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.primary,
    minHeight: 56,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background.card,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  selectedText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  chevron: {
    marginLeft: spacing.sm,
    transform: [{ rotate: '0deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.background.elevated,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 56,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: colors.interactive.hover,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
