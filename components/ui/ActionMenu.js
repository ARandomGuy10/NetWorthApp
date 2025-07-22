import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

export default function ActionMenu({ 
  visible, 
  onClose, 
  actions = [],
  anchorPosition = { x: 0, y: 0 }
}) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              top: anchorPosition.y,
              right: 20,
            },
          ]}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === actions.length - 1 && styles.lastMenuItem,
                action.destructive && styles.destructiveMenuItem,
              ]}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={action.icon}
                size={18}
                color={action.destructive ? colors.error : colors.text.primary}
                style={styles.menuIcon}
              />
              <Text
                style={[
                  styles.menuText,
                  action.destructive && styles.destructiveText,
                ]}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    minWidth: 160,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  destructiveMenuItem: {
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  destructiveText: {
    color: colors.error,
  },
});