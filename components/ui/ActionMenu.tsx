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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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

  // Enhanced smart positioning for all device sizes
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const menuWidth = 200;
  const menuHeight = actions.length * 56 + 16;
  
  // Account for safe areas and navigation elements
  const safeMargin = 20;
  const bottomSafeArea = insets.bottom + 20; // Extra padding for bottom safe area
  const topSafeArea = insets.top + 20;

  let finalX = anchorPosition.x;
  let finalY = anchorPosition.y;

  // Smart horizontal positioning
  if (anchorPosition.x + menuWidth > screenWidth - safeMargin) {
    finalX = anchorPosition.x - menuWidth - 10;
  } else {
    finalX = anchorPosition.x + 10;
  }

  // Enhanced vertical positioning with safe area consideration
  const availableBottomSpace = screenHeight - anchorPosition.y - bottomSafeArea;
  const availableTopSpace = anchorPosition.y - topSafeArea;

  if (menuHeight > availableBottomSpace && availableTopSpace > availableBottomSpace) {
    // Position above if there's more space above
    finalY = anchorPosition.y - menuHeight - 15;
  } else if (menuHeight > availableBottomSpace) {
    // If menu is too tall for available space, position it optimally
    finalY = screenHeight - menuHeight - bottomSafeArea;
  }

  // Final bounds checking
  finalX = Math.max(safeMargin, Math.min(finalX, screenWidth - menuWidth - safeMargin));
  finalY = Math.max(topSafeArea, Math.min(finalY, screenHeight - menuHeight - bottomSafeArea));

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
        {/* Menu items remain the same */}
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
              activeOpacity={0.6}
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
    borderRadius: 12, // More rounded for modern look
    minWidth: 200,
    maxWidth: 250,
    // Enhanced shadow for better depth
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 0, // Remove border for cleaner look
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16, // More generous padding
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 56, // Standard touch target size
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
