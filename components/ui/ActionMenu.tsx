import React, { JSX, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

export interface Action {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
  anchorPosition?: Position;
}

export default function ActionMenu({
  visible,
  onClose,
  actions = [],
  anchorPosition = { x: 0, y: 0 },
}: ActionMenuProps): JSX.Element | null {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  // Smart positioning to prevent overflow
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const menuWidth = 200;
  const menuHeight = actions.length * 50 + 20; // Approximate height
  const margin = 16;

  let finalX = anchorPosition.x;
  let finalY = anchorPosition.y;

  // Adjust X position if menu would overflow right edge
  if (anchorPosition.x + menuWidth > screenWidth - margin) {
    finalX = screenWidth - menuWidth - margin;
  }

  // Adjust Y position if menu would overflow bottom edge
  if (anchorPosition.y + menuHeight > screenHeight - margin) {
    finalY = anchorPosition.y - menuHeight - margin;
  }

  // Ensure minimum margins
  finalX = Math.max(margin, finalX);
  finalY = Math.max(margin, finalY);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

      <Animated.View
        style={[
          styles.menu,
          {
            top: finalY,
            left: finalX,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {actions.map((action, index) => {
          const isLast = index === actions.length - 1;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                isLast && styles.lastMenuItem,
                action.destructive && styles.destructiveMenuItem,
              ]}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              activeOpacity={0.7}
            >
              {action.icon && (
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={action.destructive ? colors.error : colors.text.primary}
                  style={styles.menuIcon}
                />
              )}
              <Text
                style={[
                  styles.menuText,
                  action.destructive && styles.destructiveText,
                ]}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
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
    minWidth: 200,
    maxWidth: 250,
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
    minHeight: 50,
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
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});
